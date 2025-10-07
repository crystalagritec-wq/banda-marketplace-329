import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const deleteShopProductProcedure = protectedProcedure
  .input(z.object({
    productId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[Shop Product] Deleting product:', input.productId);

    try {
      const { data: product, error: fetchError } = await ctx.supabase
        .from('marketplace_products')
        .select('user_id')
        .eq('id', input.productId)
        .single();

      if (fetchError || !product) {
        throw new Error('Product not found');
      }

      if (product.user_id !== userId) {
        throw new Error('Unauthorized to delete this product');
      }

      const { error } = await ctx.supabase
        .from('marketplace_products')
        .delete()
        .eq('id', input.productId);

      if (error) {
        console.error('[Shop Product] Delete error:', error);
        throw new Error('Failed to delete product');
      }

      console.log('[Shop Product] Product deleted successfully');

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      console.error('[Shop Product] Error:', error);
      throw new Error('Failed to delete product');
    }
  });
