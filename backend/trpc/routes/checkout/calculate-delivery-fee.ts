import { z } from 'zod';
import { publicProcedure } from '../../create-context';

export const calculateDeliveryFeeProcedure = publicProcedure
  .input(z.object({
    orderValue: z.number(),
    orderWeight: z.number(),
    distance: z.number(),
    deliveryArea: z.string(),
    deliveryZone: z.enum(['ZONE_1', 'ZONE_2', 'ZONE_3', 'ZONE_4']),
    providerId: z.string(),
    urgency: z.enum(['standard', 'express']).optional().default('standard'),
  }))
  .mutation(async ({ input }) => {
    console.log('🚚 Calculating delivery fee:', input);

    // Delivery zones with pricing
    const deliveryZones = {
      ZONE_1: { name: 'Nairobi Metro', baseFee: 150, freeThreshold: 2000 },
      ZONE_2: { name: 'Greater Nairobi', baseFee: 250, freeThreshold: 3000 },
      ZONE_3: { name: 'Central Kenya', baseFee: 400, freeThreshold: 5000 },
      ZONE_4: { name: 'Extended Regions', baseFee: 600, freeThreshold: 8000 },
    };

    // Provider base costs (per km)
    const providerCosts = {
      'bdp-001': { base: 120, perKm: 15, type: 'boda' }, // Banda Express Boda
      'bdp-002': { base: 250, perKm: 25, type: 'van' },  // Banda Probox Fleet
      'bdp-003': { base: 400, perKm: 35, type: 'van' },  // Banda Hiace Cargo
      'bdp-004': { base: 600, perKm: 45, type: 'truck' }, // Banda Heavy Logistics
      'bdp-005': { base: 800, perKm: 55, type: 'tractor' }, // Banda ColdChain Express
      'bdp-006': { base: 300, perKm: 30, type: 'pickup' }, // Banda Pickup Service
    };

    const zone = deliveryZones[input.deliveryZone];
    const provider = providerCosts[input.providerId as keyof typeof providerCosts];

    if (!provider) {
      throw new Error('Invalid provider ID');
    }

    // Calculate base delivery fee
    const baseFee = provider.base;
    const distanceFee = input.distance * provider.perKm;
    const totalBeforeDiscount = baseFee + distanceFee;

    // Apply express surcharge
    const expressSurcharge = input.urgency === 'express' ? totalBeforeDiscount * 0.3 : 0;
    
    // Apply Banda discount for recommended providers
    const bandaRecommendedProviders = ['bdp-001', 'bdp-002', 'bdp-005'];
    const bandaDiscount = bandaRecommendedProviders.includes(input.providerId) 
      ? totalBeforeDiscount * 0.1 : 0;

    const totalFee = totalBeforeDiscount + expressSurcharge - bandaDiscount;
    const isFreeDelivery = input.orderValue >= zone.freeThreshold;

    // AI recommendation logic
    const getAIRecommendation = () => {
      if (input.orderWeight <= 25 && input.urgency === 'express') {
        return 'bdp-001'; // Boda for light, express orders
      }
      if (input.orderWeight <= 800) {
        return 'bdp-002'; // Van for medium orders
      }
      if (input.orderWeight > 800) {
        return 'bdp-004'; // Truck for heavy orders
      }
      return 'bdp-002'; // Default to van
    };

    const aiRecommendedProvider = getAIRecommendation();
    const isAIRecommended = input.providerId === aiRecommendedProvider;

    return {
      baseFee,
      distanceFee,
      expressSurcharge,
      bandaDiscount,
      totalFee: isFreeDelivery ? 0 : totalFee,
      isFreeDelivery,
      isAIRecommended,
      estimatedTime: provider.type === 'boda' ? '30-45 mins' : 
                    provider.type === 'van' ? '1-2 hours' :
                    provider.type === 'truck' ? '3-4 hours' :
                    provider.type === 'tractor' ? '2-4 hours' : '1.5-2.5 hours',
      zone: zone.name,
    };
  });