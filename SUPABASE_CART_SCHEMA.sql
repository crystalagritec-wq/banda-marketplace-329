-- =====================================================
-- BANDA CART SYSTEM DATABASE SCHEMA
-- =====================================================
-- Created: 2025-09-30
-- Purpose: Complete cart system with multi-seller support
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
  product_image TEXT,
  product_unit TEXT DEFAULT 'kg',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_variety TEXT,
  
  -- Seller information
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_location TEXT NOT NULL,
  
  -- Metadata
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'recommendation', 'bundle', 'wishlist')),
  
  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days'),
  
  -- Constraints
  UNIQUE(user_id, product_id, selected_variety)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_seller_id ON cart_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_expires_at ON cart_items(expires_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_seller ON cart_items(user_id, seller_id);

-- =====================================================
-- SAVED FOR LATER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_for_later (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_location TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_for_later_user_id ON saved_for_later(user_id);

-- =====================================================
-- PROMO CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  
  -- Usage limits
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Restrictions
  applicable_sellers TEXT[], -- NULL means all sellers
  applicable_categories TEXT[], -- NULL means all categories
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, valid_from, valid_until);

-- =====================================================
-- PROMO CODE USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(promo_code_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_promo_code_id ON promo_code_usage(promo_code_id);

-- =====================================================
-- CART ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'cart_viewed', 'item_added', 'item_removed', 'quantity_updated',
    'checkout_started', 'checkout_completed', 'cart_abandoned',
    'promo_applied', 'promo_failed'
  )),
  
  -- Event data
  product_id TEXT,
  product_name TEXT,
  quantity INTEGER,
  price DECIMAL(10, 2),
  cart_value DECIMAL(10, 2),
  item_count INTEGER,
  seller_count INTEGER,
  
  -- Context
  source TEXT, -- 'web', 'mobile', 'app'
  session_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_analytics_user_id ON cart_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_event_type ON cart_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_created_at ON cart_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_analytics_session_id ON cart_analytics(session_id);

-- =====================================================
-- CART HISTORY TABLE (for recovery)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_snapshot JSONB NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('auto', 'checkout', 'clear', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_history_user_id ON cart_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_history_created_at ON cart_history(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update cart item timestamp
CREATE OR REPLACE FUNCTION update_cart_item_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update timestamp on cart item update
DROP TRIGGER IF EXISTS trigger_update_cart_item_timestamp ON cart_items;
CREATE TRIGGER trigger_update_cart_item_timestamp
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_item_timestamp();

-- Function: Clean up expired cart items
CREATE OR REPLACE FUNCTION cleanup_expired_cart_items()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Save expired carts to history before deletion
  INSERT INTO cart_history (user_id, cart_snapshot, snapshot_type)
  SELECT 
    user_id,
    jsonb_agg(
      jsonb_build_object(
        'product_id', product_id,
        'product_name', product_name,
        'quantity', quantity,
        'price', product_price,
        'seller_id', seller_id,
        'added_at', added_at,
        'expired_at', expires_at
      )
    ),
    'abandoned'
  FROM cart_items
  WHERE expires_at < NOW()
  GROUP BY user_id;
  
  -- Delete expired items
  DELETE FROM cart_items
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get cart summary for user
CREATE OR REPLACE FUNCTION get_cart_summary(p_user_id UUID)
RETURNS TABLE (
  item_count BIGINT,
  seller_count BIGINT,
  subtotal DECIMAL,
  is_split_order BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as item_count,
    COUNT(DISTINCT seller_id)::BIGINT as seller_count,
    SUM(product_price * quantity)::DECIMAL as subtotal,
    (COUNT(DISTINCT seller_id) > 1)::BOOLEAN as is_split_order
  FROM cart_items
  WHERE user_id = p_user_id AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID,
  p_cart_value DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_usage_count INTEGER;
  v_discount DECIMAL;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_code AND is_active = true;
  
  -- Check if promo exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Invalid promo code';
    RETURN;
  END IF;
  
  -- Check validity period
  IF v_promo.valid_from > NOW() THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Promo code not yet valid';
    RETURN;
  END IF;
  
  IF v_promo.valid_until IS NOT NULL AND v_promo.valid_until < NOW() THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Promo code expired';
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Promo code usage limit reached';
    RETURN;
  END IF;
  
  -- Check per-user limit
  SELECT COUNT(*) INTO v_usage_count
  FROM promo_code_usage
  WHERE promo_code_id = v_promo.id AND user_id = p_user_id;
  
  IF v_promo.per_user_limit IS NOT NULL AND v_usage_count >= v_promo.per_user_limit THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'You have already used this promo code';
    RETURN;
  END IF;
  
  -- Check minimum order value
  IF p_cart_value < v_promo.min_order_value THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 
      format('Minimum order value of KSh %s required', v_promo.min_order_value);
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount := (p_cart_value * v_promo.discount_value / 100);
  ELSE
    v_discount := v_promo.discount_value;
  END IF;
  
  -- Apply max discount cap
  IF v_promo.max_discount IS NOT NULL AND v_discount > v_promo.max_discount THEN
    v_discount := v_promo.max_discount;
  END IF;
  
  RETURN QUERY SELECT true, v_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function: Extend cart expiry on user activity
CREATE OR REPLACE FUNCTION extend_cart_expiry(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE cart_items
  SET expires_at = NOW() + INTERVAL '3 days',
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND expires_at < (NOW() + INTERVAL '2 days'); -- Only extend if expiring soon
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_for_later ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_history ENABLE ROW LEVEL SECURITY;

-- Cart items policies
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Saved for later policies
CREATE POLICY "Users can manage their saved items"
  ON saved_for_later FOR ALL
  USING (auth.uid() = user_id);

-- Promo code usage policies
CREATE POLICY "Users can view their promo usage"
  ON promo_code_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Cart analytics policies
CREATE POLICY "Users can view their analytics"
  ON cart_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics"
  ON cart_analytics FOR INSERT
  WITH CHECK (true);

-- Cart history policies
CREATE POLICY "Users can view their cart history"
  ON cart_history FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, per_user_limit, valid_until)
VALUES 
  ('BANDA100', 'KSh 100 off your order', 'fixed', 100, 500, NULL, NULL, 1, NOW() + INTERVAL '1 year'),
  ('WELCOME10', '10% off for new users', 'percentage', 10, 1000, 500, NULL, 1, NOW() + INTERVAL '1 year'),
  ('HARVEST20', '20% off on fresh produce', 'percentage', 20, 2000, 1000, 1000, 2, NOW() + INTERVAL '3 months')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SCHEDULED CLEANUP (Run via pg_cron or external cron)
-- =====================================================
-- Run this daily to clean up expired carts:
-- SELECT cleanup_expired_cart_items();

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get user's cart with seller grouping
-- SELECT 
--   seller_id,
--   seller_name,
--   seller_location,
--   COUNT(*) as item_count,
--   SUM(product_price * quantity) as subtotal,
--   jsonb_agg(
--     jsonb_build_object(
--       'product_id', product_id,
--       'product_name', product_name,
--       'quantity', quantity,
--       'price', product_price,
--       'unit', product_unit
--     )
--   ) as items
-- FROM cart_items
-- WHERE user_id = 'USER_ID_HERE' AND expires_at > NOW()
-- GROUP BY seller_id, seller_name, seller_location;

-- Get cart abandonment rate
-- SELECT 
--   COUNT(DISTINCT CASE WHEN event_type = 'cart_viewed' THEN session_id END) as cart_views,
--   COUNT(DISTINCT CASE WHEN event_type = 'checkout_completed' THEN session_id END) as checkouts,
--   ROUND(
--     100.0 * COUNT(DISTINCT CASE WHEN event_type = 'checkout_completed' THEN session_id END) / 
--     NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'cart_viewed' THEN session_id END), 0),
--     2
--   ) as conversion_rate
-- FROM cart_analytics
-- WHERE created_at > NOW() - INTERVAL '30 days';
