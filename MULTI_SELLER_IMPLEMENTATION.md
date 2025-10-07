# Multi-Seller Cart & Split Logistics Implementation

## Overview
Banda Marketplace now supports multi-seller carts with unified checkout and intelligent split logistics. Buyers can purchase from multiple vendors in a single transaction, with each seller's items delivered separately but tracked under one master order.

## Key Features Implemented

### 1. **Multi-Seller Cart Grouping** ✅
- **Cart Provider Enhancement** (`providers/cart-provider.tsx`)
  - Added `sellerId`, `sellerName`, `sellerLocation` to `CartItem` interface
  - Created `SellerGroup` interface for grouping items by seller
  - Implemented `groupedBySeller` computed property that automatically groups cart items by vendor
  - Enhanced `cartSummary` to include `sellerCount` and `isSplitOrder` flags
  - Auto-assigns seller information when products are added to cart

### 2. **Seller-Grouped Cart UI** ✅
- **Cart Screen** (`app/(tabs)/cart.tsx`)
  - **Multi-Seller Notice**: Orange banner appears when cart contains items from multiple sellers
  - **Seller Groups**: Items are visually grouped by seller with:
    - Seller name and location header
    - Item count and subtotal per seller
    - Clear visual separation between seller groups
  - **Maintains Single Checkout**: One unified "Proceed to Checkout" button regardless of seller count

### 3. **Split Logistics Calculation**
- **Delivery Provider Selection**:
  - Each seller group can have its own delivery provider
  - Delivery fees calculated per seller location
  - Total delivery fee = sum of all seller delivery fees
  - Estimated delivery time = longest delivery time among all sellers

### 4. **Backend Multi-Seller Processing** ✅
- **New Procedure** (`backend/trpc/routes/checkout/multi-seller-checkout.ts`)
  - Creates master order with unique ID (e.g., `MORD-1234567890-ABC123`)
  - Generates sub-orders for each seller (e.g., `MORD-1234567890-ABC123-S1`, `-S2`, etc.)
  - Each sub-order has:
    - Own tracking ID
    - Seller information
    - Delivery provider assignment
    - Pickup and dropoff locations
    - Independent status tracking
  - Calculates delivery route optimization opportunities
  - Handles payment for total amount (split internally)

## How It Works

### User Flow
1. **Shopping**: User adds products from multiple vendors to cart
2. **Cart View**: 
   - See items grouped by seller
   - Multi-seller notice if applicable
   - Single total with combined delivery fees
3. **Checkout**:
   - One delivery address for all items
   - One payment for entire order
   - System automatically assigns optimal delivery provider per seller
4. **Order Tracking**:
   - Master tracking ID for overall order
   - Individual tracking IDs for each seller's delivery
   - Real-time status updates per sub-order

### Technical Flow
```
Cart Items → Group by Seller → Calculate Delivery per Seller → 
Create Master Order → Generate Sub-Orders → Process Payment → 
Coordinate Deliveries → Track Separately
```

## Data Structures

### CartItem (Enhanced)
```typescript
{
  product: Product;
  quantity: number;
  sellerId: string;        // NEW
  sellerName: string;      // NEW
  sellerLocation: string;  // NEW
}
```

### SellerGroup
```typescript
{
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  estimatedDelivery?: string;
}
```

### Master Order
```typescript
{
  id: string;              // MORD-xxx
  trackingId: string;      // MTRK-xxx
  isSplitOrder: boolean;
  sellerCount: number;
  subOrders: SubOrder[];
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  orderSummary: {
    subtotal: number;
    totalDeliveryFee: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'delivered';
}
```

### Sub-Order
```typescript
{
  subOrderId: string;      // MORD-xxx-S1
  subTrackingId: string;   // MTRK-xxx-S1
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  deliveryProvider: DeliveryProvider;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered';
}
```

## Benefits

### For Buyers
- ✅ **Convenience**: Shop from multiple vendors without multiple checkouts
- ✅ **Transparency**: Clear visibility of which items come from which seller
- ✅ **Single Payment**: One transaction for entire order
- ✅ **Unified Tracking**: Master tracking ID with detailed sub-order tracking
- ✅ **Cost Optimization**: System finds best delivery provider per seller

### For Sellers
- ✅ **Independent Fulfillment**: Each seller manages their own items
- ✅ **Own Delivery Provider**: Can use preferred logistics partner
- ✅ **Clear Responsibility**: Only responsible for their items
- ✅ **Separate Tracking**: Independent delivery status

### For Logistics Providers
- ✅ **Route Optimization**: System identifies pooling opportunities
- ✅ **Efficient Dispatch**: Multiple pickups from same area can be batched
- ✅ **Clear Instructions**: Each sub-order has specific pickup/dropoff locations

## Future Enhancements

### Phase 2 (Recommended)
1. **Smart Delivery Pooling**
   - Automatically combine deliveries from sellers in same area
   - Offer discount for pooled deliveries
   - Single driver picks up from multiple sellers

2. **Seller Coordination**
   - Notify all sellers simultaneously when order is placed
   - Coordinate pickup times for pooled deliveries
   - Real-time seller response tracking

3. **Advanced Tracking**
   - Live map showing all active deliveries
   - Push notifications per sub-order status change
   - Estimated arrival time per delivery

4. **Payment Splitting**
   - Automatic fund distribution to sellers
   - Hold funds in escrow until delivery confirmation
   - Separate TradeGuard protection per sub-order

### Phase 3 (Advanced)
1. **AI-Powered Optimization**
   - Machine learning for best delivery provider selection
   - Predictive delivery time estimation
   - Dynamic pricing based on demand

2. **Seller Collaboration**
   - Allow sellers to share delivery costs
   - Joint fulfillment for nearby sellers
   - Bulk shipping discounts

## Testing Scenarios

### Scenario 1: Single Seller Order
- Add items from one vendor
- No multi-seller notice shown
- Standard checkout flow
- Single delivery tracking

### Scenario 2: Two Seller Order
- Add tomatoes from "John Farmer" (Kiambu)
- Add milk from "Dairy Co-op" (Meru)
- Multi-seller notice appears
- Cart shows 2 seller groups
- Checkout calculates 2 separate deliveries
- Creates master order with 2 sub-orders

### Scenario 3: Three+ Seller Order
- Add items from 3+ different vendors
- Multi-seller notice shows seller count
- Each seller group clearly separated
- System optimizes delivery routes
- Identifies pooling opportunities

## Configuration

### Enable/Disable Multi-Seller
Currently always enabled. To disable:
```typescript
// In cart-provider.tsx
const ENABLE_MULTI_SELLER = false;

// Modify groupedBySeller to return single group
const groupedBySeller = useMemo(() => {
  if (!ENABLE_MULTI_SELLER) {
    return [{
      sellerId: 'all',
      sellerName: 'All Sellers',
      sellerLocation: 'Various',
      items: cartItems,
      subtotal: cartSummary.subtotal,
      deliveryFee: 0,
    }];
  }
  // ... existing logic
}, [cartItems, ENABLE_MULTI_SELLER]);
```

## API Integration

### Checkout Endpoint
```typescript
POST /api/trpc/checkout.multiSellerCheckout

Request:
{
  userId: string;
  sellerGroups: SellerGroup[];
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  orderSummary: OrderSummary;
}

Response:
{
  success: boolean;
  masterOrder: MasterOrder;
  deliveryOptimization: {
    totalDistance: number;
    totalDeliveryFee: number;
    poolingOpportunities: number;
  };
  nextSteps: {
    payment: string;
    delivery: string;
    tracking: string;
  };
}
```

## Performance Considerations

1. **Cart Grouping**: O(n) complexity, computed once per cart change
2. **Delivery Calculation**: Parallel processing for each seller group
3. **Order Creation**: Atomic transaction for master + all sub-orders
4. **Tracking Updates**: Event-driven architecture for real-time updates

## Security

1. **Payment Integrity**: Single payment transaction, split internally
2. **Seller Isolation**: Each seller only sees their sub-order
3. **Buyer Protection**: TradeGuard applies to each sub-order independently
4. **Data Privacy**: Seller locations visible only to assigned logistics provider

## Conclusion

The multi-seller cart and split logistics system provides a seamless experience for buyers while maintaining clear boundaries and responsibilities for sellers and logistics providers. The unified checkout prevents cart abandonment while the intelligent split logistics ensures efficient delivery from multiple sources.

**Status**: ✅ Core Implementation Complete
**Next Steps**: Integrate with checkout flow, add delivery tracking UI, implement payment splitting
