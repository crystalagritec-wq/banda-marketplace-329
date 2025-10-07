import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getServiceProviderProfileProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    console.log('[GetServiceProvider] Fetching profile for user:', userId);

    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select(`
        *,
        service_types (
          service_category
        ),
        service_equipment (
          id,
          name,
          type,
          ownership_type,
          maintenance_status,
          availability,
          photos
        ),
        service_operating_hours (
          day_of_week,
          start_time,
          end_time,
          closed
        )
      `)
      .eq('user_id', userId)
      .single();

    if (providerError) {
      if (providerError.code === 'PGRST116') {
        return null;
      }
      console.error('[GetServiceProvider] Error fetching provider:', providerError);
      throw new Error('Failed to fetch service provider profile');
    }

    console.log('[GetServiceProvider] Provider found:', provider.id);

    return {
      ...provider,
      serviceTypes: provider.service_types?.map((st: any) => st.service_category) || [],
      equipment: provider.service_equipment || [],
      operatingHours: provider.service_operating_hours || [],
    };
  });
