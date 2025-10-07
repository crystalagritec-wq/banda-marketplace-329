import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const getVendorCustomersProcedure = protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Vendor Customers] Fetching customers for vendor:', input.vendorId);

    const { data: customers, error } = await ctx.supabase
      .from('orders')
      .select(`
        user_id,
        profiles!orders_user_id_fkey (
          id,
          full_name,
          phone_number,
          avatar_url
        )
      `)
      .eq('seller_id', input.vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Vendor Customers] Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }

    const uniqueCustomers = new Map();
    const customerStats = new Map();

    for (const order of customers || []) {
      if (order.profiles && !uniqueCustomers.has(order.user_id)) {
        uniqueCustomers.set(order.user_id, order.profiles);
        customerStats.set(order.user_id, { orders: 0, totalSpent: 0 });
      }
      if (customerStats.has(order.user_id)) {
        const stats = customerStats.get(order.user_id);
        stats.orders += 1;
      }
    }

    const { data: orderTotals, error: totalsError } = await ctx.supabase
      .from('orders')
      .select('user_id, total')
      .eq('seller_id', input.vendorId)
      .eq('payment_status', 'paid');

    if (!totalsError && orderTotals) {
      for (const order of orderTotals) {
        if (customerStats.has(order.user_id)) {
          const stats = customerStats.get(order.user_id);
          stats.totalSpent += order.total || 0;
        }
      }
    }

    const customersArray = Array.from(uniqueCustomers.entries()).map(([userId, profile]) => ({
      ...profile,
      orders: customerStats.get(userId)?.orders || 0,
      totalSpent: customerStats.get(userId)?.totalSpent || 0,
      lastOrderDate: new Date().toISOString(),
    }));

    return {
      customers: customersArray.slice(input.offset, input.offset + input.limit),
      total: customersArray.length,
      hasMore: (input.offset + input.limit) < customersArray.length,
    };
  });
