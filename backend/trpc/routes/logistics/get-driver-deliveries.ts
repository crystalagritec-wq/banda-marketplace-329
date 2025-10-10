import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getDriverDeliveriesProcedure = protectedProcedure
  .input(z.object({
    driverId: z.string(),
    status: z.enum(['all', 'pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled']).optional(),
    page: z.number().default(1),
    limit: z.number().default(20),
  }))
  .query(async ({ input }) => {
    try {
      console.log('🚚 Fetching driver deliveries:', input);

      const offset = (input.page - 1) * input.limit;

      let query = supabase
        .from('logistics_assignments')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            total_amount,
            buyer_id,
            delivery_address,
            delivery_location,
            delivery_instructions,
            profiles!orders_buyer_id_fkey(full_name, phone)
          ),
          logistics_payouts(
            id,
            gross_amount,
            banda_fee,
            net_amount,
            status,
            paid_at
          )
        `, { count: 'exact' })
        .eq('driver_id', input.driverId);

      if (input.status && input.status !== 'all') {
        query = query.eq('status', input.status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + input.limit - 1);

      if (error) {
        console.error('❌ Error fetching driver deliveries:', error);
        throw new Error(`Failed to fetch deliveries: ${error.message}`);
      }

      const deliveries = data?.map(delivery => ({
        id: delivery.id,
        orderId: delivery.order_id,
        orderNumber: delivery.orders?.order_number,
        status: delivery.status,
        customerName: delivery.orders?.profiles?.full_name || 'Unknown',
        customerPhone: delivery.orders?.profiles?.phone,
        deliveryAddress: delivery.orders?.delivery_address,
        deliveryLocation: delivery.orders?.delivery_location,
        deliveryInstructions: delivery.orders?.delivery_instructions,
        orderAmount: delivery.orders?.total_amount || 0,
        deliveryFee: delivery.logistics_payouts?.[0]?.net_amount || 0,
        grossAmount: delivery.logistics_payouts?.[0]?.gross_amount || 0,
        bandaFee: delivery.logistics_payouts?.[0]?.banda_fee || 0,
        payoutStatus: delivery.logistics_payouts?.[0]?.status || 'pending',
        paidAt: delivery.logistics_payouts?.[0]?.paid_at,
        pooled: delivery.pooled || false,
        eta: delivery.eta,
        route: delivery.route,
        pickupLocation: delivery.pickup_location,
        pickupAddress: delivery.pickup_address,
        distance: delivery.distance,
        acceptedAt: delivery.accepted_at,
        pickedUpAt: delivery.picked_up_at,
        deliveredAt: delivery.delivered_at,
        createdAt: delivery.created_at,
      })) || [];

      return {
        success: true,
        deliveries,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / input.limit),
        },
      };
    } catch (error: any) {
      console.error('❌ Error in getDriverDeliveriesProcedure:', error);
      throw new Error(error.message || 'Failed to fetch driver deliveries');
    }
  });
