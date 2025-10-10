import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const getServiceRequestsEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled']).optional().default('all'),
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      console.log('[ServiceProviders] Fetching service requests', { userId: ctx.user.id, input });

      const { data: provider, error: providerError } = await ctx.supabase
        .from('service_providers')
        .select('id, user_id, service_category, status')
        .eq('user_id', ctx.user.id)
        .single();

      if (providerError || !provider) {
        console.error('[ServiceProviders] Provider not found', providerError);
        return {
          requests: [],
          total: 0,
          hasMore: false,
        };
      }

      let query = ctx.supabase
        .from('service_requests')
        .select(`
          *,
          requester:profiles!service_requests_requester_id_fkey(
            id,
            full_name,
            phone,
            avatar_url,
            location
          )
        `, { count: 'exact' })
        .eq('provider_id', provider.id as string)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.status && input.status !== 'all') {
        query = query.eq('status', input.status);
      }

      const { data: requests, error: requestsError, count } = await query;

      if (requestsError) {
        console.error('[ServiceProviders] Error fetching requests', requestsError);
        throw new Error('Failed to fetch service requests');
      }

      console.log('[ServiceProviders] Fetched requests', { count: requests?.length, total: count });

      return {
        requests: requests || [],
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      };
    } catch (error) {
      console.error('[ServiceProviders] Error in getServiceRequestsEnhanced', error);
      throw error;
    }
  });
