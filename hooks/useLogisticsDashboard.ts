import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';
import { useMemo } from 'react';

export interface LogisticsStats {
  activeDeliveries: number;
  completedDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
  rating: number;
  completionRate: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: string;
  providerName?: string;
  vehicleType?: string;
  providerRating?: number;
  cost?: number;
  pooled: boolean;
  eta: string;
  route: any;
  createdAt: string;
  orderCount?: number;
  payout?: number;
  payoutStatus?: string;
}

export interface LogisticsEarnings {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  pendingPayouts: number;
}

export function useLogisticsDashboard(role: 'owner' | 'driver' = 'driver') {
  const { user } = useAuth();

  // Fetch deliveries
  const deliveriesQuery = trpc.logistics.getDeliveries.useQuery(
    {
      userId: user?.id || '',
      role: role === 'owner' ? 'provider' : 'buyer',
      status: 'all',
    },
    { 
      enabled: !!user?.id,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch earnings
  const earningsQuery = trpc.logistics.getProviderEarnings.useQuery(
    { providerId: user?.id || '', period: 'month' },
    { enabled: !!user?.id }
  );

  // Compute stats
  const stats: LogisticsStats = useMemo(() => {
    const deliveries = deliveriesQuery.data?.deliveries || deliveriesQuery.data?.assignments || [];
    const earnings = earningsQuery.data?.summary;

    const activeDeliveries = deliveries.filter(
      (d: any) => d.status === 'in_progress' || d.status === 'pending'
    ).length;

    const completedDeliveries = deliveries.filter(
      (d: any) => d.status === 'delivered' || d.status === 'completed'
    ).length;

    const totalDeliveries = deliveries.length;
    const completionRate = totalDeliveries > 0 
      ? (completedDeliveries / totalDeliveries) * 100 
      : 0;

    return {
      activeDeliveries,
      completedDeliveries,
      todayEarnings: earnings?.netAmount || 0,
      totalEarnings: earnings?.netAmount || 0,
      rating: 4.5, // TODO: Get from profile
      completionRate: Math.round(completionRate),
    };
  }, [deliveriesQuery.data, earningsQuery.data]);

  // Get active deliveries
  const activeDeliveries: Delivery[] = useMemo(() => {
    const deliveries = deliveriesQuery.data?.deliveries || deliveriesQuery.data?.assignments || [];
    return deliveries.filter(
      (d: any) => d.status === 'in_progress' || d.status === 'pending'
    ).map((d: any) => ({
      ...d,
      cost: d.cost || d.payout || 0,
    }));
  }, [deliveriesQuery.data]);

  // Get recent deliveries (last 5)
  const recentDeliveries: Delivery[] = useMemo(() => {
    const deliveries = deliveriesQuery.data?.deliveries || deliveriesQuery.data?.assignments || [];
    return deliveries.slice(0, 5).map((d: any) => ({
      ...d,
      cost: d.cost || d.payout || 0,
    }));
  }, [deliveriesQuery.data]);

  // Get earnings breakdown
  const earnings: LogisticsEarnings = useMemo(() => {
    const summary = earningsQuery.data?.summary;
    return {
      todayEarnings: summary?.netAmount || 0,
      weekEarnings: summary?.netAmount || 0,
      monthEarnings: summary?.netAmount || 0,
      totalEarnings: summary?.netAmount || 0,
      pendingPayouts: summary?.pendingAmount || 0,
    };
  }, [earningsQuery.data]);

  const isLoading = deliveriesQuery.isLoading || earningsQuery.isLoading;
  const isError = deliveriesQuery.isError || earningsQuery.isError;

  const refetch = () => {
    deliveriesQuery.refetch();
    earningsQuery.refetch();
  };

  return {
    stats,
    activeDeliveries,
    recentDeliveries,
    earnings,
    isLoading,
    isError,
    refetch,
  };
}
