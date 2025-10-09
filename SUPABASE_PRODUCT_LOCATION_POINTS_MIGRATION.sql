-- =====================================================
-- BANDA PRODUCT LOCATION & POINTS MIGRATION
-- Add reward_points column to marketplace_products
-- =====================================================

-- Add reward_points column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_products' 
    AND column_name = 'reward_points'
  ) THEN
    ALTER TABLE marketplace_products 
    ADD COLUMN reward_points INTEGER DEFAULT 0;
    
    RAISE NOTICE '✅ Added reward_points column to marketplace_products';
  ELSE
    RAISE NOTICE 'ℹ️ reward_points column already exists';
  END IF;
END $$;

-- Update existing products to have reward points (1% of price)
UPDATE marketplace_products
SET reward_points = FLOOR(price * 0.01)
WHERE reward_points = 0 OR reward_points IS NULL;

RAISE NOTICE '✅ Updated existing products with reward points';

-- Create index for reward_points for faster queries
CREATE INDEX IF NOT EXISTS idx_marketplace_products_reward_points 
ON marketplace_products(reward_points);

RAISE NOTICE '✅ Created index on reward_points';

-- =====================================================
-- VERIFY LOCATION COLUMNS EXIST
-- =====================================================

DO $$ 
BEGIN
  -- Check if location columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_products' 
    AND column_name = 'location_lat'
  ) THEN
    RAISE EXCEPTION 'location_lat column missing from marketplace_products. Please run SUPABASE_UNIFIED_SCHEMA.sql first';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_products' 
    AND column_name = 'location_lng'
  ) THEN
    RAISE EXCEPTION 'location_lng column missing from marketplace_products. Please run SUPABASE_UNIFIED_SCHEMA.sql first';
  END IF;
  
  RAISE NOTICE '✅ Location columns verified';
END $$;

-- =====================================================
-- VERIFY PROFILES LOCATION COLUMNS
-- =====================================================

DO $$ 
BEGIN
  -- Check if profiles have location columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_lat'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_lat NUMERIC;
    RAISE NOTICE '✅ Added location_lat to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_lng'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_lng NUMERIC;
    RAISE NOTICE '✅ Added location_lng to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_city TEXT;
    RAISE NOTICE '✅ Added location_city to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_county'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_county TEXT;
    RAISE NOTICE '✅ Added location_county to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_county_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_county_id TEXT;
    RAISE NOTICE '✅ Added location_county_id to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_sub_county'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_sub_county TEXT;
    RAISE NOTICE '✅ Added location_sub_county to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_sub_county_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_sub_county_id TEXT;
    RAISE NOTICE '✅ Added location_sub_county_id to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_ward'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_ward TEXT;
    RAISE NOTICE '✅ Added location_ward to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_ward_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_ward_id TEXT;
    RAISE NOTICE '✅ Added location_ward_id to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_label'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_label TEXT;
    RAISE NOTICE '✅ Added location_label to profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'location_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location_address TEXT;
    RAISE NOTICE '✅ Added location_address to profiles';
  END IF;
  
  RAISE NOTICE '✅ All profile location columns verified/created';
END $$;

-- =====================================================
-- CREATE FUNCTION TO AUTO-CALCULATE REWARD POINTS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_product_reward_points()
RETURNS TRIGGER AS $$
BEGIN
  -- If reward_points is not set or is 0, calculate it as 1% of price
  IF NEW.reward_points IS NULL OR NEW.reward_points = 0 THEN
    NEW.reward_points := FLOOR(NEW.price * 0.01);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate reward points on insert/update
DROP TRIGGER IF EXISTS trg_calculate_reward_points ON marketplace_products;
CREATE TRIGGER trg_calculate_reward_points
  BEFORE INSERT OR UPDATE OF price, reward_points ON marketplace_products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_product_reward_points();

RAISE NOTICE '✅ Created trigger to auto-calculate reward points';

-- =====================================================
-- CREATE VIEW FOR PRODUCTS WITH REWARD INFO
-- =====================================================

CREATE OR REPLACE VIEW marketplace_products_with_rewards AS
SELECT 
  p.*,
  p.reward_points,
  ROUND((p.reward_points::NUMERIC / NULLIF(p.price, 0)) * 100, 2) as points_percentage,
  CASE 
    WHEN p.reward_points >= 100 THEN 'high'
    WHEN p.reward_points >= 50 THEN 'medium'
    ELSE 'low'
  END as reward_tier
FROM marketplace_products p;

RAISE NOTICE '✅ Created view marketplace_products_with_rewards';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PRODUCT LOCATION & POINTS MIGRATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📦 Added reward_points column to marketplace_products';
  RAISE NOTICE '📍 Verified location columns in profiles and products';
  RAISE NOTICE '🎯 Created auto-calculation trigger for reward points';
  RAISE NOTICE '📊 Created marketplace_products_with_rewards view';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test product creation with vendor location default';
  RAISE NOTICE '2. Test product creation with custom location';
  RAISE NOTICE '3. Test reward points calculation';
  RAISE NOTICE '4. Test loyalty points awarding on purchase';
  RAISE NOTICE '========================================';
END $$;
