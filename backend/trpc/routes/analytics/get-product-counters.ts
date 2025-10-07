import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getProductCountersProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .query(async ({ input, ctx }) => {
    const { productId } = input;

    try {
      const { data, error } = await ctx.supabase.rpc('get_product_counters', {
        p_product_id: productId,
      });

      if (error) {
        console.warn('get_product_counters RPC missing/failing, falling back:', error.message);
      }

      const counters = (data as unknown as { views_today?: number; carts_count?: number } | null) ?? null;

      return {
        productId,
        viewsToday: typeof counters?.views_today === 'number' ? counters.views_today : 0,
        inCarts: typeof counters?.carts_count === 'number' ? counters.carts_count : 0,
      };
    } catch (e) {
      console.error('getProductCountersProcedure error', e);
      return {
        productId,
        viewsToday: 0,
        inCarts: 0,
      };
    }
  });
