# AgriPay + TradeGuard Frontend Integration Fixes

## ✅ COMPLETED FIXES

### 1. AgriPay Provider - Infinite Loop Fix
**Status:** ✅ FIXED

**Issues Found:**
- `walletQuery.refetch()` was being awaited in callbacks, causing infinite re-renders
- Callbacks included `walletQuery` in dependency arrays, triggering loops
- `refreshWallet` function was async but didn't need to be

**Fixes Applied:**
```typescript
// Changed from:
await walletQuery.refetch()
// To:
walletQuery.refetch()

// Removed walletQuery from dependency arrays in:
- createWallet
- fundWallet
- withdrawFunds
- refreshWallet
```

**Result:** Provider now works without infinite loops, wallet data updates correctly via Supabase realtime subscriptions.

---

### 2. Wallet Screen - Context and Loading Fix
**Status:** ✅ FIXED

**Issues Found:**
- React hooks called conditionally (after early return)
- No null check for AgriPay context
- No loading state handling

**Fixes Applied:**
```typescript
// Added context null check before hooks
const agriPayContext = useAgriPay();
if (!agriPayContext) {
  return <LoadingView />;
}

// Moved all useState hooks before conditional returns
// Added loading state check after data fetch
if (walletLoading) {
  return <LoadingView />;
}
```

**Result:** Wallet screen now loads correctly, shows real AgriPay data, and handles loading states properly.

---

## 🔧 PENDING FIXES

### 3. Checkout Flow - Hold Reserve Integration
**Status:** ⚠️ NEEDS FIX

**Current Issue:**
- Checkout uses old `createOrder` from cart provider
- No call to `hold_reserve` tRPC procedure
- Payment deducted directly instead of moving to reserve
- No TradeGuard protection applied

**Required Changes:**

#### A. Update Checkout Payment Flow
```typescript
// In app/checkout.tsx, replace confirmPayment logic:

// OLD (current):
const order = await createOrder(selectedAddress!, selectedPaymentMethod!);

// NEW (required):
import { useAgriPay } from '@/providers/agripay-provider';

const { wallet } = useAgriPay();
const holdReserveMutation = trpc.tradeguard.holdReserve.useMutation();

// Before creating order, hold funds in reserve
if (selectedPaymentMethod.type === 'agripay') {
  // Check balance
  if (!wallet || wallet.balance < finalTotal) {
    Alert.alert('Insufficient Balance', 'Please top up your wallet');
    return;
  }
  
  // Hold reserve
  const reserveResult = await holdReserveMutation.mutateAsync({
    buyerWalletId: wallet.id,
    sellerWalletId: sellerWallet.id, // Get from product/seller data
    amount: finalTotal,
    referenceType: 'order',
    referenceId: orderId, // Generate or get from backend
  });
  
  if (!reserveResult.success) {
    Alert.alert('Payment Failed', reserveResult.message);
    return;
  }
}

// Then create order with reserve_id
const order = await createOrderWithReserve({
  ...orderData,
  reserveId: reserveResult.reserveId,
  paymentStatus: 'reserved',
});
```

#### B. Create New tRPC Procedure
```typescript
// backend/trpc/routes/checkout/process-agripay-payment.ts
export const processAgriPayPaymentProcedure = protectedProcedure
  .input(z.object({
    buyerWalletId: z.string().uuid(),
    sellerWalletId: z.string().uuid(),
    amount: z.number().positive(),
    orderId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Call Supabase hold_reserve function
    const { data, error } = await ctx.supabase.rpc('hold_reserve', {
      p_buyer_wallet_id: input.buyerWalletId,
      p_seller_wallet_id: input.sellerWalletId,
      p_amount: input.amount,
      p_reference_type: 'order',
      p_reference_id: input.orderId,
    });
    
    if (error) throw new Error(error.message);
    
    return {
      success: true,
      reserveId: data.reserve_id,
      transactionId: data.transaction_id,
    };
  });
```

---

### 4. Order Success - Release Reserve
**Status:** ⚠️ NEEDS FIX

**Current Issue:**
- No "Confirm Delivery" button
- No call to `release_reserve`
- Funds never released to vendor
- No auto-release timer shown

**Required Changes:**

#### A. Update Order Success Screen
```typescript
// In app/order-success.tsx or app/order-tracking.tsx

import { trpc } from '@/lib/trpc';

const releaseReserveMutation = trpc.tradeguard.releaseReserve.useMutation();

// Add confirm delivery button
const handleConfirmDelivery = async () => {
  try {
    const result = await releaseReserveMutation.mutateAsync({
      reserveId: order.reserveId,
      releasedBy: user.id,
    });
    
    if (result.success) {
      Alert.alert(
        'Delivery Confirmed',
        'Funds have been released to the vendor. Thank you for your purchase!'
      );
      // Refresh order status
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to confirm delivery');
  }
};

// Show auto-release countdown
<View style={styles.autoReleaseInfo}>
  <Shield size={20} color="#F59E0B" />
  <Text>Funds will auto-release in {timeRemaining}</Text>
</View>

<TouchableOpacity onPress={handleConfirmDelivery}>
  <Text>Confirm Delivery & Release Funds</Text>
</TouchableOpacity>
```

#### B. Create Release Reserve Procedure
```typescript
// backend/trpc/routes/tradeguard/release-reserve.ts
export const releaseReserveProcedure = protectedProcedure
  .input(z.object({
    reserveId: z.string().uuid(),
    releasedBy: z.string().uuid(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase.rpc('release_reserve', {
      p_reserve_id: input.reserveId,
      p_released_by: input.releasedBy,
    });
    
    if (error) throw new Error(error.message);
    
    return { success: true, data };
  });
```

---

### 5. Dispute UI System
**Status:** ⚠️ NEEDS IMPLEMENTATION

**Required Screens:**

#### A. Dispute List Screen (`app/disputes.tsx`)
```typescript
export default function DisputesScreen() {
  const disputesQuery = trpc.tradeguard.getDisputes.useQuery();
  
  return (
    <ScrollView>
      {disputesQuery.data?.disputes.map(dispute => (
        <DisputeCard
          key={dispute.id}
          dispute={dispute}
          onPress={() => router.push(`/dispute/${dispute.id}`)}
        />
      ))}
    </ScrollView>
  );
}
```

#### B. Dispute Detail Screen (`app/dispute/[disputeId].tsx`)
```typescript
export default function DisputeDetailScreen() {
  const { disputeId } = useLocalSearchParams();
  const disputeQuery = trpc.tradeguard.getDispute.useQuery({ disputeId });
  const submitEvidenceMutation = trpc.tradeguard.submitEvidence.useMutation();
  
  return (
    <View>
      <Text>Dispute #{disputeId}</Text>
      <Text>Status: {dispute.status}</Text>
      <Text>Reason: {dispute.reason}</Text>
      
      {/* Evidence upload */}
      <TouchableOpacity onPress={handleUploadEvidence}>
        <Text>Upload Evidence</Text>
      </TouchableOpacity>
      
      {/* AI Recommendation */}
      {dispute.ai_recommendation && (
        <View>
          <Text>AI Recommendation: {dispute.ai_recommendation}</Text>
          <Text>Confidence: {dispute.ai_confidence}%</Text>
        </View>
      )}
    </View>
  );
}
```

#### C. Raise Dispute Button (in Order Tracking)
```typescript
// Add to app/order-tracking.tsx

const raiseDisputeMutation = trpc.tradeguard.raiseDispute.useMutation();

const handleRaiseDispute = async () => {
  Alert.prompt(
    'Raise Dispute',
    'Please describe the issue:',
    async (reason) => {
      const result = await raiseDisputeMutation.mutateAsync({
        orderId: order.id,
        reserveId: order.reserveId,
        reason,
      });
      
      if (result.success) {
        Alert.alert('Dispute Raised', 'Our team will review your case');
        router.push(`/dispute/${result.disputeId}`);
      }
    }
  );
};

<TouchableOpacity onPress={handleRaiseDispute}>
  <AlertCircle size={20} color="#EF4444" />
  <Text>Report Issue</Text>
</TouchableOpacity>
```

---

### 6. Driver Wallet Integration
**Status:** ⚠️ NEEDS IMPLEMENTATION

**Required Changes:**

#### A. Update Logistics Dashboard
```typescript
// In app/logistics-dashboard.tsx

import { useAgriPay } from '@/providers/agripay-provider';

export default function LogisticsDashboard() {
  const { wallet, isLoading } = useAgriPay();
  const earningsQuery = trpc.logistics.getDriverEarnings.useQuery();
  
  return (
    <View>
      <Text>Driver Wallet</Text>
      <Text>Balance: KSh {wallet?.balance || 0}</Text>
      <Text>Pending: KSh {wallet?.reserve_balance || 0}</Text>
      
      {/* Earnings breakdown */}
      <Text>Today's Earnings: KSh {earningsQuery.data?.today}</Text>
      <Text>This Week: KSh {earningsQuery.data?.week}</Text>
      
      {/* Payout button */}
      <TouchableOpacity onPress={handleRequestPayout}>
        <Text>Request Payout</Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### B. Update Hold Reserve to Include Driver
```typescript
// Modify backend/trpc/routes/tradeguard/hold-reserve.ts

export const holdReserveProcedure = protectedProcedure
  .input(z.object({
    buyerWalletId: z.string().uuid(),
    sellerWalletId: z.string().uuid(),
    driverWalletId: z.string().uuid().optional(), // Add driver
    amount: z.number().positive(),
    driverAmount: z.number().positive().optional(), // Driver's cut
    referenceType: z.string(),
    referenceId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Call Supabase function with driver info
    const { data, error } = await ctx.supabase.rpc('hold_reserve', {
      p_buyer_wallet_id: input.buyerWalletId,
      p_seller_wallet_id: input.sellerWalletId,
      p_driver_wallet_id: input.driverWalletId,
      p_amount: input.amount,
      p_driver_amount: input.driverAmount || 0,
      p_reference_type: input.referenceType,
      p_reference_id: input.referenceId,
    });
    
    if (error) throw new Error(error.message);
    return { success: true, data };
  });
```

---

### 7. Service Provider Wallet
**Status:** ⚠️ NEEDS IMPLEMENTATION

**Required Changes:**

#### A. Service Provider Dashboard
```typescript
// In app/service-provider-dashboard.tsx

import { useAgriPay } from '@/providers/agripay-provider';

export default function ServiceProviderDashboard() {
  const { wallet } = useAgriPay();
  const jobsQuery = trpc.serviceProviders.getJobs.useQuery();
  
  return (
    <View>
      <Text>Service Wallet</Text>
      <Text>Available: KSh {wallet?.balance || 0}</Text>
      <Text>In Reserve: KSh {wallet?.reserve_balance || 0}</Text>
      
      {/* Active jobs with payment status */}
      {jobsQuery.data?.jobs.map(job => (
        <View key={job.id}>
          <Text>{job.title}</Text>
          <Text>Payment: {job.paymentStatus}</Text>
          {job.paymentStatus === 'reserved' && (
            <Text>Funds held in TradeGuard</Text>
          )}
        </View>
      ))}
    </View>
  );
}
```

#### B. Service Order Payment Flow
```typescript
// When service is booked, hold reserve

const bookServiceMutation = trpc.services.bookService.useMutation();
const holdReserveMutation = trpc.tradeguard.holdReserve.useMutation();

const handleBookService = async () => {
  // Hold funds
  const reserve = await holdReserveMutation.mutateAsync({
    buyerWalletId: wallet.id,
    sellerWalletId: provider.walletId,
    amount: servicePrice,
    referenceType: 'service',
    referenceId: serviceId,
  });
  
  // Create booking
  const booking = await bookServiceMutation.mutateAsync({
    serviceId,
    reserveId: reserve.reserveId,
  });
  
  Alert.alert('Service Booked', 'Payment held securely until service completion');
};
```

---

### 8. Vendor Stats Fix
**Status:** ⚠️ NEEDS FIX

**Current Issue:**
- Using old `wallets` table instead of `agripay_wallets`
- Stats not showing real earnings
- No payout request system

**Required Changes:**

#### A. Update Vendor Stats Query
```typescript
// In backend/trpc/routes/shop/get-vendor-stats.ts

export const getVendorStatsProcedure = protectedProcedure
  .input(z.object({ vendorId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Get wallet from agripay_wallets
    const { data: wallet } = await ctx.supabase
      .from('agripay_wallets')
      .select('*')
      .eq('user_id', input.vendorId)
      .single();
    
    // Get transactions
    const { data: transactions } = await ctx.supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false });
    
    // Calculate stats
    const totalEarnings = transactions
      ?.filter(t => t.type === 'reserve_release')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const pendingPayouts = transactions
      ?.filter(t => t.type === 'reserve_hold' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    return {
      wallet,
      totalEarnings,
      pendingPayouts,
      availableBalance: wallet.balance,
      reserveBalance: wallet.reserve_balance,
      transactions,
    };
  });
```

#### B. Update Vendor Dashboard UI
```typescript
// In app/shop-dashboard.tsx

const statsQuery = trpc.shop.getVendorStats.useQuery({ vendorId: user.id });

<View>
  <Text>Total Earnings: KSh {statsQuery.data?.totalEarnings}</Text>
  <Text>Available: KSh {statsQuery.data?.availableBalance}</Text>
  <Text>In Reserve: KSh {statsQuery.data?.reserveBalance}</Text>
  <Text>Pending: KSh {statsQuery.data?.pendingPayouts}</Text>
  
  <TouchableOpacity onPress={handleRequestPayout}>
    <Text>Request Payout</Text>
  </TouchableOpacity>
</View>
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Payment Flow (HIGH PRIORITY)
- [ ] Update checkout to call `hold_reserve` before order creation
- [ ] Create `processAgriPayPayment` tRPC procedure
- [ ] Update order model to store `reserve_id`
- [ ] Test full checkout flow with AgriPay

### Phase 2: Order Completion (HIGH PRIORITY)
- [ ] Add "Confirm Delivery" button to order tracking
- [ ] Create `releaseReserve` tRPC procedure
- [ ] Implement auto-release countdown UI
- [ ] Test fund release flow

### Phase 3: Dispute System (MEDIUM PRIORITY)
- [ ] Create disputes list screen
- [ ] Create dispute detail screen
- [ ] Add "Raise Dispute" button to orders
- [ ] Implement evidence upload
- [ ] Create dispute tRPC procedures

### Phase 4: Multi-Role Wallet Integration (MEDIUM PRIORITY)
- [ ] Integrate driver wallet in logistics flow
- [ ] Update hold_reserve to include driver cut
- [ ] Create driver earnings dashboard
- [ ] Implement service provider wallet
- [ ] Update service booking flow

### Phase 5: Vendor Management (LOW PRIORITY)
- [ ] Fix vendor stats to use agripay_wallets
- [ ] Create payout request system
- [ ] Add earnings breakdown UI
- [ ] Implement financial reports

---

## 🔍 TESTING CHECKLIST

### Checkout Flow
- [ ] AgriPay payment holds funds in reserve
- [ ] Insufficient balance shows top-up modal
- [ ] Reserve created with correct amounts
- [ ] Order created with reserve_id
- [ ] Wallet balance updates correctly

### Order Completion
- [ ] Confirm delivery releases funds
- [ ] Vendor receives payment
- [ ] Buyer balance doesn't change (already deducted)
- [ ] Transaction logs created
- [ ] Auto-release works after 72 hours

### Dispute Flow
- [ ] Dispute locks reserve
- [ ] Evidence can be uploaded
- [ ] Admin can resolve dispute
- [ ] Refund returns funds to buyer
- [ ] Release pays vendor

### Multi-Role Integration
- [ ] Driver receives cut on delivery
- [ ] Service provider gets paid on completion
- [ ] Vendor stats show real earnings
- [ ] All roles can request payouts

---

## 🚀 DEPLOYMENT NOTES

1. **Database Migration Required:**
   - Ensure all Supabase functions are deployed
   - Run `SUPABASE_AGRIPAY_TRADEGUARD_SCHEMA.sql`
   - Verify RLS policies are active

2. **Backend Deployment:**
   - Deploy all new tRPC procedures
   - Test with Postman/Insomnia first
   - Monitor error logs

3. **Frontend Deployment:**
   - Update all screens incrementally
   - Test on both iOS and Android
   - Monitor Sentry for errors

4. **User Communication:**
   - Notify users about new payment system
   - Explain TradeGuard protection
   - Provide support documentation

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue:** Wallet not loading
**Fix:** Check if user has agripay_wallet created, call `createWallet` if missing

**Issue:** Reserve not releasing
**Fix:** Check auto_release_at timestamp, verify Supabase cron is running

**Issue:** Insufficient funds error
**Fix:** Verify balance calculation includes reserve_balance

**Issue:** Driver not receiving payment
**Fix:** Ensure driver_wallet_id is passed to hold_reserve

---

## 📚 RELATED DOCUMENTATION

- `SUPABASE_AGRIPAY_TRADEGUARD_SCHEMA.sql` - Database schema
- `AGRIPAY_TRADEGUARD_IMPLEMENTATION_SUMMARY.md` - Backend implementation
- `WALLET_SYSTEM_AUDIT_REPORT.md` - System audit findings
- `BANDA_FINANCIAL_ECOSYSTEM.md` - Full system specification

---

**Last Updated:** 2025-10-07
**Status:** In Progress
**Priority:** HIGH
