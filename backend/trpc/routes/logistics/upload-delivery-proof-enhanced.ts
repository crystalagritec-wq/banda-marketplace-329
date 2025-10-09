import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const uploadDeliveryProofEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      deliveryId: z.string().uuid(),
      imageUrl: z.string().url(),
      recipientName: z.string(),
      signatureUrl: z.string().url().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { deliveryId, imageUrl, recipientName, signatureUrl, notes } = input;
    const userId = ctx.user.id;

    console.log("[uploadDeliveryProofEnhanced] Starting upload", {
      deliveryId,
      userId,
    });

    const { data: driver, error: driverError } = await ctx.supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      console.error("[uploadDeliveryProofEnhanced] Driver not found", driverError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Driver profile not found",
      });
    }

    const { data: delivery, error: fetchError } = await ctx.supabase
      .from("deliveries")
      .select("*, orders!inner(customer_id)")
      .eq("id", deliveryId)
      .eq("driver_id", driver.id)
      .single();

    if (fetchError || !delivery) {
      console.error("[uploadDeliveryProofEnhanced] Delivery not found", fetchError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Delivery not found",
      });
    }

    const { data: proof, error: insertError } = await ctx.supabase
      .from("delivery_proofs")
      .insert({
        delivery_id: deliveryId,
        driver_id: driver.id,
        image_url: imageUrl,
        recipient_name: recipientName,
        signature_url: signatureUrl || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[uploadDeliveryProofEnhanced] Failed to insert proof", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload delivery proof",
      });
    }

    const { error: updateError } = await ctx.supabase
      .from("deliveries")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", deliveryId);

    if (updateError) {
      console.error("[uploadDeliveryProofEnhanced] Failed to update delivery status", updateError);
    }

    await ctx.supabase.from("push_notifications").insert({
      user_id: delivery.orders.customer_id,
      title: "Delivery Completed",
      message: `Your order has been delivered to ${recipientName}. Please rate your delivery experience.`,
      data: { deliveryId, proofId: proof.id },
    });

    console.log("[uploadDeliveryProofEnhanced] Proof uploaded successfully", proof.id);

    return {
      success: true,
      proof,
    };
  });
