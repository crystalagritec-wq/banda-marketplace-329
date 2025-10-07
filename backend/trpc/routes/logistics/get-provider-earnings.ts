import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getProviderEarningsProcedure = protectedProcedure
  .input(z.object({
    providerId: z.string(),
    period: z.enum(['week', 'month', 'year', 'all']).optional().default('month')
  }))
  .query(async ({ input }) => {
    try {
      console.log('💰 Fetching provider earnings for:', input);

      // Calculate date range based on period
      let dateFilter = '';
      const now = new Date();
      
      switch (input.period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateFilter = monthAgo.toISOString();
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          dateFilter = yearAgo.toISOString();
          break;
        default:
          dateFilter = '';
      }

      let query = supabase
        .from('logistics_payouts')
        .select(`
          *,
          logistics_assignments!inner(id, status, pooled, created_at)
        `)
        .eq('provider_id', input.providerId);

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching provider earnings:', error);
        throw new Error(`Failed to fetch earnings: ${error.message}`);
      }

      // Calculate summary statistics
      const totalTrips = data?.length || 0;
      const completedTrips = data?.filter(p => p.status === 'paid').length || 0;
      const pendingTrips = data?.filter(p => p.status === 'pending').length || 0;
      const pooledTrips = data?.filter(p => p.logistics_assignments?.pooled).length || 0;
      
      const grossAmount = data?.reduce((sum, p) => sum + (Number(p.gross_amount) || 0), 0) || 0;
      const bandaFee = data?.reduce((sum, p) => sum + (Number(p.banda_fee) || 0), 0) || 0;
      const netAmount = data?.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0) || 0;
      const paidAmount = data?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0) || 0;
      const pendingAmount = data?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0) || 0;

      return {
        success: true,
        summary: {
          totalTrips,
          completedTrips,
          pendingTrips,
          pooledTrips,
          grossAmount,
          bandaFee,
          netAmount,
          paidAmount,
          pendingAmount,
          averagePerTrip: totalTrips > 0 ? netAmount / totalTrips : 0,
          period: input.period
        },
        transactions: data?.map(payout => ({
          id: payout.id,
          assignmentId: payout.assignment_id,
          grossAmount: Number(payout.gross_amount) || 0,
          bandaFee: Number(payout.banda_fee) || 0,
          netAmount: Number(payout.net_amount) || 0,
          status: payout.status,
          pooled: payout.logistics_assignments?.pooled || false,
          createdAt: payout.created_at
        })) || []
      };
    } catch (error: any) {
      console.error('❌ Error in getProviderEarningsProcedure:', error);
      throw new Error(error.message || 'Failed to fetch earnings');
    }
  });