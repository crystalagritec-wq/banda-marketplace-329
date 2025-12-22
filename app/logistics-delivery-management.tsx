import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useMemo } from 'react';
import { 
  Truck, MapPin, Clock, CheckCircle, XCircle,
  Search, Filter, Package, Navigation,
  Phone, MessageCircle, User, ChevronRight, Map
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DeliveryStatus = 'all' | 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'cancelled';

export default function LogisticsDeliveryManagementScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: deliveriesData, isLoading, refetch } = trpc.logistics.getDeliveries.useQuery({
    userId: 'current-user-id',
    role: 'provider' as const,
    status: selectedStatus === 'all' ? undefined : (selectedStatus === 'assigned' ? 'pending' : selectedStatus),
  });

  const deliveries = useMemo(() => deliveriesData?.deliveries || [], [deliveriesData]);

  const updateStatusMutation = trpc.logistics.updateDeliveryStatus.useMutation({
    onSuccess: () => {
      refetch();
      setShowActionModal(false);
      setSelectedDelivery(null);
    },
  });

  const optimizeRouteMutation = trpc.logistics.optimizeDeliveryRoutes.useMutation({
    onSuccess: (data) => {
      console.log('Route optimized:', data);
      refetch();
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredDeliveries = useMemo(() => {
    if (!deliveries || deliveries.length === 0) return [];
    
    return deliveries.filter((delivery: any) => {
      const matchesSearch = 
        delivery.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.delivery_location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.pickup_location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [deliveries, searchQuery]);

  const statusCounts = useMemo(() => {
    if (!deliveries) return {};
    
    return deliveries.reduce((acc: any, delivery: any) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1;
      return acc;
    }, {});
  }, [deliveries]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'assigned': return '#007AFF';
      case 'in_progress': return '#5856D6';
      case 'delivered': return '#34C759';
      case 'cancelled': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'assigned': return Truck;
      case 'in_progress': return Navigation;
      case 'delivered': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const handleStatusUpdate = (newStatus: 'pending' | 'in_progress' | 'delivered' | 'cancelled') => {
    if (!selectedDelivery) return;
    
    updateStatusMutation.mutate({
      assignmentId: selectedDelivery.id,
      status: newStatus,
    });
  };

  const handleOptimizeRoute = () => {
    if (!selectedDelivery) return;
    
    optimizeRouteMutation.mutate({
      orderIds: [selectedDelivery.order_id],
    });
  };

  const renderDeliveryCard = (delivery: any) => {
    const StatusIcon = getStatusIcon(delivery.status);
    const statusColor = getStatusColor(delivery.status);

    return (
      <TouchableOpacity
        key={delivery.id}
        style={styles.deliveryCard}
        onPress={() => {
          setSelectedDelivery(delivery);
          setShowActionModal(true);
        }}
      >
        <View style={styles.deliveryHeader}>
          <View style={styles.deliveryTitleRow}>
            <Package size={20} color="#007AFF" />
            <Text style={styles.deliveryTitle} numberOfLines={1}>
              Order #{delivery.order_id?.slice(0, 8)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <StatusIcon size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {delivery.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {delivery.pickup_location?.address || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.locationRow}>
            <MapPin size={16} color="#FF3B30" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Delivery</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {delivery.delivery_location?.address || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.deliveryDetails}>
          {delivery.distance_km && (
            <View style={styles.detailChip}>
              <Navigation size={14} color="#8E8E93" />
              <Text style={styles.detailChipText}>{delivery.distance_km.toFixed(1)} km</Text>
            </View>
          )}

          {delivery.estimated_duration && (
            <View style={styles.detailChip}>
              <Clock size={14} color="#8E8E93" />
              <Text style={styles.detailChipText}>{delivery.estimated_duration} min</Text>
            </View>
          )}

          {delivery.pooled && (
            <View style={[styles.detailChip, styles.pooledChip]}>
              <Text style={styles.pooledText}>Pooled</Text>
            </View>
          )}
        </View>

        <View style={styles.deliveryFooter}>
          <View style={styles.driverInfo}>
            <User size={16} color="#8E8E93" />
            <Text style={styles.driverName}>
              {delivery.provider?.name || 'Unassigned'}
            </Text>
          </View>
          <ChevronRight size={20} color="#C7C7CC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Delivery Management</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Filter size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deliveries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {(['all', 'pending', 'in_progress', 'delivered', 'cancelled'] as DeliveryStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilter,
              selectedStatus === status && styles.statusFilterActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === status && styles.statusFilterTextActive,
              ]}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </Text>
            {statusCounts[status] > 0 && (
              <View style={[
                styles.countBadge,
                selectedStatus === status && styles.countBadgeActive,
              ]}>
                <Text style={[
                  styles.countText,
                  selectedStatus === status && styles.countTextActive,
                ]}>
                  {statusCounts[status]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading deliveries...</Text>
        </View>
      ) : filteredDeliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Truck size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Deliveries Found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search' : 'New deliveries will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.deliveriesList}
          contentContainerStyle={styles.deliveriesListContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredDeliveries.map(renderDeliveryCard)}
        </ScrollView>
      )}

      <Modal
        visible={showActionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery Details</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <XCircle size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {selectedDelivery && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order ID</Text>
                  <Text style={styles.modalSectionText}>
                    {selectedDelivery.order_id}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Route</Text>
                  <View style={styles.routeCard}>
                    <View style={styles.routePoint}>
                      <View style={styles.routePointDot} />
                      <View style={styles.routePointDetails}>
                        <Text style={styles.routePointLabel}>Pickup Location</Text>
                        <Text style={styles.routePointText}>
                          {selectedDelivery.pickup_location?.address || 'Not specified'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.routeConnector} />

                    <View style={styles.routePoint}>
                      <MapPin size={20} color="#FF3B30" />
                      <View style={styles.routePointDetails}>
                        <Text style={styles.routePointLabel}>Delivery Location</Text>
                        <Text style={styles.routePointText}>
                          {selectedDelivery.delivery_location?.address || 'Not specified'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Delivery Info</Text>
                  <View style={styles.infoGrid}>
                    {selectedDelivery.distance_km && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Distance</Text>
                        <Text style={styles.infoValue}>
                          {selectedDelivery.distance_km.toFixed(1)} km
                        </Text>
                      </View>
                    )}

                    {selectedDelivery.estimated_duration && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>
                          {selectedDelivery.estimated_duration} min
                        </Text>
                      </View>
                    )}

                    {selectedDelivery.eta && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>ETA</Text>
                        <Text style={styles.infoValue}>
                          {new Date(selectedDelivery.eta).toLocaleTimeString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {selectedDelivery.provider && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Driver</Text>
                    <View style={styles.driverCard}>
                      <User size={24} color="#007AFF" />
                      <View style={styles.driverDetails}>
                        <Text style={styles.driverCardName}>
                          {selectedDelivery.provider.name}
                        </Text>
                        <Text style={styles.driverCardVehicle}>
                          {selectedDelivery.provider.vehicle_type}
                        </Text>
                      </View>
                      <View style={styles.driverActions}>
                        <TouchableOpacity style={styles.iconAction}>
                          <Phone size={20} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconAction}>
                          <MessageCircle size={20} color="#34C759" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Actions</Text>
                  <View style={styles.statusActions}>
                    {selectedDelivery.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.startButton]}
                        onPress={() => handleStatusUpdate('in_progress')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Navigation size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Start Delivery</Text>
                      </TouchableOpacity>
                    )}

                    {selectedDelivery.status === 'in_progress' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => handleStatusUpdate('delivered')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Mark Delivered</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.actionButton, styles.optimizeButton]}
                      onPress={handleOptimizeRoute}
                      disabled={optimizeRouteMutation.isPending}
                    >
                      <Map size={20} color="#007AFF" />
                      <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
                        Optimize Route
                      </Text>
                    </TouchableOpacity>

                    {selectedDelivery.status !== 'delivered' && selectedDelivery.status !== 'cancelled' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleStatusUpdate('cancelled')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Cancel Delivery</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  statusFilters: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusFilter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  statusFilterActive: {
    backgroundColor: '#007AFF',
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    textTransform: 'capitalize' as const,
  },
  statusFilterTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center' as const,
  },
  countBadgeActive: {
    backgroundColor: '#FFFFFF30',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  deliveriesList: {
    flex: 1,
  },
  deliveriesListContent: {
    padding: 16,
    gap: 12,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  deliveryTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  deliveryTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  routeInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    marginTop: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  locationText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
    marginVertical: 4,
  },
  deliveryDetails: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 12,
  },
  detailChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  detailChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  pooledChip: {
    backgroundColor: '#007AFF15',
  },
  pooledText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  deliveryFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  driverInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  modalSectionText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  routeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  routePoint: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  routePointDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    marginTop: 2,
  },
  routePointDetails: {
    flex: 1,
  },
  routePointLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  routePointText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  routeConnector: {
    width: 2,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginLeft: 9,
    marginVertical: 8,
  },
  infoGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  driverCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverCardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  driverCardVehicle: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'capitalize' as const,
  },
  driverActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  statusActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  assignButton: {
    backgroundColor: '#007AFF',
  },
  startButton: {
    backgroundColor: '#5856D6',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  optimizeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
