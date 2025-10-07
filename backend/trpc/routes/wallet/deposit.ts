import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const walletDepositProcedure = protectedProcedure
  .input(
    z.object({
      amount: z.number().min(1, 'Amount must be greater than 0'),
      paymentMethod: z.enum(['mpesa', 'bank_transfer', 'card']),
      phoneNumber: z.string().optional(),
      externalRef: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    const { amount, paymentMethod, phoneNumber, externalRef } = input;
    const userId = ctx.user.id;

    console.log('💰 Processing wallet deposit:', {
      userId,
      amount,
      paymentMethod,
      phoneNumber,
    });

    try {
      if (paymentMethod === 'mpesa' && phoneNumber) {
        console.log('📱 Initiating M-Pesa STK push to:', phoneNumber);
        
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await ctx.supabase
          .from('wallet_transactions')
          .insert({
            user_id: userId,
            transaction_id: transactionId,
            type: 'deposit',
            amount,
            balance_type: 'trading',
            status: 'pending',
            payment_method: paymentMethod,
            reference_id: externalRef || null,
            description: `Deposit via ${paymentMethod}`,
          });
        
        return {
          success: true,
          transactionId,
          message: 'M-Pesa payment request sent to your phone',
          paymentMethod: 'mpesa',
          amount,
          status: 'pending',
        };
      }

      const { data, error } = await ctx.supabase.rpc('process_deposit', {
        p_user_id: userId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_external_ref: externalRef || null,
      });

      if (error) {
        console.error('❌ Deposit processing error:', error);
        throw new Error('Failed to process deposit');
      }

      console.log('✅ Deposit processed successfully:', data);

      return {
        success: true,
        transactionId: data,
        message: `Deposit of KSh ${amount.toLocaleString()} completed successfully`,
        paymentMethod,
        amount,
        status: 'completed',
      };

    } catch (error) {
      console.error('❌ Wallet deposit error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process deposit');
    }
  });