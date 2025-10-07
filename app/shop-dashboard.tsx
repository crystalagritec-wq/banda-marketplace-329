import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Eye, 
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Users,
  Tag,
  FileText,
  ChevronRight
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

export default function ShopDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const statsQuery = trpc.shop.getVendorStats.useQuery(
    { vendorId: user?.id || '', period },
    { enabled: !!user?.id }
  );

  const ordersQuery = trpc.shop.getVendorOrders.useQuery(
    { vendorId: user?.id || '', status: 'all', limit: 5 },
    { enabled: !!user?.id }
  );

  const customersQuery = trpc.shop.getVendorCustomers.useQuery(
    { vendorId: user?.id || '', limit: 5 },
    { enabled: !!user?.id }
  );

  const onRefresh = () => {
    statsQuery.refetch();
    ordersQuery.refetch();
    customersQuery.refetch();
  };

  const stats = statsQuery.data;
  const isLoading = statsQuery.isLoading;

  if (isLoading) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'My Shop',
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push('/settings' as any)}>
                <Settings size={24} color="#1F2937" />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'My Shop',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings' as any)}>
              <Settings size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl 
              refreshing={statsQuery.isRefetching} 
              onRefresh={onRefresh} 
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.shopName}>Your Shop Dashboard</Text>
          </View>

          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'today' && styles.periodButtonActive]}
              onPress={() => setPeriod('today')}
            >
              <Text style={[styles.periodButtonText, period === 'today' && styles.periodButtonTextActive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
              onPress={() => setPeriod('month')}
            >
              <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.salesSection}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <View style={styles.revenueCard}>
              <View style={styles.revenueHeader}>
                <DollarSign size={32} color="#10B981" />
                <View style={[styles.changeBadge, { 
                  backgroundColor: (stats?.revenue.change || 0) >= 0 ? '#D1FAE5' : '#FEE2E2' 
                }]}>
                  <TrendingUp size={14} color={(stats?.revenue.change || 0) >= 0 ? '#10B981' : '#EF4444'} />
                  <Text style={[styles.changeText, { 
                    color: (stats?.revenue.change || 0) >= 0 ? '#10B981' : '#EF4444' 
                  }]}>
                    {(stats?.revenue.change || 0) >= 0 ? '+' : ''}{stats?.revenue.change.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.revenueAmount}>
                KSh {(stats?.revenue.total || 0).toLocaleString()}
              </Text>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
            </View>
          </View>

          <View style={styles.ordersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Orders</Text>
              <TouchableOpacity onPress={() => router.push('/shop-orders' as any)}>
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ordersGrid}>
              <TouchableOpacity 
                style={styles.orderCard}
                onPress={() => router.push('/shop-orders?status=pending' as any)}
              >
                <View style={[styles.orderIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <ShoppingBag size={24} color="#F59E0B" />
                </View>
                <Text style={styles.orderCount}>{stats?.orders.pending || 0}</Text>
                <Text style={styles.orderLabel}>Pending</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.orderCard}
                onPress={() => router.push('/shop-orders?status=confirmed' as any)}
              >
                <View style={[styles.orderIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Package size={24} color="#3B82F6" />
                </View>
                <Text style={styles.orderCount}>{stats?.orders.confirmed || 0}</Text>
                <Text style={styles.orderLabel}>Processing</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.orderCard}
                onPress={() => router.push('/shop-orders?status=delivered' as any)}
              >
                <View style={[styles.orderIconContainer, { backgroundColor: '#D1FAE5' }]}>
                  <Package size={24} color="#10B981" />
                </View>
                <Text style={styles.orderCount}>{stats?.orders.delivered || 0}</Text>
                <Text style={styles.orderLabel}>Delivered</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.productsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <TouchableOpacity onPress={() => router.push('/shop-products' as any)}>
                <Text style={styles.viewAllText}>Manage →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productStats}>
              <View style={styles.productStatCard}>
                <Package size={32} color="#10B981" />
                <Text style={styles.productStatNumber}>{stats?.products.total || 0}</Text>
                <Text style={styles.productStatLabel}>Total Products</Text>
              </View>

              <View style={styles.productStatCard}>
                <AlertCircle size={32} color="#F59E0B" />
                <Text style={styles.productStatNumber}>{stats?.products.lowStock || 0}</Text>
                <Text style={styles.productStatLabel}>Low Stock</Text>
              </View>

              <View style={styles.productStatCard}>
                <Eye size={32} color="#3B82F6" />
                <Text style={styles.productStatNumber}>{stats?.views || 0}</Text>
                <Text style={styles.productStatLabel}>Total Views</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={() => router.push('/post-product' as any)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addProductButtonText}>Add New Product</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wallet (AgriPay)</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/wallet' as any)}>
                <Text style={styles.viewAllText}>View →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <DollarSign size={32} color="#10B981" />
                <Text style={styles.walletBalance}>
                  KSh {(stats?.wallet.balance || 0).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <View style={styles.walletActions}>
                <TouchableOpacity 
                  style={styles.walletButton}
                  onPress={() => router.push('/(tabs)/wallet' as any)}
                >
                  <Text style={styles.walletButtonText}>Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.walletButton, styles.walletButtonSecondary]}
                  onPress={() => router.push('/(tabs)/wallet' as any)}
                >
                  <Text style={[styles.walletButtonText, styles.walletButtonTextSecondary]}>
                    Transactions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/shop-customers' as any)}
            >
              <View style={styles.actionCardLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#EDE9FE' }]}>
                  <Users size={24} color="#8B5CF6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Customers</Text>
                  <Text style={styles.actionSubtitle}>
                    {stats?.customers.total || 0} total customers
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/shop-promotions' as any)}
            >
              <View style={styles.actionCardLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <Tag size={24} color="#EF4444" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Promotions</Text>
                  <Text style={styles.actionSubtitle}>Create & manage discounts</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/shop-analytics' as any)}
            >
              <View style={styles.actionCardLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <BarChart3 size={24} color="#3B82F6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Analytics</Text>
                  <Text style={styles.actionSubtitle}>View detailed insights</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/shop-reports' as any)}
            >
              <View style={styles.actionCardLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#D1FAE5' }]}>
                  <FileText size={24} color="#10B981" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Financial Reports</Text>
                  <Text style={styles.actionSubtitle}>Download sales reports</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#10B981',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  salesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  revenueCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  ordersSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  ordersGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  orderCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  orderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  productsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  productStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  productStatNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  productStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addProductButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  walletSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  walletCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  walletLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  walletButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  walletButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
  },
  walletButtonTextSecondary: {
    color: '#10B981',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
