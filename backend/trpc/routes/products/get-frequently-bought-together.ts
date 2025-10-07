import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getFrequentlyBoughtTogetherProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log('[Frequently Bought] Fetching for product:', input.productId);

    try {
      const { data, error } = await ctx.supabase.rpc('get_frequently_bought_together', {
        p_product_id: input.productId,
        p_limit: 3,
      });

      if (error) {
        console.warn('[Frequently Bought] RPC failed:', error.message);
      }

      const products = (data as any[]) || [];

      const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
      const bundleDiscount = Math.floor(totalPrice * 0.1);

      return {
        products,
        bundlePrice: totalPrice - bundleDiscount,
        savings: bundleDiscount,
      };
    } catch (error: any) {
      console.error('[Frequently Bought] Error:', error);
      return {
        products: [],
        bundlePrice: 0,
        savings: 0,
      };
    }
  });
