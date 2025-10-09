# 🚀 BANDA QUICK START GUIDE

**For Developers** - Get up and running in 30 minutes

---

## ✅ WHAT'S READY TO USE

### Backend (100% Ready)
- ✅ 43 tRPC procedures
- ✅ Complete database schema
- ✅ All triggers and functions
- ✅ RLS policies configured

### Frontend (Partially Ready)
- ✅ Service requests management screen
- ✅ Logistics delivery management screen
- ⚠️ Shop products screen (uses mock data - needs fix)

---

## 🔧 IMMEDIATE FIX NEEDED

### Fix Shop-Products Screen (30 minutes)

**File:** `app/shop-products.tsx`

**Current Problem:** Uses hardcoded mock data

**Solution:** Replace lines 17-26 with:

```typescript
const { data: shop } = trpc.shop.getMyShop.useQuery();
const { data: products, isLoading, refetch } = trpc.shop.getShopProductsFull.useQuery(
  { shopId: shop?.id! },
  { enabled: !!shop?.id }
);

const updateStockMutation = trpc.shop.updateProductStock.useMutation({
  onSuccess: () => refetch(),
});

const deleteProductMutation = trpc.shop.deleteProduct.useMutation({
  onSuccess: () => refetch(),
});
```

**Update handleUpdateStock function:**

```typescript
const handleUpdateStock = (productId: string, newStock: number) => {
  updateStockMutation.mutate({
    shopId: shop?.id!,
    productId,
    stock: newStock,
  });
};
```

**Update handleDeleteProduct function:**

```typescript
const handleDeleteProduct = (productId: string) => {
  Alert.alert(
    'Delete Product',
    'Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProductMutation.mutate({
            shopId: shop?.id!,
            productId,
          });
        },
      },
    ]
  );
};
```

---

## 📋 AVAILABLE BACKEND PROCEDURES

### Shop System
```typescript
// Get user's shop
const { data: shop } = trpc.shop.getMyShop.useQuery();

// Get all products
const { data: products } = trpc.shop.getShopProductsFull.useQuery({
  shopId: shop?.id!
});

// Get inventory alerts
const { data: alerts } = trpc.shop.getInventoryAlerts.useQuery({
  shopId: shop?.id!,
  threshold: 10
});

// Update product stock
const updateStock = trpc.shop.updateProductStock.useMutation();
updateStock.mutate({ shopId, productId, stock: 50 });

// Bulk update products
const bulkUpdate = trpc.shop.bulkUpdateProducts.useMutation();
bulkUpdate.mutate({
  shopId,
  updates: [
    { productId: 'id1', stock: 100 },
    { productId: 'id2', price: 250 }
  ]
});

// Create product
const createProduct = trpc.shop.createProduct.useMutation();

// Update product
const updateProduct = trpc.shop.updateProduct.useMutation();

// Delete product
const deleteProduct = trpc.shop.deleteProduct.useMutation();
```

### Service Providers
```typescript
// Get my profile
const { data: profile } = trpc.serviceProviders.getMyProfile.useQuery();

// Get service requests
const { data: requests } = trpc.serviceProviders.getServiceRequests.useQuery({
  status: 'pending'
});

// Update request status
const updateStatus = trpc.serviceProviders.updateRequestStatus.useMutation();
updateStatus.mutate({ requestId, status: 'accepted' });

// Upload service proof
const uploadProof = trpc.serviceProviders.uploadServiceProof.useMutation();
uploadProof.mutate({
  requestId,
  proofImages: ['url1', 'url2'],
  notes: 'Work completed'
});

// Rate service provider
const rateProvider = trpc.serviceProviders.rateServiceProvider.useMutation();
rateProvider.mutate({ requestId, rating: 5, review: 'Excellent!' });
```

### Logistics
```typescript
// Get deliveries
const { data: deliveries } = trpc.logistics.getDeliveries.useQuery({
  status: 'pending'
});

// Get available drivers
const { data: drivers } = trpc.logistics.getAvailableDrivers.useQuery({
  location: { lat: -1.286389, lng: 36.817223 },
  radius: 50
});

// Assign driver
const assignDriver = trpc.logistics.assignDriver.useMutation();
assignDriver.mutate({ assignmentId, driverId, vehicleId });

// Update delivery status
const updateStatus = trpc.logistics.updateDeliveryStatus.useMutation();
updateStatus.mutate({ assignmentId, status: 'in_progress' });

// Upload delivery proof
const uploadProof = trpc.logistics.uploadDeliveryProof.useMutation();
uploadProof.mutate({
  assignmentId,
  proofImages: ['url1'],
  recipientName: 'John Doe',
  recipientSignature: 'signatureUrl'
});

// Rate driver
const rateDriver = trpc.logistics.rateDriver.useMutation();
rateDriver.mutate({ assignmentId, rating: 5, comment: 'Great service!' });
```

---

## 🗄️ DATABASE SETUP

### Run These SQL Files in Supabase

1. **Shop System:**
```sql
-- Run: SUPABASE_COMPLETE_SHOP_SCHEMA_WITH_POSTGIS.sql
-- This creates: shops, shop_products, shop_orders, etc.
```

2. **Services & Logistics:**
```sql
-- Run: SUPABASE_SERVICE_LOGISTICS_COMPLETE_SCHEMA.sql
-- This creates: service_providers, logistics_drivers, etc.
```

### Verify Setup
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('shops', 'shop_products', 'service_providers', 'logistics_drivers');

-- Check if PostGIS is enabled
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

---

## 🎨 UI PATTERNS

### Loading State
```typescript
if (isLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}
```

### Error State
```typescript
if (error) {
  return (
    <View style={styles.errorContainer}>
      <AlertCircle size={48} color="#FF3B30" />
      <Text style={styles.errorText}>{error.message}</Text>
      <TouchableOpacity onPress={() => refetch()}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Empty State
```typescript
if (!data || data.length === 0) {
  return (
    <View style={styles.emptyContainer}>
      <Package size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>Add your first product to get started</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Mutation with Optimistic Update
```typescript
const updateMutation = trpc.shop.updateProduct.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['shop-products']);
    
    // Snapshot previous value
    const previousProducts = queryClient.getQueryData(['shop-products']);
    
    // Optimistically update
    queryClient.setQueryData(['shop-products'], (old: any) => {
      return old.map((p: any) => 
        p.id === newData.productId ? { ...p, ...newData } : p
      );
    });
    
    return { previousProducts };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['shop-products'], context?.previousProducts);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries(['shop-products']);
  },
});
```

---

## 🔍 DEBUGGING

### Check Backend Connection
```typescript
const { data } = trpc.system.health.useQuery();
console.log('Backend health:', data);
```

### Check User Session
```typescript
const { data: session } = trpc.profile.fetchSession.useQuery();
console.log('User session:', session);
```

### Check Shop Exists
```typescript
const { data: shop } = trpc.shop.getMyShop.useQuery();
console.log('User shop:', shop);
```

### Enable React Query Devtools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to your app
<ReactQueryDevtools initialIsOpen={false} />
```

---

## 📱 TESTING

### Test Shop Products Flow
1. Create a shop (if not exists)
2. Add products
3. View products list
4. Update product stock
5. Delete product

### Test Service Requests Flow
1. Create service provider profile
2. Create service request
3. Accept request
4. Upload proof
5. Rate provider

### Test Logistics Flow
1. Create logistics profile (owner/driver)
2. Create delivery assignment
3. Assign driver
4. Update delivery status
5. Upload proof
6. Rate driver

---

## 🚨 COMMON ISSUES

### Issue: "Shop not found"
**Solution:** User needs to create a shop first
```typescript
const createShop = trpc.shop.createShop.useMutation();
// Note: This procedure might need to be created
```

### Issue: "Permission denied"
**Solution:** Check RLS policies in Supabase
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'shops';
```

### Issue: "Type error in tRPC"
**Solution:** Regenerate types
```bash
# If using tRPC code generation
npm run generate
```

### Issue: "Products not loading"
**Solution:** Check if shop_id is valid
```typescript
console.log('Shop ID:', shop?.id);
console.log('Products query enabled:', !!shop?.id);
```

---

## 📚 NEXT STEPS

1. ✅ Fix shop-products.tsx (30 min)
2. ✅ Test with real data
3. ✅ Create inventory alerts screen (45 min)
4. ✅ Create service marketplace (1 hour)
5. ✅ Create driver assignment (1 hour)

---

## 💡 PRO TIPS

### Use React Query Hooks
```typescript
// Prefetch data
queryClient.prefetchQuery(['shop-products'], () => 
  trpcClient.shop.getShopProductsFull.query({ shopId })
);

// Invalidate cache
queryClient.invalidateQueries(['shop-products']);

// Set query data manually
queryClient.setQueryData(['shop-products'], newData);
```

### Handle Mutations Properly
```typescript
const mutation = trpc.shop.updateProduct.useMutation({
  onSuccess: (data) => {
    // Show success message
    Alert.alert('Success', 'Product updated');
    // Refetch data
    refetch();
  },
  onError: (error) => {
    // Show error message
    Alert.alert('Error', error.message);
  },
});
```

### Use Conditional Queries
```typescript
const { data } = trpc.shop.getProducts.useQuery(
  { shopId: shop?.id! },
  { 
    enabled: !!shop?.id,  // Only run if shop exists
    refetchOnWindowFocus: false,  // Don't refetch on focus
    staleTime: 5 * 60 * 1000,  // Consider data fresh for 5 minutes
  }
);
```

---

## 🎯 SUCCESS CHECKLIST

- [ ] Database schemas run successfully
- [ ] Backend health check passes
- [ ] User can create/view shop
- [ ] Products load from database
- [ ] CRUD operations work
- [ ] Service requests work
- [ ] Logistics assignments work
- [ ] All screens show real data

---

**Need Help?** Check `IMPLEMENTATION_SUMMARY.md` for detailed information.
