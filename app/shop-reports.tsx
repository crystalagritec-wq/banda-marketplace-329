import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Download, TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

export default function ShopReportsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange();

  const reportQuery = trpc.shop.getFinancialReport.useQuery(
    { vendorId: user?.id || '', startDate, endDate },
    { enabled: !!user?.id }
  );

  const report = reportQuery.data;

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Financial Reports',
        }} 
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>
              Last Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'year' && styles.periodButtonActive]}
            onPress={() => setPeriod('year')}
          >
            <Text style={[styles.periodButtonText, period === 'year' && styles.periodButtonTextActive]}>
              Last Year
            </Text>
          </TouchableOpacity>
        </View>

        {reportQuery.isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Generating report...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
                    <DollarSign size={24} color="#10B981" />
                  </View>
                  <Text style={styles.summaryValue}>
                    KSh {(report?.summary.totalRevenue || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Revenue</Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#DBEAFE' }]}>
                    <ShoppingBag size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.summaryValue}>
                    {report?.summary.totalOrders || 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Orders</Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
                    <TrendingUp size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.summaryValue}>
                    KSh {(report?.summary.averageOrderValue || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Order Value</Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Package size={24} color="#10B981" />
                  </View>
                  <Text style={styles.summaryValue}>
                    {report?.summary.completedOrders || 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Completed</Text>
                </View>
              </View>
            </View>

            <View style={styles.topProductsSection}>
              <Text style={styles.sectionTitle}>Top Products</Text>
              <View style={styles.topProductsList}>
                {report?.topProducts.map((product: any, index: number) => (
                  <View key={index} style={styles.topProductCard}>
                    <View style={styles.topProductRank}>
                      <Text style={styles.topProductRankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.topProductInfo}>
                      <Text style={styles.topProductName}>{product.name}</Text>
                      <View style={styles.topProductStats}>
                        <Text style={styles.topProductStat}>
                          {product.quantity} sold
                        </Text>
                        <Text style={styles.topProductRevenue}>
                          KSh {product.revenue.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.transactionsSection}>
              <Text style={styles.sectionTitle}>Financial Overview</Text>
              
              <View style={styles.financialCard}>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Total Revenue</Text>
                  <Text style={styles.financialValue}>
                    KSh {(report?.summary.totalRevenue || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Deposits</Text>
                  <Text style={[styles.financialValue, { color: '#10B981' }]}>
                    +KSh {(report?.summary.deposits || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Withdrawals</Text>
                  <Text style={[styles.financialValue, { color: '#EF4444' }]}>
                    -KSh {(report?.summary.withdrawals || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.financialRow, styles.financialRowTotal]}>
                  <Text style={styles.financialLabelTotal}>Net Income</Text>
                  <Text style={styles.financialValueTotal}>
                    KSh {((report?.summary.deposits || 0) - (report?.summary.withdrawals || 0)).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.downloadSection}>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={20} color="white" />
                <Text style={styles.downloadButtonText}>Download PDF Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.downloadButton, styles.downloadButtonSecondary]}>
                <FileText size={20} color="#10B981" />
                <Text style={[styles.downloadButtonText, styles.downloadButtonTextSecondary]}>
                  Export to CSV
                </Text>
              </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
  scrollView: {
    flex: 1,
  },
  summarySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  topProductsSection: {
    padding: 16,
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
    fontWeight: 'bold' as const,
    color: '#10B981',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  topProductStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topProductStat: {
    fontSize: 14,
    color: '#6B7280',
  },
  topProductRevenue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  transactionsSection: {
    padding: 16,
  },
  financialCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialRowTotal: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  financialLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  financialLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  financialValueTotal: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#10B981',
  },
  downloadSection: {
    padding: 16,
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  downloadButtonTextSecondary: {
    color: '#10B981',
  },
});
