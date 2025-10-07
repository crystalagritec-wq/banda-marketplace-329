import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const refundReserveProcedure = protectedProcedure
  .input(
    z.object({
      reserveId: z.string().uuid(),
      reason: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: reserve, error: fetchError } = await ctx.supabase
      .from("tradeguard_reserves")
      .select("*")
      .eq("id", input.reserveId)
      .single();

    if (fetchError || !reserve) {
      throw new Error("Reserve not found");
    }

    if (!["held", "disputed"].includes(reserve.status)) {
      throw new Error(`Reserve cannot be refunded. Current status: ${reserve.status}`);
    }

    const { error } = await ctx.supabase.rpc("refund_reserve", {
      p_reserve_id: input.reserveId,
      p_reason: input.reason,
    });

    if (error) {
      console.error("Error refunding reserve:", error);
      throw new Error(error.message || "Failed to refund reserve");
    }

    const { data: updatedReserve, error: refetchError } = await ctx.supabase
      .from("tradeguard_reserves")
      .select("*")
      .eq("id", input.reserveId)
      .single();

    if (refetchError) {
      throw new Error("Failed to fetch updated reserve");
    }

    return {
      success: true,
      reserve: updatedReserve,
      message: "Funds refunded successfully",
    };
  });
