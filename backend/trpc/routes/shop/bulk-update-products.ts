import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const bulkUpdateProductsProcedure = protectedProcedure
  .input(z.object({
    shopId: z.string().uuid(),
    updates: z.array(z.object({
      productId: z.string().uuid(),
      stock: z.number().int().min(0).optional(),
      price: z.number().min(0).optional(),
      status: z.enum(['active', 'inactive', 'out_of_stock', 'draft']).optional(),
    })),
  }))
  .mutation(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', input.shopId)
      .eq('user_id', ctx.user.id)
      .single();

    if (shopError || !shop) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update products for this shop',
      });
    }

    const results = await Promise.all(
      input.updates.map(async (update) => {
        const updateData: any = {};
        if (update.stock !== undefined) updateData.stock = update.stock;
        if (update.price !== undefined) updateData.price = update.price;
        if (update.status !== undefined) updateData.status = update.status;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('shop_products')
          .update(updateData)
          .eq('id', update.productId)
          .eq('shop_id', input.shopId)
          .select()
          .single();

        return { productId: update.productId, success: !error, error: error?.message };
      })
    );

    const failedUpdates = results.filter(r => !r.success);
    if (failedUpdates.length > 0) {
      console.error('Some updates failed:', failedUpdates);
    }

    return {
      success: true,
      updated: results.filter(r => r.success).length,
      failed: failedUpdates.length,
      results,
    };
  });
