import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { TRPCError } from "@trpc/server";

export const uploadProductImagesProcedure = protectedProcedure
  .input(
    z.object({
      productId: z.string().uuid(),
      images: z.array(
        z.object({
          imageUrl: z.string().url(),
          isPrimary: z.boolean().default(false),
          displayOrder: z.number().default(0),
        })
      ),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { productId, images } = input;
    const userId = ctx.user.id;

    console.log("[uploadProductImages] Starting upload", {
      productId,
      userId,
      imageCount: images.length,
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

    const { error: deleteError } = await ctx.supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("[uploadProductImages] Failed to delete old images", deleteError);
    }

    const imageRecords = images.map((img) => ({
      product_id: productId,
      image_url: img.imageUrl,
      is_primary: img.isPrimary,
      display_order: img.displayOrder,
    }));

    const { data: uploadedImages, error: insertError } = await ctx.supabase
      .from("product_images")
      .insert(imageRecords)
      .select();

    if (insertError) {
      console.error("[uploadProductImages] Failed to insert images", insertError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload product images",
      });
    }

    console.log("[uploadProductImages] Images uploaded successfully", {
      count: uploadedImages?.length || 0,
    });

    return {
      success: true,
      images: uploadedImages,
    };
  });
