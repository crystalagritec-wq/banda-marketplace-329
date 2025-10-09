import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

const createBoostSchema = z.object({
  type: z.enum(["product", "shop"]),
  targetId: z.string().uuid(),
  duration: z.number().min(1).max(90),
  amount: z.number().positive(),
  paymentMethod: z.object({
    type: z.enum(["wallet", "mpesa", "card"]),
    details: z.record(z.any()).optional(),
  }),
});

export const createBoostProcedure = protectedProcedure
  .input(createBoostSchema)
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("[createBoost] Creating boost:", {
      userId,
      type: input.type,
      targetId: input.targetId,
      duration: input.duration,
      amount: input.amount,
    });

    try {
      if (input.type === "product") {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, seller_id, name")
          .eq("id", input.targetId)
          .single();

        if (productError || !product) {
          throw new Error("Product not found");
        }

        if (product.seller_id !== userId) {
          throw new Error("You can only boost your own products");
        }

        const { data: activeBoost } = await supabase
          .from("boosts")
          .select("id")
          .eq("product_id", input.targetId)
          .eq("status", "active")
          .single();

        if (activeBoost) {
          throw new Error("Product already has an active boost");
        }
      } else if (input.type === "shop") {
        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id, user_id, shop_name")
          .eq("id", input.targetId)
          .single();

        if (shopError || !shop) {
          throw new Error("Shop not found");
        }

        if (shop.user_id !== userId) {
          throw new Error("You can only boost your own shop");
        }

        const { data: activeBoost } = await supabase
          .from("boosts")
          .select("id")
          .eq("shop_id", input.targetId)
          .eq("status", "active")
          .single();

        if (activeBoost) {
          throw new Error("Shop already has an active boost");
        }
      }

      if (input.paymentMethod.type === "wallet") {
        const { data: wallet } = await supabase
          .from("agripay_wallets")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (!wallet || wallet.balance < input.amount) {
          throw new Error("Insufficient wallet balance");
        }

        const { error: deductError } = await supabase.rpc("deduct_wallet_balance", {
          p_user_id: userId,
          p_amount: input.amount,
        });

        if (deductError) {
          throw new Error("Failed to deduct payment from wallet");
        }

        await supabase.from("agripay_transactions").insert({
          wallet_id: wallet.id,
          type: "payment",
          amount: -input.amount,
          currency: "KES",
          status: "completed",
          description: `Boost payment for ${input.type}`,
          metadata: {
            boost_type: input.type,
            target_id: input.targetId,
            duration: input.duration,
          },
        });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + input.duration);

      const boostData: any = {
        type: input.type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        amount: input.amount,
        status: "active",
      };

      if (input.type === "product") {
        boostData.product_id = input.targetId;
        boostData.shop_id = null;
      } else {
        boostData.shop_id = input.targetId;
        boostData.product_id = null;
      }

      const { data: boost, error: boostError } = await supabase
        .from("boosts")
        .insert(boostData)
        .select()
        .single();

      if (boostError) {
        console.error("[createBoost] Failed to create boost:", boostError);
        throw new Error("Failed to create boost");
      }

      if (input.type === "product") {
        await supabase
          .from("products")
          .update({ is_boosted: true })
          .eq("id", input.targetId);
      } else {
        await supabase
          .from("shops")
          .update({ is_boosted: true })
          .eq("id", input.targetId);

        await supabase
          .from("products")
          .update({ is_boosted: true })
          .eq("seller_id", userId)
          .eq("status", "active");
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Boost Activated! 🚀",
        message: `Your ${input.type} boost is now active for ${input.duration} days`,
        type: "promotion",
        data: {
          boost_id: boost.id,
          type: input.type,
          target_id: input.targetId,
          end_date: endDate.toISOString(),
        },
      });

      console.log("[createBoost] Boost created successfully:", boost.id);

      return {
        success: true,
        boost,
        message: `${input.type === "product" ? "Product" : "Shop"} boost activated successfully`,
      };
    } catch (error: any) {
      console.error("[createBoost] Error:", error);
      throw new Error(error.message || "Failed to create boost");
    }
  });
