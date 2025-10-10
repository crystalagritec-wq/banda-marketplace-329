import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFarm } from '@/providers/farm-provider';
import { useTheme } from '@/providers/theme-provider';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Sprout,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  ChevronRight,
  BarChart3,
} from 'lucide-react-native';

export default function FarmDashboardScreen() {
  const theme = useTheme();
  const {
    farms,
    selectedFarm,
    selectedFarmId,
    dashboard,
    isLoadingFarms,
    isLoadingDashboard,
    selectFarm,
    refetchDashboard,
  } = useFarm();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchDashboard();
    setRefreshing(false);
  };

  if (isLoadingFarms) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Farm Dashboard', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading farms...
          </Text>
        </View>
      </View>
    );
  }

  if (farms.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Farm Dashboard', headerShown: true }} />
        <View style={styles.emptyContainer}>
          <Sprout size={64} color={theme.colors.mutedText} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Farms Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}>
            Create your first farm to start managing your agricultural operations
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/onboarding/farm/profile' as any)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Farm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Farm Dashboard',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/onboarding/farm/profile' as any)}
              style={styles.headerButton}
            >
              <Plus size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.farmSelector}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            My Farms
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[
                  styles.farmCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor:
                      selectedFarmId === farm.id
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => selectFarm(farm.id)}
              >
                <Sprout
                  size={24}
                  color={
                    selectedFarmId === farm.id
                      ? theme.colors.primary
                      : theme.colors.mutedText
                  }
                />
                <Text
                  style={[
                    styles.farmName,
                    {
                      color:
                        selectedFarmId === farm.id
                          ? theme.colors.primary
                          : theme.colors.text,
                    },
                  ]}
                >
                  {farm.name}
                </Text>
                <Text style={[styles.farmType, { color: theme.colors.mutedText }]}>
                  {farm.type.join(', ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedFarm && (
          <>
            {isLoadingDashboard ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <>
                <View style={styles.analyticsSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Overview
                  </Text>
                  <View style={styles.analyticsGrid}>
                    <View
                      style={[
                        styles.analyticsCard,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <DollarSign size={24} color="#10B981" />
                      <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
                        KSh{' '}
                        {dashboard?.analytics?.totalIncome?.toLocaleString() || '0'}
                      </Text>
                      <Text
                        style={[styles.analyticsLabel, { color: theme.colors.mutedText }]}
                      >
                        Total Income
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.analyticsCard,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <TrendingUp size={24} color="#EF4444" />
                      <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
                        KSh{' '}
                        {dashboard?.analytics?.totalExpenses?.toLocaleString() || '0'}
                      </Text>
                      <Text
                        style={[styles.analyticsLabel, { color: theme.colors.mutedText }]}
                      >
                        Total Expenses
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.analyticsCard,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <BarChart3 size={24} color={theme.colors.primary} />
                      <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
                        KSh {dashboard?.analytics?.netProfit?.toLocaleString() || '0'}
                      </Text>
                      <Text
                        style={[styles.analyticsLabel, { color: theme.colors.mutedText }]}
                      >
                        Net Profit
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedFarm.type.includes('Poultry') &&
                  dashboard?.analytics?.eggProduction && (
                    <View style={styles.productionSection}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Poultry Production
                      </Text>
                      <View style={styles.productionGrid}>
                        <View
                          style={[
                            styles.productionCard,
                            { backgroundColor: theme.colors.card },
                          ]}
                        >
                          <Text
                            style={[
                              styles.productionValue,
                              { color: theme.colors.text },
                            ]}
                          >
                            {dashboard.analytics.eggProduction}
                          </Text>
                          <Text
                            style={[
                              styles.productionLabel,
                              { color: theme.colors.mutedText },
                            ]}
                          >
                            Eggs Produced
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.productionCard,
                            { backgroundColor: theme.colors.card },
                          ]}
                        >
                          <Text
                            style={[
                              styles.productionValue,
                              { color: theme.colors.text },
                            ]}
                          >
                            {dashboard.analytics.feedUsed} kg
                          </Text>
                          <Text
                            style={[
                              styles.productionLabel,
                              { color: theme.colors.mutedText },
                            ]}
                          >
                            Feed Used
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                {selectedFarm.type.includes('Dairy') &&
                  dashboard?.analytics?.milkYield && (
                    <View style={styles.productionSection}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Dairy Production
                      </Text>
                      <View
                        style={[
                          styles.productionCard,
                          { backgroundColor: theme.colors.card },
                        ]}
                      >
                        <Text
                          style={[styles.productionValue, { color: theme.colors.text }]}
                        >
                          {dashboard.analytics.milkYield} L
                        </Text>
                        <Text
                          style={[
                            styles.productionLabel,
                            { color: theme.colors.mutedText },
                          ]}
                        >
                          Milk Yield
                        </Text>
                      </View>
                    </View>
                  )}

                {selectedFarm.type.includes('Crops') &&
                  dashboard?.analytics?.totalHarvest && (
                    <View style={styles.productionSection}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Crop Production
                      </Text>
                      <View
                        style={[
                          styles.productionCard,
                          { backgroundColor: theme.colors.card },
                        ]}
                      >
                        <Text
                          style={[styles.productionValue, { color: theme.colors.text }]}
                        >
                          {dashboard.analytics.totalHarvest} kg
                        </Text>
                        <Text
                          style={[
                            styles.productionLabel,
                            { color: theme.colors.mutedText },
                          ]}
                        >
                          Total Harvest
                        </Text>
                      </View>
                    </View>
                  )}

                <View style={styles.quickActions}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Quick Actions
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() =>
                      router.push(
                        `/farm-add-record?farmId=${selectedFarmId}` as any
                      )
                    }
                  >
                    <Plus size={20} color={theme.colors.primary} />
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>
                      Add Record
                    </Text>
                    <ChevronRight size={20} color={theme.colors.mutedText} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() =>
                      router.push(`/farm-add-task?farmId=${selectedFarmId}` as any)
                    }
                  >
                    <Calendar size={20} color={theme.colors.primary} />
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>
                      Add Task
                    </Text>
                    <ChevronRight size={20} color={theme.colors.mutedText} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() =>
                      router.push(
                        `/farm-analytics?farmId=${selectedFarmId}` as any
                      )
                    }
                  >
                    <BarChart3 size={20} color={theme.colors.primary} />
                    <Text style={[styles.actionText, { color: theme.colors.text }]}>
                      View Analytics
                    </Text>
                    <ChevronRight size={20} color={theme.colors.mutedText} />
                  </TouchableOpacity>
                </View>

                {dashboard?.tasks && dashboard.tasks.length > 0 && (
                  <View style={styles.tasksSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      Upcoming Tasks
                    </Text>
                    {dashboard.tasks.slice(0, 5).map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={[
                          styles.taskCard,
                          { backgroundColor: theme.colors.card },
                        ]}
                        onPress={() =>
                          router.push(`/farm-task-details?taskId=${task.id}` as any)
                        }
                      >
                        <View style={styles.taskHeader}>
                          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                            {task.title}
                          </Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              {
                                backgroundColor:
                                  task.priority === 'high'
                                    ? '#FEE2E2'
                                    : task.priority === 'medium'
                                    ? '#FEF3C7'
                                    : '#DBEAFE',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityText,
                                {
                                  color:
                                    task.priority === 'high'
                                      ? '#DC2626'
                                      : task.priority === 'medium'
                                      ? '#D97706'
                                      : '#2563EB',
                                },
                              ]}
                            >
                              {task.priority}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[styles.taskDate, { color: theme.colors.mutedText }]}
                        >
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  farmSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  farmCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 150,
    borderWidth: 2,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  farmType: {
    fontSize: 12,
    marginTop: 4,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  productionSection: {
    marginBottom: 24,
  },
  productionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  productionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  productionValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  productionLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  tasksSection: {
    marginBottom: 24,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDate: {
    fontSize: 14,
  },
});
