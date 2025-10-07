-- =====================================================
-- BANDA AGRIPAY + TRADEGUARD FINANCIAL SYSTEM SCHEMA
-- Complete Wallet, Reserve, and Dispute Management
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. AGRIPAY WALLETS
-- =====================================================

CREATE TABLE IF NOT EXISTS agripay_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Balances
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  reserve_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  
  -- Wallet Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'frozen', 'closed')),
  verification_level TEXT NOT NULL DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'premium')),
  
  -- Limits
  daily_limit DECIMAL(12, 2) DEFAULT 50000.00,
  transaction_limit DECIMAL(12, 2) DEFAULT 20000.00,
  
  -- Linked Payment Methods
  linked_methods JSONB DEFAULT '[]'::jsonb,
  
  -- Security
  pin_hash TEXT,
  biometric_enabled BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_transaction_at TIMESTAMPTZ,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_agripay_wallets_user_id ON agripay_wallets(user_id);
CREATE INDEX idx_agripay_wallets_status ON agripay_wallets(status);

-- =====================================================
-- 2. WALLET TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES agripay_wallets(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type TEXT NOT NULL CHECK (type IN (
    'deposit', 'withdrawal', 'payment', 'refund', 
    'reserve_hold', 'reserve_release', 'reserve_refund',
    'transfer_in', 'transfer_out', 'fee', 'commission'
  )),
  
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  
  -- Balance Snapshots
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  reserve_before DECIMAL(12, 2) NOT NULL,
  reserve_after DECIMAL(12, 2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  
  -- References
  reference_type TEXT CHECK (reference_type IN ('order', 'service', 'delivery', 'subscription', 'dispute')),
  reference_id TEXT,
  
  -- Payment Method
  payment_method JSONB,
  
  -- External References
  external_transaction_id TEXT,
  external_provider TEXT,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  notes TEXT
);

CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- =====================================================
-- 3. TRADEGUARD RESERVES
-- =====================================================

CREATE TABLE IF NOT EXISTS tradeguard_reserves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Parties
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES profiles(id),
  
  -- Wallets
  buyer_wallet_id UUID NOT NULL REFERENCES agripay_wallets(id),
  seller_wallet_id UUID NOT NULL REFERENCES agripay_wallets(id),
  driver_wallet_id UUID REFERENCES agripay_wallets(id),
  
  -- Transaction Reference
  transaction_id UUID NOT NULL REFERENCES wallet_transactions(id),
  reference_type TEXT NOT NULL CHECK (reference_type IN ('order', 'service', 'delivery')),
  reference_id TEXT NOT NULL,
  
  -- Amounts
  total_amount DECIMAL(12, 2) NOT NULL,
  seller_amount DECIMAL(12, 2) NOT NULL,
  driver_amount DECIMAL(12, 2) DEFAULT 0.00,
  platform_fee DECIMAL(12, 2) DEFAULT 0.00,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN (
    'held', 'released', 'refunded', 'disputed', 'partial_release', 'expired'
  )),
  
  -- Auto-Release Timer
  auto_release_at TIMESTAMPTZ,
  auto_release_enabled BOOLEAN DEFAULT true,
  
  -- Proof & Verification
  proof_submitted BOOLEAN DEFAULT false,
  proof_verified BOOLEAN DEFAULT false,
  proof_data JSONB DEFAULT '{}'::jsonb,
  
  -- Buyer Confirmation
  buyer_confirmed BOOLEAN DEFAULT false,
  buyer_confirmed_at TIMESTAMPTZ,
  
  -- Release Details
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES profiles(id),
  release_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tradeguard_reserves_buyer_id ON tradeguard_reserves(buyer_id);
CREATE INDEX idx_tradeguard_reserves_seller_id ON tradeguard_reserves(seller_id);
CREATE INDEX idx_tradeguard_reserves_status ON tradeguard_reserves(status);
CREATE INDEX idx_tradeguard_reserves_reference ON tradeguard_reserves(reference_type, reference_id);
CREATE INDEX idx_tradeguard_reserves_auto_release ON tradeguard_reserves(auto_release_at) WHERE status = 'held';

-- =====================================================
-- 4. TRADEGUARD PROOFS
-- =====================================================

CREATE TABLE IF NOT EXISTS tradeguard_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserve_id UUID NOT NULL REFERENCES tradeguard_reserves(id) ON DELETE CASCADE,
  
  -- Proof Type
  proof_type TEXT NOT NULL CHECK (proof_type IN ('qr_scan', 'gps_location', 'photo', 'signature', 'otp')),
  
  -- Proof Data
  proof_data JSONB NOT NULL,
  
  -- QR Specific
  qr_code_id TEXT,
  qr_scan_timestamp TIMESTAMPTZ,
  
  -- GPS Specific
  gps_coordinates JSONB,
  gps_accuracy DECIMAL(10, 2),
  
  -- Photo Specific
  photo_url TEXT,
  photo_hash TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  verification_method TEXT,
  
  -- Anomaly Detection
  anomaly_detected BOOLEAN DEFAULT false,
  anomaly_reason TEXT,
  
  -- Metadata
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  device_info JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tradeguard_proofs_reserve_id ON tradeguard_proofs(reserve_id);
CREATE INDEX idx_tradeguard_proofs_type ON tradeguard_proofs(proof_type);
CREATE INDEX idx_tradeguard_proofs_qr_code ON tradeguard_proofs(qr_code_id);

-- =====================================================
-- 5. TRADEGUARD DISPUTES
-- =====================================================

CREATE TABLE IF NOT EXISTS tradeguard_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserve_id UUID NOT NULL REFERENCES tradeguard_reserves(id) ON DELETE CASCADE,
  
  -- Parties
  raised_by UUID NOT NULL REFERENCES profiles(id),
  against_user UUID NOT NULL REFERENCES profiles(id),
  
  -- Dispute Details
  reason TEXT NOT NULL CHECK (reason IN (
    'product_mismatch', 'damaged_goods', 'wrong_quantity', 
    'late_delivery', 'no_delivery', 'quality_issue',
    'service_incomplete', 'payment_issue', 'other'
  )),
  description TEXT NOT NULL,
  
  -- Evidence
  evidence JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'awaiting_response', 
    'resolved', 'closed', 'escalated'
  )),
  
  -- Resolution
  resolution TEXT CHECK (resolution IN (
    'refund_buyer', 'release_seller', 'partial_refund', 
    'no_action', 'escalated_to_admin'
  )),
  resolution_details TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  
  -- AI Analysis
  ai_recommendation TEXT,
  ai_confidence DECIMAL(5, 2),
  
  -- Response from other party
  response TEXT,
  response_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tradeguard_disputes_reserve_id ON tradeguard_disputes(reserve_id);
CREATE INDEX idx_tradeguard_disputes_raised_by ON tradeguard_disputes(raised_by);
CREATE INDEX idx_tradeguard_disputes_status ON tradeguard_disputes(status);

-- =====================================================
-- 6. USER TRUST SCORES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_trust_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Trust Score (0-100)
  trust_score DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
  
  -- Transaction Stats
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  disputed_transactions INTEGER DEFAULT 0,
  resolved_disputes INTEGER DEFAULT 0,
  
  -- Ratings
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  
  -- Behavior Flags
  late_deliveries INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  refund_requests INTEGER DEFAULT 0,
  
  -- Verification
  identity_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  
  -- Badges
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Last Updated
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_trust_scores_user_id ON user_trust_scores(user_id);
CREATE INDEX idx_user_trust_scores_trust_score ON user_trust_scores(trust_score DESC);

-- =====================================================
-- 7. PAYOUT REQUESTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES agripay_wallets(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Amount
  amount DECIMAL(12, 2) NOT NULL,
  fee DECIMAL(12, 2) DEFAULT 0.00,
  net_amount DECIMAL(12, 2) NOT NULL,
  
  -- Destination
  payout_method TEXT NOT NULL CHECK (payout_method IN ('mpesa', 'bank', 'card')),
  payout_details JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  
  -- External Reference
  external_transaction_id TEXT,
  external_provider TEXT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Failure Details
  failure_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payout_requests_wallet_id ON payout_requests(wallet_id);
CREATE INDEX idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);

-- =====================================================
-- 8. WALLET VERIFICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES agripay_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Verification Level
  current_level TEXT NOT NULL DEFAULT 'basic',
  requested_level TEXT,
  
  -- Documents
  id_number TEXT,
  id_type TEXT,
  id_document_url TEXT,
  
  kra_pin TEXT,
  kra_document_url TEXT,
  
  selfie_url TEXT,
  
  -- Business (for vendors)
  business_registration TEXT,
  business_document_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'rejected', 'expired'
  )),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  UNIQUE(wallet_id)
);

CREATE INDEX idx_wallet_verification_wallet_id ON wallet_verification(wallet_id);
CREATE INDEX idx_wallet_verification_status ON wallet_verification(status);

-- =====================================================
-- 9. FUNCTIONS
-- =====================================================

-- Function: Create Wallet
CREATE OR REPLACE FUNCTION create_agripay_wallet(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  INSERT INTO agripay_wallets (user_id)
  VALUES (p_user_id)
  RETURNING id INTO v_wallet_id;
  
  INSERT INTO user_trust_scores (user_id)
  VALUES (p_user_id);
  
  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Hold Reserve
CREATE OR REPLACE FUNCTION hold_reserve(
  p_buyer_wallet_id UUID,
  p_seller_wallet_id UUID,
  p_amount DECIMAL,
  p_reference_type TEXT,
  p_reference_id TEXT
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_reserve_id UUID;
  v_buyer_balance DECIMAL;
BEGIN
  SELECT balance INTO v_buyer_balance
  FROM agripay_wallets
  WHERE id = p_buyer_wallet_id
  FOR UPDATE;
  
  IF v_buyer_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  INSERT INTO wallet_transactions (
    wallet_id, type, amount, status,
    balance_before, balance_after,
    reserve_before, reserve_after,
    reference_type, reference_id
  )
  SELECT 
    p_buyer_wallet_id,
    'reserve_hold',
    p_amount,
    'completed',
    balance,
    balance - p_amount,
    reserve_balance,
    reserve_balance + p_amount,
    p_reference_type,
    p_reference_id
  FROM agripay_wallets
  WHERE id = p_buyer_wallet_id
  RETURNING id INTO v_transaction_id;
  
  UPDATE agripay_wallets
  SET 
    balance = balance - p_amount,
    reserve_balance = reserve_balance + p_amount,
    updated_at = NOW()
  WHERE id = p_buyer_wallet_id;
  
  INSERT INTO tradeguard_reserves (
    buyer_id, seller_id,
    buyer_wallet_id, seller_wallet_id,
    transaction_id, reference_type, reference_id,
    total_amount, seller_amount,
    auto_release_at
  )
  SELECT
    w1.user_id, w2.user_id,
    p_buyer_wallet_id, p_seller_wallet_id,
    v_transaction_id, p_reference_type, p_reference_id,
    p_amount, p_amount * 0.95,
    NOW() + INTERVAL '72 hours'
  FROM agripay_wallets w1, agripay_wallets w2
  WHERE w1.id = p_buyer_wallet_id AND w2.id = p_seller_wallet_id
  RETURNING id INTO v_reserve_id;
  
  RETURN v_reserve_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Release Reserve
CREATE OR REPLACE FUNCTION release_reserve(
  p_reserve_id UUID,
  p_released_by UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_reserve RECORD;
BEGIN
  SELECT * INTO v_reserve
  FROM tradeguard_reserves
  WHERE id = p_reserve_id AND status = 'held'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserve not found or already released';
  END IF;
  
  UPDATE agripay_wallets
  SET
    reserve_balance = reserve_balance - v_reserve.total_amount,
    updated_at = NOW()
  WHERE id = v_reserve.buyer_wallet_id;
  
  UPDATE agripay_wallets
  SET
    balance = balance + v_reserve.seller_amount,
    updated_at = NOW()
  WHERE id = v_reserve.seller_wallet_id;
  
  IF v_reserve.driver_wallet_id IS NOT NULL THEN
    UPDATE agripay_wallets
    SET
      balance = balance + v_reserve.driver_amount,
      updated_at = NOW()
    WHERE id = v_reserve.driver_wallet_id;
  END IF;
  
  UPDATE tradeguard_reserves
  SET
    status = 'released',
    released_at = NOW(),
    released_by = p_released_by,
    updated_at = NOW()
  WHERE id = p_reserve_id;
  
  INSERT INTO wallet_transactions (
    wallet_id, type, amount, status,
    balance_before, balance_after,
    reserve_before, reserve_after,
    reference_type, reference_id
  )
  SELECT
    v_reserve.seller_wallet_id,
    'reserve_release',
    v_reserve.seller_amount,
    'completed',
    balance - v_reserve.seller_amount,
    balance,
    reserve_balance,
    reserve_balance,
    v_reserve.reference_type,
    v_reserve.reference_id
  FROM agripay_wallets
  WHERE id = v_reserve.seller_wallet_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Refund Reserve
CREATE OR REPLACE FUNCTION refund_reserve(
  p_reserve_id UUID,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_reserve RECORD;
BEGIN
  SELECT * INTO v_reserve
  FROM tradeguard_reserves
  WHERE id = p_reserve_id AND status IN ('held', 'disputed')
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserve not found or cannot be refunded';
  END IF;
  
  UPDATE agripay_wallets
  SET
    balance = balance + v_reserve.total_amount,
    reserve_balance = reserve_balance - v_reserve.total_amount,
    updated_at = NOW()
  WHERE id = v_reserve.buyer_wallet_id;
  
  UPDATE tradeguard_reserves
  SET
    status = 'refunded',
    release_reason = p_reason,
    released_at = NOW(),
    updated_at = NOW()
  WHERE id = p_reserve_id;
  
  INSERT INTO wallet_transactions (
    wallet_id, type, amount, status,
    balance_before, balance_after,
    reserve_before, reserve_after,
    reference_type, reference_id,
    description
  )
  SELECT
    v_reserve.buyer_wallet_id,
    'reserve_refund',
    v_reserve.total_amount,
    'completed',
    balance - v_reserve.total_amount,
    balance,
    reserve_balance + v_reserve.total_amount,
    reserve_balance,
    v_reserve.reference_type,
    v_reserve.reference_id,
    p_reason
  FROM agripay_wallets
  WHERE id = v_reserve.buyer_wallet_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_timestamp
BEFORE UPDATE ON agripay_wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

CREATE TRIGGER trigger_update_reserve_timestamp
BEFORE UPDATE ON tradeguard_reserves
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- =====================================================
-- 11. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE agripay_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradeguard_reserves ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradeguard_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallet_owner_policy ON agripay_wallets
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY transaction_owner_policy ON wallet_transactions
  FOR SELECT USING (
    wallet_id IN (SELECT id FROM agripay_wallets WHERE user_id = auth.uid())
  );

CREATE POLICY reserve_participant_policy ON tradeguard_reserves
  FOR SELECT USING (
    buyer_id = auth.uid() OR seller_id = auth.uid() OR driver_id = auth.uid()
  );

CREATE POLICY dispute_participant_policy ON tradeguard_disputes
  FOR SELECT USING (
    raised_by = auth.uid() OR against_user = auth.uid()
  );

-- =====================================================
-- END OF SCHEMA
-- =====================================================
