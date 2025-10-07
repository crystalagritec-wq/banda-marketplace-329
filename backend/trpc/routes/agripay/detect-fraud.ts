import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const detectFraudProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
      transactionType: z.enum(["deposit", "withdrawal", "payment", "transfer"]),
      amount: z.number().positive(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const anomalies: string[] = [];
    let riskScore = 0;

    const { data: wallet } = await ctx.supabase
      .from("agripay_wallets")
      .select("*")
      .eq("user_id", input.userId)
      .single();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const { data: recentTransactions } = await ctx.supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });

    // 1. Check for unusually large transaction
    if (input.amount > wallet.transaction_limit) {
      anomalies.push("Transaction exceeds limit");
      riskScore += 30;
    }

    // 2. Check for rapid successive transactions
    if (recentTransactions && recentTransactions.length > 10) {
      anomalies.push("High transaction frequency in 24h");
      riskScore += 20;
    }

    // 3. Check for multiple top-ups in short time
    const recentDeposits = recentTransactions?.filter(
      (tx) => tx.type === "deposit" && 
      new Date(tx.created_at).getTime() > Date.now() - 60 * 60 * 1000
    );

    if (recentDeposits && recentDeposits.length > 3) {
      anomalies.push("Multiple deposits in 1 hour");
      riskScore += 25;
    }

    // 4. Check for unusual withdrawal pattern
    if (input.transactionType === "withdrawal") {
      const totalWithdrawals = recentTransactions
        ?.filter((tx) => tx.type === "withdrawal")
        .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;

      if (totalWithdrawals + input.amount > wallet.daily_limit) {
        anomalies.push("Daily withdrawal limit exceeded");
        riskScore += 40;
      }
    }

    // 5. Check trust score
    const { data: trustScore } = await ctx.supabase
      .from("user_trust_scores")
      .select("*")
      .eq("user_id", input.userId)
      .single();

    if (trustScore && trustScore.trust_score < 30) {
      anomalies.push("Low trust score");
      riskScore += 15;
    }

    // 6. Check for disputed transactions
    if (trustScore && trustScore.disputed_transactions > 3) {
      anomalies.push("High dispute history");
      riskScore += 20;
    }

    // Log anomaly if detected
    if (anomalies.length > 0) {
      await ctx.supabase.from("agripay_anomalies").insert({
        user_id: input.userId,
        wallet_id: wallet.id,
        transaction_type: input.transactionType,
        amount: input.amount,
        risk_score: riskScore,
        anomalies: anomalies,
        metadata: input.metadata,
        detected_at: new Date().toISOString(),
      });

      console.log(`⚠️ Fraud detected for user ${input.userId}:`, anomalies);
    }

    return {
      isSuspicious: riskScore > 50,
      riskScore,
      anomalies,
      shouldBlock: riskScore > 80,
      shouldReview: riskScore > 50 && riskScore <= 80,
    };
  });
