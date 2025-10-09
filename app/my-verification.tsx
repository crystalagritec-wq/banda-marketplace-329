import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
type DocumentType = 'id_card' | 'passport' | 'business_license' | 'tax_certificate';

interface Document {
  type: DocumentType;
  status: VerificationStatus;
  uploadedAt?: string;
  rejectionReason?: string;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  id_card: 'National ID / Passport',
  passport: 'Passport',
  business_license: 'Business License',
  tax_certificate: 'Tax Certificate (KRA PIN)',
};

export default function MyVerificationScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({});
  const updateDocumentsMutation = trpc.verification.updateDocuments.useMutation();

  const verificationData = dashboardQuery.data?.data?.verification;
  const currentTier = verificationData?.tier || 'Unverified';
  const verificationStatus = verificationData?.status || 'unverified';

  const documents: Document[] = [
    {
      type: 'id_card',
      status: verificationStatus === 'verified' ? 'verified' : verificationStatus === 'pending' ? 'pending' : 'unverified',
      uploadedAt: verificationStatus !== 'unverified' ? new Date().toISOString() : undefined,
    },
  ];

  const handleUploadDocument = async (docType: DocumentType) => {
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        {
          text: 'Take Photo',
          onPress: () => uploadDocument(docType, 'camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => uploadDocument(docType, 'gallery'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadDocument = async (docType: DocumentType, source: 'camera' | 'gallery') => {
    try {
      setIsUploading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateDocumentsMutation.mutateAsync({
        userId: user?.id || '',
        documentType: docType,
        documentUrl: `https://example.com/documents/${docType}_${Date.now()}.jpg`,
      });

      await dashboardQuery.refetch();
      
      Alert.alert('Success', 'Document uploaded successfully. Verification in progress.');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'rejected':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <AlertCircle size={20} color="#9CA3AF" />;
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <ShieldCheck size={32} color={getStatusColor(verificationStatus)} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Verification Status</Text>
                <Text style={[styles.statusBadge, { color: getStatusColor(verificationStatus) }]}>
                  {currentTier}
                </Text>
              </View>
            </View>

            {verificationStatus === 'unverified' && (
              <View style={styles.statusMessage}>
                <AlertCircle size={16} color="#F59E0B" />
                <Text style={styles.statusMessageText}>
                  Upload your documents to get verified and unlock premium features
                </Text>
              </View>
            )}

            {verificationStatus === 'pending' && (
              <View style={[styles.statusMessage, { backgroundColor: '#FEF3C7' }]}>
                <Clock size={16} color="#F59E0B" />
                <Text style={styles.statusMessageText}>
                  Your documents are under review. This usually takes 24-48 hours.
                </Text>
              </View>
            )}

            {verificationStatus === 'verified' && (
              <View style={[styles.statusMessage, { backgroundColor: '#D1FAE5' }]}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={[styles.statusMessageText, { color: '#065F46' }]}>
                  Your account is verified! Enjoy all premium features.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            
            {documents.map((doc) => (
              <View key={doc.type} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={styles.documentIcon}>
                    <FileText size={20} color="#2D5016" />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{DOCUMENT_LABELS[doc.type]}</Text>
                    {doc.uploadedAt && (
                      <Text style={styles.documentDate}>
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {getStatusIcon(doc.status)}
                </View>

                {doc.status === 'unverified' && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handleUploadDocument(doc.type)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Upload size={18} color="#FFFFFF" />
                        <Text style={styles.uploadButtonText}>Upload Document</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {doc.status === 'rejected' && doc.rejectionReason && (
                  <View style={styles.rejectionBox}>
                    <Text style={styles.rejectionText}>{doc.rejectionReason}</Text>
                    <TouchableOpacity
                      style={[styles.uploadButton, { marginTop: 8 }]}
                      onPress={() => handleUploadDocument(doc.type)}
                      disabled={isUploading}
                    >
                      <Upload size={18} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Re-upload</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Verification Benefits</Text>
            <View style={styles.benefitsList}>
              <BenefitItem text="Increased trust from buyers and sellers" />
              <BenefitItem text="Higher transaction limits" />
              <BenefitItem text="Priority customer support" />
              <BenefitItem text="Access to premium features" />
              <BenefitItem text="Verified badge on your profile" />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <CheckCircle2 size={16} color="#10B981" />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  statusBadge: { fontSize: 20, fontWeight: '700' },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  statusMessageText: { flex: 1, fontSize: 13, color: '#92400E' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  documentDate: { fontSize: 12, color: '#6B7280' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  uploadButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  rejectionText: { fontSize: 13, color: '#991B1B' },
  benefitsSection: { marginTop: 24 },
  benefitsList: { gap: 12 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { fontSize: 14, color: '#4B5563' },
});
