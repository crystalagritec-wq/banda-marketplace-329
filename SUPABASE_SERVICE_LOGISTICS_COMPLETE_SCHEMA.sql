-- =====================================================
-- BANDA SERVICE PROVIDERS & LOGISTICS COMPLETE SCHEMA
-- =====================================================
-- Crystal AgriTech Kenya - Banda Marketplace
-- Run this in your Supabase SQL Editor
-- This schema includes:
-- 1. Service Providers (Agriculture, Veterinary, Fisheries, etc.)
-- 2. Logistics Owners (Vehicle owners)
-- 3. Logistics Drivers
-- 4. Service Requests & Marketplace
-- 5. Delivery Management
-- 6. Earnings & Payouts
-- =====================================================

-- =====================================================
-- PART 1: SERVICE PROVIDERS SYSTEM
-- =====================================================

-- 1.1 SERVICE PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('individual', 'organization')),
  
  -- Personal Details (for individuals)
  full_name TEXT,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  profile_image TEXT,
  
  -- Organization Details
  business_name TEXT,
  registration_number TEXT,
  tax_id TEXT,
  contact_person TEXT,
  organization_email TEXT,
  logo TEXT,
  
  -- Verification Documents
  id_document TEXT,
  license TEXT,
  certificates TEXT[],
  professional_credentials TEXT[],
  
  -- Status & Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  pending_verification BOOLEAN DEFAULT TRUE,
  equipment_verified BOOLEAN DEFAULT FALSE,
  good_conduct BOOLEAN DEFAULT FALSE,
  
  -- Availability & Discovery
  is_discoverable BOOLEAN DEFAULT TRUE,
  instant_requests_enabled BOOLEAN DEFAULT TRUE,
  service_areas TEXT[],
  service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  service_radius_km INTEGER DEFAULT 50,
  response_time_minutes INTEGER DEFAULT 60,
  
  -- Payment
  payment_method TEXT CHECK (payment_method IN ('agripay', 'mpesa', 'bank')),
  account_details TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  
  -- Operating Hours
  operating_hours JSONB DEFAULT '{}'::jsonb,
  
  -- Stats & Metadata
  profile_completion INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_requests INTEGER DEFAULT 0,
  completed_requests INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  
  -- Specializations
  specializations JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_inboarding_at TIMESTAMPTZ
);

CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_provider_type ON service_providers(provider_type);
CREATE INDEX idx_service_providers_verification_status ON service_providers(verification_status);
CREATE INDEX idx_service_providers_discoverable ON service_providers(is_discoverable);

-- 1.2 SERVICE SPECIALIZATIONS TABLE
CREATE TABLE IF NOT EXISTS service_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_type_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
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

-- 1.3 SERVICE EQUIPMENT TABLE
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
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_equipment_provider ON service_equipment(provider_id);
CREATE INDEX idx_service_equipment_available ON service_equipment(is_available);
CREATE INDEX idx_service_equipment_type ON service_equipment(equipment_type);

-- 1.4 SERVICE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 1.5 SERVICE MARKETPLACE POSTS TABLE
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
  is_active BOOLEAN DEFAULT TRUE,
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

-- 1.6 SERVICE PROVIDER EARNINGS TABLE
CREATE TABLE IF NOT EXISTS service_provider_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  gross_amount DECIMAL(12,2) NOT NULL,
  banda_fee DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_provider_earnings_provider_id ON service_provider_earnings(provider_id);
CREATE INDEX idx_service_provider_earnings_request_id ON service_provider_earnings(request_id);
CREATE INDEX idx_service_provider_earnings_payment_status ON service_provider_earnings(payment_status);

-- =====================================================
-- PART 2: LOGISTICS SYSTEM (OWNERS & DRIVERS)
-- =====================================================

-- 2.1 LOGISTICS OWNERS TABLE
CREATE TABLE IF NOT EXISTS logistics_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  kra_pin TEXT NOT NULL,
  area_of_operation TEXT NOT NULL,
  assigned_driver TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_owners_user_id ON logistics_owners(user_id);
CREATE INDEX idx_logistics_owners_verified ON logistics_owners(verified);

-- 2.2 LOGISTICS VEHICLES TABLE
CREATE TABLE IF NOT EXISTS logistics_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES logistics_owners(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  capacity TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('owned', 'financed')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_vehicles_owner_id ON logistics_vehicles(owner_id);
CREATE INDEX idx_logistics_vehicles_status ON logistics_vehicles(status);
CREATE INDEX idx_logistics_vehicles_registration ON logistics_vehicles(registration_number);

-- 2.3 LOGISTICS DRIVERS TABLE
CREATE TABLE IF NOT EXISTS logistics_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  selfie_uri TEXT NOT NULL,
  national_id_uri TEXT NOT NULL,
  driver_license_uri TEXT NOT NULL,
  license_class TEXT NOT NULL,
  allow_discovery BOOLEAN DEFAULT TRUE,
  availability TEXT DEFAULT 'active' CHECK (availability IN ('active', 'idle', 'offline')),
  verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_deliveries INTEGER DEFAULT 0,
  current_location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_drivers_user_id ON logistics_drivers(user_id);
CREATE INDEX idx_logistics_drivers_verified ON logistics_drivers(verified);
CREATE INDEX idx_logistics_drivers_availability ON logistics_drivers(availability);
CREATE INDEX idx_logistics_drivers_discovery ON logistics_drivers(allow_discovery) WHERE allow_discovery = TRUE;

-- 2.4 LOGISTICS ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS logistics_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES logistics_drivers(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES logistics_owners(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES logistics_vehicles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'delivered', 'cancelled')) DEFAULT 'pending',
  pooled BOOLEAN DEFAULT FALSE,
  route JSONB,
  eta INTERVAL,
  pickup_location JSONB,
  delivery_location JSONB,
  distance_km FLOAT,
  estimated_duration INTEGER,
  actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_assignments_driver_id ON logistics_assignments(driver_id);
CREATE INDEX idx_logistics_assignments_owner_id ON logistics_assignments(owner_id);
CREATE INDEX idx_logistics_assignments_order_id ON logistics_assignments(order_id);
CREATE INDEX idx_logistics_assignments_status ON logistics_assignments(status);

-- 2.5 LOGISTICS EARNINGS TABLE
CREATE TABLE IF NOT EXISTS logistics_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'driver')),
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('delivery', 'pooling', 'premium', 'bonus')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'held', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_earnings_user_id ON logistics_earnings(user_id);
CREATE INDEX idx_logistics_earnings_status ON logistics_earnings(status);
CREATE INDEX idx_logistics_earnings_created_at ON logistics_earnings(created_at DESC);

-- 2.6 LOGISTICS PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS logistics_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES logistics_drivers(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES logistics_owners(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE CASCADE,
  gross_amount DECIMAL(10,2) NOT NULL CHECK (gross_amount >= 0),
  banda_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (banda_fee >= 0),
  net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
  status TEXT CHECK (status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_payouts_driver_id ON logistics_payouts(driver_id);
CREATE INDEX idx_logistics_payouts_owner_id ON logistics_payouts(owner_id);
CREATE INDEX idx_logistics_payouts_status ON logistics_payouts(status);

-- 2.7 LOGISTICS WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS logistics_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'driver')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'bank_transfer', 'agripay')) NOT NULL,
  account_details JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  transaction_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_withdrawals_user_id ON logistics_withdrawals(user_id);
CREATE INDEX idx_logistics_withdrawals_status ON logistics_withdrawals(status);

-- 2.8 LOGISTICS QR CODES TABLE
CREATE TABLE IF NOT EXISTS logistics_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_qr_codes_code ON logistics_qr_codes(code);
CREATE INDEX idx_logistics_qr_codes_assignment_id ON logistics_qr_codes(assignment_id);

-- 2.9 LOGISTICS ROUTE OPTIMIZATIONS TABLE
CREATE TABLE IF NOT EXISTS logistics_route_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES logistics_drivers(id) ON DELETE CASCADE,
  order_ids UUID[] NOT NULL,
  optimized_route JSONB NOT NULL,
  total_distance_km FLOAT,
  estimated_duration INTEGER,
  fuel_cost_estimate DECIMAL(8,2),
  efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  is_pooled BOOLEAN DEFAULT FALSE,
  pooling_discount DECIMAL(4,2) DEFAULT 0,
  status TEXT CHECK (status IN ('generated', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_route_optimizations_driver_id ON logistics_route_optimizations(driver_id);

-- 2.10 LOGISTICS RATINGS TABLE
CREATE TABLE IF NOT EXISTS logistics_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'driver')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logistics_ratings_rated_user ON logistics_ratings(rated_user_id);
CREATE INDEX idx_logistics_ratings_assignment ON logistics_ratings(assignment_id);

-- =====================================================
-- PART 3: FUNCTIONS & TRIGGERS
-- =====================================================

-- 3.1 Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_specializations_updated_at
  BEFORE UPDATE ON service_specializations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_equipment_updated_at
  BEFORE UPDATE ON service_equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_marketplace_posts_updated_at
  BEFORE UPDATE ON service_marketplace_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_owners_updated_at
  BEFORE UPDATE ON logistics_owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_vehicles_updated_at
  BEFORE UPDATE ON logistics_vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_drivers_updated_at
  BEFORE UPDATE ON logistics_drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_assignments_updated_at
  BEFORE UPDATE ON logistics_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_route_optimizations_updated_at
  BEFORE UPDATE ON logistics_route_optimizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3.2 Generate service request number
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
FOR EACH ROW EXECUTE FUNCTION set_service_request_number();

-- 3.3 Update service provider stats
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
        SELECT COALESCE(AVG(provider_rating), 0.00) FROM service_requests 
        WHERE provider_id = NEW.provider_id AND provider_rating IS NOT NULL
      )
    WHERE id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_provider_stats
AFTER INSERT OR UPDATE ON service_requests
FOR EACH ROW EXECUTE FUNCTION update_service_provider_stats();

-- 3.4 Update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE logistics_drivers
  SET rating = (
    SELECT COALESCE(AVG(rating), 0.00)::DECIMAL(3,2)
    FROM logistics_ratings
    WHERE rated_user_id = NEW.rated_user_id AND role = 'driver'
  )
  WHERE user_id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_rating_trigger
  AFTER INSERT ON logistics_ratings
  FOR EACH ROW
  WHEN (NEW.role = 'driver')
  EXECUTE FUNCTION update_driver_rating();

-- 3.5 Update driver delivery count
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE logistics_drivers 
    SET total_deliveries = total_deliveries + 1,
        updated_at = NOW()
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_stats
  AFTER UPDATE ON logistics_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_stats();

-- 3.6 Calculate Banda fee
CREATE OR REPLACE FUNCTION calculate_banda_fee(gross_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(gross_amount * 0.10, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 4: VIEWS
-- =====================================================

-- 4.1 Service Provider Dashboard View
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
  (SELECT COUNT(*) FROM service_equipment WHERE provider_id = sp.id) as equipment_count,
  (SELECT json_agg(json_build_object(
    'service_name', service_name,
    'category', category,
    'is_active', is_active
  )) FROM service_specializations WHERE provider_id = sp.id) as specializations
  
FROM service_providers sp;

-- 4.2 Logistics Owner Stats View
CREATE OR REPLACE VIEW logistics_owner_stats AS
SELECT 
  lo.id AS owner_id,
  lo.user_id,
  lo.full_name,
  lo.verified,
  COUNT(DISTINCT lv.id) AS total_vehicles,
  COUNT(DISTINCT CASE WHEN lv.status = 'available' THEN lv.id END) AS available_vehicles,
  COALESCE(SUM(CASE WHEN le.status = 'paid' THEN le.amount ELSE 0 END), 0) AS total_earnings,
  COALESCE(SUM(CASE WHEN le.status = 'pending' THEN le.amount ELSE 0 END), 0) AS pending_earnings
FROM logistics_owners lo
LEFT JOIN logistics_vehicles lv ON lo.id = lv.owner_id
LEFT JOIN logistics_earnings le ON lo.user_id = le.user_id AND le.role = 'owner'
GROUP BY lo.id, lo.user_id, lo.full_name, lo.verified;

-- 4.3 Logistics Driver Stats View
CREATE OR REPLACE VIEW logistics_driver_stats AS
SELECT 
  ld.id AS driver_id,
  ld.user_id,
  ld.full_name,
  ld.verified,
  ld.rating,
  ld.total_deliveries,
  ld.availability,
  COALESCE(SUM(CASE WHEN le.status = 'paid' THEN le.amount ELSE 0 END), 0) AS total_earnings,
  COALESCE(SUM(CASE WHEN le.status = 'pending' THEN le.amount ELSE 0 END), 0) AS pending_earnings
FROM logistics_drivers ld
LEFT JOIN logistics_earnings le ON ld.user_id = le.user_id AND le.role = 'driver'
GROUP BY ld.id, ld.user_id, ld.full_name, ld.verified, ld.rating, ld.total_deliveries, ld.availability;

-- =====================================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_marketplace_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_ratings ENABLE ROW LEVEL SECURITY;

-- Service Providers Policies
CREATE POLICY "Users can view their own provider profile"
  ON service_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provider profile"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile"
  ON service_providers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified providers"
  ON service_providers FOR SELECT
  USING (verification_status = 'verified' AND is_discoverable = TRUE);

-- Service Specializations Policies
CREATE POLICY "Users can view all active specializations"
  ON service_specializations FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Providers can manage their specializations"
  ON service_specializations FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Service Equipment Policies
CREATE POLICY "Users can view equipment of active providers"
  ON service_equipment FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE verification_status IN ('verified', 'pending')));

CREATE POLICY "Providers can manage their equipment"
  ON service_equipment FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Service Requests Policies
CREATE POLICY "Users can view their own requests"
  ON service_requests FOR SELECT
  USING (requester_id = auth.uid() OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters and providers can update their requests"
  ON service_requests FOR UPDATE
  USING (requester_id = auth.uid() OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Service Marketplace Posts Policies
CREATE POLICY "Users can view active marketplace posts"
  ON service_marketplace_posts FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Providers can manage their posts"
  ON service_marketplace_posts FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Service Provider Earnings Policies
CREATE POLICY "Providers can view their earnings"
  ON service_provider_earnings FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Logistics Owners Policies
CREATE POLICY "Users can view their own owner profile"
  ON logistics_owners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own owner profile"
  ON logistics_owners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own owner profile"
  ON logistics_owners FOR UPDATE
  USING (auth.uid() = user_id);

-- Logistics Vehicles Policies
CREATE POLICY "Owners can view their own vehicles"
  ON logistics_vehicles FOR SELECT
  USING (owner_id IN (SELECT id FROM logistics_owners WHERE user_id = auth.uid()));

CREATE POLICY "Owners can insert their own vehicles"
  ON logistics_vehicles FOR INSERT
  WITH CHECK (owner_id IN (SELECT id FROM logistics_owners WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update their own vehicles"
  ON logistics_vehicles FOR UPDATE
  USING (owner_id IN (SELECT id FROM logistics_owners WHERE user_id = auth.uid()));

-- Logistics Drivers Policies
CREATE POLICY "Users can view their own driver profile"
  ON logistics_drivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can view discoverable drivers"
  ON logistics_drivers FOR SELECT
  USING (allow_discovery = TRUE);

CREATE POLICY "Users can insert their own driver profile"
  ON logistics_drivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own driver profile"
  ON logistics_drivers FOR UPDATE
  USING (auth.uid() = user_id);

-- Logistics Assignments Policies
CREATE POLICY "Assignment access"
  ON logistics_assignments FOR ALL
  USING (
    driver_id IN (SELECT id FROM logistics_drivers WHERE user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM logistics_owners WHERE user_id = auth.uid()) OR
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
  );

-- Logistics Earnings Policies
CREATE POLICY "Users can view their own earnings"
  ON logistics_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert earnings"
  ON logistics_earnings FOR INSERT
  WITH CHECK (TRUE);

-- Logistics Payouts Policies
CREATE POLICY "Payout access"
  ON logistics_payouts FOR ALL
  USING (
    driver_id IN (SELECT id FROM logistics_drivers WHERE user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM logistics_owners WHERE user_id = auth.uid())
  );

-- Logistics Withdrawals Policies
CREATE POLICY "Users can view their own withdrawals"
  ON logistics_withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals"
  ON logistics_withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Logistics QR Codes Policies
CREATE POLICY "QR code access"
  ON logistics_qr_codes FOR ALL
  USING (
    assignment_id IN (
      SELECT la.id FROM logistics_assignments la
      JOIN logistics_drivers ld ON la.driver_id = ld.id
      WHERE ld.user_id = auth.uid()
    ) OR
    assignment_id IN (
      SELECT la.id FROM logistics_assignments la
      JOIN orders o ON la.order_id = o.id
      WHERE o.buyer_id = auth.uid()
    )
  );

-- Logistics Route Optimizations Policies
CREATE POLICY "Route optimization access"
  ON logistics_route_optimizations FOR ALL
  USING (
    driver_id IN (SELECT id FROM logistics_drivers WHERE user_id = auth.uid())
  );

-- Logistics Ratings Policies
CREATE POLICY "Users can view ratings for their deliveries"
  ON logistics_ratings FOR SELECT
  USING (auth.uid() = rated_user_id OR auth.uid() = rater_user_id);

CREATE POLICY "Users can insert ratings"
  ON logistics_ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_user_id);

-- =====================================================
-- PART 6: GRANTS
-- =====================================================

GRANT ALL ON service_providers TO authenticated;
GRANT ALL ON service_specializations TO authenticated;
GRANT ALL ON service_equipment TO authenticated;
GRANT ALL ON service_requests TO authenticated;
GRANT ALL ON service_marketplace_posts TO authenticated;
GRANT ALL ON service_provider_earnings TO authenticated;
GRANT ALL ON logistics_owners TO authenticated;
GRANT ALL ON logistics_vehicles TO authenticated;
GRANT ALL ON logistics_drivers TO authenticated;
GRANT ALL ON logistics_assignments TO authenticated;
GRANT ALL ON logistics_earnings TO authenticated;
GRANT ALL ON logistics_payouts TO authenticated;
GRANT ALL ON logistics_withdrawals TO authenticated;
GRANT ALL ON logistics_qr_codes TO authenticated;
GRANT ALL ON logistics_route_optimizations TO authenticated;
GRANT ALL ON logistics_ratings TO authenticated;
GRANT SELECT ON service_provider_dashboard TO authenticated;
GRANT SELECT ON logistics_owner_stats TO authenticated;
GRANT SELECT ON logistics_driver_stats TO authenticated;

-- =====================================================
-- SCHEMA COMPLETE ✅
-- =====================================================
-- Next Steps:
-- 1. Run this schema in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Test RLS policies with sample data
-- 4. Connect backend tRPC procedures
-- 5. Build frontend UI components
-- =====================================================
