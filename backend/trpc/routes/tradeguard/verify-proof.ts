import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const verifyProofProcedure = protectedProcedure
  .input(
    z.object({
      proofId: z.string().uuid(),
      verifiedBy: z.string().uuid(),
      verificationMethod: z.string(),
      anomalyDetected: z.boolean().default(false),
      anomalyReason: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { data: proof, error: proofError } = await ctx.supabase
      .from("tradeguard_proofs")
      .select("*")
      .eq("id", input.proofId)
      .single();

    if (proofError || !proof) {
      throw new Error("Proof not found");
    }

    const { error: updateError } = await ctx.supabase
      .from("tradeguard_proofs")
      .update({
        verified: !input.anomalyDetected,
        verified_at: new Date().toISOString(),
        verified_by: input.verifiedBy,
        verification_method: input.verificationMethod,
        anomaly_detected: input.anomalyDetected,
        anomaly_reason: input.anomalyReason,
      })
      .eq("id", input.proofId);

    if (updateError) {
      console.error("Error verifying proof:", updateError);
      throw new Error("Failed to verify proof");
    }

    if (!input.anomalyDetected) {
      const { error: reserveError } = await ctx.supabase
        .from("tradeguard_reserves")
        .update({
          proof_verified: true,
        })
        .eq("id", proof.reserve_id);

      if (reserveError) {
        console.error("Error updating reserve:", reserveError);
      }
    }

    return {
      success: true,
      verified: !input.anomalyDetected,
      message: input.anomalyDetected
        ? "Proof verification failed - anomaly detected"
        : "Proof verified successfully",
    };
  });
