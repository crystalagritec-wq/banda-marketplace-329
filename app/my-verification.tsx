import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Award,
  TrendingUp,
  Users,
  Zap,
  Camera,
  Image as ImageIcon,
  File,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
type DocumentType = 'national_id' | 'passport' | 'business_permit' | 'tax_certificate';

interface Document {
  type: DocumentType;
  status: VerificationStatus;
  uploadedAt?: string;
  rejectionReason?: string;
  url?: string;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  national_id: 'National ID / Passport',
  passport: 'International Passport',
  business_permit: 'Business License / Permit',
  tax_certificate: 'Tax Certificate (KRA PIN)',
};

const VERIFICATION_TIERS = [
  { 
    name: 'Unverified', 
    color: '#9CA3AF', 
    limit: '1 product', 
    features: ['Basic marketplace access', 'Limited visibility'],
    icon: '🔒'
  },
  { 
    name: 'Verified', 
    color: '#10B981', 
    limit: '50 products', 
    features: ['Priority listing', 'Wallet access', 'Email support', 'Trust badge'],
    icon: '✓'
  },
  { 
    name: 'Premium', 
    color: '#F59E0B', 
    limit: '200 products', 
    features: ['Featured placement', 'Advanced analytics', 'Marketing tools', 'Priority support'],
    icon: '⭐'
  },
  { 
    name: 'Elite', 
    color: '#8B5CF6', 
    limit: 'Unlimited', 
    features: ['Dedicated manager', '24/7 support', 'Custom branding', 'API access'],
    icon: '👑'
  },
];

export default function MyVerificationScreen() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);

  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({});
  const updateDocumentsMutation = trpc.verification.updateDocuments.useMutation();

  const verificationData = dashboardQuery.data?.data?.verification;
  const currentTier = verificationData?.tier || 'Unverified';
  const verificationStatus = verificationData?.status || 'unverified';

  const documents: Document[] = [
    {
      type: 'national_id',
      status: verificationStatus === 'verified' ? 'verified' : verificationStatus === 'pending' ? 'pending' : 'unverified',
      uploadedAt: verificationStatus !== 'unverified' ? new Date().toISOString() : undefined,
    },
    {
      type: 'business_permit',
      status: 'unverified',
    },
    {
      type: 'tax_certificate',
      status: 'unverified',
    },
  ];

  const handleUploadDocument = async (docType: DocumentType) => {
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        {
          text: 'Take Photo',
          onPress: () => uploadFromCamera(docType),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => uploadFromGallery(docType),
        },
        {
          text: 'Choose File',
          onPress: () => uploadFromFiles(docType),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadFromCamera = async (docType: DocumentType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processUpload(docType, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const uploadFromGallery = async (docType: DocumentType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processUpload(docType, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  const uploadFromFiles = async (docType: DocumentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processUpload(docType, result.assets[0].uri);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to select file.');
    }
  };

  const processUpload = async (docType: DocumentType, uri: string) => {
    try {
      setIsUploading(true);
      setUploadingDoc(docType);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateDocumentsMutation.mutateAsync({
        documents: [{
          type: docType,
          url: uri,
        }],
      });

      await dashboardQuery.refetch();
      
      Alert.alert('Success', 'Document uploaded successfully. Verification in progress.');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadingDoc(null);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 size={24} color="#10B981" />;
      case 'pending':
        return <Clock size={24} color="#F59E0B" />;
      case 'rejected':
        return <XCircle size={24} color="#EF4444" />;
      default:
        return <AlertCircle size={24} color="#9CA3AF" />;
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

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Uploaded';
    }
  };

  const currentTierIndex = VERIFICATION_TIERS.findIndex(t => t.name === currentTier);
  const progress = ((currentTierIndex + 1) / VERIFICATION_TIERS.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[getStatusColor(verificationStatus), `${getStatusColor(verificationStatus)}DD`]}
          style={styles.statusCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              {getStatusIcon(verificationStatus)}
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={styles.statusTitle}>{currentTier}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.statusSubtext}>
            {verificationStatus === 'unverified' && 'Upload documents to get verified and unlock more features'}
            {verificationStatus === 'pending' && 'Your documents are under review. This usually takes 24-48 hours'}
            {verificationStatus === 'verified' && 'You have full access to all marketplace features'}
            {verificationStatus === 'rejected' && 'Some documents were rejected. Please re-upload correct documents'}
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Tiers</Text>
          <View style={styles.tiersGrid}>
            {VERIFICATION_TIERS.map((tier, index) => (
              <View
                key={tier.name}
                style={[
                  styles.tierCard,
                  currentTier === tier.name && styles.tierCardActive,
                ]}
              >
                <Text style={styles.tierEmoji}>{tier.icon}</Text>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierLimit}>{tier.limit}</Text>
                {currentTier === tier.name && (
                  <View style={styles.currentBadge}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <Text style={styles.currentText}>Current</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Text style={styles.sectionDescription}>
            Upload clear photos or scans of your documents. All information must be visible.
          </Text>
          
          {documents.map((doc) => (
            <View key={doc.type} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={[
                  styles.documentIcon,
                  doc.status === 'verified' && styles.documentIconVerified,
                  doc.status === 'pending' && styles.documentIconPending,
                ]}>
                  <FileText size={24} color={
                    doc.status === 'verified' ? '#10B981' :
                    doc.status === 'pending' ? '#F59E0B' : '#2D5016'
                  } />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{DOCUMENT_LABELS[doc.type]}</Text>
                  <View style={styles.documentStatus}>
                    {getStatusIcon(doc.status)}
                    <Text style={[
                      styles.documentStatusText,
                      { color: getStatusColor(doc.status) }
                    ]}>
                      {getStatusText(doc.status)}
                    </Text>
                  </View>
                  {doc.uploadedAt && (
                    <Text style={styles.documentDate}>
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>

              {doc.status === 'unverified' && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadDocument(doc.type)}
                  disabled={isUploading}
                >
                  {isUploading && uploadingDoc === doc.type ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Upload size={20} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Upload Document</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {doc.status === 'rejected' && doc.rejectionReason && (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionText}>{doc.rejectionReason}</Text>
                  <TouchableOpacity
                    style={[styles.uploadButton, { marginTop: 12 }]}
                    onPress={() => handleUploadDocument(doc.type)}
                    disabled={isUploading}
                  >
                    <Upload size={20} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Re-upload</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Benefits</Text>
          <View style={styles.benefitsGrid}>
            <BenefitCard 
              icon={<TrendingUp size={24} color="#10B981" />} 
              title="Higher Limits" 
              description="List more products and reach more customers" 
            />
            <BenefitCard 
              icon={<Users size={24} color="#3B82F6" />} 
              title="Trust Badge" 
              description="Display verified seller badge on your profile" 
            />
            <BenefitCard 
              icon={<Award size={24} color="#F59E0B" />} 
              title="Priority Support" 
              description="Get faster response from our support team" 
            />
            <BenefitCard 
              icon={<Zap size={24} color="#8B5CF6" />} 
              title="Premium Tools" 
              description="Access advanced analytics and marketing tools" 
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <ShieldCheck size={24} color="#2D5016" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your Data is Secure</Text>
            <Text style={styles.infoText}>
              All documents are encrypted and stored securely. We never share your personal information with third parties.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>{icon as React.ReactElement}</View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937' },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  statusCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 4, fontWeight: '600' as const },
  statusTitle: { fontSize: 24, fontWeight: '700' as const, color: '#FFFFFF' },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  statusSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.95)', lineHeight: 20 },
  section: { marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937', marginBottom: 8 },
  sectionDescription: { fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  tiersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tierCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tierCardActive: { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#F0FDF4' },
  tierEmoji: { fontSize: 32, marginBottom: 8 },
  tierName: { fontSize: 15, fontWeight: '700' as const, color: '#111827', marginBottom: 4 },
  tierLimit: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  currentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  currentText: { fontSize: 11, fontWeight: '600' as const, color: '#065F46' },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  documentIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentIconVerified: { backgroundColor: '#D1FAE5' },
  documentIconPending: { backgroundColor: '#FEF3C7' },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 15, fontWeight: '600' as const, color: '#1F2937', marginBottom: 6 },
  documentStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  documentStatusText: { fontSize: 13, fontWeight: '600' as const },
  documentDate: { fontSize: 12, color: '#6B7280' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2D5016',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: { fontSize: 15, fontWeight: '700' as const, color: '#FFFFFF' },
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectionText: { fontSize: 13, color: '#991B1B', lineHeight: 20 },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  benefitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  benefitIcon: { marginBottom: 12 },
  benefitTitle: { fontSize: 14, fontWeight: '700' as const, color: '#111827', marginBottom: 4, textAlign: 'center' as const },
  benefitDescription: { fontSize: 12, color: '#6B7280', textAlign: 'center' as const, lineHeight: 18 },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 16,
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '700' as const, color: '#065F46', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#047857', lineHeight: 20 },
});
