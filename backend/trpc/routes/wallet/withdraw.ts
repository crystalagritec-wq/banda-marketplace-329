import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import bcrypt from 'bcryptjs';

export const walletWithdrawProcedure = protectedProcedure
  .input(
    z.object({
      amount: z.number().min(1, 'Amount must be greater than 0'),
      recipient: z.string().min(1, 'Recipient is required'),
      pin: z.string().length(4, 'PIN must be 4 digits'),
      withdrawalMethod: z.enum(['mpesa', 'bank_transfer']).default('mpesa'),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    const { amount, recipient, pin, withdrawalMethod } = input;
    const userId = ctx.user.id;

    console.log('💸 Processing wallet withdrawal:', {
      userId,
      amount,
      recipient,
      withdrawalMethod,
    });

    try {
      const { data: pinData, error: pinError } = await ctx.supabase
        .from('wallet_pins')
        .select('pin_hash')
        .eq('user_id', userId)
        .single();

      if (pinError || !pinData) {
        throw new Error('Wallet PIN not set. Please create a PIN first.');
      }

      const isPinValid = await bcrypt.compare(pin, pinData.pin_hash);
      if (!isPinValid) {
        throw new Error('Invalid PIN. Please try again.');
      }

      const { data: transactionId, error } = await ctx.supabase.rpc('process_withdrawal', {
        p_user_id: userId,
        p_amount: amount,
        p_recipient: recipient,
        p_withdrawal_method: withdrawalMethod,
      });

      if (error) {
        console.error('❌ Withdrawal processing error:', error);
        throw new Error(error.message || 'Failed to process withdrawal');
      }

      console.log('✅ Withdrawal processed successfully:', transactionId);

      if (withdrawalMethod === 'mpesa') {
        console.log('📱 Processing M-Pesa withdrawal to:', recipient);
        
        return {
          success: true,
          transactionId,
          message: `KSh ${amount.toLocaleString()} withdrawal to ${recipient} is being processed`,
          method: 'mpesa',
          amount,
          recipient,
          status: 'processing',
          estimatedTime: '5-10 minutes',
        };
      }

      return {
        success: true,
        transactionId,
        message: `KSh ${amount.toLocaleString()} bank transfer initiated`,
        method: 'bank_transfer',
        amount,
        recipient,
        status: 'processing',
        estimatedTime: '1-2 business days',
      };

    } catch (error) {
      console.error('❌ Wallet withdrawal error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process withdrawal');
    }
  });