-- ============================================
-- BANDA WALLET SYSTEM - DATABASE FUNCTIONS
-- ============================================
-- Created: 2025-09-30
-- Purpose: Complete wallet management functions

-- ============================================
-- 1. AUTO-CREATE WALLET ON USER REGISTRATION
-- ============================================

CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallet (user_id, trading_balance, savings_balance, reserve_balance)
  VALUES (NEW.user_id, 0.00, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_create_wallet ON users;
CREATE TRIGGER trigger_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- ============================================
-- 2. GET USER WALLET BALANCE
-- ============================================

CREATE OR REPLACE FUNCTION get_user_wallet(p_user_id TEXT)
RETURNS TABLE (
  user_id TEXT,
  trading_balance DECIMAL,
  savings_balance DECIMAL,
  reserve_balance DECIMAL,
  total_balance DECIMAL,
  total_earned DECIMAL,
  total_spent DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.user_id,
    w.trading_balance,
    w.savings_balance,
    w.reserve_balance,
    (w.trading_balance + w.savings_balance) as total_balance,
    w.total_earned,
    w.total_spent,
    w.created_at,
    w.updated_at
  FROM wallet w
  WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. GET USER TRANSACTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_transactions(
  p_user_id TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  transaction_id TEXT,
  type TEXT,
  amount DECIMAL,
  balance_type TEXT,
  status TEXT,
  payment_method TEXT,
  reference_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.transaction_id,
    wt.type,
    wt.amount,
    wt.balance_type,
    wt.status,
    wt.payment_method,
    wt.reference_id,
    wt.description,
    wt.metadata,
    wt.created_at
  FROM wallet_transactions wt
  WHERE wt.user_id = p_user_id
  ORDER BY wt.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. UPDATE WALLET BALANCE (ATOMIC)
-- ============================================

CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_user_id TEXT,
  p_balance_type TEXT,
  p_amount DECIMAL,
  p_operation TEXT -- 'add' or 'subtract'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  -- Lock the row for update
  SELECT 
    CASE 
      WHEN p_balance_type = 'trading' THEN trading_balance
      WHEN p_balance_type = 'savings' THEN savings_balance
      WHEN p_balance_type = 'reserve' THEN reserve_balance
      ELSE 0
    END INTO v_current_balance
  FROM wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  -- Check if sufficient balance for subtraction
  IF p_operation = 'subtract' AND v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in % account. Available: %, Required: %', 
      p_balance_type, v_current_balance, p_amount;
  END IF;

  -- Update balance based on type
  IF p_balance_type = 'trading' THEN
    UPDATE wallet 
    SET trading_balance = trading_balance + (CASE WHEN p_operation = 'add' THEN p_amount ELSE -p_amount END),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_balance_type = 'savings' THEN
    UPDATE wallet 
    SET savings_balance = savings_balance + (CASE WHEN p_operation = 'add' THEN p_amount ELSE -p_amount END),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_balance_type = 'reserve' THEN
    UPDATE wallet 
    SET reserve_balance = reserve_balance + (CASE WHEN p_operation = 'add' THEN p_amount ELSE -p_amount END),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    RAISE EXCEPTION 'Invalid balance type: %', p_balance_type;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. HOLD RESERVE (ESCROW)
-- ============================================

CREATE OR REPLACE FUNCTION hold_reserve(
  p_user_id TEXT,
  p_order_id TEXT,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'Reserve hold for order'
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_trading_balance DECIMAL;
BEGIN
  -- Generate transaction ID
  v_transaction_id := 'RES_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  -- Check trading balance
  SELECT trading_balance INTO v_trading_balance
  FROM wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_trading_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  IF v_trading_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient trading balance. Available: %, Required: %', v_trading_balance, p_amount;
  END IF;

  -- Move from trading to reserve
  UPDATE wallet
  SET 
    trading_balance = trading_balance - p_amount,
    reserve_balance = reserve_balance + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, reference_id, description
  ) VALUES (
    p_user_id, v_transaction_id, 'reserve_hold', p_amount, 'reserve',
    'completed', p_order_id, p_description
  );

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. RELEASE RESERVE (COMPLETE ORDER)
-- ============================================

CREATE OR REPLACE FUNCTION release_reserve(
  p_user_id TEXT,
  p_order_id TEXT,
  p_amount DECIMAL,
  p_recipient_id TEXT,
  p_description TEXT DEFAULT 'Reserve released - Order completed'
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_reserve_balance DECIMAL;
BEGIN
  -- Generate transaction ID
  v_transaction_id := 'REL_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  -- Check reserve balance
  SELECT reserve_balance INTO v_reserve_balance
  FROM wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_reserve_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  IF v_reserve_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient reserve balance. Available: %, Required: %', v_reserve_balance, p_amount;
  END IF;

  -- Deduct from buyer's reserve
  UPDATE wallet
  SET 
    reserve_balance = reserve_balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Add to seller's trading balance
  UPDATE wallet
  SET 
    trading_balance = trading_balance + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_recipient_id;

  -- Log buyer transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, reference_id, description
  ) VALUES (
    p_user_id, v_transaction_id, 'reserve_release', p_amount, 'reserve',
    'completed', p_order_id, p_description
  );

  -- Log seller transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, reference_id, description
  ) VALUES (
    p_recipient_id, v_transaction_id || '_RECV', 'payment', p_amount, 'trading',
    'completed', p_order_id, 'Payment received for order'
  );

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. REFUND RESERVE (CANCEL/DISPUTE)
-- ============================================

CREATE OR REPLACE FUNCTION refund_reserve(
  p_user_id TEXT,
  p_order_id TEXT,
  p_amount DECIMAL,
  p_reason TEXT DEFAULT 'Order cancelled - Reserve refunded'
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_reserve_balance DECIMAL;
BEGIN
  -- Generate transaction ID
  v_transaction_id := 'REF_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  -- Check reserve balance
  SELECT reserve_balance INTO v_reserve_balance
  FROM wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_reserve_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  IF v_reserve_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient reserve balance. Available: %, Required: %', v_reserve_balance, p_amount;
  END IF;

  -- Move from reserve back to trading
  UPDATE wallet
  SET 
    reserve_balance = reserve_balance - p_amount,
    trading_balance = trading_balance + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, reference_id, description
  ) VALUES (
    p_user_id, v_transaction_id, 'refund', p_amount, 'trading',
    'completed', p_order_id, p_reason
  );

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. PROCESS DEPOSIT
-- ============================================

CREATE OR REPLACE FUNCTION process_deposit(
  p_user_id TEXT,
  p_amount DECIMAL,
  p_payment_method TEXT,
  p_external_ref TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
BEGIN
  -- Generate transaction ID
  v_transaction_id := 'DEP_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  -- Add to trading balance
  UPDATE wallet
  SET 
    trading_balance = trading_balance + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, payment_method, reference_id, description
  ) VALUES (
    p_user_id, v_transaction_id, 'deposit', p_amount, 'trading',
    'completed', p_payment_method, p_external_ref, 'Deposit via ' || p_payment_method
  );

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. PROCESS WITHDRAWAL
-- ============================================

CREATE OR REPLACE FUNCTION process_withdrawal(
  p_user_id TEXT,
  p_amount DECIMAL,
  p_recipient TEXT,
  p_withdrawal_method TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_trading_balance DECIMAL;
BEGIN
  -- Generate transaction ID
  v_transaction_id := 'WTH_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  -- Check trading balance
  SELECT trading_balance INTO v_trading_balance
  FROM wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_trading_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  IF v_trading_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient trading balance. Available: %, Required: %', v_trading_balance, p_amount;
  END IF;

  -- Deduct from trading balance
  UPDATE wallet
  SET 
    trading_balance = trading_balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, payment_method, reference_id, description
  ) VALUES (
    p_user_id, v_transaction_id, 'withdrawal', p_amount, 'trading',
    'processing', p_withdrawal_method, p_recipient, 'Withdrawal to ' || p_recipient
  );

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. INTERNAL TRANSFER (TRADING <-> SAVINGS)
-- ============================================

CREATE OR REPLACE FUNCTION internal_transfer(
  p_user_id TEXT,
  p_from_account TEXT,
  p_to_account TEXT,
  p_amount DECIMAL
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_source_balance DECIMAL;
BEGIN
  -- Validate accounts
  IF p_from_account NOT IN ('trading', 'savings') OR p_to_account NOT IN ('trading', 'savings') THEN
    RAISE EXCEPTION 'Invalid account type. Must be trading or savings';
  END IF;

  IF p_from_account = p_to_account THEN
    RAISE EXCEPTION 'Cannot transfer to the same account';
  END IF;

  -- Generate transaction ID
  v_transaction_id := 'TRF_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  -- Check source balance
  SELECT 
    CASE 
      WHEN p_from_account = 'trading' THEN trading_balance
      WHEN p_from_account = 'savings' THEN savings_balance
    END INTO v_source_balance
  FROM wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_source_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  IF v_source_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in % account. Available: %, Required: %', 
      p_from_account, v_source_balance, p_amount;
  END IF;

  -- Perform transfer
  IF p_from_account = 'trading' AND p_to_account = 'savings' THEN
    UPDATE wallet
    SET 
      trading_balance = trading_balance - p_amount,
      savings_balance = savings_balance + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_from_account = 'savings' AND p_to_account = 'trading' THEN
    UPDATE wallet
    SET 
      savings_balance = savings_balance - p_amount,
      trading_balance = trading_balance + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Log transaction
  INSERT INTO wallet_transactions (
    user_id, transaction_id, type, amount, balance_type, 
    status, description
  ) VALUES (
    p_user_id, v_transaction_id, 'transfer', p_amount, p_to_account,
    'completed', 'Transfer from ' || p_from_account || ' to ' || p_to_account
  );

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_transaction_id ON wallet_transactions(transaction_id);

-- ============================================
-- 12. ADD BALANCE CONSTRAINTS
-- ============================================

ALTER TABLE wallet 
  DROP CONSTRAINT IF EXISTS check_trading_balance_positive,
  DROP CONSTRAINT IF EXISTS check_savings_balance_positive,
  DROP CONSTRAINT IF EXISTS check_reserve_balance_positive;

ALTER TABLE wallet 
  ADD CONSTRAINT check_trading_balance_positive CHECK (trading_balance >= 0),
  ADD CONSTRAINT check_savings_balance_positive CHECK (savings_balance >= 0),
  ADD CONSTRAINT check_reserve_balance_positive CHECK (reserve_balance >= 0);

-- ============================================
-- WALLET FUNCTIONS CREATED SUCCESSFULLY ✅
-- ============================================
