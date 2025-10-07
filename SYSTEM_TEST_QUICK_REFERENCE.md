# 🚀 System Test Quick Reference Card

## 📱 Access System Health Dashboard

### From App
1. Open **Settings**
2. Scroll to **System** section
3. Tap **System Health Check**

### Direct URL
Navigate to: `/system-test`

---

## 🎯 What You'll See

### 1. Overall Status Badge
- 🟢 **HEALTHY** - All systems go
- 🟡 **DEGRADED** - Some warnings
- 🔴 **UNHEALTHY** - Critical issues

### 2. Service Cards
Each service shows:
- Status indicator (operational/warning/error)
- Key metrics (counts, transactions)
- Color-coded status badge

### 3. Cron Jobs Section
- Job name and schedule
- Last run timestamp
- Active/Inactive status
- Next scheduled run

### 4. System Alerts
- Alert type and severity
- Descriptive message
- Color-coded by priority

---

## 🔍 Service Monitoring

### Database
- **Status**: Connection health
- **Metric**: Response time (ms)
- **Healthy**: < 500ms

### AgriPay Wallet System
- **Status**: Wallet operations
- **Metrics**: 
  - Total wallets created
  - Recent transactions (last hour)
- **Healthy**: All operations functional

### TradeGuard Escrow
- **Status**: Reserve operations
- **Metrics**:
  - Active reserves (funds held)
  - Open disputes
- **Healthy**: < 100 active reserves, < 5 disputes

### Fraud Detection
- **Status**: Alert monitoring
- **Metric**: Open fraud alerts
- **Healthy**: < 10 open alerts

### Payout System
- **Status**: Withdrawal processing
- **Metric**: Pending payouts
- **Healthy**: Processing normally

---

## ⏰ Cron Job Status

### Auto-Release Reserves
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Function**: Releases funds after 72 hours
- **Check**: Last run should be within 15 minutes

### Detect Fraud
- **Schedule**: Daily at 2 AM (`0 2 * * *`)
- **Function**: Scans for suspicious activity
- **Check**: Last run should be within 24 hours

---

## 🚨 Alert Severity Levels

### 🔴 Critical
- System errors
- Database failures
- Requires immediate action

### 🟡 Warning
- High fraud alert count (>10)
- Performance degradation
- Requires attention

### 🔵 Info
- High dispute count (>5)
- High reserve count (>100)
- Informational only

---

## 🔄 Refresh Options

### Auto-Refresh
- Automatically refreshes every 30 seconds
- Shows real-time status

### Manual Refresh
- Tap refresh icon in header
- Pull down to refresh

---

## ✅ Quick Health Check

### All Systems Healthy
- ✅ Status: HEALTHY
- ✅ All services: operational
- ✅ Response time: < 500ms
- ✅ No critical alerts
- ✅ Cron jobs: active and running

### System Degraded
- ⚠️ Status: DEGRADED
- ⚠️ Some warnings present
- ⚠️ High alert/dispute count
- ✅ Core functions still working

### System Unhealthy
- ❌ Status: UNHEALTHY
- ❌ Critical service failure
- ❌ Database connection issues
- ❌ Requires immediate attention

---

## 🛠️ Quick Actions

### From Health Dashboard
- **View Wallet** → Navigate to wallet screen
- **View Disputes** → Navigate to disputes screen
- **Retry** → Retry failed health check

---

## 📊 Key Metrics to Monitor

### Daily
- [ ] All services showing "operational"
- [ ] Cron jobs ran in last 24 hours
- [ ] No critical alerts
- [ ] Response times < 500ms

### Weekly
- [ ] Transaction volume trends
- [ ] Reserve release rates
- [ ] Dispute resolution times
- [ ] Fraud alert patterns

---

## 🔧 Troubleshooting

### Health Check Fails
1. Check internet connection
2. Verify Supabase is online
3. Check database tables exist
4. Review RLS policies

### Cron Jobs Not Running
1. Verify pg_cron extension enabled
2. Check job schedule in Supabase
3. Review job execution logs
4. Ensure functions exist

### High Response Times
1. Check database performance
2. Review query optimization
3. Check for missing indexes
4. Monitor concurrent users

---

## 📞 Need Help?

### Documentation
- `AGRIPAY_SYSTEM_TEST_GUIDE.md` - Full testing guide
- `AGRIPAY_SYSTEM_COMPLETE_SUMMARY.md` - Implementation summary

### Database Setup
- `SUPABASE_EDGE_FUNCTIONS.sql` - Core functions
- `SUPABASE_HEALTH_CHECK_FUNCTION.sql` - Health monitoring

### Support
1. Check documentation first
2. Review Supabase logs
3. Test individual components
4. Contact system administrator

---

## 🎯 Success Indicators

### ✅ System Ready
- All services operational
- Cron jobs active
- No critical alerts
- Fast response times

### ⚠️ Needs Attention
- Warnings present
- High alert count
- Slow response times
- Review recommended

### ❌ Critical Issue
- Service failures
- Database errors
- Cron jobs inactive
- Immediate action required

---

**Quick Tip**: Bookmark `/system-test` for easy access to system health monitoring!

**Last Updated**: 2025-10-07
