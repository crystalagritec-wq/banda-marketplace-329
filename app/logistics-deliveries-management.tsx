import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';
import { Package, MapPin, Phone, DollarSign, CheckCircle, XCircle, Navigation } from 'lucide-react-native';

type DeliveryStatus = 'all' | 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryLocation?: { latitude: number; longitude: number };
  deliveryInstructions?: string;
  orderAmount: number;
  deliveryFee: number;
  grossAmount: number;
  bandaFee: number;
  payoutStatus: string;
  paidAt?: string;
  pooled: boolean;
  eta?: string;
  pickupLocation?: { latitude: number; longitude: number };
  pickupAddress?: string;
  distance?: number;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export default function LogisticsDeliveriesManagement() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [page] = useState(1);

  const deliveriesQuery = trpc.logistics.getDriverDeliveries.useQuery(
    {
      driverId: user?.id || '',
      status: selectedStatus,
      page,
      limit: 20,
    },
    {
      enabled: !!user?.id,
      refetchInterval: 30000,
    }
  );

  const earningsQuery = trpc.logistics.getDriverEarnings.useQuery(
    {
      driverId: user?.id || '',
    },
    {
      enabled: !!user?.id,
    }
  );

  const updateStatusMutation = trpc.logistics.updateDeliveryStatusDriver.useMutation({
    onSuccess: () => {
      deliveriesQuery.refetch();
      earningsQuery.refetch();
      setActionModalVisible(false);
      setSelectedDelivery(null);
      setNotes('');
      Alert.alert('Success', 'Delivery status updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleRefresh = useCallback(() => {
    deliveriesQuery.refetch();
    earningsQuery.refetch();
  }, [deliveriesQuery, earningsQuery]);

  const handleStatusUpdate = (status: 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled') => {
    if (!selectedDelivery) return;

    updateStatusMutation.mutate({
      assignmentId: selectedDelivery.id,
      driverId: user?.id || '',
      status,
      notes: notes || undefined,
    });
  };

  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      Alert.alert('Error', 'Customer phone number not available');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (location?: { latitude: number; longitude: number }) => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
      default: 'https://maps.google.com',
    });

    const url = Platform.select({
      ios: `${scheme}?q=${location.latitude},${location.longitude}`,
      android: `${scheme}${location.latitude},${location.longitude}`,
      default: `${scheme}?q=${location.latitude},${location.longitude}`,
    });

    Linking.openURL(url);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'accepted':
        return '#3B82F6';
      case 'picked_up':
        return '#8B5CF6';
      case 'in_transit':
        return '#06B6D4';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: DeliveryStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const renderDeliveryCard = (delivery: Delivery) => (
    <TouchableOpacity
      key={delivery.id}
      style={styles.deliveryCard}
      onPress={() => {
        setSelectedDelivery(delivery);
        setActionModalVisible(true);
      }}
    >
      <View style={styles.deliveryHeader}>
        <View style={styles.deliveryHeaderLeft}>
          <Package size={20} color="#059669" />
          <Text style={styles.orderNumber}>#{delivery.orderNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(delivery.status) }]}>
            {getStatusLabel(delivery.status)}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{delivery.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.infoValue} numberOfLines={1}>
            {delivery.deliveryAddress}
          </Text>
        </View>
        {delivery.distance && (
          <View style={styles.infoRow}>
            <Navigation size={14} color="#6B7280" />
            <Text style={styles.infoValue}>{delivery.distance.toFixed(1)} km</Text>
          </View>
        )}
      </View>

      <View style={styles.deliveryFooter}>
        <View style={styles.amountContainer}>
          <DollarSign size={16} color="#059669" />
          <Text style={styles.amountText}>KES {delivery.deliveryFee.toFixed(2)}</Text>
        </View>
        <Text style={styles.payoutStatus}>
          {delivery.payoutStatus === 'paid' ? '✓ Paid' : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderActionModal = () => {
    if (!selectedDelivery) return null;

    const canAccept = selectedDelivery.status === 'pending';
    const canPickup = selectedDelivery.status === 'accepted';
    const canStartTransit = selectedDelivery.status === 'picked_up';
    const canDeliver = selectedDelivery.status === 'in_transit';

    return (
      <Modal
        visible={actionModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery #{selectedDelivery.orderNumber}</Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <XCircle size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Text style={styles.detailText}>{selectedDelivery.customerName}</Text>
                {selectedDelivery.customerPhone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCallCustomer(selectedDelivery.customerPhone)}
                  >
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Call Customer</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.detailText}>{selectedDelivery.deliveryAddress}</Text>
                {selectedDelivery.deliveryInstructions && (
                  <Text style={styles.instructionsText}>{selectedDelivery.deliveryInstructions}</Text>
                )}
                {selectedDelivery.deliveryLocation && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleNavigate(selectedDelivery.deliveryLocation)}
                  >
                    <Navigation size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Navigate</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Earnings</Text>
                <View style={styles.earningsRow}>
                  <Text style={styles.earningsLabel}>Delivery Fee:</Text>
                  <Text style={styles.earningsValue}>KES {selectedDelivery.grossAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.earningsRow}>
                  <Text style={styles.earningsLabel}>Banda Fee (15%):</Text>
                  <Text style={styles.earningsValue}>- KES {selectedDelivery.bandaFee.toFixed(2)}</Text>
                </View>
                <View style={styles.earningsRow}>
                  <Text style={styles.earningsLabelBold}>Your Earnings:</Text>
                  <Text style={styles.earningsValueBold}>KES {selectedDelivery.deliveryFee.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes about this delivery..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              {canAccept && (
                <>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#10B981' }]}
                    onPress={() => handleStatusUpdate('accepted')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Accept Delivery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: '#EF4444' }]}
                    onPress={() => handleStatusUpdate('cancelled')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Text style={[styles.secondaryButtonText, { color: '#EF4444' }]}>Decline</Text>
                  </TouchableOpacity>
                </>
              )}

              {canPickup && (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#8B5CF6' }]}
                  onPress={() => handleStatusUpdate('picked_up')}
                  disabled={updateStatusMutation.isPending}
                >
                  <Package size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Mark as Picked Up</Text>
                </TouchableOpacity>
              )}

              {canStartTransit && (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#06B6D4' }]}
                  onPress={() => handleStatusUpdate('in_transit')}
                  disabled={updateStatusMutation.isPending}
                >
                  <Navigation size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Start Delivery</Text>
                </TouchableOpacity>
              )}

              {canDeliver && (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleStatusUpdate('delivered')}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const statusTabs: DeliveryStatus[] = ['all', 'pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'My Deliveries',
          headerStyle: { backgroundColor: '#059669' },
          headerTintColor: '#FFFFFF',
        }}
      />

      {earningsQuery.data && (
        <View style={styles.earningsSummary}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>Total Pending</Text>
            <Text style={styles.earningsAmount}>KES {earningsQuery.data.summary.totalPending.toFixed(2)}</Text>
          </View>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsTitle}>Total Paid</Text>
            <Text style={styles.earningsAmount}>KES {earningsQuery.data.summary.totalPaid.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusTabs}
        contentContainerStyle={styles.statusTabsContent}
      >
        {statusTabs.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusTab,
              selectedStatus === status && styles.statusTabActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusTabText,
                selectedStatus === status && styles.statusTabTextActive,
              ]}
            >
              {getStatusLabel(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.deliveriesList}
        refreshControl={
          <RefreshControl
            refreshing={deliveriesQuery.isRefetching}
            onRefresh={handleRefresh}
            colors={['#059669']}
          />
        }
      >
        {deliveriesQuery.isLoading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading deliveries...</Text>
          </View>
        ) : deliveriesQuery.data?.deliveries.length === 0 ? (
          <View style={styles.centerContainer}>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No deliveries found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'pending'
                ? 'New delivery requests will appear here'
                : `No ${getStatusLabel(selectedStatus).toLowerCase()} deliveries`}
            </Text>
          </View>
        ) : (
          deliveriesQuery.data?.deliveries.map(renderDeliveryCard)
        )}
      </ScrollView>

      {renderActionModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  earningsSummary: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  earningsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#059669',
  },
  statusTabs: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  statusTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusTabActive: {
    backgroundColor: '#059669',
  },
  statusTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  statusTabTextActive: {
    color: '#FFFFFF',
  },
  deliveriesList: {
    flex: 1,
    padding: 16,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  deliveryInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#059669',
  },
  payoutStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#111827',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic' as const,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  earningsValue: {
    fontSize: 14,
    color: '#111827',
  },
  earningsLabelBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  earningsValueBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#059669',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
