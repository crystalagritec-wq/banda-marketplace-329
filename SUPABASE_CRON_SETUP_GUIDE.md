# 🔄 Supabase Cron Jobs Setup Guide

## Overview
This guide provides step-by-step instructions for setting up automated cron jobs in Supabase for the Banda AgriPay + TradeGuard system.

## Prerequisites
- Supabase project with admin access
- `pg_cron` extension enabled
- All SQL functions from `SUPABASE_EDGE_FUNCTIONS.sql` executed

---

## 📋 Step 1: Enable pg_cron Extension

1. Go to **Supabase Dashboard** → **Database** → **Extensions**
2. Search for `pg_cron`
3. Click **Enable** if not already enabled

---

## 🚀 Step 2: Set Up Cron Jobs

### Option A: Using Supabase SQL Editor (Recommended)

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the following SQL:

```sql
-- =====================================================
-- BANDA AGRIPAY CRON JOBS SETUP
-- =====================================================

-- 1. Auto-Release Expired Reserves (Every 15 minutes)
SELECT cron.schedule(
  'auto-release-reserves',
  '*/15 * * * *',
  $$SELECT * FROM auto_release_expired_reserves()$$
);

-- 2. Fraud Detection (Every 6 hours)
SELECT cron.schedule(
  'detect-fraud',
  '0 */6 * * *',
  $$SELECT * FROM detect_fraud()$$
);

-- 3. Duplicate QR Detection (Every hour)
SELECT cron.schedule(
  'detect-duplicate-qr',
  '0 * * * *',
  $$SELECT * FROM detect_duplicate_qr_scans()$$
);

-- 4. Auto-Resolve Disputes (Daily at 2 AM)
SELECT cron.schedule(
  'auto-resolve-disputes',
  '0 2 * * *',
  $$SELECT * FROM auto_resolve_disputes()$$
);
```

4. Click **Run** to execute

### Option B: Using Supabase CLI

```bash
# Connect to your Supabase project
supabase db push

# Run the cron setup SQL file
psql $DATABASE_URL -f SUPABASE_CRON_SETUP.sql
```

---

## 📊 Step 3: Verify Cron Jobs

Run this query to check all scheduled jobs:

```sql
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobid;
```

Expected output:
| jobid | schedule | command | active |
|-------|----------|---------|--------|
| 1 | */15 * * * * | SELECT * FROM auto_release_expired_reserves() | t |
| 2 | 0 */6 * * * | SELECT * FROM detect_fraud() | t |
| 3 | 0 * * * * | SELECT * FROM detect_duplicate_qr_scans() | t |
| 4 | 0 2 * * * | SELECT * FROM auto_resolve_disputes() | t |

---

## 🔍 Step 4: Monitor Cron Job Execution

### View Job Run History

```sql
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 50;
```

### Check for Failed Jobs

```sql
SELECT 
  jobid,
  runid,
  command,
  status,
  return_message,
  start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 20;
```

---

## 🛠️ Step 5: Manage Cron Jobs

### Pause a Job

```sql
UPDATE cron.job 
SET active = false 
WHERE jobid = 1;  -- Replace with actual job ID
```

### Resume a Job

```sql
UPDATE cron.job 
SET active = true 
WHERE jobid = 1;  -- Replace with actual job ID
```

### Delete a Job

```sql
SELECT cron.unschedule(1);  -- Replace with actual job ID
```

### Update Job Schedule

```sql
SELECT cron.alter_job(
  job_id := 1,
  schedule := '*/30 * * * *'  -- New schedule
);
```

---

## 📈 Step 6: Set Up Monitoring Alerts

### Create Alert for Failed Jobs

```sql
CREATE OR REPLACE FUNCTION notify_failed_cron_jobs()
RETURNS void AS $$
DECLARE
  v_failed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_failed_count
  FROM cron.job_run_details
  WHERE status = 'failed'
    AND start_time >= NOW() - INTERVAL '1 hour';
  
  IF v_failed_count > 0 THEN
    -- Log to a monitoring table
    INSERT INTO system_alerts (alert_type, severity, message, created_at)
    VALUES (
      'cron_job_failure',
      'high',
      format('%s cron jobs failed in the last hour', v_failed_count),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule the monitoring function (every hour)
SELECT cron.schedule(
  'monitor-cron-failures',
  '0 * * * *',
  $$SELECT notify_failed_cron_jobs()$$
);
```

---

## 🧪 Step 7: Test Cron Jobs Manually

You can manually trigger any cron job function to test:

```sql
-- Test auto-release
SELECT * FROM auto_release_expired_reserves();

-- Test fraud detection
SELECT * FROM detect_fraud();

-- Test duplicate QR detection
SELECT * FROM detect_duplicate_qr_scans();

-- Test auto-resolve disputes
SELECT * FROM auto_resolve_disputes();
```

---

## 📝 Cron Schedule Reference

| Expression | Description | Example |
|------------|-------------|---------|
| `*/15 * * * *` | Every 15 minutes | Auto-release reserves |
| `0 */6 * * *` | Every 6 hours | Fraud detection |
| `0 * * * *` | Every hour | QR duplicate check |
| `0 2 * * *` | Daily at 2 AM | Dispute resolution |
| `0 0 * * 0` | Weekly on Sunday | Weekly reports |
| `0 0 1 * *` | Monthly on 1st | Monthly cleanup |

---

## 🚨 Troubleshooting

### Issue: Cron jobs not running

**Solution:**
1. Check if `pg_cron` extension is enabled
2. Verify database permissions
3. Check job status: `SELECT * FROM cron.job WHERE active = true;`

### Issue: Jobs failing silently

**Solution:**
1. Check job run details: `SELECT * FROM cron.job_run_details WHERE status = 'failed';`
2. Review function logs
3. Test function manually

### Issue: Performance degradation

**Solution:**
1. Adjust cron frequency
2. Add indexes to frequently queried tables
3. Optimize SQL functions

---

## 🔐 Security Best Practices

1. **Use Service Role Key** for cron jobs (not anon key)
2. **Limit Function Permissions** - only grant necessary access
3. **Monitor Execution Time** - set timeouts for long-running jobs
4. **Log All Actions** - maintain audit trail
5. **Test in Staging** before deploying to production

---

## 📊 Performance Optimization

### Add Indexes for Cron Job Queries

```sql
-- Index for auto-release queries
CREATE INDEX IF NOT EXISTS idx_reserves_auto_release 
ON tradeguard_reserves(status, auto_release_at) 
WHERE status = 'held' AND auto_release_enabled = true;

-- Index for fraud detection
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_fraud 
ON wallet_transactions(wallet_id, created_at, type);

-- Index for dispute resolution
CREATE INDEX IF NOT EXISTS idx_disputes_auto_resolve 
ON tradeguard_disputes(status, created_at) 
WHERE status = 'open';
```

---

## ✅ Verification Checklist

- [ ] `pg_cron` extension enabled
- [ ] All SQL functions from `SUPABASE_EDGE_FUNCTIONS.sql` executed
- [ ] All 4 cron jobs scheduled and active
- [ ] Test run completed successfully for each job
- [ ] Monitoring alerts configured
- [ ] Performance indexes created
- [ ] Documentation reviewed by team

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: **Dashboard** → **Logs** → **Database**
2. Review function execution: `SELECT * FROM cron.job_run_details;`
3. Contact Supabase support if needed

---

## 🎯 Next Steps

After setting up cron jobs:
1. Monitor execution for 24 hours
2. Review auto-release logs
3. Check fraud detection alerts
4. Verify dispute resolution workflow
5. Set up admin dashboard for monitoring

---

**Last Updated:** 2025-01-07
**Version:** 1.0.0
**Maintained by:** Banda Development Team
