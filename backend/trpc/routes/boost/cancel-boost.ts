import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

const cancelBoostSchema = z.object({
  boostId: z.string().uuid(),
  refund: z.boolean().optional().default(false),
});

export const cancelBoostProcedure = protectedProcedure
  .input(cancelBoostSchema)
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("[cancelBoost] Cancelling boost:", input.boostId);

    try {
      const { data: boost, error: boostError } = await supabase
        .from("boosts")
        .select("*, product:products(seller_id), shop:shops(user_id)")
        .eq("id", input.boostId)
        .single();

      if (boostError || !boost) {
        throw new Error("Boost not found");
      }

      const ownerId = boost.product?.seller_id || boost.shop?.user_id;
      if (ownerId !== userId) {
        throw new Error("You can only cancel your own boosts");
      }

      if (boost.status !== "active") {
        throw new Error("Boost is not active");
      }

      await supabase
        .from("boosts")
        .update({ status: "expired" })
        .eq("id", input.boostId);

      if (boost.type === "product" && boost.product_id) {
        await supabase
          .from("products")
          .update({ is_boosted: false })
          .eq("id", boost.product_id);
      } else if (boost.type === "shop" && boost.shop_id) {
        await supabase
          .from("shops")
          .update({ is_boosted: false })
          .eq("id", boost.shop_id);

        await supabase
          .from("products")
          .update({ is_boosted: false })
          .eq("seller_id", userId);
      }

      if (input.refund) {
        const now = new Date();
        const endDate = new Date(boost.end_date);
        const startDate = new Date(boost.start_date);
        const totalDuration = endDate.getTime() - startDate.getTime();
        const remainingDuration = endDate.getTime() - now.getTime();
        const refundPercentage = Math.max(
          0,
          Math.min(1, remainingDuration / totalDuration)
        );
        const refundAmount = boost.amount * refundPercentage * 0.8;

        if (refundAmount > 0) {
          const { data: wallet } = await supabase
            .from("agripay_wallets")
            .select("id")
            .eq("user_id", userId)
            .single();

          if (wallet) {
            await supabase.rpc("add_wallet_balance", {
              p_user_id: userId,
              p_amount: refundAmount,
            });

            await supabase.from("agripay_transactions").insert({
              wallet_id: wallet.id,
              type: "refund",
              amount: refundAmount,
              currency: "KES",
              status: "completed",
              description: `Boost cancellation refund (${Math.round(refundPercentage * 100)}%)`,
              metadata: {
                boost_id: input.boostId,
                original_amount: boost.amount,
                refund_percentage: refundPercentage,
              },
            });
          }
        }
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Boost Cancelled",
        message: input.refund
          ? "Your boost has been cancelled and refund processed"
          : "Your boost has been cancelled",
        type: "system",
        data: {
          boost_id: input.boostId,
          refunded: input.refund,
        },
      });

      console.log("[cancelBoost] Boost cancelled successfully");

      return {
        success: true,
        message: "Boost cancelled successfully",
      };
    } catch (error: any) {
      console.error("[cancelBoost] Error:", error);
      throw new Error(error.message || "Failed to cancel boost");
    }
  });
