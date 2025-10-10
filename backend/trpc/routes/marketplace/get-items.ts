import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getMarketplaceProcedure = publicProcedure
  .input(z.object({
    category: z.string().optional(),
    location: z.string().optional(),
    search: z.string().optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    sortBy: z.enum(['newest', 'price_low', 'price_high', 'popular']).default('newest'),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    console.log('🏪 Fetching marketplace items');

    try {
      const { data, error } = await ctx.supabase.rpc('get_marketplace_items', {
        p_category: input.category || null,
        p_location: input.location || null,
        p_search: input.search || null,
        p_price_min: input.priceMin || null,
        p_price_max: input.priceMax || null,
        p_sort_by: input.sortBy,
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) {
        console.error('❌ Get marketplace error:', error);
        throw new Error('Failed to fetch marketplace items');
      }

      console.log('✅ Marketplace items fetched successfully');
      
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Get marketplace error:', error);
      throw new Error('Failed to fetch marketplace items');
    }
  });