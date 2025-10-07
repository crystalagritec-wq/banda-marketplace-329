import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const refundReserveProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string().min(1, 'Order ID is required'),
      amount: z.number().min(1, 'Amount must be greater than 0'),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { orderId, amount, reason } = input;
    const userId = ctx.user.id;

    console.log('↩️ Refunding reserve for order:', {
      userId,
      orderId,
      amount,
      reason,
    });

    try {
      const { data: transactionId, error } = await ctx.supabase.rpc('refund_reserve', {
        p_user_id: userId,
        p_order_id: orderId,
        p_amount: amount,
        p_reason: reason || `Order ${orderId} cancelled - Reserve refunded`,
      });

      if (error) {
        console.error('❌ Reserve refund error:', error);
        throw new Error(error.message || 'Failed to refund reserve');
      }

      console.log('✅ Reserve refunded successfully:', transactionId);

      return {
        success: true,
        transactionId,
        message: `KSh ${amount.toLocaleString()} refunded to your wallet`,
        orderId,
        amount,
        status: 'refunded',
      };

    } catch (error) {
      console.error('❌ Refund reserve error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to refund reserve');
    }
  });
