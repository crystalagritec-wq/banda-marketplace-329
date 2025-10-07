import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const addBundleProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      productIds: z.array(z.string()),
      quantities: z.record(z.string(), z.number()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { userId, productIds, quantities } = input;

    try {
      const insertPromises = productIds.map((productId) => {
        const quantity = quantities[productId] || 1;
        return ctx.supabase
          .from('cart_items')
          .upsert(
            {
              user_id: userId,
              product_id: productId,
              quantity,
            },
            {
              onConflict: 'user_id,product_id',
            }
          );
      });

      await Promise.all(insertPromises);

      console.log('[Cart] Bundle added successfully:', productIds.length, 'items');

      return {
        success: true,
        message: `${productIds.length} items added to cart`,
      };
    } catch (e: any) {
      console.error('[Cart] addBundle error:', e);
      return {
        success: false,
        error: e?.message || 'Failed to add bundle to cart',
      };
    }
  });
