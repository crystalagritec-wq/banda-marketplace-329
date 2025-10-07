import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const submitProofProcedure = protectedProcedure
  .input(
    z.object({
      reserveId: z.string().uuid(),
      proofType: z.enum(["qr_scan", "gps_location", "photo", "signature", "otp"]),
      proofData: z.record(z.string(), z.any()),
      qrCodeId: z.string().optional(),
      gpsCoordinates: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
      gpsAccuracy: z.number().optional(),
      photoUrl: z.string().optional(),
      submittedBy: z.string().uuid(),
      deviceInfo: z.record(z.string(), z.any()).optional(),
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
      throw new Error("Reserve is not in held status");
    }

    const { data: proof, error: proofError } = await ctx.supabase
      .from("tradeguard_proofs")
      .insert({
        reserve_id: input.reserveId,
        proof_type: input.proofType,
        proof_data: input.proofData,
        qr_code_id: input.qrCodeId,
        qr_scan_timestamp: input.proofType === "qr_scan" ? new Date().toISOString() : null,
        gps_coordinates: input.gpsCoordinates,
        gps_accuracy: input.gpsAccuracy,
        photo_url: input.photoUrl,
        submitted_by: input.submittedBy,
        device_info: input.deviceInfo,
        verified: false,
      })
      .select()
      .single();

    if (proofError) {
      console.error("Error submitting proof:", proofError);
      throw new Error("Failed to submit proof");
    }

    const { error: updateError } = await ctx.supabase
      .from("tradeguard_reserves")
      .update({
        proof_submitted: true,
        proof_data: {
          ...reserve.proof_data,
          [input.proofType]: input.proofData,
        },
      })
      .eq("id", input.reserveId);

    if (updateError) {
      console.error("Error updating reserve:", updateError);
    }

    return {
      success: true,
      proof,
      message: "Proof submitted successfully",
    };
  });
