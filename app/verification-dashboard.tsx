import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  BarChart3, 
  Bell, 
  QrCode, 
  TrendingUp, 
  Package, 
  Clock,
  ArrowRight 
} from 'lucide-react-native';

import VerificationCard from '@/components/dashboard/VerificationCard';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import WalletCard from '@/components/dashboard/WalletCard';
import { trpc } from '@/lib/trpc';

interface DashboardData {
  user: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    user_role: string;
    tier: string;
    verification_status: string;
  } | null;
  verification: {
    status: string;
    tier: string;
    progress: number;
    documents: {
      id: string;
      type: string;
      status: string;
      uploaded_at: string;
    }[];
  };
  subscription: {
    current_tier: string;
    tier_level: number;
    status: string;
    start_date?: string;
    end_date?: string;
    features: Record<string, boolean>;
    limits: Record<string, any>;
    auto_renew: boolean;
  };
  wallet: {
    trading_balance: number;
    savings_balance: number;
    reserve_balance: number;
    total_earned: number;
    total_spent: number;
    recent_transactions: {
      id: string;
      type: string;
      amount: number;
      status: string;
      description: string;
      created_at: string;
    }[];
  };
  active_orders: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    product_name: string;
  }[];
  qr_history: {
    id: string;
    qr_type: string;
    scan_result: string;
    created_at: string;
  }[];
  market_insights: {
    id: string;
    category: string;
    product_name: string;
    current_price: number;
    trend: string;
    ai_recommendation: string;
  }[];
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }[];
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // tRPC queries
  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({});
  const upgradeSubscriptionMutation = trpc.subscription.upgrade.useMutation();
  const updateDocumentsMutation = trpc.verification.updateDocuments.useMutation();

  useEffect(() => {
    if (dashboardQuery.data?.success) {
      setDashboardData(dashboardQuery.data.data);
    }
  }, [dashboardQuery.data]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dashboardQuery.refetch();
    setRefreshing(false);
  };

  const handleUploadDocuments = () => {
    Alert.alert(
      'Upload Documents',
      'Choose documents to upload for verification',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upload', 
          onPress: () => {
            // In a real app, this would open a document picker
            const mockDocuments = [
              {
                type: 'national_id' as const,
                url: 'https://example.com/id.jpg',
                number: '12345678'
              }
            ];
            
            updateDocumentsMutation.mutate(
              { documents: mockDocuments },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Documents uploaded successfully');
                  dashboardQuery.refetch();
                },
                onError: (error) => {
                  Alert.alert('Error', error.message);
                }
              }
            );
          }
        }
      ]
    );
  };

  const handleViewQR = () => {
    Alert.alert('QR Badge', 'Your verification QR code would be displayed here');
  };

  const handleUpgradeSubscription = () => {
    Alert.alert(
      'Upgrade Subscription',
      'Choose your new tier',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Gold (KSh 1,500/month)', 
          onPress: () => upgradeSubscription('Gold')
        },
        { 
          text: 'Premium (KSh 3,000/month)', 
          onPress: () => upgradeSubscription('Premium')
        }
      ]
    );
  };

  const upgradeSubscription = (tierName: 'Gold' | 'Premium') => {
    upgradeSubscriptionMutation.mutate(
      { tierName, paymentMethod: 'wallet' },
      {
        onSuccess: (data) => {
          Alert.alert('Success', data.message);
          dashboardQuery.refetch();
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        }
      }
    );
  };

  const handleViewBenefits = () => {
    Alert.alert('Subscription Benefits', 'Detailed benefits would be shown here');
  };

  const handleAddMoney = () => {
    Alert.alert('Add Money', 'Payment options would be shown here');
  };

  const handleSendMoney = () => {
    Alert.alert('Send Money', 'Transfer options would be shown here');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Withdrawal options would be shown here');
  };

  const handleViewTransactions = () => {
    Alert.alert('Transactions', 'Full transaction history would be shown here');
  };

  if (dashboardQuery.isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (dashboardQuery.error || !dashboardData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Error loading dashboard</Text>
        <TouchableOpacity onPress={() => dashboardQuery.refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.userName}>{dashboardData.user?.full_name}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#2D5016" />
            {dashboardData.notifications.filter(n => !n.is_read).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {dashboardData.notifications.filter(n => !n.is_read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Verification Card */}
          <VerificationCard
            verification={dashboardData.verification}
            onUploadDocuments={handleUploadDocuments}
            onViewQR={handleViewQR}
          />

          {/* Subscription Card */}
          <SubscriptionCard
            subscription={dashboardData.subscription}
            onUpgrade={handleUpgradeSubscription}
            onViewBenefits={handleViewBenefits}
          />

          {/* Wallet Card */}
          <WalletCard
            wallet={dashboardData.wallet}
            onAddMoney={handleAddMoney}
            onSendMoney={handleSendMoney}
            onWithdraw={handleWithdraw}
            onViewTransactions={handleViewTransactions}
          />

          {/* Active Orders Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Package size={20} color="#2D5016" />
                <Text style={styles.cardTitle}>Active Orders</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={14} color="#2D5016" />
              </TouchableOpacity>
            </View>
            
            {dashboardData.active_orders.length > 0 ? (
              dashboardData.active_orders.slice(0, 3).map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderContent}>
                    <Text style={styles.orderProduct}>{order.product_name}</Text>
                    <Text style={styles.orderStatus}>Status: {order.status}</Text>
                  </View>
                  <Text style={styles.orderAmount}>
                    KSh {order.total_amount.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No active orders</Text>
            )}
          </View>

          {/* QR History Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <QrCode size={20} color="#2D5016" />
                <Text style={styles.cardTitle}>Recent QR Scans</Text>
              </View>
            </View>
            
            {dashboardData.qr_history.length > 0 ? (
              dashboardData.qr_history.slice(0, 3).map((scan) => (
                <View key={scan.id} style={styles.qrItem}>
                  <View style={styles.qrContent}>
                    <Text style={styles.qrType}>{scan.qr_type.toUpperCase()}</Text>
                    <Text style={styles.qrDate}>
                      {new Date(scan.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[
                    styles.qrStatus,
                    { backgroundColor: scan.scan_result === 'success' ? '#10B981' : '#EF4444' }
                  ]}>
                    <Text style={styles.qrStatusText}>
                      {scan.scan_result.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No QR scans yet</Text>
            )}
          </View>

          {/* Market Insights Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <BarChart3 size={20} color="#2D5016" />
                <Text style={styles.cardTitle}>Market Insights</Text>
              </View>
            </View>
            
            {dashboardData.market_insights.length > 0 ? (
              dashboardData.market_insights.slice(0, 2).map((insight) => (
                <View key={insight.id} style={styles.insightItem}>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightProduct}>{insight.product_name}</Text>
                    <Text style={styles.insightPrice}>
                      KSh {insight.current_price.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.insightTrend}>
                    <TrendingUp 
                      size={16} 
                      color={insight.trend === 'rising' ? '#10B981' : 
                             insight.trend === 'falling' ? '#EF4444' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.insightTrendText,
                      { 
                        color: insight.trend === 'rising' ? '#10B981' : 
                               insight.trend === 'falling' ? '#EF4444' : '#6B7280'
                      }
                    ]}>
                      {insight.trend.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No market insights available</Text>
            )}
          </View>

          {/* Notifications Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Bell size={20} color="#2D5016" />
                <Text style={styles.cardTitle}>Recent Notifications</Text>
              </View>
            </View>
            
            {dashboardData.notifications.length > 0 ? (
              dashboardData.notifications.slice(0, 3).map((notification) => (
                <View key={notification.id} style={styles.notificationItem}>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                  </View>
                  <View style={styles.notificationMeta}>
                    <Clock size={12} color="#666" />
                    <Text style={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No notifications</Text>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderContent: {
    flex: 1,
  },
  orderProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 12,
    color: '#666',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  qrItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  qrContent: {
    flex: 1,
  },
  qrType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  qrDate: {
    fontSize: 12,
    color: '#666',
  },
  qrStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qrStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightContent: {
    flex: 1,
  },
  insightProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  insightPrice: {
    fontSize: 12,
    color: '#666',
  },
  insightTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightTrendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  retryButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});