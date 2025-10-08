import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getLiveLocationProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log('📍 Fetching live location for order:', input.orderId);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          driver:driver_id (
            id,
            full_name,
            phone,
            vehicle_type,
            vehicle_number,
            rating
          )
        `)
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

      return {
        success: true,
        order: {
          id: order.id,
          status: order.status,
          estimatedDelivery: order.estimated_delivery,
        },
        driver: order.driver ? {
          id: order.driver.id,
          name: order.driver.full_name,
          phone: order.driver.phone,
          vehicleType: order.driver.vehicle_type,
          vehicleNumber: order.driver.vehicle_number,
          rating: order.driver.rating || 4.5,
        } : null,
        location: tracking ? {
          latitude: tracking.latitude,
          longitude: tracking.longitude,
          lastUpdated: tracking.created_at,
        } : null,
      };
    } catch (error: any) {
      console.error('Get live location error:', error);
      throw new Error(error.message || 'Failed to fetch live location');
    }
  });
