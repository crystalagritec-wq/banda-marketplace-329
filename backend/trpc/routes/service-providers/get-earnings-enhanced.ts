import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const getServiceEarningsEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.enum(['all', 'pending', 'paid', 'processing']).optional().default('all'),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      console.log('[ServiceProviders] Fetching earnings', { userId: ctx.user.id, input });

      const { data: provider, error: providerError } = await ctx.supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single();

      if (providerError || !provider) {
        console.error('[ServiceProviders] Provider not found', providerError);
        return {
          earnings: [],
          summary: {
            totalEarnings: 0,
            pendingEarnings: 0,
            paidEarnings: 0,
            processingEarnings: 0,
          },
        };
      }

      let query = ctx.supabase
        .from('service_provider_earnings')
        .select(`
          *,
          request:service_requests(
            id,
            service_category,
            description,
            requester:profiles!service_requests_requester_id_fkey(
              full_name,
              phone
            )
          )
        `)
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (input.startDate) {
        query = query.gte('created_at', input.startDate);
      }
      if (input.endDate) {
        query = query.lte('created_at', input.endDate);
      }
      if (input.status && input.status !== 'all') {
        query = query.eq('payment_status', input.status);
      }

      const { data: earnings, error: earningsError } = await query;

      if (earningsError) {
        console.error('[ServiceProviders] Error fetching earnings', earningsError);
        throw new Error('Failed to fetch earnings');
      }

      const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.net_amount || 0), 0) || 0;
      const pendingEarnings = earnings?.filter(e => e.payment_status === 'pending')
        .reduce((sum, e) => sum + Number(e.net_amount || 0), 0) || 0;
      const paidEarnings = earnings?.filter(e => e.payment_status === 'paid')
        .reduce((sum, e) => sum + Number(e.net_amount || 0), 0) || 0;
      const processingEarnings = earnings?.filter(e => e.payment_status === 'processing')
        .reduce((sum, e) => sum + Number(e.net_amount || 0), 0) || 0;

      console.log('[ServiceProviders] Earnings fetched', { 
        count: earnings?.length, 
        totalEarnings,
        pendingEarnings,
        paidEarnings 
      });

      return {
        earnings: earnings || [],
        summary: {
          totalEarnings,
          pendingEarnings,
          paidEarnings,
          processingEarnings,
        },
      };
    } catch (error) {
      console.error('[ServiceProviders] Error in getServiceEarnings', error);
      throw error;
    }
  });
