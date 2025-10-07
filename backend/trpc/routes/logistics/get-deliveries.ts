import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getDeliveriesProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    role: z.enum(['buyer', 'provider']),
    status: z.enum(['all', 'pending', 'in_progress', 'delivered', 'cancelled']).optional()
  }))
  .query(async ({ input }) => {
    try {
      console.log('🚚 Fetching deliveries for:', input);

      if (input.role === 'buyer') {
        // Fetch buyer's deliveries with provider info
        let query = supabase
          .from('logistics_assignments')
          .select(`
            *,
            logistics_providers!inner(name, vehicle_type, rating),
            orders!inner(id, total_amount, buyer_id),
            logistics_payouts(gross_amount, banda_fee, net_amount)
          `)
          .eq('orders.buyer_id', input.userId);

        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching buyer deliveries:', error);
          throw new Error(`Failed to fetch deliveries: ${error.message}`);
        }

        return {
          success: true,
          deliveries: data?.map(delivery => ({
            id: delivery.id,
            orderId: delivery.order_id,
            status: delivery.status,
            providerName: delivery.logistics_providers?.name,
            vehicleType: delivery.logistics_providers?.vehicle_type,
            providerRating: delivery.logistics_providers?.rating,
            cost: delivery.logistics_payouts?.[0]?.net_amount || 0,
            pooled: delivery.pooled,
            eta: delivery.eta,
            route: delivery.route,
            createdAt: delivery.created_at
          })) || []
        };
      } else {
        // Fetch provider's assignments
        let query = supabase
          .from('logistics_assignments')
          .select(`
            *,
            orders!inner(id, total_amount, buyer_id),
            logistics_payouts(gross_amount, banda_fee, net_amount, status)
          `)
          .eq('provider_id', input.userId);

        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching provider assignments:', error);
          throw new Error(`Failed to fetch assignments: ${error.message}`);
        }

        return {
          success: true,
          assignments: data?.map(assignment => ({
            id: assignment.id,
            orderId: assignment.order_id,
            status: assignment.status,
            pooled: assignment.pooled,
            eta: assignment.eta,
            route: assignment.route,
            orderCount: assignment.pooled ? (assignment.route?.orders?.length || 1) : 1,
            payout: assignment.logistics_payouts?.[0]?.net_amount || 0,
            payoutStatus: assignment.logistics_payouts?.[0]?.status || 'pending',
            createdAt: assignment.created_at
          })) || []
        };
      }
    } catch (error: any) {
      console.error('❌ Error in getDeliveriesProcedure:', error);
      throw new Error(error.message || 'Failed to fetch deliveries');
    }
  });