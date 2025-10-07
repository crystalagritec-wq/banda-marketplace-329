import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ShoppingCart, 
  DollarSign,
  Users,
  Package,
  Star
} from 'lucide-react-native';

type TimePeriod = 'today' | 'week' | 'month';

export default function ShopAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<TimePeriod>('week');

  const stats = {
    revenue: 45800,
    revenueChange: 12,
    orders: 34,
    ordersChange: 8,
    views: 1234,
    viewsChange: -5,
    customers: 28,
    customersChange: 15,
    avgOrderValue: 1347,
    conversionRate: 2.8,
  };

  const topProducts = [
    { id: '1', name: 'Fresh Tomatoes', sales: 45, revenue: 6750 },
    { id: '2', name: 'Organic Carrots', sales: 38, revenue: 4560 },
    { id: '3', name: 'Sweet Potatoes', sales: 32, revenue: 3200 },
    { id: '4', name: 'Fresh Milk', sales: 28, revenue: 2240 },
    { id: '5', name: 'Farm Eggs', sales: 25, revenue: 5000 },
  ];

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Shop Analytics',
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
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
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
              onPress={() => setPeriod('month')}
            >
              <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <DollarSign size={24} color="#10B981" />
                  <View style={[styles.changeBadge, { backgroundColor: '#D1FAE5' }]}>
                    <TrendingUp size={12} color="#10B981" />
                    <Text style={[styles.changeText, { color: '#10B981' }]}>
                      +{stats.revenueChange}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>KSh {stats.revenue.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>Revenue</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <ShoppingCart size={24} color="#3B82F6" />
                  <View style={[styles.changeBadge, { backgroundColor: '#DBEAFE' }]}>
                    <TrendingUp size={12} color="#3B82F6" />
                    <Text style={[styles.changeText, { color: '#3B82F6' }]}>
                      +{stats.ordersChange}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{stats.orders}</Text>
                <Text style={styles.metricLabel}>Orders</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Eye size={24} color="#F59E0B" />
                  <View style={[styles.changeBadge, { backgroundColor: '#FEF3C7' }]}>
                    <TrendingDown size={12} color="#F59E0B" />
                    <Text style={[styles.changeText, { color: '#F59E0B' }]}>
                      {stats.viewsChange}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{stats.views.toLocaleString()}</Text>
                <Text style={styles.metricLabel}>Views</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Users size={24} color="#8B5CF6" />
                  <View style={[styles.changeBadge, { backgroundColor: '#EDE9FE' }]}>
                    <TrendingUp size={12} color="#8B5CF6" />
                    <Text style={[styles.changeText, { color: '#8B5CF6' }]}>
                      +{stats.customersChange}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{stats.customers}</Text>
                <Text style={styles.metricLabel}>Customers</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceCards}>
              <View style={styles.performanceCard}>
                <Text style={styles.performanceLabel}>Avg. Order Value</Text>
                <Text style={styles.performanceValue}>KSh {stats.avgOrderValue.toLocaleString()}</Text>
              </View>
              <View style={styles.performanceCard}>
                <Text style={styles.performanceLabel}>Conversion Rate</Text>
                <Text style={styles.performanceValue}>{stats.conversionRate}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Products</Text>
              <Star size={20} color="#F59E0B" />
            </View>
            <View style={styles.topProductsList}>
              {topProducts.map((product, index) => (
                <View key={product.id} style={styles.topProductCard}>
                  <View style={styles.topProductRank}>
                    <Text style={styles.topProductRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.topProductInfo}>
                    <Text style={styles.topProductName}>{product.name}</Text>
                    <View style={styles.topProductStats}>
                      <View style={styles.topProductStat}>
                        <Package size={14} color="#6B7280" />
                        <Text style={styles.topProductStatText}>{product.sales} sold</Text>
                      </View>
                      <View style={styles.topProductStat}>
                        <DollarSign size={14} color="#6B7280" />
                        <Text style={styles.topProductStatText}>
                          KSh {product.revenue.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightCard}>
              <TrendingUp size={24} color="#10B981" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Sales are growing!</Text>
                <Text style={styles.insightText}>
                  Your revenue increased by 12% compared to last week. Keep up the great work!
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <Eye size={24} color="#F59E0B" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Views decreased slightly</Text>
                <Text style={styles.insightText}>
                  Consider adding more products or running a promotion to increase visibility.
                </Text>
              </View>
            </View>
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: 'white',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  performanceCards: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  topProductsList: {
    gap: 12,
  },
  topProductCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topProductRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  topProductStats: {
    flexDirection: 'row',
    gap: 16,
  },
  topProductStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topProductStatText: {
    fontSize: 14,
    color: '#6B7280',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
