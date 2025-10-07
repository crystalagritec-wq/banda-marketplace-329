# Dashboard System Quick Reference

## 🎯 Dashboard Routes

### Main Dashboard
- **Route**: `/dashboard`
- **Purpose**: Unified view of all user roles
- **Shows**: Shop, Service, Logistics, Farm status
- **Backend**: ✅ Integrated with AgriPay, Shop, Service APIs

### Shop Dashboard
- **Route**: `/shop-dashboard`
- **Purpose**: Vendor management and analytics
- **Shows**: Products, Orders, Revenue, Customers
- **Backend**: ✅ Fully integrated with shop APIs
- **Access**: Requires vendor profile

### Logistics Dashboard
- **Route**: `/logistics-dashboard`
- **Purpose**: Fleet and delivery management
- **Shows**: Vehicles, Deliveries, Earnings
- **Backend**: ⚠️ Uses local provider (needs backend integration)
- **Access**: Requires logistics role

### Service Provider Dashboard
- **Route**: `/service-provider-dashboard`
- **Purpose**: Service bookings and management
- **Shows**: Bookings, Equipment, Rating
- **Backend**: ⚠️ Uses local provider (needs backend integration)
- **Access**: Requires service provider profile

---

## 🔑 Key Features

### Main Dashboard Features
```typescript
// Real-time wallet balance
const walletQuery = trpc.agripay.getWallet.useQuery({ userId });

// Shop status check
const shopQuery = trpc.shop.getMyShop.useQuery();

// Service provider status
const serviceQuery = trpc.serviceProviders.getMyProfile.useQuery();
```

### Navigation Logic
```typescript
// Shop: Active → /shop-dashboard, Not Active → /onboarding/shop/profile
// Service: Active → /service-provider-dashboard, Not Active → /inboarding/service-role
// Logistics: → /inboarding/logistics-role
// Farm: → /insights
```

---

## 📊 Data Sources

### Real Backend Data
- ✅ Wallet Balance (AgriPay)
- ✅ Shop Status (Vendor Profile)
- ✅ Service Provider Status (Profile)
- ✅ Shop Orders & Products
- ✅ Shop Revenue & Analytics

### Local Provider Data
- ⚠️ Logistics vehicles & deliveries
- ⚠️ Service provider bookings
- ⚠️ Equipment status
- ⚠️ Farm data

---

## 🚀 Quick Start

### Adding a New Role Dashboard

1. **Create the screen**
```typescript
// app/my-role-dashboard.tsx
export default function MyRoleDashboard() {
  const { user } = useAuth();
  const statsQuery = trpc.myRole.getStats.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id }
  );
  
  return (
    <View>
      {/* Dashboard content */}
    </View>
  );
}
```

2. **Add to main dashboard**
```typescript
// app/dashboard.tsx
const myRoleQuery = trpc.myRole.getMyProfile.useQuery();

const businessUnits = [
  {
    id: 'my-role',
    name: 'My Role',
    icon: MyIcon,
    status: myRoleQuery.data ? 'active' : 'not_created',
    route: myRoleQuery.data ? '/my-role-dashboard' : '/onboarding/my-role',
  }
];
```

3. **Create backend endpoint**
```typescript
// backend/trpc/routes/my-role/get-stats.ts
export const getStatsProcedure = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input, ctx }) => {
    // Fetch stats from database
    return { stats };
  });
```

---

## 🔍 Debugging

### Check Dashboard Loading
```typescript
console.log('Wallet Query:', walletQuery.data);
console.log('Shop Query:', shopQuery.data);
console.log('Service Query:', serviceQuery.data);
```

### Verify User Authentication
```typescript
const { user, isLoading } = useAuth();
console.log('User:', user);
console.log('Auth Loading:', isLoading);
```

### Test Backend Queries
```typescript
// Check if queries are enabled
console.log('Queries Enabled:', !!user?.id);

// Check query status
console.log('Wallet Loading:', walletQuery.isLoading);
console.log('Wallet Error:', walletQuery.error);
```

---

## ⚠️ Common Issues

### Issue: Dashboard shows loading forever
**Solution**: Check if user is authenticated
```typescript
if (!user?.id) {
  // Redirect to login
  router.replace('/(auth)/welcome');
}
```

### Issue: Wallet balance shows 0
**Solution**: Verify wallet exists
```typescript
const walletData = walletQuery.data;
if (walletData && 'wallet' in walletData && walletData.wallet) {
  const balance = walletData.wallet.balance;
}
```

### Issue: Navigation doesn't work
**Solution**: Check route paths
```typescript
// Use correct route format
router.push('/shop-dashboard' as any);
// NOT: router.push('shop-dashboard');
```

---

## 📱 User Flow

### New User
1. Sign up → Welcome screen
2. Role selection → Choose role
3. Onboarding → Complete profile
4. Dashboard → See all roles
5. Activate role → Start using features

### Existing User
1. Login → Auto-navigate to dashboard
2. Dashboard → See all active roles
3. Click role → Navigate to specific dashboard
4. Add role → Start onboarding for new role

---

## 🎨 UI Components

### Status Badge
```typescript
const getStatusIcon = (status) => {
  switch (status) {
    case 'active': return <CheckCircle color="#10B981" />;
    case 'setup': return <Clock color="#F59E0B" />;
    case 'not_created': return <AlertCircle color="#9CA3AF" />;
  }
};
```

### Progress Bar
```typescript
<View style={styles.progressBarContainer}>
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
  <Text>{progress}%</Text>
</View>
```

### Loading State
```typescript
if (isLoading) {
  return (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color="#2D5016" />
      <Text>Loading dashboard...</Text>
    </View>
  );
}
```

---

## 🔐 Access Control

### Role-Based Access
```typescript
// Check if user has role
const hasShopRole = shopQuery.data?.exists;
const hasServiceRole = serviceQuery.data?.exists;

// Conditional rendering
{hasShopRole && (
  <TouchableOpacity onPress={() => router.push('/shop-dashboard')}>
    <Text>Go to Shop</Text>
  </TouchableOpacity>
)}
```

### Authentication Guard
```typescript
// In dashboard screen
useEffect(() => {
  if (!user && !isLoading) {
    router.replace('/(auth)/welcome');
  }
}, [user, isLoading]);
```

---

## 📈 Performance Tips

### Optimize Queries
```typescript
// Only fetch when needed
const query = trpc.endpoint.useQuery(
  { userId },
  { 
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

### Lazy Loading
```typescript
// Load dashboard data on mount
useEffect(() => {
  if (user?.id) {
    // Trigger queries
  }
}, [user?.id]);
```

### Memoization
```typescript
const businessUnits = useMemo(() => [
  // Business units array
], [shopData, serviceData, logisticsData]);
```

---

## 🧪 Testing

### Test Dashboard Load
```typescript
// Check if dashboard renders
expect(screen.getByText('Welcome')).toBeTruthy();

// Check if loading state shows
expect(screen.getByText('Loading dashboard...')).toBeTruthy();
```

### Test Navigation
```typescript
// Click on shop card
fireEvent.press(screen.getByText('Shop'));

// Verify navigation
expect(router.push).toHaveBeenCalledWith('/shop-dashboard');
```

### Test Data Display
```typescript
// Mock query response
const mockWalletData = { wallet: { balance: 10000 } };

// Verify display
expect(screen.getByText('KSh 10,000')).toBeTruthy();
```

---

## 📚 Related Documentation

- **Audit Report**: `ROLE_DASHBOARD_AUDIT_REPORT.md`
- **Fixes Summary**: `ROLE_DASHBOARD_FIXES_SUMMARY.md`
- **Backend Setup**: `DATABASE_SETUP_GUIDE.md`
- **AgriPay System**: `AGRIPAY_SYSTEM_ARCHITECTURE.md`

---

## 🆘 Need Help?

### Check These First
1. User authenticated? → Check auth provider
2. Queries working? → Check tRPC routes
3. Navigation broken? → Check route paths
4. Data not showing? → Check backend responses

### Debug Commands
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check for console logs
# Look for: "Loading dashboard...", "Wallet Query:", etc.

# Test backend
# Use tRPC devtools or Postman
```

---

**Quick Tip**: Always check the browser/app console for error messages and query status!
