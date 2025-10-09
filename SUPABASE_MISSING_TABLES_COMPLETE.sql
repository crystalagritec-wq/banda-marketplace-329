-- ============================================
-- MISSING DATABASE TABLES - COMPLETE SCHEMA
-- Tables needed for Service Providers, Logistics, and Shop Management
-- ============================================

-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- SERVICE PROVIDER TABLES
-- ============================================

-- SERVICE PROOFS (Photo uploads for service completion)
CREATE TABLE IF NOT EXISTS service_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    image_url TEXT NOT NULL,
    notes TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_proofs_request ON service_proofs(service_request_id);

-- SERVICE RATINGS
CREATE TABLE IF NOT EXISTS service_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_request_id UUID NOT NULL REFERENCES service_requests(id),
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(service_request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_service_ratings_provider ON service_ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_rating ON service_ratings(rating);

-- SERVICE PROVIDER AVAILABILITY (Calendar)
CREATE TABLE IF NOT EXISTS service_provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available BOOLEAN DEFAULT true,
    time_slots JSON,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(service_provider_id, date)
);

CREATE INDEX IF NOT EXISTS idx_service_availability_provider ON service_provider_availability(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_service_availability_date ON service_provider_availability(date);

-- Add scheduled_date to service_requests if not exists
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS proof_photo TEXT;

-- ============================================
-- LOGISTICS TABLES
-- ============================================

-- DELIVERY PROOFS (Photo uploads for delivery completion)
CREATE TABLE IF NOT EXISTS delivery_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    image_url TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    signature_url TEXT,
    notes TEXT,
    delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_proofs_delivery ON delivery_proofs(delivery_id);

-- DRIVER RATINGS
CREATE TABLE IF NOT EXISTS driver_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    user_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
    timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
    care_of_goods INTEGER CHECK (care_of_goods >= 1 AND care_of_goods <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(delivery_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver ON driver_ratings(driver_id);

-- PAYOUT REQUESTS
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id),
    service_provider_id UUID REFERENCES service_providers(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    account_details JSON NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_driver ON payout_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);

-- Add payout tracking to deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS payout_request_id UUID REFERENCES payout_requests(id);

-- VEHICLE STATUS HISTORY
CREATE TABLE IF NOT EXISTS vehicle_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_status_history_vehicle ON vehicle_status_history(vehicle_id);

-- DELIVERY STATUS HISTORY (Timeline tracking)
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_status_history_delivery ON delivery_status_history(delivery_id);

-- DELIVERY SCANS (QR code verification)
CREATE TABLE IF NOT EXISTS delivery_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    scanned_by UUID NOT NULL REFERENCES users(id),
    scan_type TEXT NOT NULL,
    location GEOMETRY(Point, 4326),
    scanned_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_scans_delivery ON delivery_scans(delivery_id);

-- DRIVER LOCATION HISTORY (Real-time tracking)
CREATE TABLE IF NOT EXISTS driver_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    location GEOMETRY(Point, 4326) NOT NULL,
    heading DECIMAL,
    speed_kmh DECIMAL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_location_history_driver ON driver_location_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_location_history_time ON driver_location_history(recorded_at);

-- Add fields to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS heading DECIMAL;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS speed_kmh DECIMAL;

-- LOCATION UPDATES (WebSocket real-time)
CREATE TABLE IF NOT EXISTS location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    location GEOMETRY(Point, 4326) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_location_updates_driver ON location_updates(driver_id);
CREATE INDEX IF NOT EXISTS idx_location_updates_time ON location_updates(timestamp);

-- Add tracking number to deliveries if not exists
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE;

-- ============================================
-- SHOP MANAGEMENT TABLES
-- ============================================

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    variant_type TEXT NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- SHOP VERIFICATIONS
CREATE TABLE IF NOT EXISTS shop_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    business_registration TEXT NOT NULL,
    tax_id TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    id_document_url TEXT NOT NULL,
    business_license_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_shop_verifications_shop ON shop_verifications(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_verifications_status ON shop_verifications(status);

-- Add verification status to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- Add sales velocity to products (for inventory alerts)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_velocity DECIMAL DEFAULT 0;

-- INVENTORY ALERTS
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
    threshold INTEGER,
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(resolved);

-- ============================================
-- NOTIFICATION TABLES
-- ============================================

-- ADMIN NOTIFICATIONS
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSON DEFAULT '{}'::json,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- PUSH NOTIFICATIONS
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSON DEFAULT '{}'::json,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Generate tracking number for deliveries
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'BDL' || LPAD(floor(random() * 999999999)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-update delivery status history
CREATE OR REPLACE FUNCTION log_delivery_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
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
    UPDATE products
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

-- Auto-generate tracking number on delivery insert
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

-- Auto-create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= 10 AND NEW.stock > 0 THEN
        INSERT INTO inventory_alerts (product_id, alert_type, threshold)
        VALUES (NEW.id, 'low_stock', 10)
        ON CONFLICT DO NOTHING;
    ELSIF NEW.stock = 0 THEN
        INSERT INTO inventory_alerts (product_id, alert_type, threshold)
        VALUES (NEW.id, 'out_of_stock', 0)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_inventory_alerts ON products;
CREATE TRIGGER trigger_check_inventory_alerts
AFTER UPDATE OF stock ON products
FOR EACH ROW
EXECUTE FUNCTION check_inventory_alerts();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Calculate average rating for service provider
CREATE OR REPLACE FUNCTION get_service_provider_rating(provider_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT AVG(rating) INTO avg_rating
    FROM service_ratings
    WHERE provider_id = provider_id_param;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Calculate average rating for driver
CREATE OR REPLACE FUNCTION get_driver_rating(driver_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT AVG(rating) INTO avg_rating
    FROM driver_ratings
    WHERE driver_id = driver_id_param;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Get driver earnings
CREATE OR REPLACE FUNCTION get_driver_earnings(driver_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_earnings DECIMAL;
BEGIN
    SELECT COALESCE(SUM(delivery_fee), 0) INTO total_earnings
    FROM deliveries
    WHERE driver_id = driver_id_param
    AND status = 'delivered';
    
    RETURN total_earnings;
END;
$$ LANGUAGE plpgsql;

-- Get service provider earnings
CREATE OR REPLACE FUNCTION get_service_provider_earnings(provider_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_earnings DECIMAL;
BEGIN
    SELECT COALESCE(SUM(price), 0) INTO total_earnings
    FROM service_requests
    WHERE provider_id = provider_id_param
    AND status = 'completed';
    
    RETURN total_earnings;
END;
$$ LANGUAGE plpgsql;
