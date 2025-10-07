import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDistance } from '@/utils/geo-distance';

export const suggestPoolingProcedure = publicProcedure
  .input(z.object({
    buyerAddress: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    sellers: z.array(z.object({
      sellerId: z.string(),
      sellerName: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      orderValue: z.number(),
    })),
    orderValue: z.number(),
  }))
  .query(async ({ input }) => {
    console.log('💡 Suggesting pooling options for buyer at:', input.buyerAddress);

    const nearbyOrders = [
      {
        orderId: 'ORD-POOL-001',
        buyerAddress: { lat: input.buyerAddress.lat + 0.005, lng: input.buyerAddress.lng + 0.005 },
        orderValue: 1800,
        sellers: [
          { sellerId: 'S1', coordinates: { lat: -1.2921, lng: 36.8219 } }
        ],
        estimatedPickup: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
      {
        orderId: 'ORD-POOL-002',
        buyerAddress: { lat: input.buyerAddress.lat + 0.003, lng: input.buyerAddress.lng + 0.008 },
        orderValue: 2200,
        sellers: [
          { sellerId: 'S2', coordinates: { lat: -1.2921 + 0.05, lng: 36.8219 + 0.05 } }
        ],
        estimatedPickup: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      },
    ];

    const poolingSuggestions = nearbyOrders.map(order => {
      const distanceToBuyer = calculateDistance(input.buyerAddress, order.buyerAddress);
      
      if (distanceToBuyer > 5) {
        return null;
      }

      const commonSellers = input.sellers.filter(inputSeller =>
        order.sellers.some(orderSeller => {
          const sellerDistance = calculateDistance(inputSeller.coordinates, orderSeller.coordinates);
          return sellerDistance < 3;
        })
      );

      const hasCommonRoute = commonSellers.length > 0;
      const estimatedSavings = hasCommonRoute 
        ? Math.round((input.orderValue + order.orderValue) * 0.15)
        : Math.round(distanceToBuyer * 20 * 0.35);

      const pickupTime = new Date(order.estimatedPickup);
      const waitTimeMinutes = Math.round((pickupTime.getTime() - Date.now()) / (1000 * 60));

      return {
        poolId: `POOL-${order.orderId}`,
        orderId: order.orderId,
        distanceKm: distanceToBuyer,
        estimatedSavings,
        waitTimeMinutes,
        poolingType: hasCommonRoute ? 'common_route' as const : 'nearby_delivery' as const,
        commonSellers: commonSellers.map(s => s.sellerName),
        recommendation: estimatedSavings > 100 && waitTimeMinutes < 30 ? 'highly_recommended' as const :
                       estimatedSavings > 50 ? 'recommended' as const : 'optional' as const,
      };
    }).filter(Boolean);

    const bestSuggestion = poolingSuggestions.reduce((best, current) => {
      if (!best) return current;
      const currentScore = current!.estimatedSavings - (current!.waitTimeMinutes * 2);
      const bestScore = best.estimatedSavings - (best.waitTimeMinutes * 2);
      return currentScore > bestScore ? current : best;
    }, null as typeof poolingSuggestions[0] | null);

    return {
      hasSuggestions: poolingSuggestions.length > 0,
      suggestions: poolingSuggestions,
      bestSuggestion,
      summary: {
        totalOpportunities: poolingSuggestions.length,
        maxSavings: Math.max(...poolingSuggestions.map(s => s!.estimatedSavings), 0),
        avgWaitTime: poolingSuggestions.length > 0
          ? Math.round(poolingSuggestions.reduce((sum, s) => sum + s!.waitTimeMinutes, 0) / poolingSuggestions.length)
          : 0,
      },
    };
  });
