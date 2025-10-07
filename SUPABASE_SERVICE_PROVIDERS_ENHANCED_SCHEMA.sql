-- Enhanced Service Providers Schema with Specializations and Marketplace Integration
-- Run this after SUPABASE_SERVICE_PROVIDERS_SCHEMA.sql

-- Add specializations column to service_providers table
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS instant_requests_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER DEFAULT 60;

-- Create service_specializations table for detailed tracking
CREATE TABLE IF NOT EXISTS service_specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create service_requests table for marketplace
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create service_marketplace_posts table for providers to advertise services
CREATE TABLE IF NOT EXISTS service_marketplace_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create service_equipment table for tracking provider equipment
CREATE TABLE IF NOT EXISTS service_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create function to generate service request number
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

-- Create function to update service provider stats
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

-- Add stats columns to service_providers if not exists
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS total_requests INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_requests INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00;

-- Create view for service provider dashboard
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
  
  -- Active requests
  (SELECT COUNT(*) FROM service_requests WHERE provider_id = sp.id AND status IN ('accepted', 'in_progress')) as active_requests,
  
  -- Pending requests
  (SELECT COUNT(*) FROM service_requests WHERE provider_id = sp.id AND status = 'pending') as pending_requests,
  
  -- This month earnings
  (SELECT COALESCE(SUM(final_price), 0) FROM service_requests 
   WHERE provider_id = sp.id 
   AND status = 'completed' 
   AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', NOW())) as month_earnings,
  
  -- Total earnings
  (SELECT COALESCE(SUM(final_price), 0) FROM service_requests 
   WHERE provider_id = sp.id AND status = 'completed') as total_earnings,
  
  -- Equipment count
  (SELECT COUNT(*) FROM service_equipment WHERE provider_id = sp.id) as equipment_count,
  
  -- Specializations
  (SELECT json_agg(json_build_object(
    'service_name', service_name,
    'category', category,
    'is_active', is_active
  )) FROM service_specializations WHERE provider_id = sp.id) as specializations
  
FROM service_providers sp;

-- Create view for marketplace service listings
CREATE OR REPLACE VIEW service_marketplace_listings AS
SELECT 
  smp.id,
  smp.service_type_id,
  smp.service_name,
  smp.category,
  smp.title,
  smp.description,
  smp.images,
  smp.starting_price,
  smp.pricing_type,
  smp.service_areas,
  smp.location_county,
  smp.location_lat,
  smp.location_lng,
  smp.is_active,
  smp.views_count,
  smp.requests_count,
  smp.tags,
  smp.created_at,
  
  -- Provider info
  sp.id as provider_id,
  sp.business_name,
  sp.full_name,
  sp.profile_image,
  sp.verification_status,
  sp.average_rating,
  sp.completed_requests,
  sp.phone,
  sp.email
  
FROM service_marketplace_posts smp
JOIN service_providers sp ON smp.provider_id = sp.id
WHERE smp.is_active = true AND sp.verification_status IN ('verified', 'pending');

-- Grant permissions
GRANT ALL ON service_specializations TO authenticated;
GRANT ALL ON service_requests TO authenticated;
GRANT ALL ON service_marketplace_posts TO authenticated;
GRANT ALL ON service_equipment TO authenticated;
GRANT SELECT ON service_provider_dashboard TO authenticated;
GRANT SELECT ON service_marketplace_listings TO authenticated;

-- Enable RLS
ALTER TABLE service_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_marketplace_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_specializations
CREATE POLICY "Users can view all active specializations"
  ON service_specializations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Providers can manage their specializations"
  ON service_specializations FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- RLS Policies for service_requests
CREATE POLICY "Users can view their own requests"
  ON service_requests FOR SELECT
  USING (requester_id = auth.uid() OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters and providers can update their requests"
  ON service_requests FOR UPDATE
  USING (requester_id = auth.uid() OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- RLS Policies for service_marketplace_posts
CREATE POLICY "Users can view active marketplace posts"
  ON service_marketplace_posts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Providers can manage their posts"
  ON service_marketplace_posts FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- RLS Policies for service_equipment
CREATE POLICY "Users can view equipment of active providers"
  ON service_equipment FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE verification_status IN ('verified', 'pending')));

CREATE POLICY "Providers can manage their equipment"
  ON service_equipment FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

COMMENT ON TABLE service_specializations IS 'Tracks specific service specializations for each provider';
COMMENT ON TABLE service_requests IS 'Marketplace requests for services from buyers to providers';
COMMENT ON TABLE service_marketplace_posts IS 'Provider-created service advertisements in marketplace';
COMMENT ON TABLE service_equipment IS 'Equipment owned/leased by service providers';
