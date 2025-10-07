import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const multiSellerCheckoutProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    sellerGroups: z.array(z.object({
      sellerId: z.string(),
      sellerName: z.string(),
      sellerLocation: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number(),
        price: z.number(),
        unit: z.string(),
      })),
      subtotal: z.number(),
      deliveryProvider: z.object({
        providerId: z.string(),
        providerName: z.string(),
        vehicleType: z.string(),
        estimatedTime: z.string(),
        deliveryFee: z.number(),
      }),
    })),
    deliveryAddress: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      phone: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    paymentMethod: z.object({
      type: z.enum(['agripay', 'mpesa', 'card', 'cod']),
      details: z.string(),
    }),
    orderSummary: z.object({
      subtotal: z.number(),
      totalDeliveryFee: z.number(),
      discount: z.number().optional().default(0),
      total: z.number(),
    }),
    specialInstructions: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('🛍️ Processing multi-seller checkout for user:', input.userId);
    console.log('📦 Number of sellers:', input.sellerGroups.length);

    const masterOrderId = `MORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const masterTrackingId = `MTRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const subOrders = input.sellerGroups.map((sellerGroup, index) => {
      const subOrderId = `${masterOrderId}-S${index + 1}`;
      const subTrackingId = `${masterTrackingId}-S${index + 1}`;
      
      const deliveryHours = sellerGroup.deliveryProvider.vehicleType === 'boda' ? 1 : 
                           sellerGroup.deliveryProvider.vehicleType === 'van' ? 2 :
                           sellerGroup.deliveryProvider.vehicleType === 'truck' ? 4 : 3;
      
      const estimatedDeliveryTime = new Date();
      estimatedDeliveryTime.setHours(estimatedDeliveryTime.getHours() + deliveryHours);

      return {
        subOrderId,
        subTrackingId,
        sellerId: sellerGroup.sellerId,
        sellerName: sellerGroup.sellerName,
        sellerLocation: sellerGroup.sellerLocation,
        items: sellerGroup.items,
        subtotal: sellerGroup.subtotal,
        deliveryFee: sellerGroup.deliveryProvider.deliveryFee,
        deliveryProvider: sellerGroup.deliveryProvider,
        status: 'pending' as const,
        estimatedDelivery: estimatedDeliveryTime.toISOString(),
        pickupLocation: sellerGroup.sellerLocation,
        dropoffLocation: input.deliveryAddress.address,
      };
    });

    const masterOrder = {
      id: masterOrderId,
      userId: input.userId,
      trackingId: masterTrackingId,
      status: 'pending' as const,
      isSplitOrder: input.sellerGroups.length > 1,
      sellerCount: input.sellerGroups.length,
      subOrders: subOrders,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod,
      orderSummary: input.orderSummary,
      specialInstructions: input.specialInstructions,
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending' as const,
    };

    console.log('📦 Master order created:', masterOrderId);
    console.log('📦 Sub-orders created:', subOrders.length);

    const deliveryRouteOptimization = {
      totalDistance: subOrders.reduce((sum, order) => sum + 10, 0),
      totalDeliveryFee: input.orderSummary.totalDeliveryFee,
      estimatedTotalTime: Math.max(...subOrders.map(order => {
        const hours = new Date(order.estimatedDelivery).getHours() - new Date().getHours();
        return hours;
      })),
      poolingOpportunities: subOrders.filter((order, index, arr) => 
        arr.some((other, otherIndex) => 
          otherIndex !== index && 
          order.sellerLocation === other.sellerLocation
        )
      ).length,
    };

    return {
      success: true,
      masterOrder: masterOrder,
      deliveryOptimization: deliveryRouteOptimization,
      paymentRequired: input.paymentMethod.type !== 'cod',
      nextSteps: {
        payment: input.paymentMethod.type === 'mpesa' ? 'STK push initiated for total amount' :
                input.paymentMethod.type === 'card' ? 'Redirect to payment gateway' :
                input.paymentMethod.type === 'agripay' ? 'Wallet charged for total amount' :
                'Payment on delivery for each sub-order',
        delivery: `${input.sellerGroups.length} separate deliveries coordinated`,
        tracking: `Track master order with ID: ${masterTrackingId}`,
      },
      message: input.sellerGroups.length > 1 
        ? `Your order has been split into ${input.sellerGroups.length} deliveries from different sellers. Each will be tracked separately.`
        : 'Your order has been placed successfully.',
    };
  });
