# 🔧 Logistics, Checkout, Order, QR & Location System Fixes

## Critical Issues Identified & Solutions

---

## 1️⃣ Order Tracking – Hardcoded Driver Data

### Problem
Driver information is hardcoded in `order-tracking.tsx` (lines 431-437), showing the same driver for all orders.

### Solution

#### Backend: Update `get-active-orders.ts`
```typescript
// backend/trpc/routes/orders/get-active-orders.ts
export const getActiveOrdersProcedure = publicProcedure
  .input(z.object({
    user_id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    const { data: orders, error } = await ctx.supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        created_at,
        estimated_delivery,
        items:order_items(
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          image_url
        ),
        seller:profiles!seller_id(
          id,
          full_name,
          phone
        ),
        driver:drivers!driver_id(
          id,
          name,
          phone,
          vehicle_plate,
          rating
        ),
        delivery_fee,
        service_fee
      `)
      .eq('buyer_id', input.user_id)
      .in('status', ['placed', 'confirmed', 'packed', 'shipped'])
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch active orders');

    return {
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    };
  });
```

#### Frontend: Update `order-tracking.tsx`
```typescript
// app/order-tracking.tsx (lines 428-438)
{(order.status === 'shipped' || order.status === 'delivered') && order.driver && (
  <DriverCard
    name={order.driver.name}
    phone={order.driver.phone}
    rating={order.driver.rating || 4.5}
    vehicle={order.driver.vehicle_plate || 'Vehicle info pending'}
    onCall={() => handleCallDriver(order.driver.phone)}
    onChat={handleChatDriver}
  />
)}

{/* Show placeholder if no driver assigned yet */}
{(order.status === 'shipped' || order.status === 'delivered') && !order.driver && (
  <View style={styles.driverCard}>
    <Text style={styles.driverPlaceholder}>Driver will be assigned shortly</Text>
  </View>
)}
```

---

## 2️⃣ Delivery Provider – AsyncStorage Only

### Problem
Delivery orders stored only in AsyncStorage (line 197-198 in `delivery-provider.tsx`), lost on app restart.

### Solution

#### Database Schema
```sql
-- Add to SUPABASE_UNIFIED_SCHEMA.sql
CREATE TABLE IF NOT EXISTS delivery_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_coords JSONB,
  delivery_coords JSONB,
  estimated_delivery TIMESTAMPTZ NOT NULL,
  actual_delivery TIMESTAMPTZ,
  delivery_fee NUMERIC(10,2) NOT NULL,
  distance NUMERIC(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_tracking_updates (
  id TEXT PRIMARY KEY,
  delivery_order_id TEXT NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  location TEXT,
  coordinates JSONB
);

CREATE INDEX idx_delivery_orders_order_id ON delivery_orders(order_id);
CREATE INDEX idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX idx_tracking_updates_delivery_id ON delivery_tracking_updates(delivery_order_id);
```

#### Backend: Create tRPC Procedure
```typescript
// backend/trpc/routes/delivery/create-delivery-order.ts
import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const createDeliveryOrderProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    providerId: z.string(),
    driverName: z.string(),
    driverPhone: z.string(),
    vehiclePlate: z.string(),
    pickupAddress: z.string(),
    deliveryAddress: z.string(),
    pickupCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
    deliveryCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
    deliveryFee: z.number(),
    distance: z.number(),
    specialInstructions: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const deliveryId = `DEL-${Date.now()}`;
    const estimatedDelivery = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const { data: delivery, error } = await ctx.supabase
      .from('delivery_orders')
      .insert({
        id: deliveryId,
        order_id: input.orderId,
        provider_id: input.providerId,
        driver_name: input.driverName,
        driver_phone: input.driverPhone,
        vehicle_plate: input.vehiclePlate,
        status: 'assigned',
        pickup_address: input.pickupAddress,
        delivery_address: input.deliveryAddress,
        pickup_coords: input.pickupCoords,
        delivery_coords: input.deliveryCoords,
        estimated_delivery: estimatedDelivery.toISOString(),
        delivery_fee: input.deliveryFee,
        distance: input.distance,
        special_instructions: input.specialInstructions,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create delivery order');

    // Create initial tracking update
    await ctx.supabase.from('delivery_tracking_updates').insert({
      id: `TU-${Date.now()}`,
      delivery_order_id: deliveryId,
      status: 'assigned',
      message: `Delivery assigned to ${input.driverName}`,
      location: input.pickupAddress,
    });

    return {
      success: true,
      delivery,
    };
  });
```

#### Frontend: Update `delivery-provider.tsx`
```typescript
// providers/delivery-provider.tsx (update createDeliveryOrder function)
const createDeliveryOrder = useCallback(async (
  orderId: string,
  provider: DeliveryProvider,
  pickupAddress: string,
  deliveryAddress: string,
  deliveryFee: number,
  distance: number,
  specialInstructions?: string
): Promise<DeliveryOrder> => {
  // Create in database via tRPC
  const result = await trpcClient.delivery.createDeliveryOrder.mutate({
    orderId,
    providerId: provider.id,
    driverName: provider.driverDetails.name,
    driverPhone: provider.driverDetails.phone,
    vehiclePlate: provider.vehicleDetails.licensePlate,
    pickupAddress,
    deliveryAddress,
    deliveryFee,
    distance,
    specialInstructions,
  });

  const deliveryOrder: DeliveryOrder = {
    id: result.delivery.id,
    orderId,
    providerId: provider.id,
    driverName: provider.driverDetails.name,
    driverPhone: provider.driverDetails.phone,
    vehiclePlate: provider.vehicleDetails.licensePlate,
    status: 'assigned',
    pickupAddress,
    deliveryAddress,
    estimatedDelivery: new Date(result.delivery.estimated_delivery),
    trackingUpdates: [{
      id: `TU-${Date.now()}`,
      timestamp: new Date(),
      status: 'assigned',
      message: `Delivery assigned to ${provider.driverDetails.name}`,
      location: pickupAddress,
    }],
    deliveryFee,
    distance,
    specialInstructions,
  };

  // Also save to AsyncStorage for offline access
  const newOrders = [deliveryOrder, ...deliveryOrders];
  setDeliveryOrders(newOrders);
  await saveDeliveryOrders(newOrders);

  return deliveryOrder;
}, [deliveryOrders, saveDeliveryOrders]);
```

---

## 3️⃣ Multi-Seller Tracking – Missing Data

### Problem
Backend doesn't send `sellerPhone`, item `images`, or `optimizationSavings` (multi-seller-order-tracking.tsx expects these).

### Solution

#### Backend: Update `get-multi-seller-order.ts`
```typescript
// backend/trpc/routes/orders/get-multi-seller-order.ts (lines 37-94)
subOrders: [
  {
    subOrderId: `${input.orderId}-S1`,
    subTrackingId: `MTRK-${Date.now()}-S1`,
    sellerId: 'seller-john-farmer',
    sellerName: 'John Farmer',
    sellerLocation: 'Kiambu',
    sellerPhone: '+254700111222', // ✅ Added
    items: [
      {
        productId: 'prod-1',
        productName: 'Fresh Tomatoes',
        quantity: 5,
        price: 150,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1546470427-227e2e1e8c8e', // ✅ Added
      },
    ],
    subtotal: 1350,
    deliveryFee: 150,
    deliveryProvider: {
      providerId: 'boda-1',
      providerName: 'Banda Boda',
      vehicleType: 'boda',
      driverName: 'Peter Kamau',
      driverPhone: '+254700333444', // ✅ Added
      estimatedTime: '1-2 hours',
    },
    status: 'packed',
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    pickupLocation: 'Kiambu Farm, Plot 45',
    dropoffLocation: '123 Farm Road, Kiambu',
    timeline: [...],
  },
],
deliveryOptimization: {
  totalDistance: 85,
  totalDeliveryFee: 300,
  estimatedTotalTime: 4,
  poolingOpportunities: 0,
  savingsFromOptimization: 50, // ✅ Added (calculate based on pooling)
},
```

#### Backend: Update `multi-seller-checkout.ts`
```typescript
// backend/trpc/routes/checkout/multi-seller-checkout.ts (lines 56-82)
const subOrders = input.sellerGroups.map((sellerGroup, index) => {
  const subOrderId = `${masterOrderId}-S${index + 1}`;
  const subTrackingId = `${masterTrackingId}-S${index + 1}`;
  
  return {
    subOrderId,
    subTrackingId,
    sellerId: sellerGroup.sellerId,
    sellerName: sellerGroup.sellerName,
    sellerLocation: sellerGroup.sellerLocation,
    sellerPhone: sellerGroup.sellerPhone || '+254700000000', // ✅ Added with fallback
    items: sellerGroup.items.map(item => ({
      ...item,
      image: item.image || 'https://via.placeholder.com/150', // ✅ Added with fallback
    })),
    subtotal: sellerGroup.subtotal,
    deliveryFee: sellerGroup.deliveryProvider.deliveryFee,
    deliveryProvider: {
      ...sellerGroup.deliveryProvider,
      driverName: sellerGroup.deliveryProvider.driverName || 'TBA',
      driverPhone: sellerGroup.deliveryProvider.driverPhone || 'TBA',
    },
    status: 'pending',
    estimatedDelivery: estimatedDeliveryTime.toISOString(),
    pickupLocation: sellerGroup.sellerLocation,
    dropoffLocation: input.deliveryAddress.address,
  };
});

// Calculate optimization savings
const poolingOpportunities = subOrders.filter((order, index, arr) => 
  arr.some((other, otherIndex) => 
    otherIndex !== index && 
    order.sellerLocation === other.sellerLocation
  )
).length;

const savingsFromOptimization = poolingOpportunities > 0 
  ? Math.round(input.orderSummary.totalDeliveryFee * 0.15 * poolingOpportunities)
  : 0;

const deliveryRouteOptimization = {
  totalDistance: subOrders.reduce((sum, order) => sum + 10, 0),
  totalDeliveryFee: input.orderSummary.totalDeliveryFee,
  estimatedTotalTime: Math.max(...subOrders.map(order => {
    const hours = new Date(order.estimatedDelivery).getHours() - new Date().getHours();
    return hours;
  })),
  poolingOpportunities,
  savingsFromOptimization, // ✅ Added
};
```

---

## 4️⃣ Location Provider – Coordinates Mismatch

### Problem
- Coordinates format inconsistency: `{ latitude, longitude }` vs `{ lat, lng }`
- Race conditions when location changes during checkout
- Missing validation before calculations

### Solution

#### Update `location-provider.tsx`
```typescript
// providers/location-provider.tsx (lines 200-224)
const setManualLocation = useCallback(async (location: UserLocation) => {
  const enrichedLocation = { ...location };
  
  // Normalize coordinates to { lat, lng }
  if (location.countyId && !location.coordinates) {
    const county = kenyanCountiesComplete.find(c => c.id === location.countyId);
    if (county?.coordinates) {
      enrichedLocation.coordinates = {
        lat: county.coordinates.latitude,  // ✅ Convert to lat
        lng: county.coordinates.longitude, // ✅ Convert to lng
      };
      console.log('[Location] ✅ Enriched location with county coordinates:', enrichedLocation.coordinates);
    }
  }
  
  // Validate coordinates exist
  if (!enrichedLocation.coordinates || !enrichedLocation.coordinates.lat || !enrichedLocation.coordinates.lng) {
    console.error('[Location] ❌ Cannot set location without valid coordinates');
    throw new Error('Location must have valid coordinates with lat and lng');
  }
  
  setUserLocation(enrichedLocation);
  await storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(enrichedLocation));
  console.log('[Location] Set manual location:', enrichedLocation.label || enrichedLocation.city);
  
  // Debounce location change events
  setTimeout(() => {
    console.log('[Location] Broadcasting location change event');
    locationEmitter.emit('locationChanged', enrichedLocation);
  }, 300);
}, [storage]);
```

#### Update `checkout.tsx` to handle location changes
```typescript
// app/checkout.tsx (add after line 135)
useEffect(() => {
  if (!hasValidCoordinates) {
    console.warn('[Checkout] ⚠️ Missing valid coordinates for delivery calculation');
    return;
  }

  // Debounce delivery fee recalculation
  const timeoutId = setTimeout(() => {
    console.log('[Checkout] Recalculating delivery fees after location change');
    setIsCalculatingDelivery(true);
    
    // Recalculate fees for each seller
    groupedBySeller.forEach(group => {
      const sellerCoords = cartItems.find(item => item.sellerId === group.sellerId)?.product.coordinates;
      if (sellerCoords && buyerCoords) {
        const distance = calculateDistance(buyerCoords, sellerCoords);
        const fee = calculateDeliveryFee(distance);
        setRealTimeDeliveryFees(prev => new Map(prev).set(group.sellerId, fee));
      }
    });
    
    setIsCalculatingDelivery(false);
  }, 500);

  return () => clearTimeout(timeoutId);
}, [buyerCoords, groupedBySeller, cartItems, hasValidCoordinates]);

// Validate coordinates before checkout
const validateCheckout = useCallback(() => {
  if (!buyerCoords || !buyerCoords.lat || !buyerCoords.lng) {
    Alert.alert(
      'Location Required',
      'Please select a delivery address with valid coordinates to continue.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
}, [buyerCoords]);
```

---

## 5️⃣ QR Code System – Missing Types & Library

### Problem
- QR scanner expects types ('delivery', 'receipt', 'dispute') not generated by backend
- Missing `react-native-qrcode-svg` library
- No fallback for unknown QR types

### Solution

#### Install Library
```bash
bun expo install react-native-qrcode-svg react-native-svg
```

#### Update `generate-qr.ts`
```typescript
// backend/trpc/routes/qr/generate-qr.ts (line 4)
const QRTypeSchema = z.enum(['order', 'delivery', 'user', 'receipt', 'dispute']); // ✅ All types

// Add type-specific payload validation
export const generateQRProcedure = publicProcedure
  .input(z.object({
    qr_type: QRTypeSchema,
    linked_id: z.string(),
    payload: z.object({
      order_id: z.string().optional(),
      delivery_id: z.string().optional(), // ✅ Added
      user_id: z.string().optional(),
      buyer_id: z.string().optional(),
      seller_ids: z.array(z.string()).optional(),
      driver_id: z.string().optional(),
      dispute_id: z.string().optional(),
      receipt_id: z.string().optional(),
      role: z.enum(['buyer', 'seller', 'driver', 'agent']).optional(),
      reserve_status: z.enum(['held', 'released', 'refunded', 'disputed']).optional(),
      timestamp: z.string(),
      signature: z.string().optional(),
      total: z.number().optional(),
      items: z.number().optional(),
      status: z.string().optional(),
    }),
    expires_at: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Generate type-specific signature
    const typePrefix = input.qr_type.toUpperCase().substring(0, 3);
    const signature = `BANDA_${typePrefix}_${input.linked_id.slice(-6).toUpperCase()}_${Date.now()}`;
    
    const qrData = {
      type: input.qr_type,
      id: `qr_${Date.now()}`,
      related_id: input.linked_id,
      ...input.payload,
      signature,
    };

    // Store in database
    const { data: qrRecord, error } = await ctx.supabase
      .from('qr_codes')
      .insert({
        id: qrData.id,
        qr_type: input.qr_type,
        linked_id: input.linked_id,
        qr_data: qrData,
        verification_code: signature,
        expires_at: input.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        active: true,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to generate QR code');

    return {
      success: true,
      qr_code: qrRecord,
      message: `${input.qr_type} QR code generated successfully`
    };
  });
```

#### Update `qr-scanner.tsx`
```typescript
// app/qr-scanner.tsx (add after line 150)
const handleQRScan = useCallback(async (qrData: string) => {
  setScanning(false);
  
  try {
    const parsed = JSON.parse(qrData);
    
    // Validate QR type
    const validTypes = ['order', 'delivery', 'user', 'receipt', 'dispute'];
    if (!validTypes.includes(parsed.type)) {
      Alert.alert('Invalid QR Code', `Unknown QR type: ${parsed.type}`);
      setScanning(true);
      return;
    }

    // Scan via backend
    const result = await scanQR.mutateAsync({
      qr_data: qrData,
      scanned_by: user?.id || 'guest',
      scan_location: 'mobile_app',
    });

    if (result.success) {
      setScanResult(result.qr_details);
      
      // Handle different QR types
      switch (parsed.type) {
        case 'order':
          handleOrderQRScan(result.qr_details);
          break;
        case 'delivery':
          handleDeliveryQRScan(result.qr_details);
          break;
        case 'receipt':
          handleReceiptQRScan(result.qr_details);
          break;
        case 'dispute':
          handleDisputeQRScan(result.qr_details);
          break;
        case 'user':
          handleUserQRScan(result.qr_details);
          break;
        default:
          console.warn('Unhandled QR type:', parsed.type);
          Alert.alert('QR Scanned', 'QR code scanned but no action defined.');
      }
    }
  } catch (error) {
    console.error('QR scan error:', error);
    Alert.alert('Scan Error', 'Failed to process QR code');
    setScanning(true);
  }
}, [scanQR, user]);

// Add handlers for each type
const handleDeliveryQRScan = (qrDetails: any) => {
  router.push({
    pathname: '/order-tracking',
    params: { orderId: qrDetails.order_id, deliveryId: qrDetails.delivery_id }
  });
};

const handleReceiptQRScan = (qrDetails: any) => {
  router.push({
    pathname: '/order-details',
    params: { orderId: qrDetails.order_id, receiptId: qrDetails.receipt_id }
  });
};

const handleDisputeQRScan = (qrDetails: any) => {
  router.push({
    pathname: `/dispute/${qrDetails.dispute_id}`,
  });
};

const handleUserQRScan = (qrDetails: any) => {
  router.push({
    pathname: '/vendor-profile',
    params: { vendorId: qrDetails.user_id }
  });
};
```

---

## 6️⃣ Testing & Validation Checklist

### Order Tracking
- [ ] Place order with multiple sellers
- [ ] Verify each sub-order shows correct driver info
- [ ] Test with orders that don't have drivers assigned yet
- [ ] Verify driver phone call functionality

### Delivery Persistence
- [ ] Create delivery order
- [ ] Restart app
- [ ] Verify delivery orders persist
- [ ] Test offline mode (AsyncStorage fallback)

### Multi-Seller Tracking
- [ ] Place multi-seller order
- [ ] Verify seller phone numbers display
- [ ] Verify item images display
- [ ] Verify optimization savings calculation
- [ ] Test "Call Seller" and "Call Driver" buttons

### Location & Coordinates
- [ ] Change delivery address during checkout
- [ ] Verify delivery fees recalculate
- [ ] Test with manual location selection
- [ ] Test with GPS location
- [ ] Verify coordinates format is consistent ({ lat, lng })

### QR Codes
- [ ] Generate order QR code
- [ ] Generate delivery QR code
- [ ] Generate receipt QR code
- [ ] Generate dispute QR code
- [ ] Scan each type and verify correct navigation
- [ ] Test fallback for unknown QR types

---

## 7️⃣ Database Migration Script

```sql
-- Run this in Supabase SQL Editor

-- 1. Add delivery_orders table
CREATE TABLE IF NOT EXISTS delivery_orders (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')),
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_coords JSONB,
  delivery_coords JSONB,
  estimated_delivery TIMESTAMPTZ NOT NULL,
  actual_delivery TIMESTAMPTZ,
  delivery_fee NUMERIC(10,2) NOT NULL,
  distance NUMERIC(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add delivery_tracking_updates table
CREATE TABLE IF NOT EXISTS delivery_tracking_updates (
  id TEXT PRIMARY KEY,
  delivery_order_id TEXT NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  location TEXT,
  coordinates JSONB
);

-- 3. Add driver info to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_id TEXT REFERENCES drivers(id);

-- 4. Add seller phone to marketplace_products
ALTER TABLE marketplace_products ADD COLUMN IF NOT EXISTS seller_phone TEXT;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_delivery_orders_order_id ON delivery_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_tracking_updates_delivery_id ON delivery_tracking_updates(delivery_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

-- 6. Update existing orders with mock driver data (optional, for testing)
-- UPDATE orders SET driver_id = 'driver-001' WHERE status IN ('shipped', 'delivered') AND driver_id IS NULL;
```

---

## 8️⃣ Implementation Priority

1. **High Priority** (Do First)
   - Fix coordinates format in location provider
   - Add delivery order persistence to database
   - Update multi-seller backend to include all required fields

2. **Medium Priority**
   - Fix hardcoded driver data in order tracking
   - Install and configure QR library
   - Add QR type handlers

3. **Low Priority** (Polish)
   - Add debouncing for location changes
   - Improve error messages
   - Add loading states

---

## ✅ Success Criteria

After implementing these fixes:
- ✅ Order tracking shows correct driver per order
- ✅ Delivery orders persist after app restart
- ✅ Multi-seller tracking displays all required data
- ✅ Location changes trigger proper fee recalculation
- ✅ All QR types can be generated and scanned
- ✅ No TypeScript errors related to coordinates
- ✅ No crashes due to missing data fields

---

## 📝 Notes

- All coordinate references should use `{ lat, lng }` format
- Always validate coordinates exist before calculations
- Debounce location changes to prevent race conditions
- Provide fallbacks for missing driver/seller data
- Test both online (Supabase) and offline (AsyncStorage) modes
