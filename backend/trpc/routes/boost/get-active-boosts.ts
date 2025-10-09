import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

const getActiveBoostsSchema = z.object({
  userId: z.string(),
  type: z.enum(["product", "shop", "all"]).optional().default("all"),
});

export const getActiveBoostsProcedure = protectedProcedure
  .input(getActiveBoostsSchema)
  .query(async ({ input }) => {
    console.log("[getActiveBoosts] Fetching boosts for user:", input.userId);

    try {
      let query = supabase
        .from("boosts")
        .select(
          `
          *,
          product:products(id, name, images, price),
          shop:shops(id, shop_name, logo_url)
        `
        )
        .eq("status", "active")
        .gte("end_date", new Date().toISOString());

      if (input.type === "product") {
        query = query.not("product_id", "is", null);
      } else if (input.type === "shop") {
        query = query.not("shop_id", "is", null);
      }

      const { data: boosts, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("[getActiveBoosts] Error:", error);
        throw new Error("Failed to fetch boosts");
      }

      const enrichedBoosts = boosts?.map((boost) => {
        const now = new Date();
        const endDate = new Date(boost.end_date);
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...boost,
          daysRemaining,
          isExpiringSoon: daysRemaining <= 3,
        };
      });

      return {
        success: true,
        boosts: enrichedBoosts || [],
      };
    } catch (error: any) {
      console.error("[getActiveBoosts] Error:", error);
      throw new Error(error.message || "Failed to fetch boosts");
    }
  });
