-- =====================================================
-- BANDA AGRIPAY AUTO-RELEASE CRON JOB
-- Automatically releases expired reserves
-- =====================================================

-- Function to auto-release expired reserves
CREATE OR REPLACE FUNCTION auto_release_expired_reserves()
RETURNS void AS $$
DECLARE
  v_reserve RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Find all held reserves that have passed their auto-release time
  FOR v_reserve IN
    SELECT *
    FROM tradeguard_reserves
    WHERE status = 'held'
      AND auto_release_enabled = true
      AND auto_release_at <= NOW()
  LOOP
    BEGIN
      -- Release the reserve
      PERFORM release_reserve(v_reserve.id, v_reserve.seller_id);
      
      -- Update release reason
      UPDATE tradeguard_reserves
      SET release_reason = 'Auto-released after expiry'
      WHERE id = v_reserve.id;
      
      -- Update order status
      UPDATE orders
      SET 
        payment_status = 'completed',
        status = 'delivered'
      WHERE id = v_reserve.reference_id
        AND reference_type = 'order';
      
      v_count := v_count + 1;
      
      RAISE NOTICE 'Auto-released reserve % for order %', v_reserve.id, v_reserve.reference_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to auto-release reserve %: %', v_reserve.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Auto-released % reserves', v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SETUP CRON JOB (Using pg_cron extension)
-- =====================================================

-- Enable pg_cron extension (run as superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the auto-release job to run every hour
-- SELECT cron.schedule(
--   'auto-release-reserves',
--   '0 * * * *',  -- Every hour at minute 0
--   $$SELECT auto_release_expired_reserves()$$
-- );

-- =====================================================
-- ALTERNATIVE: Supabase Edge Function Approach
-- =====================================================

-- If pg_cron is not available, use Supabase Edge Functions
-- Create an edge function that calls this procedure via HTTP
-- Then use Supabase's built-in cron or external cron service

-- Example Edge Function (TypeScript):
/*
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { error } = await supabase.rpc('auto_release_expired_reserves')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
*/

-- =====================================================
-- MANUAL TRIGGER (For Testing)
-- =====================================================

-- Run this to manually trigger auto-release
-- SELECT auto_release_expired_reserves();

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Check reserves pending auto-release
SELECT 
  id,
  reference_id,
  total_amount,
  auto_release_at,
  NOW() - auto_release_at as overdue_by
FROM tradeguard_reserves
WHERE status = 'held'
  AND auto_release_enabled = true
  AND auto_release_at <= NOW()
ORDER BY auto_release_at ASC;

-- Check recently auto-released reserves
SELECT 
  id,
  reference_id,
  total_amount,
  released_at,
  release_reason
FROM tradeguard_reserves
WHERE status = 'released'
  AND release_reason = 'Auto-released after expiry'
  AND released_at >= NOW() - INTERVAL '24 hours'
ORDER BY released_at DESC;
