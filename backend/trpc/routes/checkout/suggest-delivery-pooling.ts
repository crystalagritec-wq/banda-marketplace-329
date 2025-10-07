import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const suggestDeliveryPoolingProcedure = publicProcedure
  .input(z.object({
    sellerGroups: z.array(z.object({
      sellerId: z.string(),
      sellerName: z.string(),
      sellerLocation: z.string(),
      sellerCoordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
      totalWeight: z.number(),
      subtotal: z.number(),
      items: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number(),
      })),
    })),
    buyerLocation: z.object({
      city: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    paymentMethod: z.enum(['agripay', 'mpesa', 'card', 'cod']),
  }))
  .query(async ({ input }) => {
    console.log('🚚 Analyzing delivery pooling opportunities for', input.sellerGroups.length, 'sellers');

    const { sellerGroups, paymentMethod } = input;

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const locationClusters = new Map<string, typeof sellerGroups>();
    sellerGroups.forEach(seller => {
      const location = seller.sellerLocation.toLowerCase().trim();
      if (!locationClusters.has(location)) {
        locationClusters.set(location, []);
      }
      locationClusters.get(location)!.push(seller);
    });

    const poolingOpportunities = Array.from(locationClusters.entries())
      .filter(([_, sellers]) => sellers.length > 1)
      .map(([location, sellers]) => {
        const totalWeight = sellers.reduce((sum, s) => sum + s.totalWeight, 0);
        const totalSubtotal = sellers.reduce((sum, s) => sum + s.subtotal, 0);
        
        const separateDeliveryFee = sellers.length * 200;
        const pooledDeliveryFee = totalWeight > 50 ? 350 : totalWeight > 20 ? 250 : 180;
        const savings = separateDeliveryFee - pooledDeliveryFee;
        const savingsPercentage = Math.round((savings / separateDeliveryFee) * 100);

        const estimatedSeparateTime = sellers.length * 90;
        const estimatedPooledTime = 60 + (sellers.length * 15);
        const timeSavings = estimatedSeparateTime - estimatedPooledTime;

        const co2Separate = sellers.length * 2.5;
        const co2Pooled = 3.0;
        const co2Savings = co2Separate - co2Pooled;

        return {
          location,
          sellerIds: sellers.map(s => s.sellerId),
          sellerNames: sellers.map(s => s.sellerName),
          sellerCount: sellers.length,
          totalWeight,
          totalSubtotal,
          separateDelivery: {
            fee: separateDeliveryFee,
            estimatedTime: `${estimatedSeparateTime} mins`,
            co2Emissions: co2Separate,
          },
          pooledDelivery: {
            fee: pooledDeliveryFee,
            estimatedTime: `${estimatedPooledTime} mins`,
            co2Emissions: co2Pooled,
            pickupSequence: sellers.map((s, i) => ({
              order: i + 1,
              sellerName: s.sellerName,
              estimatedPickupTime: `+${i * 15} mins`,
            })),
          },
          savings: {
            amount: savings,
            percentage: savingsPercentage,
            timeSaved: timeSavings,
            co2Saved: Number(co2Savings.toFixed(1)),
          },
          recommendation: savings > 100 ? 'highly_recommended' : savings > 50 ? 'recommended' : 'optional',
        };
      });

    const codRestriction = paymentMethod === 'cod' && poolingOpportunities.length > 0
      ? {
          allowed: false,
          reason: 'COD orders are delivered separately per seller for payment verification',
          suggestion: 'Switch to prepaid (M-Pesa/Card) to enable delivery pooling and save money',
        }
      : { allowed: true, reason: null, suggestion: null };

    const routeOverlaps = [];
    for (let i = 0; i < sellerGroups.length; i++) {
      for (let j = i + 1; j < sellerGroups.length; j++) {
        const seller1 = sellerGroups[i];
        const seller2 = sellerGroups[j];
        
        if (seller1.sellerCoordinates && seller2.sellerCoordinates) {
          const distance = calculateDistance(
            seller1.sellerCoordinates.lat,
            seller1.sellerCoordinates.lng,
            seller2.sellerCoordinates.lat,
            seller2.sellerCoordinates.lng
          );

          if (distance < 5) {
            routeOverlaps.push({
              seller1: seller1.sellerName,
              seller2: seller2.sellerName,
              distance: Number(distance.toFixed(1)),
              suggestion: `${seller1.sellerName} and ${seller2.sellerName} are only ${distance.toFixed(1)}km apart. Pool delivery to save KSh 150.`,
            });
          }
        }
      }
    }

    const totalPotentialSavings = poolingOpportunities.reduce((sum, opp) => sum + opp.savings.amount, 0);
    const totalCo2Savings = poolingOpportunities.reduce((sum, opp) => sum + opp.savings.co2Saved, 0);

    const recommendation = poolingOpportunities.length > 0
      ? {
          type: 'pooled' as const,
          message: `Pool deliveries from ${poolingOpportunities[0].sellerCount} sellers in ${poolingOpportunities[0].location} to save KSh ${totalPotentialSavings} and ${totalCo2Savings.toFixed(1)}kg CO₂`,
          savings: totalPotentialSavings,
          co2Savings: totalCo2Savings,
        }
      : {
          type: 'split' as const,
          message: 'Sellers are in different locations. Separate deliveries recommended.',
          savings: 0,
          co2Savings: 0,
        };

    console.log('✅ Found', poolingOpportunities.length, 'pooling opportunities. Potential savings: KSh', totalPotentialSavings);

    return {
      canPool: poolingOpportunities.length > 0,
      poolingOpportunities,
      routeOverlaps,
      codRestriction,
      recommendation,
      summary: {
        totalSellers: sellerGroups.length,
        poolableSellers: poolingOpportunities.reduce((sum, opp) => sum + opp.sellerCount, 0),
        totalPotentialSavings,
        totalCo2Savings: Number(totalCo2Savings.toFixed(1)),
        estimatedTimeSavings: poolingOpportunities.reduce((sum, opp) => sum + opp.savings.timeSaved, 0),
      },
    };
  });
