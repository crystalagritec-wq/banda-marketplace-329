import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const coordinatePickupsProcedure = publicProcedure
  .input(z.object({
    masterOrderId: z.string(),
    subOrders: z.array(z.object({
      subOrderId: z.string(),
      sellerId: z.string(),
      sellerName: z.string(),
      sellerLocation: z.string(),
      pickupAddress: z.string(),
      deliveryProvider: z.object({
        providerId: z.string(),
        providerName: z.string(),
        vehicleType: z.string(),
      }),
      estimatedPickupTime: z.string(),
    })),
    buyerLocation: z.object({
      address: z.string(),
      city: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('🚚 Coordinating pickups for master order:', input.masterOrderId);
    console.log('🚚 Sub-orders to coordinate:', input.subOrders.length);

    const locationGroups = input.subOrders.reduce((groups, order) => {
      const key = order.sellerLocation;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(order);
      return groups;
    }, {} as Record<string, typeof input.subOrders>);

    console.log('📍 Unique locations:', Object.keys(locationGroups).length);

    const coordinatedPickups = Object.entries(locationGroups)
      .filter(([_, orders]) => orders.length > 1)
      .map(([location, orders]) => {
        const earliestPickup = orders.reduce((earliest, order) => {
          const orderTime = new Date(order.estimatedPickupTime);
          return orderTime < earliest ? orderTime : earliest;
        }, new Date(orders[0].estimatedPickupTime));

        const optimalPickupTime = new Date(earliestPickup.getTime() + 15 * 60 * 1000);

        const baseDeliveryFee = 150;
        const perOrderFee = 100;
        const totalWithoutPooling = orders.length * baseDeliveryFee;
        const totalWithPooling = baseDeliveryFee + (orders.length - 1) * perOrderFee;
        const savings = totalWithoutPooling - totalWithPooling;

        return {
          id: `POOL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          location,
          pickupTime: optimalPickupTime.toISOString(),
          subOrderIds: orders.map(o => o.subOrderId),
          sellerIds: orders.map(o => o.sellerId),
          sellerNames: orders.map(o => o.sellerName),
          orderCount: orders.length,
          driverId: `DRV-${Math.random().toString(36).substr(2, 6)}`,
          driverName: 'John Kamau',
          vehicleType: 'van',
          vehicleNumber: 'KCA 123X',
          estimatedSavings: savings,
          originalFee: totalWithoutPooling,
          pooledFee: totalWithPooling,
          status: 'pending' as const,
          route: {
            pickups: orders.map(o => ({
              sellerId: o.sellerId,
              sellerName: o.sellerName,
              address: o.pickupAddress,
              estimatedTime: optimalPickupTime.toISOString(),
            })),
            dropoff: {
              address: input.buyerLocation.address,
              city: input.buyerLocation.city,
              estimatedTime: new Date(optimalPickupTime.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            },
          },
        };
      });

    const singlePickups = Object.entries(locationGroups)
      .filter(([_, orders]) => orders.length === 1)
      .map(([location, orders]) => {
        const order = orders[0];
        return {
          id: `PICKUP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          location,
          pickupTime: order.estimatedPickupTime,
          subOrderId: order.subOrderId,
          sellerId: order.sellerId,
          sellerName: order.sellerName,
          driverId: `DRV-${Math.random().toString(36).substr(2, 6)}`,
          driverName: 'Mary Wanjiku',
          vehicleType: order.deliveryProvider.vehicleType,
          status: 'pending' as const,
        };
      });

    const totalSavings = coordinatedPickups.reduce((sum, pool) => sum + pool.estimatedSavings, 0);

    console.log('✅ Coordinated pickups:', coordinatedPickups.length);
    console.log('📦 Single pickups:', singlePickups.length);
    console.log('💰 Total savings from pooling:', totalSavings);

    return {
      success: true,
      masterOrderId: input.masterOrderId,
      coordinatedPickups,
      singlePickups,
      summary: {
        totalPickups: coordinatedPickups.length + singlePickups.length,
        pooledPickups: coordinatedPickups.length,
        singlePickups: singlePickups.length,
        totalSavings,
        savingsPercentage: totalSavings > 0 ? Math.round((totalSavings / (totalSavings + coordinatedPickups.reduce((sum, p) => sum + p.pooledFee, 0))) * 100) : 0,
      },
      message: coordinatedPickups.length > 0 
        ? `${coordinatedPickups.length} delivery pools created, saving KSh ${totalSavings.toLocaleString()}`
        : 'No pooling opportunities found',
    };
  });
