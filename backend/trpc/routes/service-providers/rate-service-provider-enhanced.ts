import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const rateServiceProviderEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      serviceRequestId: z.string().uuid(),
      rating: z.number().min(1).max(5),
      review: z.string().optional(),
      qualityRating: z.number().min(1).max(5).optional(),
      punctualityRating: z.number().min(1).max(5).optional(),
      communicationRating: z.number().min(1).max(5).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const {
      serviceRequestId,
      rating,
      review,
      qualityRating,
      punctualityRating,
      communicationRating,
    } = input;
    const userId = ctx.user.id;

    console.log("[rateServiceProviderEnhanced] Starting rating", {
      serviceRequestId,
      userId,
      rating,
    });

    const { data: serviceRequest, error: fetchError } = await ctx.supabase
      .from("service_requests")
      .select("*, service_providers!inner(id, user_id)")
      .eq("id", serviceRequestId)
      .single();

    if (fetchError || !serviceRequest) {
      console.error("[rateServiceProviderEnhanced] Service request not found", fetchError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Service request not found",
      });
    }

    if (serviceRequest.customer_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to rate this service request",
      });
    }

    if (serviceRequest.status !== "completed") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Service request must be completed before rating",
      });
    }

    const { data: existingRating } = await ctx.supabase
      .from("service_ratings")
      .select("id")
      .eq("service_request_id", serviceRequestId)
      .eq("user_id", userId)
      .single();

    if (existingRating) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You have already rated this service request",
      });
    }

    const { data: ratingData, error: insertError } = await ctx.supabase
      .from("service_ratings")
      .insert({
        service_request_id: serviceRequestId,
        user_id: userId,
        provider_id: serviceRequest.service_providers.id,
        rating,
        review: review || null,
        quality_rating: qualityRating || null,
        punctuality_rating: punctualityRating || null,
        communication_rating: communicationRating || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[rateServiceProviderEnhanced] Failed to insert rating", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to submit rating",
      });
    }

    const { data: avgRating } = await ctx.supabase.rpc("get_service_provider_rating", {
      provider_id_param: serviceRequest.service_providers.id,
    });

    await ctx.supabase
      .from("service_providers")
      .update({ rating: avgRating || 0 })
      .eq("id", serviceRequest.service_providers.id);

    await ctx.supabase.from("push_notifications").insert({
      user_id: serviceRequest.service_providers.user_id,
      title: "New Rating Received",
      message: `You received a ${rating}-star rating from a customer.`,
      data: { serviceRequestId, ratingId: ratingData.id },
    });

    console.log("[rateServiceProviderEnhanced] Rating submitted successfully", ratingData.id);

    return {
      success: true,
      rating: ratingData,
      averageRating: avgRating,
    };
  });
