-- =====================================================
-- BANDA QR SYSTEM - COMPREHENSIVE SUPABASE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- QR CODES MASTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_type TEXT CHECK (qr_type IN ('order','delivery','user','receipt','dispute')) NOT NULL,
    linked_id UUID NOT NULL, -- references order_id, user_id, delivery_id, etc.
    encoded_data JSONB NOT NULL, -- structured QR payload
    fallback_code TEXT UNIQUE NOT NULL,
    qr_image_url TEXT, -- URL to generated QR code image
    verification_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- optional expiry
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_type ON qr_codes(qr_type);
CREATE INDEX IF NOT EXISTS idx_qr_codes_linked_id ON qr_codes(linked_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_fallback ON qr_codes(fallback_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(active);

-- =====================================================
-- QR SCAN LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES auth.users(id),
    gps_location JSONB, -- {latitude: number, longitude: number}
    device_info TEXT,
    success BOOLEAN NOT NULL,
    reason TEXT, -- error reason if failed
    action_result JSONB, -- result of the triggered action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_qr_id ON qr_scan_logs(qr_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scanned_by ON qr_scan_logs(scanned_by);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_created_at ON qr_scan_logs(created_at);

-- =====================================================
-- ORDERS TABLE (Enhanced for QR system)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    seller_ids UUID[] NOT NULL, -- array of seller user IDs
    status TEXT CHECK (status IN ('placed','confirmed','packed','picked_up','out_for_delivery','delivered','cancelled','disputed')) DEFAULT 'placed',
    items JSONB NOT NULL, -- array of order items with details
    payment_details JSONB NOT NULL, -- payment breakdown and status
    delivery_address JSONB NOT NULL, -- delivery address details
    delivery_info JSONB, -- driver, vehicle, tracking details
    reserve_status TEXT CHECK (reserve_status IN ('held','released','refunded','disputed')) DEFAULT 'held',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_reserve_status ON orders(reserve_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- =====================================================
-- ORDER TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    location TEXT,
    gps_coordinates JSONB, -- {latitude: number, longitude: number}
    updated_by UUID REFERENCES auth.users(id),
    qr_scan_id UUID REFERENCES qr_scan_logs(id), -- link to QR scan that triggered this update
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created_at ON order_tracking(created_at);

-- =====================================================
-- ORDER DISPUTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES auth.users(id) NOT NULL,
    dispute_type TEXT CHECK (dispute_type IN ('quality','delivery','payment','other')) NOT NULL,
    reason TEXT NOT NULL,
    evidence_urls TEXT[], -- array of evidence file URLs
    status TEXT CHECK (status IN ('open','investigating','resolved','rejected')) DEFAULT 'open',
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id), -- admin/agent who resolved
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_order_disputes_order_id ON order_disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_disputes_status ON order_disputes(status);

-- =====================================================
-- DELIVERY DRIVERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    driver_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    vehicle_details JSONB NOT NULL, -- {type, model, plate_number, capacity}
    license_number TEXT,
    verification_status TEXT CHECK (verification_status IN ('pending','verified','rejected')) DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_user_id ON delivery_drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_drivers_active ON delivery_drivers(active);

-- =====================================================
-- RECEIPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    receipt_type TEXT CHECK (receipt_type IN ('payment','delivery','refund','dispute_resolution')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_details JSONB NOT NULL,
    generated_by UUID REFERENCES auth.users(id),
    receipt_url TEXT, -- URL to generated receipt document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_receipts_order_id ON receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_type ON receipts(receipt_type);

-- =====================================================
-- MARKET INSIGHTS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- crops, poultry, livestock, logistics, inputs, equipment, services
    item_name TEXT NOT NULL,
    region TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    unit TEXT NOT NULL, -- kg, piece, liter, etc.
    demand_level TEXT CHECK (demand_level IN ('low','medium','high','very_high')),
    supply_level TEXT CHECK (supply_level IN ('low','medium','high','very_high')),
    forecast_price DECIMAL(10,2), -- AI predicted price
    forecast_confidence DECIMAL(3,2), -- confidence level (0-1)
    data_source TEXT, -- manual, api, scraping, etc.
    recorded_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_item_region ON market_insights(item_name, region);
CREATE INDEX IF NOT EXISTS idx_market_insights_recorded_at ON market_insights(recorded_at);

-- =====================================================
-- USER PROFILES TABLE (Enhanced for QR system)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    location JSONB, -- {county, sub_county, ward, gps_coordinates}
    user_type TEXT CHECK (user_type IN ('buyer','seller','driver','agent','admin')) NOT NULL,
    verification_tier TEXT CHECK (verification_tier IN ('basic','verified','gold','premium')) DEFAULT 'basic',
    verification_documents JSONB, -- array of document URLs and types
    business_details JSONB, -- for sellers: business name, license, etc.
    rating DECIMAL(3,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_tier ON user_profiles(verification_tier);

-- =====================================================
-- SUPABASE FUNCTIONS
-- =====================================================

-- Function: Generate QR Code
CREATE OR REPLACE FUNCTION generate_qr_code(
    p_qr_type TEXT,
    p_linked_id UUID,
    p_payload JSONB,
    p_expires_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
    qr_id UUID,
    qr_data JSONB,
    fallback_code TEXT,
    verification_code TEXT
) AS $$
DECLARE
    v_qr_id UUID;
    v_fallback_code TEXT;
    v_verification_code TEXT;
    v_qr_data JSONB;
BEGIN
    -- Generate unique codes
    v_qr_id := gen_random_uuid();
    v_fallback_code := p_qr_type || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    v_verification_code := 'BANDA_' || UPPER(SUBSTRING(p_linked_id::TEXT, -6)) || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    
    -- Create QR data structure
    v_qr_data := jsonb_build_object(
        'type', p_qr_type,
        'id', v_qr_id,
        'related_id', p_linked_id,
        'timestamp', NOW(),
        'signature', v_verification_code
    ) || p_payload;
    
    -- Insert QR code record
    INSERT INTO qr_codes (
        id, qr_type, linked_id, encoded_data, fallback_code, 
        verification_code, expires_at, active
    ) VALUES (
        v_qr_id, p_qr_type, p_linked_id, v_qr_data, v_fallback_code,
        v_verification_code, NOW() + (p_expires_hours || ' hours')::INTERVAL, TRUE
    );
    
    -- Return results
    RETURN QUERY SELECT v_qr_id, v_qr_data, v_fallback_code, v_verification_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Scan QR Code
CREATE OR REPLACE FUNCTION scan_qr_code(
    p_qr_value TEXT,
    p_user_id UUID,
    p_gps_location JSONB DEFAULT NULL,
    p_device_info TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    action_result JSONB,
    message TEXT
) AS $$
DECLARE
    v_qr_record RECORD;
    v_qr_data JSONB;
    v_scan_id UUID;
    v_action_result JSONB;
    v_success BOOLEAN := FALSE;
    v_message TEXT;
BEGIN
    -- Try to find QR code by fallback code first
    SELECT * INTO v_qr_record 
    FROM qr_codes 
    WHERE fallback_code = p_qr_value AND active = TRUE;
    
    -- If not found, try to parse as JSON QR data
    IF v_qr_record IS NULL THEN
        BEGIN
            v_qr_data := p_qr_value::JSONB;
            SELECT * INTO v_qr_record 
            FROM qr_codes 
            WHERE id = (v_qr_data->>'id')::UUID AND active = TRUE;
        EXCEPTION WHEN OTHERS THEN
            v_message := 'Invalid QR code format';
        END;
    END IF;
    
    -- Check if QR code exists and is valid
    IF v_qr_record IS NULL THEN
        v_message := 'QR code not found or inactive';
    ELSIF v_qr_record.expires_at < NOW() THEN
        v_message := 'QR code has expired';
    ELSE
        v_success := TRUE;
        v_message := 'QR code scanned successfully';
        
        -- Process based on QR type
        CASE v_qr_record.qr_type
            WHEN 'order' THEN
                v_action_result := jsonb_build_object(
                    'type', 'order_action',
                    'order_id', v_qr_record.linked_id,
                    'action', 'delivery_confirmation'
                );
                
                -- Update order status if it's a delivery confirmation
                UPDATE orders 
                SET status = 'delivered', 
                    reserve_status = 'released',
                    updated_at = NOW()
                WHERE id = v_qr_record.linked_id;
                
            WHEN 'delivery' THEN
                v_action_result := jsonb_build_object(
                    'type', 'driver_verification',
                    'driver_id', v_qr_record.linked_id,
                    'verified', TRUE
                );
                
            WHEN 'user' THEN
                v_action_result := jsonb_build_object(
                    'type', 'user_verification',
                    'user_id', v_qr_record.linked_id,
                    'verified', TRUE
                );
                
            WHEN 'receipt' THEN
                v_action_result := jsonb_build_object(
                    'type', 'receipt_verification',
                    'receipt_id', v_qr_record.linked_id,
                    'verified', TRUE
                );
                
            WHEN 'dispute' THEN
                v_action_result := jsonb_build_object(
                    'type', 'dispute_verification',
                    'dispute_id', v_qr_record.linked_id,
                    'agent_id', p_user_id
                );
        END CASE;
    END IF;
    
    -- Log the scan attempt
    v_scan_id := gen_random_uuid();
    INSERT INTO qr_scan_logs (
        id, qr_id, scanned_by, gps_location, device_info, 
        success, reason, action_result
    ) VALUES (
        v_scan_id, v_qr_record.id, p_user_id, p_gps_location, p_device_info,
        v_success, CASE WHEN NOT v_success THEN v_message END, v_action_result
    );
    
    -- Return results
    RETURN QUERY SELECT v_success, v_action_result, v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Active Orders
CREATE OR REPLACE FUNCTION get_active_orders(p_user_id UUID)
RETURNS TABLE(
    order_id UUID,
    order_number TEXT,
    status TEXT,
    total_amount DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at, o.estimated_delivery
    FROM orders o
    WHERE o.buyer_id = p_user_id 
    AND o.status NOT IN ('delivered', 'cancelled')
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Detailed Order
CREATE OR REPLACE FUNCTION get_detailed_order(p_order_id UUID)
RETURNS TABLE(
    order_data JSONB
) AS $$
DECLARE
    v_order_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'status', o.status,
        'reserve_status', o.reserve_status,
        'items', o.items,
        'payment_details', o.payment_details,
        'delivery_address', o.delivery_address,
        'delivery_info', o.delivery_info,
        'total_amount', o.total_amount,
        'delivery_fee', o.delivery_fee,
        'service_fee', o.service_fee,
        'estimated_delivery', o.estimated_delivery,
        'created_at', o.created_at,
        'tracking_updates', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'status', ot.status,
                    'message', ot.message,
                    'location', ot.location,
                    'created_at', ot.created_at
                ) ORDER BY ot.created_at
            )
            FROM order_tracking ot
            WHERE ot.order_id = o.id
        ),
        'qr_codes', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', qr.id,
                    'verification_code', qr.verification_code,
                    'fallback_code', qr.fallback_code,
                    'expires_at', qr.expires_at,
                    'active', qr.active
                )
            )
            FROM qr_codes qr
            WHERE qr.linked_id = o.id AND qr.qr_type = 'order'
        )
    ) INTO v_order_data
    FROM orders o
    WHERE o.id = p_order_id;
    
    RETURN QUERY SELECT v_order_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Raise Dispute
CREATE OR REPLACE FUNCTION raise_dispute(
    p_order_id UUID,
    p_user_id UUID,
    p_dispute_type TEXT,
    p_reason TEXT,
    p_evidence_urls TEXT[] DEFAULT NULL
)
RETURNS TABLE(
    dispute_id UUID,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_dispute_id UUID;
BEGIN
    -- Check if order exists and user is authorized
    IF NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE id = p_order_id 
        AND (buyer_id = p_user_id OR p_user_id = ANY(seller_ids))
    ) THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Order not found or unauthorized';
        RETURN;
    END IF;
    
    -- Create dispute
    v_dispute_id := gen_random_uuid();
    INSERT INTO order_disputes (
        id, order_id, raised_by, dispute_type, reason, evidence_urls
    ) VALUES (
        v_dispute_id, p_order_id, p_user_id, p_dispute_type, p_reason, p_evidence_urls
    );
    
    -- Update order status
    UPDATE orders 
    SET status = 'disputed', reserve_status = 'disputed'
    WHERE id = p_order_id;
    
    RETURN QUERY SELECT v_dispute_id, TRUE, 'Dispute raised successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Market Insights
CREATE OR REPLACE FUNCTION get_market_insights(
    p_category TEXT DEFAULT NULL,
    p_item_name TEXT DEFAULT NULL,
    p_region TEXT DEFAULT NULL,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    category TEXT,
    item_name TEXT,
    region TEXT,
    avg_price DECIMAL,
    price_trend TEXT,
    forecast_price DECIMAL,
    data_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH price_data AS (
        SELECT 
            mi.category,
            mi.item_name,
            mi.region,
            AVG(mi.price) as avg_price,
            AVG(mi.forecast_price) as avg_forecast,
            COUNT(*) as data_points,
            (AVG(mi.price) - LAG(AVG(mi.price)) OVER (
                PARTITION BY mi.category, mi.item_name, mi.region 
                ORDER BY DATE_TRUNC('week', mi.recorded_at)
            )) / NULLIF(LAG(AVG(mi.price)) OVER (
                PARTITION BY mi.category, mi.item_name, mi.region 
                ORDER BY DATE_TRUNC('week', mi.recorded_at)
            ), 0) * 100 as price_change_pct
        FROM market_insights mi
        WHERE mi.recorded_at >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL
        AND (p_category IS NULL OR mi.category = p_category)
        AND (p_item_name IS NULL OR mi.item_name = p_item_name)
        AND (p_region IS NULL OR mi.region = p_region)
        GROUP BY mi.category, mi.item_name, mi.region, DATE_TRUNC('week', mi.recorded_at)
    )
    SELECT 
        pd.category,
        pd.item_name,
        pd.region,
        pd.avg_price,
        CASE 
            WHEN pd.price_change_pct > 5 THEN 'rising'
            WHEN pd.price_change_pct < -5 THEN 'falling'
            ELSE 'stable'
        END as price_trend,
        pd.avg_forecast,
        pd.data_points
    FROM price_data pd
    ORDER BY pd.category, pd.item_name, pd.region;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- QR Codes policies
CREATE POLICY "Users can view their own QR codes" ON qr_codes
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create QR codes" ON qr_codes
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (buyer_id = auth.uid() OR auth.uid() = ANY(seller_ids));

CREATE POLICY "Buyers can create orders" ON orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Order participants can update orders" ON orders
    FOR UPDATE USING (buyer_id = auth.uid() OR auth.uid() = ANY(seller_ids));

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Market insights are public read
CREATE POLICY "Market insights are publicly readable" ON market_insights
    FOR SELECT TO authenticated USING (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample market insights
INSERT INTO market_insights (category, item_name, region, price, unit, demand_level, supply_level) VALUES
('crops', 'Maize', 'Nairobi', 45.00, 'kg', 'high', 'medium'),
('crops', 'Rice', 'Mombasa', 120.00, 'kg', 'medium', 'high'),
('poultry', 'Chicken', 'Nakuru', 350.00, 'piece', 'high', 'medium'),
('livestock', 'Milk', 'Kiambu', 55.00, 'liter', 'very_high', 'medium'),
('inputs', 'Fertilizer', 'Eldoret', 4500.00, 'bag', 'high', 'low')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE qr_codes IS 'Master table for all QR codes in the system';
COMMENT ON TABLE qr_scan_logs IS 'Logs every QR code scan attempt with location and device info';
COMMENT ON TABLE orders IS 'Enhanced orders table with QR system integration';
COMMENT ON TABLE order_tracking IS 'Real-time order status tracking linked to QR scans';
COMMENT ON TABLE order_disputes IS 'Order dispute management system';
COMMENT ON TABLE delivery_drivers IS 'Delivery driver profiles and verification';
COMMENT ON TABLE receipts IS 'Digital receipts for all transactions';
COMMENT ON TABLE market_insights IS 'Market price data and AI forecasting';
COMMENT ON TABLE user_profiles IS 'Enhanced user profiles with verification tiers';

COMMENT ON FUNCTION generate_qr_code IS 'Generates secure QR codes with fallback codes';
COMMENT ON FUNCTION scan_qr_code IS 'Processes QR code scans and triggers appropriate actions';
COMMENT ON FUNCTION get_active_orders IS 'Returns active orders for a user';
COMMENT ON FUNCTION get_detailed_order IS 'Returns comprehensive order details with tracking';
COMMENT ON FUNCTION raise_dispute IS 'Creates order disputes with evidence';
COMMENT ON FUNCTION get_market_insights IS 'Returns market analysis and price trends';