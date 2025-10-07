import { publicProcedure } from '../../create-context';
import { z } from 'zod';

export const getShopAnalyticsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    period: z.enum(['today', 'week', 'month']).optional().default('week'),
  }))
  .query(async ({ input }) => {
    console.log('[Shop Analytics] Fetching analytics for user:', input.userId, 'period:', input.period);

    return {
      stats: {
        revenue: 45800,
        revenueChange: 12,
        orders: 34,
        ordersChange: 8,
        views: 1234,
        viewsChange: -5,
        customers: 28,
        customersChange: 15,
        avgOrderValue: 1347,
        conversionRate: 2.8,
      },
      topProducts: [
        { id: '1', name: 'Fresh Tomatoes', sales: 45, revenue: 6750 },
        { id: '2', name: 'Organic Carrots', sales: 38, revenue: 4560 },
        { id: '3', name: 'Sweet Potatoes', sales: 32, revenue: 3200 },
        { id: '4', name: 'Fresh Milk', sales: 28, revenue: 2240 },
        { id: '5', name: 'Farm Eggs', sales: 25, revenue: 5000 },
      ],
      insights: [
        {
          type: 'positive',
          title: 'Sales are growing!',
          message: 'Your revenue increased by 12% compared to last week. Keep up the great work!',
        },
        {
          type: 'warning',
          title: 'Views decreased slightly',
          message: 'Consider adding more products or running a promotion to increase visibility.',
        },
      ],
    };
  });
