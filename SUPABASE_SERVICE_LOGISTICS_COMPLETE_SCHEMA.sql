-- ============================================
-- COMPLETE SERVICE & LOGISTICS SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- BASE TABLES (Prerequisites)
-- ============================================

-- Ensure profiles table exists (if not already created)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure orders table exists (if not already created)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICE PROVIDERS SYSTEM
-- ============================================

-- Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('individual', 'company')),
  
  -- Business Information
  business_name TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  profile_image TEXT,
  
  -- Location
  location_county TEXT NOT NULL,
  location_sub_county TEXT,
  location_ward TEXT,
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents JSONB DEFAULT '{}'::jsonb,
  
  -- Settings
  is_discoverable BOOLEAN DEFAULT true,
  instant_requests_enabled BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  service_radius_km INTEGER DEFAULT 50,
  response_time_minutes INTEGER DEFAULT 60,
  
  -- Stats
  total_requests INTEGER DEFAULT 0,
  completed_requests INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  
  -- Metadata
  specializations JSONB DEFAULT '[]'::jsonb,
  service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_service_providers_user ON service_providers(user_id);
CREATE INDEX idx_service_providers_location ON service_providers(location_county, location_sub_county);
CREATE INDEX idx_service_providers_verification ON service_providers(verification_status);

-- Service Specializations Table
CREATE TABLE IF NOT EXISTS service_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_type_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  custom_pricing JSONB DEFAULT '{}'::jsonb,
  availability TEXT DEFAULT 'Location-based',
  request_type TEXT DEFAULT 'Instant or Scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_specializations_provider ON service_specializations(provider_id);
CREATE INDEX idx_service_specializations_category ON service_specializations(category);
CREATE INDEX idx_service_specializations_active ON service_specializations(is_active);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  service_type_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Request details
  description TEXT NOT NULL,
  location_county TEXT NOT NULL,
  location_sub_county TEXT,
  location_ward TEXT,
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Scheduling
  request_type TEXT NOT NULL CHECK (request_type IN ('Instant', 'Scheduled')),
  scheduled_date TIMESTAMPTZ,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_duration_hours DECIMAL(5, 2),
  
  -- Pricing
  quoted_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held', 'released', 'refunded')),
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
  
  -- Ratings
  requester_rating INTEGER CHECK (requester_rating >= 1 AND requester_rating <= 5),
  provider_rating INTEGER CHECK (provider_rating >= 1 AND provider_rating <= 5),
  requester_review TEXT,
  provider_review TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX idx_service_requests_provider ON service_requests(provider_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_category ON service_requests(category);
CREATE INDEX idx_service_requests_location ON service_requests(location_county, location_sub_county);
CREATE INDEX idx_service_requests_scheduled ON service_requests(scheduled_date);

-- Service Marketplace Posts Table
CREATE TABLE IF NOT EXISTS service_marketplace_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_type_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Post details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Pricing
  starting_price DECIMAL(10, 2),
  pricing_type TEXT CHECK (pricing_type IN ('hourly', 'daily', 'fixed', 'negotiable')),
  
  -- Location
  service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  location_county TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  available_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  requests_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_marketplace_provider ON service_marketplace_posts(provider_id);
CREATE INDEX idx_service_marketplace_category ON service_marketplace_posts(category);
CREATE INDEX idx_service_marketplace_active ON service_marketplace_posts(is_active);
CREATE INDEX idx_service_marketplace_location ON service_marketplace_posts(location_county);

-- Service Equipment Table
CREATE TABLE IF NOT EXISTS service_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  
  -- Ownership
  ownership_status TEXT NOT NULL CHECK (ownership_status IN ('owned', 'leased', 'financed')),
  
  -- Details
  description TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Maintenance
  maintenance_status TEXT DEFAULT 'good' CHECK (maintenance_status IN ('excellent', 'good', 'fair', 'needs_service')),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  
  -- Metadata
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_equipment_provider ON service_equipment(provider_id);
CREATE INDEX idx_service_equipment_available ON service_equipment(is_available);

-- Service Proofs Table
CREATE TABLE IF NOT EXISTS service_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_proofs_request ON service_proofs(service_request_id);

-- Service Ratings Table
CREATE TABLE IF NOT EXISTS service_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_request_id, user_id)
);

CREATE INDEX idx_service_ratings_provider ON service_ratings(provider_id);
CREATE INDEX idx_service_ratings_rating ON service_ratings(rating);

-- Service Provider Availability Table
CREATE TABLE IF NOT EXISTS service_provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT true,
  time_slots JSON,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_provider_id, date)
);

CREATE INDEX idx_service_availability_provider ON service_provider_availability(service_provider_id);
CREATE INDEX idx_service_availability_date ON service_provider_availability(date);

-- ============================================
-- LOGISTICS SYSTEM
-- ============================================

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('motorcycle', 'car', 'van', 'truck', 'bicycle')),
  vehicle_registration TEXT,
  rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_deliveries INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  current_location GEOMETRY(Point, 4326),
  heading DECIMAL,
  speed_kmh DECIMAL,
  service_areas TEXT[],
  vehicle_capacity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_user ON drivers(user_id);
CREATE INDEX idx_drivers_location ON drivers USING GIST(current_location);
CREATE INDEX idx_drivers_available ON drivers(is_available);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  make TEXT,
  model TEXT,
  year INTEGER,
  capacity_kg DECIMAL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  insurance_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  tracking_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed')),
  
  -- Locations
  pickup_location JSONB NOT NULL,
  delivery_location JSONB NOT NULL,
  current_location GEOMETRY(Point, 4326),
  
  -- Route info
  distance_km DECIMAL,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  route_data JSONB,
  
  -- Pooling
  is_pooled BOOLEAN DEFAULT false,
  pool_group_id UUID,
  
  -- Timing
  scheduled_pickup_time TIMESTAMPTZ,
  actual_pickup_time TIMESTAMPTZ,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  
  -- Pricing
  delivery_fee DECIMAL(10,2),
  payout_status TEXT DEFAULT 'pending',
  payout_request_id UUID,
  
  -- Notes
  pickup_notes TEXT,
  delivery_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_tracking ON deliveries(tracking_number);
CREATE INDEX idx_deliveries_pool_group ON deliveries(pool_group_id);

-- Delivery Proofs Table
CREATE TABLE IF NOT EXISTS delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  image_url TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  signature_url TEXT,
  notes TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_proofs_delivery ON delivery_proofs(delivery_id);

-- Driver Ratings Table
CREATE TABLE IF NOT EXISTS driver_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
  timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
  care_of_goods INTEGER CHECK (care_of_goods >= 1 AND care_of_goods <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(delivery_id, user_id)
);

CREATE INDEX idx_driver_ratings_driver ON driver_ratings(driver_id);

-- Payout Requests Table
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  service_provider_id UUID REFERENCES service_providers(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  account_details JSON NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payout_requests_driver ON payout_requests(driver_id);
CREATE INDEX idx_payout_requests_service_provider ON payout_requests(service_provider_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);

-- Logistics Providers Table (for company owners)
CREATE TABLE IF NOT EXISTS logistics_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('motorcycle', 'car', 'van', 'truck', 'bicycle')),
  license_number TEXT,
  phone TEXT,
  email TEXT,
  rating FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_deliveries INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  current_location JSONB,
  service_areas TEXT[],
  vehicle_capacity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_providers_user ON logistics_providers(user_id);

-- Delivery Status History Table
CREATE TABLE IF NOT EXISTS delivery_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_status_history_delivery ON delivery_status_history(delivery_id);

-- Driver Location History Table
CREATE TABLE IF NOT EXISTS driver_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  location GEOMETRY(Point, 4326) NOT NULL,
  heading DECIMAL,
  speed_kmh DECIMAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_driver_location_history_driver ON driver_location_history(driver_id);
CREATE INDEX idx_driver_location_history_time ON driver_location_history(recorded_at);

-- Vehicle Status History Table
CREATE TABLE IF NOT EXISTS vehicle_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_status_history_vehicle ON vehicle_status_history(vehicle_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Generate service request number
CREATE OR REPLACE FUNCTION generate_service_request_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM service_requests;
  new_number := 'SR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate request number
CREATE OR REPLACE FUNCTION set_service_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_service_request_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_service_request_number
BEFORE INSERT ON service_requests
FOR EACH ROW
EXECUTE FUNCTION set_service_request_number();

-- Update service provider stats
CREATE OR REPLACE FUNCTION update_service_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE service_providers
    SET 
      total_requests = (
        SELECT COUNT(*) FROM service_requests 
        WHERE provider_id = NEW.provider_id
      ),
      completed_requests = (
        SELECT COUNT(*) FROM service_requests 
        WHERE provider_id = NEW.provider_id AND status = 'completed'
      ),
      average_rating = (
        SELECT AVG(provider_rating) FROM service_requests 
        WHERE provider_id = NEW.provider_id AND provider_rating IS NOT NULL
      )
    WHERE id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_provider_stats
AFTER INSERT OR UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION update_service_provider_stats();

-- Log delivery status changes
CREATE OR REPLACE FUNCTION log_delivery_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO delivery_status_history (delivery_id, status, timestamp)
    VALUES (NEW.id, NEW.status, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_delivery_status
AFTER UPDATE OF status ON deliveries
FOR EACH ROW
EXECUTE FUNCTION log_delivery_status_change();

-- Generate tracking number for deliveries
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BDL' || LPAD(floor(random() * 999999999)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Set tracking number on insert
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_tracking_number
BEFORE INSERT ON deliveries
FOR EACH ROW
EXECUTE FUNCTION set_tracking_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Service Providers
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view verified providers"
  ON service_providers FOR SELECT
  USING (verification_status = 'verified' OR user_id = auth.uid());

CREATE POLICY "Users can manage their own provider profile"
  ON service_providers FOR ALL
  USING (user_id = auth.uid());

-- Service Requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON service_requests FOR SELECT
  USING (requester_id = auth.uid() OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters and providers can update requests"
  ON service_requests FOR UPDATE
  USING (requester_id = auth.uid() OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own data"
  ON drivers FOR ALL
  USING (user_id = auth.uid());

-- Deliveries
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their deliveries"
  ON deliveries FOR SELECT
  USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()) OR
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
  );

-- ============================================
-- VIEWS
-- ============================================

-- Service Provider Dashboard View
CREATE OR REPLACE VIEW service_provider_dashboard AS
SELECT 
  sp.id,
  sp.user_id,
  sp.provider_type,
  sp.business_name,
  sp.full_name,
  sp.verification_status,
  sp.is_discoverable,
  sp.instant_requests_enabled,
  sp.total_requests,
  sp.completed_requests,
  sp.average_rating,
  
  (SELECT COUNT(*) FROM service_requests WHERE provider_id = sp.id AND status IN ('accepted', 'in_progress')) as active_requests,
  (SELECT COUNT(*) FROM service_requests WHERE provider_id = sp.id AND status = 'pending') as pending_requests,
  (SELECT COALESCE(SUM(final_price), 0) FROM service_requests 
   WHERE provider_id = sp.id 
   AND status = 'completed' 
   AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', NOW())) as month_earnings,
  (SELECT COALESCE(SUM(final_price), 0) FROM service_requests 
   WHERE provider_id = sp.id AND status = 'completed') as total_earnings,
  (SELECT COUNT(*) FROM service_equipment WHERE provider_id = sp.id) as equipment_count
  
FROM service_providers sp;

GRANT SELECT ON service_provider_dashboard TO authenticated;

COMMENT ON TABLE service_providers IS 'Service providers (vets, mechanics, farm handlers, etc.)';
COMMENT ON TABLE service_requests IS 'Service requests from buyers to providers';
COMMENT ON TABLE drivers IS 'Delivery drivers';
COMMENT ON TABLE deliveries IS 'Delivery assignments and tracking';
