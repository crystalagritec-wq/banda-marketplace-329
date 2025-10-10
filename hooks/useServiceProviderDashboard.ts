import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';
import { useMemo } from 'react';

export function useServiceProviderDashboard() {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = 
    trpc.serviceProviders.getDashboardStats.useQuery(
      undefined,
      { enabled: !!user?.id }
    );
  
  const { data: requestsData, isLoading: isRequestsLoading, refetch: refetchRequests } = 
    trpc.serviceProviders.getServiceRequestsEnhanced.useQuery(
      { 
        status: 'all',
        limit: 10
      },
      { enabled: !!user?.id }
    );
  
  const isProfileLoading = false;

  const stats = useMemo(() => ({
    activeRequests: dashboardData?.dashboard?.active_requests || 0,
    completedRequests: dashboardData?.dashboard?.completed_requests || 0,
    totalEarnings: dashboardData?.dashboard?.total_earnings || 0,
    todayEarnings: 0,
    rating: dashboardData?.dashboard?.rating || 0,
    totalReviews: dashboardData?.dashboard?.total_reviews || 0,
  }), [dashboardData]);

  const recentRequests = useMemo(() => 
    requestsData?.requests || [],
    [requestsData]
  );

  const equipment = useMemo(() => 
    dashboardData?.equipment || [],
    [dashboardData]
  );

  const isLoading = isDashboardLoading || isRequestsLoading || isProfileLoading;

  const refetch = async () => {
    await Promise.all([
      refetchDashboard(),
      refetchRequests(),
    ]);
  };

  return {
    stats,
    recentRequests,
    equipment,
    isLoading,
    refetch,
  };
}
