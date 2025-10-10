import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getDriverEarningsProcedure = protectedProcedure
  .input(z.object({
    driverId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    try {
      console.log('💰 Fetching driver earnings:', input);

      let query = supabase
        .from('logistics_payouts')
        .select(`
          *,
          logistics_assignments!inner(
            driver_id,
            status,
            delivered_at,
            orders!inner(order_number)
          )
        `)
        .eq('logistics_assignments.driver_id', input.driverId);

      if (input.startDate) {
        query = query.gte('created_at', input.startDate);
      }

      if (input.endDate) {
        query = query.lte('created_at', input.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching driver earnings:', error);
        throw new Error(`Failed to fetch earnings: ${error.message}`);
      }

      const totalGross = data?.reduce((sum, payout) => sum + (payout.gross_amount || 0), 0) || 0;
      const totalBandaFee = data?.reduce((sum, payout) => sum + (payout.banda_fee || 0), 0) || 0;
      const totalNet = data?.reduce((sum, payout) => sum + (payout.net_amount || 0), 0) || 0;
      const totalPaid = data?.filter(p => p.status === 'paid').reduce((sum, payout) => sum + (payout.net_amount || 0), 0) || 0;
      const totalPending = data?.filter(p => p.status === 'pending').reduce((sum, payout) => sum + (payout.net_amount || 0), 0) || 0;

      const earnings = data?.map(payout => ({
        id: payout.id,
        assignmentId: payout.assignment_id,
        orderNumber: payout.logistics_assignments?.orders?.order_number,
        grossAmount: payout.gross_amount,
        bandaFee: payout.banda_fee,
        netAmount: payout.net_amount,
        status: payout.status,
        paidAt: payout.paid_at,
        deliveredAt: payout.logistics_assignments?.delivered_at,
        createdAt: payout.created_at,
      })) || [];

      return {
        success: true,
        summary: {
          totalGross,
          totalBandaFee,
          totalNet,
          totalPaid,
          totalPending,
          totalDeliveries: data?.length || 0,
          completedDeliveries: data?.filter(p => p.logistics_assignments?.status === 'delivered').length || 0,
        },
        earnings,
      };
    } catch (error: any) {
      console.error('❌ Error in getDriverEarningsProcedure:', error);
      throw new Error(error.message || 'Failed to fetch driver earnings');
    }
  });
