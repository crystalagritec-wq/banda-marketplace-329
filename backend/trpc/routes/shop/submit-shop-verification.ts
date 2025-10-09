import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const submitShopVerificationProcedure = protectedProcedure
  .input(
    z.object({
      businessRegistration: z.string(),
      taxId: z.string(),
      bankAccount: z.string(),
      idDocumentUrl: z.string().url(),
      businessLicenseUrl: z.string().url().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { businessRegistration, taxId, bankAccount, idDocumentUrl, businessLicenseUrl } = input;
    const userId = ctx.user.id;

    console.log("[submitShopVerification] Starting verification submission", {
      userId,
    });

    const { data: shop, error: shopError } = await ctx.supabase
      .from("shops")
      .select("id, verification_status")
      .eq("user_id", userId)
      .single();

    if (shopError || !shop) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shop not found",
      });
    }

    const { data: existingVerification } = await ctx.supabase
      .from("shop_verifications")
      .select("id, status")
      .eq("shop_id", shop.id)
      .eq("status", "pending")
      .single();

    if (existingVerification) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You already have a pending verification request",
      });
    }

    const { data: verification, error: insertError } = await ctx.supabase
      .from("shop_verifications")
      .insert({
        shop_id: shop.id,
        business_registration: businessRegistration,
        tax_id: taxId,
        bank_account: bankAccount,
        id_document_url: idDocumentUrl,
        business_license_url: businessLicenseUrl || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[submitShopVerification] Failed to submit verification", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to submit verification",
      });
    }

    const { error: updateError } = await ctx.supabase
      .from("shops")
      .update({ verification_status: "pending" })
      .eq("id", shop.id);

    if (updateError) {
      console.error("[submitShopVerification] Failed to update shop status", updateError);
    }

    await ctx.supabase.from("admin_notifications").insert({
      type: "shop_verification",
      title: "New Shop Verification Request",
      message: `Shop ${shop.id} submitted verification documents`,
      data: { verificationId: verification.id, shopId: shop.id },
    });

    console.log("[submitShopVerification] Verification submitted successfully", verification.id);

    return {
      success: true,
      verification,
    };
  });
