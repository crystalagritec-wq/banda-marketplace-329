import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const updateDeliveryStatusEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      deliveryId: z.string().uuid(),
      status: z.enum(["picked_up", "in_transit", "delivered", "cancelled"]),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { deliveryId, status, notes } = input;
    const userId = ctx.user.id;

    console.log("[updateDeliveryStatusEnhanced] Updating status", {
      deliveryId,
      status,
      userId,
    });

    const { data: driver, error: driverError } = await ctx.supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Driver profile not found",
      });
    }

    const { data: delivery, error: fetchError } = await ctx.supabase
      .from("deliveries")
      .select("*, orders!inner(customer_id)")
      .eq("id", deliveryId)
      .eq("driver_id", driver.id)
      .single();

    if (fetchError || !delivery) {
      console.error("[updateDeliveryStatusEnhanced] Delivery not found", fetchError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Delivery not found",
      });
    }

    const updateData: Record<string, unknown> = {
      status,
    };

    if (status === "picked_up") {
      updateData.picked_up_at = new Date().toISOString();
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: updatedDelivery, error: updateError } = await ctx.supabase
      .from("deliveries")
      .update(updateData)
      .eq("id", deliveryId)
      .select()
      .single();

    if (updateError) {
      console.error("[updateDeliveryStatusEnhanced] Failed to update status", updateError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update delivery status",
      });
    }

    const statusMessages: Record<string, string> = {
      picked_up: "Your order has been picked up by the driver",
      in_transit: "Your order is on the way",
      delivered: "Your order has been delivered",
      cancelled: "Your delivery has been cancelled",
    };

    await ctx.supabase.from("push_notifications").insert({
      user_id: delivery.orders.customer_id,
      title: "Delivery Update",
      message: statusMessages[status] || "Your delivery status has been updated",
      data: { deliveryId, status, notes },
    });

    console.log("[updateDeliveryStatusEnhanced] Status updated successfully", {
      deliveryId,
      status,
    });

    return {
      success: true,
      delivery: updatedDelivery,
    };
  });
