import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const processAgriPayPaymentProcedure = publicProcedure
  .input(z.object({
    userId: z.string().uuid(),
    orderId: z.string(),
    amount: z.number().positive(),
    sellerId: z.string().uuid(),
    driverId: z.string().uuid().optional(),
    sellerAmount: z.number().positive(),
    driverAmount: z.number().default(0),
    platformFee: z.number().default(0),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('[AgriPay Payment] Processing payment for order:', input.orderId);

    const { data: buyerWallet, error: buyerWalletError } = await ctx.supabase
      .from('agripay_wallets')
      .select('*')
      .eq('user_id', input.userId)
      .single();

    if (buyerWalletError || !buyerWallet) {
      throw new Error('Buyer wallet not found');
    }

    if (buyerWallet.status !== 'active') {
      throw new Error('Buyer wallet is not active');
    }

    const currentBalance = parseFloat(buyerWallet.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error(`Insufficient balance. Available: KSh ${currentBalance}, Required: KSh ${input.amount}`);
    }

    const { data: sellerWallet, error: sellerWalletError } = await ctx.supabase
      .from('agripay_wallets')
      .select('*')
      .eq('user_id', input.sellerId)
      .single();

    if (sellerWalletError || !sellerWallet) {
      throw new Error('Seller wallet not found');
    }

    let driverWallet = null;
    if (input.driverId) {
      const { data, error } = await ctx.supabase
        .from('agripay_wallets')
        .select('*')
        .eq('user_id', input.driverId)
        .single();

      if (!error && data) {
        driverWallet = data;
      }
    }

    const { data: reserveId, error: reserveError } = await ctx.supabase.rpc('hold_reserve', {
      p_buyer_wallet_id: buyerWallet.id,
      p_seller_wallet_id: sellerWallet.id,
      p_amount: input.amount,
      p_reference_type: 'order',
      p_reference_id: input.orderId,
    });

    if (reserveError) {
      console.error('[AgriPay Payment] Reserve hold error:', reserveError);
      throw new Error(reserveError.message || 'Failed to hold reserve');
    }

    if (driverWallet && input.driverAmount > 0) {
      const { error: updateError } = await ctx.supabase
        .from('tradeguard_reserves')
        .update({
          driver_id: input.driverId,
          driver_wallet_id: driverWallet.id,
          driver_amount: input.driverAmount,
          seller_amount: input.sellerAmount,
          platform_fee: input.platformFee,
        })
        .eq('id', reserveId);

      if (updateError) {
        console.error('[AgriPay Payment] Driver update error:', updateError);
      }
    }

    const { data: reserve, error: fetchError } = await ctx.supabase
      .from('tradeguard_reserves')
      .select('*')
      .eq('id', reserveId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch reserve details');
    }

    const { error: orderUpdateError } = await ctx.supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_method: 'agripay',
        tradeguard_reserve_id: reserveId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.orderId);

    if (orderUpdateError) {
      console.error('[AgriPay Payment] Order update error:', orderUpdateError);
    }

    console.log('[AgriPay Payment] ✅ Payment processed successfully');

    return {
      success: true,
      reserveId,
      reserve,
      message: 'Payment processed and funds secured in TradeGuard',
      newBalance: currentBalance - input.amount,
    };
  });
