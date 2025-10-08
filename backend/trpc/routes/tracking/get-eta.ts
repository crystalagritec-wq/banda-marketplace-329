import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getETAProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('⏱️ Calculating ETA for order:', input.orderId);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, delivery_address')
        .eq('id', input.orderId)
        .single();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw new Error('Order not found');
      }

      const { data: tracking, error: trackingError } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', input.orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (trackingError && trackingError.code !== 'PGRST116') {
        console.error('Tracking fetch error:', trackingError);
      }

      let estimatedMinutes = 30;
      
      if (tracking && order.delivery_address) {
        const distance = calculateDistance(
          tracking.latitude,
          tracking.longitude,
          order.delivery_address.latitude || 0,
          order.delivery_address.longitude || 0
        );
        
        const averageSpeed = 30;
        estimatedMinutes = Math.ceil((distance / averageSpeed) * 60);
      }

      const estimatedTime = new Date(Date.now() + estimatedMinutes * 60000);

      return {
        success: true,
        eta: {
          minutes: estimatedMinutes,
          estimatedTime: estimatedTime.toISOString(),
          formattedTime: estimatedTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        },
      };
    } catch (error: any) {
      console.error('Get ETA error:', error);
      throw new Error(error.message || 'Failed to calculate ETA');
    }
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
