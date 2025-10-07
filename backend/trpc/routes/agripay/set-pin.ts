import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import crypto from "crypto";

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

export const setPinProcedure = protectedProcedure
  .input(
    z.object({
      walletId: z.string().uuid(),
      pin: z.string().length(4).regex(/^\d{4}$/),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const pinHash = hashPin(input.pin);

    const { error } = await ctx.supabase
      .from("agripay_wallets")
      .update({
        pin_hash: pinHash,
      })
      .eq("id", input.walletId);

    if (error) {
      console.error("Error setting PIN:", error);
      throw new Error("Failed to set PIN");
    }

    return {
      success: true,
      message: "PIN set successfully",
    };
  });
