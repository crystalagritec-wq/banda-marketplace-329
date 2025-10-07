import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDistance } from '@/utils/geo-distance';

export const findPoolingOpportunitiesProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
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
    maxPoolingRadius: z.number().optional().default(5),
  }))
  .query(async ({ input }) => {
    console.log('🚛 Finding pooling opportunities for order:', input.orderId);

    const activeOrders = [
      {
        orderId: 'ORD-001',
        buyerAddress: { lat: -1.2921 + 0.01, lng: 36.8219 + 0.01 },
        sellers: [
          { sellerId: 'S1', coordinates: { lat: -1.2921, lng: 36.8219 }, orderValue: 1500 }
        ],
        status: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        orderId: 'ORD-002',
        buyerAddress: { lat: -1.2921 + 0.008, lng: 36.8219 + 0.012 },
        sellers: [
          { sellerId: 'S2', coordinates: { lat: -1.2921 + 0.05, lng: 36.8219 + 0.05 }, orderValue: 2000 }
        ],
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];

    const poolingOpportunities = activeOrders
      .filter(order => order.orderId !== input.orderId)
      .map(order => {
        const distanceToBuyer = calculateDistance(input.buyerAddress, order.buyerAddress);
        
        const commonSellers = input.sellers.filter(inputSeller =>
          order.sellers.some(orderSeller => {
            const sellerDistance = calculateDistance(inputSeller.coordinates, orderSeller.coordinates);
            return sellerDistance < 2;
          })
        );

        const isNearby = distanceToBuyer <= input.maxPoolingRadius;
        const hasCommonSellers = commonSellers.length > 0;
        const isRecent = (Date.now() - new Date(order.createdAt).getTime()) < 30 * 60 * 1000;

        if (!isNearby && !hasCommonSellers) {
          return null;
        }

        const potentialSavings = isNearby ? 
          Math.round(distanceToBuyer * 20 * 0.4) : 
          Math.round(commonSellers.length * 50);

        return {
          orderId: order.orderId,
          buyerDistance: distanceToBuyer,
          commonSellers: commonSellers.map(s => s.sellerId),
          potentialSavings,
          poolingType: isNearby ? 'nearby_delivery' as const : 'common_seller' as const,
          isRecent,
          estimatedDelay: Math.round(distanceToBuyer * 2),
        };
      })
      .filter(Boolean);

    const bestOpportunity = poolingOpportunities.reduce((best, current) => {
      if (!best) return current;
      if (current!.potentialSavings > best.potentialSavings) return current;
      return best;
    }, null as typeof poolingOpportunities[0] | null);

    return {
      hasOpportunities: poolingOpportunities.length > 0,
      opportunities: poolingOpportunities,
      bestOpportunity,
      recommendation: bestOpportunity ? {
        message: bestOpportunity.poolingType === 'nearby_delivery'
          ? `Share delivery with nearby order and save KSh ${bestOpportunity.potentialSavings}`
          : `Bundle with order from same seller and save KSh ${bestOpportunity.potentialSavings}`,
        savings: bestOpportunity.potentialSavings,
        estimatedDelay: bestOpportunity.estimatedDelay,
      } : null,
    };
  });
