import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const holdReserveProcedure = protectedProcedure
  .input(
    z.object({
      buyerWalletId: z.string().uuid(),
      sellerWalletId: z.string().uuid(),
      driverWalletId: z.string().uuid().optional(),
      amount: z.number().positive(),
      sellerAmount: z.number().positive(),
      driverAmount: z.number().default(0),
      platformFee: z.number().default(0),
      referenceType: z.enum(["order", "service", "delivery"]),
      referenceId: z.string(),
      autoReleaseHours: z.number().default(72),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: reserveId, error } = await ctx.supabase.rpc("hold_reserve", {
      p_buyer_wallet_id: input.buyerWalletId,
      p_seller_wallet_id: input.sellerWalletId,
      p_amount: input.amount,
      p_reference_type: input.referenceType,
      p_reference_id: input.referenceId,
    });

    if (error) {
      console.error("Error holding reserve:", error);
      throw new Error(error.message || "Failed to hold reserve");
    }

    if (input.driverWalletId && input.driverAmount > 0) {
      const { error: updateError } = await ctx.supabase
        .from("tradeguard_reserves")
        .update({
          driver_wallet_id: input.driverWalletId,
          driver_amount: input.driverAmount,
        })
        .eq("id", reserveId);

      if (updateError) {
        console.error("Error updating driver info:", updateError);
      }
    }

    const { data: reserve, error: fetchError } = await ctx.supabase
      .from("tradeguard_reserves")
      .select("*")
      .eq("id", reserveId)
      .single();

    if (fetchError) {
      throw new Error("Failed to fetch reserve details");
    }

    return {
      success: true,
      reserve,
      message: "Funds secured in TradeGuard reserve",
    };
  });
