import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const updateDeliveryStatusDriverProcedure = protectedProcedure
  .input(z.object({
    assignmentId: z.string(),
    driverId: z.string(),
    status: z.enum(['accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled']),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    notes: z.string().optional(),
    proofOfDelivery: z.object({
      imageUrl: z.string().optional(),
      signature: z.string().optional(),
      recipientName: z.string().optional(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('📦 Updating delivery status:', input);

      const { data: assignment, error: fetchError } = await supabase
        .from('logistics_assignments')
        .select('*, orders!inner(id, buyer_id, order_number)')
        .eq('id', input.assignmentId)
        .eq('driver_id', input.driverId)
        .single();

      if (fetchError || !assignment) {
        console.error('❌ Assignment not found:', fetchError);
        throw new Error('Delivery assignment not found or unauthorized');
      }

      const updateData: any = {
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      if (input.location) {
        updateData.current_location = input.location;
      }

      if (input.notes) {
        updateData.notes = input.notes;
      }

      if (input.status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (input.status === 'picked_up') {
        updateData.picked_up_at = new Date().toISOString();
      } else if (input.status === 'in_transit') {
        updateData.in_transit_at = new Date().toISOString();
      } else if (input.status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
        if (input.proofOfDelivery) {
          updateData.proof_of_delivery = input.proofOfDelivery;
        }
      }

      const { data: updatedAssignment, error: updateError } = await supabase
        .from('logistics_assignments')
        .update(updateData)
        .eq('id', input.assignmentId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating assignment:', updateError);
        throw new Error(`Failed to update delivery status: ${updateError.message}`);
      }

      if (input.status === 'delivered') {
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
          })
          .eq('id', assignment.orders.id);

        if (orderUpdateError) {
          console.warn('⚠️ Failed to update order status:', orderUpdateError);
        }

        const deliveryFee = assignment.route?.deliveryFee || 0;
        const bandaFee = deliveryFee * 0.15;
        const netAmount = deliveryFee - bandaFee;

        const { error: payoutError } = await supabase
          .from('logistics_payouts')
          .insert({
            assignment_id: input.assignmentId,
            driver_id: input.driverId,
            gross_amount: deliveryFee,
            banda_fee: bandaFee,
            net_amount: netAmount,
            status: 'pending',
          });

        if (payoutError) {
          console.warn('⚠️ Failed to create payout record:', payoutError);
        }
      }

      const statusMessages: Record<string, string> = {
        accepted: 'Delivery accepted',
        picked_up: 'Order picked up from seller',
        in_transit: 'Delivery in transit',
        delivered: 'Order delivered successfully',
        cancelled: 'Delivery cancelled',
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: assignment.orders.buyer_id,
          type: 'delivery_status_update',
          title: 'Delivery Update',
          message: `Your order #${assignment.orders.order_number}: ${statusMessages[input.status]}`,
          data: {
            orderId: assignment.orders.id,
            assignmentId: input.assignmentId,
            status: input.status,
          },
        });

      if (notificationError) {
        console.warn('⚠️ Failed to send notification:', notificationError);
      }

      console.log('✅ Delivery status updated successfully');

      return {
        success: true,
        message: statusMessages[input.status],
        assignment: updatedAssignment,
      };
    } catch (error: any) {
      console.error('❌ Error in updateDeliveryStatusDriverProcedure:', error);
      throw new Error(error.message || 'Failed to update delivery status');
    }
  });
