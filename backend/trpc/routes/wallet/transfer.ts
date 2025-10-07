import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import bcrypt from 'bcryptjs';

export const walletTransferProcedure = protectedProcedure
  .input(
    z.object({
      fromAccount: z.enum(['trading', 'savings']),
      toAccount: z.enum(['trading', 'savings']),
      amount: z.number().min(1, 'Amount must be greater than 0'),
      pin: z.string().length(4, 'PIN must be 4 digits'),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    const { fromAccount, toAccount, amount, pin } = input;
    const userId = ctx.user.id;

    console.log('🔄 Processing account transfer:', {
      userId,
      fromAccount,
      toAccount,
      amount,
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

      if (fromAccount === toAccount) {
        throw new Error('Cannot transfer to the same account');
      }

      const { data: transactionId, error } = await ctx.supabase.rpc('internal_transfer', {
        p_user_id: userId,
        p_from_account: fromAccount,
        p_to_account: toAccount,
        p_amount: amount,
      });

      if (error) {
        console.error('❌ Transfer processing error:', error);
        throw new Error(error.message || 'Failed to process transfer');
      }

      console.log('✅ Transfer completed:', transactionId);

      const { data: walletData } = await ctx.supabase.rpc('get_user_wallet', {
        p_user_id: userId
      });

      const newBalances = walletData && walletData[0] ? {
        trading: parseFloat(walletData[0].trading_balance),
        savings: parseFloat(walletData[0].savings_balance),
      } : { trading: 0, savings: 0 };

      return {
        success: true,
        transactionId,
        message: `KSh ${amount.toLocaleString()} transferred from ${fromAccount} to ${toAccount}`,
        fromAccount,
        toAccount,
        amount,
        status: 'completed',
        newBalances,
      };

    } catch (error) {
      console.error('❌ Account transfer error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process transfer');
    }
  });