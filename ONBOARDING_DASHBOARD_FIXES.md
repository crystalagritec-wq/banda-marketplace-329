# Onboarding & Dashboard Access Fixes

## Issues Identified

### 1. **Wallet Creation Blocker**
- **Problem**: "Create Wallet" button does nothing after accepting terms
- **Root Cause**: Missing `EXPO_PUBLIC_RORK_API_BASE_URL` environment variable
- **Impact**: Users cannot create wallets, blocking all payment functionality

### 2. **Shop Onboarding Loop**
- **Problem**: After completing shop setup, users loop back instead of accessing dashboard
- **Root Cause**: Missing call to `completeShopOnboardingProcedure` in tutorial screen
- **Impact**: Shop vendors cannot access their dashboard

### 3. **Service Provider Onboarding Loop**
- **Problem**: Service provider onboarding doesn't finalize
- **Root Cause**: Missing completion call in service onboarding flow
- **Impact**: Service providers cannot access their dashboard

### 4. **Logistics Onboarding Loop**
- **Problem**: Logistics owner/driver onboarding doesn't complete
- **Root Cause**: Missing completion call in logistics onboarding flow
- **Impact**: Logistics providers cannot access their dashboard

### 5. **Farm Onboarding Loop**
- **Problem**: Farm onboarding doesn't finalize
- **Root Cause**: No backend procedure for farm onboarding completion
- **Impact**: Farmers cannot access their dashboard

### 6. **Dashboard Progress Stuck at 50%**
- **Problem**: Dashboard shows "50% complete" but doesn't allow access
- **Root Cause**: Progress calculation doesn't account for backend sync
- **Impact**: Confusing UX, users don't know what's missing

## Solutions Implemented

### 1. Environment Variable Check
```typescript
// Added to lib/trpc.ts
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  
  // Fallback for development
  if (__DEV__) {
    console.warn('⚠️ EXPO_PUBLIC_RORK_API_BASE_URL not set, using localhost');
    return 'http://localhost:8081';
  }
  
  throw new Error(
    "No base url found. Please set EXPO_PUBLIC_RORK_API_BASE_URL in .env.local"
  );
};
```

### 2. Shop Onboarding Completion
- Added call to `completeShopOnboardingProcedure` in tutorial screen
- Syncs shop data to database before marking complete
- Redirects to shop dashboard on success

### 3. Service Provider Completion
- Added completion flow in service onboarding
- Creates service provider profile in database
- Redirects to service provider dashboard

### 4. Logistics Completion
- Added completion flow for both owner and driver roles
- Creates logistics profiles in database
- Redirects to logistics dashboard

### 5. Farm Onboarding Backend
- Created `completeFarmOnboardingProcedure`
- Syncs farm data to database
- Enables farm dashboard access

### 6. Wallet Persistence
- Wallet is created once and persists
- Added wallet session caching
- Prevents duplicate wallet creation

## Testing Checklist

### Wallet Creation
- [ ] User can tap "Create Wallet" button
- [ ] Loading indicator shows during creation
- [ ] Success screen displays wallet ID
- [ ] User can copy wallet ID
- [ ] Redirects to wallet screen
- [ ] Wallet persists across app restarts

### Shop Onboarding
- [ ] User can complete all 4 steps
- [ ] Progress bar shows 100% at end
- [ ] "Go to Dashboard" button works
- [ ] Redirects to shop dashboard
- [ ] Shop data synced to database
- [ ] Dashboard shows shop as "Active"

### Service Provider Onboarding
- [ ] User can complete all steps
- [ ] Service types are saved
- [ ] Profile created in database
- [ ] Redirects to service dashboard
- [ ] Dashboard shows provider as "Active"

### Logistics Onboarding
- [ ] Owner can complete onboarding
- [ ] Driver can complete onboarding
- [ ] Vehicles/license data saved
- [ ] Redirects to logistics dashboard
- [ ] Dashboard shows logistics as "Active"

### Farm Onboarding
- [ ] User can complete farm setup
- [ ] Farm data synced to database
- [ ] Redirects to farm dashboard
- [ ] Dashboard shows farm as "Active"

### Dashboard Access
- [ ] Completed roles show 100% progress
- [ ] "Active" status displayed correctly
- [ ] Tapping role card opens dashboard
- [ ] Dashboard loads without errors
- [ ] User can navigate back to main dashboard

## Environment Setup

Add to `.env.local`:
```bash
# Backend API URL (required for tRPC)
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081

# Or for production
# EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-domain.com
```

## Database Requirements

Ensure these tables exist in Supabase:
- `profiles` (with vendor fields)
- `service_providers`
- `service_types`
- `logistics_owners`
- `logistics_drivers`
- `logistics_vehicles`
- `farms` (to be created)
- `agripay_wallets`
- `wallet_pins`

## User Flow Summary

### First Time User
1. Sign up / Login
2. See main dashboard with all roles at 0%
3. Tap "Add Shop" → Complete onboarding → Access shop dashboard
4. Return to main dashboard
5. Tap "Add Service" → Complete onboarding → Access service dashboard
6. And so on...

### Wallet Creation
1. User taps "Create Wallet" from any screen
2. Complete phone verification
3. Set 4-digit PIN
4. Accept terms & conditions
5. Wallet created instantly
6. Wallet persists forever (one per user)

### Dashboard Navigation
- Main dashboard shows all business units
- Each unit shows progress % and status
- Tap unit to access specific dashboard
- Complete remaining setup steps in dashboard
- Progress updates in real-time

## Error Handling

### API Connection Errors
- Show user-friendly error message
- Suggest checking internet connection
- Provide retry button
- Log detailed error for debugging

### Database Errors
- Catch and display specific error messages
- Prevent data loss with local caching
- Allow retry without losing form data
- Log errors for monitoring

### Validation Errors
- Show inline validation messages
- Highlight problematic fields
- Provide clear guidance on fixing
- Prevent submission until valid

## Next Steps

1. **Test all onboarding flows** with real users
2. **Monitor error logs** for common issues
3. **Add analytics** to track completion rates
4. **Implement progress saving** for partial completions
5. **Add onboarding tutorials** with screenshots
6. **Create help documentation** for each role
7. **Add support chat** for stuck users
8. **Implement email notifications** for completion
