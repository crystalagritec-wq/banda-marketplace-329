import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const getLogisticsProfileProcedure = protectedProcedure.query(async ({ ctx }) => {
  const { supabase, user } = ctx;

  console.log('[GetLogisticsProfile] Fetching logistics profile for user:', user.id);

  const { data: ownerProfile, error: ownerError } = await supabase
    .from('logistics_owners')
    .select('*, logistics_vehicles(*)')
    .eq('user_id', user.id)
    .single();

  if (!ownerError && ownerProfile) {
    console.log('[GetLogisticsProfile] Found owner profile');
    return {
      role: 'owner' as const,
      profile: ownerProfile,
    };
  }

  const { data: driverProfile, error: driverError } = await supabase
    .from('logistics_drivers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!driverError && driverProfile) {
    console.log('[GetLogisticsProfile] Found driver profile');
    return {
      role: 'driver' as const,
      profile: driverProfile,
    };
  }

  console.log('[GetLogisticsProfile] No logistics profile found');
  return {
    role: null,
    profile: null,
  };
});
