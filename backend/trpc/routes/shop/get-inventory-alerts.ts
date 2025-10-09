import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const getInventoryAlertsProcedure = protectedProcedure
  .input(z.object({
    shopId: z.string().uuid(),
    threshold: z.number().int().min(0).default(10),
  }))
  .query(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('id', input.shopId)
      .eq('user_id', ctx.user.id)
      .single();

    if (shopError || !shop) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view alerts for this shop',
      });
    }

    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('shop_products')
      .select('*')
      .eq('shop_id', input.shopId)
      .lte('stock', input.threshold)
      .gt('stock', 0)
      .eq('status', 'active')
      .order('stock', { ascending: true });

    if (lowStockError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch low stock products: ${lowStockError.message}`,
      });
    }

    const { data: outOfStockProducts, error: outOfStockError } = await supabase
      .from('shop_products')
      .select('*')
      .eq('shop_id', input.shopId)
      .eq('stock', 0)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (outOfStockError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch out of stock products: ${outOfStockError.message}`,
      });
    }

    return {
      lowStock: lowStockProducts || [],
      outOfStock: outOfStockProducts || [],
      totalAlerts: (lowStockProducts?.length || 0) + (outOfStockProducts?.length || 0),
    };
  });
