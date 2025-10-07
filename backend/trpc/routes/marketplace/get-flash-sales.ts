import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getFlashSalesProcedure = protectedProcedure
  .input(z.object({
    active: z.boolean().default(true)
  }))
  .query(async ({ input, ctx }) => {
    console.log('⚡ Fetching flash sales');

    try {
      const { data, error } = await ctx.supabase.rpc('get_flash_sales', {
        p_active_only: input.active
      });

      if (error) {
        console.error('❌ Get flash sales error:', error);
        throw new Error('Failed to fetch flash sales');
      }

      console.log('✅ Flash sales fetched successfully');
      
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Get flash sales error:', error);
      throw new Error('Failed to fetch flash sales');
    }
  });