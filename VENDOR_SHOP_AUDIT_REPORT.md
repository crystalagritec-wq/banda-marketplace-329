# Vendor Shop System - Comprehensive Audit Report

**Date:** 2025-10-09  
**Scope:** Vendor shop system, product screen integration, and marketplace integration  
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

The vendor shop system has **critical conflicts and inconsistencies** across multiple layers:
- **Database field naming conflicts** (vendor_name vs business_name)
- **Incomplete integration** between shop, product, and marketplace screens
- **Missing vendor profile data** in product listings
- **Inconsistent data flow** from backend to frontend
- **Type safety issues** in TypeScript interfaces

---

## 🔴 Critical Issues

### 1. **Vendor Name Field Conflicts**

**Severity:** CRITICAL  
**Impact:** Data inconsistency, broken vendor profiles, incorrect product listings

#### Problem:
Multiple conflicting field names are used across the system:
- `vendor_name` (marketplace_products table)
- `business_name` (profiles table)
- `full_name` (profiles table)
- `name` (used in some queries)

#### Evidence:

**Backend - create-product.ts (Line 50):**
```typescript
vendor_name: userData.full_name || 'Unknown Vendor',
```

**Backend - get-vendor-profile.ts (Lines 61-67):**
```typescript
const vendorDisplayName = profile.business_name || profile.full_name || 'Unknown Vendor';
return {
  profile: {
    name: vendorDisplayName,
    vendor_name: vendorDisplayName,
    businessName: profile.business_name || profile.full_name,
  }
}
```

**Frontend - marketplace.tsx (Line 364):**
```typescript
vendor: product.vendor_name || 'Unknown Vendor',
```

**Frontend - vendor/[vendorId].tsx (Lines 72, 169):**
```typescript
message: `Check out ${vendorProfileQuery.data?.profile.vendor_name || vendorProfileQuery.data?.profile.name || 'this shop'}`
<Text style={styles.vendorName}>{vendor.profile.vendor_name || vendor.profile.name}</Text>
```

#### Impact:
- Products may show "Unknown Vendor" even when vendor has a business name
- Vendor profile pages may display incorrect names
- Search and filtering by vendor name may fail
- Inconsistent vendor branding across the app

---

### 2. **Missing Vendor Data in Product Listings**

**Severity:** HIGH  
**Impact:** Incomplete product information, poor UX

#### Problem:
The marketplace query doesn't join vendor profile data, resulting in missing:
- Vendor verification status
- Vendor rating
- Vendor location details
- Vendor contact information

#### Evidence:

**Backend - get-items.ts (Lines 19-28):**
```typescript
const { data, error } = await ctx.supabase.rpc('get_marketplace_items', {
  p_category: input.category || null,
  p_location: input.location || null,
  // ... no vendor profile join
});
```

**Frontend - marketplace.tsx (Lines 362-382):**
```typescript
return {
  id: product.id,
  name: product.title,
  vendor: product.vendor_name || 'Unknown Vendor', // ❌ No vendor profile data
  vendorVerified: product.status === 'active', // ❌ Wrong field
  // Missing: vendor rating, vendor phone, vendor bio
}
```

#### Impact:
- Users can't see if vendor is verified
- No vendor rating displayed on product cards
- Can't contact vendor directly from product listing
- Poor trust signals for buyers

---

### 3. **Product Screen Vendor Integration Issues**

**Severity:** HIGH  
**Impact:** Broken vendor navigation, missing vendor details

#### Problem:
Product detail screen uses mock data instead of fetching real vendor information.

#### Evidence:

**Frontend - product/[id].tsx (Lines 137-140):**
```typescript
const product: Product | undefined = useMemo(() => {
  console.log('[ProductDetails] resolving product for id', id);
  return mockProducts.find((p) => p.id === String(id)); // ❌ Using mock data
}, [id]);
```

**Backend - get-product.ts (Lines 14-28):**
```typescript
const { data, error } = await ctx.supabase
  .from('products') // ❌ Wrong table name (should be marketplace_products)
  .select(`
    *,
    vendor:vendor_id ( // ❌ Wrong field (should be user_id)
      id,
      name,
      phone,
      location,
      is_verified,
      reputation_score
    )
  `)
```

#### Impact:
- Product screen doesn't show real products from database
- Vendor profile link from product screen is broken
- Can't navigate to vendor shop from product details
- Inconsistent data between marketplace and product screens

---

### 4. **Shop Dashboard Data Inconsistencies**

**Severity:** MEDIUM  
**Impact:** Incorrect stats, broken analytics

#### Problem:
Shop dashboard queries use inconsistent field names and table references.

#### Evidence:

**Backend - get-vendor-stats.ts (Line 44):**
```typescript
.from('marketplace_products')
.select('id, stock_quantity, views')
.eq('seller_id', input.vendorId); // ❌ Should be user_id
```

**Backend - get-vendor-orders.ts (Line 34):**
```typescript
.eq('seller_id', input.vendorId) // ❌ Inconsistent with marketplace_products.user_id
```

#### Impact:
- Vendor stats may show zero products even when they have listings
- Order counts may be incorrect
- Revenue calculations may fail
- Dashboard appears broken to vendors

---

### 5. **Type Safety Issues**

**Severity:** MEDIUM  
**Impact:** Runtime errors, difficult debugging

#### Problem:
TypeScript interfaces don't match actual database schema.

#### Evidence:

**Frontend - vendor/[vendorId].tsx (Lines 80-106):**
```typescript
const handleAddToCart = (product: any) => { // ❌ Using 'any' type
  const defaultCoordinates: GeoCoordinates = { lat: -1.286389, lng: 36.817223 };
  const coordinates: GeoCoordinates = 
    product.location_lat && product.location_lng
      ? { lat: product.location_lat, lng: product.location_lng }
      : defaultCoordinates;

  addToCart(
    {
      id: product.id,
      name: product.title,
      vendor: product.vendor_name, // ❌ May be undefined
      // ... incomplete type checking
    },
    1
  );
}
```

#### Impact:
- Runtime errors when accessing undefined properties
- Difficult to catch bugs during development
- Poor IDE autocomplete support
- Maintenance difficulties

---

## 🟡 Medium Priority Issues

### 6. **Incomplete Vendor Profile Page**

**Issues:**
- No product reviews section
- Missing vendor statistics (total sales, response time)
- No vendor bio/description display
- Missing social proof elements
- No "Follow" or "Favorite" vendor functionality

**Location:** `app/vendor/[vendorId].tsx`

---

### 7. **Shop Products Management Issues**

**Issues:**
- Uses mock data instead of real database queries
- No image upload functionality
- Missing bulk operations (bulk edit, bulk delete)
- No product variants support
- Missing inventory alerts

**Location:** `app/shop-products.tsx`

---

### 8. **Missing Vendor Search and Filtering**

**Issues:**
- Can't search for vendors by name
- No vendor directory page
- Can't filter products by vendor
- Missing "Top Vendors" or "Featured Vendors" section

**Impact:** Users can't discover vendors easily

---

## 🟢 Integration Gaps

### 9. **Marketplace → Product → Vendor Flow**

**Current State:**
```
Marketplace (real data) → Product (mock data) → Vendor (real data)
```

**Issues:**
- Broken data flow due to mock data in product screen
- Can't navigate from marketplace to vendor shop reliably
- Inconsistent product information across screens

---

### 10. **Shop Dashboard → Product Management**

**Issues:**
- Dashboard shows stats but can't drill down to specific products
- No direct link from dashboard to edit products
- Missing quick actions (mark out of stock, adjust price)

---

## 📊 Database Schema Issues

### 11. **Inconsistent Foreign Keys**

**marketplace_products table:**
- Uses `user_id` to reference vendor
- Some queries use `seller_id` (doesn't exist)
- No proper foreign key constraint to profiles table

**orders table:**
- Uses `seller_id` to reference vendor
- Inconsistent with marketplace_products.user_id
- Creates join complexity

**Recommendation:** Standardize on `user_id` or `seller_id` across all tables

---

### 12. **Missing Vendor-Specific Fields**

**profiles table missing:**
- `shop_name` (separate from business_name)
- `shop_description`
- `shop_logo_url`
- `shop_banner_url`
- `shop_rating`
- `total_sales`
- `response_rate`
- `response_time_hours`

---

## 🔧 Recommended Fixes

### Priority 1: Critical Fixes (Immediate)

1. **Standardize Vendor Name Fields**
   ```sql
   -- Add computed column to profiles
   ALTER TABLE profiles ADD COLUMN display_name TEXT GENERATED ALWAYS AS (
     COALESCE(business_name, full_name, 'Unknown Vendor')
   ) STORED;
   
   -- Update marketplace_products to use display_name
   ALTER TABLE marketplace_products 
   ADD COLUMN vendor_display_name TEXT;
   
   -- Create trigger to sync vendor_display_name
   CREATE OR REPLACE FUNCTION sync_vendor_display_name()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.vendor_display_name := (
       SELECT display_name FROM profiles WHERE id = NEW.user_id
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Fix Marketplace Query to Include Vendor Data**
   ```typescript
   // backend/trpc/routes/marketplace/get-items.ts
   const { data, error } = await ctx.supabase
     .from('marketplace_products')
     .select(`
       *,
       vendor:user_id (
         id,
         display_name,
         business_name,
         full_name,
         verified,
         avatar_url,
         phone,
         location_city,
         location_county
       )
     `)
     .eq('status', 'active');
   ```

3. **Fix Product Screen to Use Real Data**
   ```typescript
   // app/(tabs)/product/[id].tsx
   const productQuery = trpc.products.getProduct.useQuery(
     { productId: id || '' },
     { enabled: !!id }
   );
   
   const product = productQuery.data;
   ```

4. **Standardize seller_id vs user_id**
   ```sql
   -- Rename seller_id to user_id in orders table
   ALTER TABLE orders RENAME COLUMN seller_id TO vendor_user_id;
   
   -- Or add alias in queries
   SELECT 
     o.*,
     p.display_name as vendor_name
   FROM orders o
   JOIN profiles p ON o.seller_id = p.id;
   ```

---

### Priority 2: High Priority Fixes (This Week)

5. **Add Vendor Profile Enrichment**
   - Create vendor_profiles table with shop-specific data
   - Add vendor rating calculation function
   - Implement vendor verification badge logic

6. **Implement Product → Vendor Navigation**
   - Add "Visit Shop" button on product screen
   - Pass vendor ID correctly
   - Ensure vendor profile loads with products

7. **Fix Shop Dashboard Queries**
   - Update all queries to use correct field names
   - Add proper error handling
   - Implement data caching

---

### Priority 3: Medium Priority (This Month)

8. **Add Vendor Search and Discovery**
   - Create vendor directory page
   - Implement vendor search
   - Add "Featured Vendors" section

9. **Enhance Shop Management**
   - Add bulk product operations
   - Implement image upload
   - Add inventory management

10. **Improve Type Safety**
    - Create proper TypeScript interfaces
    - Remove all `any` types
    - Add runtime validation with Zod

---

## 📝 Testing Checklist

### Critical Path Testing

- [ ] Create product as vendor → appears in marketplace
- [ ] Click product in marketplace → shows correct product details
- [ ] Click vendor name on product → navigates to vendor shop
- [ ] Vendor shop shows all vendor's products
- [ ] Add to cart from vendor shop → cart shows correct vendor name
- [ ] Checkout with product → order shows correct vendor
- [ ] Vendor dashboard shows correct stats

### Edge Cases

- [ ] Vendor with no business_name (uses full_name)
- [ ] Vendor with no products (empty shop)
- [ ] Product with no vendor (orphaned)
- [ ] Multiple products from same vendor in cart
- [ ] Vendor profile with missing location data

---

## 🎯 Success Metrics

After fixes are implemented, verify:

1. **Data Consistency:** 100% of products show correct vendor name
2. **Navigation:** 0 broken links between marketplace → product → vendor
3. **Type Safety:** 0 TypeScript errors, 0 `any` types in vendor code
4. **Performance:** Vendor shop loads in < 2 seconds
5. **User Experience:** Users can discover and contact vendors easily

---

## 📚 Related Files

### Frontend
- `app/vendor/[vendorId].tsx` - Vendor storefront
- `app/(tabs)/marketplace.tsx` - Product listings
- `app/(tabs)/product/[id].tsx` - Product details
- `app/shop-dashboard.tsx` - Vendor dashboard
- `app/shop-products.tsx` - Product management

### Backend
- `backend/trpc/routes/shop/get-vendor-profile.ts`
- `backend/trpc/routes/shop/get-vendor-products.ts`
- `backend/trpc/routes/shop/get-my-shop.ts`
- `backend/trpc/routes/marketplace/get-items.ts`
- `backend/trpc/routes/products/get-product.ts`
- `backend/trpc/routes/shop/create-product.ts`

### Database
- `marketplace_products` table
- `profiles` table
- `orders` table
- `get_marketplace_items` RPC function

---

## 🚨 Immediate Action Required

1. **Stop using mock data** in product screen
2. **Standardize vendor name fields** across all queries
3. **Fix marketplace query** to include vendor profile data
4. **Update TypeScript types** to match database schema
5. **Test critical user flows** end-to-end

---

## Conclusion

The vendor shop system has **fundamental architectural issues** that need immediate attention. The primary problems are:

1. **Inconsistent data model** (vendor_name vs business_name)
2. **Broken data flow** (mock data in product screen)
3. **Missing vendor information** in product listings
4. **Poor type safety** leading to runtime errors

**Estimated Fix Time:** 2-3 days for critical fixes, 1-2 weeks for complete overhaul

**Risk Level:** HIGH - Current state may cause data loss, broken user flows, and poor user experience

---

**Audited by:** Rork AI Assistant  
**Next Review:** After critical fixes are implemented
