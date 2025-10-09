import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const getInventoryAlertsEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      resolved: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    const { resolved, limit, offset } = input;
    const userId = ctx.user.id;

    console.log("[getInventoryAlertsEnhanced] Fetching alerts", {
      userId,
      resolved,
      limit,
      offset,
    });

    const { data: shop, error: shopError } = await ctx.supabase
      .from("shops")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (shopError || !shop) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shop not found",
      });
    }

    let query = ctx.supabase
      .from("inventory_alerts")
      .select(
        `
        *,
        products!inner(
          id,
          name,
          stock,
          price,
          images,
          shop_id
        )
      `
      )
      .eq("products.shop_id", shop.id)
      .order("triggered_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (resolved !== undefined) {
      query = query.eq("resolved", resolved);
    }

    const { data: alerts, error: fetchError } = await query;

    if (fetchError) {
      console.error("[getInventoryAlertsEnhanced] Failed to fetch alerts", fetchError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch inventory alerts",
      });
    }

    const { count } = await ctx.supabase
      .from("inventory_alerts")
      .select("*, products!inner(shop_id)", { count: "exact", head: true })
      .eq("products.shop_id", shop.id);

    console.log("[getInventoryAlertsEnhanced] Fetched alerts", {
      count: alerts?.length || 0,
      total: count,
    });

    return {
      alerts: alerts || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    };
  });
