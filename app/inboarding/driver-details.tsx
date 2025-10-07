import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLogisticsInboarding, DriverDetails } from '@/providers/logistics-inboarding-provider';

export default function DriverDetailsScreen() {
  const router = useRouter();
  const { setDriverDetails } = useLogisticsInboarding();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selfieUri, setSelfieUri] = useState('');
  const [nationalIdUri, setNationalIdUri] = useState('');
  const [driverLicenseUri, setDriverLicenseUri] = useState('');
  const [licenseClass, setLicenseClass] = useState('');
  const [allowDiscovery, setAllowDiscovery] = useState(true);

  const pickImage = async (type: 'selfie' | 'nationalId' | 'license') => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image picker is not available on web');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permissions are required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'selfie' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (type === 'selfie') setSelfieUri(uri);
      else if (type === 'nationalId') setNationalIdUri(uri);
      else if (type === 'license') setDriverLicenseUri(uri);
    }
  };

  const handleContinue = () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!selfieUri || !nationalIdUri || !driverLicenseUri) {
      Alert.alert('Missing Documents', 'Please upload all required documents');
      return;
    }

    if (!licenseClass.trim()) {
      Alert.alert('Missing Information', 'Please enter your license class');
      return;
    }

    const details: DriverDetails = {
      fullName,
      phone,
      selfieUri,
      nationalIdUri,
      driverLicenseUri,
      licenseClass,
      allowDiscovery,
      availability: 'active',
    };

    console.log('[DriverDetails] Saving details:', details);
    setDriverDetails(details);
    router.push('/inboarding/driver-verification');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Driver Details', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
        <Text style={styles.progressText}>60% Complete</Text>

        <Text style={styles.sectionTitle}>Identity & Verification</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 700 000 000"
            placeholderTextColor="#C7C7CC"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Selfie Photo *</Text>
          <TouchableOpacity
            style={[styles.uploadButton, selfieUri && styles.uploadButtonSuccess]}
            onPress={() => pickImage('selfie')}
          >
            {selfieUri ? (
              <>
                <CheckCircle size={20} color="#34C759" />
                <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
              </>
            ) : (
              <>
                <Camera size={20} color="#007AFF" />
                <Text style={styles.uploadButtonText}>Take Selfie</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>National ID *</Text>
          <TouchableOpacity
            style={[styles.uploadButton, nationalIdUri && styles.uploadButtonSuccess]}
            onPress={() => pickImage('nationalId')}
          >
            {nationalIdUri ? (
              <>
                <CheckCircle size={20} color="#34C759" />
                <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#007AFF" />
                <Text style={styles.uploadButtonText}>Upload ID</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driver License *</Text>
          <TouchableOpacity
            style={[styles.uploadButton, driverLicenseUri && styles.uploadButtonSuccess]}
            onPress={() => pickImage('license')}
          >
            {driverLicenseUri ? (
              <>
                <CheckCircle size={20} color="#34C759" />
                <Text style={styles.uploadButtonTextSuccess}>Uploaded</Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#007AFF" />
                <Text style={styles.uploadButtonText}>Upload License</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Class *</Text>
          <TextInput
            style={styles.input}
            value={licenseClass}
            onChangeText={setLicenseClass}
            placeholder="e.g., BCE, A, B"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Allow Discovery</Text>
              <Text style={styles.switchSubtitle}>
                Let vehicle owners discover and invite you
              </Text>
            </View>
            <Switch
              value={allowDiscovery}
              onValueChange={setAllowDiscovery}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🔔 40% remaining – upload Good Conduct certificate and complete QR verification to unlock premium jobs
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  uploadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
  switchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  banner: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
