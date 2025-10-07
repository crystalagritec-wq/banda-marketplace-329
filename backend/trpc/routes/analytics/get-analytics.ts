import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getAnalyticsProcedure = protectedProcedure
  .input(z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('month'),
    type: z.enum(['sales', 'orders', 'revenue', 'all']).default('all')
  }))
  .query(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('📊 Fetching analytics for:', userId);

    try {
      const { data, error } = await ctx.supabase.rpc('get_user_analytics', {
        p_user_id: userId,
        p_period: input.period,
        p_type: input.type
      });

      if (error) {
        console.error('❌ Get analytics error:', error);
        throw new Error('Failed to fetch analytics');
      }

      console.log('✅ Analytics fetched successfully');
      
      return {
        success: true,
        data: data || {
          sales: { total: 0, change: 0 },
          orders: { total: 0, change: 0 },
          revenue: { total: 0, change: 0 },
          chart_data: []
        }
      };

    } catch (error) {
      console.error('❌ Get analytics error:', error);
      throw new Error('Failed to fetch analytics');
    }
  });