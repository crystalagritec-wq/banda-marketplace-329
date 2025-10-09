import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const getShopProductsFullProcedure = protectedProcedure
  .input(z.object({
    shopId: z.string().uuid(),
  }))
  .query(async ({ ctx, input }) => {
    const { data: products, error } = await ctx.supabase
      .from('shop_products')
      .select('*')
      .eq('shop_id', input.shopId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch products: ${error.message}`,
      });
    }

    return products || [];
  });
