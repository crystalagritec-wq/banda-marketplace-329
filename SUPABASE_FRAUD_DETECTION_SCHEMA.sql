-- =====================================================
-- BANDA AGRIPAY FRAUD DETECTION SYSTEM
-- =====================================================

-- Anomalies Table
CREATE TABLE IF NOT EXISTS agripay_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES agripay_wallets(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'transfer')),
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Risk Assessment
  risk_score INTEGER NOT NULL DEFAULT 0,
  anomalies JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'cleared', 'blocked')),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Action Taken
  action_taken TEXT CHECK (action_taken IN ('none', 'warning', 'temporary_block', 'permanent_block', 'manual_review')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agripay_anomalies_user_id ON agripay_anomalies(user_id);
CREATE INDEX idx_agripay_anomalies_wallet_id ON agripay_anomalies(wallet_id);
CREATE INDEX idx_agripay_anomalies_status ON agripay_anomalies(status);
CREATE INDEX idx_agripay_anomalies_risk_score ON agripay_anomalies(risk_score DESC);
CREATE INDEX idx_agripay_anomalies_detected_at ON agripay_anomalies(detected_at DESC);

-- =====================================================
-- FRAUD DETECTION RULES
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_detection_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('threshold', 'pattern', 'velocity', 'behavioral')),
  
  -- Rule Configuration
  config JSONB NOT NULL,
  
  -- Risk Scoring
  risk_weight INTEGER NOT NULL DEFAULT 10,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default fraud detection rules
INSERT INTO fraud_detection_rules (rule_name, rule_type, config, risk_weight, description) VALUES
('large_transaction', 'threshold', '{"max_amount": 100000, "currency": "KES"}'::jsonb, 30, 'Detects transactions exceeding KES 100,000'),
('rapid_transactions', 'velocity', '{"max_count": 10, "time_window_hours": 24}'::jsonb, 20, 'Detects more than 10 transactions in 24 hours'),
('multiple_deposits', 'velocity', '{"max_count": 3, "time_window_hours": 1, "transaction_type": "deposit"}'::jsonb, 25, 'Detects multiple deposits in 1 hour'),
('daily_withdrawal_limit', 'threshold', '{"max_daily_withdrawal": 50000}'::jsonb, 40, 'Detects daily withdrawal limit exceeded'),
('low_trust_score', 'behavioral', '{"min_trust_score": 30}'::jsonb, 15, 'Flags users with trust score below 30'),
('high_dispute_rate', 'behavioral', '{"max_disputes": 3}'::jsonb, 20, 'Flags users with more than 3 disputes');

-- =====================================================
-- FRAUD DETECTION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION check_fraud_patterns(
  p_user_id UUID,
  p_wallet_id UUID,
  p_transaction_type TEXT,
  p_amount DECIMAL
) RETURNS TABLE (
  is_suspicious BOOLEAN,
  risk_score INTEGER,
  anomalies JSONB
) AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_anomalies JSONB := '[]'::jsonb;
  v_wallet RECORD;
  v_trust_score RECORD;
  v_recent_tx_count INTEGER;
  v_recent_deposits INTEGER;
  v_daily_withdrawals DECIMAL;
BEGIN
  -- Get wallet details
  SELECT * INTO v_wallet
  FROM agripay_wallets
  WHERE id = p_wallet_id;
  
  -- Get trust score
  SELECT * INTO v_trust_score
  FROM user_trust_scores
  WHERE user_id = p_user_id;
  
  -- Check 1: Large transaction
  IF p_amount > v_wallet.transaction_limit THEN
    v_risk_score := v_risk_score + 30;
    v_anomalies := v_anomalies || jsonb_build_object('rule', 'large_transaction', 'severity', 'high');
  END IF;
  
  -- Check 2: Rapid transactions
  SELECT COUNT(*) INTO v_recent_tx_count
  FROM wallet_transactions
  WHERE wallet_id = p_wallet_id
    AND created_at >= NOW() - INTERVAL '24 hours';
  
  IF v_recent_tx_count > 10 THEN
    v_risk_score := v_risk_score + 20;
    v_anomalies := v_anomalies || jsonb_build_object('rule', 'rapid_transactions', 'severity', 'medium');
  END IF;
  
  -- Check 3: Multiple deposits
  IF p_transaction_type = 'deposit' THEN
    SELECT COUNT(*) INTO v_recent_deposits
    FROM wallet_transactions
    WHERE wallet_id = p_wallet_id
      AND type = 'deposit'
      AND created_at >= NOW() - INTERVAL '1 hour';
    
    IF v_recent_deposits >= 3 THEN
      v_risk_score := v_risk_score + 25;
      v_anomalies := v_anomalies || jsonb_build_object('rule', 'multiple_deposits', 'severity', 'high');
    END IF;
  END IF;
  
  -- Check 4: Daily withdrawal limit
  IF p_transaction_type = 'withdrawal' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_daily_withdrawals
    FROM wallet_transactions
    WHERE wallet_id = p_wallet_id
      AND type = 'withdrawal'
      AND created_at >= CURRENT_DATE;
    
    IF v_daily_withdrawals + p_amount > v_wallet.daily_limit THEN
      v_risk_score := v_risk_score + 40;
      v_anomalies := v_anomalies || jsonb_build_object('rule', 'daily_withdrawal_limit', 'severity', 'critical');
    END IF;
  END IF;
  
  -- Check 5: Low trust score
  IF v_trust_score.trust_score < 30 THEN
    v_risk_score := v_risk_score + 15;
    v_anomalies := v_anomalies || jsonb_build_object('rule', 'low_trust_score', 'severity', 'medium');
  END IF;
  
  -- Check 6: High dispute rate
  IF v_trust_score.disputed_transactions > 3 THEN
    v_risk_score := v_risk_score + 20;
    v_anomalies := v_anomalies || jsonb_build_object('rule', 'high_dispute_rate', 'severity', 'high');
  END IF;
  
  RETURN QUERY SELECT 
    v_risk_score > 50,
    v_risk_score,
    v_anomalies;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-detect fraud on transactions
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_fraud_detection()
RETURNS TRIGGER AS $$
DECLARE
  v_fraud_check RECORD;
BEGIN
  -- Run fraud detection
  SELECT * INTO v_fraud_check
  FROM check_fraud_patterns(
    (SELECT user_id FROM agripay_wallets WHERE id = NEW.wallet_id),
    NEW.wallet_id,
    NEW.type,
    NEW.amount
  );
  
  -- If suspicious, log anomaly
  IF v_fraud_check.is_suspicious THEN
    INSERT INTO agripay_anomalies (
      user_id,
      wallet_id,
      transaction_type,
      amount,
      risk_score,
      anomalies,
      status
    ) VALUES (
      (SELECT user_id FROM agripay_wallets WHERE id = NEW.wallet_id),
      NEW.wallet_id,
      NEW.type,
      NEW.amount,
      v_fraud_check.risk_score,
      v_fraud_check.anomalies,
      CASE 
        WHEN v_fraud_check.risk_score > 80 THEN 'blocked'
        WHEN v_fraud_check.risk_score > 50 THEN 'pending'
        ELSE 'cleared'
      END
    );
    
    -- Block transaction if risk score is very high
    IF v_fraud_check.risk_score > 80 THEN
      RAISE EXCEPTION 'Transaction blocked due to high fraud risk (score: %)', v_fraud_check.risk_score;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to wallet_transactions
CREATE TRIGGER trigger_detect_fraud_on_transaction
BEFORE INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_fraud_detection();

-- =====================================================
-- ADMIN QUERIES
-- =====================================================

-- View high-risk anomalies
CREATE OR REPLACE VIEW high_risk_anomalies AS
SELECT 
  a.*,
  u.email,
  u.phone_number,
  w.balance,
  w.status as wallet_status
FROM agripay_anomalies a
JOIN profiles u ON a.user_id = u.id
JOIN agripay_wallets w ON a.wallet_id = w.id
WHERE a.risk_score > 50
  AND a.status = 'pending'
ORDER BY a.risk_score DESC, a.detected_at DESC;

-- User fraud summary
CREATE OR REPLACE FUNCTION get_user_fraud_summary(p_user_id UUID)
RETURNS TABLE (
  total_anomalies INTEGER,
  high_risk_count INTEGER,
  avg_risk_score DECIMAL,
  last_anomaly_date TIMESTAMPTZ,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_anomalies,
    COUNT(*) FILTER (WHERE risk_score > 50)::INTEGER as high_risk_count,
    AVG(risk_score)::DECIMAL as avg_risk_score,
    MAX(detected_at) as last_anomaly_date,
    CASE 
      WHEN COUNT(*) FILTER (WHERE risk_score > 80 AND status = 'blocked') > 0 THEN 'blocked'
      WHEN COUNT(*) FILTER (WHERE risk_score > 50 AND status = 'pending') > 0 THEN 'under_review'
      ELSE 'clear'
    END as status
  FROM agripay_anomalies
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
