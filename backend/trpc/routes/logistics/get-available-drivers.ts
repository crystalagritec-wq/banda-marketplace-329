import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const getAvailableDriversProcedure = protectedProcedure
  .input(z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    radius: z.number().default(50),
  }))
  .query(async ({ ctx, input }) => {
    const { supabase } = ctx;

    let query = supabase
      .from('logistics_drivers')
      .select('*')
      .eq('verified', true)
      .eq('availability', 'active')
      .eq('allow_discovery', true);

    const { data: drivers, error } = await query;

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch available drivers: ${error.message}`,
      });
    }

    let filteredDrivers = drivers || [];

    if (input.location && filteredDrivers.length > 0) {
      filteredDrivers = filteredDrivers.filter((driver) => {
        if (!driver.current_location) return false;
        
        const driverLat = driver.current_location.lat;
        const driverLng = driver.current_location.lng;
        
        const distance = calculateDistance(
          input.location!.lat,
          input.location!.lng,
          driverLat,
          driverLng
        );
        
        return distance <= input.radius;
      });
    }

    return filteredDrivers;
  });

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
