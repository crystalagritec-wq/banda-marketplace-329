import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const holdReserveProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string().min(1, 'Order ID is required'),
      amount: z.number().min(1, 'Amount must be greater than 0'),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { orderId, amount, description } = input;
    const userId = ctx.user.id;

    console.log('🔒 Holding reserve for order:', {
      userId,
      orderId,
      amount,
    });

    try {
      const { data: transactionId, error } = await ctx.supabase.rpc('hold_reserve', {
        p_user_id: userId,
        p_order_id: orderId,
        p_amount: amount,
        p_description: description || `Reserve hold for order ${orderId}`,
      });

      if (error) {
        console.error('❌ Reserve hold error:', error);
        throw new Error(error.message || 'Failed to hold reserve');
      }

      console.log('✅ Reserve held successfully:', transactionId);

      return {
        success: true,
        transactionId,
        message: `KSh ${amount.toLocaleString()} held in reserve for order`,
        orderId,
        amount,
        status: 'held',
      };

    } catch (error) {
      console.error('❌ Hold reserve error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to hold reserve');
    }
  });
