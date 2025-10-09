import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const requestPayoutEnhancedProcedure = protectedProcedure
  .input(
    z.object({
      amount: z.number().positive(),
      paymentMethod: z.enum(["mpesa", "bank"]),
      accountDetails: z.object({
        accountNumber: z.string().optional(),
        accountName: z.string().optional(),
        bankName: z.string().optional(),
        phoneNumber: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { amount, paymentMethod, accountDetails } = input;
    const userId = ctx.user.id;

    console.log("[requestPayoutEnhanced] Starting payout request", {
      userId,
      amount,
      paymentMethod,
    });

    const { data: driver, error: driverError } = await ctx.supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (driverError || !driver) {
      console.error("[requestPayoutEnhanced] Driver not found", driverError);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Driver profile not found",
      });
    }

    const { data: earnings } = await ctx.supabase.rpc("get_driver_earnings", {
      driver_id_param: driver.id,
    });

    const availableEarnings = earnings || 0;

    if (amount > availableEarnings) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient earnings. Available: KES ${availableEarnings}`,
      });
    }

    const { data: payout, error: insertError } = await ctx.supabase
      .from("payout_requests")
      .insert({
        driver_id: driver.id,
        amount,
        payment_method: paymentMethod,
        account_details: accountDetails,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[requestPayoutEnhanced] Failed to create payout request", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create payout request",
      });
    }

    await ctx.supabase.from("admin_notifications").insert({
      type: "payout_request",
      title: "New Payout Request",
      message: `Driver ${driver.id} requested payout of KES ${amount}`,
      data: { payoutId: payout.id, driverId: driver.id, amount },
    });

    console.log("[requestPayoutEnhanced] Payout request created", payout.id);

    return {
      success: true,
      payout,
      availableEarnings,
    };
  });
