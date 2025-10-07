import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const fundWalletProcedure = protectedProcedure
  .input(
    z.object({
      walletId: z.string().uuid(),
      amount: z.number().positive(),
      paymentMethod: z.object({
        type: z.enum(["mpesa", "bank", "card", "airtel", "paypal", "crypto"]),
        details: z.record(z.string(), z.unknown()),
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

    if ((wallet as any).status !== "active") {
      throw new Error("Wallet is not active");
    }

    const balanceBefore = parseFloat(String((wallet as any).balance ?? 0));
    const reserveBefore = parseFloat(String((wallet as any).reserve_balance ?? 0));
    const balanceAfter = balanceBefore + input.amount;

    const insertPayload = {
      wallet_id: input.walletId,
      type: "deposit",
      amount: input.amount,
      currency: "KES",
      status: "completed",
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reserve_before: reserveBefore,
      reserve_after: reserveBefore,
      payment_method: input.paymentMethod as unknown as Record<string, unknown>,
      external_transaction_id: input.externalTransactionId,
      external_provider: input.externalProvider,
      description: `Deposit via ${input.paymentMethod.type}`,
      completed_at: new Date().toISOString(),
    } as const;

    const { data: transactions, error: txError } = await ctx.supabase
      .from("wallet_transactions")
      .insert(insertPayload)
      .select("*");

    if (txError) {
      console.error("Error creating transaction:", txError);
      throw new Error("Failed to create transaction");
    }

    const transaction = Array.isArray(transactions) ? transactions[0] : transactions;

    const { error: updateError } = await ctx.supabase
      .from("agripay_wallets")
      .update({
        balance: balanceAfter,
        last_transaction_at: new Date().toISOString(),
      } as Record<string, unknown>)
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
    } as const;
  });
