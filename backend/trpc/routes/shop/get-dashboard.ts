import { publicProcedure } from '../../create-context';
import { z } from 'zod';

export const getShopDashboardProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    period: z.enum(['today', 'week', 'month']).optional().default('week'),
  }))
  .query(async ({ input }) => {
    console.log('[Shop Dashboard] Fetching dashboard data for user:', input.userId);

    return {
      stats: {
        todaySales: 12500,
        weekSales: 45800,
        monthSales: 187600,
        pendingOrders: 5,
        confirmedOrders: 12,
        deliveredOrders: 34,
        totalProducts: 15,
        lowStockProducts: 3,
        views: 234,
        walletBalance: 38900,
      },
      recentOrders: [
        {
          id: '1',
          customerName: 'John Doe',
          amount: 1500,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          amount: 2300,
          status: 'confirmed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      topProducts: [
        { id: '1', name: 'Fresh Tomatoes', sales: 45, revenue: 6750 },
        { id: '2', name: 'Organic Carrots', sales: 38, revenue: 4560 },
        { id: '3', name: 'Sweet Potatoes', sales: 32, revenue: 3200 },
      ],
    };
  });
