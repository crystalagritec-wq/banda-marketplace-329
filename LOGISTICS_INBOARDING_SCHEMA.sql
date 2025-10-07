-- =====================================================
-- BANDA LOGISTICS INBOARDING DATABASE SCHEMA
-- =====================================================
-- This schema supports the logistics inboarding system for
-- vehicle owners and drivers with Kenya compliance requirements
-- =====================================================

-- =====================================================
-- LOGISTICS OWNERS TABLE
-- =====================================================
-- Stores vehicle owner profiles with KRA PIN and verification
CREATE TABLE IF NOT EXISTS logistics_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  kra_pin TEXT NOT NULL,
  area_of_operation TEXT NOT NULL,
  assigned_driver TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_logistics_owners_user_id ON logistics_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_owners_verified ON logistics_owners(verified);

-- =====================================================
-- LOGISTICS VEHICLES TABLE
-- =====================================================
-- Stores vehicle details linked to owners
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

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_logistics_vehicles_owner_id ON logistics_vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_logistics_vehicles_status ON logistics_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_logistics_vehicles_registration ON logistics_vehicles(registration_number);

-- =====================================================
-- LOGISTICS DRIVERS TABLE
-- =====================================================
-- Stores driver profiles with verification documents
CREATE TABLE IF NOT EXISTS logistics_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_logistics_drivers_user_id ON logistics_drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_drivers_verified ON logistics_drivers(verified);
CREATE INDEX IF NOT EXISTS idx_logistics_drivers_availability ON logistics_drivers(availability);
CREATE INDEX IF NOT EXISTS idx_logistics_drivers_discovery ON logistics_drivers(allow_discovery) WHERE allow_discovery = TRUE;

-- =====================================================
-- LOGISTICS EARNINGS TABLE
-- =====================================================
-- Tracks earnings for both owners and drivers
CREATE TABLE IF NOT EXISTS logistics_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'driver')),
  delivery_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('delivery', 'pooling', 'premium', 'bonus')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'held', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_logistics_earnings_user_id ON logistics_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_earnings_status ON logistics_earnings(status);
CREATE INDEX IF NOT EXISTS idx_logistics_earnings_created_at ON logistics_earnings(created_at DESC);

-- =====================================================
-- LOGISTICS RATINGS TABLE
-- =====================================================
-- Stores ratings for owners and drivers
CREATE TABLE IF NOT EXISTS logistics_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivery_id UUID,
  role TEXT NOT NULL CHECK (role IN ('owner', 'driver')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_logistics_ratings_rated_user ON logistics_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_ratings_delivery ON logistics_ratings(delivery_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE logistics_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_ratings ENABLE ROW LEVEL SECURITY;

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

-- Logistics Earnings Policies
CREATE POLICY "Users can view their own earnings"
  ON logistics_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert earnings"
  ON logistics_earnings FOR INSERT
  WITH CHECK (true);

-- Logistics Ratings Policies
CREATE POLICY "Users can view ratings for their deliveries"
  ON logistics_ratings FOR SELECT
  USING (auth.uid() = rated_user_id OR auth.uid() = rater_user_id);

CREATE POLICY "Users can insert ratings"
  ON logistics_ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_logistics_owners_updated_at
  BEFORE UPDATE ON logistics_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_vehicles_updated_at
  BEFORE UPDATE ON logistics_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logistics_drivers_updated_at
  BEFORE UPDATE ON logistics_drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE logistics_drivers
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM logistics_ratings
    WHERE rated_user_id = NEW.rated_user_id AND role = 'driver'
  )
  WHERE user_id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update driver rating after new rating
CREATE TRIGGER update_driver_rating_trigger
  AFTER INSERT ON logistics_ratings
  FOR EACH ROW
  WHEN (NEW.role = 'driver')
  EXECUTE FUNCTION update_driver_rating();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View for owner dashboard stats
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

-- View for driver dashboard stats
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
-- SAMPLE DATA COMMENTS
-- =====================================================
-- To insert sample data, use the following format:
--
-- INSERT INTO logistics_owners (user_id, full_name, phone, kra_pin, area_of_operation, verified)
-- VALUES ('user-uuid', 'John Doe', '+254700000000', 'A000000000A', 'Nairobi', true);
--
-- INSERT INTO logistics_vehicles (owner_id, type, registration_number, color, capacity, ownership_type)
-- VALUES ('owner-uuid', 'Pickup', 'KXX 000X', 'White', '1 ton', 'owned');
--
-- INSERT INTO logistics_drivers (user_id, full_name, phone, selfie_uri, national_id_uri, driver_license_uri, license_class, verified)
-- VALUES ('user-uuid', 'Jane Smith', '+254700000001', 'selfie.jpg', 'id.jpg', 'license.jpg', 'BCE', true);
