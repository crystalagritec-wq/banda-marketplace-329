import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const completeChallengeProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      challengeId: z.string(),
      rewardPoints: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Loyalty] Completing challenge:', input);

    try {
      const { data: existingPoints, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('points, challenges')
        .eq('user_id', input.userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Loyalty] Error fetching points:', fetchError);
      }

      const currentPoints = existingPoints?.points || 0;
      const challenges = existingPoints?.challenges || [];
      const updatedChallenges = challenges.map((c: any) =>
        c.id === input.challengeId ? { ...c, completed: true } : c
      );

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .upsert({
          user_id: input.userId,
          points: currentPoints + input.rewardPoints,
          challenges: updatedChallenges,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('[Loyalty] Error updating challenge:', updateError);
      }

      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: input.userId,
          event_type: 'challenge',
          points: input.rewardPoints,
          metadata: { challengeId: input.challengeId },
          created_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('[Loyalty] Error logging transaction:', transactionError);
      }

      console.log(`[Loyalty] Challenge ${input.challengeId} completed for user ${input.userId}`);

      return {
        success: true,
        pointsAwarded: input.rewardPoints,
        totalPoints: currentPoints + input.rewardPoints,
      };
    } catch (error: any) {
      console.error('[Loyalty] Complete challenge error:', error);
      return {
        success: false,
        pointsAwarded: 0,
        totalPoints: 0,
        error: error?.message || 'Failed to complete challenge',
      };
    }
  });
