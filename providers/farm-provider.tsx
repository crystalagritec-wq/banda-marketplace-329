import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  type: string[];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  size?: number;
  size_unit?: 'acres' | 'hectares';
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FarmRecord {
  id: string;
  farm_id: string;
  record_type: string;
  date: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  income?: number;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FarmTask {
  id: string;
  farm_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export const [FarmProvider, useFarm] = createContextHook(() => {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const farmsQuery = trpc.farm.getFarms.useQuery();

  const dashboardQuery = trpc.farm.getDashboard.useQuery(
    { farmId: selectedFarmId! },
    { enabled: !!selectedFarmId }
  );

  const createFarmMutation = trpc.farm.createFarm.useMutation({
    onSuccess: () => {
      farmsQuery.refetch();
    },
  });

  const addRecordMutation = trpc.farm.addRecord.useMutation({
    onSuccess: () => {
      if (selectedFarmId) {
        dashboardQuery.refetch();
      }
    },
  });

  const addTaskMutation = trpc.farm.addTask.useMutation({
    onSuccess: () => {
      if (selectedFarmId) {
        dashboardQuery.refetch();
      }
    },
  });

  const updateTaskMutation = trpc.farm.updateTask.useMutation({
    onSuccess: () => {
      if (selectedFarmId) {
        dashboardQuery.refetch();
      }
    },
  });

  const farms = useMemo(() => farmsQuery.data?.farms || [], [farmsQuery.data]);

  const selectedFarm = useMemo(
    () => farms.find((f) => f.id === selectedFarmId) || null,
    [farms, selectedFarmId]
  );

  const createFarm = useCallback(
    async (farmData: {
      name: string;
      type: string[];
      location: { latitude: number; longitude: number; address?: string };
      size?: number;
      sizeUnit?: 'acres' | 'hectares';
    }) => {
      return createFarmMutation.mutateAsync(farmData);
    },
    [createFarmMutation]
  );

  const addRecord = useCallback(
    async (recordData: {
      farmId: string;
      recordType: string;
      date: string;
      quantity?: number;
      unit?: string;
      cost?: number;
      income?: number;
      notes?: string;
      metadata?: Record<string, any>;
    }) => {
      return addRecordMutation.mutateAsync(recordData);
    },
    [addRecordMutation]
  );

  const addTask = useCallback(
    async (taskData: {
      farmId: string;
      title: string;
      description?: string;
      dueDate: string;
      priority?: 'low' | 'medium' | 'high';
      category?: string;
    }) => {
      return addTaskMutation.mutateAsync(taskData);
    },
    [addTaskMutation]
  );

  const updateTask = useCallback(
    async (taskData: {
      taskId: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
    }) => {
      return updateTaskMutation.mutateAsync(taskData);
    },
    [updateTaskMutation]
  );

  const selectFarm = useCallback((farmId: string | null) => {
    setSelectedFarmId(farmId);
  }, []);

  return useMemo(
    () => ({
      farms,
      selectedFarm,
      selectedFarmId,
      dashboard: dashboardQuery.data,
      isLoadingFarms: farmsQuery.isLoading,
      isLoadingDashboard: dashboardQuery.isLoading,
      createFarm,
      addRecord,
      addTask,
      updateTask,
      selectFarm,
      refetchFarms: farmsQuery.refetch,
      refetchDashboard: dashboardQuery.refetch,
    }),
    [
      farms,
      selectedFarm,
      selectedFarmId,
      dashboardQuery.data,
      farmsQuery.isLoading,
      dashboardQuery.isLoading,
      createFarm,
      addRecord,
      addTask,
      updateTask,
      selectFarm,
      farmsQuery.refetch,
      dashboardQuery.refetch,
    ]
  );
});
