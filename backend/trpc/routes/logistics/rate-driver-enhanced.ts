import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const rateDriverEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      deliveryId: z.string().uuid(),
      rating: z.number().min(1).max(5),
      review: z.string().optional(),
      professionalism: z.number().min(1).max(5).optional(),
      timeliness: z.number().min(1).max(5).optional(),
      careOfGoods: z.number().min(1).max(5).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { deliveryId, rating, review, professionalism, timeliness, careOfGoods } = input;
    const userId = ctx.user.id;

    console.log("[rateDriverEnhanced] Starting rating", {
      deliveryId,
      userId,
      rating,
    });

    const { data: delivery, error: fetchError } = await ctx.supabase
      .from("deliveries")
      .select("*, drivers!inner(id, user_id), orders!inner(customer_id)")
      .eq("id", deliveryId)
      .single();

    if (fetchError || !delivery) {
      console.error("[rateDriverEnhanced] Delivery not found", fetchError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Delivery not found",
      });
    }

    if (delivery.orders.customer_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to rate this delivery",
      });
    }

    if (delivery.status !== "delivered") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Delivery must be completed before rating",
      });
    }

    const { data: existingRating } = await ctx.supabase
      .from("driver_ratings")
      .select("id")
      .eq("delivery_id", deliveryId)
      .eq("user_id", userId)
      .single();

    if (existingRating) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You have already rated this delivery",
      });
    }

    const { data: ratingData, error: insertError } = await ctx.supabase
      .from("driver_ratings")
      .insert({
        delivery_id: deliveryId,
        user_id: userId,
        driver_id: delivery.drivers.id,
        rating,
        review: review || null,
        professionalism: professionalism || null,
        timeliness: timeliness || null,
        care_of_goods: careOfGoods || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[rateDriverEnhanced] Failed to insert rating", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to submit rating",
      });
    }

    const { data: avgRating } = await ctx.supabase.rpc("get_driver_rating", {
      driver_id_param: delivery.drivers.id,
    });

    await ctx.supabase
      .from("drivers")
      .update({ rating: avgRating || 0 })
      .eq("id", delivery.drivers.id);

    await ctx.supabase.from("push_notifications").insert({
      user_id: delivery.drivers.user_id,
      title: "New Rating Received",
      message: `You received a ${rating}-star rating from a customer.`,
      data: { deliveryId, ratingId: ratingData.id },
    });

    console.log("[rateDriverEnhanced] Rating submitted successfully", ratingData.id);

    return {
      success: true,
      rating: ratingData,
      averageRating: avgRating,
    };
  });
