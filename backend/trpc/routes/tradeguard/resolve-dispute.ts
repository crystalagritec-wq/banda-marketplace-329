import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const resolveDisputeProcedure = protectedProcedure
  .input(
    z.object({
      disputeId: z.string().uuid(),
      resolution: z.enum([
        "refund_buyer",
        "release_seller",
        "partial_refund",
        "no_action",
        "escalated_to_admin",
      ]),
      resolutionDetails: z.string(),
      resolvedBy: z.string().uuid(),
      partialRefundAmount: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: dispute, error: disputeError } = await ctx.supabase
      .from("tradeguard_disputes")
      .select("*, tradeguard_reserves(*)")
      .eq("id", input.disputeId)
      .single();

    if (disputeError || !dispute) {
      throw new Error("Dispute not found");
    }

    const { error: updateDisputeError } = await ctx.supabase
      .from("tradeguard_disputes")
      .update({
        status: "resolved",
        resolution: input.resolution,
        resolution_details: input.resolutionDetails,
        resolved_at: new Date().toISOString(),
        resolved_by: input.resolvedBy,
      })
      .eq("id", input.disputeId);

    if (updateDisputeError) {
      console.error("Error updating dispute:", updateDisputeError);
      throw new Error("Failed to update dispute");
    }

    const reserve = dispute.tradeguard_reserves as any;

    switch (input.resolution) {
      case "refund_buyer":
        await ctx.supabase.rpc("refund_reserve", {
          p_reserve_id: reserve.id,
          p_reason: `Dispute resolved: ${input.resolutionDetails}`,
        });
        break;

      case "release_seller":
        await ctx.supabase.rpc("release_reserve", {
          p_reserve_id: reserve.id,
          p_released_by: input.resolvedBy,
        });
        await ctx.supabase
          .from("tradeguard_reserves")
          .update({
            release_reason: `Dispute resolved: ${input.resolutionDetails}`,
          })
          .eq("id", reserve.id);
        break;

      case "partial_refund":
        break;

      case "no_action":
        await ctx.supabase
          .from("tradeguard_reserves")
          .update({
            status: "held",
          })
          .eq("id", reserve.id);
        break;

      case "escalated_to_admin":
        await ctx.supabase
          .from("tradeguard_disputes")
          .update({
            status: "escalated",
          })
          .eq("id", input.disputeId);
        break;
    }

    return {
      success: true,
      message: "Dispute resolved successfully",
    };
  });
