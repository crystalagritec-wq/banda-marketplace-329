import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDistance, calculateDeliveryFee, calculateTimeConsciousETA } from '@/utils/geo-distance';

export const getSellerDeliveryQuotesProcedure = publicProcedure
  .input(z.object({
    sellerGroups: z.array(z.object({
      sellerId: z.string(),
      sellerLocation: z.string(),
      sellerCoordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      totalWeight: z.number(),
      subtotal: z.number(),
    })),
    buyerLocation: z.object({
      city: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    }),
    deliverySpeed: z.enum(['standard', 'express']).default('standard'),
  }))
  .query(async ({ input }) => {
    console.log('📦 Getting delivery quotes for', input.sellerGroups.length, 'sellers');

    const sellerQuotes = input.sellerGroups.map((seller) => {
      const defaultCoordinates = { lat: -1.2921, lng: 36.8219 };
      const sellerCoords = seller.sellerCoordinates || defaultCoordinates;
      const buyerCoords = input.buyerLocation.coordinates || defaultCoordinates;
      
      const distance = calculateDistance(sellerCoords, buyerCoords);
      
      if (distance === 0) {
        console.warn(`⚠️ Zero distance calculated for ${seller.sellerLocation}. Using fallback.`);
      }
      
      console.log(`📍 Distance from ${seller.sellerLocation} to ${input.buyerLocation.city}: ${distance}km`);
      
      const baseFee = calculateDeliveryFee(distance);
      const weightMultiplier = seller.totalWeight > 10 ? 1.5 : 1.0;
      const speedMultiplier = input.deliverySpeed === 'express' ? 1.8 : 1.0;

      const providers = [
        {
          id: `boda-${seller.sellerId}`,
          name: 'Banda Boda',
          type: 'boda' as const,
          vehicleType: 'boda',
          maxWeight: 15,
          feeMultiplier: 1.0,
          rating: 4.8,
          completedDeliveries: 1250,
          available: seller.totalWeight <= 15,
        },
        {
          id: `van-${seller.sellerId}`,
          name: 'Banda Van',
          type: 'van' as const,
          vehicleType: 'van',
          maxWeight: 100,
          feeMultiplier: 1.3,
          rating: 4.7,
          completedDeliveries: 890,
          available: seller.totalWeight <= 100,
        },
        {
          id: `truck-${seller.sellerId}`,
          name: 'Banda Truck',
          type: 'truck' as const,
          vehicleType: 'truck',
          maxWeight: 500,
          feeMultiplier: 1.8,
          rating: 4.6,
          completedDeliveries: 450,
          available: seller.totalWeight <= 500,
        },
      ];

      const availableProviders = providers
        .filter(p => p.available)
        .map(provider => {
          const eta = calculateTimeConsciousETA(distance, provider.type);
          
          let deliveryFee = Math.round(
            baseFee * 
            provider.feeMultiplier * 
            weightMultiplier * 
            speedMultiplier
          );

          const isFreeDelivery = seller.subtotal >= 5000 && provider.type === 'boda';
          const bandaDiscount = seller.subtotal >= 3000 ? 50 : 0;
          
          if (isFreeDelivery) {
            deliveryFee = 0;
          } else {
            deliveryFee = Math.max(0, deliveryFee - bandaDiscount);
          }
          
          console.log(`🚚 ${provider.name} for ${seller.sellerLocation}: ${deliveryFee} KES (${eta.etaText})`);

          return {
            provider: {
              id: provider.id,
              name: provider.name,
              type: provider.type,
              vehicleType: provider.vehicleType,
              maxWeight: provider.maxWeight,
              rating: provider.rating,
              completedDeliveries: provider.completedDeliveries,
              description: `Reliable ${provider.type} delivery service`,
              specialties: ['Fresh Produce', 'Agricultural Products'],
              bandaRecommended: provider.type === 'boda' && seller.totalWeight <= 10,
            },
            totalFee: deliveryFee,
            originalFee: deliveryFee + bandaDiscount,
            bandaDiscount,
            isFreeDelivery,
            estimatedTime: eta.etaText,
            etaMinutes: eta.etaMinutes,
            distance: Math.round(distance * 10) / 10,
          };
        });

      return {
        sellerId: seller.sellerId,
        sellerLocation: seller.sellerLocation,
        quotes: availableProviders,
        recommendedQuote: availableProviders.find(q => q.provider.bandaRecommended) || availableProviders[0],
      };
    });

    const poolingOpportunities = sellerQuotes.filter((sq, index, arr) => 
      arr.some((other, otherIndex) => 
        otherIndex !== index && 
        sq.sellerLocation === other.sellerLocation
      )
    );

    return {
      sellerQuotes,
      poolingOpportunities: poolingOpportunities.map(sq => ({
        sellerId: sq.sellerId,
        sellerLocation: sq.sellerLocation,
        potentialSavings: 100,
      })),
      totalEstimatedFee: sellerQuotes.reduce((sum, sq) => 
        sum + (sq.recommendedQuote?.totalFee || 0), 0
      ),
    };
  });
