import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const getDisputesProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().uuid(),
      status: z
        .enum(["open", "under_review", "awaiting_response", "resolved", "closed", "escalated"])
        .optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from("tradeguard_disputes")
      .select("*, tradeguard_reserves(*)", { count: "exact" })
      .or(`raised_by.eq.${input.userId},against_user.eq.${input.userId}`)
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.status) {
      query = query.eq("status", input.status);
    }

    const { data: disputes, error, count } = await query;

    if (error) {
      console.error("Error fetching disputes:", error);
      throw new Error("Failed to fetch disputes");
    }

    return {
      success: true,
      disputes: disputes || [],
      total: count || 0,
      hasMore: (count || 0) > input.offset + input.limit,
    };
  });
