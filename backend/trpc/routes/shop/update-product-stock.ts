import { publicProcedure } from '../../create-context';
import { z } from 'zod';

export const updateProductStockProcedure = publicProcedure
  .input(z.object({
    productId: z.string(),
    stock: z.number().min(0),
  }))
  .mutation(async ({ input }) => {
    console.log('[Shop] Updating product stock:', input);

    const status = input.stock === 0 
      ? 'out_of_stock' 
      : input.stock < 10 
        ? 'low_stock' 
        : 'active';

    return {
      success: true,
      product: {
        id: input.productId,
        stock: input.stock,
        status,
      },
    };
  });
