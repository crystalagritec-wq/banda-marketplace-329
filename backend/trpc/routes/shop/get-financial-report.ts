import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const getFinancialReportProcedure = protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Financial Report] Generating report for vendor:', input.vendorId);

    const { data: orders, error: ordersError } = await ctx.supabase
      .from('orders')
      .select(`
        id,
        total,
        subtotal,
        delivery_fee,
        payment_status,
        status,
        created_at,
        order_items (
          quantity,
          price,
          product_name
        )
      `)
      .eq('seller_id', input.vendorId)
      .gte('created_at', input.startDate)
      .lte('created_at', input.endDate)
      .order('created_at', { ascending: true });

    if (ordersError) {
      console.error('[Financial Report] Error fetching orders:', ordersError);
      throw new Error('Failed to generate financial report');
    }

    const { data: transactions, error: transactionsError } = await ctx.supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', input.vendorId)
      .gte('created_at', input.startDate)
      .lte('created_at', input.endDate)
      .order('created_at', { ascending: true });

    if (transactionsError) {
      console.log('[Financial Report] Error fetching transactions:', transactionsError);
    }

    const totalRevenue = orders
      ?.filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
    const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const existing = productSales.get(item.product_name) || { name: item.product_name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.product_name, existing);
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const dailyRevenue = orders?.reduce((acc: any, order) => {
      if (order.payment_status === 'paid') {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (order.total || 0);
      }
      return acc;
    }, {});

    const withdrawals = transactions
      ?.filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

    const deposits = transactions
      ?.filter(t => t.type === 'deposit' || t.type === 'order_payment')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      summary: {
        totalRevenue,
        totalOrders,
        completedOrders,
        cancelledOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        withdrawals,
        deposits,
      },
      topProducts,
      dailyRevenue: Object.entries(dailyRevenue || {}).map(([date, revenue]) => ({
        date,
        revenue,
      })),
      transactions: transactions || [],
    };
  });
