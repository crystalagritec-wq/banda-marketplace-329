import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { calculateDistance } from '@/utils/geo-distance';

export const calculateRouteProcedure = publicProcedure
  .input(z.object({
    from: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    to: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    vehicleType: z.enum(['boda', 'van', 'truck', 'pickup', 'tractor']).optional().default('van'),
  }))
  .query(async ({ input }) => {
    console.log('🗺️ Calculating route:', input);

    const distanceKm = calculateDistance(input.from, input.to);

    const speedMap = {
      boda: 40,
      van: 50,
      truck: 45,
      pickup: 50,
      tractor: 30,
    };

    const speed = speedMap[input.vehicleType];
    const etaMinutes = Math.round((distanceKm / speed) * 60);

    const trafficFactor = 1.2;
    const adjustedEta = Math.round(etaMinutes * trafficFactor);

    return {
      distanceKm,
      etaMinutes: adjustedEta,
      etaFormatted: adjustedEta < 60 
        ? `${adjustedEta} mins` 
        : `${Math.floor(adjustedEta / 60)}h ${adjustedEta % 60}m`,
      route: {
        start: input.from,
        end: input.to,
        waypoints: [],
      },
      vehicleType: input.vehicleType,
    };
  });
