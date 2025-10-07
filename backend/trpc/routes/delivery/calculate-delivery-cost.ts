import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDeliveryFee, calculateTimeConsciousETA } from '@/utils/geo-distance';

export const calculateDeliveryCostProcedure = publicProcedure
  .input(z.object({
    distanceKm: z.number(),
    vehicleType: z.enum(['boda', 'van', 'truck', 'pickup', 'tractor']),
    orderValue: z.number().optional(),
    urgency: z.enum(['standard', 'express', 'premium']).optional().default('standard'),
  }))
  .query(async ({ input }) => {
    console.log('💰 Calculating delivery cost:', input);

    const baseFee = calculateDeliveryFee(input.distanceKm);

    const vehicleMultipliers = {
      boda: 1.0,
      van: 1.3,
      truck: 1.8,
      pickup: 1.4,
      tractor: 2.0,
    };

    const urgencyMultipliers = {
      standard: 1.0,
      express: 1.5,
      premium: 2.0,
    };

    const vehicleMultiplier = vehicleMultipliers[input.vehicleType];
    const urgencyMultiplier = urgencyMultipliers[input.urgency || 'standard'];

    let totalFee = Math.round(baseFee * vehicleMultiplier * urgencyMultiplier);

    const isFreeDelivery = input.orderValue && input.orderValue >= 5000;
    if (isFreeDelivery) {
      totalFee = 0;
    }

    const breakdown = {
      baseFee: Math.round(baseFee),
      vehicleFee: Math.round(baseFee * (vehicleMultiplier - 1)),
      urgencyFee: Math.round(baseFee * vehicleMultiplier * (urgencyMultiplier - 1)),
      discount: isFreeDelivery ? totalFee : 0,
    };

    const eta = calculateTimeConsciousETA(input.distanceKm, input.vehicleType);

    return {
      totalFee,
      breakdown,
      isFreeDelivery: isFreeDelivery || false,
      distanceKm: input.distanceKm,
      vehicleType: input.vehicleType,
      urgency: input.urgency || 'standard',
      etaMinutes: eta.etaMinutes,
      etaText: eta.etaText,
    };
  });
