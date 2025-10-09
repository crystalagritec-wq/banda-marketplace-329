import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Store, Package, Calendar, TrendingUp, X, Plus } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

export default function MyBoostsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'product' | 'shop'>('all');

  const boostsQuery = trpc.boost.getActiveBoosts.useQuery(
    { userId: user?.id || '', type: filter },
    { enabled: !!user?.id }
  );

  const cancelBoostMutation = trpc.boost.cancelBoost.useMutation();

  const handleCancelBoost = (boostId: string, type: string) => {
    Alert.alert(
      'Cancel Boost',
      'Are you sure you want to cancel this boost? You may receive a partial refund.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBoostMutation.mutateAsync({
                boostId,
                refund: true,
              });
              Alert.alert('Success', 'Boost cancelled successfully');
              boostsQuery.refetch();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel boost');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    boostsQuery.refetch();
  };

  if (boostsQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'My Boosts' }} />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading boosts...</Text>
        </View>
      </>
    );
  }

  const boosts = boostsQuery.data?.boosts || [];

  return (
    <>
      <Stack.Screen options={{ title: 'My Boosts' }} />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'product' && styles.filterButtonActive]}
              onPress={() => setFilter('product')}
            >
              <Text style={[styles.filterButtonText, filter === 'product' && styles.filterButtonTextActive]}>
                Products
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'shop' && styles.filterButtonActive]}
              onPress={() => setFilter('shop')}
            >
              <Text style={[styles.filterButtonText, filter === 'shop' && styles.filterButtonTextActive]}>
                Shop
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={boostsQuery.isRefetching} onRefresh={onRefresh} />
          }
        >
          {boosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Zap size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No Active Boosts</Text>
              <Text style={styles.emptyStateText}>
                Boost your products or shop to increase visibility
              </Text>
              <TouchableOpacity
                style={styles.createBoostButton}
                onPress={() => router.push('/shop-dashboard' as any)}
              >
                <Plus size={20} color="white" />
                <Text style={styles.createBoostButtonText}>Create Boost</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.boostsList}>
              {boosts.map((boost: any) => (
                <View
                  key={boost.id}
                  style={[
                    styles.boostCard,
                    boost.isExpiringSoon && styles.boostCardExpiring,
                  ]}
                >
                  <View style={styles.boostHeader}>
                    <View style={styles.boostTypeContainer}>
                      {boost.type === 'product' ? (
                        <Package size={24} color="#10B981" />
                      ) : (
                        <Store size={24} color="#F59E0B" />
                      )}
                      <View style={styles.boostInfo}>
                        <Text style={styles.boostType}>
                          {boost.type === 'product' ? 'Product Boost' : 'Shop Boost'}
                        </Text>
                        <Text style={styles.boostName}>
                          {boost.product?.name || boost.shop?.shop_name}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelBoost(boost.id, boost.type)}
                    >
                      <X size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.boostStats}>
                    <View style={styles.statItem}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.statLabel}>Days Remaining</Text>
                      <Text style={[
                        styles.statValue,
                        boost.isExpiringSoon && styles.statValueWarning,
                      ]}>
                        {boost.daysRemaining}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <TrendingUp size={16} color="#6B7280" />
                      <Text style={styles.statLabel}>Amount</Text>
                      <Text style={styles.statValue}>
                        KSh {boost.amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {boost.isExpiringSoon && (
                    <View style={styles.expiringBanner}>
                      <Text style={styles.expiringText}>
                        ⚠️ Expiring soon! Renew to maintain visibility
                      </Text>
                    </View>
                  )}

                  <View style={styles.boostFooter}>
                    <Text style={styles.boostDate}>
                      Started: {new Date(boost.start_date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.boostDate}>
                      Ends: {new Date(boost.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {boosts.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addBoostButton}
              onPress={() => router.push('/shop-dashboard' as any)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addBoostButtonText}>Create New Boost</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  createBoostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  createBoostButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'white',
  },
  boostsList: {
    padding: 16,
  },
  boostCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  boostCardExpiring: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  boostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  boostTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  boostInfo: {
    flex: 1,
  },
  boostType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  boostName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 4,
  },
  cancelButton: {
    padding: 4,
  },
  boostStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 4,
  },
  statValueWarning: {
    color: '#F59E0B',
  },
  expiringBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  expiringText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  boostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  boostDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addBoostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addBoostButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
});
