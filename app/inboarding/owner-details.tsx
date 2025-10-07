import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLogisticsInboarding, VehicleDetails, OwnerDetails, OwnershipType } from '@/providers/logistics-inboarding-provider';

export default function OwnerDetailsScreen() {
  const router = useRouter();
  const { setOwnerDetails } = useLogisticsInboarding();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [areaOfOperation, setAreaOfOperation] = useState('');
  
  const [vehicleType, setVehicleType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [color, setColor] = useState('');
  const [capacity, setCapacity] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('owned');
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
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
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (!fullName.trim() || !phone.trim() || !kraPin.trim() || !areaOfOperation.trim()) {
      Alert.alert('Missing Information', 'Please fill in all owner details');
      return;
    }

    if (!vehicleType.trim() || !registrationNumber.trim() || !color.trim() || !capacity.trim()) {
      Alert.alert('Missing Information', 'Please fill in all vehicle details');
      return;
    }

    const vehicle: VehicleDetails = {
      type: vehicleType,
      registrationNumber,
      color,
      capacity,
      photos,
      ownershipType,
    };

    const details: OwnerDetails = {
      fullName,
      phone,
      kraPin,
      areaOfOperation,
      vehicles: [vehicle],
    };

    console.log('[OwnerDetails] Saving details:', details);
    setOwnerDetails(details);
    router.push('/inboarding/owner-verification');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Vehicle Owner Details', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
        <Text style={styles.progressText}>60% Complete</Text>

        <Text style={styles.sectionTitle}>Owner Information</Text>
        
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
          <Text style={styles.label}>KRA PIN *</Text>
          <TextInput
            style={styles.input}
            value={kraPin}
            onChangeText={setKraPin}
            placeholder="A000000000A"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area of Operation *</Text>
          <TextInput
            style={styles.input}
            value={areaOfOperation}
            onChangeText={setAreaOfOperation}
            placeholder="e.g., Nairobi, Mombasa"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        <Text style={styles.sectionTitle}>Vehicle Registration</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Type *</Text>
          <TextInput
            style={styles.input}
            value={vehicleType}
            onChangeText={setVehicleType}
            placeholder="e.g., Pickup, Van, Truck"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registration Number *</Text>
          <TextInput
            style={styles.input}
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            placeholder="KXX 000X"
            placeholderTextColor="#C7C7CC"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color *</Text>
          <TextInput
            style={styles.input}
            value={color}
            onChangeText={setColor}
            placeholder="e.g., White, Blue"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capacity *</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="e.g., 1 ton, 500kg"
            placeholderTextColor="#C7C7CC"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ownership Type *</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, ownershipType === 'owned' && styles.toggleButtonActive]}
              onPress={() => setOwnershipType('owned')}
            >
              <Text style={[styles.toggleText, ownershipType === 'owned' && styles.toggleTextActive]}>
                Fully Owned ✅
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, ownershipType === 'financed' && styles.toggleButtonActive]}
              onPress={() => setOwnershipType('financed')}
            >
              <Text style={[styles.toggleText, ownershipType === 'financed' && styles.toggleTextActive]}>
                Financed 🟡
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Photos (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Camera size={24} color="#007AFF" />
            <Text style={styles.uploadText}>Add Photo</Text>
          </TouchableOpacity>
          
          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Text style={styles.photoText}>Photo {index + 1}</Text>
                  <TouchableOpacity onPress={() => removePhoto(index)}>
                    <X size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🔔 40% remaining – complete documents to unlock full delivery jobs and pooling
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
    backgroundColor: '#007AFF',
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
    marginTop: 8,
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
  toggleContainer: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center' as const,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  toggleTextActive: {
    color: '#FFFFFF',
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
    borderStyle: 'dashed' as const,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  photosContainer: {
    marginTop: 12,
    gap: 8,
  },
  photoItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  photoText: {
    fontSize: 14,
    color: '#1C1C1E',
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
    backgroundColor: '#007AFF',
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
