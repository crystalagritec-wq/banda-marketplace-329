import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getSpecializationsProcedure = protectedProcedure
  .input(
    z.object({
      providerId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('[getSpecializations] Fetching specializations for user:', userId);

    let providerId = input.providerId;

    if (!providerId) {
      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (providerError || !provider) {
        console.error('[getSpecializations] Provider not found:', providerError);
        throw new Error('Service provider profile not found');
      }

      providerId = provider.id;
    }

    const { data: specializations, error } = await supabase
      .from('service_specializations')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getSpecializations] Error fetching specializations:', error);
      throw new Error('Failed to fetch specializations');
    }

    console.log('[getSpecializations] Found specializations:', specializations?.length || 0);

    return {
      specializations: specializations || [],
    };
  });
