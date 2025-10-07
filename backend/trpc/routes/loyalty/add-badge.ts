import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const addBadgeProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      badge: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        earnedAt: z.string(),
      }),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Loyalty] Adding badge:', input);

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('badges')
        .eq('user_id', input.userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Loyalty] Error fetching badges:', fetchError);
      }

      const badges = existingData?.badges || [];
      const badgeExists = badges.some((b: any) => b.id === input.badge.id);

      if (badgeExists) {
        console.log('[Loyalty] Badge already exists');
        return {
          success: true,
          message: 'Badge already earned',
        };
      }

      const updatedBadges = [...badges, input.badge];

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .upsert({
          user_id: input.userId,
          badges: updatedBadges,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('[Loyalty] Error adding badge:', updateError);
      }

      console.log(`[Loyalty] Badge ${input.badge.id} added for user ${input.userId}`);

      return {
        success: true,
        message: 'Badge earned successfully',
      };
    } catch (error: any) {
      console.error('[Loyalty] Add badge error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to add badge',
      };
    }
  });
