import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, ShoppingBag, DollarSign } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

export default function ShopCustomersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const customersQuery = trpc.shop.getVendorCustomers.useQuery(
    { vendorId: user?.id || '', limit: 100 },
    { enabled: !!user?.id }
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Customers',
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {customersQuery.isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading customers...</Text>
          </View>
        ) : customersQuery.data?.customers.length === 0 ? (
          <View style={styles.centerContent}>
            <Users size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No customers yet</Text>
            <Text style={styles.emptyText}>
              Customers who purchase from you will appear here
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Users size={24} color="#10B981" />
                <Text style={styles.statNumber}>{customersQuery.data?.total || 0}</Text>
                <Text style={styles.statLabel}>Total Customers</Text>
              </View>
            </View>

            <View style={styles.customersList}>
              {customersQuery.data?.customers.map((customer: any) => (
                <View key={customer.id} style={styles.customerCard}>
                  <View style={styles.customerHeader}>
                    {customer.avatar_url ? (
                      <Image 
                        source={{ uri: customer.avatar_url }} 
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {customer.full_name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>
                        {customer.full_name || 'Unknown Customer'}
                      </Text>
                      <Text style={styles.customerPhone}>
                        {customer.phone_number || 'No phone'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.customerStats}>
                    <View style={styles.customerStat}>
                      <ShoppingBag size={16} color="#6B7280" />
                      <Text style={styles.customerStatText}>
                        {customer.orders || 0} orders
                      </Text>
                    </View>
                    <View style={styles.customerStat}>
                      <DollarSign size={16} color="#6B7280" />
                      <Text style={styles.customerStatText}>
                        KSh {(customer.totalSpent || 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
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
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  customersList: {
    padding: 16,
    gap: 12,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerStats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  customerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerStatText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
