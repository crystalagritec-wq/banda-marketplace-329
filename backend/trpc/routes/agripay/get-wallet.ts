import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const getWalletProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { data: wallet, error } = await ctx.supabase
      .from("agripay_wallets")
      .select("*")
      .eq("user_id", input.userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          wallet: null,
          message: "Wallet not found",
        };
      }
      console.error("Error fetching wallet:", error);
      throw new Error("Failed to fetch wallet");
    }

    const { data: trustScore } = await ctx.supabase
      .from("user_trust_scores")
      .select("*")
      .eq("user_id", input.userId)
      .single();

    return {
      success: true,
      wallet,
      trustScore,
    };
  });
