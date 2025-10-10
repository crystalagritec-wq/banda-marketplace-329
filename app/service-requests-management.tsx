import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/providers/theme-provider';
import { trpc } from '@/lib/trpc';

type RequestStatus = 'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export default function ServiceRequestsManagementScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const requestsQuery = trpc.serviceProviders.getServiceRequestsEnhanced.useQuery({
    status: selectedStatus,
    limit: 50,
    offset: 0,
  });

  const updateStatusMutation = trpc.serviceProviders.updateRequestStatusEnhanced.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Request status updated successfully');
      setShowActionModal(false);
      setSelectedRequest(null);
      setActionNotes('');
      requestsQuery.refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to update request status');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await requestsQuery.refetch();
    setRefreshing(false);
  }, [requestsQuery]);



  const confirmStatusChange = (newStatus: 'accepted' | 'in_progress' | 'completed' | 'cancelled') => {
    if (!selectedRequest) return;

    updateStatusMutation.mutate({
      requestId: selectedRequest.id,
      status: newStatus,
      notes: actionNotes || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'accepted':
        return '#3B82F6';
      case 'in_progress':
        return '#8B5CF6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return theme.colors.mutedText;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'accepted':
      case 'in_progress':
        return Briefcase;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const statusFilters: { label: string; value: RequestStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const requests = requestsQuery.data?.requests || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Service Requests',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
        }}
      />

      <View style={[styles.filterContainer, { backgroundColor: theme.colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    selectedStatus === filter.value ? theme.colors.primary : 'transparent',
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setSelectedStatus(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedStatus === filter.value ? '#FFFFFF' : theme.colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {requestsQuery.isLoading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.mutedText }]}>
              Loading requests...
            </Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.centerContainer}>
            <Briefcase size={64} color={theme.colors.mutedText} />
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
              No {selectedStatus !== 'all' ? selectedStatus : ''} requests found
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request: any) => {
              const StatusIcon = getStatusIcon(request.status);
              const statusColor = getStatusColor(request.status);

              return (
                <TouchableOpacity
                  key={request.id}
                  style={[styles.requestCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setSelectedRequest(request);
                    setShowActionModal(true);
                  }}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestHeaderLeft}>
                      <StatusIcon size={20} color={statusColor} />
                      <Text style={[styles.requestCategory, { color: theme.colors.text }]}>
                        {request.service_category}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {request.status}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.requestDescription, { color: theme.colors.mutedText }]}
                    numberOfLines={2}
                  >
                    {request.description}
                  </Text>

                  {request.requester && (
                    <View style={styles.requesterInfo}>
                      <User size={16} color={theme.colors.mutedText} />
                      <Text style={[styles.requesterName, { color: theme.colors.text }]}>
                        {request.requester.full_name || 'Unknown'}
                      </Text>
                    </View>
                  )}

                  {request.location && (
                    <View style={styles.locationInfo}>
                      <MapPin size={16} color={theme.colors.mutedText} />
                      <Text style={[styles.locationText, { color: theme.colors.mutedText }]}>
                        {request.location}
                      </Text>
                    </View>
                  )}

                  {request.service_fee && (
                    <View style={styles.feeInfo}>
                      <DollarSign size={16} color="#10B981" />
                      <Text style={[styles.feeText, { color: '#10B981' }]}>
                        KSh {Number(request.service_fee).toLocaleString()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.requestFooter}>
                    <View style={styles.dateInfo}>
                      <Calendar size={14} color={theme.colors.mutedText} />
                      <Text style={[styles.dateText, { color: theme.colors.mutedText }]}>
                        {new Date(request.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={theme.colors.mutedText} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Manage Request
            </Text>

            {selectedRequest && (
              <>
                <Text style={[styles.modalSubtitle, { color: theme.colors.mutedText }]}>
                  {selectedRequest.service_category}
                </Text>

                <View style={styles.actionButtons}>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                        onPress={() => confirmStatusChange('accepted')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => confirmStatusChange('cancelled')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedRequest.status === 'accepted' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                      onPress={() => confirmStatusChange('in_progress')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Briefcase size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Start Work</Text>
                    </TouchableOpacity>
                  )}

                  {selectedRequest.status === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                      onPress={() => confirmStatusChange('completed')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}

                  {selectedRequest.requester?.phone && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        Alert.alert('Contact', `Call ${selectedRequest.requester.phone}?`);
                      }}
                    >
                      <Phone size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Call Client</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Add notes (optional)"
                  placeholderTextColor={theme.colors.mutedText}
                  value={actionNotes}
                  onChangeText={setActionNotes}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => {
                    setShowActionModal(false);
                    setSelectedRequest(null);
                    setActionNotes('');
                  }}
                >
                  <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
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
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  requestsList: {
    padding: 16,
  },
  requestCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestCategory: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
