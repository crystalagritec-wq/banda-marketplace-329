import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getMarketplacePostsProcedure = publicProcedure
  .input(
    z.object({
      category: z.string().optional(),
      county: z.string().optional(),
      searchQuery: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input }) => {
    console.log('[getMarketplacePosts] Fetching posts with filters:', input);

    let query = supabase
      .from('service_marketplace_listings')
      .select('*', { count: 'exact' });

    if (input.category) {
      query = query.eq('category', input.category);
    }

    if (input.county) {
      query = query.eq('location_county', input.county);
    }

    if (input.searchQuery) {
      query = query.or(
        `title.ilike.%${input.searchQuery}%,description.ilike.%${input.searchQuery}%,service_name.ilike.%${input.searchQuery}%`
      );
    }

    const { data: posts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (error) {
      console.error('[getMarketplacePosts] Error fetching posts:', error);
      throw new Error('Failed to fetch marketplace posts');
    }

    console.log('[getMarketplacePosts] Found posts:', posts?.length || 0);

    return {
      posts: posts || [],
      total: count || 0,
    };
  });
