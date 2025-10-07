import { z } from "zod";
import { protectedProcedure } from "../../create-context";

export const getTransactionsProcedure = protectedProcedure
  .input(
    z.object({
      walletId: z.string().uuid(),
      limit: z.number().default(50),
      offset: z.number().default(0),
      type: z
        .enum([
          "deposit",
          "withdrawal",
          "payment",
          "refund",
          "reserve_hold",
          "reserve_release",
          "reserve_refund",
          "transfer_in",
          "transfer_out",
          "fee",
          "commission",
        ])
        .optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from("wallet_transactions")
      .select("*", { count: "exact" })
      .eq("wallet_id", input.walletId)
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.type) {
      query = query.eq("type", input.type);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }

    return {
      success: true,
      transactions: transactions || [],
      total: count || 0,
      hasMore: (count || 0) > input.offset + input.limit,
    };
  });
