import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const releaseReserveProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string().min(1, 'Order ID is required'),
      amount: z.number().min(1, 'Amount must be greater than 0'),
      recipientId: z.string().min(1, 'Recipient ID is required'),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { orderId, amount, recipientId, description } = input;
    const userId = ctx.user.id;

    console.log('🔓 Releasing reserve for order:', {
      userId,
      orderId,
      amount,
      recipientId,
    });

    try {
      const { data: transactionId, error } = await ctx.supabase.rpc('release_reserve', {
        p_user_id: userId,
        p_order_id: orderId,
        p_amount: amount,
        p_recipient_id: recipientId,
        p_description: description || `Reserve released - Order ${orderId} completed`,
      });

      if (error) {
        console.error('❌ Reserve release error:', error);
        throw new Error(error.message || 'Failed to release reserve');
      }

      console.log('✅ Reserve released successfully:', transactionId);

      return {
        success: true,
        transactionId,
        message: `KSh ${amount.toLocaleString()} released to seller`,
        orderId,
        amount,
        recipientId,
        status: 'released',
      };

    } catch (error) {
      console.error('❌ Release reserve error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to release reserve');
    }
  });
