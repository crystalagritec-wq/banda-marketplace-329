import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const raiseDisputeProcedure = protectedProcedure
  .input(
    z.object({
      reserveId: z.string().uuid(),
      raisedBy: z.string().uuid(),
      againstUser: z.string().uuid(),
      reason: z.enum([
        "product_mismatch",
        "damaged_goods",
        "wrong_quantity",
        "late_delivery",
        "no_delivery",
        "quality_issue",
        "service_incomplete",
        "payment_issue",
        "other",
      ]),
      description: z.string(),
      evidence: z.array(z.record(z.string(), z.any())).default([]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: reserve, error: reserveError } = await ctx.supabase
      .from("tradeguard_reserves")
      .select("*")
      .eq("id", input.reserveId)
      .single();

    if (reserveError || !reserve) {
      throw new Error("Reserve not found");
    }

    if (reserve.status !== "held") {
      throw new Error("Can only raise disputes for held reserves");
    }

    const { data: dispute, error: disputeError } = await ctx.supabase
      .from("tradeguard_disputes")
      .insert({
        reserve_id: input.reserveId,
        raised_by: input.raisedBy,
        against_user: input.againstUser,
        reason: input.reason,
        description: input.description,
        evidence: input.evidence,
        status: "open",
      })
      .select()
      .single();

    if (disputeError) {
      console.error("Error creating dispute:", disputeError);
      throw new Error("Failed to create dispute");
    }

    const { error: updateError } = await ctx.supabase
      .from("tradeguard_reserves")
      .update({
        status: "disputed",
      })
      .eq("id", input.reserveId);

    if (updateError) {
      console.error("Error updating reserve status:", updateError);
    }

    return {
      success: true,
      dispute,
      message: "Dispute raised successfully. TradeGuard will review your case.",
    };
  });
