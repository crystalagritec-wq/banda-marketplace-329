import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getFarmDashboardProcedure = protectedProcedure
  .input(
    z.object({
      farmId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data: farm, error: farmError } = await supabase
      .from("farms")
      .select("*")
      .eq("id", input.farmId)
      .eq("user_id", userId)
      .single();

    if (farmError || !farm) {
      throw new Error("Farm not found");
    }

    const { data: records } = await supabase
      .from("farm_records")
      .select("*")
      .eq("farm_id", input.farmId)
      .order("date", { ascending: false })
      .limit(50);

    const { data: tasks } = await supabase
      .from("farm_tasks")
      .select("*")
      .eq("farm_id", input.farmId)
      .order("due_date", { ascending: true })
      .limit(20);

    const { data: livestock } = await supabase
      .from("farm_livestock")
      .select("*")
      .eq("farm_id", input.farmId);

    const { data: crops } = await supabase
      .from("farm_crops")
      .select("*")
      .eq("farm_id", input.farmId);

    const analytics = calculateFarmAnalytics(records || [], farm.type);

    return {
      farm,
      records: records || [],
      tasks: tasks || [],
      livestock: livestock || [],
      crops: crops || [],
      analytics,
    };
  });

function calculateFarmAnalytics(records: any[], farmTypes: string[]) {
  const analytics: any = {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  records.forEach((record) => {
    if (record.income) analytics.totalIncome += parseFloat(record.income);
    if (record.cost) analytics.totalExpenses += parseFloat(record.cost);
  });

  analytics.netProfit = analytics.totalIncome - analytics.totalExpenses;

  if (farmTypes.includes("Poultry")) {
    analytics.eggProduction = records
      .filter((r) => r.record_type === "egg_production")
      .reduce((sum, r) => sum + (r.quantity || 0), 0);
    analytics.feedUsed = records
      .filter((r) => r.record_type === "feed")
      .reduce((sum, r) => sum + (r.quantity || 0), 0);
  }

  if (farmTypes.includes("Dairy")) {
    analytics.milkYield = records
      .filter((r) => r.record_type === "milk_yield")
      .reduce((sum, r) => sum + (r.quantity || 0), 0);
  }

  if (farmTypes.includes("Crops")) {
    analytics.totalHarvest = records
      .filter((r) => r.record_type === "harvest")
      .reduce((sum, r) => sum + (r.quantity || 0), 0);
  }

  return analytics;
}
