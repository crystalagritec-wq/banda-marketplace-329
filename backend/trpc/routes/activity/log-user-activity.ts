import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const logUserActivityProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['order', 'message', 'wishlist', 'review', 'product_view', 'payment', 'profile_update', 'market_insight']),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(500),
    metadata: z.record(z.string(), z.any()).optional(),
    status: z.enum(['completed', 'pending', 'failed']).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { type, title, description, metadata, status } = input;
    const userId = ctx.user.id;

    try {
      const { data: activity, error } = await ctx.supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          type,
          title,
          description,
          metadata: metadata || {},
          status: status || 'completed',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging user activity:', error);
        throw new Error('Failed to log user activity');
      }

      return {
        success: true,
        activity: {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.created_at,
          metadata: activity.metadata,
          status: activity.status,
        },
      };
    } catch (error) {
      console.error('Error in logUserActivityProcedure:', error);
      throw new Error('Failed to log user activity');
    }
  });