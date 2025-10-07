import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  DollarSign,
  QrCode,
  CheckCircle,
  AlertCircle,
  Eye,
  Navigation,
  Users,
  Zap,
  X,
  Wallet,
  Filter,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';

type DeliveryStatus = 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled';
type UserRole = 'buyer' | 'provider';



export default function LogisticsManagementScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'deliveries' | 'earnings' | 'qr'>('deliveries');

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'delivered' | 'cancelled'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);


  const userRole: UserRole = user?.role === 'driver' ? 'provider' : 'buyer';

  const deliveriesQuery = trpc.logistics.getDeliveries.useQuery({
    userId: user?.id || '',
    role: userRole,
    status: statusFilter
  });

  const earningsQuery = trpc.logistics.getProviderEarnings.useQuery(
    {
      providerId: user?.id || '',
      period: 'month'
    },
    {
      enabled: userRole === 'provider'
    }
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await deliveriesQuery.refetch();
    if (userRole === 'provider') {
      await earningsQuery.refetch();
    }
    setRefreshing(false);
  }, [deliveriesQuery, earningsQuery, userRole]);

  // Generate QR code mutation
  const generateQRMutation = trpc.logistics.generateDeliveryQR.useMutation({
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setQrModalVisible(true);
      Alert.alert('QR Code Generated', 'Show this QR code to the buyer for delivery confirmation.');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  // Verify QR code mutation
  const verifyQRMutation = trpc.logistics.verifyDeliveryQR.useMutation({
    onSuccess: (data) => {
      Alert.alert('Delivery Confirmed!', data.message);
      deliveriesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Verification Failed', error.message);
    }
  });





  const handleGenerateQR = (assignmentId: string) => {
    generateQRMutation.mutate({
      assignmentId,
      providerId: user?.id || ''
    });
  };

  const handleVerifyQR = () => {
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Please enter a QR code');
      return;
    }

    verifyQRMutation.mutate({
      qrCode: qrCode.trim(),
      buyerId: user?.id || ''
    });
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#3B82F6';
      case 'in_progress': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending': return Clock;
      case 'assigned': return Package;
      case 'in_progress': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Package;
    }
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const deliveries = deliveriesQuery.data?.deliveries || [];
  const assignments = deliveriesQuery.data?.assignments || [];
  const earnings = earningsQuery.data?.summary;

  const stats = useMemo(() => {
    if (userRole === 'buyer') {
      return {
        total: deliveries.length,
        inProgress: deliveries.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status)).length,
        completed: deliveries.filter(d => d.status === 'delivered').length,
        pooled: deliveries.filter(d => d.pooled).length,
      };
    } else {
      return {
        total: assignments.length,
        inProgress: assignments.filter(a => ['assigned', 'in_progress'].includes(a.status)).length,
        completed: assignments.filter(a => a.status === 'delivered').length,
        pooled: assignments.filter(a => a.pooled).length,
      };
    }
  }, [deliveries, assignments, userRole]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          title: 'Logistics Management',
          headerStyle: { backgroundColor: '#2D5016' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>🚚 Logistics Hub</Text>
            <Text style={styles.subtitle}>
              {userRole === 'provider' ? 'Manage your deliveries and earnings' : 'Track your deliveries'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#2D5016" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optimizeButton}
              onPress={() => router.push('/route-optimization' as any)}
            >
              <Zap size={18} color="white" />
              <Text style={styles.optimizeButtonText}>Optimize</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={20} color="#2D5016" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Truck size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.pooled}</Text>
            <Text style={styles.statLabel}>Pooled</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'deliveries' && styles.activeTab]}
            onPress={() => setActiveTab('deliveries')}
          >
            <Truck size={20} color={activeTab === 'deliveries' ? '#2D5016' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'deliveries' && styles.activeTabText]}>
              {userRole === 'provider' ? 'Assignments' : 'Deliveries'}
            </Text>
          </TouchableOpacity>

          {userRole === 'provider' && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
              onPress={() => setActiveTab('earnings')}
            >
              <DollarSign size={20} color={activeTab === 'earnings' ? '#2D5016' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
                Earnings
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
            onPress={() => setActiveTab('qr')}
          >
            <QrCode size={20} color={activeTab === 'qr' ? '#2D5016' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>
              QR {userRole === 'provider' ? 'Generate' : 'Verify'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'deliveries' && (
            <View style={styles.section}>
              {userRole === 'buyer' ? (
                <>
                  <Text style={styles.sectionTitle}>My Deliveries</Text>
                  {deliveries.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Package size={48} color="#ccc" />
                      <Text style={styles.emptyStateText}>No deliveries found</Text>
                      <Text style={styles.emptyStateSubtext}>Your deliveries will appear here</Text>
                    </View>
                  ) : (
                    deliveries.map((delivery) => {
                      const StatusIcon = getStatusIcon(delivery.status);
                      return (
                        <View key={delivery.id} style={styles.deliveryCard}>
                          <View style={styles.deliveryHeader}>
                            <View style={styles.deliveryStatus}>
                              <StatusIcon size={16} color={getStatusColor(delivery.status)} />
                              <Text style={[styles.statusText, { color: getStatusColor(delivery.status) }]}>
                                {delivery.status.replace('_', ' ').toUpperCase()}
                              </Text>
                            </View>
                            {delivery.pooled && (
                              <View style={styles.pooledBadge}>
                                <Users size={12} color="#10B981" />
                                <Text style={styles.pooledText}>Pooled</Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.deliveryInfo}>
                            <Text style={styles.deliveryId}>Order #{delivery.orderId.slice(-8)}</Text>
                            {delivery.providerName && (
                              <Text style={styles.providerName}>Provider: {delivery.providerName}</Text>
                            )}
                            <Text style={styles.deliveryCost}>{formatCurrency(delivery.cost)}</Text>
                          </View>

                          <View style={styles.deliveryActions}>
                            <TouchableOpacity 
                              style={styles.actionButton}
                              onPress={() => router.push(`/order-details?orderId=${delivery.orderId}` as any)}
                            >
                              <Eye size={16} color="#2D5016" />
                              <Text style={styles.actionButtonText}>View Details</Text>
                            </TouchableOpacity>
                            {delivery.status === 'in_progress' && (
                              <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => router.push(`/order-tracking?orderId=${delivery.orderId}` as any)}
                              >
                                <MapPin size={16} color="#2D5016" />
                                <Text style={styles.actionButtonText}>Track</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Active Assignments</Text>
                  {assignments.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Truck size={48} color="#ccc" />
                      <Text style={styles.emptyStateText}>No active assignments</Text>
                      <Text style={styles.emptyStateSubtext}>New assignments will appear here</Text>
                    </View>
                  ) : (
                    assignments.map((assignment) => {
                      const StatusIcon = getStatusIcon(assignment.status);
                      return (
                        <View key={assignment.id} style={styles.assignmentCard}>
                          <View style={styles.assignmentHeader}>
                            <View style={styles.assignmentStatus}>
                              <StatusIcon size={16} color={getStatusColor(assignment.status)} />
                              <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
                                {assignment.status.replace('_', ' ').toUpperCase()}
                              </Text>
                            </View>
                            {assignment.pooled && (
                              <View style={styles.pooledBadge}>
                                <Users size={12} color="#10B981" />
                                <Text style={styles.pooledText}>{assignment.orderCount} Orders</Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.assignmentInfo}>
                            <Text style={styles.assignmentId}>Assignment #{assignment.id.slice(-8)}</Text>
                            <Text style={styles.assignmentPayout}>
                              Payout: {formatCurrency(assignment.payout)}
                            </Text>
                            <Text style={styles.payoutStatus}>
                              Status: {assignment.payoutStatus.toUpperCase()}
                            </Text>
                          </View>

                          <View style={styles.assignmentActions}>
                            <TouchableOpacity 
                              style={styles.actionButton}
                              onPress={() => router.push(`/route-optimization?assignmentId=${assignment.id}` as any)}
                            >
                              <Navigation size={16} color="#2D5016" />
                              <Text style={styles.actionButtonText}>Route</Text>
                            </TouchableOpacity>
                            {assignment.status === 'in_progress' && (
                              <TouchableOpacity 
                                style={styles.primaryActionButton}
                                onPress={() => handleGenerateQR(assignment.id)}
                              >
                                <QrCode size={16} color="white" />
                                <Text style={styles.primaryActionButtonText}>Generate QR</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </>
              )}
            </View>
          )}

          {activeTab === 'earnings' && userRole === 'provider' && (
            <View style={styles.section}>
              <View style={styles.earningsHeader}>
                <Text style={styles.sectionTitle}>Earnings Summary</Text>
                <TouchableOpacity 
                  style={styles.withdrawButton}
                  onPress={() => setWithdrawalModalVisible(true)}
                >
                  <Wallet size={16} color="white" />
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
              </View>

              {earnings ? (
                <>
                  <View style={styles.earningsGrid}>
                    <View style={styles.earningsCard}>
                      <Text style={styles.earningsValue}>{earnings.totalTrips}</Text>
                      <Text style={styles.earningsLabel}>Total Trips</Text>
                    </View>
                    <View style={styles.earningsCard}>
                      <Text style={styles.earningsValue}>{earnings.completedTrips}</Text>
                      <Text style={styles.earningsLabel}>Completed</Text>
                    </View>
                    <View style={styles.earningsCard}>
                      <Text style={styles.earningsValue}>{earnings.pooledTrips}</Text>
                      <Text style={styles.earningsLabel}>Pooled</Text>
                    </View>
                  </View>

                  <View style={styles.earningsDetails}>
                    <View style={styles.earningsRow}>
                      <Text style={styles.earningsRowLabel}>Gross Earnings:</Text>
                      <Text style={styles.earningsRowValue}>{formatCurrency(earnings.grossAmount)}</Text>
                    </View>
                    <View style={styles.earningsRow}>
                      <Text style={styles.earningsRowLabel}>Banda Fee (10%):</Text>
                      <Text style={[styles.earningsRowValue, styles.feeText]}>-{formatCurrency(earnings.bandaFee)}</Text>
                    </View>
                    <View style={[styles.earningsRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Net Earnings:</Text>
                      <Text style={styles.totalValue}>{formatCurrency(earnings.netAmount)}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentStatus}>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Paid Amount:</Text>
                      <Text style={[styles.paymentValue, styles.paidText]}>{formatCurrency(earnings.paidAmount)}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentLabel}>Pending Amount:</Text>
                      <Text style={[styles.paymentValue, styles.pendingText]}>{formatCurrency(earnings.pendingAmount)}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2D5016" />
                  <Text style={styles.loadingText}>Loading earnings...</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'qr' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {userRole === 'provider' ? 'Generate QR Code' : 'Verify Delivery'}
              </Text>
              
              {userRole === 'provider' ? (
                <View style={styles.qrSection}>
                  <Text style={styles.qrInstructions}>
                    Generate a QR code for delivery confirmation. The buyer will scan this code to confirm receipt.
                  </Text>
                  <View style={styles.qrNote}>
                    <AlertCircle size={16} color="#F59E0B" />
                    <Text style={styles.qrNoteText}>
                      QR codes expire after 2 hours for security
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.qrSection}>
                  <Text style={styles.qrInstructions}>
                    Enter the QR code provided by your delivery provider to confirm receipt of your order.
                  </Text>
                  <TextInput
                    style={styles.qrInput}
                    placeholder="Enter QR code (e.g., BANDA-1234567890-ABC123)"
                    value={qrCode}
                    onChangeText={setQrCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={styles.verifyButton}
                    onPress={handleVerifyQR}
                    disabled={verifyQRMutation.isPending}
                  >
                    {verifyQRMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <CheckCircle size={16} color="white" />
                        <Text style={styles.verifyButtonText}>Verify Delivery</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* QR Code Modal */}
        <Modal
          visible={qrModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setQrModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Delivery QR Code</Text>
                <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  <QrCode size={120} color="#2D5016" />
                  <Text style={styles.qrCodeText}>{qrCode}</Text>
                </View>
              </View>
              
              <Text style={styles.qrInstructions}>
                Show this QR code to the buyer for delivery confirmation
              </Text>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setQrModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Withdrawal Modal */}
        <Modal
          visible={withdrawalModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setWithdrawalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Withdrawal</Text>
                <TouchableOpacity onPress={() => setWithdrawalModalVisible(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.withdrawalInfo}>
                Available Balance: {earnings ? formatCurrency(earnings.pendingAmount) : 'Loading...'}
              </Text>
              
              <Text style={styles.withdrawalNote}>
                Withdrawal feature coming soon! You&apos;ll be able to withdraw your earnings to M-Pesa, bank account, or PayPal.
              </Text>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setWithdrawalModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Deliveries</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterOptions}>
                {(['all', 'pending', 'in_progress', 'delivered', 'cancelled'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      statusFilter === status && styles.filterOptionActive
                    ]}
                    onPress={() => {
                      setStatusFilter(status);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === status && styles.filterOptionTextActive
                    ]}>
                      {status === 'all' ? 'All Deliveries' : status.replace('_', ' ').toUpperCase()}
                    </Text>
                    {statusFilter === status && <CheckCircle size={20} color="#2D5016" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  optimizeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2D5016',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  deliveryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pooledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pooledText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  deliveryInfo: {
    marginBottom: 12,
  },
  deliveryId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deliveryCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  deliveryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '600',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5016',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  primaryActionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignmentInfo: {
    marginBottom: 12,
  },
  assignmentId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  assignmentPayout: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  payoutStatus: {
    fontSize: 12,
    color: '#666',
  },
  assignmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  earningsDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  earningsRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  earningsRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  feeText: {
    color: '#EF4444',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  paymentStatus: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidText: {
    color: '#10B981',
  },
  pendingText: {
    color: '#F59E0B',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  qrSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  qrNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  qrNoteText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  qrInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  qrCodeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  modalButton: {
    backgroundColor: '#2D5016',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  withdrawalInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016',
    marginBottom: 16,
    textAlign: 'center',
  },
  withdrawalNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#2D5016',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#2D5016',
    fontWeight: '700',
  },
});