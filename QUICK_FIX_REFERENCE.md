# Quick Fix Reference Card

## 🚨 Emergency Fixes

### Wallet Creation Not Working
```bash
# 1. Check environment variable
cat .env.local | grep EXPO_PUBLIC_RORK_API_BASE_URL

# 2. If missing, add it:
echo "EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081" >> .env.local

# 3. Restart expo
npx expo start -c
```

### Shop Onboarding Loops
✅ **FIXED** - Already implemented in `app/onboarding/shop/tutorial.tsx`

### Service Provider Onboarding Loops
⏳ **TO FIX** - Add to final step:
```typescript
const completeOnboardingMutation = trpc.serviceProviders.completeOnboarding.useMutation();

const handleComplete = async () => {
  const result = await completeOnboardingMutation.mutateAsync({
    providerType: state.providerType,
    personalDetails: state.personalDetails,
    serviceTypes: state.serviceTypes,
    serviceAreas: state.serviceAreas,
    discoverable: true,
    instantRequests: true,
    paymentMethod: 'agripay',
  });
  
  if (result.success) {
    router.replace('/service-provider-dashboard');
  }
};
```

### Logistics Onboarding Loops
⏳ **TO FIX** - Add to `app/inboarding/logistics-complete.tsx`:
```typescript
const completeOnboardingMutation = trpc.logisticsInboarding.completeOnboarding.useMutation();

const handleComplete = async () => {
  const result = await completeOnboardingMutation.mutateAsync({
    role: state.logisticsData.role,
    ownerDetails: state.logisticsData.ownerDetails,
    driverDetails: state.logisticsData.driverDetails,
  });
  
  if (result.success) {
    router.replace('/logistics-dashboard');
  }
};
```

### Farm Onboarding Not Working
⏳ **TO FIX** - Create backend procedure first, then add to frontend

---

## 🔍 Quick Diagnostics

### Check if Backend is Running
```bash
curl http://localhost:8081/api/trpc/system.health
# Should return: {"success":true}
```

### Check Database Connection
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM profiles;
-- Should return a number
```

### Check User Session
```typescript
// In app console
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('banda_user').then(console.log);
```

### Check Wallet Status
```typescript
// In app console
const walletQuery = trpc.agripay.getWallet.useQuery({ userId: user.id });
console.log(walletQuery.data);
```

---

## 📋 Status Checklist

### ✅ Fixed
- [x] Wallet creation environment variable
- [x] Shop onboarding backend sync
- [x] Shop onboarding redirect

### ⏳ In Progress
- [ ] Service provider onboarding
- [ ] Logistics onboarding
- [ ] Farm onboarding backend
- [ ] Dashboard progress calculation

### 📝 Pending
- [ ] Error handling improvements
- [ ] Retry mechanisms
- [ ] Progress persistence
- [ ] Analytics integration

---

## 🎯 Quick Test

### Test Wallet Creation
1. Sign in
2. Tap "Create Wallet"
3. Complete 4 steps
4. Should see wallet ID
5. Should redirect to wallet screen

### Test Shop Onboarding
1. From dashboard, tap "Add Shop"
2. Complete 4 steps
3. Should redirect to shop dashboard
4. Dashboard should show "Active"

---

## 📞 Quick Support

### Common Errors

**"No base url found"**
→ Add `EXPO_PUBLIC_RORK_API_BASE_URL` to `.env.local`

**"Network request failed"**
→ Check backend is running on port 8081

**"Failed to create wallet"**
→ Check database tables exist

**"Location Required"**
→ Set location in onboarding step

**Loops back to start**
→ Check backend sync call is present

---

## 🔗 Quick Links

- [Full Audit Report](./ONBOARDING_AUDIT_COMPLETE.md)
- [Implementation Summary](./ONBOARDING_FIXES_IMPLEMENTATION_SUMMARY.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Detailed Fixes](./ONBOARDING_DASHBOARD_FIXES.md)

---

**Last Updated**: 2025-01-11  
**Version**: 1.0  
**Status**: 2/6 Issues Fixed
