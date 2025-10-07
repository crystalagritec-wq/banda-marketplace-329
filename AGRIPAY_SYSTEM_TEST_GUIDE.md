# 🧪 AgriPay System Test & Monitoring Guide

## Overview
This guide helps you test and monitor the AgriPay + TradeGuard system health, verify cron jobs, and ensure all components are working correctly.

---

## 🚀 Quick Start

### 1. Access System Health Dashboard
Navigate to: **Settings → System Health Check** or directly to `/system-test`

The dashboard shows:
- ✅ Overall system status (Healthy/Degraded/Unhealthy)
- 📊 Service-level health metrics
- ⏰ Cron job execution status
- 🚨 Active alerts and warnings
- ⚡ Response times

---

## 🔧 Setup Required Functions

### Step 1: Create Health Check Function
Run this in **Supabase SQL Editor**:

```sql
-- Health Check Support Function
CREATE OR REPLACE FUNCTION get_cron_job_status()
RETURNS TABLE(
  jobname TEXT,
  schedule TEXT,
  last_run TIMESTAMPTZ,
  active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobname::TEXT,
    j.schedule::TEXT,
    MAX(jrd.start_time) as last_run,
    j.active
  FROM cron.job j
  LEFT JOIN cron.job_run_details jrd ON jrd.jobid = j.jobid
  WHERE j.jobname IN (
    'auto-release-reserves',
    'detect-fraud'
  )
  GROUP BY j.jobid, j.jobname, j.schedule, j.active
  ORDER BY j.jobname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_cron_job_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_job_status() TO anon;
```

### Step 2: Set Up Cron Jobs
Run this in **Supabase SQL Editor**:

```sql
-- Auto-release reserves every 15 minutes
SELECT cron.schedule(
  'auto-release-reserves',
  '*/15 * * * *',
  $$SELECT auto_release_reserves()$$
);

-- Detect fraud daily at 2 AM
SELECT cron.schedule(
  'detect-fraud',
  '0 2 * * *',
  $$SELECT detect_fraud()$$
);
```

### Step 3: Verify Cron Jobs
Check if cron jobs are created:

```sql
SELECT * FROM cron.job WHERE jobname IN ('auto-release-reserves', 'detect-fraud');
```

---

## 📊 What the Health Check Monitors

### 1. Database Service
- ✅ Connection status
- ⚡ Response time
- 📈 Query performance

### 2. AgriPay Wallet System
- 💰 Total wallets created
- 📊 Recent transactions (last hour)
- 🔄 Transaction processing status

### 3. TradeGuard Escrow
- 🔒 Active reserves (funds held)
- ⚖️ Open disputes
- 🛡️ Escrow integrity

### 4. Fraud Detection
- 🚨 Open fraud alerts
- ⚠️ Warning threshold: >10 alerts
- 🔍 Suspicious activity monitoring

### 5. Payout System
- 💸 Pending payout requests
- 👥 Driver/vendor payouts
- ⏳ Processing queue

---

## 🎯 Health Status Levels

### 🟢 Healthy
- All services operational
- No critical alerts
- Response times normal
- Cron jobs running

### 🟡 Degraded
- Some warnings present
- High alert count (>10 fraud alerts)
- Many open disputes (>5)
- High reserve count (>100)
- System still functional

### 🔴 Unhealthy
- Critical service failure
- Database connection issues
- System errors
- Requires immediate attention

---

## ⏰ Cron Job Monitoring

### Auto-Release Reserves
- **Schedule**: Every 15 minutes
- **Function**: `auto_release_reserves()`
- **Purpose**: Automatically release funds after 72 hours
- **Check**: Last run should be within 15 minutes

### Detect Fraud
- **Schedule**: Daily at 2 AM
- **Function**: `detect_fraud()`
- **Purpose**: Scan for suspicious transactions
- **Check**: Last run should be within 24 hours

---

## 🧪 Testing Checklist

### ✅ Pre-Production Tests

1. **Wallet Creation**
   ```typescript
   // Test in app
   const wallet = await trpc.agripay.createWallet.mutate({ userId });
   ```

2. **Fund Wallet**
   ```typescript
   await trpc.agripay.fundWallet.mutate({
     walletId,
     amount: 1000,
     method: 'mpesa'
   });
   ```

3. **Process Payment**
   ```typescript
   await trpc.checkout.processAgriPayPayment.mutate({
     buyerWalletId,
     sellerWalletId,
     amount: 500,
     orderId
   });
   ```

4. **Release Reserve**
   ```typescript
   await trpc.orders.releaseReserve.mutate({ orderId });
   ```

5. **Check Health**
   ```typescript
   const health = await trpc.system.agripayHealth.useQuery();
   ```

---

## 🚨 Alert Types

### Fraud Detection Alert
- **Severity**: Warning
- **Trigger**: >10 open fraud alerts
- **Action**: Review fraud_alerts table

### Disputes Alert
- **Severity**: Info
- **Trigger**: >5 open disputes
- **Action**: Review tradeguard_disputes table

### Reserves Alert
- **Severity**: Info
- **Trigger**: >100 active reserves
- **Action**: Monitor escrow liquidity

### System Error Alert
- **Severity**: Critical
- **Trigger**: Health check failure
- **Action**: Check database connection and logs

---

## 🔍 Troubleshooting

### Cron Jobs Not Running

1. Check if pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Enable if missing:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

3. Verify job schedule:
   ```sql
   SELECT * FROM cron.job;
   ```

### Health Check Fails

1. Check Supabase connection
2. Verify all tables exist:
   - `agripay_wallets`
   - `tradeguard_reserves`
   - `tradeguard_disputes`
   - `fraud_alerts`
   - `payout_requests`
   - `wallet_transactions`

3. Check RLS policies are not blocking queries

### High Response Times

1. Check database performance
2. Add indexes if needed:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_reserves_status 
   ON tradeguard_reserves(status);
   
   CREATE INDEX IF NOT EXISTS idx_disputes_status 
   ON tradeguard_disputes(status);
   ```

---

## 📱 Mobile App Integration

### Add to Settings Menu

```typescript
// In app/settings.tsx
<TouchableOpacity onPress={() => router.push('/system-test')}>
  <Text>System Health Check</Text>
</TouchableOpacity>
```

### Auto-refresh
The health check auto-refreshes every 30 seconds to provide real-time monitoring.

---

## 🎯 Production Monitoring

### Daily Checks
- ✅ All services showing "operational"
- ✅ Cron jobs ran in last 24 hours
- ✅ No critical alerts
- ✅ Response times < 500ms

### Weekly Reviews
- 📊 Transaction volume trends
- 💰 Reserve release rates
- ⚖️ Dispute resolution times
- 🚨 Fraud alert patterns

### Monthly Audits
- 🔍 Full system audit
- 📈 Performance optimization
- 🛡️ Security review
- 📊 Financial reconciliation

---

## 🔗 Related Documentation

- [AGRIPAY_TRADEGUARD_IMPLEMENTATION_COMPLETE.md](./AGRIPAY_TRADEGUARD_IMPLEMENTATION_COMPLETE.md)
- [SUPABASE_EDGE_FUNCTIONS.sql](./SUPABASE_EDGE_FUNCTIONS.sql)
- [SUPABASE_HEALTH_CHECK_FUNCTION.sql](./SUPABASE_HEALTH_CHECK_FUNCTION.sql)

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review Supabase logs
3. Test individual components
4. Contact system administrator

---

**Last Updated**: 2025-10-07
**Version**: 1.0.0
