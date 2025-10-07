import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const sendUserAlertProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['order', 'payment', 'message', 'system', 'promotion']),
    title: z.string(),
    message: z.string(),
    data: z.record(z.string(), z.any()).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('🔔 Sending alert to:', userId);

    try {
      const { data: result, error } = await ctx.supabase.rpc('send_user_alert', {
        p_user_id: userId,
        p_type: input.type,
        p_title: input.title,
        p_message: input.message,
        p_data: input.data ? JSON.stringify(input.data) : null
      });

      if (error) {
        console.error('❌ Send alert error:', error);
        throw new Error('Failed to send alert');
      }

      console.log('✅ Alert sent successfully');
      
      return {
        success: true,
        message: 'Alert sent successfully'
      };

    } catch (error) {
      console.error('❌ Send alert error:', error);
      throw new Error('Failed to send alert');
    }
  });