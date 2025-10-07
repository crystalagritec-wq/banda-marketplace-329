import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updateShopProductProcedure = protectedProcedure
  .input(z.object({
    productId: z.string(),
    title: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    negotiable: z.boolean().optional(),
    stock: z.number().int().nonnegative().optional(),
    unit: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    const { productId, ...updateData } = input;
    
    console.log('[Shop Product] Updating product:', productId);

    try {
      const { data: product, error: fetchError } = await ctx.supabase
        .from('marketplace_products')
        .select('user_id')
        .eq('id', productId)
        .single();

      if (fetchError || !product) {
        throw new Error('Product not found');
      }

      if (product.user_id !== userId) {
        throw new Error('Unauthorized to update this product');
      }

      const { data, error } = await ctx.supabase
        .from('marketplace_products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('[Shop Product] Update error:', error);
        throw new Error('Failed to update product');
      }

      console.log('[Shop Product] Product updated successfully');

      return {
        success: true,
        message: 'Product updated successfully',
        product: data,
      };
    } catch (error) {
      console.error('[Shop Product] Error:', error);
      throw new Error('Failed to update product');
    }
  });
