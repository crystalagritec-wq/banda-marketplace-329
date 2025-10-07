-- =====================================================
-- BANDA COMPLETE UNIFIED DATABASE SCHEMA
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('basic', 'seller', 'service_provider', 'logistics_provider', 'farmer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'service_provider', 'logistics_provider', 'farmer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_tier AS ENUM ('none', 'verified', 'gold', 'premium', 'elite');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'ai_verified', 'human_verified', 'qr_verified', 'admin_approved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_method AS ENUM ('ai_id', 'human_qr', 'admin_approval');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('none', 'active', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- USERS TABLE (MUST BE FIRST)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  country_code TEXT,
  provider_id TEXT,
  provider_type TEXT CHECK (provider_type IN ('google', 'facebook', 'apple', 'phone')),
  is_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  device_id TEXT,
  reputation_score INTEGER DEFAULT 0,
  membership_tier TEXT DEFAULT 'bronze' CHECK (membership_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  terms_accepted BOOLEAN DEFAULT false,
  user_type user_type DEFAULT 'basic',
  user_role user_role DEFAULT 'buyer',
  tier user_tier DEFAULT 'none',
  verification_status verification_status DEFAULT 'unverified',
  subscription_status subscription_status DEFAULT 'none',
  item_limit INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'KES',
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  sku TEXT UNIQUE,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Location
  location_county TEXT NOT NULL,
  location_subcounty TEXT,
  location_ward TEXT,
  location_coordinates GEOGRAPHY(POINT, 4326),
  
  -- Delivery
  delivery_available BOOLEAN DEFAULT true,
  pickup_available BOOLEAN DEFAULT true,
  delivery_fee DECIMAL(10, 2),
  estimated_delivery_days INTEGER,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  brand TEXT,
  condition TEXT DEFAULT 'new',
  weight_kg DECIMAL(10, 2),
  dimensions_cm TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'draft')),
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Search
  search_vector tsvector
);

-- =====================================================
-- SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Pricing
  price_from DECIMAL(10, 2) NOT NULL,
  price_to DECIMAL(10, 2),
  pricing_type TEXT DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'hourly', 'daily', 'negotiable', 'per_acre', 'per_visit', 'per_project')),
  currency TEXT DEFAULT 'KES',
  
  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  portfolio_urls TEXT[] DEFAULT '{}',
  
  -- Location
  location_county TEXT NOT NULL,
  location_subcounty TEXT,
  location_ward TEXT,
  location_coordinates GEOGRAPHY(POINT, 4326),
  service_radius_km INTEGER,
  
  -- Availability
  available_days TEXT[] DEFAULT '{}',
  available_hours TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Search
  search_vector tsvector
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system' CHECK (type IN ('order', 'payment', 'message', 'system', 'promotion')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DISPUTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  complainant_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  respondent_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role_type user_role NOT NULL,
  tier user_tier DEFAULT 'none',
  verification_status verification_status DEFAULT 'unverified',
  verification_method verification_method,
  verification_date TIMESTAMPTZ,
  item_limit INTEGER DEFAULT 0,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- VERIFICATION REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role_type user_role NOT NULL,
  verification_method verification_method NOT NULL,
  document_urls TEXT[] DEFAULT '{}',
  status request_status DEFAULT 'pending',
  reviewer_id TEXT REFERENCES users(user_id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  tier user_tier NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEARCH HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT DEFAULT 'text' CHECK (search_type IN ('text', 'voice', 'image')),
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type TEXT CHECK (clicked_result_type IN ('product', 'service')),
  location_county TEXT,
  location_coordinates GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRENDING SEARCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trending_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT UNIQUE NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  session_id TEXT,
  source TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id, order_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_location_county ON products(location_county);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST(location_coordinates);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_location_county ON services(location_county);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price_from);
CREATE INDEX IF NOT EXISTS idx_services_rating ON services(rating);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_search ON services USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_services_location ON services USING GIST(location_coordinates);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Disputes indexes
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_complainant_id ON disputes(complainant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_respondent_id ON disputes(respondent_id);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;

-- Verification requests indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, end_date);

-- Search history indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- Trending searches indexes
CREATE INDEX IF NOT EXISTS idx_trending_searches_count ON trending_searches(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_searches_last_searched ON trending_searches(last_searched_at DESC);

-- Product views indexes
CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at DESC);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_search_vector ON products;
CREATE TRIGGER trigger_update_product_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Update service search vector
CREATE OR REPLACE FUNCTION update_service_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_search_vector ON services;
CREATE TRIGGER trigger_update_service_search_vector
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_service_search_vector();

-- Update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND status = 'published'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND status = 'published'
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_rating ON product_reviews;
CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Track trending searches
CREATE OR REPLACE FUNCTION track_trending_search(search_query TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO trending_searches (query, search_count, last_searched_at)
  VALUES (search_query, 1, NOW())
  ON CONFLICT (query) 
  DO UPDATE SET 
    search_count = trending_searches.search_count + 1,
    last_searched_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Get products with distance
CREATE OR REPLACE FUNCTION get_products_with_distance(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  search_query TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  filter_county TEXT DEFAULT NULL,
  filter_subcounty TEXT DEFAULT NULL,
  filter_ward TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  min_rating DECIMAL DEFAULT NULL,
  max_distance_km INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  seller_id TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  price DECIMAL,
  original_price DECIMAL,
  images TEXT[],
  location_county TEXT,
  location_subcounty TEXT,
  location_ward TEXT,
  delivery_available BOOLEAN,
  pickup_available BOOLEAN,
  delivery_fee DECIMAL,
  stock_quantity INTEGER,
  view_count INTEGER,
  rating DECIMAL,
  review_count INTEGER,
  distance_km DOUBLE PRECISION,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.seller_id,
    p.name,
    p.description,
    p.category,
    p.subcategory,
    p.price,
    p.original_price,
    p.images,
    p.location_county,
    p.location_subcounty,
    p.location_ward,
    p.delivery_available,
    p.pickup_available,
    p.delivery_fee,
    p.stock_quantity,
    p.view_count,
    p.rating,
    p.review_count,
    CASE 
      WHEN p.location_coordinates IS NOT NULL THEN
        ST_Distance(
          p.location_coordinates::geography,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000.0
      ELSE NULL
    END AS distance_km,
    p.created_at
  FROM products p
  WHERE p.status = 'active'
    AND (search_query IS NULL OR p.search_vector @@ plainto_tsquery('english', search_query))
    AND (filter_category IS NULL OR p.category = filter_category)
    AND (filter_county IS NULL OR p.location_county = filter_county)
    AND (filter_subcounty IS NULL OR p.location_subcounty = filter_subcounty)
    AND (filter_ward IS NULL OR p.location_ward = filter_ward)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_rating IS NULL OR p.rating >= min_rating)
    AND (max_distance_km IS NULL OR 
      (p.location_coordinates IS NOT NULL AND
       ST_Distance(
         p.location_coordinates::geography,
         ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
       ) / 1000.0 <= max_distance_km))
  ORDER BY
    CASE WHEN sort_by = 'price_asc' THEN p.price END ASC,
    CASE WHEN sort_by = 'price_desc' THEN p.price END DESC,
    CASE WHEN sort_by = 'rating' THEN p.rating END DESC,
    CASE WHEN sort_by = 'newest' THEN p.created_at END DESC,
    CASE WHEN sort_by = 'popular' THEN p.view_count END DESC,
    CASE WHEN sort_by = 'distance' THEN 
      ST_Distance(
        p.location_coordinates::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) / 1000.0
    END ASC,
    CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL THEN
      ts_rank(p.search_vector, plainto_tsquery('english', search_query))
    END DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Anyone can insert users" ON users;
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own products" ON products;
CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (seller_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own products" ON products;
CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (seller_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own products" ON products;
CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (seller_id = auth.uid()::text);

-- Services policies
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (status = 'active' OR provider_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own services" ON services;
CREATE POLICY "Users can insert their own services"
  ON services FOR INSERT
  WITH CHECK (provider_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own services" ON services;
CREATE POLICY "Users can update their own services"
  ON services FOR UPDATE
  USING (provider_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own services" ON services;
CREATE POLICY "Users can delete their own services"
  ON services FOR DELETE
  USING (provider_id = auth.uid()::text);

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid()::text = buyer_id OR auth.uid()::text = seller_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid()::text = buyer_id OR auth.uid()::text = seller_id);

-- Favorites policies
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;
CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (auth.uid()::text = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Disputes policies
DROP POLICY IF EXISTS "Users can view disputes they're involved in" ON disputes;
CREATE POLICY "Users can view disputes they're involved in" ON disputes
  FOR SELECT USING (auth.uid()::text = complainant_id OR auth.uid()::text = respondent_id);

DROP POLICY IF EXISTS "Users can create disputes" ON disputes;
CREATE POLICY "Users can create disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid()::text = complainant_id);

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "System can manage user roles" ON user_roles;
CREATE POLICY "System can manage user roles" ON user_roles
  FOR ALL USING (true);

-- Verification requests policies
DROP POLICY IF EXISTS "Users can view their own verification requests" ON verification_requests;
CREATE POLICY "Users can view their own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
CREATE POLICY "Users can create verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "System can manage subscriptions" ON subscriptions;
CREATE POLICY "System can manage subscriptions" ON subscriptions
  FOR ALL USING (true);

-- Search history policies
DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert their own search history" ON search_history;
CREATE POLICY "Users can insert their own search history"
  ON search_history FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON product_reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON product_reviews FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Users can insert their own reviews" ON product_reviews;
CREATE POLICY "Users can insert their own reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own reviews" ON product_reviews;
CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  USING (user_id = auth.uid()::text);

-- =====================================================
-- VIEWS
-- =====================================================

CREATE OR REPLACE VIEW user_role_summary AS
SELECT 
  u.user_id,
  u.full_name,
  u.user_role,
  u.tier,
  u.verification_status,
  u.item_limit,
  ur.role_type,
  ur.is_active as role_active,
  ur.verification_date,
  ur.subscription_start,
  ur.subscription_end
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = true;

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_role_summary TO anon, authenticated;

-- =====================================================
-- SCHEMA SETUP COMPLETE
-- =====================================================
