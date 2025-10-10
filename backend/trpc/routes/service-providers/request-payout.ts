import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const requestPayoutProcedure = protectedProcedure
  .input(
    z.object({
      amount: z.number().positive(),
      paymentMethod: z.enum(['mpesa', 'bank', 'wallet']),
      paymentDetails: z.object({
        phoneNumber: z.string().optional(),
        accountNumber: z.string().optional(),
        bankName: z.string().optional(),
      }).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      console.log('[ServiceProviders] Requesting payout', { userId: ctx.user.id, amount: input.amount });

      const { data: provider, error: providerError } = await ctx.supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', ctx.user.id)
        .single();

      if (providerError || !provider) {
        throw new Error('Service provider not found');
      }

      const { data: earnings, error: earningsError } = await ctx.supabase
        .from('service_provider_earnings')
        .select('net_amount')
        .eq('provider_id', provider.id)
        .eq('payment_status', 'pending');

      if (earningsError) {
        throw new Error('Failed to fetch pending earnings');
      }

      const availableBalance = earnings?.reduce((sum, e) => sum + Number(e.net_amount || 0), 0) || 0;

      if (input.amount > availableBalance) {
        throw new Error('Insufficient balance for payout');
      }

      const { error: payoutError } = await ctx.supabase
        .from('service_provider_payouts')
        .insert({
          provider_id: provider.id,
          amount: input.amount,
          payment_method: input.paymentMethod,
          payment_details: input.paymentDetails,
          status: 'pending',
          requested_at: new Date().toISOString(),
        });

      if (payoutError) {
        console.error('[ServiceProviders] Error creating payout request', payoutError);
        throw new Error('Failed to create payout request');
      }

      console.log('[ServiceProviders] Payout requested successfully');

      return { success: true, message: 'Payout request submitted successfully' };
    } catch (error) {
      console.error('[ServiceProviders] Error in requestPayout', error);
      throw error;
    }
  });
