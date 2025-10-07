-- =====================================================
-- WALLET DISPLAY ID MIGRATION
-- =====================================================
-- Adds 12-digit display ID and onboarding completion flag
-- Date: January 2025
-- =====================================================

-- Add display_id column to agripay_wallets
ALTER TABLE agripay_wallets 
ADD COLUMN IF NOT EXISTS display_id VARCHAR(12) UNIQUE;

-- Add onboarding_completed column
ALTER TABLE agripay_wallets 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for fast lookups by display_id
CREATE INDEX IF NOT EXISTS idx_agripay_wallets_display_id 
ON agripay_wallets(display_id);

-- Function to generate unique 12-digit display ID
CREATE OR REPLACE FUNCTION generate_wallet_display_id()
RETURNS VARCHAR(12) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  random_index INTEGER;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    result := '';
    FOR i IN 1..12 LOOP
      random_index := floor(random() * length(chars) + 1)::INTEGER;
      result := result || substring(chars FROM random_index FOR 1);
    END LOOP;
    
    SELECT NOT EXISTS(
      SELECT 1 FROM agripay_wallets WHERE display_id = result
    ) INTO is_unique;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing wallets with display IDs
UPDATE agripay_wallets 
SET display_id = generate_wallet_display_id()
WHERE display_id IS NULL;

-- Make display_id NOT NULL after populating existing records
ALTER TABLE agripay_wallets 
ALTER COLUMN display_id SET NOT NULL;

-- Update create_agripay_wallet function to include display_id
CREATE OR REPLACE FUNCTION create_agripay_wallet(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_wallet_id UUID;
  v_display_id VARCHAR(12);
BEGIN
  v_display_id := generate_wallet_display_id();
  
  INSERT INTO agripay_wallets (
    user_id,
    display_id,
    balance,
    reserve_balance,
    status,
    verification_level,
    daily_limit,
    transaction_limit,
    linked_methods,
    biometric_enabled,
    onboarding_completed
  ) VALUES (
    p_user_id,
    v_display_id,
    0,
    0,
    'active',
    'basic',
    150000,
    50000,
    '[]'::jsonb,
    false,
    true
  )
  RETURNING id INTO v_wallet_id;
  
  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add wallet_id to users table for quick reference
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES agripay_wallets(id);

-- Create index on users.wallet_id
CREATE INDEX IF NOT EXISTS idx_users_wallet_id 
ON users(wallet_id);

-- Function to link wallet to user profile
CREATE OR REPLACE FUNCTION link_wallet_to_user(p_user_id UUID, p_wallet_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET wallet_id = p_wallet_id 
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN agripay_wallets.display_id IS '12-digit user-facing wallet identifier';
COMMENT ON COLUMN agripay_wallets.onboarding_completed IS 'Flag to track if user has completed wallet onboarding';
COMMENT ON COLUMN users.wallet_id IS 'Reference to user AgriPay wallet';
