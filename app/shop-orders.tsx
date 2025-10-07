import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function ShopOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<OrderStatus>((params.status as OrderStatus) || 'all');

  const ordersQuery = trpc.shop.getVendorOrders.useQuery(
    { vendorId: user?.id || '', status, limit: 50 },
    { enabled: !!user?.id }
  );

  const updateStatusMutation = trpc.shop.updateOrderStatus.useMutation({
    onSuccess: () => {
      ordersQuery.refetch();
      Alert.alert('Success', 'Order status updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to update order status');
    },
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'all') return;
    
    Alert.alert(
      'Update Order Status',
      `Change order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateStatusMutation.mutate({
              orderId,
              vendorId: user?.id || '',
              status: newStatus,
            });
          },
        },
      ]
    );
  };

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
      case 'processing':
        return '#3B82F6';
      case 'shipped':
        return '#8B5CF6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (orderStatus: string) => {
    switch (orderStatus) {
      case 'pending':
        return Clock;
      case 'confirmed':
      case 'processing':
      case 'shipped':
        return Package;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Orders',
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((filterStatus) => (
                <TouchableOpacity
                  key={filterStatus}
                  style={[
                    styles.filterButton,
                    status === filterStatus && styles.filterButtonActive,
                  ]}
                  onPress={() => setStatus(filterStatus)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      status === filterStatus && styles.filterButtonTextActive,
                    ]}
                  >
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {ordersQuery.isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : ordersQuery.data?.orders.length === 0 ? (
          <View style={styles.centerContent}>
            <Package size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              {status === 'all' 
                ? 'You haven\'t received any orders yet' 
                : `No ${status} orders`}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.ordersList}>
              {ordersQuery.data?.orders.map((order: any) => {
                const StatusIcon = getStatusIcon(order.status);
                const statusColor = getStatusColor(order.status);

                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => router.push(`/order-details?orderId=${order.id}` as any)}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.orderHeaderLeft}>
                        <View style={[styles.statusIconContainer, { backgroundColor: `${statusColor}20` }]}>
                          <StatusIcon size={20} color={statusColor} />
                        </View>
                        <View>
                          <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                          <Text style={styles.orderDate}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>

                    <View style={styles.orderCustomer}>
                      <Text style={styles.customerLabel}>Customer:</Text>
                      <Text style={styles.customerName}>
                        {order.profiles?.full_name || 'Unknown'}
                      </Text>
                    </View>

                    <View style={styles.orderDetails}>
                      <View style={styles.orderDetailItem}>
                        <Text style={styles.orderDetailLabel}>Items:</Text>
                        <Text style={styles.orderDetailValue}>
                          {order.order_items?.length || 0}
                        </Text>
                      </View>
                      <View style={styles.orderDetailItem}>
                        <Text style={styles.orderDetailLabel}>Total:</Text>
                        <Text style={styles.orderDetailValue}>
                          KSh {(order.total || 0).toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>

                      {order.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateStatus(order.id, 'confirmed')}
                        >
                          <Text style={styles.actionButtonText}>Confirm</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'confirmed' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateStatus(order.id, 'processing')}
                        >
                          <Text style={styles.actionButtonText}>Process</Text>
                        </TouchableOpacity>
                      )}
                      {order.status === 'processing' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleUpdateStatus(order.id, 'shipped')}
                        >
                          <Text style={styles.actionButtonText}>Ship</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
  ordersList: {
    padding: 16,
    gap: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  orderCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
  },
});
