import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getNotificationsProcedure = protectedProcedure
  .input(z.object({
    unreadOnly: z.boolean().default(false),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('🔔 Fetching notifications for:', userId);

    try {
      const { data, error } = await ctx.supabase.rpc('get_user_notifications', {
        p_user_id: userId,
        p_unread_only: input.unreadOnly,
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) {
        console.error('❌ Get notifications error:', error);
        throw new Error('Failed to fetch notifications');
      }

      console.log('✅ Notifications fetched successfully');
      
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Get notifications error:', error);
      throw new Error('Failed to fetch notifications');
    }
  });