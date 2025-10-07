import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDistance, calculateDeliveryFee } from '@/utils/geo-distance';

export const calculatePooledDeliveryProcedure = publicProcedure
  .input(z.object({
    orders: z.array(z.object({
      orderId: z.string(),
      buyerAddress: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      sellers: z.array(z.object({
        sellerId: z.string(),
        coordinates: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        orderValue: z.number(),
      })),
    })),
    vehicleType: z.enum(['boda', 'van', 'truck', 'pickup']).optional().default('van'),
  }))
  .mutation(async ({ input }) => {
    console.log('🚚 Calculating pooled delivery for', input.orders.length, 'orders');

    if (input.orders.length === 0) {
      throw new Error('No orders provided for pooling');
    }

    const allSellers = new Map<string, { coordinates: { lat: number; lng: number }; orderValue: number }>();
    input.orders.forEach(order => {
      order.sellers.forEach(seller => {
        if (!allSellers.has(seller.sellerId)) {
          allSellers.set(seller.sellerId, {
            coordinates: seller.coordinates,
            orderValue: seller.orderValue,
          });
        } else {
          const existing = allSellers.get(seller.sellerId)!;
          existing.orderValue += seller.orderValue;
        }
      });
    });

    const uniqueSellers = Array.from(allSellers.entries()).map(([sellerId, data]) => ({
      sellerId,
      ...data,
    }));

    const allBuyers = input.orders.map(order => order.buyerAddress);

    const centroid = {
      lat: allBuyers.reduce((sum, b) => sum + b.lat, 0) / allBuyers.length,
      lng: allBuyers.reduce((sum, b) => sum + b.lng, 0) / allBuyers.length,
    };

    let totalDistance = 0;
    uniqueSellers.forEach(seller => {
      totalDistance += calculateDistance(seller.coordinates, centroid);
    });

    allBuyers.forEach(buyer => {
      totalDistance += calculateDistance(centroid, buyer);
    });

    const vehicleMultipliers = {
      boda: 1.0,
      van: 1.3,
      truck: 1.8,
      pickup: 1.4,
    };

    const baseFee = calculateDeliveryFee(totalDistance);
    const totalFee = Math.round(baseFee * vehicleMultipliers[input.vehicleType]);

    const feePerOrder = Math.round(totalFee / input.orders.length);

    const individualFees = input.orders.map(order => {
      let orderFee = 0;
      order.sellers.forEach(seller => {
        const distance = calculateDistance(seller.coordinates, order.buyerAddress);
        orderFee += calculateDeliveryFee(distance);
      });
      return orderFee;
    });

    const totalIndividualFees = individualFees.reduce((sum, fee) => sum + fee, 0);
    const totalSavings = totalIndividualFees - totalFee;
    const savingsPerOrder = Math.round(totalSavings / input.orders.length);

    const speedMap = {
      boda: 40,
      van: 50,
      truck: 45,
      pickup: 50,
    };

    const avgSpeed = speedMap[input.vehicleType];
    const etaMinutes = Math.round((totalDistance / avgSpeed) * 60 * 1.3);

    return {
      pooledDelivery: {
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalFee,
        feePerOrder,
        estimatedTime: etaMinutes < 60 
          ? `${etaMinutes} mins` 
          : `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m`,
        vehicleType: input.vehicleType,
        orderCount: input.orders.length,
        sellerCount: uniqueSellers.length,
      },
      savings: {
        totalSavings,
        savingsPerOrder,
        savingsPercentage: Math.round((totalSavings / totalIndividualFees) * 100),
      },
      route: {
        sellers: uniqueSellers.map(s => s.sellerId),
        buyers: input.orders.map(o => o.orderId),
        optimizedPath: [
          ...uniqueSellers.map(s => ({ type: 'pickup' as const, location: s.coordinates })),
          ...allBuyers.map(b => ({ type: 'dropoff' as const, location: b })),
        ],
      },
      comparison: {
        individual: {
          totalFee: totalIndividualFees,
          avgFeePerOrder: Math.round(totalIndividualFees / input.orders.length),
        },
        pooled: {
          totalFee,
          feePerOrder,
        },
      },
    };
  });
