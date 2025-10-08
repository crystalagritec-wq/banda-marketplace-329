-- =====================================================
-- BANDA ADDRESS MANAGEMENT SYSTEM
-- =====================================================
-- This schema creates the user_addresses table for managing
-- delivery addresses with full location hierarchy support
-- =====================================================

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Kenya',
  
  -- Kenya location hierarchy
  county TEXT,
  county_id TEXT,
  sub_county TEXT,
  sub_county_id TEXT,
  ward TEXT,
  ward_id TEXT,
  
  -- GPS coordinates for accurate delivery
  coordinates JSONB NOT NULL,
  
  -- Default address flag
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (
    coordinates ? 'lat' AND 
    coordinates ? 'lng' AND
    (coordinates->>'lat')::NUMERIC BETWEEN -90 AND 90 AND
    (coordinates->>'lng')::NUMERIC BETWEEN -180 AND 180
  ),
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]{10,15}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_user_addresses_county ON user_addresses(county_id) WHERE county_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_addresses_coordinates ON user_addresses USING GIN (coordinates);
CREATE INDEX IF NOT EXISTS idx_user_addresses_created_at ON user_addresses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON user_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON user_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON user_addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON user_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER trigger_update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_addresses_updated_at();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default address
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON user_addresses;
CREATE TRIGGER trigger_ensure_single_default_address
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

-- Function to set first address as default
CREATE OR REPLACE FUNCTION set_first_address_as_default()
RETURNS TRIGGER AS $$
DECLARE
  address_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO address_count
  FROM user_addresses
  WHERE user_id = NEW.user_id;
  
  IF address_count = 0 THEN
    NEW.is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set first address as default
DROP TRIGGER IF EXISTS trigger_set_first_address_as_default ON user_addresses;
CREATE TRIGGER trigger_set_first_address_as_default
  BEFORE INSERT ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION set_first_address_as_default();

-- Grant permissions
GRANT ALL ON user_addresses TO authenticated;
GRANT ALL ON user_addresses TO service_role;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample addresses for testing
/*
INSERT INTO user_addresses (
  user_id,
  name,
  address,
  city,
  phone,
  country,
  county,
  county_id,
  sub_county,
  sub_county_id,
  ward,
  ward_id,
  coordinates,
  is_default
) VALUES (
  'YOUR_USER_ID_HERE',
  'Home',
  '123 Kimathi Street, Near Hilton Hotel',
  'Nairobi CBD',
  '+254712345678',
  'Kenya',
  'Nairobi',
  'nairobi',
  'Westlands',
  'westlands',
  'Parklands',
  'parklands',
  '{"lat": -1.2921, "lng": 36.8219}'::jsonb,
  true
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check if table was created successfully
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_addresses';

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_addresses';

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_addresses';
