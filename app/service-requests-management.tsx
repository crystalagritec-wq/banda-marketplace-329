import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { 
  Briefcase, Clock, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, MapPin, Calendar, DollarSign, User,
  Phone, MessageCircle, Star, ChevronRight
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

type RequestStatus = 'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export default function ServiceRequestsManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: requests, isLoading, refetch } = trpc.serviceProviders.getServiceRequests.useQuery({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const updateStatusMutation = trpc.serviceProviders.updateRequestStatus.useMutation({
    onSuccess: () => {
      refetch();
      setShowActionModal(false);
      setSelectedRequest(null);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    return requests.filter((request: any) => {
      const matchesSearch = 
        request.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.location_county.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [requests, searchQuery]);

  const statusCounts = useMemo(() => {
    if (!requests) return {};
    
    return requests.reduce((acc: any, req: any) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});
  }, [requests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'accepted': return '#007AFF';
      case 'in_progress': return '#5856D6';
      case 'completed': return '#34C759';
      case 'cancelled': return '#8E8E93';
      case 'disputed': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'accepted': return CheckCircle;
      case 'in_progress': return Briefcase;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'disputed': return AlertCircle;
      default: return Clock;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!selectedRequest) return;
    
    updateStatusMutation.mutate({
      requestId: selectedRequest.id,
      status: newStatus,
    });
  };

  const renderRequestCard = (request: any) => {
    const StatusIcon = getStatusIcon(request.status);
    const statusColor = getStatusColor(request.status);

    return (
      <TouchableOpacity
        key={request.id}
        style={styles.requestCard}
        onPress={() => {
          setSelectedRequest(request);
          setShowActionModal(true);
        }}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestTitleRow}>
            <Briefcase size={20} color="#007AFF" />
            <Text style={styles.requestTitle} numberOfLines={1}>
              {request.service_name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <StatusIcon size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {request.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.requestDescription} numberOfLines={2}>
          {request.description}
        </Text>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#8E8E93" />
            <Text style={styles.detailText}>
              {request.location_county}, {request.location_sub_county || 'Kenya'}
            </Text>
          </View>

          {request.scheduled_date && (
            <View style={styles.detailRow}>
              <Calendar size={16} color="#8E8E93" />
              <Text style={styles.detailText}>
                {new Date(request.scheduled_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          {request.quoted_price && (
            <View style={styles.detailRow}>
              <DollarSign size={16} color="#34C759" />
              <Text style={[styles.detailText, { color: '#34C759', fontWeight: '600' as const }]}>
                KES {request.quoted_price.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.requestFooter}>
          <View style={styles.requesterInfo}>
            <User size={16} color="#8E8E93" />
            <Text style={styles.requesterName}>
              {request.requester?.full_name || 'Anonymous'}
            </Text>
          </View>
          <ChevronRight size={20} color="#C7C7CC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Service Requests',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Filter size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests..."
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
        {(['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'] as RequestStatus[]).map((status) => (
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
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Briefcase size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Requests Found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search' : 'New requests will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.requestsList}
          contentContainerStyle={styles.requestsListContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredRequests.map(renderRequestCard)}
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
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <XCircle size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Service</Text>
                  <Text style={styles.modalSectionText}>{selectedRequest.service_name}</Text>
                  <Text style={styles.modalSectionSubtext}>{selectedRequest.category}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalSectionText}>{selectedRequest.description}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Location</Text>
                  <Text style={styles.modalSectionText}>
                    {selectedRequest.location_address || 
                     `${selectedRequest.location_county}, ${selectedRequest.location_sub_county || 'Kenya'}`}
                  </Text>
                </View>

                {selectedRequest.scheduled_date && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Scheduled For</Text>
                    <Text style={styles.modalSectionText}>
                      {new Date(selectedRequest.scheduled_date).toLocaleString()}
                    </Text>
                  </View>
                )}

                {selectedRequest.quoted_price && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Quoted Price</Text>
                    <Text style={[styles.modalSectionText, { color: '#34C759', fontSize: 20, fontWeight: '700' as const }]}>
                      KES {selectedRequest.quoted_price.toLocaleString()}
                    </Text>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Requester</Text>
                  <View style={styles.requesterCard}>
                    <User size={24} color="#007AFF" />
                    <View style={styles.requesterDetails}>
                      <Text style={styles.requesterCardName}>
                        {selectedRequest.requester?.full_name || 'Anonymous'}
                      </Text>
                      {selectedRequest.requester?.phone && (
                        <Text style={styles.requesterCardPhone}>
                          {selectedRequest.requester.phone}
                        </Text>
                      )}
                    </View>
                    <View style={styles.requesterActions}>
                      <TouchableOpacity style={styles.iconAction}>
                        <Phone size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconAction}>
                        <MessageCircle size={20} color="#34C759" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Update Status</Text>
                  <View style={styles.statusActions}>
                    {selectedRequest.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => handleStatusUpdate('accepted')}
                          disabled={updateStatusMutation.isLoading}
                        >
                          <CheckCircle size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleStatusUpdate('cancelled')}
                          disabled={updateStatusMutation.isLoading}
                        >
                          <XCircle size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Decline</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {selectedRequest.status === 'accepted' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.startButton]}
                        onPress={() => handleStatusUpdate('in_progress')}
                        disabled={updateStatusMutation.isLoading}
                      >
                        <Briefcase size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Start Work</Text>
                      </TouchableOpacity>
                    )}

                    {selectedRequest.status === 'in_progress' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => handleStatusUpdate('completed')}
                        disabled={updateStatusMutation.isLoading}
                      >
                        <CheckCircle size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Mark Complete</Text>
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
  requestsList: {
    flex: 1,
  },
  requestsListContent: {
    padding: 16,
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  requestTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  requestTitle: {
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
  requestDescription: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
    marginBottom: 12,
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  requestFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  requesterInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  requesterName: {
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
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  modalSectionText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  modalSectionSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  requesterCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  requesterDetails: {
    flex: 1,
  },
  requesterCardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  requesterCardPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  requesterActions: {
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
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  startButton: {
    backgroundColor: '#5856D6',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
