import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const getUserRewardsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Rewards] Fetching rewards for user:', input.userId);

    try {
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', input.userId)
        .maybeSingle();

      if (loyaltyError && loyaltyError.code !== 'PGRST116') {
        console.error('[Rewards] Error fetching loyalty data:', loyaltyError);
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('kyc_status, membership_tier, reputation_score')
        .eq('id', input.userId)
        .single();

      if (userError) {
        console.error('[Rewards] Error fetching user data:', userError);
      }

      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', input.userId)
        .order('earned_at', { ascending: false });

      if (badgesError) {
        console.error('[Rewards] Error fetching badges:', badgesError);
      }

      return {
        success: true,
        loyalty: {
          points: loyaltyData?.points || 0,
          level: loyaltyData?.level || 1,
          badges: badgesData || [],
          challenges: loyaltyData?.challenges || [],
        },
        verification: {
          status: userData?.kyc_status || 'unverified',
          isVerified: userData?.kyc_status === 'verified',
        },
        subscription: {
          tier: userData?.membership_tier || 'basic',
          reputation: userData?.reputation_score || 0,
        },
      };
    } catch (error: any) {
      console.error('[Rewards] Get rewards error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch rewards',
      };
    }
  });
