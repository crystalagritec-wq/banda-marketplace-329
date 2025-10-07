import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const markNotificationReadProcedure = protectedProcedure
  .input(z.object({
    notificationId: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('✅ Marking notification as read:', input.notificationId);

    try {
      const { error } = await ctx.supabase.rpc('mark_notification_read', {
        p_notification_id: input.notificationId,
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Mark notification read error:', error);
        throw new Error('Failed to mark notification as read');
      }

      console.log('✅ Notification marked as read successfully');
      
      return {
        success: true,
        message: 'Notification marked as read'
      };

    } catch (error) {
      console.error('❌ Mark notification read error:', error);
      throw new Error('Failed to mark notification as read');
    }
  });