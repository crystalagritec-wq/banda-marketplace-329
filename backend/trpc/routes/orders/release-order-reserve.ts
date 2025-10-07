import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const releaseOrderReserveProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
      userId: z.string().uuid(),
      releaseReason: z.string().optional().default("Order delivered successfully"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    console.log("🔓 Releasing reserve for order:", input.orderId);

    const { data: reserve, error: reserveError } = await ctx.supabase
      .from("tradeguard_reserves")
      .select("*")
      .eq("reference_id", input.orderId)
      .eq("reference_type", "order")
      .eq("status", "held")
      .single();

    if (reserveError || !reserve) {
      console.error("❌ Reserve not found:", reserveError);
      throw new Error("Reserve not found or already released");
    }

    const { error: releaseError } = await ctx.supabase.rpc("release_reserve", {
      p_reserve_id: reserve.id,
      p_released_by: input.userId,
    });

    if (releaseError) {
      console.error("❌ Failed to release reserve:", releaseError);
      throw new Error(releaseError.message || "Failed to release reserve");
    }

    await ctx.supabase
      .from("tradeguard_reserves")
      .update({
        release_reason: input.releaseReason,
      })
      .eq("id", reserve.id);

    await ctx.supabase
      .from("orders")
      .update({
        payment_status: "completed",
        status: "delivered",
      })
      .eq("id", input.orderId);

    console.log("✅ Reserve released successfully for order:", input.orderId);

    return {
      success: true,
      message: "Funds released to seller",
      reserveId: reserve.id,
    };
  });
