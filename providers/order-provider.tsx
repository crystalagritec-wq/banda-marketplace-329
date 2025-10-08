import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';
import { skipToken } from '@tanstack/react-query';

export type OrderStatus =
  | 'pending'
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'picked_up'
  | 'in_transit'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ServerOrderItem {
  id?: string;
  productId?: string;
  name?: string;
  image?: string;
  image_url?: string;
  vendor?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
}

export interface ServerOrder {
  id: string;
  status: OrderStatus | string;
  total?: number;
  createdAt?: string | Date;
  created_at?: string;
  items?: ServerOrderItem[];
  delivery_fee?: number;
  service_fee?: number;
  seller?: {
    id: string;
    name: string;
    phone: string;
  };
  driver?: any;
  tracking_updates?: any[];
}

type ActiveOrdersResponse = {
  success: boolean;
  orders: ServerOrder[];
  count: number;
};

export const [OrderProvider, useOrders] = createContextHook(() => {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const userId = user?.id;
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const activeOrdersQuery = trpc.orders.getActiveOrders.useQuery(
    userId ? { user_id: userId } : skipToken,
    {
      enabled: !!userId,
      refetchInterval: 30000,
      staleTime: 10000,
      retry: 2,
    }
  );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onMutate: async (vars) => {
      console.log('[OrderProvider] onMutate updateStatus', vars);
      if (!userId) return { prev: undefined };
      
      await utils.orders.getActiveOrders.cancel({ user_id: userId });
      const prev = utils.orders.getActiveOrders.getData({ user_id: userId });
      
      if (prev && Array.isArray(prev.orders)) {
        utils.orders.getActiveOrders.setData(
          { user_id: userId },
          {
            ...prev,
            orders: prev.orders.map((o) => 
              o.id === vars.orderId ? { ...o, status: vars.status } : o
            ),
          }
        );
      }
      return { prev };
    },
    onError(error: unknown, _vars, ctx) {
      console.error('[OrderProvider] updateStatus error', error);
      if (ctx?.prev && userId) {
        utils.orders.getActiveOrders.setData({ user_id: userId }, ctx.prev);
      }
    },
    onSettled() {
      if (userId) {
        utils.orders.getActiveOrders.invalidate({ user_id: userId });
        setLastRefresh(new Date());
      }
    },
  });

  const refetchActive = useCallback(async () => {
    console.log('[OrderProvider] refetchActive');
    try {
      await activeOrdersQuery.refetch();
      setLastRefresh(new Date());
    } catch (e) {
      console.error('[OrderProvider] refetchActive error', e);
    }
  }, [activeOrdersQuery]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const normalized = status === 'shipped' ? 'in_transit' : status === 'pending' ? 'placed' : status;
      const backendStatus = normalized as
        | 'confirmed'
        | 'placed'
        | 'packed'
        | 'picked_up'
        | 'cancelled'
        | 'delivered'
        | 'in_transit';
      await updateStatusMutation.mutateAsync({ orderId, status: backendStatus });
    },
    [updateStatusMutation]
  );

  const normalizedOrders = useMemo(() => {
    const data = activeOrdersQuery.data as ActiveOrdersResponse | undefined;
    if (!data?.orders) return [];
    
    return data.orders.map((order) => ({
      ...order,
      createdAt: order.created_at ? new Date(order.created_at) : order.createdAt ? new Date(order.createdAt) : new Date(),
      items: (order.items || []).map((item) => ({
        ...item,
        image: item.image_url || item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      })),
    }));
  }, [activeOrdersQuery.data]);

  const value = useMemo(
    () => ({
      activeOrders: normalizedOrders,
      isLoading: activeOrdersQuery.isLoading,
      isRefetching: activeOrdersQuery.isRefetching,
      error: activeOrdersQuery.error,
      lastRefresh,
      refetchActive,
      updateStatus,
    }),
    [normalizedOrders, activeOrdersQuery.isLoading, activeOrdersQuery.isRefetching, activeOrdersQuery.error, lastRefresh, refetchActive, updateStatus]
  );

  return value;
});
