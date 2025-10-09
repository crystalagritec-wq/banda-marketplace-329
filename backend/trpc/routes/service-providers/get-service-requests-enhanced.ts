import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const getServiceRequestsEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    const { status, limit, offset } = input;
    const userId = ctx.user.id;

    console.log("[getServiceRequestsEnhanced] Fetching requests", {
      userId,
      status,
      limit,
      offset,
    });

    const { data: provider, error: providerError } = await ctx.supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (providerError || !provider) {
      console.error("[getServiceRequestsEnhanced] Provider not found", providerError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Service provider profile not found",
      });
    }

    let query = ctx.supabase
      .from("service_requests")
      .select(
        `
        *,
        users!service_requests_customer_id_fkey(id, full_name, phone, profile_photo),
        service_proofs(id, image_url, notes, uploaded_at),
        service_ratings(id, rating, review, quality_rating, punctuality_rating, communication_rating)
      `
      )
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: requests, error: fetchError } = await query;

    if (fetchError) {
      console.error("[getServiceRequestsEnhanced] Failed to fetch requests", fetchError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch service requests",
      });
    }

    const { count } = await ctx.supabase
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", provider.id);

    console.log("[getServiceRequestsEnhanced] Fetched requests", {
      count: requests?.length || 0,
      total: count,
    });

    return {
      requests: requests || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    };
  });
