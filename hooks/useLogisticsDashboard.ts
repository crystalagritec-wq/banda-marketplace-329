import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';
import { useMemo } from 'react';

export function useLogisticsDashboard(role: 'owner' | 'driver' = 'driver') {
  const { user } = useAuth();
  
  const { data: deliveriesData, isLoading: isDeliveriesLoading, refetch: refetchDeliveries } = 
    trpc.logistics.getDriverDeliveries.useQuery(
      { 
        driverId: user?.id || '',
        status: 'all',
        limit: 20
      },
      { enabled: !!user?.id && role === 'driver' }
    );
  
  const { data: earningsData, isLoading: isEarningsLoading, refetch: refetchEarnings } = 
    trpc.logistics.getDriverEarnings.useQuery(
      { driverId: user?.id || '' },
      { enabled: !!user?.id && role === 'driver' }
    );

  const { data: providerEarningsData, isLoading: isProviderEarningsLoading } = 
    trpc.logistics.getProviderEarnings.useQuery(
      { providerId: user?.id || '' },
      { enabled: !!user?.id && role === 'owner' }
    );

  const stats = useMemo(() => {
    if (role === 'driver') {
      const deliveries = deliveriesData?.deliveries || [];
      const activeDeliveries = deliveries.filter(d => 
        d.status === 'assigned' || d.status === 'picked_up' || d.status === 'in_transit'
      );
      const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
      
      return {
        activeDeliveries: activeDeliveries.length,
        completedDeliveries: completedDeliveries.length,
        todayEarnings: 0,
        totalEarnings: earningsData?.summary?.totalNet || 0,
        pendingPayout: earningsData?.summary?.totalPending || 0,
        rating: 0,
      };
    } else {
      return {
        activeDeliveries: 0,
        completedDeliveries: providerEarningsData?.summary?.completedTrips || 0,
        todayEarnings: 0,
        totalEarnings: providerEarningsData?.summary?.netAmount || 0,
        pendingPayout: providerEarningsData?.summary?.pendingAmount || 0,
        rating: 0,
      };
    }
  }, [role, deliveriesData, earningsData, providerEarningsData]);

  const deliveries = useMemo(() => 
    deliveriesData?.deliveries || [],
    [deliveriesData]
  );

  const activeDeliveries = useMemo(() => 
    deliveries.filter(d => 
      d.status === 'assigned' || d.status === 'picked_up' || d.status === 'in_transit'
    ),
    [deliveries]
  );

  const isLoading = isDeliveriesLoading || isEarningsLoading || isProviderEarningsLoading;

  const refetch = async () => {
    await Promise.all([
      refetchDeliveries(),
      refetchEarnings(),
    ]);
  };

  return {
    stats,
    deliveries,
    activeDeliveries,
    isLoading,
    refetch,
  };
}
