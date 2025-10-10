import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

export function useServiceProviderDashboard() {
  const { user } = useAuth();
  
  const { data: profileData, isLoading: profileLoading } = trpc.serviceProviders.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id }
  );
  
  const { data: dashboardData, isLoading: dashboardLoading, refetch } = trpc.serviceProviders.getDashboardStats.useQuery(
    undefined,
    { enabled: !!user?.id, refetchInterval: 30000 }
  );
  
  const { data: requestsData, isLoading: requestsLoading } = trpc.serviceProviders.getServiceRequestsEnhanced.useQuery(
    { status: 'all' },
    { enabled: !!user?.id, refetchInterval: 15000 }
  );
  
  const { data: earningsData, isLoading: earningsLoading } = trpc.serviceProviders.getServiceEarningsEnhanced.useQuery(
    {},
    { enabled: !!user?.id }
  );
  
  const stats = useMemo(() => {
    if (!dashboardData?.dashboard) {
      return {
        activeRequests: 0,
        completedRequests: 0,
        totalEarnings: 0,
        rating: 0,
        pendingRequests: 0,
        todayEarnings: 0,
      };
    }
    
    const dashboard = dashboardData.dashboard;
    const todayEarnings = earningsData?.summary?.totalEarnings || 0;
    
    return {
      activeRequests: dashboard.active_requests || 0,
      completedRequests: dashboard.completed_requests || 0,
      totalEarnings: Number(dashboard.total_earnings || 0),
      rating: Number(dashboard.rating || 0),
      pendingRequests: dashboard.pending_requests || 0,
      todayEarnings: Number(todayEarnings),
    };
  }, [dashboardData, earningsData]);
  
  const recentRequests = useMemo(() => {
    return requestsData?.requests?.slice(0, 5) || [];
  }, [requestsData]);
  
  const equipment = useMemo(() => {
    return profileData?.profile?.equipment || [];
  }, [profileData]);
  
  const specializations = useMemo(() => {
    return profileData?.profile?.specializations || [];
  }, [profileData]);
  
  const isLoading = profileLoading || dashboardLoading || requestsLoading || earningsLoading;
  
  return {
    stats,
    recentRequests,
    equipment,
    specializations,
    profile: profileData?.profile,
    isLoading,
    refetch,
  };
}
