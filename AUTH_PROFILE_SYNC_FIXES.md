# Authentication & Profile Synchronization Fixes

## Summary of Changes Made

### 1. ✅ Removed OTP Verification Screen from Sign In/Up Flow
- **Sign In**: Modified `app/(auth)/signin.tsx` to navigate directly to marketplace after successful login
- **Sign Up**: Modified `app/(auth)/signup.tsx` to create user account directly and navigate to marketplace
- **Status**: COMPLETED

### 2. User Session & Profile Synchronization

#### Issues Identified:
1. User profile data (name, email, phone) not syncing across screens
2. Side menu shows generic "Guest" instead of actual user name
3. Profile screen not displaying current user data
4. Edit profile not linked to settings for email/phone changes
5. Wallet button navigation issues
6. Shop dashboard not showing after onboarding

#### Required Fixes:

### A. Auth Provider Enhancement
**File**: `providers/auth-provider.tsx`

The auth provider already has:
- ✅ User session persistence with `loadStoredUser()`
- ✅ `updateProfile()` method for syncing changes
- ✅ Session duration handling (3 days default, 30 days with "Remember Me")

**Action Needed**: Ensure `updateProfile()` is called after any profile changes

### B. Side Menu Synchronization
**File**: `components/SideMenu.tsx`

Current state:
```typescript
<Text style={styles.userName}>{user?.name || 'Guest'}</Text>
```

**Fix Required**:
1. Add email display below name
2. Ensure real-time updates when profile changes
3. Add phone number display

**Recommended Changes**:
```typescript
<View style={styles.userDetails}>
  <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
  <Text style={styles.userEmail}>{user?.email || ''}</Text>
  <Text style={styles.userPhone}>{user?.phone || ''}</Text>
</View>
```

### C. Profile Screen Synchronization
**File**: `app/(tabs)/profile.tsx`

Current implementation uses:
- `sessionQuery` from `trpc.profile.fetchSession`
- `dashboardQuery` from `trpc.dashboard.getUserDashboard`
- Falls back to `user` from auth provider

**Status**: ✅ Already properly synced with multiple data sources

### D. Edit Profile Integration
**File**: `app/edit-profile.tsx`

Current implementation:
- ✅ Fetches data from `trpc.profile.fetchSession`
- ✅ Updates via `trpc.profile.update.useMutation()`
- ✅ Syncs back to auth provider with `updateProfile()`

**Additional Fix Needed**:
Add navigation links to settings for email/phone changes:

```typescript
<TouchableOpacity onPress={() => router.push('/settings/change-email' as any)}>
  <Text>Change Email</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => router.push('/settings/change-phone' as any)}>
  <Text>Change Phone</Text>
</TouchableOpacity>
```

### E. Wallet Button Navigation
**File**: `components/SideMenu.tsx`

Current implementation already correct:
```typescript
{
  id: 'wallet',
  title: 'AgriPay Wallet',
  icon: Wallet,
  route: '/(tabs)/wallet',
}
```

**Status**: ✅ Already navigates to wallet screen

### F. Shop Dashboard Visibility
**File**: `app/dashboard.tsx`

Current logic:
```typescript
const hasShop = useMemo(() => {
  return hasShopProfile(shopQuery.data);
}, [shopQuery.data]);
```

**Issue**: Shop dashboard card only shows if `hasShop` is true

**Fix**: Ensure shop onboarding completion properly creates shop profile in database

## Implementation Priority

### High Priority (Immediate)
1. ✅ Remove OTP screens from auth flow - COMPLETED
2. Ensure user session persists after login/signup
3. Sync user name/email/phone in side menu
4. Fix shop dashboard visibility after onboarding

### Medium Priority
1. Add email/phone change links in edit profile
2. Ensure profile updates reflect immediately across all screens
3. Add refresh mechanism for profile data

### Low Priority
1. Add profile picture upload functionality
2. Add bio field to profile
3. Enhanced error handling for profile updates

## Testing Checklist

- [ ] Sign up with new account → Check if name appears in side menu
- [ ] Sign in with existing account → Verify session persistence
- [ ] Edit profile → Confirm changes reflect in side menu and profile screen
- [ ] Complete shop onboarding → Verify shop dashboard appears
- [ ] Click wallet button → Ensure navigates to wallet screen
- [ ] Logout and login → Verify session restored correctly

## Database Schema Requirements

Ensure these tables exist in Supabase:
- `users` table with columns: `user_id`, `full_name`, `email`, `phone`, `photo_url`
- `vendor_shops` table for shop profiles
- `wallets` table for AgriPay wallet data

## Notes

- Auth provider uses AsyncStorage for session persistence
- Session expires after 3 days (or 30 days with "Remember Me")
- Profile updates should call both tRPC mutation AND auth provider's `updateProfile()`
- All screens should use `useAuth()` hook as primary source of user data
- tRPC queries should be used for detailed profile information
