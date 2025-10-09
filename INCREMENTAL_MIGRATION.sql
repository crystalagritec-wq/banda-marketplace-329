-- ============================================
-- INCREMENTAL MIGRATION SCRIPT
-- Safely adds missing tables and columns
-- Preserves all existing data
-- ============================================

-- Enable PostGIS extension (required for location features)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location_county_id') THEN
        ALTER TABLE profiles ADD COLUMN location_county_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location_sub_county') THEN
        ALTER TABLE profiles ADD COLUMN location_sub_county TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location_sub_county_id') THEN
        ALTER TABLE profiles ADD COLUMN location_sub_county_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location_ward') THEN
        ALTER TABLE profiles ADD COLUMN location_ward TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location_ward_id') THEN
        ALTER TABLE profiles ADD COLUMN location_ward_id TEXT;
    END IF;
END $$;

-- Add missing columns to marketplace_products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='vendor_display_name') THEN
        ALTER TABLE marketplace_products ADD COLUMN vendor_display_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='location_county_id') THEN
        ALTER TABLE marketplace_products ADD COLUMN location_county_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='location_sub_county') THEN
        ALTER TABLE marketplace_products ADD COLUMN location_sub_county TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='location_sub_county_id') THEN
        ALTER TABLE marketplace_products ADD COLUMN location_sub_county_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='location_ward') THEN
        ALTER TABLE marketplace_products ADD COLUMN location_ward TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='location_ward_id') THEN
        ALTER TABLE marketplace_products ADD COLUMN location_ward_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='reward_points') THEN
        ALTER TABLE marketplace_products ADD COLUMN reward_points INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_products' AND column_name='sales_velocity') THEN
        ALTER TABLE marketplace_products ADD COLUMN sales_velocity DECIMAL DEFAULT 0;
    END IF;
END $$;

-- Add missing columns to shops
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='verification_status') THEN
        ALTER TABLE shops ADD COLUMN verification_status TEXT DEFAULT 'unverified';
    END IF;
END $$;

-- Add missing columns to deliveries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='payout_status') THEN
        ALTER TABLE deliveries ADD COLUMN payout_status TEXT DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='payout_request_id') THEN
        ALTER TABLE deliveries ADD COLUMN payout_request_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deliveries' AND column_name='tracking_number') THEN
        ALTER TABLE deliveries ADD COLUMN tracking_number TEXT UNIQUE;
    END IF;
END $$;

-- Add missing columns to logistics_drivers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logistics_drivers' AND column_name='heading') THEN
        ALTER TABLE logistics_drivers ADD COLUMN heading DECIMAL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logistics_drivers' AND column_name='speed_kmh') THEN
        ALTER TABLE logistics_drivers ADD COLUMN speed_kmh DECIMAL;
    END IF;
END $$;

-- Add missing columns to service_requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='scheduled_date') THEN
        ALTER TABLE service_requests ADD COLUMN scheduled_date TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_requests' AND column_name='estimated_hours') THEN
        ALTER TABLE service_requests ADD COLUMN estimated_hours DECIMAL;
    END IF;
END $$;

-- ============================================
-- STEP 2: CREATE MISSING TABLES
-- ============================================

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

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

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

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

CREATE INDEX IF NOT EXISTS idx_shop_verifications_shop ON shop_verifications(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_verifications_status ON shop_verifications(status);

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

CREATE INDEX IF NOT EXISTS idx_service_proofs_request ON service_proofs(service_request_id);

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

CREATE INDEX IF NOT EXISTS idx_service_ratings_provider ON service_ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_rating ON service_ratings(rating);

-- Delivery proofs
CREATE TABLE IF NOT EXISTS delivery_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    image_url TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    signature_url TEXT,
    notes TEXT,
    delivered_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_proofs_delivery ON delivery_proofs(delivery_id);

-- Driver ratings
CREATE TABLE IF NOT EXISTS driver_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    driver_id UUID NOT NULL REFERENCES logistics_drivers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
    timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
    care_of_goods INTEGER CHECK (care_of_goods >= 1 AND care_of_goods <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(delivery_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver ON driver_ratings(driver_id);

-- Payout requests
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES logistics_drivers(id),
    service_provider_id UUID REFERENCES service_providers(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    account_details JSON NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES auth.users(id),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_driver ON payout_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_service_provider ON payout_requests(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);

-- Vehicle status history
CREATE TABLE IF NOT EXISTS vehicle_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES logistics_vehicles(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_status_history_vehicle ON vehicle_status_history(vehicle_id);

-- Delivery status history
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_status_history_delivery ON delivery_status_history(delivery_id);

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

CREATE INDEX IF NOT EXISTS idx_driver_location_history_driver ON driver_location_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_location_history_time ON driver_location_history(recorded_at);

-- Service provider availability
CREATE TABLE IF NOT EXISTS service_provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available BOOLEAN DEFAULT true,
    time_slots JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_provider_id, date)
);

CREATE INDEX IF NOT EXISTS idx_service_availability_provider ON service_provider_availability(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_service_availability_date ON service_provider_availability(date);

-- Admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSON DEFAULT '{}'::json,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- Push notifications (if not exists)
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

CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);

-- ============================================
-- STEP 3: CREATE/UPDATE TRIGGERS
-- ============================================

-- Auto-update delivery status history
CREATE OR REPLACE FUNCTION log_delivery_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO delivery_status_history (delivery_id, status, timestamp)
        VALUES (NEW.id, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_delivery_status ON deliveries;
CREATE TRIGGER trigger_log_delivery_status
AFTER UPDATE OF status ON deliveries
FOR EACH ROW
EXECUTE FUNCTION log_delivery_status_change();

-- Auto-calculate product sales velocity
CREATE OR REPLACE FUNCTION update_product_sales_velocity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_products
    SET sales_velocity = (
        SELECT COUNT(*)::DECIMAL / NULLIF(EXTRACT(DAY FROM (MAX(created_at) - MIN(created_at))), 0)
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id = NEW.product_id
        AND o.created_at >= NOW() - INTERVAL '30 days'
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sales_velocity ON order_items;
CREATE TRIGGER trigger_update_sales_velocity
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_sales_velocity();

-- Generate tracking number for deliveries
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'BDL' || LPAD(floor(random() * 999999999)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Set tracking number on insert if not provided
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_number IS NULL THEN
        NEW.tracking_number := generate_tracking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_tracking_number ON deliveries;
CREATE TRIGGER trigger_set_tracking_number
BEFORE INSERT ON deliveries
FOR EACH ROW
EXECUTE FUNCTION set_tracking_number();

-- ============================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS (if missing)
-- ============================================

-- Add payout_request_id FK to deliveries if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'deliveries_payout_request_id_fkey'
    ) THEN
        ALTER TABLE deliveries 
        ADD CONSTRAINT deliveries_payout_request_id_fkey 
        FOREIGN KEY (payout_request_id) REFERENCES payout_requests(id);
    END IF;
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Incremental migration completed successfully!' AS status,
       'All missing tables and columns have been added.' AS message,
       'Existing data has been preserved.' AS note;
