import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const addFarmRecordProcedure = protectedProcedure
  .input(
    z.object({
      farmId: z.string(),
      recordType: z.string(),
      date: z.string(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      cost: z.number().optional(),
      income: z.number().optional(),
      notes: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data: farm } = await supabase
      .from("farms")
      .select("id")
      .eq("id", input.farmId)
      .eq("user_id", userId)
      .single();

    if (!farm) {
      throw new Error("Farm not found or unauthorized");
    }

    const { data: record, error } = await supabase
      .from("farm_records")
      .insert({
        farm_id: input.farmId,
        record_type: input.recordType,
        date: input.date,
        quantity: input.quantity,
        unit: input.unit,
        cost: input.cost,
        income: input.income,
        notes: input.notes,
        metadata: input.metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding farm record:", error);
      throw new Error("Failed to add farm record");
    }

    return { success: true, record };
  });
