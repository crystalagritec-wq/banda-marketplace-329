import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const addFarmTaskProcedure = protectedProcedure
  .input(
    z.object({
      farmId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.string(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      category: z.string().optional(),
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

    const { data: task, error } = await supabase
      .from("farm_tasks")
      .insert({
        farm_id: input.farmId,
        title: input.title,
        description: input.description,
        due_date: input.dueDate,
        priority: input.priority || "medium",
        category: input.category,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding farm task:", error);
      throw new Error("Failed to add farm task");
    }

    return { success: true, task };
  });
