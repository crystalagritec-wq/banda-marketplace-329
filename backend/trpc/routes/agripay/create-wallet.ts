import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const createWalletProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: existingWallet } = await ctx.supabase
      .from("agripay_wallets")
      .select("*")
      .eq("user_id", input.userId)
      .single();

    if (existingWallet) {
      return {
        success: true,
        wallet: existingWallet,
        message: "Wallet already exists",
      };
    }

    const { data, error } = await ctx.supabase.rpc("create_agripay_wallet", {
      p_user_id: input.userId,
    });

    if (error) {
      console.error("Error creating wallet:", error);
      throw new Error("Failed to create wallet");
    }

    const { data: wallet, error: fetchError } = await ctx.supabase
      .from("agripay_wallets")
      .select("*")
      .eq("id", data)
      .single();

    if (fetchError) {
      throw new Error("Failed to fetch created wallet");
    }

    return {
      success: true,
      wallet,
      message: "Wallet created successfully",
    };
  });
