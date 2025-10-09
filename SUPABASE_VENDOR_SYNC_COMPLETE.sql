-- ========================================
-- 🔧 COMPLETE VENDOR SYNC SYSTEM
-- ========================================
-- Purpose: Sync vendor names across all tables
-- Date: 2025-10-09
-- Priority: CRITICAL

-- ========================================
-- PART 1: VENDOR DISPLAY NAME SETUP
-- ========================================

-- Add vendor_display_name to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS vendor_display_name TEXT;

-- Populate existing records
UPDATE profiles
SET vendor_display_name = COALESCE(
  business_name,
  full_name,
  'Vendor ' || id
)
WHERE vendor_display_name IS NULL;

-- Create sync trigger function for profiles
CREATE OR REPLACE FUNCTION sync_vendor_display_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.vendor_display_name := COALESCE(
    NEW.business_name,
    NEW.full_name,
    'Vendor ' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles
DROP TRIGGER IF EXISTS trg_sync_vendor_display_name ON profiles;
CREATE TRIGGER trg_sync_vendor_display_name
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_vendor_display_name();

-- ========================================
-- PART 2: SYNC TO MARKETPLACE_PRODUCTS
-- ========================================

-- Add vendor_name to marketplace_products if not exists
ALTER TABLE marketplace_products
ADD COLUMN IF NOT EXISTS vendor_name TEXT;

-- Add vendor_id for proper foreign key relationship
ALTER TABLE marketplace_products
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Populate vendor_id from user_id
UPDATE marketplace_products
SET vendor_id = user_id
WHERE vendor_id IS NULL;

-- Populate vendor_name from profiles
UPDATE marketplace_products mp
SET vendor_name = p.vendor_display_name
FROM profiles p
WHERE mp.user_id = p.id AND mp.vendor_name IS NULL;

-- Create function to sync vendor name to products
CREATE OR REPLACE FUNCTION sync_product_vendor_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_products
  SET vendor_name = NEW.vendor_display_name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync when profile updates
DROP TRIGGER IF EXISTS trg_sync_product_vendor_name ON profiles;
CREATE TRIGGER trg_sync_product_vendor_name
AFTER UPDATE OF vendor_display_name, business_name, full_name ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_product_vendor_name();

-- ========================================
-- PART 3: SYNC TO PRODUCTS TABLE
-- ========================================

-- Add vendor_name to products table if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_name TEXT;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    
    -- Populate vendor_id
    UPDATE products
    SET vendor_id = user_id
    WHERE vendor_id IS NULL AND user_id IS NOT NULL;
    
    -- Populate vendor_name
    UPDATE products p
    SET vendor_name = pr.vendor_display_name
    FROM profiles pr
    WHERE p.user_id = pr.id AND p.vendor_name IS NULL;
  END IF;
END $$;

-- ========================================
-- PART 4: INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_vendor_display_name 
ON profiles(vendor_display_name);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_name 
ON marketplace_products(vendor_name);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_id 
ON marketplace_products(vendor_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE INDEX IF NOT EXISTS idx_products_vendor_name ON products(vendor_name);
    CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
  END IF;
END $$;

-- ========================================
-- PART 5: HELPER FUNCTIONS
-- ========================================

-- Function to get vendor display name
CREATE OR REPLACE FUNCTION get_vendor_display_name(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  display_name TEXT;
BEGIN
  SELECT vendor_display_name INTO display_name
  FROM profiles
  WHERE id = user_id_param;
  
  RETURN COALESCE(display_name, 'Unknown Vendor');
END;
$$ LANGUAGE plpgsql;

-- Function to sync all vendor names (run once for cleanup)
CREATE OR REPLACE FUNCTION sync_all_vendor_names()
RETURNS void AS $$
BEGIN
  -- Update all marketplace products
  UPDATE marketplace_products mp
  SET vendor_name = p.vendor_display_name,
      vendor_id = p.id
  FROM profiles p
  WHERE mp.user_id = p.id;
  
  -- Update products table if exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    UPDATE products pr
    SET vendor_name = p.vendor_display_name,
        vendor_id = p.id
    FROM profiles p
    WHERE pr.user_id = p.id;
  END IF;
  
  RAISE NOTICE 'Vendor names synced successfully';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 6: VERIFICATION QUERIES
-- ========================================

-- Run this to verify the setup
-- SELECT 
--   p.id,
--   p.full_name,
--   p.business_name,
--   p.vendor_display_name,
--   COUNT(mp.id) as product_count
-- FROM profiles p
-- LEFT JOIN marketplace_products mp ON p.id = mp.user_id
-- GROUP BY p.id, p.full_name, p.business_name, p.vendor_display_name
-- LIMIT 10;

-- ========================================
-- PART 7: RUN INITIAL SYNC
-- ========================================

-- Execute the sync function to update all existing records
SELECT sync_all_vendor_names();

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- All vendor names are now synced across:
-- 1. profiles.vendor_display_name (source of truth)
-- 2. marketplace_products.vendor_name (synced)
-- 3. products.vendor_name (synced if table exists)
-- 
-- Triggers ensure automatic sync on profile updates
-- ========================================
