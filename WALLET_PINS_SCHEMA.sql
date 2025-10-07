-- ============================================
-- WALLET PIN MANAGEMENT SCHEMA
-- ============================================

CREATE TABLE IF NOT EXISTS wallet_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_wallet_pins_user_id ON wallet_pins(user_id);

-- Function to reset PIN
CREATE OR REPLACE FUNCTION reset_wallet_pin(
  p_user_id TEXT,
  p_new_pin_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE wallet_pins
  SET 
    pin_hash = p_new_pin_hash,
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment failed attempts
CREATE OR REPLACE FUNCTION increment_pin_failed_attempts(
  p_user_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_failed_attempts INTEGER;
BEGIN
  UPDATE wallet_pins
  SET 
    failed_attempts = failed_attempts + 1,
    locked_until = CASE 
      WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
      ELSE locked_until
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING failed_attempts INTO v_failed_attempts;

  RETURN v_failed_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed attempts on successful PIN entry
CREATE OR REPLACE FUNCTION reset_pin_failed_attempts(
  p_user_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE wallet_pins
  SET 
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
