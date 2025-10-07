import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const getLoyaltyPointsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Loyalty] Fetching points for user:', input.userId);

    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', input.userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[Loyalty] Error fetching points:', error);
        return {
          success: false,
          points: 0,
          badges: [],
          challenges: [],
        };
      }

      return {
        success: true,
        points: data?.points || 0,
        badges: data?.badges || [],
        challenges: data?.challenges || [],
      };
    } catch (error: any) {
      console.error('[Loyalty] Get points error:', error);
      return {
        success: false,
        points: 0,
        badges: [],
        challenges: [],
        error: error?.message || 'Failed to fetch points',
      };
    }
  });
