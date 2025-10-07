-- =====================================================
-- BANDA MARKETPLACE DATABASE SCHEMA
-- Products, Services, Search, and Analytics
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_location_county ON products(location_county);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST(location_coordinates);

-- Update search vector trigger
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

CREATE TRIGGER trigger_update_product_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

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
  pricing_type TEXT DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'hourly', 'daily', 'negotiable')),
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

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_location_county ON services(location_county);
CREATE INDEX IF NOT EXISTS idx_services_price ON services(price_from);
CREATE INDEX IF NOT EXISTS idx_services_rating ON services(rating);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_search ON services USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_services_location ON services USING GIST(location_coordinates);

-- Update search vector trigger for services
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

CREATE TRIGGER trigger_update_service_search_vector
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_service_search_vector();

-- =====================================================
-- SEARCH HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Search Details
  query TEXT NOT NULL,
  search_type TEXT DEFAULT 'text' CHECK (search_type IN ('text', 'voice', 'image')),
  filters JSONB DEFAULT '{}',
  
  -- Results
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type TEXT CHECK (clicked_result_type IN ('product', 'service')),
  
  -- Context
  location_county TEXT,
  location_coordinates GEOGRAPHY(POINT, 4326),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search history
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_trending_searches_count ON trending_searches(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_searches_last_searched ON trending_searches(last_searched_at DESC);

-- =====================================================
-- PRODUCT VIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  session_id TEXT,
  
  -- Context
  source TEXT,
  referrer TEXT,
  
  -- Timestamps
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at DESC);

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  order_id UUID,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Metadata
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'hidden')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, user_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get products with distance
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

-- Function to update product rating
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

CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to track trending searches
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

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid()::text);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (seller_id = auth.uid()::text);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (seller_id = auth.uid()::text);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (seller_id = auth.uid()::text);

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (status = 'active' OR provider_id = auth.uid()::text);

CREATE POLICY "Users can insert their own services"
  ON services FOR INSERT
  WITH CHECK (provider_id = auth.uid()::text);

CREATE POLICY "Users can update their own services"
  ON services FOR UPDATE
  USING (provider_id = auth.uid()::text);

CREATE POLICY "Users can delete their own services"
  ON services FOR DELETE
  USING (provider_id = auth.uid()::text);

-- Search history policies
CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own search history"
  ON search_history FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON product_reviews FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can insert their own reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  USING (user_id = auth.uid()::text);

-- =====================================================
-- INITIAL DATA SETUP COMPLETE
-- =====================================================
