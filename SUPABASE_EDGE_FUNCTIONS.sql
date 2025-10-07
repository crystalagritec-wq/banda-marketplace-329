-- =====================================================
-- BANDA AGRIPAY + TRADEGUARD EDGE FUNCTIONS
-- Auto-Release, Fraud Detection, and Dispute Resolution
-- =====================================================

-- =====================================================
-- 1. AUTO-RELEASE EXPIRED RESERVES
-- =====================================================

CREATE OR REPLACE FUNCTION auto_release_expired_reserves()
RETURNS TABLE(
  reserve_id UUID,
  status TEXT,
  message TEXT
) AS $$
DECLARE
  v_reserve RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_reserve IN
    SELECT id, reference_type, reference_id, total_amount
    FROM tradeguard_reserves
    WHERE status = 'held'
      AND auto_release_enabled = true
      AND auto_release_at <= NOW()
      AND proof_submitted = true
      AND buyer_confirmed = false
    ORDER BY auto_release_at ASC
    LIMIT 100
  LOOP
    BEGIN
      PERFORM release_reserve(v_reserve.id, NULL);
      
      v_count := v_count + 1;
      
      reserve_id := v_reserve.id;
      status := 'released';
      message := format('Auto-released reserve for %s %s (amount: %s)', 
                       v_reserve.reference_type, 
                       v_reserve.reference_id,
                       v_reserve.total_amount);
      RETURN NEXT;
      
      INSERT INTO wallet_transactions (
        wallet_id,
        type,
        amount,
        status,
        balance_before,
        balance_after,
        reserve_before,
        reserve_after,
        description
      )
      SELECT
        seller_wallet_id,
        'reserve_release',
        seller_amount,
        'completed',
        0, 0, 0, 0,
        'Auto-released after 72 hours'
      FROM tradeguard_reserves
      WHERE id = v_reserve.id;
      
    EXCEPTION WHEN OTHERS THEN
      reserve_id := v_reserve.id;
      status := 'error';
      message := format('Failed to auto-release: %s', SQLERRM);
      RETURN NEXT;
    END;
  END LOOP;
  
  IF v_count = 0 THEN
    reserve_id := NULL;
    status := 'no_action';
    message := 'No reserves eligible for auto-release';
    RETURN NEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FRAUD DETECTION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  wallet_id UUID REFERENCES agripay_wallets(id),
  
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'suspicious_volume', 'rapid_transactions', 'duplicate_qr',
    'location_mismatch', 'unusual_pattern', 'high_dispute_rate',
    'multiple_refunds', 'velocity_check_failed'
  )),
  
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  details JSONB NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_alerts_user_id ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity);

CREATE OR REPLACE FUNCTION detect_fraud()
RETURNS TABLE(
  alert_id UUID,
  user_id UUID,
  alert_type TEXT,
  severity TEXT,
  message TEXT
) AS $$
DECLARE
  v_user RECORD;
  v_alert_id UUID;
BEGIN
  FOR v_user IN
    SELECT 
      w.id as wallet_id,
      w.user_id,
      w.balance,
      w.daily_limit,
      COUNT(wt.id) as tx_count_today,
      SUM(CASE WHEN wt.type = 'deposit' THEN wt.amount ELSE 0 END) as deposits_today,
      SUM(CASE WHEN wt.type = 'withdrawal' THEN wt.amount ELSE 0 END) as withdrawals_today
    FROM agripay_wallets w
    LEFT JOIN wallet_transactions wt ON wt.wallet_id = w.id 
      AND wt.created_at >= CURRENT_DATE
    WHERE w.status = 'active'
    GROUP BY w.id, w.user_id, w.balance, w.daily_limit
  LOOP
    IF v_user.deposits_today > v_user.daily_limit THEN
      INSERT INTO fraud_alerts (user_id, wallet_id, alert_type, severity, details)
      VALUES (
        v_user.user_id,
        v_user.wallet_id,
        'suspicious_volume',
        'high',
        jsonb_build_object(
          'deposits_today', v_user.deposits_today,
          'daily_limit', v_user.daily_limit,
          'tx_count', v_user.tx_count_today
        )
      )
      RETURNING id INTO v_alert_id;
      
      UPDATE agripay_wallets
      SET status = 'suspended'
      WHERE id = v_user.wallet_id;
      
      alert_id := v_alert_id;
      user_id := v_user.user_id;
      alert_type := 'suspicious_volume';
      severity := 'high';
      message := format('Suspicious deposit volume: KES %s (limit: %s)', 
                       v_user.deposits_today, v_user.daily_limit);
      RETURN NEXT;
    END IF;
    
    IF v_user.tx_count_today > 50 THEN
      INSERT INTO fraud_alerts (user_id, wallet_id, alert_type, severity, details)
      VALUES (
        v_user.user_id,
        v_user.wallet_id,
        'rapid_transactions',
        'medium',
        jsonb_build_object(
          'tx_count_today', v_user.tx_count_today,
          'threshold', 50
        )
      )
      RETURNING id INTO v_alert_id;
      
      alert_id := v_alert_id;
      user_id := v_user.user_id;
      alert_type := 'rapid_transactions';
      severity := 'medium';
      message := format('Rapid transaction activity: %s transactions today', v_user.tx_count_today);
      RETURN NEXT;
    END IF;
  END LOOP;
  
  FOR v_user IN
    SELECT 
      u.id as user_id,
      COUNT(d.id) as dispute_count,
      COUNT(DISTINCT tr.id) as total_reserves
    FROM profiles u
    JOIN tradeguard_reserves tr ON tr.seller_id = u.id OR tr.buyer_id = u.id
    LEFT JOIN tradeguard_disputes d ON d.reserve_id = tr.id
    WHERE tr.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY u.id
    HAVING COUNT(d.id)::DECIMAL / NULLIF(COUNT(DISTINCT tr.id), 0) > 0.3
  LOOP
    INSERT INTO fraud_alerts (user_id, alert_type, severity, details)
    VALUES (
      v_user.user_id,
      'high_dispute_rate',
      'high',
      jsonb_build_object(
        'dispute_count', v_user.dispute_count,
        'total_reserves', v_user.total_reserves,
        'dispute_rate', (v_user.dispute_count::DECIMAL / v_user.total_reserves)
      )
    )
    RETURNING id INTO v_alert_id;
    
    alert_id := v_alert_id;
    user_id := v_user.user_id;
    alert_type := 'high_dispute_rate';
    severity := 'high';
    message := format('High dispute rate: %s disputes out of %s transactions', 
                     v_user.dispute_count, v_user.total_reserves);
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. DUPLICATE QR DETECTION
-- =====================================================

CREATE OR REPLACE FUNCTION detect_duplicate_qr_scans()
RETURNS TABLE(
  proof_id UUID,
  reserve_id UUID,
  qr_code_id TEXT,
  scan_count INTEGER,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as proof_id,
    p.reserve_id,
    p.qr_code_id,
    COUNT(*)::INTEGER as scan_count,
    format('QR code %s scanned %s times', p.qr_code_id, COUNT(*)) as message
  FROM tradeguard_proofs p
  WHERE p.proof_type = 'qr_scan'
    AND p.qr_code_id IS NOT NULL
    AND p.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY p.id, p.reserve_id, p.qr_code_id
  HAVING COUNT(*) > 1;
  
  FOR proof_id, reserve_id, qr_code_id, scan_count, message IN
    SELECT * FROM (
      SELECT 
        p.id,
        p.reserve_id,
        p.qr_code_id,
        COUNT(*)::INTEGER,
        format('QR code %s scanned %s times', p.qr_code_id, COUNT(*))
      FROM tradeguard_proofs p
      WHERE p.proof_type = 'qr_scan'
        AND p.qr_code_id IS NOT NULL
        AND p.created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY p.id, p.reserve_id, p.qr_code_id
      HAVING COUNT(*) > 1
    ) duplicates
  LOOP
    UPDATE tradeguard_proofs
    SET 
      anomaly_detected = true,
      anomaly_reason = 'Duplicate QR scan detected'
    WHERE id = proof_id;
    
    INSERT INTO fraud_alerts (user_id, alert_type, severity, details)
    SELECT
      tr.seller_id,
      'duplicate_qr',
      'high',
      jsonb_build_object(
        'qr_code_id', qr_code_id,
        'scan_count', scan_count,
        'reserve_id', reserve_id
      )
    FROM tradeguard_reserves tr
    WHERE tr.id = reserve_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. DISPUTE AUTO-RESOLUTION
-- =====================================================

CREATE OR REPLACE FUNCTION auto_resolve_disputes()
RETURNS TABLE(
  dispute_id UUID,
  resolution TEXT,
  message TEXT
) AS $$
DECLARE
  v_dispute RECORD;
  v_trust_score DECIMAL;
  v_resolution TEXT;
BEGIN
  FOR v_dispute IN
    SELECT 
      d.id,
      d.reserve_id,
      d.raised_by,
      d.against_user,
      d.reason,
      d.created_at,
      tr.total_amount,
      tr.buyer_id,
      tr.seller_id
    FROM tradeguard_disputes d
    JOIN tradeguard_reserves tr ON tr.id = d.reserve_id
    WHERE d.status = 'open'
      AND d.created_at < NOW() - INTERVAL '7 days'
      AND d.ai_recommendation IS NULL
    LIMIT 50
  LOOP
    SELECT trust_score INTO v_trust_score
    FROM user_trust_scores
    WHERE user_id = v_dispute.against_user;
    
    IF v_trust_score < 30 THEN
      v_resolution := 'refund_buyer';
    ELSIF v_trust_score > 70 THEN
      v_resolution := 'release_seller';
    ELSE
      v_resolution := 'escalated_to_admin';
    END IF;
    
    UPDATE tradeguard_disputes
    SET
      ai_recommendation = v_resolution,
      ai_confidence = CASE 
        WHEN v_trust_score < 30 OR v_trust_score > 70 THEN 85.00
        ELSE 50.00
      END,
      status = CASE 
        WHEN v_resolution = 'escalated_to_admin' THEN 'escalated'
        ELSE 'under_review'
      END,
      updated_at = NOW()
    WHERE id = v_dispute.id;
    
    dispute_id := v_dispute.id;
    resolution := v_resolution;
    message := format('AI recommendation: %s (trust score: %s)', v_resolution, v_trust_score);
    RETURN NEXT;
    
    IF v_resolution = 'refund_buyer' AND v_trust_score < 20 THEN
      PERFORM refund_reserve(v_dispute.reserve_id, 'Auto-resolved: Low trust score');
      
      UPDATE tradeguard_disputes
      SET
        status = 'resolved',
        resolution = 'refund_buyer',
        resolved_at = NOW(),
        resolution_details = 'Automatically refunded due to low seller trust score'
      WHERE id = v_dispute.id;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRUST SCORE UPDATE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_trust_score_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_wallet_id UUID;
BEGIN
  SELECT user_id, id INTO v_user_id, v_wallet_id
  FROM agripay_wallets
  WHERE id = NEW.wallet_id;
  
  IF NEW.type = 'reserve_release' AND NEW.status = 'completed' THEN
    UPDATE user_trust_scores
    SET
      total_transactions = total_transactions + 1,
      successful_transactions = successful_transactions + 1,
      trust_score = LEAST(100, trust_score + 0.5),
      updated_at = NOW()
    WHERE user_id = v_user_id;
  ELSIF NEW.type = 'reserve_refund' AND NEW.status = 'completed' THEN
    UPDATE user_trust_scores
    SET
      total_transactions = total_transactions + 1,
      disputed_transactions = disputed_transactions + 1,
      trust_score = GREATEST(0, trust_score - 2),
      updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trust_score ON wallet_transactions;
CREATE TRIGGER trigger_update_trust_score
AFTER INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_trust_score_on_transaction();

-- =====================================================
-- 6. SCHEDULED JOB SETUP (Run these via pg_cron or Edge Functions)
-- =====================================================

-- To be called every 15 minutes
-- SELECT * FROM auto_release_expired_reserves();

-- To be called every 6 hours
-- SELECT * FROM detect_fraud();

-- To be called every hour
-- SELECT * FROM detect_duplicate_qr_scans();

-- To be called daily
-- SELECT * FROM auto_resolve_disputes();

-- =====================================================
-- 7. ADMIN VIEWS FOR MONITORING
-- =====================================================

CREATE OR REPLACE VIEW vw_agripay_admin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM agripay_wallets WHERE status = 'active') as active_wallets,
  (SELECT COUNT(*) FROM agripay_wallets WHERE status = 'suspended') as suspended_wallets,
  (SELECT COUNT(*) FROM agripay_wallets WHERE status = 'frozen') as frozen_wallets,
  (SELECT SUM(balance) FROM agripay_wallets) as total_balance,
  (SELECT SUM(reserve_balance) FROM agripay_wallets) as total_reserves,
  (SELECT COUNT(*) FROM tradeguard_reserves WHERE status = 'held') as active_reserves,
  (SELECT COUNT(*) FROM tradeguard_disputes WHERE status = 'open') as open_disputes,
  (SELECT COUNT(*) FROM fraud_alerts WHERE status = 'open') as open_fraud_alerts,
  (SELECT COUNT(*) FROM payout_requests WHERE status = 'pending') as pending_payouts;

CREATE OR REPLACE VIEW vw_high_risk_users AS
SELECT
  u.id as user_id,
  u.email,
  u.phone_number,
  uts.trust_score,
  uts.disputed_transactions,
  uts.total_transactions,
  (uts.disputed_transactions::DECIMAL / NULLIF(uts.total_transactions, 0)) as dispute_rate,
  COUNT(fa.id) as fraud_alert_count,
  w.status as wallet_status
FROM profiles u
JOIN user_trust_scores uts ON uts.user_id = u.id
LEFT JOIN fraud_alerts fa ON fa.user_id = u.id AND fa.status = 'open'
LEFT JOIN agripay_wallets w ON w.user_id = u.id
WHERE uts.trust_score < 40
  OR (uts.disputed_transactions::DECIMAL / NULLIF(uts.total_transactions, 0)) > 0.3
GROUP BY u.id, u.email, u.phone_number, uts.trust_score, uts.disputed_transactions, 
         uts.total_transactions, w.status
ORDER BY uts.trust_score ASC, fraud_alert_count DESC;

-- =====================================================
-- END OF EDGE FUNCTIONS
-- =====================================================
