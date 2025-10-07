import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Shield, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react-native';

interface VerificationCardProps {
  verification: {
    status: string;
    tier: string;
    progress: number;
    documents: Array<{
      id: string;
      type: string;
      status: string;
      uploaded_at: string;
    }>;
  };
  onUploadDocuments: () => void;
  onViewQR: () => void;
}

export default function VerificationCard({ verification, onUploadDocuments, onViewQR }: VerificationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admin_approved': return '#10B981';
      case 'qr_verified': return '#3B82F6';
      case 'human_verified': return '#8B5CF6';
      case 'ai_verified': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'admin_approved': return CheckCircle;
      case 'qr_verified': 
      case 'human_verified': return Shield;
      case 'ai_verified': return Clock;
      default: return AlertCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'admin_approved': return 'Fully Verified';
      case 'qr_verified': return 'QR Verified';
      case 'human_verified': return 'Human Verified';
      case 'ai_verified': return 'AI Verified';
      default: return 'Unverified';
    }
  };

  const StatusIcon = getStatusIcon(verification.status);
  const statusColor = getStatusColor(verification.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${statusColor}20` }]}>
            <StatusIcon size={24} color={statusColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Verification Status</Text>
            <Text style={[styles.status, { color: statusColor }]}>
              {getStatusText(verification.status)}
            </Text>
          </View>
        </View>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{verification.tier.toUpperCase()}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${verification.progress}%`,
                backgroundColor: statusColor
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{verification.progress}% Complete</Text>
      </View>

      {/* Documents Status */}
      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Documents ({verification.documents.length})</Text>
        {verification.documents.length > 0 ? (
          verification.documents.slice(0, 3).map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <Text style={styles.documentType}>
                {doc.type.replace('_', ' ').toUpperCase()}
              </Text>
              <View style={[
                styles.documentStatus,
                { backgroundColor: doc.status === 'approved' ? '#10B981' : doc.status === 'rejected' ? '#EF4444' : '#F59E0B' }
              ]}>
                <Text style={styles.documentStatusText}>
                  {doc.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDocuments}>No documents uploaded</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={onUploadDocuments}
          activeOpacity={0.8}
        >
          <Upload size={16} color="white" />
          <Text style={styles.uploadButtonText}>
            {verification.documents.length > 0 ? 'Update Documents' : 'Upload Documents'}
          </Text>
        </TouchableOpacity>

        {verification.status !== 'unverified' && (
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={onViewQR}
            activeOpacity={0.8}
          >
            <Shield size={16} color="#2D5016" />
            <Text style={styles.qrButtonText}>View QR Badge</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  tierBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  documentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentType: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  documentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  documentStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  noDocuments: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  qrButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  qrButtonText: {
    color: '#2D5016',
    fontSize: 14,
    fontWeight: '600',
  },
});