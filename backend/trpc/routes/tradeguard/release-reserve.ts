import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const releaseReserveProcedure = protectedProcedure
  .input(
    z.object({
      reserveId: z.string().uuid(),
      releasedBy: z.string().uuid(),
      releaseReason: z.string().optional(),
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

    if (reserve.status !== "held") {
      throw new Error(`Reserve cannot be released. Current status: ${reserve.status}`);
    }

    const { error } = await ctx.supabase.rpc("release_reserve", {
      p_reserve_id: input.reserveId,
      p_released_by: input.releasedBy,
    });

    if (error) {
      console.error("Error releasing reserve:", error);
      throw new Error(error.message || "Failed to release reserve");
    }

    if (input.releaseReason) {
      await ctx.supabase
        .from("tradeguard_reserves")
        .update({
          release_reason: input.releaseReason,
        })
        .eq("id", input.reserveId);
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
      message: "Funds released successfully",
    };
  });
