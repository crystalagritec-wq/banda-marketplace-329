-- Migration: Add vendor_display_name to profiles and marketplace_products
-- This creates a unified vendor naming system

-- Add vendor_display_name to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS vendor_display_name TEXT;

-- Create function to auto-generate vendor_display_name
CREATE OR REPLACE FUNCTION generate_vendor_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Set vendor_display_name as business_name if available, otherwise full_name
  NEW.vendor_display_name := COALESCE(NEW.business_name, NEW.full_name, 'Unknown Vendor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update vendor_display_name on insert/update
DROP TRIGGER IF EXISTS set_vendor_display_name ON profiles;
CREATE TRIGGER set_vendor_display_name
  BEFORE INSERT OR UPDATE OF business_name, full_name ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_vendor_display_name();

-- Backfill existing profiles with vendor_display_name
UPDATE profiles
SET vendor_display_name = COALESCE(business_name, full_name, 'Unknown Vendor')
WHERE vendor_display_name IS NULL;

-- Update marketplace_products to use vendor_display_name
-- This ensures consistency across the platform
CREATE OR REPLACE FUNCTION sync_vendor_name_to_products()
RETURNS TRIGGER AS $$
BEGIN
  -- When profile vendor_display_name changes, update all products
  UPDATE marketplace_products
  SET vendor_name = NEW.vendor_display_name
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync vendor name to products
DROP TRIGGER IF EXISTS sync_vendor_name_trigger ON profiles;
CREATE TRIGGER sync_vendor_name_trigger
  AFTER UPDATE OF vendor_display_name ON profiles
  FOR EACH ROW
  WHEN (OLD.vendor_display_name IS DISTINCT FROM NEW.vendor_display_name)
  EXECUTE FUNCTION sync_vendor_name_to_products();

-- Add location fields to profiles if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_county TEXT,
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_county_id TEXT,
ADD COLUMN IF NOT EXISTS location_sub_county TEXT,
ADD COLUMN IF NOT EXISTS location_sub_county_id TEXT,
ADD COLUMN IF NOT EXISTS location_ward TEXT,
ADD COLUMN IF NOT EXISTS location_ward_id TEXT;

-- Create index for faster vendor lookups
CREATE INDEX IF NOT EXISTS idx_profiles_vendor_display_name ON profiles(vendor_display_name);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_name ON marketplace_products(vendor_name);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_lat, location_lng);

COMMENT ON COLUMN profiles.vendor_display_name IS 'Unified vendor display name used across the platform (business_name or full_name)';
COMMENT ON COLUMN profiles.location_city IS 'City/town where vendor is located';
COMMENT ON COLUMN profiles.location_county IS 'County where vendor is located';
COMMENT ON COLUMN profiles.location_lat IS 'Latitude coordinate of vendor location';
COMMENT ON COLUMN profiles.location_lng IS 'Longitude coordinate of vendor location';
