# Onboarding & Dashboard Testing Guide

## 🚀 Quick Setup

### 1. Environment Configuration
```bash
# Ensure .env.local has this line:
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081

# Restart expo with cache clear:
npx expo start -c
```

### 2. Database Check
Verify these tables exist in Supabase:
- ✅ `profiles`
- ✅ `agripay_wallets`
- ✅ `wallet_pins`
- ✅ `service_providers`
- ✅ `service_types`
- ✅ `logistics_owners`
- ✅ `logistics_drivers`
- ✅ `logistics_vehicles`
- ⚠️ `farms` (may need to be created)

## 🧪 Test Scenarios

### Test 1: Wallet Creation ✅ FIXED
**Expected**: User can create wallet successfully

**Steps**:
1. Sign in to the app
2. Navigate to Wallet tab or tap "Create Wallet"
3. Enter phone number (e.g., 0712345678)
4. Tap "Continue"
5. Create 4-digit PIN (e.g., 1234)
6. Confirm PIN (enter 1234 again)
7. Tap "Continue"
8. Read and accept terms & conditions
9. Tap "Create My Wallet"
10. Wait for success screen
11. Copy wallet ID
12. Tap "Continue to Dashboard"

**Expected Results**:
- ✅ Phone verification succeeds
- ✅ PIN creation succeeds
- ✅ Wallet created without errors
- ✅ Wallet ID displayed (e.g., BW-123456)
- ✅ Redirects to wallet screen
- ✅ Wallet balance shows KSh 0
- ✅ Wallet persists after app restart

**Common Errors**:
- ❌ "No base url found" → Check `.env.local`
- ❌ "Network request failed" → Check backend is running
- ❌ "Failed to create wallet" → Check database tables exist

---

### Test 2: Shop Onboarding ✅ FIXED
**Expected**: User can complete shop setup and access dashboard

**Steps**:
1. From main dashboard, tap "Add Shop"
2. **Step 1: Shop Profile**
   - Enter shop name (e.g., "Fresh Produce Shop")
   - Select category (e.g., "Vegetables")
   - Enter contact (e.g., 0712345678)
   - Set location
   - Tap "Continue"
3. **Step 2: Add Products**
   - Select number of products (e.g., 2)
   - Tap "Continue"
4. **Step 3: Wallet Setup**
   - If wallet exists, tap "Continue"
   - If not, complete wallet creation
5. **Step 4: Tutorial**
   - Read all 4 cards (tap each one)
   - Tap "Go to Dashboard"

**Expected Results**:
- ✅ All steps complete without errors
- ✅ Progress bar shows 100%
- ✅ Shop profile synced to database
- ✅ Sample products created (if selected)
- ✅ Redirects to `/shop-dashboard`
- ✅ Dashboard shows shop as "Active"
- ✅ Main dashboard shows shop at 100%

**Database Verification**:
```sql
-- Check shop profile
SELECT * FROM profiles WHERE id = 'user-id';
-- Should have: business_name, vendor_display_name, phone, location_*

-- Check products
SELECT * FROM products WHERE vendor_id = 'user-id';
-- Should have 2 products if selected
```

**Common Errors**:
- ❌ "Location Required" → Set location in step 1
- ❌ "Failed to complete onboarding" → Check backend logs
- ❌ Loops back to step 1 → Check `completeOnboarding` mutation
- ❌ Dashboard shows 50% → Old issue, should be fixed

---

### Test 3: Service Provider Onboarding ⏳ NEEDS FIX
**Expected**: User can complete service provider setup

**Steps**:
1. From main dashboard, tap "Add Service"
2. Select provider type (Individual/Organization)
3. Enter personal/organization details
4. Select service types
5. Set service areas
6. Configure availability
7. Set payment method
8. Review and submit

**Current Issue**: ❌ Loops back after submission

**Expected Results** (after fix):
- ✅ All steps complete without errors
- ✅ Service provider profile created
- ✅ Redirects to `/service-provider-dashboard`
- ✅ Dashboard shows service as "Active"

**Required Fix**:
```typescript
// In final step (e.g., app/inboarding/service-summary.tsx)
const completeOnboardingMutation = trpc.serviceProviders.completeOnboarding.useMutation();

const handleComplete = async () => {
  const result = await completeOnboardingMutation.mutateAsync({
    providerType: 'individual',
    personalDetails: { /* ... */ },
    serviceTypes: ['Tractor Services', 'Plowing'],
    serviceAreas: ['Nairobi', 'Kiambu'],
    discoverable: true,
    instantRequests: true,
    paymentMethod: 'agripay',
  });
  
  if (result.success) {
    router.replace('/service-provider-dashboard');
  }
};
```

---

### Test 4: Logistics Onboarding ⏳ NEEDS FIX
**Expected**: Owner/Driver can complete logistics setup

**Steps (Owner)**:
1. From main dashboard, tap "Add Logistics"
2. Select "Owner"
3. Enter full name, phone, KRA PIN
4. Add vehicle details
5. Upload vehicle photos
6. Review and submit

**Steps (Driver)**:
1. From main dashboard, tap "Add Logistics"
2. Select "Driver"
3. Enter full name, phone, ID number
4. Upload license and selfie
5. Set discoverability
6. Review and submit

**Current Issue**: ❌ Loops back after submission

**Expected Results** (after fix):
- ✅ All steps complete without errors
- ✅ Owner/Driver profile created
- ✅ Vehicles/license data saved
- ✅ Redirects to `/logistics-dashboard`
- ✅ Dashboard shows logistics as "Active"

**Required Fix**:
```typescript
// In app/inboarding/logistics-complete.tsx
const completeOnboardingMutation = trpc.logisticsInboarding.completeOnboarding.useMutation();

const handleComplete = async () => {
  const result = await completeOnboardingMutation.mutateAsync({
    role: 'owner', // or 'driver'
    ownerDetails: { /* ... */ }, // if owner
    driverDetails: { /* ... */ }, // if driver
  });
  
  if (result.success) {
    router.replace('/logistics-dashboard');
  }
};
```

---

### Test 5: Farm Onboarding ⏳ NEEDS BACKEND
**Expected**: User can complete farm setup

**Steps**:
1. From main dashboard, tap "Add Farm"
2. Enter farm details
3. Add crops
4. Add workers
5. Review analytics
6. Submit

**Current Issue**: ❌ No backend procedure exists

**Required Implementation**:
1. Create `backend/trpc/routes/farm/complete-onboarding.ts`
2. Add to app router
3. Call from frontend final step
4. Redirect to `/farm-dashboard`

---

### Test 6: Dashboard Navigation
**Expected**: User can navigate between dashboards

**Steps**:
1. Complete at least 2 onboarding flows (e.g., Shop + Service)
2. Go to main dashboard
3. Verify both show "Active" status
4. Tap Shop card → Should open shop dashboard
5. Tap back → Should return to main dashboard
6. Tap Service card → Should open service dashboard
7. Tap back → Should return to main dashboard

**Expected Results**:
- ✅ All completed roles show "Active"
- ✅ Progress shows 100% for completed roles
- ✅ Tapping opens correct dashboard
- ✅ Back navigation works
- ✅ No crashes or errors

---

## 🐛 Debugging

### Check Console Logs
```bash
# Terminal running expo
# Look for:
[Onboarding] Syncing shop data to database...
[Onboarding] Completing shop onboarding...
[Onboarding] Shop profile created successfully
[Onboarding] Shop activation complete

# Or errors:
[Onboarding] Activation error: ...
```

### Check Network Requests
```bash
# In browser console (if using web)
# Filter by: trpc
# Look for:
POST /api/trpc/shop.completeOnboarding
Status: 200 OK
Response: { success: true, ... }
```

### Check Database
```sql
-- Verify shop profile
SELECT 
  id,
  business_name,
  vendor_display_name,
  phone,
  location_lat,
  location_lng
FROM profiles 
WHERE id = 'your-user-id';

-- Verify service provider
SELECT * FROM service_providers WHERE user_id = 'your-user-id';

-- Verify logistics
SELECT * FROM logistics_owners WHERE user_id = 'your-user-id';
SELECT * FROM logistics_drivers WHERE user_id = 'your-user-id';

-- Verify wallet
SELECT * FROM agripay_wallets WHERE user_id = 'your-user-id';
```

### Check Local Storage
```typescript
// In app console
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check onboarding state
AsyncStorage.getItem('banda_onboarding_state').then(console.log);

// Check wallet session
AsyncStorage.getItem('wallet_session').then(console.log);

// Check user session
AsyncStorage.getItem('banda_user').then(console.log);
```

---

## ✅ Success Checklist

### Wallet Creation
- [ ] Environment variable set
- [ ] Backend running on port 8081
- [ ] Can create wallet without errors
- [ ] Wallet ID displayed
- [ ] PIN set successfully
- [ ] Redirects to wallet screen
- [ ] Wallet persists after restart

### Shop Onboarding
- [ ] Can complete all 4 steps
- [ ] No errors during submission
- [ ] Redirects to shop dashboard
- [ ] Dashboard shows "Active"
- [ ] Main dashboard shows 100%
- [ ] Database has shop profile
- [ ] Sample products created

### Service Provider Onboarding
- [ ] Can complete all steps
- [ ] No errors during submission
- [ ] Redirects to service dashboard
- [ ] Dashboard shows "Active"
- [ ] Database has provider profile

### Logistics Onboarding
- [ ] Owner flow works
- [ ] Driver flow works
- [ ] No errors during submission
- [ ] Redirects to logistics dashboard
- [ ] Database has profiles

### Farm Onboarding
- [ ] Backend procedure created
- [ ] Can complete all steps
- [ ] Redirects to farm dashboard
- [ ] Database has farm data

### Dashboard
- [ ] All roles show correct status
- [ ] Progress percentages accurate
- [ ] Navigation works correctly
- [ ] No crashes or errors

---

## 📊 Test Results Template

```markdown
## Test Session: [Date]
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]
**Device**: [iOS/Android/Web]

### Wallet Creation
- Status: ✅ Pass / ❌ Fail
- Notes: 

### Shop Onboarding
- Status: ✅ Pass / ❌ Fail
- Notes:

### Service Provider Onboarding
- Status: ✅ Pass / ❌ Fail
- Notes:

### Logistics Onboarding
- Status: ✅ Pass / ❌ Fail
- Notes:

### Farm Onboarding
- Status: ✅ Pass / ❌ Fail
- Notes:

### Dashboard Navigation
- Status: ✅ Pass / ❌ Fail
- Notes:

### Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 
```

---

**Last Updated**: 2025-01-11
**Next Review**: After implementing remaining fixes
