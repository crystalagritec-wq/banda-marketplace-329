-- ========================================
-- BANDA VENDOR DISPLAY NAME SYNC SYSTEM
-- ========================================
-- Purpose: Maintain consistent vendor names across the platform
-- Date: 2025-10-09
-- Status: Production Ready

-- ========================================
-- 1. ENSURE VENDOR_DISPLAY_NAME COLUMN EXISTS
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'vendor_display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN vendor_display_name TEXT;
    COMMENT ON COLUMN profiles.vendor_display_name IS 'Standardized vendor display name used across platform';
  END IF;
END $$;

-- ========================================
-- 2. SYNC VENDOR DISPLAY NAME ON PROFILE UPDATE
-- ========================================

CREATE OR REPLACE FUNCTION sync_vendor_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate vendor display name with priority:
  -- 1. business_name (if exists)
  -- 2. full_name (if exists)
  -- 3. Fallback to 'Vendor {id}'
  NEW.vendor_display_name := COALESCE(
    NULLIF(TRIM(NEW.business_name), ''),
    NULLIF(TRIM(NEW.full_name), ''),
    'Vendor ' || NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_vendor_display_name ON profiles;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER update_vendor_display_name
  BEFORE INSERT OR UPDATE OF business_name, full_name ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_vendor_display_name();

COMMENT ON FUNCTION sync_vendor_display_name() IS 'Automatically generates vendor_display_name from business_name or full_name';

-- ========================================
-- 3. BACKFILL EXISTING PROFILES
-- ========================================

UPDATE profiles
SET vendor_display_name = COALESCE(
  NULLIF(TRIM(business_name), ''),
  NULLIF(TRIM(full_name), ''),
  'Vendor ' || id
)
WHERE vendor_display_name IS NULL OR vendor_display_name = '';

-- ========================================
-- 4. SYNC VENDOR NAME TO MARKETPLACE PRODUCTS
-- ========================================

CREATE OR REPLACE FUNCTION sync_product_vendor_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all products when vendor display name changes
  UPDATE marketplace_products
  SET 
    vendor_name = NEW.vendor_display_name,
    updated_at = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_product_vendor_names ON profiles;

-- Create trigger for vendor name sync
CREATE TRIGGER update_product_vendor_names
  AFTER UPDATE OF vendor_display_name ON profiles
  FOR EACH ROW
  WHEN (OLD.vendor_display_name IS DISTINCT FROM NEW.vendor_display_name)
  EXECUTE FUNCTION sync_product_vendor_name();

COMMENT ON FUNCTION sync_product_vendor_name() IS 'Syncs vendor_display_name changes to all marketplace products';

-- ========================================
-- 5. BACKFILL MARKETPLACE PRODUCTS
-- ========================================

UPDATE marketplace_products mp
SET vendor_name = p.vendor_display_name
FROM profiles p
WHERE mp.user_id = p.id
  AND (mp.vendor_name IS NULL OR mp.vendor_name = '' OR mp.vendor_name != p.vendor_display_name);

-- ========================================
-- 6. CREATE INDEX FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_vendor_display_name 
  ON profiles(vendor_display_name);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_name 
  ON marketplace_products(vendor_name);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_user_id 
  ON marketplace_products(user_id);

-- ========================================
-- 7. ADD VENDOR_ID TO MARKETPLACE PRODUCTS (IF NOT EXISTS)
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_products' 
    AND column_name = 'vendor_id'
  ) THEN
    -- Add vendor_id as alias for user_id for clarity
    ALTER TABLE marketplace_products ADD COLUMN vendor_id UUID;
    
    -- Backfill vendor_id from user_id
    UPDATE marketplace_products SET vendor_id = user_id WHERE vendor_id IS NULL;
    
    -- Add foreign key constraint
    ALTER TABLE marketplace_products 
      ADD CONSTRAINT fk_marketplace_products_vendor 
      FOREIGN KEY (vendor_id) REFERENCES profiles(id) ON DELETE CASCADE;
    
    -- Create index
    CREATE INDEX idx_marketplace_products_vendor_id ON marketplace_products(vendor_id);
    
    COMMENT ON COLUMN marketplace_products.vendor_id IS 'Vendor/seller ID (alias for user_id for clarity)';
  END IF;
END $$;

-- ========================================
-- 8. SYNC VENDOR_ID WITH USER_ID
-- ========================================

CREATE OR REPLACE FUNCTION sync_vendor_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Keep vendor_id in sync with user_id
  NEW.vendor_id := NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vendor_id ON marketplace_products;

CREATE TRIGGER update_vendor_id
  BEFORE INSERT OR UPDATE OF user_id ON marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION sync_vendor_id();

-- ========================================
-- 9. VERIFICATION STATUS
-- ========================================

COMMENT ON COLUMN profiles.verified IS 'Vendor verification status - used for trust badges';

-- ========================================
-- 10. VALIDATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION validate_vendor_data()
RETURNS TABLE(
  profile_id UUID,
  vendor_display_name TEXT,
  business_name TEXT,
  full_name TEXT,
  product_count BIGINT,
  products_with_vendor_name BIGINT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.vendor_display_name,
    p.business_name,
    p.full_name,
    COUNT(mp.id) as product_count,
    COUNT(CASE WHEN mp.vendor_name = p.vendor_display_name THEN 1 END) as products_with_vendor_name,
    CASE 
      WHEN p.vendor_display_name IS NULL THEN 'MISSING_DISPLAY_NAME'
      WHEN COUNT(mp.id) > 0 AND COUNT(CASE WHEN mp.vendor_name = p.vendor_display_name THEN 1 END) < COUNT(mp.id) THEN 'SYNC_NEEDED'
      ELSE 'OK'
    END as status
  FROM profiles p
  LEFT JOIN marketplace_products mp ON mp.user_id = p.id
  WHERE p.business_type IN ('Vendor', 'Shop') OR EXISTS (
    SELECT 1 FROM marketplace_products WHERE user_id = p.id
  )
  GROUP BY p.id, p.vendor_display_name, p.business_name, p.full_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_vendor_data() IS 'Validates vendor data consistency across profiles and products';

-- ========================================
-- 11. RUN VALIDATION
-- ========================================

-- Check for any inconsistencies
SELECT * FROM validate_vendor_data() WHERE status != 'OK';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Summary of changes:
-- ✅ vendor_display_name column added to profiles
-- ✅ Automatic sync trigger for vendor_display_name
-- ✅ Automatic sync to marketplace_products.vendor_name
-- ✅ vendor_id column added to marketplace_products
-- ✅ Backfilled all existing data
-- ✅ Indexes created for performance
-- ✅ Validation function added

-- To verify:
-- SELECT * FROM validate_vendor_data();
