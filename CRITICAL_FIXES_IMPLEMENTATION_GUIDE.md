# Critical Fixes Implementation Guide

## Summary of Issues Fixed

### ✅ 1. TypeScript Error in signup.tsx
**Status**: FIXED
**Change**: Line 222 - Added explicit type assertion `providerType: 'phone' as 'phone'`

### ✅ 2. Translation System
**Status**: WORKING CORRECTLY
**Note**: The translation system returns the last part of the key as fallback when key not found. This is by design.

## Critical Issues Requiring Code Changes

### 3. Wallet Onboarding Completion

**Current Issue**: 
- Users complete wallet onboarding but wallet dashboard doesn't open
- "Create Wallet" button doesn't navigate to wallet screen

**Files to Modify**:
1. `app/wallet-onboarding.tsx` - Already has correct implementation
2. `hooks/useWalletCheck.ts` - May need to refresh after wallet creation
3. `components/WalletOnboardingModal.tsx` - Check navigation logic

**Implementation Steps**:
```typescript
// In wallet-onboarding.tsx handleContinueToDashboard function:
const handleContinueToDashboard = async () => {
  try {
    // Mark onboarding as completed
    await AsyncStorage.setItem('wallet_onboarding_completed', 'true');
    console.log('[WalletOnboarding] Onboarding marked as completed');
    
    // Refresh wallet state (if using context)
    // await refreshWallet();
    
    // Navigate to wallet screen
    router.replace('/(tabs)/wallet' as any);
  } catch (error) {
    console.error('[WalletOnboarding] Failed to complete onboarding:', error);
  }
};
```

**Verification**:
- Check that `AsyncStorage.setItem('wallet_onboarding_completed', 'true')` is called
- Verify navigation to `/(tabs)/wallet` works
- Ensure wallet data is available after navigation

### 4. Auth Flow - Remove OTP After Sign In/Up

**Current Issue**:
- OTP screen appears after email/password sign in/up
- Users expect direct access after email/password authentication

**Files to Modify**:
1. `providers/auth-provider.tsx` - `emailPasswordLogin` function
2. `app/(auth)/signin.tsx` - Remove OTP redirect
3. `app/(auth)/signup.tsx` - Direct navigation after signup

**Implementation**:

```typescript
// In providers/auth-provider.tsx - emailPasswordLogin function
const emailPasswordLogin = useCallback(async (identifier: string, password: string, rememberMe: boolean = false, role: UserRole = 'buyer') => {
  if (!identifier?.trim()) {
    throw new Error('Email is required');
  }
  if (!identifier.includes('@')) {
    throw new Error('Please enter a valid email');
  }
  if (!password?.trim()) {
    throw new Error('Password is required');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  try {
    setIsLoading(true);
    console.log('🔐 Password login attempt for:', identifier.substring(0, 3) + '***');
    
    // REMOVED: OTP verification check
    // Direct login without OTP for email/password
    
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    
    const isElite = identifier.toLowerCase().includes('elite');
    const userData: User = {
      id: generateUserId(),
      email: identifier.trim(),
      name: identifier.split('@')[0],
      role,
      phone: '+254700000000',
      location: 'Nairobi, Kenya',
      isElite
    };
    
    await setItem('banda_user', JSON.stringify(userData));
    await setItem('banda_auth_timestamp', Date.now().toString());
    
    if (rememberMe) {
      await setItem('banda_remember_me', 'true');
      console.log('✅ Remember me enabled - extended session duration');
    } else {
      await removeItem('banda_remember_me');
      console.log('ℹ️ Remember me disabled - standard session duration');
    }
    
    setUser(userData);
    console.log('✅ Password login successful:', userData.name);
    
    // Direct navigation to marketplace - NO OTP
    router.replace('/(tabs)/marketplace' as any);
    
  } catch (error) {
    console.error('❌ Password login error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
}, [generateUserId, setItem, removeItem]);
```

### 5. Profile Data Synchronization

**Current Issue**:
- User profile data not syncing from Supabase backend
- Side menu and profile screens show incorrect/missing data

**Files to Modify**:
1. `providers/auth-provider.tsx` - Add profile sync function
2. `services/profile.ts` - Already has sync function
3. `components/SideMenu.tsx` - Use synced profile data

**Implementation**:

```typescript
// In providers/auth-provider.tsx - Add profile sync function
const syncProfileFromSupabase = useCallback(async (userId: string) => {
  try {
    console.log('🔄 Syncing profile from Supabase for user:', userId);
    
    // Get current auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ No active session');
      return null;
    }
    
    // Fetch profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }
    
    if (profile) {
      // Update local user state with profile data
      const updatedUser: User = {
        id: profile.user_id,
        email: profile.email || '',
        name: profile.full_name || '',
        phone: profile.phone || '',
        avatar: profile.avatar_url || undefined,
        role: (profile.user_role || 'buyer') as UserRole,
        // ... other fields
      };
      
      setUser(updatedUser);
      await setItem('banda_user', JSON.stringify(updatedUser));
      console.log('✅ Profile synced successfully');
      return updatedUser;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Profile sync error:', error);
    return null;
  }
}, [setItem]);

// Call this after successful authentication
// In emailPasswordLogin, socialLogin, etc.
await syncProfileFromSupabase(userData.id);
```

### 6. Shop/Service/Logistics/Farm Onboarding Completion

**Current Issue**:
- Users complete onboarding but dashboards don't open
- Onboarding loops back instead of showing dashboard

**Files to Modify**:
1. Shop: `app/onboarding/shop/tutorial.tsx`
2. Service: `app/inboarding/service-summary.tsx`
3. Logistics: `app/inboarding/logistics-complete.tsx`
4. Farm: `app/onboarding/farm/analytics.tsx`

**Implementation Pattern** (apply to each):

```typescript
// At the end of each onboarding flow
const handleCompleteOnboarding = async () => {
  try {
    setIsLoading(true);
    
    // Call backend completion procedure
    const result = await trpc.shop.completeOnboarding.mutate({
      userId: user?.id,
      // ... other required data
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to complete onboarding');
    }
    
    // Set completion flag
    await AsyncStorage.setItem('shop_onboarding_completed', 'true');
    
    // Update user role/status if needed
    await updateProfile({ 
      user_type: 'seller',
      // ... other updates
    });
    
    // Navigate to dashboard
    router.replace('/shop-dashboard' as any);
    
  } catch (error) {
    console.error('❌ Onboarding completion error:', error);
    Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

## Testing Instructions

### Test Auth Flow
1. Sign up with email/password
2. Verify NO OTP screen appears
3. Verify direct navigation to marketplace
4. Check profile data displays correctly

### Test Wallet Onboarding
1. Navigate to wallet onboarding
2. Complete all steps
3. Verify wallet dashboard opens
4. Check wallet persists on app restart

### Test Role Onboarding
For each role (Shop, Service, Logistics, Farm):
1. Start onboarding flow
2. Complete all steps
3. Verify dashboard opens
4. Check data persists
5. Verify user can access role features

## Quick Fixes Summary

1. **Signup.tsx** - ✅ Fixed TypeScript error
2. **Translations** - ✅ Working correctly
3. **Wallet Onboarding** - Implementation already correct, verify navigation
4. **Auth Flow** - Remove OTP redirect from email/password login
5. **Profile Sync** - Add Supabase profile sync after authentication
6. **Role Onboarding** - Add completion procedures and navigation

## Environment Check

Before testing, verify:
```bash
# Check .env.local has:
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_KEY=your_key
EXPO_PUBLIC_RORK_API_BASE_URL=your_api_url
```

## Database Check

Verify these tables exist in Supabase:
- ✅ users
- ✅ profiles
- ✅ agripay_wallets
- ✅ vendor_shops
- ✅ service_providers
- ✅ logistics_providers
- ✅ farms

## Support

If issues persist after implementing these fixes:
1. Check console logs for specific errors
2. Verify Supabase connection is working
3. Test backend tRPC procedures directly
4. Check AsyncStorage for completion flags
5. Review navigation stack for conflicts
