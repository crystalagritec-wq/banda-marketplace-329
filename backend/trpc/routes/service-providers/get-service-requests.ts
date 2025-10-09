import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const getServiceRequestsProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed']).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const { data: serviceProvider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !serviceProvider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Service provider profile not found',
      });
    }

    let query = supabase
      .from('service_requests')
      .select(`
        *,
        requester:profiles!service_requests_requester_id_fkey (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('provider_id', serviceProvider.id)
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.status) {
      query = query.eq('status', input.status);
    }

    const { data: requests, error } = await query;

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch service requests',
      });
    }

    return requests || [];
  });
