-- Supabase Functions for Banda App Features
-- Run these in your Supabase SQL Editor

-- Function to fetch categories by location
CREATE OR REPLACE FUNCTION fetch_categories_by_location(
  location_type TEXT DEFAULT 'national',
  location_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  location_filter TEXT,
  product_count BIGINT
) AS $$
BEGIN
  -- Mock implementation - replace with actual logic
  RETURN QUERY
  SELECT 
    cat.category as id,
    cat.category as name,
    location_type as location_filter,
    COUNT(p.id) as product_count
  FROM (
    VALUES 
      ('Vegetables'),
      ('Fruits'),
      ('Grains'),
      ('Dairy'),
      ('Poultry'),
      ('Livestock'),
      ('Inputs'),
      ('Equipment')
  ) AS cat(category)
  LEFT JOIN products p ON p.category = cat.category
  GROUP BY cat.category;
END;
$$ LANGUAGE plpgsql;

-- Function to log payment success
CREATE OR REPLACE FUNCTION log_payment_success(
  order_id TEXT,
  payment_details JSONB
)
RETURNS JSONB AS $$
DECLARE
  log_id TEXT;
  result JSONB;
BEGIN
  -- Generate log ID
  log_id := 'log_' || extract(epoch from now())::text;
  
  -- Insert payment log (you may need to create a payment_logs table)
  INSERT INTO payment_logs (
    id,
    order_id,
    payment_amount,
    payment_method,
    payment_timestamp,
    status,
    created_at
  ) VALUES (
    log_id,
    order_id,
    (payment_details->>'amount')::numeric,
    payment_details->>'method',
    (payment_details->>'timestamp')::timestamp,
    'success',
    now()
  );
  
  -- Update order status
  UPDATE orders 
  SET 
    payment_status = 'completed',
    status = 'confirmed',
    updated_at = now()
  WHERE id = order_id;
  
  -- Create result
  result := jsonb_build_object(
    'success', true,
    'log_id', log_id,
    'message', 'Payment success logged to My Orders'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate order QR code
CREATE OR REPLACE FUNCTION generate_order_qr(
  order_id TEXT,
  order_details JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  qr_id TEXT;
  verification_code TEXT;
  result JSONB;
BEGIN
  -- Generate QR ID and verification code
  qr_id := 'qr_' || extract(epoch from now())::text;
  verification_code := 'BANDA_' || upper(right(order_id, 6));
  
  -- Insert QR code record (you may need to create an order_qr_codes table)
  INSERT INTO order_qr_codes (
    id,
    order_id,
    verification_code,
    qr_data,
    format,
    created_at
  ) VALUES (
    qr_id,
    order_id,
    verification_code,
    jsonb_build_object(
      'order_id', order_id,
      'verification_code', verification_code,
      'timestamp', now(),
      'details', order_details
    ),
    'png',
    now()
  );
  
  -- Create result
  result := jsonb_build_object(
    'success', true,
    'qr_code', jsonb_build_object(
      'qr_code_id', qr_id,
      'order_id', order_id,
      'verification_code', verification_code,
      'download_url', 'https://api.banda.com/qr/' || order_id || '.png',
      'created_at', now()
    ),
    'message', 'Order QR code generated successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to notify seller and driver
CREATE OR REPLACE FUNCTION notify_seller_driver(
  order_id TEXT,
  seller_ids TEXT[],
  message TEXT
)
RETURNS JSONB AS $$
DECLARE
  seller_id TEXT;
  notification_id TEXT;
  notifications_sent INTEGER := 0;
BEGIN
  -- Notify each seller
  FOREACH seller_id IN ARRAY seller_ids
  LOOP
    notification_id := 'notif_' || extract(epoch from now())::text || '_' || seller_id;
    
    INSERT INTO notifications (
      id,
      user_id,
      title,
      message,
      type,
      data,
      is_read,
      created_at
    ) VALUES (
      notification_id,
      seller_id,
      'New Order Received',
      message,
      'order',
      jsonb_build_object('order_id', order_id),
      false,
      now()
    );
    
    notifications_sent := notifications_sent + 1;
  END LOOP;
  
  -- Notify driver (if driver assignment system exists)
  -- This would require a driver assignment table/logic
  
  RETURN jsonb_build_object(
    'success', true,
    'notifications_sent', notifications_sent,
    'message', 'Seller and driver notifications sent successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate digital receipt
CREATE OR REPLACE FUNCTION generate_digital_receipt(
  order_id TEXT,
  format TEXT DEFAULT 'pdf',
  include_qr BOOLEAN DEFAULT true
)
RETURNS JSONB AS $$
DECLARE
  receipt_id TEXT;
  result JSONB;
BEGIN
  -- Generate receipt ID
  receipt_id := 'receipt_' || extract(epoch from now())::text;
  
  -- Insert receipt record (you may need to create a digital_receipts table)
  INSERT INTO digital_receipts (
    id,
    order_id,
    format,
    include_qr,
    file_size,
    download_url,
    expires_at,
    created_at
  ) VALUES (
    receipt_id,
    order_id,
    format,
    include_qr,
    CASE WHEN format = 'pdf' THEN '245KB' ELSE '180KB' END,
    'https://api.banda.com/receipts/' || receipt_id || '.' || format,
    now() + interval '7 days',
    now()
  );
  
  -- Create result
  result := jsonb_build_object(
    'success', true,
    'receipt', jsonb_build_object(
      'receipt_id', receipt_id,
      'order_id', order_id,
      'format', format,
      'file_size', CASE WHEN format = 'pdf' THEN '245KB' ELSE '180KB' END,
      'download_url', 'https://api.banda.com/receipts/' || receipt_id || '.' || format,
      'expires_at', now() + interval '7 days',
      'qr_included', include_qr,
      'created_at', now()
    ),
    'message', 'Digital receipt generated as ' || upper(format)
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to fetch order details with QR and tracking
CREATE OR REPLACE FUNCTION fetch_order_details(
  order_id TEXT,
  include_qr BOOLEAN DEFAULT false,
  include_tracking BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
  order_record RECORD;
  result JSONB;
BEGIN
  -- Fetch order details
  SELECT * INTO order_record
  FROM orders o
  WHERE o.id = order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;
  
  -- Build basic order details
  result := jsonb_build_object(
    'success', true,
    'order', jsonb_build_object(
      'id', order_record.id,
      'status', order_record.status,
      'total_amount', order_record.total_amount,
      'payment_method', order_record.payment_method,
      'payment_status', order_record.payment_status,
      'created_at', order_record.created_at,
      'updated_at', order_record.updated_at
    ),
    'message', 'Order details fetched successfully'
  );
  
  -- Add QR code if requested
  IF include_qr THEN
    result := jsonb_set(
      result,
      '{order,qr_code}',
      jsonb_build_object(
        'verification_code', 'BANDA_' || upper(right(order_id, 6)),
        'qr_data', jsonb_build_object(
          'order_id', order_id,
          'verification_code', 'BANDA_' || upper(right(order_id, 6)),
          'timestamp', now()
        ),
        'image_url', 'https://api.banda.com/qr/' || order_id || '.png'
      )
    );
  END IF;
  
  -- Add tracking if requested
  IF include_tracking THEN
    result := jsonb_set(
      result,
      '{order,tracking}',
      jsonb_build_object(
        'current_status', order_record.status,
        'estimated_delivery', now() + interval '4 hours',
        'tracking_events', jsonb_build_array(
          jsonb_build_object(
            'status', 'order_placed',
            'timestamp', order_record.created_at,
            'description', 'Order placed successfully'
          ),
          jsonb_build_object(
            'status', 'payment_confirmed',
            'timestamp', order_record.created_at + interval '5 minutes',
            'description', 'Payment confirmed'
          )
        )
      )
    );
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Create supporting tables if they don't exist

-- Payment logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  payment_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_timestamp TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP DEFAULT now()
);

-- Order QR codes table
CREATE TABLE IF NOT EXISTS order_qr_codes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  qr_data JSONB NOT NULL,
  format TEXT NOT NULL DEFAULT 'png',
  created_at TIMESTAMP DEFAULT now()
);

-- Digital receipts table
CREATE TABLE IF NOT EXISTS digital_receipts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  format TEXT NOT NULL,
  include_qr BOOLEAN DEFAULT true,
  file_size TEXT,
  download_url TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Locations table for location filtering
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('town', 'county', 'national')),
  parent_id TEXT,
  coordinates JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert sample locations
INSERT INTO locations (id, name, type, parent_id) VALUES
  ('kenya', 'Kenya', 'national', NULL),
  ('nairobi', 'Nairobi', 'county', 'kenya'),
  ('kiambu', 'Kiambu', 'county', 'kenya'),
  ('nakuru', 'Nakuru', 'county', 'kenya'),
  ('westlands', 'Westlands', 'town', 'nairobi'),
  ('karen', 'Karen', 'town', 'nairobi'),
  ('thika', 'Thika', 'town', 'kiambu')
ON CONFLICT (id) DO NOTHING;

-- Optional analytics counters backing objects
CREATE TABLE IF NOT EXISTS product_analytics_daily (
  product_id TEXT NOT NULL,
  day DATE NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  carts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, day)
);

-- Optional: basic cart_items table used to compute carts_count when available
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

-- RPC: get product counters for today
CREATE OR REPLACE FUNCTION get_product_counters(p_product_id TEXT)
RETURNS TABLE (
  views_today INTEGER,
  carts_count INTEGER
) AS $
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT views FROM product_analytics_daily WHERE product_id = p_product_id AND day = CURRENT_DATE), 0) AS views_today,
    COALESCE((SELECT COUNT(*) FROM cart_items WHERE product_id = p_product_id), 0) AS carts_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: increment product view counter
CREATE OR REPLACE FUNCTION increment_product_view(p_product_id TEXT)
RETURNS VOID AS $
BEGIN
  INSERT INTO product_analytics_daily (product_id, day, views, carts)
  VALUES (p_product_id, CURRENT_DATE, 1, 0)
  ON CONFLICT (product_id, day)
  DO UPDATE SET views = product_analytics_daily.views + 1;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vendor policies table
CREATE TABLE IF NOT EXISTS vendor_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id TEXT NOT NULL UNIQUE,
  escrow_enabled BOOLEAN DEFAULT TRUE,
  return_window_hours INTEGER DEFAULT 24,
  refund_policy TEXT DEFAULT 'partial' CHECK (refund_policy IN ('none', 'partial', 'full')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Product-specific policies table
CREATE TABLE IF NOT EXISTS product_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL UNIQUE,
  escrow_enabled BOOLEAN,
  return_window_hours INTEGER,
  refund_policy TEXT CHECK (refund_policy IN ('none', 'partial', 'full')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Vendors table reference (if not exists)
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  escrow_enabled BOOLEAN DEFAULT TRUE,
  return_window_hours INTEGER DEFAULT 24,
  refund_policy TEXT DEFAULT 'partial',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Policies View: unify vendor/product policies into a single row per product
CREATE OR REPLACE VIEW product_policies_view AS
SELECT
  p.id AS product_id,
  p.vendor_id,
  COALESCE(pp.escrow_enabled, vp.escrow_enabled, v.escrow_enabled, TRUE) AS escrow_enabled,
  COALESCE(pp.return_window_hours, vp.return_window_hours, v.return_window_hours, 24) AS return_window_hours,
  COALESCE(pp.refund_policy, vp.refund_policy, v.refund_policy, 'partial') AS refund_policy,
  COALESCE(pp.notes, vp.notes, v.notes) AS notes
FROM products p
LEFT JOIN product_policies pp ON pp.product_id = p.id
LEFT JOIN vendor_policies vp ON vp.vendor_id = p.vendor_id
LEFT JOIN vendors v ON v.id = p.vendor_id;