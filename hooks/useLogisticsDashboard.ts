import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

export type LogisticsRole = 'owner' | 'driver';

export function useLogisticsDashboard(role: LogisticsRole = 'driver') {
  const { user } = useAuth();
  
  const { data: profileData, isLoading: profileLoading } = trpc.logisticsInboarding.getProfile.useQuery(
    undefined,
    { enabled: !!user?.id }
  );
  
  const { data: deliveriesData, isLoading: deliveriesLoading, refetch } = trpc.logistics.getDriverDeliveriesEnhanced.useQuery(
    {},
    { enabled: !!user?.id && role === 'driver', refetchInterval: 15000 }
  );
  
  const { data: ownerDeliveriesData, isLoading: ownerDeliveriesLoading } = trpc.logistics.getDeliveries.useQuery(
    {
      userId: user?.id || '',
      role: 'provider',
      status: 'all',
    },
    { enabled: !!user?.id && role === 'owner', refetchInterval: 15000 }
  );
  
  const { data: earningsData, isLoading: earningsLoading } = trpc.logistics.getDriverEarnings.useQuery(
    { driverId: user?.id || '' },
    { enabled: !!user?.id && role === 'driver' }
  );
  
  const { data: providerEarningsData, isLoading: providerEarningsLoading } = trpc.logistics.getProviderEarnings.useQuery(
    { providerId: user?.id || '' },
    { enabled: !!user?.id && role === 'owner' }
  );
  
  const stats = useMemo(() => {
    if (role === 'driver') {
      const deliveries = deliveriesData?.deliveries || [];
      const activeDeliveries = deliveries.filter((d: any) => 
        d.status === 'in_progress' || d.status === 'pending'
      ).length;
      const completedDeliveries = deliveries.filter((d: any) => 
        d.status === 'delivered'
      ).length;
      
      return {
        activeDeliveries,
        completedDeliveries,
        todayEarnings: Number(earningsData?.summary?.totalNet || 0),
        totalEarnings: Number(earningsData?.summary?.totalNet || 0),
        pendingPayouts: Number(earningsData?.summary?.totalPending || 0),
        rating: Number(profileData?.profile?.rating || 0),
      };
    } else {
      const deliveries = ownerDeliveriesData?.deliveries || [];
      const activeDeliveries = deliveries.filter((d: any) => 
        d.status === 'in_progress' || d.status === 'pending'
      ).length;
      const completedDeliveries = deliveries.filter((d: any) => 
        d.status === 'delivered'
      ).length;
      
      return {
        activeDeliveries,
        completedDeliveries,
        todayEarnings: Number(providerEarningsData?.summary?.netAmount || 0),
        totalEarnings: Number(providerEarningsData?.summary?.netAmount || 0),
        pendingPayouts: Number(providerEarningsData?.summary?.pendingAmount || 0),
        rating: Number(profileData?.profile?.rating || 0),
      };
    }
  }, [role, deliveriesData, ownerDeliveriesData, earningsData, providerEarningsData, profileData]);
  
  const deliveries = useMemo(() => {
    if (role === 'driver') {
      return deliveriesData?.deliveries || [];
    } else {
      return ownerDeliveriesData?.deliveries || [];
    }
  }, [role, deliveriesData, ownerDeliveriesData]);
  
  const recentDeliveries = useMemo(() => {
    return deliveries.slice(0, 5);
  }, [deliveries]);
  
  const isLoading = 
    profileLoading || 
    (role === 'driver' ? deliveriesLoading || earningsLoading : ownerDeliveriesLoading || providerEarningsLoading);
  
  return {
    stats,
    deliveries,
    recentDeliveries,
    profile: profileData?.profile,
    isLoading,
    refetch,
  };
}
