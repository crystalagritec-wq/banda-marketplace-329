# 🛒 Banda Cart System Audit Report

**Date:** 2025-09-30  
**Auditor:** Rork AI  
**Scope:** Complete cart system analysis including frontend, backend, and data flow

---

## 📊 Executive Summary

The Banda cart system has a **hybrid architecture** with both client-side state management (React Context) and backend tRPC procedures. This audit identifies critical issues in synchronization, data persistence, multi-seller handling, and backend integration.

### Overall Health Score: **6.5/10**

**Critical Issues:** 5  
**Major Issues:** 8  
**Minor Issues:** 12

---

## 🔴 Critical Issues

### 1. **Cart State Synchronization Gap**
**Severity:** Critical  
**Location:** `providers/cart-provider.tsx` + Backend procedures

**Problem:**
- Frontend cart uses AsyncStorage for persistence
- Backend has separate cart procedures (`addToCartProcedure`, `updateCartProcedure`)
- **No synchronization** between client state and server state
- Cart items added via backend are not reflected in frontend state
- Cart items in frontend are not persisted to database

**Impact:**
- Cart data loss on device change
- Inconsistent cart state across sessions
- Multi-device cart sync impossible
- Backend cart operations don't update UI

**Recommendation:**
```typescript
// Implement unified cart sync strategy:
1. Use backend as source of truth
2. Sync frontend state with backend on mount
3. Optimistic updates with rollback on failure
4. Real-time sync using Supabase subscriptions
```

---

### 2. **Missing Cart Database Schema**
**Severity:** Critical  
**Location:** Database layer

**Problem:**
- Backend procedures reference `cart_items` table
- No schema definition found in SQL files
- No foreign key relationships defined
- No indexes for performance

**Impact:**
- Backend cart operations will fail
- Cannot persist cart data
- No data integrity constraints
- Poor query performance

**Recommendation:**
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_variety TEXT,
  seller_id TEXT,
  seller_name TEXT,
  seller_location TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_variety)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

---

### 3. **Cart Expiry Not Implemented**
**Severity:** Critical  
**Location:** `backend/trpc/routes/checkout/update-cart.ts`

**Problem:**
- Backend returns `expiryTime` (3 days)
- No actual expiry enforcement
- No cleanup job for expired carts
- No user notification before expiry

**Impact:**
- Stale cart data accumulates
- Database bloat
- Misleading user expectations
- Inventory not released

**Recommendation:**
```typescript
// Add cart expiry enforcement:
1. Database trigger to auto-delete expired carts
2. Cron job to clean up expired items
3. Frontend warning when cart near expiry
4. Extend expiry on user activity
```

---

### 4. **Multi-Seller Cart Calculation Errors**
**Severity:** Critical  
**Location:** `providers/cart-provider.tsx` lines 227-252

**Problem:**
- `groupedBySeller` calculates subtotals correctly
- BUT `cartSummary` ignores per-seller delivery fees
- Delivery fee hardcoded to 0
- No per-seller delivery fee aggregation

**Impact:**
- Incorrect total price shown to user
- Checkout will fail with price mismatch
- Revenue loss for delivery providers
- User confusion at payment

**Current Code:**
```typescript
const cartSummary = useMemo(() => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 0; // ❌ WRONG: Should aggregate from groupedBySeller
  const discount = 0;
  const total = subtotal - discount;
  // ...
}, [cartItems, groupedBySeller]);
```

**Fix Required:**
```typescript
const cartSummary = useMemo(() => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = groupedBySeller.reduce((sum, group) => sum + group.deliveryFee, 0);
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  // ...
}, [cartItems, groupedBySeller]);
```

---

### 5. **No Cart Item Validation**
**Severity:** Critical  
**Location:** All cart operations

**Problem:**
- No product availability check before adding to cart
- No stock quantity validation
- No price verification (price could change)
- No seller verification (seller could be inactive)

**Impact:**
- Users can checkout unavailable products
- Overselling inventory
- Price manipulation vulnerability
- Orders fail after payment

**Recommendation:**
```typescript
// Add validation layer:
1. Check product exists and is active
2. Verify stock availability
3. Validate current price matches
4. Confirm seller is active
5. Check delivery availability to user location
```

---

## 🟠 Major Issues

### 6. **Promo Code Logic Only in Frontend**
**Severity:** Major  
**Location:** `app/(tabs)/cart.tsx` lines 67-74

**Problem:**
- Promo code validation only in frontend
- Hardcoded "banda100" discount
- No backend verification
- Easy to manipulate

**Impact:**
- Promo code fraud
- Revenue loss
- No usage tracking
- Cannot enforce limits

---

### 7. **Cart Quantity Updates Not Debounced**
**Severity:** Major  
**Location:** `app/(tabs)/cart.tsx` line 52

**Problem:**
- Every quantity change triggers immediate state update
- Rapid clicks cause multiple AsyncStorage writes
- No debouncing or throttling
- Performance degradation with large carts

**Impact:**
- Poor UX with lag
- Excessive storage writes
- Battery drain
- Potential data corruption

---

### 8. **Missing Cart Analytics**
**Severity:** Major  
**Location:** Entire cart system

**Problem:**
- No tracking of cart abandonment
- No add-to-cart event logging
- No cart value analytics
- No conversion funnel tracking

**Impact:**
- Cannot optimize conversion
- No insight into user behavior
- Cannot identify friction points
- Missing revenue optimization data

---

### 9. **No Cart Conflict Resolution**
**Severity:** Major  
**Location:** Cart sync logic

**Problem:**
- What happens if user adds items on two devices?
- No merge strategy defined
- No conflict detection
- No user notification

**Impact:**
- Cart items lost
- User confusion
- Poor multi-device experience

---

### 10. **Bundle Add Not Integrated**
**Severity:** Major  
**Location:** `backend/trpc/routes/cart/add-bundle.ts`

**Problem:**
- Backend has bundle add procedure
- Not used anywhere in frontend
- No UI for bundle operations
- Orphaned code

---

### 11. **Cart Item Metadata Missing**
**Severity:** Major  
**Location:** `CartItem` interface

**Problem:**
- No `addedAt` timestamp in frontend
- No `updatedAt` tracking
- No `source` tracking (manual, recommendation, bundle)
- No `originalPrice` for price change detection

**Impact:**
- Cannot show "Added 2 days ago"
- Cannot detect stale items
- Cannot track cart source attribution
- Cannot alert on price changes

---

### 12. **No Cart Recovery**
**Severity:** Major  
**Location:** Cart persistence

**Problem:**
- If AsyncStorage fails, cart is lost
- No backup mechanism
- No error recovery
- No user notification

---

### 13. **Cart Loading State Incomplete**
**Severity:** Major  
**Location:** `providers/cart-provider.tsx` line 69

**Problem:**
- `isLoading` only set during initial load
- Not set during cart operations
- No operation-specific loading states
- No error states

**Impact:**
- No loading indicators during operations
- Cannot disable buttons during operations
- Race conditions possible
- Poor UX

---

## 🟡 Minor Issues

### 14. **Hardcoded Mock Data**
**Location:** `backend/trpc/routes/products/add-to-cart.ts` lines 47-55

Mock product details should be fetched from database.

---

### 15. **Inconsistent Error Handling**
**Location:** All backend procedures

Some throw errors, some return `{ success: false }`. Need consistent pattern.

---

### 16. **No Cart Size Limit**
**Location:** Cart operations

Users can add unlimited items. Should have reasonable limit (e.g., 50 items).

---

### 17. **Missing Cart Empty State Analytics**
**Location:** `app/(tabs)/cart.tsx` line 84

Should track when users see empty cart and from where they came.

---

### 18. **No Cart Item Image Fallback**
**Location:** `app/(tabs)/cart.tsx` line 184

If image fails to load, no fallback shown.

---

### 19. **Animated Values Memory Leak**
**Location:** `app/(tabs)/cart.tsx` lines 48-50

Animated values created but never cleaned up. Should use `useRef`.

---

### 20. **No Cart Sharing**
**Location:** Cart features

Users cannot share cart with others (useful for group orders).

---

### 21. **No Save for Later**
**Location:** Cart features

Users cannot move items to "save for later" list.

---

### 22. **No Cart Recommendations**
**Location:** Cart UI

No "Frequently bought together" or "You may also like" suggestions.

---

### 23. **No Cart Notifications**
**Location:** Cart system

No notifications for:
- Price drops on cart items
- Stock running low
- Cart expiring soon
- Seller promotions

---

### 24. **No Cart Export**
**Location:** Cart features

Users cannot export cart as list or share via WhatsApp.

---

### 25. **No Cart History**
**Location:** Cart system

Cannot view previous carts or restore deleted items.

---

## 🏗️ Architecture Issues

### Data Flow Problems

```
Current (Broken):
User Action → Frontend State → AsyncStorage
                ↓
            Backend API (separate, not synced)
                ↓
            Database (not implemented)

Recommended:
User Action → Frontend State (optimistic)
                ↓
            Backend API (source of truth)
                ↓
            Database → Real-time sync → Frontend State
```

### Missing Components

1. **Cart Service Layer**: No abstraction between UI and data
2. **Cart Validation Service**: No centralized validation
3. **Cart Sync Service**: No sync mechanism
4. **Cart Analytics Service**: No tracking
5. **Cart Notification Service**: No alerts

---

## 📋 Recommended Action Plan

### Phase 1: Critical Fixes (Week 1)
1. ✅ Create cart database schema
2. ✅ Implement cart sync between frontend and backend
3. ✅ Fix multi-seller delivery fee calculation
4. ✅ Add cart item validation
5. ✅ Implement cart expiry enforcement

### Phase 2: Major Improvements (Week 2)
1. ✅ Move promo code validation to backend
2. ✅ Add cart operation debouncing
3. ✅ Implement cart analytics
4. ✅ Add cart conflict resolution
5. ✅ Implement cart recovery mechanism

### Phase 3: Feature Enhancements (Week 3)
1. ✅ Add save for later
2. ✅ Implement cart sharing
3. ✅ Add cart recommendations
4. ✅ Implement cart notifications
5. ✅ Add cart history

### Phase 4: Polish (Week 4)
1. ✅ Add cart export
2. ✅ Improve error handling
3. ✅ Add comprehensive loading states
4. ✅ Optimize performance
5. ✅ Add unit tests

---

## 🎯 Success Metrics

After fixes, measure:
- **Cart abandonment rate** (target: <70%)
- **Cart-to-checkout conversion** (target: >40%)
- **Average cart value** (track trend)
- **Cart sync success rate** (target: >99%)
- **Cart operation latency** (target: <200ms)

---

## 🔧 Technical Debt

**Estimated effort to fix all issues:** 3-4 weeks  
**Priority:** High (blocking multi-seller checkout)  
**Risk if not fixed:** Revenue loss, poor UX, data integrity issues

---

## 📝 Notes

- Cart system is foundational to marketplace success
- Current implementation is MVP-level, needs production hardening
- Multi-seller support requires complete cart refactor
- Consider using established cart libraries (e.g., Shopify Buy SDK patterns)

---

**End of Audit Report**
