import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getProductProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .query(async ({ input, ctx }) => {
    const { productId } = input;

    try {
      const { data, error } = await ctx.supabase
        .from('products')
        .select(`
          *,
          vendor:vendor_id (
            id,
            name,
            phone,
            location,
            is_verified,
            reputation_score
          )
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('[Products] Failed to fetch product:', error.message);
        return null;
      }

      return data;
    } catch (e: any) {
      console.error('[Products] getProduct error:', e);
      return null;
    }
  });
