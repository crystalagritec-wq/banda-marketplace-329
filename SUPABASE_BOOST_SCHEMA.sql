-- =====================================================
-- BANDA BOOST SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create boosts table if not exists
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('product', 'shop')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either product_id or shop_id is set, but not both
  CONSTRAINT boost_target_check CHECK (
    (product_id IS NOT NULL AND shop_id IS NULL) OR
    (shop_id IS NOT NULL AND product_id IS NULL)
  )
);

-- Add is_boosted column to products if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_boosted'
  ) THEN
    ALTER TABLE products ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add is_boosted column to shops if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name = 'is_boosted'
  ) THEN
    ALTER TABLE shops ADD COLUMN is_boosted BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for boosts
CREATE INDEX IF NOT EXISTS idx_boosts_product_id ON boosts(product_id);
CREATE INDEX IF NOT EXISTS idx_boosts_shop_id ON boosts(shop_id);
CREATE INDEX IF NOT EXISTS idx_boosts_status ON boosts(status);
CREATE INDEX IF NOT EXISTS idx_boosts_end_date ON boosts(end_date);
CREATE INDEX IF NOT EXISTS idx_boosts_type ON boosts(type);

-- Create indexes for boosted items
CREATE INDEX IF NOT EXISTS idx_products_is_boosted ON products(is_boosted) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_shops_is_boosted ON shops(is_boosted) WHERE is_boosted = true;

-- Update updated_at trigger for boosts
DROP TRIGGER IF EXISTS update_boosts_updated_at ON boosts;
CREATE TRIGGER update_boosts_updated_at 
  BEFORE UPDATE ON boosts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to expire boosts automatically
CREATE OR REPLACE FUNCTION expire_boosts()
RETURNS void AS $$
BEGIN
  -- Expire product boosts
  UPDATE boosts
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < NOW()
    AND type = 'product'
    AND product_id IS NOT NULL;

  -- Update products to remove boost flag
  UPDATE products
  SET is_boosted = false
  WHERE id IN (
    SELECT product_id
    FROM boosts
    WHERE status = 'expired'
      AND type = 'product'
      AND product_id IS NOT NULL
      AND is_boosted = true
  );

  -- Expire shop boosts
  UPDATE boosts
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < NOW()
    AND type = 'shop'
    AND shop_id IS NOT NULL;

  -- Update shops to remove boost flag
  UPDATE shops
  SET is_boosted = false
  WHERE id IN (
    SELECT shop_id
    FROM boosts
    WHERE status = 'expired'
      AND type = 'shop'
      AND shop_id IS NOT NULL
      AND is_boosted = true
  );

  -- Update all products of expired shop boosts
  UPDATE products p
  SET is_boosted = false
  FROM shops s
  WHERE p.seller_id = s.user_id
    AND s.is_boosted = false
    AND p.is_boosted = true;

  RAISE NOTICE 'Expired boosts processed';
END;
$$ LANGUAGE plpgsql;

-- Function to get boosted products with priority
CREATE OR REPLACE FUNCTION get_boosted_products(
  p_category TEXT DEFAULT NULL,
  p_county TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  seller_id TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL,
  images TEXT[],
  location_county TEXT,
  is_boosted BOOLEAN,
  boost_end_date TIMESTAMPTZ,
  rating DECIMAL,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.seller_id,
    p.name,
    p.description,
    p.category,
    p.price,
    p.images,
    p.location_county,
    p.is_boosted,
    b.end_date as boost_end_date,
    p.rating,
    p.view_count
  FROM products p
  LEFT JOIN boosts b ON p.id = b.product_id AND b.status = 'active' AND b.type = 'product'
  WHERE p.status = 'active'
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_county IS NULL OR p.location_county = p_county)
  ORDER BY 
    p.is_boosted DESC,
    b.end_date DESC NULLS LAST,
    p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get boosted shops
CREATE OR REPLACE FUNCTION get_boosted_shops(
  p_county TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  shop_name TEXT,
  bio TEXT,
  logo_url TEXT,
  location JSONB,
  is_boosted BOOLEAN,
  boost_end_date TIMESTAMPTZ,
  tier TEXT,
  verified BOOLEAN,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.shop_name,
    s.bio,
    s.logo_url,
    s.location,
    s.is_boosted,
    b.end_date as boost_end_date,
    s.tier,
    s.verified,
    COUNT(p.id) as product_count
  FROM shops s
  LEFT JOIN boosts b ON s.id = b.shop_id AND b.status = 'active' AND b.type = 'shop'
  LEFT JOIN products p ON p.seller_id = s.user_id AND p.status = 'active'
  WHERE s.status = 'active'
    AND (p_county IS NULL OR s.location->>'county' = p_county)
  GROUP BY s.id, b.end_date
  ORDER BY 
    s.is_boosted DESC,
    b.end_date DESC NULLS LAST,
    s.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Wallet helper functions for boost payments
CREATE OR REPLACE FUNCTION deduct_wallet_balance(
  p_user_id TEXT,
  p_amount DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE agripay_wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND balance >= p_amount;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_wallet_balance(
  p_user_id TEXT,
  p_amount DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE agripay_wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on boosts table
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

-- Boosts policies
DROP POLICY IF EXISTS "Users can view boosts" ON boosts;
CREATE POLICY "Users can view boosts"
  ON boosts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create boosts for their items" ON boosts;
CREATE POLICY "Users can create boosts for their items"
  ON boosts FOR INSERT
  WITH CHECK (
    (type = 'product' AND product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()::text
    )) OR
    (type = 'shop' AND shop_id IN (
      SELECT id FROM shops WHERE user_id = auth.uid()::text
    ))
  );

DROP POLICY IF EXISTS "Users can update their own boosts" ON boosts;
CREATE POLICY "Users can update their own boosts"
  ON boosts FOR UPDATE
  USING (
    (type = 'product' AND product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()::text
    )) OR
    (type = 'shop' AND shop_id IN (
      SELECT id FROM shops WHERE user_id = auth.uid()::text
    ))
  );

-- Grant permissions
GRANT ALL ON boosts TO authenticated;
GRANT EXECUTE ON FUNCTION expire_boosts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_boosted_products(TEXT, TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_boosted_shops(TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION deduct_wallet_balance(TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION add_wallet_balance(TEXT, DECIMAL) TO authenticated;

-- =====================================================
-- BOOST SYSTEM SETUP COMPLETE
-- =====================================================

-- To manually expire boosts, run:
-- SELECT expire_boosts();

-- To set up automatic expiry (requires pg_cron extension):
-- SELECT cron.schedule('expire-boosts', '0 * * * *', 'SELECT expire_boosts();');
