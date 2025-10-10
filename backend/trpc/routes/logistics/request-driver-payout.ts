import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const requestDriverPayoutProcedure = protectedProcedure
  .input(z.object({
    driverId: z.string(),
    amount: z.number().positive(),
    paymentMethod: z.enum(['mpesa', 'bank_transfer', 'agripay_wallet']),
    accountDetails: z.object({
      phoneNumber: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      accountName: z.string().optional(),
    }).optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('💸 Processing driver payout request:', input);

      const { data: pendingEarnings, error: earningsError } = await supabase
        .from('logistics_payouts')
        .select(`
          *,
          logistics_assignments!inner(driver_id)
        `)
        .eq('logistics_assignments.driver_id', input.driverId)
        .eq('status', 'pending');

      if (earningsError) {
        console.error('❌ Error fetching pending earnings:', earningsError);
        throw new Error(`Failed to fetch pending earnings: ${earningsError.message}`);
      }

      const totalPending = pendingEarnings?.reduce((sum, payout) => sum + (payout.net_amount || 0), 0) || 0;

      if (input.amount > totalPending) {
        throw new Error(`Requested amount (${input.amount}) exceeds available balance (${totalPending})`);
      }

      const minPayout = 100;
      if (input.amount < minPayout) {
        throw new Error(`Minimum payout amount is KES ${minPayout}`);
      }

      const { data: withdrawalRequest, error: withdrawalError } = await supabase
        .from('logistics_withdrawal_requests')
        .insert({
          driver_id: input.driverId,
          amount: input.amount,
          payment_method: input.paymentMethod,
          account_details: input.accountDetails,
          status: 'pending',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (withdrawalError) {
        console.error('❌ Error creating withdrawal request:', withdrawalError);
        throw new Error(`Failed to create withdrawal request: ${withdrawalError.message}`);
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: input.driverId,
          type: 'payout_requested',
          title: 'Payout Request Submitted',
          message: `Your payout request for KES ${input.amount} has been submitted and is being processed.`,
          data: {
            withdrawalId: withdrawalRequest.id,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
          },
        });

      if (notificationError) {
        console.warn('⚠️ Failed to send notification:', notificationError);
      }

      console.log('✅ Payout request created successfully:', withdrawalRequest.id);

      return {
        success: true,
        message: 'Payout request submitted successfully',
        withdrawalId: withdrawalRequest.id,
        amount: input.amount,
        estimatedProcessingTime: '1-3 business days',
      };
    } catch (error: any) {
      console.error('❌ Error in requestDriverPayoutProcedure:', error);
      throw new Error(error.message || 'Failed to process payout request');
    }
  });
