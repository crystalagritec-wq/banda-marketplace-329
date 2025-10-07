import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import crypto from "crypto";

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
}

export const verifyPinProcedure = protectedProcedure
  .input(
    z.object({
      walletId: z.string().uuid(),
      pin: z.string().length(4).regex(/^\d{4}$/),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: wallet, error } = await ctx.supabase
      .from("agripay_wallets")
      .select("pin_hash")
      .eq("id", input.walletId)
      .single();

    if (error || !wallet) {
      throw new Error("Wallet not found");
    }

    if (!wallet.pin_hash) {
      throw new Error("PIN not set");
    }

    const pinHash = hashPin(input.pin);
    const isValid = pinHash === wallet.pin_hash;

    return {
      success: true,
      valid: isValid,
      message: isValid ? "PIN verified" : "Invalid PIN",
    };
  });
