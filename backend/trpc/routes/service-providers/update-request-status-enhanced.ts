import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const updateRequestStatusEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      requestId: z.string().uuid(),
      status: z.enum(["accepted", "in_progress", "completed", "cancelled"]),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { requestId, status, notes } = input;
    const userId = ctx.user.id;

    console.log("[updateRequestStatusEnhanced] Updating status", {
      requestId,
      status,
      userId,
    });

    const { data: provider, error: providerError } = await ctx.supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (providerError || !provider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Service provider profile not found",
      });
    }

    const { data: request, error: fetchError } = await ctx.supabase
      .from("service_requests")
      .select("*, users!service_requests_customer_id_fkey(id)")
      .eq("id", requestId)
      .eq("provider_id", provider.id)
      .single();

    if (fetchError || !request) {
      console.error("[updateRequestStatusEnhanced] Request not found", fetchError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Service request not found",
      });
    }

    const updateData: Record<string, unknown> = {
      status,
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedRequest, error: updateError } = await ctx.supabase
      .from("service_requests")
      .update(updateData)
      .eq("id", requestId)
      .select()
      .single();

    if (updateError) {
      console.error("[updateRequestStatusEnhanced] Failed to update status", updateError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update service request status",
      });
    }

    const statusMessages: Record<string, string> = {
      accepted: "Your service request has been accepted",
      in_progress: "Your service is now in progress",
      completed: "Your service has been completed",
      cancelled: "Your service request has been cancelled",
    };

    await ctx.supabase.from("push_notifications").insert({
      user_id: request.users.id,
      title: "Service Request Update",
      message: statusMessages[status] || "Your service request status has been updated",
      data: { requestId, status, notes },
    });

    console.log("[updateRequestStatusEnhanced] Status updated successfully", {
      requestId,
      status,
    });

    return {
      success: true,
      request: updatedRequest,
    };
  });
