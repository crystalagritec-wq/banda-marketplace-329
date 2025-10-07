import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getServiceRequestsProcedure = protectedProcedure
  .input(
    z.object({
      status: z.string().optional(),
      asProvider: z.boolean().default(false),
    })
  )
  .query(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('[getServiceRequests] Fetching requests for user:', userId);

    let query = supabase.from('service_requests').select('*');

    if (input.asProvider) {
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (providerError || !provider) {
        console.error('[getServiceRequests] Provider not found:', providerError);
        throw new Error('Service provider profile not found');
      }

      query = query.eq('provider_id', provider.id);
    } else {
      query = query.eq('requester_id', userId);
    }

    if (input.status) {
      query = query.eq('status', input.status);
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[getServiceRequests] Error fetching requests:', error);
      throw new Error('Failed to fetch service requests');
    }

    console.log('[getServiceRequests] Found requests:', requests?.length || 0);

    return {
      requests: requests || [],
    };
  });
