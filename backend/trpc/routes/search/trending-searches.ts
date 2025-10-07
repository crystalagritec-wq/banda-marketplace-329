import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const getTrendingSearchesProcedure = protectedProcedure.query(async ({ ctx }) => {
  console.log("[Trending Searches] Fetching trending searches");

  try {
    const { data, error } = await supabase
      .from('trending_searches')
      .select('query, search_count')
      .order('search_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[Trending Searches] Database error:', error);
      throw error;
    }

    return {
      trending: (data || []).map(item => ({
        query: item.query,
        count: item.search_count,
      })),
    };
  } catch (error) {
    console.error('[Trending Searches] Error, falling back to mock data:', error);
    
    return {
      trending: [
        { query: "chicken feed", count: 1250 },
        { query: "dairy cows", count: 980 },
        { query: "veterinary services", count: 850 },
        { query: "tractor hire", count: 720 },
        { query: "layer cages", count: 650 },
        { query: "maize seeds", count: 580 },
        { query: "goat feed", count: 520 },
        { query: "irrigation equipment", count: 480 },
      ],
    };
  }
});

export const getRecentSearchesProcedure = protectedProcedure.query(async ({ ctx }) => {
  console.log("[Recent Searches] Fetching user recent searches");

  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('query, created_at')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[Recent Searches] Database error:', error);
      throw error;
    }

    const uniqueSearches = new Map<string, string>();
    (data || []).forEach(item => {
      if (!uniqueSearches.has(item.query) && item.query) {
        uniqueSearches.set(item.query, item.created_at);
      }
    });

    return {
      recent: Array.from(uniqueSearches.entries()).map(([query, timestamp]) => ({
        query,
        timestamp,
      })),
    };
  } catch (error) {
    console.error('[Recent Searches] Error, falling back to mock data:', error);
    
    return {
      recent: [
        { query: "chicken feed", timestamp: new Date().toISOString() },
        { query: "cages", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { query: "veterinary", timestamp: new Date(Date.now() - 7200000).toISOString() },
      ],
    };
  }
});

export const saveSearchProcedure = protectedProcedure
  .input(
    z.object({
      query: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Save Search] Saving search:", input.query);

    try {
      const { error: historyError } = await supabase
        .from('search_history')
        .insert({
          user_id: ctx.user.id,
          query: input.query,
          search_type: 'text',
          results_count: 0,
        });

      if (historyError) {
        console.error('[Save Search] Error saving to history:', historyError);
      }

      const { error: trendingError } = await supabase
        .rpc('track_trending_search', { search_query: input.query });

      if (trendingError) {
        console.error('[Save Search] Error tracking trending:', trendingError);
      }

      return { success: true };
    } catch (error) {
      console.error('[Save Search] Error:', error);
      return { success: false };
    }
  });
