import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const updateRequestStatusProcedure = protectedProcedure
  .input(
    z.object({
      requestId: z.string().uuid(),
      status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed']),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
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

    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', input.requestId)
      .eq('provider_id', serviceProvider.id)
      .single();

    if (requestError || !request) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Service request not found or you do not have permission to update it',
      });
    }

    const updateData: any = {
      status: input.status,
      updated_at: new Date().toISOString(),
    };

    if (input.status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    } else if (input.status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (input.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.payment_status = 'released';
    } else if (input.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.payment_status = 'refunded';
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', input.requestId)
      .select()
      .single();

    if (updateError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update request status',
      });
    }

    if (input.status === 'completed') {
      await supabase.from('logistics_earnings').insert({
        user_id: user.id,
        role: 'driver',
        delivery_id: input.requestId,
        amount: request.final_price || request.quoted_price || 0,
        type: 'delivery',
        status: 'pending',
      });
    }

    console.log(`Service request ${input.requestId} status updated to ${input.status}`);

    return {
      success: true,
      request: updatedRequest,
    };
  });
