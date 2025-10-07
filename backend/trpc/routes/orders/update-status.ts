import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updateOrderStatusProcedure = protectedProcedure
  .input(z.object({
    orderId: z.string(),
    status: z.enum(['placed', 'confirmed', 'packed', 'picked_up', 'in_transit', 'delivered', 'cancelled']),
    notes: z.string().optional(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('📦 Updating order status:', input.orderId, 'to:', input.status);

    try {
      const { data, error } = await ctx.supabase.rpc('update_order_status', {
        p_order_id: input.orderId,
        p_user_id: userId,
        p_status: input.status,
        p_notes: input.notes || null,
        p_location: input.location ? JSON.stringify(input.location) : null
      });

      if (error) {
        console.error('❌ Update order status error:', error);
        throw new Error('Failed to update order status');
      }

      console.log('✅ Order status updated successfully');
      
      return {
        success: true,
        message: `Order status updated to ${input.status}`,
        data
      };

    } catch (error) {
      console.error('❌ Update order status error:', error);
      throw new Error('Failed to update order status');
    }
  });