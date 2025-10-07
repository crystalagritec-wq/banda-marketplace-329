-- Banda Logistics Management System Schema
-- Run this in your Supabase SQL Editor

-- Logistics Providers Table
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
  current_location JSONB, -- {lat, lng, address}
  service_areas TEXT[], -- Array of areas they serve
  vehicle_capacity INTEGER DEFAULT 1, -- Number of orders they can handle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Assignments Table
CREATE TABLE IF NOT EXISTS logistics_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES logistics_providers(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'delivered', 'cancelled')) DEFAULT 'pending',
  pooled BOOLEAN DEFAULT false,
  route JSONB, -- Optimized route data with stops, distances, etc.
  eta INTERVAL, -- Estimated time of arrival
  pickup_location JSONB, -- {lat, lng, address}
  delivery_location JSONB, -- {lat, lng, address}
  distance_km FLOAT,
  estimated_duration INTEGER, -- in minutes
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Escrow Table (holds buyer funds until delivery confirmed)
CREATE TABLE IF NOT EXISTS logistics_escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES logistics_providers(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status TEXT CHECK (status IN ('held', 'released', 'disputed', 'refunded')) DEFAULT 'held',
  held_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics QR Codes Table (for delivery verification)
CREATE TABLE IF NOT EXISTS logistics_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Payouts Table (provider earnings)
CREATE TABLE IF NOT EXISTS logistics_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES logistics_providers(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES logistics_assignments(id) ON DELETE CASCADE,
  gross_amount NUMERIC(10,2) NOT NULL CHECK (gross_amount >= 0),
  banda_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (banda_fee >= 0),
  net_amount NUMERIC(10,2) NOT NULL CHECK (net_amount >= 0),
  status TEXT CHECK (status IN ('pending', 'processing', 'paid', 'failed')) DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Withdrawals Table (provider withdrawal requests)
CREATE TABLE IF NOT EXISTS logistics_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES logistics_providers(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'bank_transfer', 'paypal')) NOT NULL,
  account_details JSONB NOT NULL, -- {accountNumber, accountName, bankCode}
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logistics Route Optimization Table (AI-generated routes)
CREATE TABLE IF NOT EXISTS logistics_route_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES logistics_providers(id) ON DELETE CASCADE,
  order_ids UUID[] NOT NULL,
  optimized_route JSONB NOT NULL, -- AI-generated route with stops, distances, times
  total_distance_km FLOAT,
  estimated_duration INTEGER, -- in minutes
  fuel_cost_estimate NUMERIC(8,2),
  efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  is_pooled BOOLEAN DEFAULT false,
  pooling_discount NUMERIC(4,2) DEFAULT 0, -- Percentage discount for pooled deliveries
  status TEXT CHECK (status IN ('generated', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery History View (for buyers)
CREATE OR REPLACE VIEW delivery_history AS
SELECT 
  o.id as order_id,
  o.buyer_id,
  o.seller_id,
  o.total_amount,
  a.id as assignment_id,
  a.status,
  a.pooled,
  a.eta,
  a.distance_km,
  a.pickup_location,
  a.delivery_location,
  p.name as provider_name,
  p.vehicle_type,
  p.rating as provider_rating,
  py.net_amount as delivery_cost,
  py.status as payment_status,
  a.created_at,
  a.actual_delivery_time
FROM orders o
LEFT JOIN logistics_assignments a ON o.id = a.order_id
LEFT JOIN logistics_providers p ON a.provider_id = p.id
LEFT JOIN logistics_payouts py ON py.assignment_id = a.id;

-- Provider Performance View
CREATE OR REPLACE VIEW provider_performance AS
SELECT 
  p.id,
  p.name,
  p.vehicle_type,
  p.rating,
  p.total_deliveries,
  COUNT(a.id) as active_assignments,
  COUNT(CASE WHEN a.status = 'delivered' THEN 1 END) as completed_deliveries,
  COUNT(CASE WHEN a.pooled = true THEN 1 END) as pooled_deliveries,
  AVG(py.net_amount) as average_earning_per_delivery,
  SUM(CASE WHEN py.status = 'pending' THEN py.net_amount ELSE 0 END) as pending_earnings,
  SUM(CASE WHEN py.status = 'paid' THEN py.net_amount ELSE 0 END) as total_earnings
FROM logistics_providers p
LEFT JOIN logistics_assignments a ON p.id = a.provider_id
LEFT JOIN logistics_payouts py ON py.assignment_id = a.id
GROUP BY p.id, p.name, p.vehicle_type, p.rating, p.total_deliveries;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logistics_assignments_provider_id ON logistics_assignments(provider_id);
CREATE INDEX IF NOT EXISTS idx_logistics_assignments_order_id ON logistics_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_assignments_status ON logistics_assignments(status);
CREATE INDEX IF NOT EXISTS idx_logistics_escrows_assignment_id ON logistics_escrows(assignment_id);
CREATE INDEX IF NOT EXISTS idx_logistics_qr_codes_code ON logistics_qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_logistics_qr_codes_assignment_id ON logistics_qr_codes(assignment_id);
CREATE INDEX IF NOT EXISTS idx_logistics_payouts_provider_id ON logistics_payouts(provider_id);
CREATE INDEX IF NOT EXISTS idx_logistics_payouts_status ON logistics_payouts(status);
CREATE INDEX IF NOT EXISTS idx_logistics_withdrawals_provider_id ON logistics_withdrawals(provider_id);
CREATE INDEX IF NOT EXISTS idx_logistics_withdrawals_status ON logistics_withdrawals(status);

-- Row Level Security (RLS) Policies
ALTER TABLE logistics_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_route_optimizations ENABLE ROW LEVEL SECURITY;

-- Providers can only see their own data
CREATE POLICY "Providers can view own data" ON logistics_providers
  FOR ALL USING (auth.uid() = user_id);

-- Assignments can be viewed by provider, buyer, or seller
CREATE POLICY "Assignment access" ON logistics_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM logistics_providers lp WHERE lp.id = provider_id AND lp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

-- Escrows can be viewed by buyer, provider, or seller
CREATE POLICY "Escrow access" ON logistics_escrows
  FOR ALL USING (
    buyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM logistics_providers lp WHERE lp.id = provider_id AND lp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM orders o WHERE o.id = order_id AND o.seller_id = auth.uid()
    )
  );

-- QR codes can be viewed by provider and buyer
CREATE POLICY "QR code access" ON logistics_qr_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM logistics_assignments la 
      JOIN logistics_providers lp ON la.provider_id = lp.id
      WHERE la.id = assignment_id AND lp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM logistics_assignments la
      JOIN orders o ON la.order_id = o.id
      WHERE la.id = assignment_id AND o.buyer_id = auth.uid()
    )
  );

-- Payouts can only be viewed by the provider
CREATE POLICY "Payout access" ON logistics_payouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM logistics_providers lp WHERE lp.id = provider_id AND lp.user_id = auth.uid()
    )
  );

-- Withdrawals can only be viewed by the provider
CREATE POLICY "Withdrawal access" ON logistics_withdrawals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM logistics_providers lp WHERE lp.id = provider_id AND lp.user_id = auth.uid()
    )
  );

-- Route optimizations can be viewed by the provider
CREATE POLICY "Route optimization access" ON logistics_route_optimizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM logistics_providers lp WHERE lp.id = provider_id AND lp.user_id = auth.uid()
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE logistics_providers 
    SET total_deliveries = total_deliveries + 1,
        updated_at = NOW()
    WHERE id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_stats
  AFTER UPDATE ON logistics_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_stats();

-- Function to calculate Banda fee (10% of gross amount)
CREATE OR REPLACE FUNCTION calculate_banda_fee(gross_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(gross_amount * 0.10, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-expire QR codes
CREATE OR REPLACE FUNCTION expire_old_qr_codes()
RETURNS void AS $$
BEGIN
  UPDATE logistics_qr_codes 
  SET verified = true 
  WHERE expires_at < NOW() AND verified = false;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to expire QR codes (run every hour)
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('expire-qr-codes', '0 * * * *', 'SELECT expire_old_qr_codes();');

COMMENT ON TABLE logistics_providers IS 'Stores information about delivery providers (drivers, couriers, etc.)';
COMMENT ON TABLE logistics_assignments IS 'Tracks delivery assignments and their status';
COMMENT ON TABLE logistics_escrows IS 'Holds buyer funds in escrow until delivery is confirmed';
COMMENT ON TABLE logistics_qr_codes IS 'QR codes for delivery verification';
COMMENT ON TABLE logistics_payouts IS 'Provider earnings and payout information';
COMMENT ON TABLE logistics_withdrawals IS 'Provider withdrawal requests';
COMMENT ON TABLE logistics_route_optimizations IS 'AI-optimized delivery routes';