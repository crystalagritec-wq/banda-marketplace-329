import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const searchProcedure = publicProcedure
  .input(z.object({
    query: z.string().min(1, 'Search query is required'),
    type: z.enum(['products', 'services', 'users', 'all']).default('all'),
    location: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    console.log('🔍 Searching for:', input.query);

    try {
      const { data, error } = await ctx.supabase.rpc('search_marketplace', {
        p_query: input.query,
        p_type: input.type,
        p_location: input.location || null,
        p_category: input.category || null,
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) {
        console.error('❌ Search error:', error);
        throw new Error('Failed to perform search');
      }

      console.log('✅ Search completed successfully');
      
      return {
        success: true,
        data: data || [],
        query: input.query
      };

    } catch (error) {
      console.error('❌ Search error:', error);
      throw new Error('Failed to perform search');
    }
  });