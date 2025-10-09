import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const uploadServiceProofEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      serviceRequestId: z.string().uuid(),
      imageUrl: z.string().url(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { serviceRequestId, imageUrl, notes } = input;
    const userId = ctx.user.id;

    console.log("[uploadServiceProofEnhanced] Starting upload", {
      serviceRequestId,
      userId,
    });

    const { data: serviceRequest, error: fetchError } = await ctx.supabase
      .from("service_requests")
      .select("*, service_providers!inner(user_id)")
      .eq("id", serviceRequestId)
      .single();

    if (fetchError || !serviceRequest) {
      console.error("[uploadServiceProofEnhanced] Service request not found", fetchError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Service request not found",
      });
    }

    if (serviceRequest.service_providers.user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to upload proof for this service request",
      });
    }

    const { data: proof, error: insertError } = await ctx.supabase
      .from("service_proofs")
      .insert({
        service_request_id: serviceRequestId,
        uploaded_by: userId,
        image_url: imageUrl,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[uploadServiceProofEnhanced] Failed to insert proof", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload service proof",
      });
    }

    const { error: updateError } = await ctx.supabase
      .from("service_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        proof_photo: imageUrl,
      })
      .eq("id", serviceRequestId);

    if (updateError) {
      console.error("[uploadServiceProofEnhanced] Failed to update request status", updateError);
    }

    await ctx.supabase.from("push_notifications").insert({
      user_id: serviceRequest.customer_id,
      title: "Service Completed",
      message: "Your service request has been completed. Please review and rate the service provider.",
      data: { serviceRequestId, proofId: proof.id },
    });

    console.log("[uploadServiceProofEnhanced] Proof uploaded successfully", proof.id);

    return {
      success: true,
      proof,
    };
  });
