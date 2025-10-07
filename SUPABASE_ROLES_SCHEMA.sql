-- Banda User Roles & Verification System - Supabase SQL Schema
-- This file contains the complete database schema for the role-based access control system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type AS ENUM ('basic', 'seller', 'service_provider', 'logistics_provider', 'farmer');
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'service_provider', 'logistics_provider', 'farmer');
CREATE TYPE user_tier AS ENUM ('none', 'verified', 'gold', 'premium', 'elite');
CREATE TYPE verification_status AS ENUM ('unverified', 'ai_verified', 'human_verified', 'qr_verified', 'admin_approved');
CREATE TYPE verification_method AS ENUM ('ai_id', 'human_qr', 'admin_approval');
CREATE TYPE subscription_status AS ENUM ('none', 'active', 'expired', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Update existing users table to include role-based fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS user_type user_type DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS current_role user_role DEFAULT 'buyer',
ADD COLUMN IF NOT EXISTS tier user_tier DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'none',
ADD COLUMN IF NOT EXISTS item_limit INTEGER DEFAULT 0;

-- Create user_roles table for tracking multiple roles per user
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_type user_role NOT NULL,
    tier user_tier DEFAULT 'none',
    verification_status verification_status DEFAULT 'unverified',
    verification_method verification_method,
    verification_date TIMESTAMPTZ,
    item_limit INTEGER DEFAULT 0,
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one active role per user per role_type
    UNIQUE(user_id, role_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_type user_role NOT NULL,
    verification_method verification_method NOT NULL,
    document_urls TEXT[] DEFAULT '{}',
    status request_status DEFAULT 'pending',
    reviewer_id TEXT REFERENCES users(user_id),
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tier user_tier NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, end_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage user roles" ON user_roles
    FOR ALL USING (true); -- This will be restricted by application logic

-- Verification requests policies
CREATE POLICY "Users can view their own verification requests" ON verification_requests
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create verification requests" ON verification_requests
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins can manage verification requests" ON verification_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::text 
            AND current_role = 'admin'
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage subscriptions" ON subscriptions
    FOR ALL USING (true); -- This will be restricted by application logic

-- Functions for role management

-- Function to get user's current tier limits
CREATE OR REPLACE FUNCTION get_user_tier_limits(p_user_id TEXT, p_role user_role)
RETURNS TABLE(
    item_limit INTEGER,
    features TEXT[]
) AS $$
DECLARE
    user_tier user_tier;
BEGIN
    -- Get user's current tier for the role
    SELECT tier INTO user_tier
    FROM user_roles
    WHERE user_id = p_user_id 
    AND role_type = p_role 
    AND is_active = true
    LIMIT 1;
    
    -- If no role found, return default limits
    IF user_tier IS NULL THEN
        user_tier := 'none';
    END IF;
    
    -- Return limits based on role and tier
    CASE p_role
        WHEN 'seller' THEN
            CASE user_tier
                WHEN 'verified' THEN
                    RETURN QUERY SELECT 10, ARRAY['List up to 10 items', 'Basic seller dashboard'];
                WHEN 'gold' THEN
                    RETURN QUERY SELECT -1, ARRAY['Unlimited items', 'Local priority search', 'Seller analytics'];
                WHEN 'premium' THEN
                    RETURN QUERY SELECT -1, ARRAY['Unlimited items', 'Regional/national reach', 'Advanced analytics', 'Discounted logistics'];
                WHEN 'elite' THEN
                    RETURN QUERY SELECT -1, ARRAY['Multi-market/export access', 'Staff/agent accounts', 'Exclusive opportunities'];
                ELSE
                    RETURN QUERY SELECT 0, ARRAY[]::TEXT[];
            END CASE;
        WHEN 'service_provider' THEN
            CASE user_tier
                WHEN 'verified' THEN
                    RETURN QUERY SELECT 10, ARRAY['List services', 'Services dashboard'];
                WHEN 'gold' THEN
                    RETURN QUERY SELECT -1, ARRAY['Unlimited services', 'Local priority search'];
                WHEN 'premium' THEN
                    RETURN QUERY SELECT -1, ARRAY['Unlimited services', 'Regional/national reach'];
                WHEN 'elite' THEN
                    RETURN QUERY SELECT -1, ARRAY['Institutional access', 'Staff accounts'];
                ELSE
                    RETURN QUERY SELECT 0, ARRAY[]::TEXT[];
            END CASE;
        WHEN 'logistics_provider' THEN
            CASE user_tier
                WHEN 'verified' THEN
                    RETURN QUERY SELECT 10, ARRAY['Local deliveries only'];
                WHEN 'gold', 'premium' THEN
                    RETURN QUERY SELECT -1, ARRAY['Regional/national deliveries', 'Pooling requests'];
                WHEN 'elite' THEN
                    RETURN QUERY SELECT -1, ARRAY['Export + bulk contracts', 'Staff accounts'];
                ELSE
                    RETURN QUERY SELECT 0, ARRAY[]::TEXT[];
            END CASE;
        WHEN 'farmer' THEN
            CASE user_tier
                WHEN 'verified' THEN
                    RETURN QUERY SELECT 1, ARRAY['Farm records', 'Basic management tools'];
                WHEN 'gold', 'premium' THEN
                    RETURN QUERY SELECT -1, ARRAY['Advanced analytics', 'Advisory services'];
                WHEN 'elite' THEN
                    RETURN QUERY SELECT -1, ARRAY['Advanced analytics', 'Advisory services', 'Marketplace integration', 'Export access'];
                ELSE
                    RETURN QUERY SELECT 0, ARRAY[]::TEXT[];
            END CASE;
        ELSE
            RETURN QUERY SELECT 0, ARRAY['Browse marketplace', 'Make purchases'];
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_user_perform_action(p_user_id TEXT, p_action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
    user_tier user_tier;
    current_items INTEGER;
    max_items INTEGER;
BEGIN
    -- Get user's current role and tier
    SELECT current_role, tier INTO user_role, user_tier
    FROM users
    WHERE user_id = p_user_id;
    
    CASE p_action
        WHEN 'create_listing' THEN
            -- Check if user has seller role
            IF user_role != 'seller' THEN
                RETURN FALSE;
            END IF;
            
            -- Get item limits
            SELECT item_limit INTO max_items
            FROM get_user_tier_limits(p_user_id, user_role);
            
            -- If unlimited (-1), allow
            IF max_items = -1 THEN
                RETURN TRUE;
            END IF;
            
            -- Count current active items
            SELECT COUNT(*) INTO current_items
            FROM products
            WHERE user_id = p_user_id AND is_available = true;
            
            RETURN current_items < max_items;
            
        WHEN 'access_analytics' THEN
            -- Check if user's tier includes analytics
            RETURN EXISTS (
                SELECT 1 FROM get_user_tier_limits(p_user_id, user_role) 
                WHERE 'analytics' = ANY(features)
            );
            
        WHEN 'priority_support' THEN
            -- Check if user's tier includes priority support
            RETURN EXISTS (
                SELECT 1 FROM get_user_tier_limits(p_user_id, user_role) 
                WHERE 'Priority support' = ANY(features)
            );
            
        ELSE
            RETURN TRUE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade user role
CREATE OR REPLACE FUNCTION upgrade_user_role(
    p_user_id TEXT,
    p_role_type user_role,
    p_tier user_tier,
    p_verification_status verification_status,
    p_verification_method verification_method DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    tier_limits RECORD;
BEGIN
    -- Get tier limits
    SELECT * INTO tier_limits FROM get_user_tier_limits(p_user_id, p_role_type);
    
    -- Insert or update user role
    INSERT INTO user_roles (
        user_id, role_type, tier, verification_status, 
        verification_method, verification_date, item_limit, is_active
    )
    VALUES (
        p_user_id, p_role_type, p_tier, p_verification_status,
        p_verification_method, NOW(), tier_limits.item_limit, true
    )
    ON CONFLICT (user_id, role_type, is_active)
    DO UPDATE SET
        tier = p_tier,
        verification_status = p_verification_status,
        verification_method = p_verification_method,
        verification_date = NOW(),
        item_limit = tier_limits.item_limit,
        updated_at = NOW();
    
    -- Update user's current role and tier
    UPDATE users SET
        current_role = p_role_type,
        tier = p_tier,
        verification_status = p_verification_status,
        item_limit = tier_limits.item_limit,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default data for testing (optional)
-- This can be removed in production

-- Sample verification request statuses
COMMENT ON TYPE request_status IS 'Status of verification requests: pending, approved, rejected';
COMMENT ON TYPE verification_method IS 'Methods of verification: ai_id (AI ID check), human_qr (Human + QR verification), admin_approval (Admin approval)';
COMMENT ON TYPE user_tier IS 'User tiers: none (default), verified (AI verified), gold (Human+QR), premium (Human+QR), elite (Admin approved)';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a view for user role summary
CREATE OR REPLACE VIEW user_role_summary AS
SELECT 
    u.user_id,
    u.full_name,
    u.current_role,
    u.tier,
    u.verification_status,
    u.item_limit,
    ur.role_type,
    ur.is_active as role_active,
    ur.verification_date,
    ur.subscription_start,
    ur.subscription_end
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = true;

-- Grant access to the view
GRANT SELECT ON user_role_summary TO anon, authenticated;

COMMENT ON TABLE user_roles IS 'Tracks multiple roles per user with tier-based access control';
COMMENT ON TABLE verification_requests IS 'Manages verification requests for role upgrades';
COMMENT ON TABLE subscriptions IS 'Tracks user subscriptions for premium tiers';
COMMENT ON FUNCTION get_user_tier_limits IS 'Returns item limits and features for a user role and tier';
COMMENT ON FUNCTION can_user_perform_action IS 'Checks if user can perform specific actions based on their role and tier';
COMMENT ON FUNCTION upgrade_user_role IS 'Upgrades user to a new role and tier with proper limits';