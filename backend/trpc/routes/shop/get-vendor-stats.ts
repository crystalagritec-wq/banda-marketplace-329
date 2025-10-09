import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const getVendorStatsProcedure = protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    period: z.enum(['today', 'week', 'month', 'year']).optional().default('week'),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Vendor Stats] Fetching stats for vendor:', input.vendorId);

    const now = new Date();
    let startDate: Date;

    switch (input.period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    const { data: orders, error: ordersError } = await ctx.supabase
      .from('orders')
      .select('id, status, total, payment_status, created_at, buyer_id')
      .eq('seller_id', input.vendorId)
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      console.error('[Vendor Stats] Error fetching orders:', ordersError);
      throw new Error('Failed to fetch stats');
    }

    const { data: products, error: productsError } = await ctx.supabase
      .from('marketplace_products')
      .select('id, stock_quantity, views')
      .eq('user_id', input.vendorId);

    if (productsError) {
      console.error('[Vendor Stats] Error fetching products:', productsError);
    }

    const { data: wallet, error: walletError } = await ctx.supabase
      .from('agripay_wallets')
      .select('id, balance, reserve_balance')
      .eq('user_id', input.vendorId)
      .single();

    if (walletError) {
      console.log('[Vendor Stats] No AgriPay wallet found for vendor');
    }

    let totalEarnings = 0;
    if (wallet?.id) {
      const { data: transactions } = await ctx.supabase
        .from('wallet_transactions')
        .select('amount, type')
        .eq('wallet_id', wallet.id)
        .in('type', ['reserve_release', 'payment'])
        .gte('created_at', startDate.toISOString());

      totalEarnings = transactions
        ?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    }

    const totalRevenue = orders
      ?.filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const confirmedOrders = orders?.filter(o => o.status === 'confirmed' || o.status === 'processing').length || 0;
    const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0;
    const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => (p.stock_quantity || 0) < 10).length || 0;
    const outOfStockProducts = products?.filter(p => (p.stock_quantity || 0) === 0).length || 0;
    const totalViews = products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setTime(previousPeriodStart.getTime() - (now.getTime() - startDate.getTime()));

    const { data: previousOrders } = await ctx.supabase
      .from('orders')
      .select('total, payment_status')
      .eq('seller_id', input.vendorId)
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousRevenue = previousOrders
      ?.filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      revenue: {
        total: totalRevenue,
        change: Math.round(revenueChange * 10) / 10,
      },
      orders: {
        total: orders?.length || 0,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      views: totalViews,
      wallet: {
        balance: wallet?.balance || 0,
        reserveBalance: wallet?.reserve_balance || 0,
        earnings: totalEarnings,
      },
      customers: {
        total: new Set(orders?.map(o => o.buyer_id)).size || 0,
      },
    };
  });
