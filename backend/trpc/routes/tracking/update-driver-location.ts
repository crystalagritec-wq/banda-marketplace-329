import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const updateDriverLocationProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
      driverId: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      status: z.enum(['picked_up', 'in_transit', 'nearby', 'arrived']).optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('📍 Updating driver location:', input);

      const { error: trackingError } = await supabase
        .from('delivery_tracking')
        .insert({
          order_id: input.orderId,
          driver_id: input.driverId,
          latitude: input.latitude,
          longitude: input.longitude,
          status: input.status || 'in_transit',
        });

      if (trackingError) {
        console.error('Tracking insert error:', trackingError);
        throw new Error('Failed to update location');
      }

      if (input.status) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: input.status })
          .eq('id', input.orderId);

        if (orderError) {
          console.error('Order status update error:', orderError);
        }
      }

      return {
        success: true,
        message: 'Location updated successfully',
      };
    } catch (error: any) {
      console.error('Update driver location error:', error);
      throw new Error(error.message || 'Failed to update driver location');
    }
  });
