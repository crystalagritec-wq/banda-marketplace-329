import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const getDriverDeliveriesEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(["pending", "picked_up", "in_transit", "delivered", "cancelled"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    const { status, limit, offset } = input;
    const userId = ctx.user.id;

    console.log("[getDriverDeliveriesEnhanced] Fetching deliveries", {
      userId,
      status,
      limit,
      offset,
    });

    const { data: driver, error: driverError } = await ctx.supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      console.error("[getDriverDeliveriesEnhanced] Driver not found", driverError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Driver profile not found",
      });
    }

    let query = ctx.supabase
      .from("deliveries")
      .select(
        `
        *,
        orders!inner(
          id,
          order_number,
          total_amount,
          users!orders_customer_id_fkey(id, full_name, phone, profile_photo)
        ),
        delivery_proofs(id, image_url, recipient_name, signature_url, notes, delivered_at),
        driver_ratings(id, rating, review, professionalism, timeliness, care_of_goods)
      `
      )
      .eq("driver_id", driver.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: deliveries, error: fetchError } = await query;

    if (fetchError) {
      console.error("[getDriverDeliveriesEnhanced] Failed to fetch deliveries", fetchError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch deliveries",
      });
    }

    const { count } = await ctx.supabase
      .from("deliveries")
      .select("*", { count: "exact", head: true })
      .eq("driver_id", driver.id);

    console.log("[getDriverDeliveriesEnhanced] Fetched deliveries", {
      count: deliveries?.length || 0,
      total: count,
    });

    return {
      deliveries: deliveries || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    };
  });
