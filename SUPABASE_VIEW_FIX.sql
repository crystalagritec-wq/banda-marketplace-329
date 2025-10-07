-- ============================================
-- BANDA PRODUCT POLICIES VIEW FIX
-- ============================================
-- This script fixes the product_policies_view to handle UUID/TEXT type mismatches
-- Run this in your Supabase SQL Editor

-- ============================================
-- OPTION 1: RECOMMENDED - Cast all IDs to TEXT
-- ============================================
-- This approach ensures consistent TEXT types throughout the view
-- and matches the TypeScript expectations in the codebase

CREATE OR REPLACE VIEW product_policies_view AS
SELECT
  p.id::text AS product_id,
  COALESCE(p.vendor_id, p.user_id)::text AS vendor_id,
  COALESCE(pp.escrow_enabled, vp.escrow_enabled, v.escrow_enabled, TRUE) AS escrow_enabled,
  COALESCE(pp.return_window_hours, vp.return_window_hours, v.return_window_hours, 24) AS return_window_hours,
  COALESCE(pp.refund_policy, vp.refund_policy, v.refund_policy, 'partial') AS refund_policy,
  COALESCE(pp.notes, vp.notes, v.notes) AS notes,
  -- Add source tracking to see which policy level is being used
  CASE 
    WHEN pp.escrow_enabled IS NOT NULL THEN 'product'
    WHEN vp.escrow_enabled IS NOT NULL THEN 'vendor_policy'
    WHEN v.escrow_enabled IS NOT NULL THEN 'vendor'
    ELSE 'global'
  END AS escrow_source,
  CASE 
    WHEN pp.return_window_hours IS NOT NULL THEN 'product'
    WHEN vp.return_window_hours IS NOT NULL THEN 'vendor_policy'
    WHEN v.return_window_hours IS NOT NULL THEN 'vendor'
    ELSE 'global'
  END AS return_window_source,
  CASE 
    WHEN pp.refund_policy IS NOT NULL THEN 'product'
    WHEN vp.refund_policy IS NOT NULL THEN 'vendor_policy'
    WHEN v.refund_policy IS NOT NULL THEN 'vendor'
    ELSE 'global'
  END AS refund_policy_source
FROM products p
LEFT JOIN product_policies pp ON pp.product_id = p.id::text
LEFT JOIN vendor_policies vp ON vp.vendor_id = COALESCE(p.vendor_id, p.user_id)::text
LEFT JOIN vendors v ON v.id = COALESCE(p.vendor_id, p.user_id)::text;

-- Grant permissions
GRANT SELECT ON product_policies_view TO anon, authenticated;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the view works correctly
SELECT 
  product_id,
  vendor_id,
  escrow_enabled,
  return_window_hours,
  refund_policy,
  escrow_source,
  return_window_source,
  refund_policy_source
FROM product_policies_view
LIMIT 5;

-- ============================================
-- ALTERNATIVE OPTION 2: Remove vendor join (simpler)
-- ============================================
-- If you don't need vendor-level fallback, use this simpler version:
/*
CREATE OR REPLACE VIEW product_policies_view AS
SELECT
  p.id::text AS product_id,
  COALESCE(p.vendor_id, p.user_id)::text AS vendor_id,
  COALESCE(pp.escrow_enabled, vp.escrow_enabled, TRUE) AS escrow_enabled,
  COALESCE(pp.return_window_hours, vp.return_window_hours, 24) AS return_window_hours,
  COALESCE(pp.refund_policy, vp.refund_policy, 'partial') AS refund_policy,
  COALESCE(pp.notes, vp.notes) AS notes
FROM products p
LEFT JOIN product_policies pp ON pp.product_id = p.id::text
LEFT JOIN vendor_policies vp ON vp.vendor_id = COALESCE(p.vendor_id, p.user_id)::text;
*/

-- ============================================
-- DONE! ✅
-- ============================================
