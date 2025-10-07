import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const withdrawFundsProcedure = protectedProcedure
  .input(
    z.object({
      walletId: z.string().uuid(),
      amount: z.number().positive(),
      payoutMethod: z.enum(["mpesa", "bank", "card"]),
      payoutDetails: z.object({
        phoneNumber: z.string().optional(),
        accountNumber: z.string().optional(),
        bankCode: z.string().optional(),
        accountName: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: wallet, error: walletError } = await ctx.supabase
      .from("agripay_wallets")
      .select("*")
      .eq("id", input.walletId)
      .eq("user_id", ctx.user.id)
      .single();

    if (walletError || !wallet) {
      throw new Error("Wallet not found or unauthorized access");
    }

    if (wallet.status !== "active") {
      throw new Error("Wallet is not active");
    }

    const currentBalance = parseFloat(wallet.balance.toString());

    if (currentBalance < input.amount) {
      throw new Error("Insufficient balance");
    }

    const fee = input.amount * 0.01;
    const netAmount = input.amount - fee;

    const { data: payoutRequest, error: payoutError } = await ctx.supabase
      .from("payout_requests")
      .insert({
        wallet_id: input.walletId,
        user_id: wallet.user_id,
        amount: input.amount,
        fee,
        net_amount: netAmount,
        payout_method: input.payoutMethod,
        payout_details: input.payoutDetails,
        status: "pending",
      })
      .select()
      .single();

    if (payoutError) {
      console.error("Error creating payout request:", payoutError);
      throw new Error("Failed to create payout request");
    }

    const balanceBefore = currentBalance;
    const balanceAfter = currentBalance - input.amount;
    const reserveBefore = parseFloat(wallet.reserve_balance.toString());

    const { data: transaction, error: txError } = await ctx.supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: input.walletId,
        type: "withdrawal",
        amount: input.amount,
        status: "pending",
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reserve_before: reserveBefore,
        reserve_after: reserveBefore,
        payment_method: {
          type: input.payoutMethod,
          details: input.payoutDetails,
        },
        description: `Withdrawal to ${input.payoutMethod}`,
        created_by: ctx.user.id,
        metadata: {
          payout_request_id: payoutRequest.id,
          fee,
          net_amount: netAmount,
          user_id: ctx.user.id,
          wallet_id: input.walletId,
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (txError) {
      console.error("Error creating transaction:", txError);
      throw new Error("Failed to create transaction");
    }

    const { error: updateError } = await ctx.supabase
      .from("agripay_wallets")
      .update({
        balance: balanceAfter,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.walletId)
      .eq("user_id", ctx.user.id);

    if (updateError) {
      console.error("Error updating wallet:", updateError);
      throw new Error("Failed to update wallet balance");
    }

    return {
      success: true,
      payoutRequest,
      transaction,
      newBalance: balanceAfter,
      message: "Withdrawal request submitted",
    };
  });
