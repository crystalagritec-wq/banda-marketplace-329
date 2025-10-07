import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDistance, calculateDeliveryFee } from '@/utils/geo-distance';

export const getMultiSellerRoutesProcedure = publicProcedure
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
    vehicleType: z.enum(['boda', 'van', 'truck', 'pickup', 'tractor']).optional().default('van'),
  }))
  .query(async ({ input }) => {
    console.log('🚚 Calculating multi-seller routes for', input.sellers.length, 'sellers');

    const routes = input.sellers.map(seller => {
      const distanceKm = calculateDistance(seller.coordinates, input.buyerAddress);
      
      const speedMap = {
        boda: 40,
        van: 50,
        truck: 45,
        pickup: 50,
        tractor: 30,
      };

      const speed = speedMap[input.vehicleType];
      const etaMinutes = Math.round((distanceKm / speed) * 60 * 1.2);

      const baseFee = calculateDeliveryFee(distanceKm);
      
      const vehicleMultipliers = {
        boda: 1.0,
        van: 1.3,
        truck: 1.8,
        pickup: 1.4,
        tractor: 2.0,
      };

      const totalFee = Math.round(baseFee * vehicleMultipliers[input.vehicleType]);

      return {
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        distanceKm,
        etaMinutes,
        etaFormatted: etaMinutes < 60 
          ? `${etaMinutes} mins` 
          : `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m`,
        deliveryFee: totalFee,
        route: {
          start: seller.coordinates,
          end: input.buyerAddress,
        },
      };
    });

    const totalDistance = routes.reduce((sum, r) => sum + r.distanceKm, 0);
    const totalFee = routes.reduce((sum, r) => sum + r.deliveryFee, 0);
    const longestEta = Math.max(...routes.map(r => r.etaMinutes));

    return {
      routes,
      summary: {
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalFee,
        estimatedDeliveryTime: longestEta,
        estimatedDeliveryFormatted: longestEta < 60 
          ? `${longestEta} mins` 
          : `${Math.floor(longestEta / 60)}h ${longestEta % 60}m`,
        sellerCount: input.sellers.length,
      },
    };
  });
