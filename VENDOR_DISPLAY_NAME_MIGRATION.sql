-- ========================================
-- 🔧 VENDOR DISPLAY NAME MIGRATION
-- ========================================
-- Purpose: Add vendor_display_name column and sync trigger
-- Date: 2025-10-09
-- Priority: CRITICAL

-- Step 1: Add vendor_display_name column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS vendor_display_name TEXT;

-- Step 2: Populate existing records
UPDATE profiles
SET vendor_display_name = COALESCE(
  business_name,
  full_name,
  'Vendor ' || id
)
WHERE vendor_display_name IS NULL;

-- Step 3: Create sync trigger function
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

-- Step 4: Create trigger
DROP TRIGGER IF EXISTS trg_sync_vendor_display_name ON profiles;
CREATE TRIGGER trg_sync_vendor_display_name
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_vendor_display_name();

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_vendor_display_name 
ON profiles(vendor_display_name);

-- Verification query
-- SELECT id, full_name, business_name, vendor_display_name FROM profiles LIMIT 10;
