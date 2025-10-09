import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getProductPointsProcedure = publicProcedure
  .input(z.object({
    productId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Product Points] Fetching points for product:', input.productId);

    try {
      const { data: product, error } = await ctx.supabase
        .from('marketplace_products')
        .select('reward_points, price, title')
        .eq('id', input.productId)
        .single();

      if (error || !product) {
        console.error('[Product Points] Product not found:', error);
        throw new Error('Product not found');
      }

      const rewardPoints = product.reward_points || Math.floor(product.price * 0.01);

      return {
        productId: input.productId,
        rewardPoints,
        title: product.title,
        price: product.price,
        pointsPercentage: ((rewardPoints / product.price) * 100).toFixed(2),
      };
    } catch (error) {
      console.error('[Product Points] Error:', error);
      throw new Error('Failed to fetch product points');
    }
  });
