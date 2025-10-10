import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const updateRequestStatusEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      requestId: z.string().uuid(),
      status: z.enum(['accepted', 'in_progress', 'completed', 'cancelled']),
      notes: z.string().optional(),
      completionDetails: z.object({
        workDone: z.string().optional(),
        materialsUsed: z.string().optional(),
        recommendations: z.string().optional(),
      }).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      console.log('[ServiceProviders] Updating request status', { requestId: input.requestId, status: input.status });

      const { data: provider, error: providerError } = await ctx.supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single();

      if (providerError || !provider) {
        throw new Error('Service provider not found');
      }

      const { data: request, error: requestError } = await ctx.supabase
        .from('service_requests')
        .select('*')
        .eq('id', input.requestId)
        .eq('provider_id', provider.id)
        .single();

      if (requestError || !request) {
        throw new Error('Service request not found or unauthorized');
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
        if (input.completionDetails) {
          updateData.completion_notes = JSON.stringify(input.completionDetails);
        }
      } else if (input.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        if (input.notes) {
          updateData.cancellation_reason = input.notes;
        }
      }

      const { error: updateError } = await ctx.supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', input.requestId);

      if (updateError) {
        console.error('[ServiceProviders] Error updating request', updateError);
        throw new Error('Failed to update request status');
      }

      if (input.status === 'completed' && request.service_fee) {
        const platformFee = Number(request.service_fee) * 0.05;
        const netAmount = Number(request.service_fee) - platformFee;

        const { error: earningsError } = await ctx.supabase
          .from('service_provider_earnings')
          .insert({
            provider_id: provider.id,
            request_id: input.requestId,
            gross_amount: request.service_fee,
            platform_fee: platformFee,
            net_amount: netAmount,
            payment_status: 'pending',
          });

        if (earningsError) {
          console.error('[ServiceProviders] Error creating earnings record', earningsError);
        }
      }

      const { error: notificationError } = await ctx.supabase
        .from('notifications')
        .insert({
          user_id: request.requester_id,
          title: `Service Request ${input.status}`,
          message: `Your service request has been ${input.status}`,
          type: 'service_update',
          data: { requestId: input.requestId, status: input.status },
        });

      if (notificationError) {
        console.error('[ServiceProviders] Error creating notification', notificationError);
      }

      console.log('[ServiceProviders] Request status updated successfully');

      return { success: true };
    } catch (error) {
      console.error('[ServiceProviders] Error in updateRequestStatus', error);
      throw error;
    }
  });
