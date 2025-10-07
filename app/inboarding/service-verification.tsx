import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Upload, CheckCircle } from 'lucide-react-native';
import { useServiceInboarding } from '@/providers/service-inboarding-provider';
import { useState, useMemo } from 'react';

export default function ServiceVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updateVerification, nextStep } = useServiceInboarding();
  
  const [idDocument, setIdDocument] = useState(state.verification.idDocument);
  const [license, setLicense] = useState(state.verification.license);
  const [certificates, setCertificates] = useState<string[]>(state.verification.certificates);

  const progress = useMemo(() => {
    let base = 40;
    if (idDocument) base += 7;
    if (license) base += 7;
    if (certificates.length > 0) base += 6;
    return base;
  }, [idDocument, license, certificates]);

  const handleUpload = (type: 'id' | 'license' | 'certificate') => {
    Alert.alert('Upload Document', `Upload ${type} functionality will be implemented`, [
      {
        text: 'Simulate Upload',
        onPress: () => {
          const mockUrl = `https://example.com/${type}_${Date.now()}.pdf`;
          if (type === 'id') setIdDocument(mockUrl);
          else if (type === 'license') setLicense(mockUrl);
          else setCertificates(prev => [...prev, mockUrl]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleNext = () => {
    updateVerification({
      idDocument,
      license,
      certificates,
      professionalCredentials: [],
    });
    nextStep();
    router.push('/inboarding/service-equipment' as any);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Verification?',
      'You can complete verification later, but verified providers get 2x more requests.',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Skip for Now',
          onPress: () => {
            nextStep();
            router.push('/inboarding/service-equipment' as any);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Verification', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification & Credentials</Text>
          <Text style={styles.subtitle}>Upload documents to build trust</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step 4 of 9 • {progress}%</Text>
          </View>
        </View>

        <View style={styles.uploadSection}>
          <TouchableOpacity 
            style={[styles.uploadCard, idDocument && styles.uploadCardComplete]}
            onPress={() => handleUpload('id')}
          >
            <View style={styles.uploadIcon}>
              {idDocument ? (
                <CheckCircle size={32} color="#34C759" />
              ) : (
                <FileText size={32} color="#007AFF" />
              )}
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>ID / Passport *</Text>
              <Text style={styles.uploadDescription}>
                {idDocument ? 'Document uploaded ✓' : 'Upload your identification'}
              </Text>
            </View>
            <Upload size={20} color={idDocument ? '#34C759' : '#8E8E93'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.uploadCard, license && styles.uploadCardComplete]}
            onPress={() => handleUpload('license')}
          >
            <View style={styles.uploadIcon}>
              {license ? (
                <CheckCircle size={32} color="#34C759" />
              ) : (
                <FileText size={32} color="#007AFF" />
              )}
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>Professional License *</Text>
              <Text style={styles.uploadDescription}>
                {license ? 'License uploaded ✓' : 'Upload relevant license'}
              </Text>
            </View>
            <Upload size={20} color={license ? '#34C759' : '#8E8E93'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.uploadCard, certificates.length > 0 && styles.uploadCardComplete]}
            onPress={() => handleUpload('certificate')}
          >
            <View style={styles.uploadIcon}>
              {certificates.length > 0 ? (
                <CheckCircle size={32} color="#34C759" />
              ) : (
                <FileText size={32} color="#007AFF" />
              )}
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>Certificates (Optional)</Text>
              <Text style={styles.uploadDescription}>
                {certificates.length > 0 
                  ? `${certificates.length} certificate(s) uploaded ✓` 
                  : 'Training certificates, credentials'}
              </Text>
            </View>
            <Upload size={20} color={certificates.length > 0 ? '#34C759' : '#8E8E93'} />
          </TouchableOpacity>
        </View>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>✨ Benefits of Verification</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• 2x more service requests</Text>
            <Text style={styles.benefitItem}>• Higher trust score</Text>
            <Text style={styles.benefitItem}>• Premium badge on profile</Text>
            <Text style={styles.benefitItem}>• Access to high-value contracts</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔒 All documents are encrypted and securely stored. Only verified admins can review them.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600' as const,
  },
  uploadSection: {
    gap: 16,
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  uploadCardComplete: {
    borderColor: '#34C759',
    backgroundColor: '#34C75910',
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  benefitsBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1565C0',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 15,
    color: '#1565C0',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  infoText: {
    fontSize: 14,
    color: '#8B6914',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row' as const,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
