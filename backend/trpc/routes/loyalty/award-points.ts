import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const awardLoyaltyPointsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      event: z.enum(['purchase', 'referral', 'review', 'streak', 'challenge']),
      amount: z.number().optional(),
      metadata: z.object({
        orderId: z.string().optional(),
        reviewId: z.string().optional(),
        referralCode: z.string().optional(),
        challengeId: z.string().optional(),
      }).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Loyalty] Awarding points:', input);

    try {
      let pointsToAward = 0;

      switch (input.event) {
        case 'purchase':
          pointsToAward = Math.max(1, Math.floor((input.amount || 0) / 100));
          break;
        case 'referral':
          pointsToAward = 100;
          break;
        case 'review':
          pointsToAward = 10;
          break;
        case 'streak':
          pointsToAward = 5;
          break;
        case 'challenge':
          pointsToAward = input.amount || 0;
          break;
      }

      const { data: existingPoints, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', input.userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Loyalty] Error fetching points:', fetchError);
      }

      const currentPoints = existingPoints?.points || 0;
      const newPoints = currentPoints + pointsToAward;

      const { error: upsertError } = await supabase
        .from('loyalty_points')
        .upsert({
          user_id: input.userId,
          points: newPoints,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) {
        console.error('[Loyalty] Error upserting points:', upsertError);
      }

      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: input.userId,
          event_type: input.event,
          points: pointsToAward,
          metadata: input.metadata || {},
          created_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('[Loyalty] Error logging transaction:', transactionError);
      }

      console.log(`[Loyalty] Awarded ${pointsToAward} points to user ${input.userId}`);

      return {
        success: true,
        pointsAwarded: pointsToAward,
        totalPoints: newPoints,
      };
    } catch (error: any) {
      console.error('[Loyalty] Award points error:', error);
      return {
        success: false,
        pointsAwarded: 0,
        totalPoints: 0,
        error: error?.message || 'Failed to award points',
      };
    }
  });
