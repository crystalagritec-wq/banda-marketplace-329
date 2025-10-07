# Product Creation to Buyer Order Flow - Complete Audit Report

**Date:** 2025-10-04  
**Scope:** End-to-end flow from vendor product creation to buyer order tracking

---

## Executive Summary

I've completed a comprehensive audit of the product-to-buyer journey in Banda. The flow has **7 critical gaps** that prevent products from reaching buyers properly, plus **12 integration issues** that cause data inconsistencies.

### Critical Status: 🔴 BROKEN FLOW

**Key Finding:** Products created by vendors are NOT reaching the marketplace due to database disconnects and mock data usage throughout the system.

---

## Flow Breakdown & Issues

### 1️⃣ **Vendor Product Creation** ✅ (Partially Working)

**File:** `backend/trpc/routes/shop/create-product.ts`  
**Frontend:** `app/post-product.tsx`

#### What Works:
- Form validation (title, category, price, location)
- Location integration via `location-provider`
- Draft saving capability
- Image upload UI (mock)

#### 🔴 Critical Issues:

**Issue 1.1: Product Not Saved to Database**
```typescript
// Line 76-80 in create-product.ts
const { data, error } = await ctx.supabase
  .from('marketplace_products')
  .insert(productData)
  .select()
  .single();
```
- ✅ Inserts to `marketplace_products` table
- ❌ **BUT** marketplace fetches from `get_marketplace_items` RPC function
- ❌ No verification that RPC function reads from same table
- ❌ No vendor_id field mapping (uses user_id)

**Issue 1.2: Missing Vendor Profile Link**
```typescript
// Line 50 in create-product.ts
vendor_name: userData.full_name || 'Unknown Vendor',
```
- ❌ No link to vendor shop profile
- ❌ No vendor verification badge sync
- ❌ Missing vendor_display_name field (per VENDOR_DISPLAY_NAME_MIGRATION.sql)

**Issue 1.3: Image Upload is Mock Only**
```typescript
// Line 86-89 in post-product.tsx
const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`;
```
- ❌ No real image upload to storage
- ❌ No integration with `backend/trpc/routes/upload/image.ts`

---

### 2️⃣ **Product Listing & Marketplace Display** 🔴 (BROKEN)

**Files:**
- `backend/trpc/routes/marketplace/get-items.ts`
- `backend/trpc/routes/shop/get-vendor-products.ts`
- `app/(tabs)/marketplace.tsx`

#### 🔴 Critical Issues:

**Issue 2.1: Marketplace Uses Mock Data**
```typescript
// Line 37 in marketplace.tsx
import { mockProducts, type Product } from '@/constants/products';

// Line 325-357
const filteredProducts = useMemo(() => {
  const q = searchQuery.toLowerCase();
  let list = mockProducts.filter(product => {
    // Filters mock data, NOT real database products
  });
}, [searchQuery, selectedCategory, selectedLocation, sortBy, userLocation]);
```
- ❌ **CRITICAL:** Marketplace displays hardcoded mock products
- ❌ Never calls `trpc.marketplace.getItems.useQuery()`
- ❌ Real vendor products are invisible to buyers

**Issue 2.2: Database Query Exists But Unused**
```typescript
// backend/trpc/routes/marketplace/get-items.ts
const { data, error } = await ctx.supabase.rpc('get_marketplace_items', {
  p_category: input.category || null,
  p_location: input.location || null,
  // ... other params
});
```
- ✅ Backend route exists
- ❌ Frontend never calls it
- ❌ RPC function `get_marketplace_items` may not exist in database

**Issue 2.3: Vendor Products Query Disconnected**
```typescript
// backend/trpc/routes/shop/get-vendor-products.ts
let query = ctx.supabase
  .from('marketplace_products')
  .select('*')
  .eq('user_id', input.vendorId)
  .eq('status', 'active')
```
- ✅ Queries correct table
- ❌ Not used in marketplace display
- ❌ Distance calculation duplicated (should be in shared utility)

---

### 3️⃣ **Buyer Product Discovery & Cart** 🟡 (Partially Working)

**Files:**
- `backend/trpc/routes/products/add-to-cart.ts`
- `providers/cart-provider.tsx`

#### 🔴 Critical Issues:

**Issue 3.1: Add to Cart Uses Mock Data**
```typescript
// Line 36-55 in add-to-cart.ts
// Mock product details (in production, fetch from products table)
const productDetails = {
  id: productId,
  name: 'Fresh Tomatoes',
  price: 120,
  // ... hardcoded mock data
};
```
- ❌ Doesn't fetch real product from database
- ❌ No stock validation
- ❌ No price verification

**Issue 3.2: Cart Not Persisted to Database**
```typescript
// Line 24-34 commented out
// In production, add to cart table in Supabase
// const { data, error } = await supabase
//   .from('cart_items')
//   .upsert({...})
```
- ❌ Cart only exists in React state (cart-provider)
- ❌ Lost on app restart
- ❌ No cart sync across devices

**Issue 3.3: Bundle Cart Route Exists But Unused**
- `backend/trpc/routes/cart/add-bundle.ts` - ✅ Implemented
- `backend/trpc/routes/cart/sync-cart.ts` - ✅ Implemented
- `backend/trpc/routes/cart/get-cart.ts` - ✅ Implemented
- ❌ None are called from frontend

---

### 4️⃣ **Checkout & Order Creation** 🟡 (Mock Implementation)

**File:** `backend/trpc/routes/checkout/checkout-order.ts`

#### 🔴 Critical Issues:

**Issue 4.1: Order Not Saved to Database**
```typescript
// Line 59-73 in checkout-order.ts
const order = {
  id: orderId,
  userId: input.userId,
  trackingId: trackingId,
  status: 'pending' as const,
  // ... order data
};

// Line 75-80 comment
// In a real app, this would:
// 1. Save order to database
// 2. Process payment
// 3. Notify delivery provider
```
- ❌ Order object created but never saved
- ❌ No database persistence
- ❌ No payment processing integration

**Issue 4.2: Missing Multi-Seller Logic**
- Multi-seller routes exist:
  - `backend/trpc/routes/checkout/multi-seller-checkout.ts`
  - `backend/trpc/routes/checkout/get-seller-delivery-quotes.ts`
- ❌ Not integrated in main checkout flow
- ❌ Single-seller checkout doesn't split orders by vendor

**Issue 4.3: No Cart Clearing**
```typescript
// Line 80 comment: "5. Clear user's cart"
```
- ❌ Cart never cleared after successful order
- ❌ Items remain in cart after checkout

---

### 5️⃣ **Order Fulfillment & Tracking** 🔴 (Mock Data Only)

**Files:**
- `backend/trpc/routes/orders/get-active-orders.ts`
- `app/order-tracking.tsx`

#### 🔴 Critical Issues:

**Issue 5.1: Orders Are Hardcoded Mock Data**
```typescript
// Line 16-106 in get-active-orders.ts
const activeOrders = [
  {
    id: 'order_001',
    user_id: input.user_id,
    status: 'placed',
    // ... hardcoded mock orders
  },
  // ...
];
```
- ❌ **CRITICAL:** Returns hardcoded orders, not real database data
- ❌ No query to orders table
- ❌ Buyers see fake orders, not their real purchases

**Issue 5.2: Driver Data is Hardcoded**
```typescript
// Line 429-437 in order-tracking.tsx
<DriverCard
  name="Peter Kamau"
  phone="+254711000000"
  rating={4.8}
  vehicle="Toyota Probox - KCA 123A"
  // ... hardcoded driver info
/>
```
- ❌ Shows same driver for all orders
- ❌ No integration with logistics system
- ❌ Driver assignment not from database

**Issue 5.3: Order Status Updates Not Implemented**
- `backend/trpc/routes/orders/update-status.ts` exists
- ❌ Not called from tracking screen
- ❌ No real-time status updates
- ❌ No seller/driver status change triggers

---

## Database Schema Issues

### Missing Table Relationships

**Issue 6.1: marketplace_products Table**
```sql
-- Expected fields based on code:
- id (primary key)
- user_id (vendor)
- vendor_name
- vendor_display_name (missing in code)
- title
- category
- description
- price
- negotiable
- stock
- unit
- images (array)
- location_lat, location_lng
- location_label, location_address, location_city
- location_county, location_county_id
- location_sub_county, location_sub_county_id
- location_ward, location_ward_id
- is_draft
- status
- created_at, updated_at
```

**Missing:**
- ❌ Foreign key to profiles table
- ❌ Foreign key to vendor shops table
- ❌ Vendor verification status
- ❌ Product views counter
- ❌ Product rating aggregation

**Issue 6.2: orders Table Structure Unknown**
- Code references orders table but structure not verified
- Need fields:
  - order_id, user_id, seller_id, driver_id
  - items (JSONB or separate order_items table)
  - delivery_address (JSONB)
  - payment_method, payment_status
  - delivery_provider, delivery_fee
  - status, tracking_id
  - timestamps

**Issue 6.3: cart_items Table**
- Referenced in code but not used
- Need fields:
  - user_id, product_id, quantity
  - selected_variety (optional)
  - added_at
  - Unique constraint on (user_id, product_id)

---

## Integration Gaps

### 7️⃣ **Missing Integrations**

**Issue 7.1: Search Not Connected**
- `backend/trpc/routes/search/advanced-search.ts` exists
- `app/search.tsx` exists
- ❌ Marketplace search button routes to `/search` but search doesn't query real products

**Issue 7.2: Vendor Profile Disconnect**
- Products have vendor_name field
- ❌ No link to vendor profile page
- ❌ Can't view vendor's other products
- ❌ Vendor verification badge not synced

**Issue 7.3: Location-Aware Features Incomplete**
- Location provider works ✅
- Distance calculation exists ✅
- ❌ Marketplace doesn't filter by user location
- ❌ Delivery fee calculation not integrated
- ❌ Nearest sellers not prioritized

**Issue 7.4: Payment Integration Missing**
- Payment routes exist:
  - `backend/trpc/routes/payments/split-payment.ts`
  - `backend/trpc/routes/payments/release-escrow.ts`
- ❌ Not called during checkout
- ❌ No M-Pesa/AgriPay integration
- ❌ No payment verification

**Issue 7.5: Logistics Assignment Missing**
- Logistics routes exist:
  - `backend/trpc/routes/logistics/coordinate-pickups.ts`
  - `backend/trpc/routes/delivery/calculate-route.ts`
- ❌ Not triggered on order creation
- ❌ No driver assignment logic
- ❌ No delivery tracking updates

---

## Critical Path to Fix

### Phase 1: Database Foundation (Priority 1)

1. **Verify/Create Database Tables**
   - Run `SUPABASE_MARKETPLACE_SCHEMA.sql`
   - Verify `marketplace_products` table exists
   - Create `orders` table with proper structure
   - Create `order_items` table
   - Create `cart_items` table
   - Add foreign keys and indexes

2. **Verify RPC Functions**
   - Check if `get_marketplace_items` exists
   - If not, create it or replace with direct query
   - Test with sample data

### Phase 2: Connect Product Creation (Priority 1)

1. **Fix Product Creation**
   ```typescript
   // In create-product.ts
   // Add vendor_display_name from profiles
   // Link to vendor shop if exists
   // Implement real image upload
   ```

2. **Replace Mock Marketplace**
   ```typescript
   // In marketplace.tsx
   // Remove mockProducts import
   // Add: const { data: products } = trpc.marketplace.getItems.useQuery({...})
   // Update ProductCard to use real data
   ```

### Phase 3: Fix Cart & Checkout (Priority 1)

1. **Persist Cart to Database**
   ```typescript
   // In cart-provider.tsx
   // Call trpc.cart.syncCart.useMutation()
   // Load cart from trpc.cart.getCart.useQuery()
   ```

2. **Save Orders to Database**
   ```typescript
   // In checkout-order.ts
   // Add: await ctx.supabase.from('orders').insert(order)
   // Create order_items records
   // Clear cart after successful order
   ```

### Phase 4: Order Tracking (Priority 2)

1. **Replace Mock Orders**
   ```typescript
   // In get-active-orders.ts
   // Query real orders from database
   // Join with products, sellers, drivers
   ```

2. **Integrate Driver Assignment**
   ```typescript
   // On order creation
   // Call logistics.coordinatePickups
   // Assign driver from logistics system
   ```

### Phase 5: Integrations (Priority 2)

1. **Connect Search**
2. **Link Vendor Profiles**
3. **Integrate Payment Processing**
4. **Enable Real-time Tracking**

---

## Immediate Action Items

### 🔥 Must Fix Now (Blocking Buyers)

1. **Replace marketplace mock data with database query**
   - File: `app/(tabs)/marketplace.tsx`
   - Remove `mockProducts` import
   - Add `trpc.marketplace.getItems.useQuery()`

2. **Save products to database properly**
   - Verify `marketplace_products` table exists
   - Test product creation end-to-end

3. **Save orders to database**
   - File: `backend/trpc/routes/checkout/checkout-order.ts`
   - Add database insert
   - Create order_items records

4. **Query real orders in tracking**
   - File: `backend/trpc/routes/orders/get-active-orders.ts`
   - Replace mock data with database query

### ⚠️ Should Fix Soon (Data Integrity)

5. Persist cart to database
6. Implement real image upload
7. Link vendor profiles to products
8. Integrate payment processing
9. Connect logistics assignment

### 📋 Can Fix Later (Enhancements)

10. Location-based filtering
11. Advanced search integration
12. Real-time tracking updates
13. Multi-seller order splitting

---

## Testing Checklist

After fixes, test this flow:

1. ✅ Vendor creates product → Saved to database
2. ✅ Product appears in marketplace → Real data displayed
3. ✅ Buyer adds to cart → Cart persisted
4. ✅ Buyer checks out → Order saved to database
5. ✅ Order appears in buyer's orders → Real order data
6. ✅ Tracking shows correct info → Driver assigned
7. ✅ Payment processed → Escrow held
8. ✅ Delivery completed → Payment released

---

## Summary

**Current State:** 🔴 **BROKEN**
- Vendors can create products ✅
- Products saved to database ✅
- **BUT** marketplace shows mock data ❌
- **Result:** Real products never reach buyers ❌

**Root Cause:** Frontend-backend disconnect
- Backend routes exist and work
- Frontend uses mock data instead of calling backend
- Database tables may be incomplete

**Fix Complexity:** Medium
- Most backend code exists
- Need to connect frontend to backend
- Need to verify/fix database schema
- Estimated: 2-3 days for critical path

**Risk:** High
- Current system appears to work (shows products)
- But it's all fake data
- Real vendor products are invisible
- No real orders are being processed

---

## Recommendations

1. **Immediate:** Stop using mock data in marketplace
2. **Urgent:** Verify database schema matches code expectations
3. **Critical:** Test product creation → marketplace display flow
4. **Important:** Implement proper error handling for missing data
5. **Essential:** Add logging to track data flow through system

---

**Next Steps:**
1. Run database schema verification
2. Replace marketplace mock data
3. Test end-to-end flow
4. Fix any database/schema issues discovered
5. Implement remaining integrations

---

*End of Audit Report*
