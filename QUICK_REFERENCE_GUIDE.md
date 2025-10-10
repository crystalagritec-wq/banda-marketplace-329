# 🚀 Banda Marketplace - Quick Reference Guide

**Last Updated:** 2025-10-10  
**Status:** Production Ready

---

## 📱 NEW HOOKS AVAILABLE

### 1. useServiceProviderDashboard
**File:** `hooks/useServiceProviderDashboard.ts`

```typescript
import { useServiceProviderDashboard } from '@/hooks/useServiceProviderDashboard';

const { stats, recentRequests, equipment, isLoading, refetch } = useServiceProviderDashboard();

// Available data:
stats.activeRequests      // Number of active service requests
stats.completedRequests   // Number of completed requests
stats.totalEarnings       // Total earnings amount
stats.rating              // Provider rating (0-5)
stats.totalReviews        // Number of reviews

recentRequests            // Array of recent service requests
equipment                 // Array of equipment items
isLoading                 // Loading state
refetch()                 // Refresh data
```

### 2. useLogisticsDashboard
**File:** `hooks/useLogisticsDashboard.ts`

```typescript
import { useLogisticsDashboard } from '@/hooks/useLogisticsDashboard';

// For drivers
const { stats, deliveries, activeDeliveries, isLoading, refetch } = useLogisticsDashboard('driver');

// For logistics owners
const { stats, deliveries, activeDeliveries, isLoading, refetch } = useLogisticsDashboard('owner');

// Available data:
stats.activeDeliveries    // Number of active deliveries
stats.completedDeliveries // Number of completed deliveries
stats.totalEarnings       // Total earnings
stats.pendingPayout       // Pending payout amount

deliveries                // Array of all deliveries
activeDeliveries          // Array of active deliveries only
isLoading                 // Loading state
refetch()                 // Refresh data
```

---

## 🛒 CART & CHECKOUT FLOW

### Cart Provider
**File:** `providers/cart-provider.tsx`

```typescript
import { useCart } from '@/providers/cart-provider';

const {
  cartItems,              // Array of cart items
  cartSummary,            // { subtotal, deliveryFee, total, itemCount, sellerCount, isSplitOrder }
  groupedBySeller,        // Items grouped by seller
  addToCart,              // (product, quantity) => void
  removeFromCart,         // (productId) => void
  updateQuantity,         // (productId, quantity) => void
  clearCart,              // () => void
  createOrder,            // (address, paymentMethod, promoCode?) => Promise<Order>
} = useCart();
```

### Creating an Order

```typescript
// Single-seller order
const order = await createOrder(
  selectedAddress,
  selectedPaymentMethod,
  promoCode // optional
);

// Multi-seller order (handled automatically)
// If cart has items from multiple sellers, createOrder will:
// 1. Create master order
// 2. Create sub-orders for each seller
// 3. Notify all sellers
// 4. Return master order with tracking ID
```

---

## 💳 PAYMENT METHODS

### Available Payment Types
```typescript
type PaymentType = 'agripay' | 'mpesa' | 'card' | 'cod';

// AgriPay - Wallet payment
// M-Pesa - Mobile money
// Card - Credit/Debit card
// COD - Cash on Delivery (with Reserve hold)
```

### Payment Flow
```typescript
// 1. Select payment method
const selectedPaymentMethod = paymentMethods.find(m => m.type === 'agripay');

// 2. Validate balance (for AgriPay)
if (selectedPaymentMethod.type === 'agripay' && agriPayBalance < total) {
  // Show top-up modal
}

// 3. Process payment
await createOrder(address, selectedPaymentMethod);

// 4. Navigate to success screen
router.push('/order-success');
```

---

## 🚚 DELIVERY CALCULATION

### Coordinate Validation
```typescript
// Always validate coordinates before calculation
const hasValidCoordinates = (coords: any) => {
  return coords && 
         typeof coords.lat === 'number' && 
         typeof coords.lng === 'number' &&
         !isNaN(coords.lat) && 
         !isNaN(coords.lng);
};

// Use fallback if invalid
const defaultCoordinates = { lat: -1.2921, lng: 36.8219 }; // Nairobi
const finalCoords = hasValidCoordinates(coords) ? coords : defaultCoordinates;
```

### Distance-Based Pricing
```typescript
// Tiered pricing structure
const baseFee = 100; // KES
const perKmRate = 15; // KES per km

if (distance <= 5) {
  fee = baseFee;
} else if (distance <= 20) {
  fee = baseFee + (distance - 5) * perKmRate;
} else if (distance <= 50) {
  fee = baseFee + (15 * perKmRate) + (distance - 20) * 12;
} else {
  fee = baseFee + (15 * perKmRate) + (30 * 12) + (distance - 50) * 10;
}

// Apply vehicle multiplier
const vehicleMultipliers = {
  boda: 1.0,
  van: 1.3,
  truck: 1.8,
  pickup: 1.4,
  tractor: 2.0
};

const totalFee = Math.round(fee * vehicleMultipliers[vehicleType]);
```

---

## ⏰ TIME SLOT VALIDATION

### Business Hours
```typescript
const BUSINESS_HOURS = {
  start: 6,  // 6 AM
  end: 22,   // 10 PM
};
```

### Filtering Past Slots
```typescript
const now = new Date();
const isPastTime = slotDate.getTime() < now.getTime();

if (isPastTime) {
  continue; // Skip this slot
}

if (slotHour < BUSINESS_HOURS.start || slotHour >= BUSINESS_HOURS.end) {
  continue; // Skip outside business hours
}
```

---

## 🔐 WALLET & PIN

### Phone Validation
```typescript
// Kenyan phone format: 07XXXXXXXX
const cleanPhone = phoneNumber.replace(/\\D/g, '');
const isValid = cleanPhone.startsWith('07') && cleanPhone.length === 10;
```

### PIN Validation
```typescript
// 4-digit numeric PIN
const isValidPin = /^\\d{4}$/.test(pin);

// PIN must match confirmation
const pinsMatch = pin === confirmPin;
```

### Creating Wallet
```typescript
import { useAgriPay } from '@/providers/agripay-provider';

const { createWallet } = useAgriPay();

const result = await createWallet();
// Returns: { success: boolean, wallet: { id, user_id, balance, display_id } }
```

---

## 📊 BACKEND PROCEDURES

### Orders
```typescript
// Create single-seller order
trpc.orders.createOrder.mutate({
  items: [...],
  delivery_address: {...},
  payment_method: 'mpesa',
  subtotal: 1000,
  delivery_fee: 200,
  total: 1200,
});

// Create multi-seller order
trpc.checkout.multiSellerCheckout.mutate({
  userId: user.id,
  sellerGroups: [...],
  deliveryAddress: {...},
  paymentMethod: {...},
  orderSummary: {...},
});
```

### Service Providers
```typescript
// Get dashboard stats
trpc.serviceProviders.getDashboardStats.useQuery();

// Get service requests
trpc.serviceProviders.getServiceRequestsEnhanced.useQuery({
  status: 'all',
  limit: 10
});
```

### Logistics
```typescript
// Get driver deliveries
trpc.logistics.getDriverDeliveries.useQuery({
  driverId: user.id,
  status: 'all',
  limit: 20
});

// Get driver earnings
trpc.logistics.getDriverEarnings.useQuery({
  driverId: user.id
});
```

---

## 🎨 UI COMPONENTS

### Loading States
```typescript
if (isLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2D5016" />
      <Text>Loading...</Text>
    </View>
  );
}
```

### Error Handling
```typescript
try {
  await someAsyncOperation();
} catch (error: any) {
  console.error('[Component] Error:', error);
  Alert.alert(
    'Error',
    error.message || 'Something went wrong',
    [{ text: 'OK' }]
  );
}
```

### Toast Messages
```typescript
import { Platform, ToastAndroid, Alert } from 'react-native';

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message, [{ text: 'OK' }]);
  }
};
```

---

## 🔍 DEBUGGING

### Console Logging
```typescript
// Use descriptive prefixes
console.log('[CartProvider] Adding to cart:', product.name);
console.error('[Checkout] Error creating order:', error);
console.warn('[Delivery] Missing coordinates:', coords);
```

### Common Issues

#### Issue: Orders not saving to database
**Solution:** Check that `trpcClient.orders.createOrder` is being called, not local AsyncStorage

#### Issue: Delivery cost shows $0
**Solution:** Validate coordinates before calculation, use fallback if invalid

#### Issue: Past time slots showing
**Solution:** Filter slots where `slotDate.getTime() < now.getTime()`

#### Issue: Wallet creation fails
**Solution:** Check user is authenticated, phone number is valid, terms are accepted

---

## 📱 TESTING CHECKLIST

### Before Deployment
- [ ] Test single-seller order flow
- [ ] Test multi-seller order flow
- [ ] Test all payment methods
- [ ] Test delivery cost calculation
- [ ] Test time slot selection
- [ ] Test wallet creation
- [ ] Test service provider dashboard
- [ ] Test logistics dashboard
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on web browser

---

## 🚀 DEPLOYMENT

### Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_TOOLKIT_URL=your_toolkit_url
```

### Build Commands
```bash
# Development
bun run start

# Production build
bun run build

# Type check
bun run tsc --noEmit
```

---

## 📞 SUPPORT

### Documentation
- Main docs: `BANDA_FINAL_FIXES_COMPLETE.md`
- Audit reports: `FINAL_AUDIT_SUMMARY.md`
- Implementation status: `AUDIT_IMPLEMENTATION_STATUS.md`

### Key Files
- Cart: `providers/cart-provider.tsx`
- Checkout: `app/checkout.tsx`
- Wallet: `components/WalletOnboardingModal.tsx`
- Service Provider Hook: `hooks/useServiceProviderDashboard.ts`
- Logistics Hook: `hooks/useLogisticsDashboard.ts`

---

**Last Updated:** 2025-10-10  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
