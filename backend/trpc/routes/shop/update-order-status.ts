import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const updateVendorOrderStatusProcedure = protectedProcedure
  .input(z.object({
    orderId: z.string(),
    vendorId: z.string(),
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('[Update Order Status] Updating order:', input.orderId);

    const { data: order, error: fetchError } = await ctx.supabase
      .from('orders')
      .select('*')
      .eq('id', input.orderId)
      .eq('seller_id', input.vendorId)
      .single();

    if (fetchError || !order) {
      throw new Error('Order not found or unauthorized');
    }

    const { data: updatedOrder, error: updateError } = await ctx.supabase
      .from('orders')
      .update({
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.orderId)
      .select()
      .single();

    if (updateError) {
      console.error('[Update Order Status] Error updating order:', updateError);
      throw new Error('Failed to update order status');
    }

    if (input.notes) {
      await ctx.supabase
        .from('order_status_history')
        .insert({
          order_id: input.orderId,
          status: input.status,
          notes: input.notes,
          created_by: input.vendorId,
        });
    }

    await ctx.supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        title: 'Order Status Updated',
        message: `Your order #${input.orderId.slice(0, 8)} is now ${input.status}`,
        type: 'order_update',
        data: { orderId: input.orderId, status: input.status },
      });

    return { order: updatedOrder };
  });
