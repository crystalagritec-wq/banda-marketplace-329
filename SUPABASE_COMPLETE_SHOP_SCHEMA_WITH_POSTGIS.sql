-- ========================================
-- 🚀 COMPLETE SHOP SCHEMA WITH POSTGIS
-- ========================================
-- Purpose: Complete shop system setup with PostGIS support
-- Date: 2025-10-09
-- Run Order: Execute this entire file in Supabase SQL Editor
-- ========================================

-- ========================================
-- STEP 1: ENABLE POSTGIS EXTENSION
-- ========================================
-- This enables geography/geometry types for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'PostGIS extension failed to install. Check database permissions.';
  END IF;
  RAISE NOTICE 'PostGIS extension enabled successfully';
END $$;

-- ========================================
-- STEP 2: CREATE SHOPS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shop_name TEXT NOT NULL,
  vendor_display_name TEXT,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  category TEXT,
  
  -- Location fields
  location_address TEXT,
  location_county TEXT,
  location_subcounty TEXT,
  location_ward TEXT,
  location_coordinates GEOGRAPHY(POINT, 4326),
  
  -- Contact
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  
  -- Business info
  business_registration_number TEXT,
  tax_pin TEXT,
  
  -- Status & tier
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'gold', 'premium')),
  is_verified BOOLEAN DEFAULT false,
  is_boosted BOOLEAN DEFAULT false,
  
  -- Subscription
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  
  -- Stats
  total_products INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- STEP 3: CREATE SHOP PRODUCTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Product info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Pricing
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC,
  discount_percentage NUMERIC DEFAULT 0,
  
  -- Inventory
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  sku TEXT,
  unit TEXT DEFAULT 'piece',
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Location (inherits from shop but can be overridden)
  location_address TEXT,
  location_county TEXT,
  location_subcounty TEXT,
  location_ward TEXT,
  location_coordinates GEOGRAPHY(POINT, 4326),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'draft')),
  is_featured BOOLEAN DEFAULT false,
  is_boosted BOOLEAN DEFAULT false,
  
  -- Vendor info (synced from shop)
  vendor_name TEXT,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stats
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Points & rewards
  points_awarded INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- STEP 4: CREATE SHOP ORDERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Parties
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
  
  -- Order details
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  
  -- Delivery
  delivery_address TEXT,
  delivery_county TEXT,
  delivery_subcounty TEXT,
  delivery_ward TEXT,
  delivery_coordinates GEOGRAPHY(POINT, 4326),
  delivery_instructions TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'ready_for_pickup',
    'in_transit', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partial'
  )),
  
  -- Payment
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Timestamps
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- STEP 5: CREATE SHOP ANALYTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS shop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  
  -- Daily metrics
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  product_views INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  
  -- Engagement
  cart_additions INTEGER DEFAULT 0,
  wishlist_additions INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shop_id, date)
);

-- ========================================
-- STEP 6: CREATE SHOP PROMOTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS shop_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  
  -- Promotion details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('discount', 'bogo', 'free_shipping', 'bundle')),
  
  -- Discount
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC,
  
  -- Conditions
  min_purchase_amount NUMERIC,
  max_discount_amount NUMERIC,
  applicable_products UUID[],
  applicable_categories TEXT[],
  
  -- Validity
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Usage
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- STEP 7: CREATE SHOP CUSTOMERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS shop_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Stats
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date TIMESTAMP,
  
  -- Engagement
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(shop_id, customer_id)
);

-- ========================================
-- STEP 8: VENDOR DISPLAY NAME SYNC
-- ========================================

-- Add vendor_display_name to shops
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS vendor_display_name TEXT;

-- Create function to sync vendor display name
CREATE OR REPLACE FUNCTION sync_shop_vendor_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.vendor_display_name := COALESCE(NEW.shop_name, 'Unnamed Shop');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_sync_shop_vendor_name ON shops;
CREATE TRIGGER trg_sync_shop_vendor_name
BEFORE INSERT OR UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION sync_shop_vendor_name();

-- Sync vendor name to products when shop updates
CREATE OR REPLACE FUNCTION sync_shop_products_vendor_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shop_products
  SET vendor_name = NEW.vendor_display_name
  WHERE shop_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_shop_products_vendor_name ON shops;
CREATE TRIGGER trg_sync_shop_products_vendor_name
AFTER UPDATE OF vendor_display_name, shop_name ON shops
FOR EACH ROW
EXECUTE FUNCTION sync_shop_products_vendor_name();

-- ========================================
-- STEP 9: AUTO-SYNC PRODUCT LOCATION FROM SHOP
-- ========================================

CREATE OR REPLACE FUNCTION sync_product_location_from_shop()
RETURNS TRIGGER AS $$
DECLARE
  shop_record RECORD;
BEGIN
  -- Get shop location details
  SELECT 
    location_address,
    location_county,
    location_subcounty,
    location_ward,
    location_coordinates,
    vendor_display_name,
    user_id
  INTO shop_record
  FROM shops
  WHERE id = NEW.shop_id;
  
  -- If product location is not set, inherit from shop
  IF NEW.location_address IS NULL THEN
    NEW.location_address := shop_record.location_address;
  END IF;
  
  IF NEW.location_county IS NULL THEN
    NEW.location_county := shop_record.location_county;
  END IF;
  
  IF NEW.location_subcounty IS NULL THEN
    NEW.location_subcounty := shop_record.location_subcounty;
  END IF;
  
  IF NEW.location_ward IS NULL THEN
    NEW.location_ward := shop_record.location_ward;
  END IF;
  
  IF NEW.location_coordinates IS NULL THEN
    NEW.location_coordinates := shop_record.location_coordinates;
  END IF;
  
  -- Sync vendor info
  NEW.vendor_name := shop_record.vendor_display_name;
  NEW.vendor_id := shop_record.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_product_location_from_shop ON shop_products;
CREATE TRIGGER trg_sync_product_location_from_shop
BEFORE INSERT OR UPDATE ON shop_products
FOR EACH ROW
EXECUTE FUNCTION sync_product_location_from_shop();

-- ========================================
-- STEP 10: UPDATE SHOP STATS ON ORDER
-- ========================================

CREATE OR REPLACE FUNCTION update_shop_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE shops
    SET 
      total_sales = total_sales + 1,
      total_revenue = total_revenue + NEW.total_amount,
      updated_at = NOW()
    WHERE id = NEW.shop_id;
    
    UPDATE shop_products
    SET 
      sales = sales + NEW.quantity,
      updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_shop_stats_on_order ON shop_orders;
CREATE TRIGGER trg_update_shop_stats_on_order
AFTER INSERT OR UPDATE ON shop_orders
FOR EACH ROW
EXECUTE FUNCTION update_shop_stats_on_order();

-- ========================================
-- STEP 11: INDEXES FOR PERFORMANCE
-- ========================================

-- Shops indexes
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_tier ON shops(tier);
CREATE INDEX IF NOT EXISTS idx_shops_is_boosted ON shops(is_boosted);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_location_county ON shops(location_county);
CREATE INDEX IF NOT EXISTS idx_shops_location_coordinates ON shops USING GIST(location_coordinates);

-- Shop products indexes
CREATE INDEX IF NOT EXISTS idx_shop_products_shop_id ON shop_products(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_user_id ON shop_products(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_vendor_id ON shop_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status);
CREATE INDEX IF NOT EXISTS idx_shop_products_is_boosted ON shop_products(is_boosted);
CREATE INDEX IF NOT EXISTS idx_shop_products_location_county ON shop_products(location_county);
CREATE INDEX IF NOT EXISTS idx_shop_products_location_coordinates ON shop_products USING GIST(location_coordinates);

-- Shop orders indexes
CREATE INDEX IF NOT EXISTS idx_shop_orders_shop_id ON shop_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_seller_id ON shop_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_buyer_id ON shop_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_product_id ON shop_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status ON shop_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at);

-- Shop analytics indexes
CREATE INDEX IF NOT EXISTS idx_shop_analytics_shop_id ON shop_analytics(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_analytics_date ON shop_analytics(date);

-- Shop promotions indexes
CREATE INDEX IF NOT EXISTS idx_shop_promotions_shop_id ON shop_promotions(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_promotions_is_active ON shop_promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_promotions_dates ON shop_promotions(start_date, end_date);

-- Shop customers indexes
CREATE INDEX IF NOT EXISTS idx_shop_customers_shop_id ON shop_customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_customers_customer_id ON shop_customers(customer_id);

-- ========================================
-- STEP 12: ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_customers ENABLE ROW LEVEL SECURITY;

-- Shops policies
CREATE POLICY "Public can view active shops"
  ON shops FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their own shops"
  ON shops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shops"
  ON shops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shops"
  ON shops FOR UPDATE
  USING (auth.uid() = user_id);

-- Shop products policies
CREATE POLICY "Public can view active products"
  ON shop_products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their own products"
  ON shop_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create products for their shops"
  ON shop_products FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM shops WHERE id = shop_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own products"
  ON shop_products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON shop_products FOR DELETE
  USING (auth.uid() = user_id);

-- Shop orders policies
CREATE POLICY "Users can view orders they're involved in"
  ON shop_orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
  ON shop_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their orders"
  ON shop_orders FOR UPDATE
  USING (auth.uid() = seller_id);

-- Shop analytics policies
CREATE POLICY "Shop owners can view their analytics"
  ON shop_analytics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM shops WHERE id = shop_id AND user_id = auth.uid())
  );

-- Shop promotions policies
CREATE POLICY "Public can view active promotions"
  ON shop_promotions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Shop owners can manage their promotions"
  ON shop_promotions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM shops WHERE id = shop_id AND user_id = auth.uid())
  );

-- Shop customers policies
CREATE POLICY "Shop owners can view their customers"
  ON shop_customers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM shops WHERE id = shop_id AND user_id = auth.uid())
  );

-- ========================================
-- STEP 13: HELPER FUNCTIONS
-- ========================================

-- Function to get shop by user ID
CREATE OR REPLACE FUNCTION get_user_shop(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  shop_name TEXT,
  vendor_display_name TEXT,
  status TEXT,
  tier TEXT,
  total_products INTEGER,
  total_sales INTEGER,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.shop_name,
    s.vendor_display_name,
    s.status,
    s.tier,
    s.total_products,
    s.total_sales,
    s.total_revenue
  FROM shops s
  WHERE s.user_id = user_id_param
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get shop products with stats
CREATE OR REPLACE FUNCTION get_shop_products_with_stats(shop_id_param UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price NUMERIC,
  stock INTEGER,
  status TEXT,
  views INTEGER,
  sales INTEGER,
  rating NUMERIC,
  is_boosted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.title,
    sp.price,
    sp.stock,
    sp.status,
    sp.views,
    sp.sales,
    sp.rating,
    sp.is_boosted
  FROM shop_products sp
  WHERE sp.shop_id = shop_id_param
  ORDER BY sp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 14: INITIAL DATA SYNC
-- ========================================

-- Populate vendor_display_name for existing shops
UPDATE shops
SET vendor_display_name = COALESCE(shop_name, 'Unnamed Shop')
WHERE vendor_display_name IS NULL;

-- Sync vendor names to products
UPDATE shop_products sp
SET 
  vendor_name = s.vendor_display_name,
  vendor_id = s.user_id
FROM shops s
WHERE sp.shop_id = s.id AND sp.vendor_name IS NULL;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Shop schema migration completed successfully!';
  RAISE NOTICE '📊 Tables created: shops, shop_products, shop_orders, shop_analytics, shop_promotions, shop_customers';
  RAISE NOTICE '🔧 Triggers configured for auto-sync';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '📍 PostGIS enabled for location features';
END $$;
