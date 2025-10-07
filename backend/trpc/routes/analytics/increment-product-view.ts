import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const incrementProductViewProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { productId } = input;

    try {
      const { error } = await ctx.supabase.rpc('increment_product_view', {
        p_product_id: productId,
      });

      if (error) {
        console.warn('[Analytics] increment_product_view RPC failed:', error.message);
        return { success: false, error: error.message };
      }

      console.log('[Analytics] Product view incremented:', productId);
      return { success: true };
    } catch (e: any) {
      console.error('[Analytics] incrementProductView error:', e);
      return { success: false, error: e?.message || 'Unknown error' };
    }
  });
