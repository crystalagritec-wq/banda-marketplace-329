import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FileText, Upload, CheckCircle, QrCode } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLogisticsInboarding, DriverVerification } from '@/providers/logistics-inboarding-provider';

export default function DriverVerificationScreen() {
  const router = useRouter();
  const { setDriverVerification, completeQuickStart } = useLogisticsInboarding();

  const [goodConductUri, setGoodConductUri] = useState('');
  const [qrVerified, setQrVerified] = useState(false);

  const pickDocument = async () => {
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
        setGoodConductUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleQRVerification = () => {
    Alert.alert(
      'QR Verification',
      'This will redirect you to the QR verification process',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            setQrVerified(true);
            Alert.alert('Success', 'QR verification completed');
          },
        },
      ]
    );
  };

  const handleSkipForNow = () => {
    console.log('[DriverVerification] Skipping verification for now');
    
    const verification: DriverVerification = {
      qrVerified: false,
      backgroundCheckPassed: false,
      verified: false,
    };
    
    setDriverVerification(verification);
    completeQuickStart();
    router.push('/inboarding/logistics-terms');
  };

  const handleComplete = () => {
    if (!goodConductUri || !qrVerified) {
      Alert.alert('Incomplete Verification', 'Please complete all verification steps');
      return;
    }

    console.log('[DriverVerification] Completing full verification');
    
    const verification: DriverVerification = {
      goodConductUri,
      qrVerified,
      backgroundCheckPassed: true,
      verified: true,
    };
    
    setDriverVerification(verification);
    completeQuickStart();
    router.push('/inboarding/logistics-terms');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Driver Verification', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
        <Text style={styles.progressText}>80% Complete</Text>

        <Text style={styles.title}>Full Verification</Text>
        <Text style={styles.subtitle}>
          Complete these steps to unlock premium orders and higher-value routes
        </Text>

        <View style={styles.verificationsContainer}>
          <View style={styles.verificationItem}>
            <View style={styles.verificationHeader}>
              <FileText size={24} color="#34C759" />
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationTitle}>Certificate of Good Conduct</Text>
                <Text style={styles.verificationSubtitle}>Required for verification</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, goodConductUri && styles.uploadButtonSuccess]}
              onPress={pickDocument}
            >
              {goodConductUri ? (
                <>
                  <CheckCircle size={20} color="#34C759" />
                  <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
                </>
              ) : (
                <>
                  <Upload size={20} color="#34C759" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.verificationItem}>
            <View style={styles.verificationHeader}>
              <QrCode size={24} color="#34C759" />
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationTitle}>QR Verification</Text>
                <Text style={styles.verificationSubtitle}>Background check & identity verification</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, qrVerified && styles.uploadButtonSuccess]}
              onPress={handleQRVerification}
            >
              {qrVerified ? (
                <>
                  <CheckCircle size={20} color="#34C759" />
                  <Text style={styles.uploadButtonTextSuccess}>Verified</Text>
                </>
              ) : (
                <>
                  <QrCode size={20} color="#34C759" />
                  <Text style={styles.uploadButtonText}>Verify Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✅ Unlocks:</Text>
          <Text style={styles.infoItem}>• Premium delivery orders</Text>
          <Text style={styles.infoItem}>• Higher-value routes</Text>
          <Text style={styles.infoItem}>• Priority job assignments</Text>
          <Text style={styles.infoItem}>• Trusted Driver ⭐ badge</Text>
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
    backgroundColor: '#34C759',
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
  verificationsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  verificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  verificationHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    gap: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  verificationSubtitle: {
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
    borderColor: '#34C759',
  },
  uploadButtonSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#34C759',
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
    backgroundColor: '#34C759',
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
    color: '#34C759',
  },
  note: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center' as const,
  },
});
