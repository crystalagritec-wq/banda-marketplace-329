import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getFarmsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data: farms, error } = await supabase
    .from("farms")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching farms:", error);
    throw new Error("Failed to fetch farms");
  }

  return { farms: farms || [] };
});
