-- =====================================================
-- BANDA SERVICE PROVIDERS DATABASE SCHEMA
-- =====================================================
-- This schema supports the service provider inboarding system
-- for agriculture, veterinary, fisheries, and other services

-- =====================================================
-- 1. SERVICE PROVIDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('individual', 'organization')),
  
  -- Personal Details (for individuals)
  full_name TEXT,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  profile_photo TEXT,
  
  -- Organization Details
  business_name TEXT,
  registration_number TEXT,
  tax_id TEXT,
  contact_person TEXT,
  organization_email TEXT,
  logo TEXT,
  
  -- Verification
  id_document TEXT,
  license TEXT,
  certificates TEXT[], -- Array of certificate URLs
  professional_credentials TEXT[],
  
  -- Status & Badges
  verified BOOLEAN DEFAULT FALSE,
  pending_verification BOOLEAN DEFAULT TRUE,
  equipment_verified BOOLEAN DEFAULT FALSE,
  good_conduct BOOLEAN DEFAULT FALSE,
  
  -- Availability
  discoverable BOOLEAN DEFAULT TRUE,
  instant_requests BOOLEAN DEFAULT TRUE,
  service_areas TEXT[], -- Array of regions
  
  -- Payment
  payment_method TEXT CHECK (payment_method IN ('agripay', 'mpesa', 'bank')),
  account_details TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  profile_completion INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_requests INTEGER DEFAULT 0,
  completed_requests INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_inboarding_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_provider_type ON service_providers(provider_type);
CREATE INDEX idx_service_providers_verified ON service_providers(verified);
CREATE INDEX idx_service_providers_discoverable ON service_providers(discoverable);

-- =====================================================
-- 2. SERVICE TYPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL CHECK (service_category IN (
    'agriculture', 'veterinary', 'fisheries', 'training', 
    'pest_control', 'construction', 'survey', 'security', 
    'transport', 'equipment_rental', 'consultation', 'other'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_service_types_provider_id ON service_types(provider_id);
CREATE INDEX idx_service_types_category ON service_types(service_category);

-- =====================================================
-- 3. EQUIPMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('owned', 'leased', 'financed')),
  maintenance_status TEXT NOT NULL CHECK (maintenance_status IN ('excellent', 'good', 'fair', 'needs_service')),
  availability TEXT NOT NULL CHECK (availability IN ('available', 'in_use', 'maintenance')) DEFAULT 'available',
  photos TEXT[], -- Array of photo URLs
  specifications JSONB, -- Flexible field for equipment specs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_service_equipment_provider_id ON service_equipment(provider_id);
CREATE INDEX idx_service_equipment_availability ON service_equipment(availability);
CREATE INDEX idx_service_equipment_type ON service_equipment(type);

-- =====================================================
-- 4. OPERATING HOURS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_operating_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time TIME,
  end_time TIME,
  closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, day_of_week)
);

-- Indexes
CREATE INDEX idx_operating_hours_provider_id ON service_operating_hours(provider_id);

-- =====================================================
-- 5. SERVICE REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates JSONB, -- { lat, lng }
  
  -- Scheduling
  requested_date DATE,
  requested_time TIME,
  estimated_duration INTEGER, -- in hours
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
  
  -- Pricing
  quoted_price DECIMAL(12,2),
  final_price DECIMAL(12,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  
  -- Ratings & Reviews
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_service_requests_requester_id ON service_requests(requester_id);
CREATE INDEX idx_service_requests_provider_id ON service_requests(provider_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_service_category ON service_requests(service_category);

-- =====================================================
-- 6. SERVICE PROVIDER REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_provider_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_provider_reviews_provider_id ON service_provider_reviews(provider_id);
CREATE INDEX idx_provider_reviews_reviewer_id ON service_provider_reviews(reviewer_id);

-- =====================================================
-- 7. SERVICE PROVIDER EARNINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_provider_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  gross_amount DECIMAL(12,2) NOT NULL,
  banda_fee DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_provider_earnings_provider_id ON service_provider_earnings(provider_id);
CREATE INDEX idx_provider_earnings_request_id ON service_provider_earnings(request_id);
CREATE INDEX idx_provider_earnings_payment_status ON service_provider_earnings(payment_status);

-- =====================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_equipment_updated_at
  BEFORE UPDATE ON service_equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operating_hours_updated_at
  BEFORE UPDATE ON service_operating_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_earnings ENABLE ROW LEVEL SECURITY;

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

-- Public can view verified providers
CREATE POLICY "Public can view verified providers"
  ON service_providers FOR SELECT
  USING (verified = TRUE AND discoverable = TRUE);

-- Service Types Policies
CREATE POLICY "Providers can manage their service types"
  ON service_types FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Equipment Policies
CREATE POLICY "Providers can manage their equipment"
  ON service_equipment FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Operating Hours Policies
CREATE POLICY "Providers can manage their operating hours"
  ON service_operating_hours FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Service Requests Policies
CREATE POLICY "Users can view their own requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = requester_id OR provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create service requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Providers can update requests assigned to them"
  ON service_requests FOR UPDATE
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Reviews Policies
CREATE POLICY "Users can view reviews"
  ON service_provider_reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create reviews for completed requests"
  ON service_provider_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Earnings Policies
CREATE POLICY "Providers can view their earnings"
  ON service_provider_earnings FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate provider rating
CREATE OR REPLACE FUNCTION calculate_provider_rating(p_provider_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(rating), 0.00)
  INTO avg_rating
  FROM service_provider_reviews
  WHERE provider_id = p_provider_id;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- Function to update provider stats
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE service_providers
    SET 
      completed_requests = completed_requests + 1,
      rating = calculate_provider_rating(NEW.provider_id)
    WHERE id = NEW.provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_stats_on_request_completion
  AFTER UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_stats();

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
