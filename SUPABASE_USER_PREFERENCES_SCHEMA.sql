-- User Preferences Table Schema
-- This table stores all user settings and preferences

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  push_enabled BOOLEAN DEFAULT true,
  push_orders BOOLEAN DEFAULT true,
  push_payments BOOLEAN DEFAULT true,
  push_promotions BOOLEAN DEFAULT false,
  push_security BOOLEAN DEFAULT true,
  push_messages BOOLEAN DEFAULT true,
  
  email_enabled BOOLEAN DEFAULT true,
  email_orders BOOLEAN DEFAULT true,
  email_payments BOOLEAN DEFAULT true,
  email_promotions BOOLEAN DEFAULT true,
  email_security BOOLEAN DEFAULT true,
  email_newsletter BOOLEAN DEFAULT false,
  
  sms_enabled BOOLEAN DEFAULT false,
  sms_orders BOOLEAN DEFAULT false,
  sms_payments BOOLEAN DEFAULT true,
  sms_security BOOLEAN DEFAULT true,
  
  -- Privacy Preferences
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_location BOOLEAN DEFAULT true,
  allow_messages_from_strangers BOOLEAN DEFAULT true,
  share_data_with_partners BOOLEAN DEFAULT false,
  activity_status BOOLEAN DEFAULT true,
  read_receipts BOOLEAN DEFAULT true,
  allow_tagging BOOLEAN DEFAULT true,
  
  -- Appearance Preferences
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  font_size TEXT DEFAULT 'default' CHECK (font_size IN ('small', 'default', 'large')),
  layout_density TEXT DEFAULT 'default' CHECK (layout_density IN ('compact', 'default', 'comfortable')),
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'KES',
  
  -- Accessibility Preferences
  screen_reader BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  large_text BOOLEAN DEFAULT false,
  low_data_mode BOOLEAN DEFAULT false,
  
  -- Security Preferences
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method TEXT CHECK (two_factor_method IN ('sms', 'app', 'email', NULL)),
  biometric_enabled BOOLEAN DEFAULT false,
  app_lock_enabled BOOLEAN DEFAULT false,
  app_lock_method TEXT CHECK (app_lock_method IN ('pin', 'pattern', 'none', NULL)),
  app_lock_pin TEXT,
  app_lock_pattern TEXT,
  session_timeout INTEGER DEFAULT 30,
  trusted_devices JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON user_preferences(created_at);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when a new user signs up
DROP TRIGGER IF EXISTS trigger_create_default_user_preferences ON auth.users;
CREATE TRIGGER trigger_create_default_user_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences();

-- Grant necessary permissions
GRANT ALL ON user_preferences TO authenticated;
GRANT ALL ON user_preferences TO service_role;
