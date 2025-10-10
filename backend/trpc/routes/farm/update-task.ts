import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const updateFarmTaskProcedure = protectedProcedure
  .input(
    z.object({
      taskId: z.string(),
      status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data: task } = await supabase
      .from("farm_tasks")
      .select("farm_id")
      .eq("id", input.taskId)
      .single();

    if (!task) {
      throw new Error("Task not found");
    }

    const { data: farm } = await supabase
      .from("farms")
      .select("id")
      .eq("id", task.farm_id)
      .eq("user_id", userId)
      .single();

    if (!farm) {
      throw new Error("Unauthorized");
    }

    const updateData: any = {};
    if (input.status) updateData.status = input.status;
    if (input.title) updateData.title = input.title;
    if (input.description) updateData.description = input.description;
    if (input.dueDate) updateData.due_date = input.dueDate;
    if (input.priority) updateData.priority = input.priority;

    const { data: updatedTask, error } = await supabase
      .from("farm_tasks")
      .update(updateData)
      .eq("id", input.taskId)
      .select()
      .single();

    if (error) {
      console.error("Error updating farm task:", error);
      throw new Error("Failed to update farm task");
    }

    return { success: true, task: updatedTask };
  });
