import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getUserPostsProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['product', 'service', 'request', 'all']).default('all'),
    isDraft: z.boolean().optional(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('📋 Fetching user posts for:', userId);

    try {
      const { data, error } = await ctx.supabase.rpc('get_user_posts', {
        p_user_id: userId,
        p_type: input.type === 'all' ? null : input.type,
        p_is_draft: input.isDraft,
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) {
        console.error('❌ Get user posts error:', error);
        throw new Error('Failed to fetch posts');
      }

      console.log('✅ User posts fetched successfully');
      
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Get user posts error:', error);
      throw new Error('Failed to fetch posts');
    }
  });