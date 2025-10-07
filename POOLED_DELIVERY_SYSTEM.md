# 🚛 Banda Pooled Delivery System

## Overview
The Pooled Delivery System allows multiple buyers in the same area to share delivery costs by combining their orders into a single logistics run. This reduces costs for buyers, increases efficiency for logistics providers, and reduces environmental impact.

---

## 🎯 Key Features

### 1. **Automatic Pooling Detection**
- System automatically finds nearby orders going in the same direction
- Identifies orders from common sellers
- Calculates potential savings in real-time

### 2. **Smart Pooling Algorithms**
- **Nearby Delivery Pooling**: Combines orders within 5km radius
- **Common Route Pooling**: Bundles orders from same sellers
- **Time-Window Matching**: Only pools orders with similar delivery windows (within 30 minutes)

### 3. **Cost Optimization**
- Splits delivery fees fairly among pooled orders
- Typically saves 30-50% on delivery costs
- Transparent cost breakdown for each buyer

### 4. **Real-Time Suggestions**
- Shows pooling opportunities during checkout
- Displays estimated savings and wait times
- Allows buyers to opt-in or decline

---

## 🔧 Backend APIs

### 1. Find Pooling Opportunities
```typescript
trpc.delivery.findPoolingOpportunities.useQuery({
  orderId: 'ORD-123',
  buyerAddress: { lat: -1.2921, lng: 36.8219 },
  sellers: [
    {
      sellerId: 'S1',
      sellerName: 'Farm Fresh',
      coordinates: { lat: -1.2921, lng: 36.8219 },
      orderValue: 1500,
    }
  ],
  maxPoolingRadius: 5, // km
})
```

**Response:**
```json
{
  "hasOpportunities": true,
  "opportunities": [
    {
      "orderId": "ORD-001",
      "buyerDistance": 2.3,
      "commonSellers": ["S1"],
      "potentialSavings": 120,
      "poolingType": "nearby_delivery",
      "isRecent": true,
      "estimatedDelay": 5
    }
  ],
  "bestOpportunity": { ... },
  "recommendation": {
    "message": "Share delivery with nearby order and save KSh 120",
    "savings": 120,
    "estimatedDelay": 5
  }
}
```

---

### 2. Calculate Pooled Delivery
```typescript
trpc.delivery.calculatePooledDelivery.useMutation({
  orders: [
    {
      orderId: 'ORD-123',
      buyerAddress: { lat: -1.2921, lng: 36.8219 },
      sellers: [
        {
          sellerId: 'S1',
          coordinates: { lat: -1.2921, lng: 36.8219 },
          orderValue: 1500,
        }
      ],
    },
    {
      orderId: 'ORD-124',
      buyerAddress: { lat: -1.2921 + 0.01, lng: 36.8219 + 0.01 },
      sellers: [
        {
          sellerId: 'S1',
          coordinates: { lat: -1.2921, lng: 36.8219 },
          orderValue: 2000,
        }
      ],
    }
  ],
  vehicleType: 'van',
})
```

**Response:**
```json
{
  "pooledDelivery": {
    "totalDistance": 15.3,
    "totalFee": 350,
    "feePerOrder": 175,
    "estimatedTime": "45 mins",
    "vehicleType": "van",
    "orderCount": 2,
    "sellerCount": 1
  },
  "savings": {
    "totalSavings": 150,
    "savingsPerOrder": 75,
    "savingsPercentage": 30
  },
  "route": {
    "sellers": ["S1"],
    "buyers": ["ORD-123", "ORD-124"],
    "optimizedPath": [...]
  },
  "comparison": {
    "individual": {
      "totalFee": 500,
      "avgFeePerOrder": 250
    },
    "pooled": {
      "totalFee": 350,
      "feePerOrder": 175
    }
  }
}
```

---

### 3. Suggest Pooling
```typescript
trpc.delivery.suggestPooling.useQuery({
  buyerAddress: { lat: -1.2921, lng: 36.8219 },
  sellers: [
    {
      sellerId: 'S1',
      sellerName: 'Farm Fresh',
      coordinates: { lat: -1.2921, lng: 36.8219 },
      orderValue: 1500,
    }
  ],
  orderValue: 1500,
})
```

**Response:**
```json
{
  "hasSuggestions": true,
  "suggestions": [
    {
      "poolId": "POOL-ORD-001",
      "orderId": "ORD-001",
      "distanceKm": 2.3,
      "estimatedSavings": 120,
      "waitTimeMinutes": 15,
      "poolingType": "common_route",
      "commonSellers": ["Farm Fresh"],
      "recommendation": "highly_recommended"
    }
  ],
  "bestSuggestion": { ... },
  "summary": {
    "totalOpportunities": 2,
    "maxSavings": 150,
    "avgWaitTime": 18
  }
}
```

---

## 🎨 Frontend Components

### 1. PooledDeliveryCard
Compact card showing a single pooling opportunity.

```tsx
import { PooledDeliveryCard } from '@/components/PooledDeliveryCard';

<PooledDeliveryCard
  poolId="POOL-001"
  estimatedSavings={120}
  waitTimeMinutes={15}
  poolingType="common_route"
  commonSellers={["Farm Fresh"]}
  distanceKm={2.3}
  recommendation="highly_recommended"
  onAccept={() => handleAcceptPooling('POOL-001')}
  onDecline={() => handleDeclinePooling()}
/>
```

---

### 2. PooledDeliveryModal
Full-screen modal showing all available pooling options.

```tsx
import { PooledDeliveryModal } from '@/components/PooledDeliveryModal';

<PooledDeliveryModal
  visible={showPoolingModal}
  onClose={() => setShowPoolingModal(false)}
  suggestions={poolingSuggestions}
  onSelectPool={(poolId) => handleSelectPool(poolId)}
  isLoading={isLoadingPooling}
/>
```

---

## 🔄 Integration Flow

### Checkout Integration

```tsx
import { trpc } from '@/lib/trpc';
import { PooledDeliveryModal } from '@/components/PooledDeliveryModal';

function CheckoutScreen() {
  const [showPoolingModal, setShowPoolingModal] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  // 1. Get pooling suggestions
  const poolingSuggestionsQuery = trpc.delivery.suggestPooling.useQuery({
    buyerAddress: selectedAddress?.coordinates || { lat: -1.2921, lng: 36.8219 },
    sellers: groupedBySeller.map(group => ({
      sellerId: group.sellerId,
      sellerName: group.sellerName,
      coordinates: group.sellerCoordinates,
      orderValue: group.subtotal,
    })),
    orderValue: cartSummary.subtotal,
  }, {
    enabled: !!selectedAddress?.coordinates && cartItems.length > 0,
  });

  // 2. Calculate pooled delivery when user selects a pool
  const calculatePooledMutation = trpc.delivery.calculatePooledDelivery.useMutation();

  const handleSelectPool = async (poolId: string) => {
    setSelectedPoolId(poolId);
    
    // Calculate exact pooled delivery cost
    const result = await calculatePooledMutation.mutateAsync({
      orders: [
        // Current order
        {
          orderId: 'CURRENT',
          buyerAddress: selectedAddress!.coordinates,
          sellers: groupedBySeller.map(g => ({
            sellerId: g.sellerId,
            coordinates: g.sellerCoordinates,
            orderValue: g.subtotal,
          })),
        },
        // Pooled order (from backend)
        // ... other orders in the pool
      ],
      vehicleType: 'van',
    });

    // Update delivery fee with pooled cost
    setDeliveryFee(result.pooledDelivery.feePerOrder);
    setShowPoolingModal(false);
  };

  // 3. Show pooling modal if opportunities exist
  useEffect(() => {
    if (poolingSuggestionsQuery.data?.hasSuggestions) {
      setShowPoolingModal(true);
    }
  }, [poolingSuggestionsQuery.data]);

  return (
    <>
      {/* Checkout UI */}
      
      <PooledDeliveryModal
        visible={showPoolingModal}
        onClose={() => setShowPoolingModal(false)}
        suggestions={poolingSuggestionsQuery.data?.suggestions || []}
        onSelectPool={handleSelectPool}
        isLoading={poolingSuggestionsQuery.isLoading}
      />
    </>
  );
}
```

---

## 📊 Pooling Algorithm

### Matching Criteria

1. **Geographic Proximity**
   - Buyers within 5km radius
   - Sellers within 3km radius

2. **Time Window**
   - Orders placed within 30 minutes
   - Similar delivery time preferences

3. **Route Optimization**
   - Common pickup points
   - Efficient dropoff sequence

### Savings Calculation

```typescript
// Individual delivery cost
const individualCost = sellers.reduce((sum, seller) => {
  const distance = calculateDistance(seller.coordinates, buyerAddress);
  return sum + calculateDeliveryFee(distance);
}, 0);

// Pooled delivery cost
const pooledCost = calculateOptimizedRoute(allSellers, allBuyers);
const costPerOrder = pooledCost / orderCount;

// Savings
const savings = individualCost - costPerOrder;
const savingsPercentage = (savings / individualCost) * 100;
```

---

## 🎯 Benefits

### For Buyers
- **30-50% savings** on delivery fees
- **Eco-friendly** - reduced carbon footprint
- **Transparent pricing** - see exact savings

### For Sellers
- **Higher order volume** - more efficient logistics
- **Better margins** - reduced delivery overhead
- **Customer satisfaction** - lower costs for buyers

### For Logistics Providers
- **Route optimization** - fewer trips, more deliveries
- **Higher earnings per trip** - multiple orders per run
- **Better vehicle utilization** - maximize capacity

---

## 🚀 Future Enhancements

1. **AI-Powered Route Optimization**
   - Machine learning for optimal pickup/dropoff sequences
   - Traffic prediction and avoidance

2. **Dynamic Pooling**
   - Real-time pool formation as orders come in
   - Automatic pool suggestions during order placement

3. **Scheduled Pooling**
   - Pre-scheduled delivery windows for maximum pooling
   - "Wait for pool" option with guaranteed savings

4. **Gamification**
   - Rewards for choosing pooled delivery
   - Loyalty points for eco-friendly choices

---

## 📝 Notes

- Pooling is **optional** - buyers can always choose individual delivery
- **Wait times** are clearly communicated upfront
- **Savings** are guaranteed - no hidden fees
- **Real-time tracking** works for pooled deliveries
- **Escrow protection** applies to all pooled orders

---

## 🔗 Related Systems

- [Multi-Seller Checkout](./MULTI_SELLER_COMPLETE_IMPLEMENTATION.md)
- [Location-Aware Delivery](./LOCATION_AWARE_DELIVERY_SYSTEM.md)
- [Intelligent Checkout](./INTELLIGENT_CHECKOUT_SYSTEM_REPORT.md)
