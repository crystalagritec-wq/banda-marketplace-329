-- ============================================
-- BANDA SUPABASE MISSING TABLES FIX
-- ============================================
-- This file creates all missing tables and views that are referenced
-- in the codebase but don't exist in your Supabase database.
-- Run this in your Supabase SQL Editor.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE VENDORS TABLE
-- ============================================
-- This table stores vendor information
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  escrow_enabled BOOLEAN DEFAULT TRUE,
  return_window_hours INTEGER DEFAULT 24,
  refund_policy TEXT DEFAULT 'partial' CHECK (refund_policy IN ('none', 'partial', 'full')),
  trust_score DECIMAL(3,2) DEFAULT 0.00,
  fulfillment_rate DECIMAL(5,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add vendor_id column to products table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE products ADD COLUMN vendor_id TEXT;
  END IF;
END $$;

-- Create index on vendor_id
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- ============================================
-- 2. CREATE VENDOR_POLICIES TABLE
-- ============================================
-- This table stores vendor-level policies
CREATE TABLE IF NOT EXISTS vendor_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id TEXT NOT NULL UNIQUE,
  escrow_enabled BOOLEAN DEFAULT TRUE,
  return_window_hours INTEGER DEFAULT 24,
  refund_policy TEXT DEFAULT 'partial' CHECK (refund_policy IN ('none', 'partial', 'full')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on vendor_id
CREATE INDEX IF NOT EXISTS idx_vendor_policies_vendor_id ON vendor_policies(vendor_id);

-- ============================================
-- 3. CREATE PRODUCT_POLICIES TABLE
-- ============================================
-- This table stores product-specific policies that override vendor policies
CREATE TABLE IF NOT EXISTS product_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL UNIQUE,
  escrow_enabled BOOLEAN,
  return_window_hours INTEGER,
  refund_policy TEXT CHECK (refund_policy IN ('none', 'partial', 'full')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on product_id
CREATE INDEX IF NOT EXISTS idx_product_policies_product_id ON product_policies(product_id);

-- ============================================
-- 4. CREATE PRODUCT_POLICIES_VIEW
-- ============================================
-- This view unifies vendor and product policies into a single row per product
-- IMPORTANT: Casts UUID to TEXT to avoid type mismatches
CREATE OR REPLACE VIEW product_policies_view AS
SELECT
  p.id::text AS product_id,
  COALESCE(p.vendor_id, p.user_id) AS vendor_id,
  COALESCE(pp.escrow_enabled, vp.escrow_enabled, v.escrow_enabled, TRUE) AS escrow_enabled,
  COALESCE(pp.return_window_hours, vp.return_window_hours, v.return_window_hours, 24) AS return_window_hours,
  COALESCE(pp.refund_policy, vp.refund_policy, v.refund_policy, 'partial') AS refund_policy,
  COALESCE(pp.notes, vp.notes, v.notes) AS notes
FROM products p
LEFT JOIN product_policies pp ON pp.product_id = p.id::text
LEFT JOIN vendor_policies vp ON vp.vendor_id = COALESCE(p.vendor_id, p.user_id)
LEFT JOIN vendors v ON v.id = COALESCE(p.vendor_id, p.user_id);

-- ============================================
-- 5. CREATE UPDATED_AT TRIGGERS
-- ============================================
-- Ensure updated_at is automatically updated
CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON vendors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_policies_updated_at 
  BEFORE UPDATE ON vendor_policies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_policies_updated_at 
  BEFORE UPDATE ON product_policies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_policies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- Vendors: Anyone can view, only vendor can update
CREATE POLICY "Anyone can view vendors" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Vendors can update their own data" ON vendors
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Vendors can insert their own data" ON vendors
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Vendor Policies: Anyone can view, only vendor can manage
CREATE POLICY "Anyone can view vendor policies" ON vendor_policies
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their own policies" ON vendor_policies
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()::text)
  );

-- Product Policies: Anyone can view, only product owner can manage
CREATE POLICY "Anyone can view product policies" ON product_policies
  FOR SELECT USING (true);

CREATE POLICY "Product owners can manage their product policies" ON product_policies
  FOR ALL USING (
    product_id IN (SELECT id::text FROM products WHERE user_id = auth.uid()::text)
  );

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON vendors TO anon, authenticated;
GRANT SELECT ON vendor_policies TO anon, authenticated;
GRANT SELECT ON product_policies TO anon, authenticated;
GRANT SELECT ON product_policies_view TO anon, authenticated;

GRANT INSERT, UPDATE ON vendors TO authenticated;
GRANT INSERT, UPDATE, DELETE ON vendor_policies TO authenticated;
GRANT INSERT, UPDATE, DELETE ON product_policies TO authenticated;

-- ============================================
-- 9. INSERT SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample vendors for testing

/*
INSERT INTO vendors (id, name, user_id, email, phone, location, trust_score, fulfillment_rate) VALUES
  ('vendor_001', 'FreshCo Farms', 'user_001', 'contact@freshco.com', '+254712345678', 'Nairobi', 4.5, 95.5),
  ('vendor_002', 'AgroMart Kenya', 'user_002', 'info@agromart.co.ke', '+254723456789', 'Kiambu', 4.8, 98.2),
  ('vendor_003', 'Green Valley Supplies', 'user_003', 'sales@greenvalley.com', '+254734567890', 'Nakuru', 4.2, 92.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendor_policies (vendor_id, escrow_enabled, return_window_hours, refund_policy) VALUES
  ('vendor_001', TRUE, 48, 'full'),
  ('vendor_002', TRUE, 24, 'partial'),
  ('vendor_003', FALSE, 12, 'none')
ON CONFLICT (vendor_id) DO NOTHING;
*/

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup worked correctly

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('vendors'),
    ('vendor_policies'),
    ('product_policies')
) AS t(table_name);

-- Check if view exists
SELECT 
  'product_policies_view' as view_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_schema = 'public' AND table_name = 'product_policies_view'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check if vendor_id column exists in products
SELECT 
  'products.vendor_id' as column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'vendor_id'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- ============================================
-- DONE! 
-- ============================================
-- After running this script:
-- 1. Verify all tables and views were created successfully
-- 2. Check that the product_policies_view returns data
-- 3. Test the tRPC endpoint: backend/trpc/routes/products/get-policies.ts
-- 4. Optionally insert sample data for testing
