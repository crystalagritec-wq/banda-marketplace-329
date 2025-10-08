import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const completeChallengeProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      challengeId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Rewards] Completing challenge:', input.challengeId, 'for user:', input.userId);

    try {
      const { data: loyaltyData, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', input.userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Failed to fetch loyalty data');
      }

      const challenges = loyaltyData?.challenges || [];
      const challenge = challenges.find((c: any) => c.id === input.challengeId);

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      if (challenge.progress >= challenge.target) {
        return {
          success: false,
          error: 'Challenge already completed',
        };
      }

      const updatedChallenges = challenges.map((c: any) =>
        c.id === input.challengeId
          ? { ...c, progress: c.target, completedAt: new Date().toISOString() }
          : c
      );

      const newPoints = (loyaltyData?.points || 0) + challenge.rewardPoints;

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .upsert({
          user_id: input.userId,
          points: newPoints,
          challenges: updatedChallenges,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw new Error('Failed to update loyalty data');
      }

      const { error: badgeError } = await supabase
        .from('user_badges')
        .insert({
          user_id: input.userId,
          badge_id: `challenge_${input.challengeId}`,
          name: challenge.title,
          description: challenge.description,
          icon_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop',
          earned_at: new Date().toISOString(),
        });

      if (badgeError) {
        console.error('[Rewards] Error creating badge:', badgeError);
      }

      return {
        success: true,
        pointsEarned: challenge.rewardPoints,
        totalPoints: newPoints,
        badgeEarned: true,
      };
    } catch (error: any) {
      console.error('[Rewards] Complete challenge error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to complete challenge',
      };
    }
  });
