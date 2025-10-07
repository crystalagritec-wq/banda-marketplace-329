import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const getVendorOrdersProcedure = protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    status: z.enum(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Vendor Orders] Fetching orders for vendor:', input.vendorId);

    let query = ctx.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          marketplace_products (
            id,
            name,
            price,
            images
          )
        ),
        profiles!orders_user_id_fkey (
          id,
          full_name,
          phone_number
        )
      `)
      .eq('seller_id', input.vendorId)
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.status && input.status !== 'all') {
      query = query.eq('status', input.status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('[Vendor Orders] Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }

    const totalQuery = ctx.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', input.vendorId);

    const { count } = await totalQuery;

    return {
      orders: orders || [],
      total: count || 0,
      hasMore: (input.offset + input.limit) < (count || 0),
    };
  });
