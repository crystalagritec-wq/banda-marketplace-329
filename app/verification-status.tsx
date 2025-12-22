import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { roleService } from '@/services/role-service';
import { VerificationRequest, UserRole, VerificationMethod } from '@/lib/supabase';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, FileText, Users, Shield } from 'lucide-react-native';

export default function VerificationStatusScreen() {
  const { user } = useAuth();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVerificationRequests = React.useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const requests = await roleService.getUserVerificationRequests(user.id);
      setVerificationRequests(requests);
    } catch (error) {
      console.error('❌ Error loading verification requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVerificationRequests();
  }, [loadVerificationRequests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'approved':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rejected':
        return <XCircle size={20} color="#DC2626" />;
      default:
        return <AlertCircle size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getVerificationMethodIcon = (method: VerificationMethod) => {
    switch (method) {
      case 'ai_id':
        return <Shield size={16} color="#10B981" />;
      case 'human_qr':
        return <Users size={16} color="#F59E0B" />;
      case 'admin_approval':
        return <FileText size={16} color="#8B5CF6" />;
      default:
        return <FileText size={16} color="#6B7280" />;
    }
  };

  const getVerificationMethodName = (method: VerificationMethod) => {
    switch (method) {
      case 'ai_id':
        return 'AI ID Verification';
      case 'human_qr':
        return 'Human + QR Verification';
      case 'admin_approval':
        return 'Admin Approval';
      default:
        return 'Verification';
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'seller':
        return 'Seller';
      case 'service_provider':
        return 'Service Provider';
      case 'logistics_provider':
        return 'Logistics Provider';
      case 'farmer':
        return 'Farmer';
      default:
        return 'User';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading verification status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}

      >
        <View style={styles.content}>
          <Text style={styles.title}>Your Verification Requests</Text>
          <Text style={styles.description}>
            Track the status of your role upgrade and verification requests.
          </Text>

          {verificationRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FileText size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Verification Requests</Text>
              <Text style={styles.emptyText}>
                You have not submitted any verification requests yet. 
                Start by requesting a role upgrade from your account status page.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/role-selection')}
                testID="go-to-upgrades"
              >
                <Text style={styles.upgradeButtonText}>View Available Upgrades</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.requestsContainer}>
              {verificationRequests.map((request) => {
                const statusColor = getStatusColor(request.status);
                const StatusIcon = getStatusIcon(request.status);
                const MethodIcon = getVerificationMethodIcon(request.verification_method);
                
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestTitle}>
                          {getRoleTitle(request.role_type)} Role
                        </Text>
                        <View style={styles.methodBadge}>
                          {MethodIcon}
                          <Text style={styles.methodText}>
                            {getVerificationMethodName(request.verification_method)}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        {StatusIcon}
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requestDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Submitted</Text>
                        <Text style={styles.detailValue}>
                          {formatDate(request.created_at)}
                        </Text>
                      </View>
                      
                      {request.updated_at !== request.created_at && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Last Updated</Text>
                          <Text style={styles.detailValue}>
                            {formatDate(request.updated_at)}
                          </Text>
                        </View>
                      )}

                      {request.document_urls && request.document_urls.length > 0 && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Documents</Text>
                          <Text style={styles.detailValue}>
                            {request.document_urls.length} uploaded
                          </Text>
                        </View>
                      )}
                    </View>

                    {request.review_notes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.notesTitle}>Review Notes:</Text>
                        <Text style={styles.notesText}>{request.review_notes}</Text>
                      </View>
                    )}

                    {request.status === 'pending' && (
                      <View style={styles.pendingInfo}>
                        <AlertCircle size={16} color="#F59E0B" />
                        <Text style={styles.pendingText}>
                          {request.verification_method === 'ai_id' 
                            ? 'AI processing usually takes 2-5 minutes'
                            : request.verification_method === 'human_qr'
                            ? 'Human review takes 1-2 business days'
                            : 'Admin review takes 3-5 business days'
                          }
                        </Text>
                      </View>
                    )}

                    {request.status === 'rejected' && (
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => router.push({
                          pathname: '/verification' as any,
                          params: {
                            roleType: request.role_type,
                            verificationMethod: request.verification_method,
                            userId: user?.id || ''
                          }
                        })}
                        testID={`retry-${request.id}`}
                      >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  requestsContainer: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});