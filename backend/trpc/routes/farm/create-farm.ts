import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const createFarmProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      type: z.array(z.string()).min(1),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string().optional(),
      }),
      size: z.number().optional(),
      sizeUnit: z.enum(["acres", "hectares"]).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data: farm, error } = await supabase
      .from("farms")
      .insert({
        user_id: userId,
        name: input.name,
        type: input.type,
        location: input.location,
        size: input.size,
        size_unit: input.sizeUnit,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating farm:", error);
      throw new Error("Failed to create farm");
    }

    return { success: true, farm };
  });
