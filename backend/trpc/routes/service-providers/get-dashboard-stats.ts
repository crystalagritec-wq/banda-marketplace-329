import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getDashboardStatsProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log('[getDashboardStats] Fetching dashboard stats for user:', userId);

  const { data: provider, error: providerError } = await supabase
    .from('service_providers')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (providerError || !provider) {
    console.error('[getDashboardStats] Provider not found:', providerError);
    throw new Error('Service provider profile not found');
  }

  const { data: dashboard, error: dashboardError } = await supabase
    .from('service_provider_dashboard')
    .select('*')
    .eq('id', provider.id)
    .single();

  if (dashboardError) {
    console.error('[getDashboardStats] Error fetching dashboard:', dashboardError);
    throw new Error('Failed to fetch dashboard stats');
  }

  const { data: recentRequests, error: requestsError } = await supabase
    .from('service_requests')
    .select('*')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (requestsError) {
    console.warn('[getDashboardStats] Error fetching recent requests:', requestsError);
  }

  const { data: equipment, error: equipmentError } = await supabase
    .from('service_equipment')
    .select('*')
    .eq('provider_id', provider.id);

  if (equipmentError) {
    console.warn('[getDashboardStats] Error fetching equipment:', equipmentError);
  }

  console.log('[getDashboardStats] Dashboard stats fetched successfully');

  return {
    dashboard,
    recentRequests: recentRequests || [],
    equipment: equipment || [],
  };
});
