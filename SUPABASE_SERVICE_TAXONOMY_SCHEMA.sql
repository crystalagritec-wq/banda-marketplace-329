-- Banda Service Provider Labor & Skills Taxonomy Database Schema
-- Complete implementation of granular service taxonomy system
-- Date: 2026-01-05

-- ============================================================================
-- 1. SERVICE TAXONOMY MASTER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_taxonomy (
  id TEXT PRIMARY KEY,
  parent_category TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  specialization TEXT,
  icon TEXT,
  
  -- Service Type Metadata
  service_type TEXT CHECK (service_type IN ('Individual', 'Team', 'Company')),
  skill_level TEXT CHECK (skill_level IN ('Basic', 'Skilled', 'Expert', 'Master')),
  
  -- Requirements
  certification_required BOOLEAN DEFAULT false,
  license_required BOOLEAN DEFAULT false,
  insurance_required BOOLEAN DEFAULT false,
  
  -- Risk & Safety
  risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
  
  -- Booking Configuration
  booking_modes TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools_provided_by TEXT CHECK (tools_provided_by IN ('Client', 'Provider', 'Both')),
  
  -- Subscription Control
  minimum_tier TEXT CHECK (minimum_tier IN ('Basic', 'Professional', 'Business', 'Enterprise')) DEFAULT 'Basic',
  
  -- Admin Control
  requires_admin_approval BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_taxonomy_parent ON service_taxonomy(parent_category);
CREATE INDEX idx_service_taxonomy_category ON service_taxonomy(category);
CREATE INDEX idx_service_taxonomy_skill_level ON service_taxonomy(skill_level);
CREATE INDEX idx_service_taxonomy_risk_level ON service_taxonomy(risk_level);
CREATE INDEX idx_service_taxonomy_active ON service_taxonomy(is_active);

-- ============================================================================
-- 2. PROVIDER CERTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_taxonomy_id TEXT REFERENCES service_taxonomy(id),
  
  -- Certificate Details
  certification_type TEXT NOT NULL,
  certificate_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  
  -- Document
  document_url TEXT,
  document_type TEXT,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verification_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_certifications_provider ON provider_certifications(provider_id);
CREATE INDEX idx_provider_certifications_taxonomy ON provider_certifications(service_taxonomy_id);
CREATE INDEX idx_provider_certifications_status ON provider_certifications(verification_status);
CREATE INDEX idx_provider_certifications_expiry ON provider_certifications(expiry_date);

-- ============================================================================
-- 3. PROVIDER INSURANCE POLICIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- Policy Details
  policy_number TEXT NOT NULL,
  insurance_provider TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  coverage_amount DECIMAL(12, 2),
  coverage_description TEXT,
  
  -- Dates
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  
  -- Document
  document_url TEXT,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verification_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_insurance_provider ON provider_insurance(provider_id);
CREATE INDEX idx_provider_insurance_status ON provider_insurance(verification_status);
CREATE INDEX idx_provider_insurance_expiry ON provider_insurance(expiry_date);
CREATE INDEX idx_provider_insurance_active ON provider_insurance(is_active);

-- ============================================================================
-- 4. PROVIDER BACKGROUND CHECKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_background_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- Check Details
  check_type TEXT NOT NULL CHECK (check_type IN ('Criminal', 'Credit', 'Employment', 'Field Agent Verification', 'Reference Check')),
  check_provider TEXT,
  reference_number TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired')),
  result_summary TEXT,
  
  -- Dates
  requested_date DATE DEFAULT CURRENT_DATE,
  conducted_date DATE,
  expiry_date DATE,
  
  -- Document
  document_url TEXT,
  
  -- Verification
  conducted_by UUID REFERENCES profiles(id),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_background_checks_provider ON provider_background_checks(provider_id);
CREATE INDEX idx_provider_background_checks_status ON provider_background_checks(status);
CREATE INDEX idx_provider_background_checks_type ON provider_background_checks(check_type);

-- ============================================================================
-- 5. SERVICE APPROVAL QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_approval_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_post_id UUID REFERENCES service_marketplace_posts(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  service_taxonomy_id TEXT NOT NULL REFERENCES service_taxonomy(id),
  
  -- Approval Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'revision_required')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Review Details
  review_notes TEXT,
  rejection_reason TEXT,
  revision_requests JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_service_approval_queue_provider ON service_approval_queue(provider_id);
CREATE INDEX idx_service_approval_queue_status ON service_approval_queue(status);
CREATE INDEX idx_service_approval_queue_priority ON service_approval_queue(priority);
CREATE INDEX idx_service_approval_queue_assigned ON service_approval_queue(assigned_to);

-- ============================================================================
-- 6. SERVICE LOCKED FIELDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_locked_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_post_id UUID NOT NULL REFERENCES service_marketplace_posts(id) ON DELETE CASCADE,
  
  -- Locked Fields
  locked_fields JSONB DEFAULT '[]'::jsonb,
  lock_reason TEXT,
  
  -- Lock Control
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  locked_by UUID REFERENCES profiles(id),
  
  -- Unlock Request
  unlock_requested BOOLEAN DEFAULT false,
  unlock_reason TEXT,
  unlock_requested_at TIMESTAMPTZ,
  
  -- Unlock Approval
  unlock_approved BOOLEAN,
  unlock_approved_by UUID REFERENCES profiles(id),
  unlock_approved_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ
);

CREATE INDEX idx_service_locked_fields_post ON service_locked_fields(marketplace_post_id);
CREATE INDEX idx_service_locked_fields_unlock_requested ON service_locked_fields(unlock_requested);

-- ============================================================================
-- 7. PROVIDER LICENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_taxonomy_id TEXT REFERENCES service_taxonomy(id),
  
  -- License Details
  license_type TEXT NOT NULL,
  license_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  
  -- Document
  document_url TEXT,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired', 'suspended')),
  verification_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_licenses_provider ON provider_licenses(provider_id);
CREATE INDEX idx_provider_licenses_taxonomy ON provider_licenses(service_taxonomy_id);
CREATE INDEX idx_provider_licenses_status ON provider_licenses(verification_status);
CREATE INDEX idx_provider_licenses_expiry ON provider_licenses(expiry_date);

-- ============================================================================
-- 8. UPDATE EXISTING TABLES
-- ============================================================================

-- Add taxonomy reference to service_marketplace_posts
ALTER TABLE service_marketplace_posts 
ADD COLUMN IF NOT EXISTS service_taxonomy_id TEXT REFERENCES service_taxonomy(id),
ADD COLUMN IF NOT EXISTS admin_approval_status TEXT DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fields_locked BOOLEAN DEFAULT false;

-- Add taxonomy reference to service_specializations
ALTER TABLE service_specializations
ADD COLUMN IF NOT EXISTS service_taxonomy_id TEXT REFERENCES service_taxonomy(id);

-- ============================================================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-expire certifications
CREATE OR REPLACE FUNCTION check_certification_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
    NEW.verification_status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_certification_expiry
BEFORE INSERT OR UPDATE ON provider_certifications
FOR EACH ROW
EXECUTE FUNCTION check_certification_expiry();

-- Function to auto-expire insurance
CREATE OR REPLACE FUNCTION check_insurance_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date < CURRENT_DATE THEN
    NEW.verification_status := 'expired';
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_insurance_expiry
BEFORE INSERT OR UPDATE ON provider_insurance
FOR EACH ROW
EXECUTE FUNCTION check_insurance_expiry();

-- Function to auto-expire licenses
CREATE OR REPLACE FUNCTION check_license_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
    NEW.verification_status := 'expired';
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_license_expiry
BEFORE INSERT OR UPDATE ON provider_licenses
FOR EACH ROW
EXECUTE FUNCTION check_license_expiry();

-- Function to update service approval on post approval
CREATE OR REPLACE FUNCTION update_service_approval_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admin_approval_status = 'approved' AND OLD.admin_approval_status != 'approved' THEN
    UPDATE service_approval_queue
    SET status = 'approved', approved_at = NOW()
    WHERE marketplace_post_id = NEW.id AND status != 'approved';
    
    NEW.fields_locked := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_approval_status
BEFORE UPDATE ON service_marketplace_posts
FOR EACH ROW
EXECUTE FUNCTION update_service_approval_status();

-- ============================================================================
-- 10. VIEWS
-- ============================================================================

-- View: Provider verification status
CREATE OR REPLACE VIEW provider_verification_status AS
SELECT 
  sp.id as provider_id,
  sp.user_id,
  sp.business_name,
  sp.full_name,
  sp.verification_status as profile_status,
  
  -- Certifications
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.verification_status = 'verified') as verified_certifications,
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.verification_status = 'pending') as pending_certifications,
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.verification_status = 'expired') as expired_certifications,
  
  -- Insurance
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.verification_status = 'verified' AND pi.is_active = true) as active_insurance_policies,
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.expiry_date < CURRENT_DATE + INTERVAL '30 days') as expiring_soon_insurance,
  
  -- Licenses
  COUNT(DISTINCT pl.id) FILTER (WHERE pl.verification_status = 'verified' AND pl.is_active = true) as active_licenses,
  COUNT(DISTINCT pl.id) FILTER (WHERE pl.expiry_date < CURRENT_DATE + INTERVAL '30 days') as expiring_soon_licenses,
  
  -- Background Checks
  COUNT(DISTINCT pbc.id) FILTER (WHERE pbc.status = 'passed') as passed_background_checks,
  COUNT(DISTINCT pbc.id) FILTER (WHERE pbc.status = 'pending') as pending_background_checks,
  
  -- Overall Score (0-100)
  CASE 
    WHEN COUNT(DISTINCT pc.id) + COUNT(DISTINCT pi.id) + COUNT(DISTINCT pl.id) + COUNT(DISTINCT pbc.id) = 0 THEN 0
    ELSE (
      (COUNT(DISTINCT pc.id) FILTER (WHERE pc.verification_status = 'verified')::numeric * 25) +
      (COUNT(DISTINCT pi.id) FILTER (WHERE pi.verification_status = 'verified' AND pi.is_active = true)::numeric * 25) +
      (COUNT(DISTINCT pl.id) FILTER (WHERE pl.verification_status = 'verified' AND pl.is_active = true)::numeric * 25) +
      (COUNT(DISTINCT pbc.id) FILTER (WHERE pbc.status = 'passed')::numeric * 25)
    ) / (COUNT(DISTINCT pc.id) + COUNT(DISTINCT pi.id) + COUNT(DISTINCT pl.id) + COUNT(DISTINCT pbc.id))
  END as verification_score
  
FROM service_providers sp
LEFT JOIN provider_certifications pc ON sp.id = pc.provider_id
LEFT JOIN provider_insurance pi ON sp.id = pi.provider_id
LEFT JOIN provider_licenses pl ON sp.id = pl.provider_id
LEFT JOIN provider_background_checks pbc ON sp.id = pbc.provider_id
GROUP BY sp.id;

-- View: Service listings with taxonomy metadata
CREATE OR REPLACE VIEW service_listings_with_taxonomy AS
SELECT 
  smp.*,
  st.parent_category,
  st.category,
  st.sub_category,
  st.specialization,
  st.service_type,
  st.skill_level,
  st.certification_required,
  st.license_required,
  st.insurance_required,
  st.risk_level,
  st.booking_modes,
  st.tools_provided_by,
  st.minimum_tier,
  st.requires_admin_approval,
  
  -- Provider info
  sp.business_name,
  sp.full_name,
  sp.verification_status as provider_verification_status,
  sp.average_rating,
  sp.completed_requests,
  
  -- Verification counts
  pvs.verified_certifications,
  pvs.active_insurance_policies,
  pvs.active_licenses,
  pvs.verification_score
  
FROM service_marketplace_posts smp
LEFT JOIN service_taxonomy st ON smp.service_taxonomy_id = st.id
LEFT JOIN service_providers sp ON smp.provider_id = sp.id
LEFT JOIN provider_verification_status pvs ON sp.id = pvs.provider_id;

-- ============================================================================
-- 11. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE service_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locked_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_licenses ENABLE ROW LEVEL SECURITY;

-- Taxonomy: Public read
CREATE POLICY "Anyone can view active taxonomy"
  ON service_taxonomy FOR SELECT
  USING (is_active = true);

-- Certifications: Provider can manage their own
CREATE POLICY "Providers can view their certifications"
  ON provider_certifications FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can insert their certifications"
  ON provider_certifications FOR INSERT
  WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can update their certifications"
  ON provider_certifications FOR UPDATE
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Insurance: Provider can manage their own
CREATE POLICY "Providers can view their insurance"
  ON provider_insurance FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can insert their insurance"
  ON provider_insurance FOR INSERT
  WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can update their insurance"
  ON provider_insurance FOR UPDATE
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Background Checks: Provider can view their own
CREATE POLICY "Providers can view their background checks"
  ON provider_background_checks FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Approval Queue: Provider can view their own
CREATE POLICY "Providers can view their approval queue"
  ON service_approval_queue FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Licenses: Provider can manage their own
CREATE POLICY "Providers can view their licenses"
  ON provider_licenses FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can insert their licenses"
  ON provider_licenses FOR INSERT
  WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can update their licenses"
  ON provider_licenses FOR UPDATE
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- ============================================================================
-- 12. GRANTS
-- ============================================================================

GRANT SELECT ON service_taxonomy TO authenticated;
GRANT ALL ON provider_certifications TO authenticated;
GRANT ALL ON provider_insurance TO authenticated;
GRANT SELECT ON provider_background_checks TO authenticated;
GRANT SELECT ON service_approval_queue TO authenticated;
GRANT SELECT ON service_locked_fields TO authenticated;
GRANT ALL ON provider_licenses TO authenticated;

GRANT SELECT ON provider_verification_status TO authenticated;
GRANT SELECT ON service_listings_with_taxonomy TO authenticated;

-- ============================================================================
-- 13. COMMENTS
-- ============================================================================

COMMENT ON TABLE service_taxonomy IS 'Master taxonomy table for granular service categorization with metadata';
COMMENT ON TABLE provider_certifications IS 'Provider certifications linked to specific service specializations';
COMMENT ON TABLE provider_insurance IS 'Insurance policies required for high-risk services';
COMMENT ON TABLE provider_background_checks IS 'Background verification checks for trust and safety';
COMMENT ON TABLE service_approval_queue IS 'Admin approval workflow for high-risk or premium services';
COMMENT ON TABLE service_locked_fields IS 'Field locking after admin approval to prevent unauthorized changes';
COMMENT ON TABLE provider_licenses IS 'Professional licenses required for regulated services';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Next step: Seed service_taxonomy table with data from constants/service-taxonomy.ts
