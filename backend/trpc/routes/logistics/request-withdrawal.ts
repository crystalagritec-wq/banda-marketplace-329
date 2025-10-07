import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const requestWithdrawalProcedure = protectedProcedure
  .input(z.object({
    providerId: z.string(),
    amount: z.number().min(1),
    paymentMethod: z.enum(['mpesa', 'bank_transfer', 'paypal']),
    accountDetails: z.object({
      accountNumber: z.string(),
      accountName: z.string().optional(),
      bankCode: z.string().optional()
    })
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('💸 Processing withdrawal request for provider:', input.providerId);

      // Check provider's available balance
      const { data: payouts, error: payoutsError } = await supabase
        .from('logistics_payouts')
        .select('id, net_amount, status')
        .eq('provider_id', input.providerId)
        .eq('status', 'pending');

      if (payoutsError) {
        throw new Error(`Failed to fetch balance: ${payoutsError.message}`);
      }

      const availableBalance = payouts?.reduce((sum, p) => sum + Number(p.net_amount), 0) || 0;

      if (availableBalance < input.amount) {
        throw new Error(`Insufficient balance. Available: KSh ${availableBalance.toFixed(2)}, Requested: KSh ${input.amount.toFixed(2)}`);
      }

      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('logistics_withdrawals')
        .insert([{
          provider_id: input.providerId,
          amount: input.amount,
          payment_method: input.paymentMethod,
          account_details: input.accountDetails,
          status: 'pending',
          requested_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (withdrawalError) {
        throw new Error(`Failed to create withdrawal request: ${withdrawalError.message}`);
      }

      // Mark corresponding payouts as 'processing'
      let remainingAmount = input.amount;
      const payoutsToUpdate = [];

      for (const payout of payouts) {
        if (remainingAmount <= 0) break;
        
        const payoutAmount = Number(payout.net_amount);
        if (payoutAmount <= remainingAmount) {
          payoutsToUpdate.push(payout);
          remainingAmount -= payoutAmount;
        }
      }

      if (payoutsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('logistics_payouts')
          .update({ status: 'processing' })
          .in('id', payoutsToUpdate.map(p => p.id));

        if (updateError) {
          console.warn('⚠️ Warning: Failed to update payout status:', updateError);
        }
      }

      return {
        success: true,
        withdrawalId: withdrawal.id,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        status: 'pending',
        message: 'Withdrawal request submitted successfully. Processing time: 1-3 business days.',
        estimatedProcessingTime: '1-3 business days'
      };
    } catch (error: any) {
      console.error('❌ Error in requestWithdrawalProcedure:', error);
      throw new Error(error.message || 'Failed to process withdrawal request');
    }
  });