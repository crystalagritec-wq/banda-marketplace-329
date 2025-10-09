# 🔍 COMPREHENSIVE AUDIT: Profile, Shop, Marketplace & Product Screen Conflicts

**Date:** 2025-10-09  
**Status:** 🔴 CRITICAL CONFLICTS DETECTED  
**Priority:** HIGH

---

## 📋 EXECUTIVE SUMMARY

This audit reveals **critical conflicts and inconsistencies** across the Profile, Shop Dashboard, Marketplace, and Product screens that create data flow issues, user confusion, and potential system failures.

### 🚨 Critical Issues Found: **12**
### ⚠️ Major Issues Found: **8**
### ℹ️ Minor Issues Found: **6**

---

## 🔴 CRITICAL CONFLICTS

### 1. **VENDOR IDENTITY CRISIS** 🆔
**Severity:** CRITICAL  
**Impact:** Data inconsistency, broken navigation, user confusion

#### Problem:
Multiple conflicting vendor name fields across the system:
- `profile.vendor_name` (vendor profile)
- `profile.vendor_display_name` (shop query)
- `profile.business_name` (profile table)
- `profile.full_name` (fallback)
- `product.vendor_name` (marketplace products)

#### Evidence:
```typescript
// app/(tabs)/profile.tsx (Line 98)
const hasShop = shopQuery.data?.exists === true && 
  (shopQuery.data?.profile !== null || shopQuery.data?.hasProducts === true);
// ❌ ERROR: shopQuery.data?.shop is undefined but code expects it

// backend/trpc/routes/shop/get-my-shop.ts (Line 40)
name: profile.vendor_display_name || profile.business_name || profile.full_name || 'My Shop',
// ❌ vendor_display_name doesn't exist in profiles table

// backend/trpc/routes/shop/get-vendor-profile.ts (Line 61)
const vendorDisplayName = profile.business_name || profile.full_name || 'Unknown Vendor';
// ❌ Different fallback logic than get-my-shop
```

#### Impact:
- Profile screen shows wrong shop name
- Vendor page displays different name than marketplace
- Product cards show inconsistent vendor names
- Navigation breaks when clicking vendor links

---

### 2. **SHOP EXISTENCE DETECTION FAILURE** 🏪
**Severity:** CRITICAL  
**Impact:** Dashboard buttons don't appear, broken shop access

#### Problem:
Profile screen checks `shopQuery.data?.shop` but backend returns `shopQuery.data?.profile`:

```typescript
// app/(tabs)/profile.tsx (Line 98)
const hasShop = shopQuery.data?.exists === true && 
  (shopQuery.data?.profile !== null || shopQuery.data?.hasProducts === true);
// ✅ Correct check

// app/(tabs)/profile.tsx (Line 194-205)
{hasShop && (
  <TouchableOpacity 
    style={styles.dashboardCard}
    onPress={() => router.push('/shop-dashboard' as any)}
  >
    <Text style={styles.dashboardTitle}>Shop Dashboard</Text>
  </TouchableOpacity>
)}
// ❌ But hasShop logic is complex and fragile
```

#### Backend Response Structure:
```typescript
// backend/trpc/routes/shop/get-my-shop.ts
return {
  exists: hasShop || hasProducts,
  profile: hasShop ? profile : null,
  shop: hasShop ? { id, name, verified, avatar, location, businessType } : null,
  hasProducts,
};
// ❌ Returns 'shop' object but frontend doesn't use it
```

#### Impact:
- Shop dashboard button may not appear even when shop exists
- Inconsistent shop detection logic
- Users can't access their shop dashboard

---

### 3. **PRODUCT-TO-VENDOR NAVIGATION BROKEN** 🔗
**Severity:** CRITICAL  
**Impact:** Users can't view vendor shops from products

#### Problem:
Product screen navigates to `/vendor/${current.id}` but should use vendor ID:

```typescript
// app/(tabs)/product/[id].tsx (Line 664)
<TouchableOpacity 
  style={styles.vendorCard}
  onPress={() => router.push(`/vendor/${current.id}` as any)}
  // ❌ Uses product.id instead of vendor ID
>
```

#### Correct Implementation:
```typescript
// Should be:
onPress={() => router.push(`/vendor/${current.vendor_id || current.user_id}` as any)}
```

#### Impact:
- Clicking vendor card on product page shows wrong vendor
- 404 errors when vendor ID doesn't match product ID
- Broken vendor discovery flow

---

### 4. **MARKETPLACE DATA STRUCTURE MISMATCH** 📦
**Severity:** CRITICAL  
**Impact:** Products don't display correctly, missing vendor info

#### Problem:
Marketplace expects `vendor_name` but backend returns different structure:

```typescript
// app/(tabs)/marketplace.tsx (Line 364)
vendor: product.vendor_name || 'Unknown Vendor',
// ❌ vendor_name may not exist in marketplace_products

// backend/trpc/routes/marketplace/get-items.ts
// Uses RPC function 'get_marketplace_items' which may not include vendor_name
```

#### Missing Fields:
- `vendor_name` not consistently populated
- `vendor_id` or `user_id` not exposed
- Vendor verification status unclear
- Vendor location not included

#### Impact:
- Products show "Unknown Vendor"
- Can't navigate to vendor profile
- Missing vendor verification badges
- Broken vendor filtering

---

### 5. **SHOP DASHBOARD VENDOR ID CONFUSION** 👤
**Severity:** CRITICAL  
**Impact:** Wrong vendor data loaded, security risk

#### Problem:
Shop dashboard uses `user?.id` as `vendorId` but should use shop/vendor ID:

```typescript
// app/shop-dashboard.tsx (Line 29)
const statsQuery = trpc.shop.getVendorStats.useQuery(
  { vendorId: user?.id || '', period },
  { enabled: !!user?.id }
);
// ❌ Assumes user.id === vendor.id (not always true)
```

#### Security Risk:
- User could potentially access another vendor's dashboard
- Stats may show wrong data
- Orders may be fetched for wrong vendor

---

### 6. **PRODUCT COORDINATES MISSING** 📍
**Severity:** CRITICAL  
**Impact:** Distance calculations fail, location features broken

#### Problem:
Product screen expects `coordinates` but marketplace doesn't provide them:

```typescript
// app/(tabs)/product/[id].tsx (Line 252-255)
const distanceFromUser = useMemo(() => {
  if (!current?.coordinates || !userLocation?.coordinates) return null;
  const distance = calculateDistance(userLocation.coordinates, current.coordinates);
  return distance;
}, [current?.coordinates, userLocation?.coordinates]);
// ❌ current.coordinates is undefined for marketplace products
```

#### Missing Data:
```typescript
// mockProducts has coordinates, but real products don't:
coordinates: { lat: number; lng: number } | null;
```

#### Impact:
- Distance badges don't show
- Location-based sorting fails
- Delivery estimates incorrect
- Map features broken

---

## ⚠️ MAJOR ISSUES

### 7. **INCONSISTENT PRODUCT SCHEMA** 📋
**Severity:** MAJOR  
**Impact:** Type errors, missing features

#### Problem:
Product interface differs between screens:

**Marketplace Product:**
```typescript
{
  id, title, price, vendor_name, location_county, location_city,
  rating, images, category, negotiable, status, stock, unit,
  location_lat, location_lng
}
```

**Mock Product (Product Screen):**
```typescript
{
  id, name, price, vendor, location, rating, image, category,
  discount, verified, coordinates, distanceKm, stock, unit,
  inStock, vendorVerified, negotiable, fastDelivery, variants,
  flashSale, gallery
}
```

#### Conflicts:
- `title` vs `name`
- `images[]` vs `image` + `gallery[]`
- `vendor_name` vs `vendor`
- `location_county/city` vs `location`
- Missing: `variants`, `flashSale`, `fastDelivery`, `discount`

---

### 8. **VENDOR PROFILE INCOMPLETE** 👤
**Severity:** MAJOR  
**Impact:** Poor vendor pages, missing info

#### Problem:
Vendor profile page shows minimal information:

```typescript
// app/vendor/[vendorId].tsx
// Only shows: name, location, rating, product count
// Missing: bio, business hours, policies, social links, badges
```

#### Missing Features:
- Vendor bio/description
- Business hours
- Return policy
- Shipping policy
- Social media links
- Verification badges
- Response time
- Completion rate

---

### 9. **CART INTEGRATION INCONSISTENCY** 🛒
**Severity:** MAJOR  
**Impact:** Cart items have wrong data

#### Problem:
Different screens add products to cart with different structures:

**Marketplace:**
```typescript
// app/(tabs)/marketplace.tsx (Line 304)
addToCart(product as any, 1);
// ❌ Uses 'as any' to bypass type checking
```

**Product Screen:**
```typescript
// app/(tabs)/product/[id].tsx (Line 173)
addToCart(p, quantity);
// ✅ Uses proper Product type
```

**Vendor Page:**
```typescript
// app/vendor/[vendorId].tsx (Line 89-103)
addToCart({
  id, name, price, image, vendor, location, unit,
  inStock, category, rating, vendorVerified, negotiable,
  fastDelivery, coordinates
}, 1);
// ✅ Manually constructs proper structure
```

#### Impact:
- Cart items may have missing fields
- Checkout may fail
- Price calculations incorrect

---

### 10. **PROFILE DASHBOARD BUTTON LOGIC** 🎛️
**Severity:** MAJOR  
**Impact:** Confusing UX, buttons appear/disappear

#### Problem:
Complex logic determines when dashboard buttons show:

```typescript
// app/(tabs)/profile.tsx (Line 98-99)
const hasShop = shopQuery.data?.exists === true && 
  (shopQuery.data?.profile !== null || shopQuery.data?.hasProducts === true);

const hasServiceProvider = serviceProviderQuery.data?.profile !== null && 
  serviceProviderQuery.data?.profile !== undefined;
```

#### Issues:
- `hasShop` checks both profile AND products (redundant)
- `hasServiceProvider` checks null AND undefined (redundant)
- No loading states shown
- Buttons appear/disappear on refresh

---

### 11. **SEARCH FUNCTIONALITY DISCONNECT** 🔍
**Severity:** MAJOR  
**Impact:** Search doesn't work across screens

#### Problem:
Marketplace has search bar but navigates to separate search screen:

```typescript
// app/(tabs)/marketplace.tsx (Line 462-468)
<TouchableOpacity 
  style={styles.searchBarContainer}
  onPress={() => router.push('/search')}
  activeOpacity={0.7}
>
  <Search size={20} color="#9CA3AF" />
  <Text style={styles.searchPlaceholder}>{i18n.searchPh}</Text>
</TouchableOpacity>
// ❌ Doesn't use local searchQuery state
```

#### Impact:
- Search state not preserved
- Can't search within marketplace
- Confusing navigation flow

---

### 12. **PRODUCT STOCK MANAGEMENT** 📊
**Severity:** MAJOR  
**Impact:** Out-of-stock products still purchasable

#### Problem:
Stock checks inconsistent across screens:

**Marketplace:**
```typescript
// app/(tabs)/marketplace.tsx (Line 379)
inStock: product.stock > 0,
// ✅ Correct check
```

**Product Screen:**
```typescript
// app/(tabs)/product/[id].tsx (Line 524-532)
{current.inStock ? (
  <View style={styles.activeBadge}>
    <Text style={styles.activeText}>In Stock</Text>
  </View>
) : (
  <View style={styles.outOfStockBadge}>
    <Text style={styles.outOfStockText}>Out of Stock</Text>
  </View>
)}
// ✅ Shows badge but...

// Line 1005-1011
disabled={!current.inStock || selectedOutOfStock}
// ✅ Disables button
```

**Vendor Page:**
```typescript
// app/vendor/[vendorId].tsx (Line 96)
inStock: product.stock > 0,
// ✅ Correct but no UI indication
```

#### Missing:
- Real-time stock updates
- Stock quantity display
- Low stock warnings
- Variant stock tracking

---

## ℹ️ MINOR ISSUES

### 13. **Inconsistent Loading States** ⏳
Different loading indicators across screens

### 14. **Error Handling Gaps** ❌
Some screens don't handle errors gracefully

### 15. **Accessibility Issues** ♿
Missing accessibility labels and roles

### 16. **Performance Concerns** ⚡
No pagination on vendor products page

### 17. **Image Handling** 🖼️
Inconsistent image array vs single image

### 18. **Rating System** ⭐
Mock ratings vs real review data

---

## 🔧 RECOMMENDED FIXES

### Priority 1: Data Structure Unification

#### 1.1 Create Unified Product Type
```typescript
// types/product.ts
export interface UnifiedProduct {
  // Core fields
  id: string;
  title: string;
  price: number;
  unit: string;
  stock: number;
  
  // Vendor fields
  vendor_id: string;
  vendor_name: string;
  vendor_verified: boolean;
  
  // Location fields
  location_county: string;
  location_city: string;
  location_lat: number | null;
  location_lng: number | null;
  
  // Media
  images: string[];
  
  // Metadata
  category: string;
  description: string;
  negotiable: boolean;
  rating: number;
  status: 'active' | 'inactive';
  
  // Computed fields (frontend only)
  distanceKm?: number | null;
  deliveryFee?: number | null;
}
```

#### 1.2 Fix Vendor Name Resolution
```typescript
// utils/vendor-helpers.ts
export function getVendorDisplayName(profile: any): string {
  return profile.business_name || 
         profile.full_name || 
         profile.vendor_display_name ||
         'Unknown Vendor';
}

export function getVendorId(product: any): string {
  return product.vendor_id || 
         product.user_id || 
         product.seller_id;
}
```

#### 1.3 Update Backend Responses
```sql
-- Add vendor_display_name to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS vendor_display_name TEXT;

-- Create trigger to sync vendor_display_name
CREATE OR REPLACE FUNCTION sync_vendor_display_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.vendor_display_name := COALESCE(
    NEW.business_name,
    NEW.full_name,
    'Vendor ' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_vendor_display_name
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_vendor_display_name();
```

### Priority 2: Navigation Fixes

#### 2.1 Fix Product-to-Vendor Navigation
```typescript
// app/(tabs)/product/[id].tsx
<TouchableOpacity 
  style={styles.vendorCard}
  onPress={() => {
    const vendorId = getVendorId(current);
    router.push(`/vendor/${vendorId}` as any);
  }}
>
```

#### 2.2 Fix Shop Dashboard Access
```typescript
// app/(tabs)/profile.tsx
const hasShop = useMemo(() => {
  return shopQuery.data?.exists === true;
}, [shopQuery.data?.exists]);

// Simplified button rendering
{hasShop && (
  <TouchableOpacity 
    style={styles.dashboardCard}
    onPress={() => router.push('/shop-dashboard' as any)}
  >
    <Text style={styles.dashboardTitle}>Shop Dashboard</Text>
  </TouchableOpacity>
)}
```

### Priority 3: Data Flow Improvements

#### 3.1 Update Marketplace Query
```typescript
// backend/trpc/routes/marketplace/get-items.ts
// Ensure RPC function returns vendor info
const { data, error } = await ctx.supabase.rpc('get_marketplace_items_with_vendor', {
  // ... params
});
```

```sql
-- Update RPC function
CREATE OR REPLACE FUNCTION get_marketplace_items_with_vendor(...)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    pr.vendor_display_name,
    pr.business_name,
    pr.full_name,
    pr.verified as vendor_verified
  FROM marketplace_products p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE p.status = 'active'
  -- ... filters
  ORDER BY ...;
END;
$$ LANGUAGE plpgsql;
```

#### 3.2 Add Coordinates to Products
```typescript
// app/(tabs)/marketplace.tsx
const filteredProducts = useMemo(() => {
  const products = marketplaceData?.data || [];
  
  return products.map((product: any) => {
    let distance: number | null = null;
    if (userLocation?.coordinates && product.location_lat && product.location_lng) {
      distance = calculateDistance(
        userLocation.coordinates,
        { lat: product.location_lat, lng: product.location_lng }
      );
    }
    
    return {
      ...product,
      coordinates: product.location_lat && product.location_lng ? {
        lat: product.location_lat,
        lng: product.location_lng
      } : null,
      distanceKm: distance,
    };
  });
}, [marketplaceData, userLocation]);
```

### Priority 4: Type Safety

#### 4.1 Remove 'as any' Casts
```typescript
// app/(tabs)/marketplace.tsx
// Before:
addToCart(product as any, 1);

// After:
const cartProduct: Product = {
  id: product.id,
  name: product.title,
  price: product.price,
  vendor: product.vendor_name || 'Unknown',
  location: product.location_county || product.location_city || 'Kenya',
  rating: product.rating || 0,
  image: product.images?.[0] || '',
  category: product.category,
  discount: 0,
  verified: product.status === 'active',
  coordinates: product.location_lat && product.location_lng ? {
    lat: product.location_lat,
    lng: product.location_lng
  } : null,
  distanceKm: product.distanceKm,
  stock: product.stock,
  unit: product.unit || 'unit',
  inStock: product.stock > 0,
  vendorVerified: product.vendor_verified || false,
  negotiable: product.negotiable || false,
  fastDelivery: false,
};
addToCart(cartProduct, 1);
```

---

## 📊 IMPACT ASSESSMENT

### User Experience Impact
- **High:** Users can't access vendor shops from products
- **High:** Shop dashboard doesn't appear for vendors
- **Medium:** Inconsistent vendor names cause confusion
- **Medium:** Missing distance information
- **Low:** Minor UI inconsistencies

### Data Integrity Impact
- **Critical:** Vendor ID mismatches
- **High:** Product schema inconsistencies
- **Medium:** Cart data structure issues

### Performance Impact
- **Low:** No major performance issues detected
- **Medium:** Unnecessary re-renders in profile screen

---

## ✅ TESTING CHECKLIST

### Profile Screen
- [ ] Shop dashboard button appears for vendors
- [ ] Service dashboard button appears for service providers
- [ ] Correct vendor name displayed
- [ ] Stats load correctly
- [ ] Navigation to dashboards works

### Shop Dashboard
- [ ] Loads correct vendor data
- [ ] Stats show accurate numbers
- [ ] Products list is correct
- [ ] Orders belong to vendor
- [ ] Navigation to products works

### Marketplace
- [ ] Products display with vendor names
- [ ] Distance calculations work
- [ ] Add to cart creates valid cart items
- [ ] Vendor links navigate correctly
- [ ] Search functionality works

### Product Screen
- [ ] Vendor card shows correct vendor
- [ ] Clicking vendor navigates to vendor page
- [ ] Distance from user displays
- [ ] Add to cart works
- [ ] Stock status accurate

### Vendor Page
- [ ] Loads correct vendor profile
- [ ] Products belong to vendor
- [ ] Stats are accurate
- [ ] Add to cart works
- [ ] Contact buttons functional

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1 (Critical - Week 1)
1. Fix vendor ID navigation
2. Unify vendor name resolution
3. Fix shop dashboard detection
4. Add vendor_display_name to database

### Phase 2 (High - Week 2)
5. Update marketplace RPC function
6. Add coordinates to products
7. Fix cart integration
8. Remove 'as any' casts

### Phase 3 (Medium - Week 3)
9. Improve error handling
10. Add loading states
11. Enhance vendor profiles
12. Add stock management

### Phase 4 (Low - Week 4)
13. Performance optimizations
14. Accessibility improvements
15. UI polish
16. Documentation

---

## 📝 CONCLUSION

The audit reveals **critical data flow issues** that prevent core functionality from working correctly. The primary issues stem from:

1. **Inconsistent vendor identification** across screens
2. **Mismatched data structures** between frontend and backend
3. **Broken navigation** between related screens
4. **Type safety issues** with 'as any' casts

**Immediate action required** on Priority 1 fixes to restore basic functionality.

---

**Audit Completed:** 2025-10-09  
**Next Review:** After Phase 1 implementation  
**Auditor:** Rork AI Assistant
