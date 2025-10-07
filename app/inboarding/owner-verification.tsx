import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FileText, Upload, CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLogisticsInboarding, OwnerVerification } from '@/providers/logistics-inboarding-provider';

export default function OwnerVerificationScreen() {
  const router = useRouter();
  const { setOwnerVerification, completeQuickStart } = useLogisticsInboarding();

  const [logbookUri, setLogbookUri] = useState('');
  const [insuranceUri, setInsuranceUri] = useState('');
  const [ntsaInspectionUri, setNtsaInspectionUri] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState('');

  const pickDocument = async (type: 'logbook' | 'insurance' | 'ntsa') => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Document picker is not available on web');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (type === 'logbook') setLogbookUri(uri);
        else if (type === 'insurance') setInsuranceUri(uri);
        else if (type === 'ntsa') setNtsaInspectionUri(uri);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSkipForNow = () => {
    console.log('[OwnerVerification] Skipping verification for now');
    
    const verification: OwnerVerification = {
      verified: false,
    };
    
    setOwnerVerification(verification);
    completeQuickStart();
    router.push('/inboarding/logistics-terms');
  };

  const handleComplete = () => {
    if (!logbookUri || !insuranceUri || !ntsaInspectionUri || !maintenanceStatus.trim()) {
      Alert.alert('Missing Documents', 'Please upload all required documents');
      return;
    }

    console.log('[OwnerVerification] Completing full verification');
    
    const verification: OwnerVerification = {
      logbookUri,
      insuranceUri,
      ntsaInspectionUri,
      maintenanceStatus,
      verified: true,
    };
    
    setOwnerVerification(verification);
    completeQuickStart();
    router.push('/inboarding/logistics-terms');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Vehicle Verification', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
        <Text style={styles.progressText}>80% Complete</Text>

        <Text style={styles.title}>Full Verification</Text>
        <Text style={styles.subtitle}>
          Upload these documents to unlock premium routes, pooling jobs, and fleet analytics
        </Text>

        <View style={styles.documentsContainer}>
          <View style={styles.documentItem}>
            <View style={styles.documentHeader}>
              <FileText size={24} color="#007AFF" />
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Logbook / Lease Agreement</Text>
                <Text style={styles.documentSubtitle}>Required for verification</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, logbookUri && styles.uploadButtonSuccess]}
              onPress={() => pickDocument('logbook')}
            >
              {logbookUri ? (
                <>
                  <CheckCircle size={20} color="#34C759" />
                  <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
                </>
              ) : (
                <>
                  <Upload size={20} color="#007AFF" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.documentItem}>
            <View style={styles.documentHeader}>
              <FileText size={24} color="#007AFF" />
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Insurance Cover</Text>
                <Text style={styles.documentSubtitle}>Valid insurance certificate</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, insuranceUri && styles.uploadButtonSuccess]}
              onPress={() => pickDocument('insurance')}
            >
              {insuranceUri ? (
                <>
                  <CheckCircle size={20} color="#34C759" />
                  <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
                </>
              ) : (
                <>
                  <Upload size={20} color="#007AFF" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.documentItem}>
            <View style={styles.documentHeader}>
              <FileText size={24} color="#007AFF" />
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>NTSA Inspection Certificate</Text>
                <Text style={styles.documentSubtitle}>Valid inspection certificate</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, ntsaInspectionUri && styles.uploadButtonSuccess]}
              onPress={() => pickDocument('ntsa')}
            >
              {ntsaInspectionUri ? (
                <>
                  <CheckCircle size={20} color="#34C759" />
                  <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
                </>
              ) : (
                <>
                  <Upload size={20} color="#007AFF" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✅ Unlocks:</Text>
          <Text style={styles.infoItem}>• Pooling jobs & premium routes</Text>
          <Text style={styles.infoItem}>• Fleet analytics dashboard</Text>
          <Text style={styles.infoItem}>• Higher earning potential</Text>
          <Text style={styles.infoItem}>• Verified Fleet Owner badge</Text>
        </View>

        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Complete Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipForNow}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          You can complete verification later from your dashboard
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 22,
  },
  documentsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  documentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  documentHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    gap: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  uploadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  uploadButtonSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  uploadButtonTextSuccess: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#34C759',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 22,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  note: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center' as const,
  },
});
