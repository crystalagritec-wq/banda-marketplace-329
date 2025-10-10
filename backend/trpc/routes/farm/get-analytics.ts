import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getFarmAnalyticsProcedure = protectedProcedure
  .input(
    z.object({
      farmId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data: farm } = await supabase
      .from("farms")
      .select("*")
      .eq("id", input.farmId)
      .eq("user_id", userId)
      .single();

    if (!farm) {
      throw new Error("Farm not found or unauthorized");
    }

    let query = supabase
      .from("farm_records")
      .select("*")
      .eq("farm_id", input.farmId)
      .order("date", { ascending: true });

    if (input.startDate) {
      query = query.gte("date", input.startDate);
    }
    if (input.endDate) {
      query = query.lte("date", input.endDate);
    }

    const { data: records, error } = await query;

    if (error) {
      console.error("Error fetching farm records:", error);
      throw new Error("Failed to fetch farm records");
    }

    const analytics = {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      recordsByType: {} as Record<string, number>,
      incomeByMonth: {} as Record<string, number>,
      expensesByMonth: {} as Record<string, number>,
      productionData: {} as Record<string, any>,
    };

    records?.forEach((record) => {
      if (record.income) analytics.totalIncome += parseFloat(record.income);
      if (record.cost) analytics.totalExpenses += parseFloat(record.cost);

      analytics.recordsByType[record.record_type] =
        (analytics.recordsByType[record.record_type] || 0) + 1;

      const month = record.date.substring(0, 7);
      if (record.income) {
        analytics.incomeByMonth[month] =
          (analytics.incomeByMonth[month] || 0) + parseFloat(record.income);
      }
      if (record.cost) {
        analytics.expensesByMonth[month] =
          (analytics.expensesByMonth[month] || 0) + parseFloat(record.cost);
      }

      if (record.quantity && record.record_type) {
        if (!analytics.productionData[record.record_type]) {
          analytics.productionData[record.record_type] = {
            total: 0,
            unit: record.unit || "",
            byMonth: {} as Record<string, number>,
          };
        }
        analytics.productionData[record.record_type].total += record.quantity;
        analytics.productionData[record.record_type].byMonth[month] =
          (analytics.productionData[record.record_type].byMonth[month] || 0) +
          record.quantity;
      }
    });

    analytics.netProfit = analytics.totalIncome - analytics.totalExpenses;

    return { analytics, farm };
  });
