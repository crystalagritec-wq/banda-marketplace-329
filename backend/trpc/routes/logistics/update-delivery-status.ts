import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const updateDeliveryStatusProcedure = protectedProcedure
  .input(
    z.object({
      assignmentId: z.string().uuid(),
      status: z.enum(['pending', 'assigned', 'in_progress', 'delivered', 'cancelled']),
      notes: z.string().optional(),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const { data: provider, error: providerError } = await supabase
      .from('logistics_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Logistics provider profile not found',
      });
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('logistics_assignments')
      .select('*, order:orders(*)')
      .eq('id', input.assignmentId)
      .eq('provider_id', provider.id)
      .single();

    if (assignmentError || !assignment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Delivery assignment not found or you do not have permission to update it',
      });
    }

    const updateData: any = {
      status: input.status,
      updated_at: new Date().toISOString(),
    };

    if (input.notes) {
      updateData.notes = input.notes;
    }

    if (input.status === 'in_progress') {
      updateData.actual_pickup_time = new Date().toISOString();
    } else if (input.status === 'delivered') {
      updateData.actual_delivery_time = new Date().toISOString();
    }

    const { data: updatedAssignment, error: updateError } = await supabase
      .from('logistics_assignments')
      .update(updateData)
      .eq('id', input.assignmentId)
      .select()
      .single();

    if (updateError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update delivery status',
      });
    }

    if (input.status === 'delivered') {
      await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          delivery_status: 'delivered',
        })
        .eq('id', assignment.order_id);

      await supabase
        .from('logistics_escrows')
        .update({ 
          status: 'released',
          released_at: new Date().toISOString(),
        })
        .eq('assignment_id', input.assignmentId);

      const deliveryFee = 200;
      const bandaFee = deliveryFee * 0.1;
      const netAmount = deliveryFee - bandaFee;

      await supabase.from('logistics_payouts').insert({
        provider_id: provider.id,
        assignment_id: input.assignmentId,
        gross_amount: deliveryFee,
        banda_fee: bandaFee,
        net_amount: netAmount,
        status: 'pending',
      });

      await supabase.from('logistics_earnings').insert({
        user_id: user.id,
        role: 'driver',
        delivery_id: input.assignmentId,
        amount: netAmount,
        type: 'delivery',
        status: 'pending',
      });
    } else if (input.status === 'cancelled') {
      await supabase
        .from('logistics_escrows')
        .update({ 
          status: 'refunded',
        })
        .eq('assignment_id', input.assignmentId);
    }

    console.log(`Delivery ${input.assignmentId} status updated to ${input.status}`);

    return {
      success: true,
      assignment: updatedAssignment,
    };
  });
