-- ============================================
-- COMPLETE BANDA SUPABASE DATABASE SCHEMA
-- All tables required by backend tRPC routes
-- ============================================

-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- CORE USER & PROFILE TABLES
-- ============================================

-- Users table (managed by Supabase Auth)
-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    location_lat DECIMAL,
    location_lng DECIMAL,
    location_label TEXT,
    location_address TEXT,
    location_city TEXT,
    location_county TEXT,
    location_county_id TEXT,
    location_sub_county TEXT,
    location_sub_county_id TEXT,
    location_ward TEXT,
    location_ward_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_location ON profiles(location_lat, location_lng);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    location_sharing BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    county TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default);

-- User activities
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);

-- ============================================
-- MARKETPLACE & PRODUCTS
-- ============================================

-- Marketplace products
CREATE TABLE IF NOT EXISTS marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    vendor_display_name TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    negotiable BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'unit',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    location_lat DECIMAL NOT NULL,
    location_lng DECIMAL NOT NULL,
    location_label TEXT,
    location_address TEXT,
    location_city TEXT,
    location_county TEXT,
    location_county_id TEXT,
    location_sub_county TEXT,
    location_sub_county_id TEXT,
    location_ward TEXT,
    location_ward_id TEXT,
    reward_points INTEGER DEFAULT 0,
    is_draft BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_marketplace_products_user ON marketplace_products(user_id);
CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX idx_marketplace_products_location ON marketplace_products(location_lat, location_lng);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    variant_type TEXT NOT NULL,
    price_modifier DECIMAL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- CART & CHECKOUT
-- ============================================

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_variety TEXT,
    added_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- Saved for later
CREATE TABLE IF NOT EXISTS saved_for_later (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_saved_for_later_user ON saved_for_later(user_id);

-- Cart analytics
CREATE TABLE IF NOT EXISTS cart_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_analytics_user ON cart_analytics(user_id);
CREATE INDEX idx_cart_analytics_type ON cart_analytics(event_type);

-- ============================================
-- ORDERS
-- ============================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id),
    driver_id UUID,
    tracking_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    delivery_provider TEXT,
    delivery_fee DECIMAL DEFAULT 0,
    subtotal DECIMAL NOT NULL,
    total DECIMAL NOT NULL,
    delivery_address JSONB,
    delivery_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking ON orders(tracking_id);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES marketplace_products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ============================================
-- WALLET & PAYMENTS (AgriPay)
-- ============================================

-- AgriPay wallets
CREATE TABLE IF NOT EXISTS agripay_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id TEXT UNIQUE NOT NULL,
    display_id TEXT UNIQUE NOT NULL,
    balance DECIMAL DEFAULT 0,
    reserved_balance DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_agripay_wallets_user ON agripay_wallets(user_id);
CREATE INDEX idx_agripay_wallets_wallet_id ON agripay_wallets(wallet_id);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES agripay_wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    balance_before DECIMAL NOT NULL,
    balance_after DECIMAL NOT NULL,
    reference TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);

-- Wallet PINs
CREATE TABLE IF NOT EXISTS wallet_pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- TradeGuard reserves
CREATE TABLE IF NOT EXISTS tradeguard_reserves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'held',
    held_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tradeguard_reserves_order ON tradeguard_reserves(order_id);
CREATE INDEX idx_tradeguard_reserves_status ON tradeguard_reserves(status);

-- ============================================
-- LOGISTICS
-- ============================================

-- Logistics owners
CREATE TABLE IF NOT EXISTS logistics_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_registration TEXT NOT NULL,
    tax_id TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    logo_uri TEXT,
    verified BOOLEAN DEFAULT false,
    verification_documents JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_logistics_owners_user ON logistics_owners(user_id);

-- Logistics drivers
CREATE TABLE IF NOT EXISTS logistics_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES logistics_owners(id),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    selfie_uri TEXT,
    national_id_uri TEXT,
    driver_license_uri TEXT,
    license_class TEXT,
    allow_discovery BOOLEAN DEFAULT true,
    availability TEXT DEFAULT 'idle',
    current_location_lat DECIMAL,
    current_location_lng DECIMAL,
    heading DECIMAL,
    speed_kmh DECIMAL,
    verified BOOLEAN DEFAULT false,
    verification_documents JSONB,
    rating DECIMAL DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_logistics_drivers_user ON logistics_drivers(user_id);
CREATE INDEX idx_logistics_drivers_owner ON logistics_drivers(owner_id);
CREATE INDEX idx_logistics_drivers_availability ON logistics_drivers(availability);

-- Logistics vehicles
CREATE TABLE IF NOT EXISTS logistics_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES logistics_owners(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    make TEXT,
    model TEXT,
    year INTEGER,
    capacity_kg DECIMAL,
    insurance_uri TEXT,
    logbook_uri TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logistics_vehicles_owner ON logistics_vehicles(owner_id);

-- Logistics assignments
CREATE TABLE IF NOT EXISTS logistics_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    vehicle_id UUID REFERENCES logistics_vehicles(id),
    status TEXT DEFAULT 'assigned',
    pickup_location JSONB,
    delivery_location JSONB,
    distance_km DECIMAL,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    delivery_fee DECIMAL,
    proof_of_delivery TEXT,
    assigned_at TIMESTAMP DEFAULT NOW(),
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logistics_assignments_order ON logistics_assignments(order_id);
CREATE INDEX idx_logistics_assignments_driver ON logistics_assignments(driver_id);
CREATE INDEX idx_logistics_assignments_status ON logistics_assignments(status);

-- Logistics providers (legacy/alternative table)
CREATE TABLE IF NOT EXISTS logistics_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES logistics_drivers(id),
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_type TEXT,
    current_location_lat DECIMAL,
    current_location_lng DECIMAL,
    availability TEXT DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Logistics payouts
CREATE TABLE IF NOT EXISTS logistics_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    assignment_id UUID REFERENCES logistics_assignments(id),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);

CREATE INDEX idx_logistics_payouts_driver ON logistics_payouts(driver_id);
CREATE INDEX idx_logistics_payouts_status ON logistics_payouts(status);

-- Logistics earnings
CREATE TABLE IF NOT EXISTS logistics_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    assignment_id UUID REFERENCES logistics_assignments(id),
    amount DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logistics_earnings_driver ON logistics_earnings(driver_id);

-- Logistics withdrawals
CREATE TABLE IF NOT EXISTS logistics_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    account_details TEXT,
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_logistics_withdrawals_driver ON logistics_withdrawals(driver_id);

-- Logistics escrows
CREATE TABLE IF NOT EXISTS logistics_escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES logistics_assignments(id),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'held',
    held_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP
);

CREATE INDEX idx_logistics_escrows_assignment ON logistics_escrows(assignment_id);

-- Logistics QR codes
CREATE TABLE IF NOT EXISTS logistics_qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES logistics_assignments(id),
    qr_code TEXT NOT NULL UNIQUE,
    qr_type TEXT NOT NULL,
    scanned BOOLEAN DEFAULT false,
    scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_logistics_qr_codes_assignment ON logistics_qr_codes(assignment_id);
CREATE INDEX idx_logistics_qr_codes_code ON logistics_qr_codes(qr_code);

-- Logistics ratings
CREATE TABLE IF NOT EXISTS logistics_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES logistics_assignments(id),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
    timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
    care_of_goods INTEGER CHECK (care_of_goods >= 1 AND care_of_goods <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(assignment_id, user_id)
);

CREATE INDEX idx_logistics_ratings_driver ON logistics_ratings(driver_id);

-- Driver location history
CREATE TABLE IF NOT EXISTS driver_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id) ON DELETE CASCADE,
    location_lat DECIMAL NOT NULL,
    location_lng DECIMAL NOT NULL,
    heading DECIMAL,
    speed_kmh DECIMAL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_location_history_driver ON driver_location_history(driver_id);
CREATE INDEX idx_driver_location_history_time ON driver_location_history(recorded_at);

-- ============================================
-- SERVICE PROVIDERS
-- ============================================

-- Service providers
CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL,
    full_name TEXT,
    id_number TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    profile_photo TEXT,
    business_name TEXT,
    registration_number TEXT,
    tax_id TEXT,
    contact_person TEXT,
    organization_email TEXT,
    logo TEXT,
    service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    discoverable BOOLEAN DEFAULT true,
    instant_requests BOOLEAN DEFAULT false,
    payment_method TEXT,
    account_details TEXT,
    terms_accepted BOOLEAN DEFAULT false,
    profile_completion INTEGER DEFAULT 0,
    id_document TEXT,
    license TEXT,
    certificates TEXT[] DEFAULT ARRAY[]::TEXT[],
    verified BOOLEAN DEFAULT false,
    rating DECIMAL DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_service_providers_user ON service_providers(user_id);
CREATE INDEX idx_service_providers_discoverable ON service_providers(discoverable);

-- Service types
CREATE TABLE IF NOT EXISTS service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    service_category TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_types_provider ON service_types(provider_id);

-- Service specializations
CREATE TABLE IF NOT EXISTS service_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    years_experience INTEGER,
    certification TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_specializations_provider ON service_specializations(provider_id);

-- Service equipment
CREATE TABLE IF NOT EXISTS service_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    equipment_name TEXT NOT NULL,
    equipment_type TEXT,
    quantity INTEGER DEFAULT 1,
    condition TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_equipment_provider ON service_equipment(provider_id);

-- Service marketplace posts
CREATE TABLE IF NOT EXISTS service_marketplace_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL,
    price DECIMAL,
    price_type TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_marketplace_posts_provider ON service_marketplace_posts(provider_id);
CREATE INDEX idx_service_marketplace_posts_status ON service_marketplace_posts(status);

-- Service marketplace listings (view or alternative)
CREATE TABLE IF NOT EXISTS service_marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    service_category TEXT NOT NULL,
    price DECIMAL,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Service requests
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    provider_id UUID REFERENCES service_providers(id),
    service_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    location_lat DECIMAL,
    location_lng DECIMAL,
    scheduled_date TIMESTAMP,
    estimated_hours DECIMAL,
    budget DECIMAL,
    status TEXT DEFAULT 'pending',
    proof_of_completion TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_provider ON service_requests(provider_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- Service proofs
CREATE TABLE IF NOT EXISTS service_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    image_url TEXT NOT NULL,
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_proofs_request ON service_proofs(service_request_id);

-- Service ratings
CREATE TABLE IF NOT EXISTS service_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id UUID NOT NULL REFERENCES service_requests(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_request_id, user_id)
);

CREATE INDEX idx_service_ratings_provider ON service_ratings(provider_id);

-- Service provider dashboard (view or materialized view)
CREATE TABLE IF NOT EXISTS service_provider_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    total_requests INTEGER DEFAULT 0,
    completed_requests INTEGER DEFAULT 0,
    pending_requests INTEGER DEFAULT 0,
    total_earnings DECIMAL DEFAULT 0,
    average_rating DECIMAL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DELIVERY TRACKING
-- ============================================

-- Delivery tracking
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES logistics_drivers(id),
    current_location_lat DECIMAL,
    current_location_lng DECIMAL,
    status TEXT,
    estimated_arrival TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_tracking_order ON delivery_tracking(order_id);

-- Driver tips
CREATE TABLE IF NOT EXISTS driver_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_tips_driver ON driver_tips(driver_id);

-- ============================================
-- LOYALTY & REWARDS
-- ============================================

-- Loyalty points
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_loyalty_points_user ON loyalty_points(user_id);

-- Loyalty transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    reference TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_user ON loyalty_transactions(user_id);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Reward redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reward_redemptions_user ON reward_redemptions(user_id);

-- ============================================
-- VERIFICATION & SUBSCRIPTIONS
-- ============================================

-- Verification requests
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- ============================================
-- PROMOTIONS & MARKETING
-- ============================================

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL,
    discount_value DECIMAL NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_vendor ON promotions(vendor_id);
CREATE INDEX idx_promotions_status ON promotions(status);

-- ============================================
-- SEARCH & ANALYTICS
-- ============================================

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}'::jsonb,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);

-- Trending searches
CREATE TABLE IF NOT EXISTS trending_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL UNIQUE,
    search_count INTEGER DEFAULT 1,
    last_searched TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trending_searches_count ON trending_searches(search_count DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- Push notifications
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);

-- ============================================
-- LEGACY/ALTERNATIVE TABLES
-- ============================================

-- Shops (if using separate shop system)
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    tier TEXT DEFAULT 'unverified',
    verification_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Shop products (if using separate from marketplace_products)
CREATE TABLE IF NOT EXISTS shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shop_products_shop ON shop_products(shop_id);

-- Shop verifications
CREATE TABLE IF NOT EXISTS shop_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    business_registration TEXT NOT NULL,
    tax_id TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    id_document_url TEXT NOT NULL,
    business_license_url TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT
);

CREATE INDEX idx_shop_verifications_shop ON shop_verifications(shop_id);

-- Products (legacy/alternative)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Wallet (legacy/alternative)
CREATE TABLE IF NOT EXISTS wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Product policies view (if needed)
CREATE TABLE IF NOT EXISTS product_policies_view (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES marketplace_products(id),
    policy_type TEXT,
    policy_text TEXT
);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agripay_wallets_updated_at BEFORE UPDATE ON agripay_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO order_status_history (order_id, status, created_at)
        VALUES (NEW.id, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agripay_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() = seller_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_marketplace_products_category_status ON marketplace_products(category, status);
CREATE INDEX idx_logistics_assignments_driver_status ON logistics_assignments(driver_id, status);
CREATE INDEX idx_service_requests_provider_status ON service_requests(provider_id, status);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- All tables created successfully
SELECT 'Banda Supabase Schema Created Successfully!' AS status;
