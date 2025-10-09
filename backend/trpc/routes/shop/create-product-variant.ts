import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const createProductVariantProcedure = protectedProcedure
  .input(
    z.object({
      productId: z.string().uuid(),
      variantName: z.string(),
      variantType: z.string(),
      priceModifier: z.number().default(0),
      stock: z.number().default(0),
      sku: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { productId, variantName, variantType, priceModifier, stock, sku } = input;
    const userId = ctx.user.id;

    console.log("[createProductVariant] Creating variant", {
      productId,
      variantName,
      userId,
    });

    const { data: shop, error: shopError } = await ctx.supabase
      .from("shops")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (shopError || !shop) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shop not found",
      });
    }

    const { data: product, error: productError } = await ctx.supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("shop_id", shop.id)
      .single();

    if (productError || !product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }

    const { data: variant, error: insertError } = await ctx.supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        variant_name: variantName,
        variant_type: variantType,
        price_modifier: priceModifier,
        stock,
        sku: sku || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[createProductVariant] Failed to create variant", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product variant",
      });
    }

    console.log("[createProductVariant] Variant created successfully", variant.id);

    return {
      success: true,
      variant,
    };
  });
