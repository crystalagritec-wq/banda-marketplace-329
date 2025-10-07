import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { generateWalletDisplayId } from "@/utils/wallet-id-generator";

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

    const displayId = generateWalletDisplayId();
    
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

    const { error: updateError } = await ctx.supabase
      .from("agripay_wallets")
      .update({ display_id: displayId })
      .eq("id", wallet.id);

    if (updateError) {
      console.error("Error updating wallet display_id:", updateError);
    }

    const { error: linkError } = await ctx.supabase.rpc("link_wallet_to_user", {
      p_user_id: input.userId,
      p_wallet_id: wallet.id,
    });

    if (linkError) {
      console.error("Error linking wallet to user:", linkError);
    }

    return {
      success: true,
      wallet: { ...wallet, display_id: displayId },
      message: "Wallet created successfully",
    };
  });
