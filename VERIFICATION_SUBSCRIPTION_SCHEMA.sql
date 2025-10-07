-- Additional schema for Verification & Subscription Dashboard
-- Run this after the main schema

-- Create wallet table
CREATE TABLE IF NOT EXISTS wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    trading_balance DECIMAL(12,2) DEFAULT 0.00,
    savings_balance DECIMAL(12,2) DEFAULT 0.00,
    reserve_balance DECIMAL(12,2) DEFAULT 0.00,
    total_earned DECIMAL(12,2) DEFAULT 0.00,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'subscription', 'reserve_hold', 'reserve_release')),
    amount DECIMAL(12,2) NOT NULL,
    balance_type TEXT NOT NULL CHECK (balance_type IN ('trading', 'savings', 'reserve')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method TEXT,
    reference_id TEXT, -- Order ID, subscription ID, etc.
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'passport', 'driving_license', 'business_permit', 'tax_certificate', 'bank_statement', 'utility_bill')),
    document_url TEXT NOT NULL,
    document_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_by TEXT REFERENCES users(user_id),
    verification_date TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name TEXT UNIQUE NOT NULL,
    tier_level INTEGER NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    yearly_price DECIMAL(10,2) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    payment_method TEXT,
    amount_paid DECIMAL(10,2) NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create market_insights table
CREATE TABLE IF NOT EXISTS market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    region TEXT NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    previous_price DECIMAL(10,2),
    trend TEXT CHECK (trend IN ('rising', 'falling', 'stable')),
    demand_level TEXT CHECK (demand_level IN ('low', 'medium', 'high')),
    supply_level TEXT CHECK (supply_level IN ('low', 'medium', 'high')),
    forecast JSONB DEFAULT '{}',
    ai_recommendation TEXT,
    data_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create qr_scan_logs table (if not exists)
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    qr_type TEXT NOT NULL CHECK (qr_type IN ('order', 'delivery', 'user', 'receipt', 'dispute')),
    qr_data TEXT NOT NULL,
    scan_result TEXT NOT NULL CHECK (scan_result IN ('success', 'failed', 'invalid')),
    location JSONB,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (tier_name, tier_level, monthly_price, yearly_price, features, limits) VALUES
('Basic', 1, 0.00, 0.00, 
 '{"marketplace_access": true, "basic_support": true, "standard_listings": true}',
 '{"max_listings": 5, "max_images_per_listing": 3, "ai_insights": false}'),
('Verified', 2, 500.00, 5000.00,
 '{"marketplace_access": true, "priority_support": true, "verified_badge": true, "basic_analytics": true}',
 '{"max_listings": 20, "max_images_per_listing": 5, "ai_insights": true, "featured_listings": 2}'),
('Gold', 3, 1500.00, 15000.00,
 '{"marketplace_access": true, "premium_support": true, "verified_badge": true, "advanced_analytics": true, "bulk_operations": true}',
 '{"max_listings": 100, "max_images_per_listing": 10, "ai_insights": true, "featured_listings": 10, "priority_placement": true}'),
('Premium', 4, 3000.00, 30000.00,
 '{"marketplace_access": true, "dedicated_support": true, "verified_badge": true, "advanced_analytics": true, "bulk_operations": true, "api_access": true}',
 '{"max_listings": 500, "max_images_per_listing": 15, "ai_insights": true, "featured_listings": 50, "priority_placement": true, "custom_branding": true}');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_region ON market_insights(region);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_user_id ON qr_scan_logs(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_wallet_updated_at BEFORE UPDATE ON wallet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_documents_updated_at BEFORE UPDATE ON verification_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON subscription_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_insights_updated_at BEFORE UPDATE ON market_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wallet" ON wallet
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own wallet" ON wallet
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage wallets" ON wallet
    FOR ALL USING (true);

CREATE POLICY "Users can view their own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage transactions" ON wallet_transactions
    FOR ALL USING (true);

CREATE POLICY "Users can view their own documents" ON verification_documents
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own documents" ON verification_documents
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage subscriptions" ON user_subscriptions
    FOR ALL USING (true);

CREATE POLICY "Anyone can view market insights" ON market_insights
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own QR logs" ON qr_scan_logs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can manage QR logs" ON qr_scan_logs
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON wallet TO anon, authenticated;
GRANT ALL ON wallet_transactions TO anon, authenticated;
GRANT ALL ON verification_documents TO anon, authenticated;
GRANT ALL ON subscription_tiers TO anon, authenticated;
GRANT ALL ON user_subscriptions TO anon, authenticated;
GRANT ALL ON market_insights TO anon, authenticated;
GRANT ALL ON qr_scan_logs TO anon, authenticated;