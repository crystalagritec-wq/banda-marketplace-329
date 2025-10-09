import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';
import { useMemo } from 'react';

export interface ServiceProviderStats {
  activeRequests: number;
  completedRequests: number;
  totalEarnings: number;
  rating: number;
  pendingEarnings: number;
  responseTime: string;
}

export interface ServiceRequest {
  id: string;
  service_category: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  requester: {
    id: string;
    email?: string;
    phone?: string;
  };
  location?: string;
  budget?: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance';
}

export function useServiceProviderDashboard() {
  const { user } = useAuth();

  // Fetch dashboard stats
  const statsQuery = trpc.serviceProviders.getDashboardStats.useQuery(
    undefined,
    { 
      enabled: !!user?.id,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch recent requests
  const requestsQuery = trpc.serviceProviders.getServiceRequests.useQuery(
    { status: 'all' },
    { 
      enabled: !!user?.id,
      refetchInterval: 30000,
    }
  );

  // Note: Earnings query will be added when backend procedure is created
  // For now, we'll use dashboard stats only

  // Compute stats
  const stats: ServiceProviderStats = useMemo(() => {
    const dashboard = statsQuery.data?.dashboard;

    return {
      activeRequests: dashboard?.active_requests || 0,
      completedRequests: dashboard?.completed_requests || 0,
      totalEarnings: dashboard?.total_earnings || 0,
      rating: dashboard?.rating || 0,
      pendingEarnings: dashboard?.pending_earnings || 0,
      responseTime: dashboard?.response_time || '< 2 hours',
    };
  }, [statsQuery.data]);

  // Get recent requests (last 5)
  const recentRequests: ServiceRequest[] = useMemo(() => {
    return (requestsQuery.data?.requests || []).slice(0, 5);
  }, [requestsQuery.data]);

  // Get pending requests count
  const pendingRequestsCount = useMemo(() => {
    return (requestsQuery.data?.requests || []).filter(
      (r: ServiceRequest) => r.status === 'pending'
    ).length;
  }, [requestsQuery.data]);

  // Get equipment list
  const equipment: Equipment[] = useMemo(() => {
    return statsQuery.data?.equipment || [];
  }, [statsQuery.data]);

  const isLoading = statsQuery.isLoading || requestsQuery.isLoading;
  const isError = statsQuery.isError || requestsQuery.isError;

  const refetch = () => {
    statsQuery.refetch();
    requestsQuery.refetch();
  };

  return {
    stats,
    recentRequests,
    pendingRequestsCount,
    equipment,
    isLoading,
    isError,
    refetch,
  };
}
