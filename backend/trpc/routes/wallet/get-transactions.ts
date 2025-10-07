import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getUserTransactionsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('💳 Fetching transactions for:', userId);

    try {
      const { data, error } = await ctx.supabase.rpc('get_user_transactions', {
        p_user_id: userId,
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) {
        console.error('❌ Transactions fetch error:', error);
        throw new Error('Failed to fetch transactions');
      }

      console.log('✅ Transactions fetched successfully');
      
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Get transactions error:', error);
      throw new Error('Failed to fetch transactions');
    }
  });