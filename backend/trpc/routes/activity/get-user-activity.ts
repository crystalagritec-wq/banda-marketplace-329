import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const getUserActivityProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
    type: z.enum(['order', 'message', 'wishlist', 'review', 'product_view', 'payment', 'profile_update', 'market_insight']).optional(),
  }))
  .query(async ({ input, ctx }) => {
    const { limit, offset, type } = input;
    const userId = ctx.user.id;

    try {
      // Build the base query
      let query = ctx.supabase
        .from('user_activities')
        .select(`
          id,
          type,
          title,
          description,
          metadata,
          status,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Add type filter if specified
      if (type) {
        query = query.eq('type', type);
      }

      const { data: activities, error } = await query;

      if (error) {
        console.error('Error fetching user activities:', error);
        throw new Error('Failed to fetch user activities');
      }

      // Transform the data to match the frontend interface
      const transformedActivities = activities?.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.created_at,
        metadata: activity.metadata || {},
        status: activity.status,
      })) || [];

      return {
        activities: transformedActivities,
        hasMore: activities?.length === limit,
      };
    } catch (error) {
      console.error('Error in getUserActivityProcedure:', error);
      throw new Error('Failed to fetch user activities');
    }
  });