import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const fundWalletProcedure = protectedProcedure
  .input(
    z.object({
      walletId: z.string().uuid(),
      amount: z.number().positive(),
      paymentMethod: z.object({
        type: z.enum(["mpesa", "bank", "card", "airtel", "paypal", "crypto"]),
        details: z.record(z.string(), z.any()),
      }),
      externalTransactionId: z.string().optional(),
      externalProvider: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: wallet, error: walletError } = await ctx.supabase
      .from("agripay_wallets")
      .select("*")
      .eq("id", input.walletId)
      .single();

    if (walletError || !wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.status !== "active") {
      throw new Error("Wallet is not active");
    }

    const balanceBefore = parseFloat(wallet.balance.toString());
    const reserveBefore = parseFloat(wallet.reserve_balance.toString());
    const balanceAfter = balanceBefore + input.amount;

    const { data: transaction, error: txError } = await ctx.supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: input.walletId,
        type: "deposit",
        amount: input.amount,
        currency: "KES",
        status: "completed",
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reserve_before: reserveBefore,
        reserve_after: reserveBefore,
        payment_method: input.paymentMethod,
        external_transaction_id: input.externalTransactionId,
        external_provider: input.externalProvider,
        description: `Deposit via ${input.paymentMethod.type}`,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single() as { data: any; error: any };

    if (txError) {
      console.error("Error creating transaction:", txError);
      throw new Error("Failed to create transaction");
    }

    const { error: updateError } = await ctx.supabase
      .from("agripay_wallets")
      .update({
        balance: balanceAfter,
        last_transaction_at: new Date().toISOString(),
      })
      .eq("id", input.walletId);

    if (updateError) {
      console.error("Error updating wallet:", updateError);
      throw new Error("Failed to update wallet balance");
    }

    return {
      success: true,
      transaction,
      newBalance: balanceAfter,
      message: "Funds added successfully",
    };
  });
