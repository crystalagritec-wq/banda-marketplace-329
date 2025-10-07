import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const updateRequestStatusProcedure = protectedProcedure
  .input(
    z.object({
      requestId: z.string(),
      status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed']),
      quotedPrice: z.number().optional(),
      finalPrice: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('[updateRequestStatus] Updating request:', input.requestId);

    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (providerError || !provider) {
      console.error('[updateRequestStatus] Provider not found:', providerError);
      throw new Error('Service provider profile not found');
    }

    const updateData: Record<string, any> = {
      status: input.status,
    };

    if (input.quotedPrice !== undefined) {
      updateData.quoted_price = input.quotedPrice;
    }

    if (input.finalPrice !== undefined) {
      updateData.final_price = input.finalPrice;
    }

    if (input.status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    } else if (input.status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (input.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (input.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data: request, error: updateError } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', input.requestId)
      .eq('provider_id', provider.id)
      .select()
      .single();

    if (updateError) {
      console.error('[updateRequestStatus] Error updating request:', updateError);
      throw new Error('Failed to update request status');
    }

    console.log('[updateRequestStatus] Request updated successfully');

    return {
      success: true,
      request,
    };
  });
