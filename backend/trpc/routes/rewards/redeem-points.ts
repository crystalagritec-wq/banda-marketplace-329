import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const redeemPointsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      rewardId: z.string(),
      pointsCost: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Rewards] Redeeming points:', input.pointsCost, 'for reward:', input.rewardId);

    try {
      const { data: loyaltyData, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', input.userId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch loyalty points');
      }

      const currentPoints = loyaltyData.points || 0;

      if (currentPoints < input.pointsCost) {
        return {
          success: false,
          error: 'Insufficient points',
        };
      }

      const newPoints = currentPoints - input.pointsCost;

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', input.userId);

      if (updateError) {
        throw new Error('Failed to update points');
      }

      const { error: rewardError } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: input.userId,
          reward_id: input.rewardId,
          points_spent: input.pointsCost,
          redeemed_at: new Date().toISOString(),
          status: 'pending',
        });

      if (rewardError) {
        console.error('[Rewards] Error recording redemption:', rewardError);
      }

      return {
        success: true,
        remainingPoints: newPoints,
        message: 'Reward redeemed successfully!',
      };
    } catch (error: any) {
      console.error('[Rewards] Redeem points error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to redeem points',
      };
    }
  });
