import { protectedProcedure } from '../../create-context';

export const getMyServiceProfileProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  console.log('[GetMyServiceProfile] Fetching service profile for user:', userId);

  const { data: provider, error: providerError } = await ctx.supabase
    .from('service_providers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (providerError) {
    if (providerError.code === 'PGRST116') {
      console.log('[GetMyServiceProfile] No service profile found');
      return {
        exists: false,
        profile: null,
      };
    }
    console.error('[GetMyServiceProfile] Error fetching provider:', providerError);
    throw new Error('Failed to fetch service provider profile');
  }

  console.log('[GetMyServiceProfile] Service profile found:', provider.id);

  return {
    exists: true,
    profile: provider,
  };
});
