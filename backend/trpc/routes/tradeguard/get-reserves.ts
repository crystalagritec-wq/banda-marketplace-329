import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const getReservesProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
      status: z
        .enum(["held", "released", "refunded", "disputed", "partial_release", "expired"])
        .optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from("tradeguard_reserves")
      .select("*", { count: "exact" })
      .or(`buyer_id.eq.${input.userId},seller_id.eq.${input.userId},driver_id.eq.${input.userId}`)
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.status) {
      query = query.eq("status", input.status);
    }

    const { data: reserves, error, count } = await query;

    if (error) {
      console.error("Error fetching reserves:", error);
      throw new Error("Failed to fetch reserves");
    }

    return {
      success: true,
      reserves: reserves || [],
      total: count || 0,
      hasMore: (count || 0) > input.offset + input.limit,
    };
  });
