import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Truck, Plus, X, Camera, MapPin } from 'lucide-react-native';
import { useLocation } from '@/providers/location-provider';

export default function LogisticsOwnerScreen() {
  const insets = useSafeAreaInsets();
  const { updateLogisticsData, setCurrentStep } = useOnboarding();
  
  const { userLocation } = useLocation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [vehicles, setVehicles] = useState<{
    type: string;
    regNumber: string;
    color: string;
    capacity: string;
    ownershipType: 'owned' | 'financed';
    photos: string[];
  }[]>([
    { type: '', regNumber: '', color: '', capacity: '', ownershipType: 'owned', photos: [] }
  ]);
  const [baseLocation, setBaseLocation] = useState(userLocation?.city || '');

  const progress = useMemo(() => {
    let filled = 0;
    const totalFields = 5;
    
    if (fullName.trim()) filled++;
    if (phone.trim()) filled++;
    if (kraPin.trim()) filled++;
    if (vehicles.some(v => v.type && v.regNumber && v.color && v.capacity)) filled++;
    if (baseLocation.trim()) filled++;
    
    return Math.round((filled / totalFields) * 60);
  }, [fullName, phone, kraPin, vehicles, baseLocation]);

  const addVehicle = () => {
    setVehicles([...vehicles, { type: '', regNumber: '', color: '', capacity: '', ownershipType: 'owned', photos: [] }]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index));
    }
  };

  const updateVehicle = (index: number, field: keyof typeof vehicles[0], value: any) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setVehicles(updated);
  };

  const addVehiclePhoto = (index: number) => {
    Alert.alert('Photo Upload', 'Photo upload will be available in full verification phase');
  };

  const handleNext = () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }
    if (!kraPin.trim()) {
      Alert.alert('Required', 'Please enter your KRA PIN');
      return;
    }
    if (!vehicles.some(v => v.type && v.regNumber && v.color && v.capacity)) {
      Alert.alert('Required', 'Please complete at least one vehicle details');
      return;
    }
    if (!baseLocation.trim()) {
      Alert.alert('Required', 'Please specify your base location');
      return;
    }

    updateLogisticsData({
      ownerDetails: {
        fullName,
        phone,
        kraPin,
        vehicles: vehicles.filter(v => v.type && v.regNumber),
        baseLocation,
      },
    });
    
    setCurrentStep('logistics_delivery');
    router.push('/onboarding/logistics/delivery' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Truck size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Vehicle Owner Details</Text>
          <Text style={styles.subtitle}>Set up your fleet information</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Quick Start • {progress}% Complete</Text>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>🎯 {60 - progress}% remaining to activate your logistics hub</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0712345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>KRA PIN *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., A001234567Z"
              value={kraPin}
              onChangeText={setKraPin}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fleet Registration *</Text>
            {vehicles.map((vehicle, index) => (
              <View key={index} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <Text style={styles.vehicleTitle}>Vehicle {index + 1}</Text>
                  {vehicles.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeVehicle(index)}
                    >
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.vehicleInputs}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type (e.g., Pickup, Van, Truck)"
                    value={vehicle.type}
                    onChangeText={(value) => updateVehicle(index, 'type', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Registration Number (e.g., KAA 123A)"
                    value={vehicle.regNumber}
                    onChangeText={(value) => updateVehicle(index, 'regNumber', value)}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Color"
                      value={vehicle.color}
                      onChangeText={(value) => updateVehicle(index, 'color', value)}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Capacity (kg)"
                      value={vehicle.capacity}
                      onChangeText={(value) => updateVehicle(index, 'capacity', value)}
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  
                  <View style={styles.ownershipToggle}>
                    <Text style={styles.ownershipLabel}>Ownership:</Text>
                    <View style={styles.toggleButtons}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          vehicle.ownershipType === 'owned' && styles.toggleButtonActive
                        ]}
                        onPress={() => updateVehicle(index, 'ownershipType', 'owned')}
                      >
                        <Text style={[
                          styles.toggleButtonText,
                          vehicle.ownershipType === 'owned' && styles.toggleButtonTextActive
                        ]}>Fully Owned ✅</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          vehicle.ownershipType === 'financed' && styles.toggleButtonActive
                        ]}
                        onPress={() => updateVehicle(index, 'ownershipType', 'financed')}
                      >
                        <Text style={[
                          styles.toggleButtonText,
                          vehicle.ownershipType === 'financed' && styles.toggleButtonTextActive
                        ]}>Financed 🟡</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={() => addVehiclePhoto(index)}
                  >
                    <Camera size={16} color="#3B82F6" />
                    <Text style={styles.photoButtonText}>Add Photos (Optional)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addVehicle}>
              <Plus size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Another Vehicle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Base Location *</Text>
            <View style={styles.locationInput}>
              <MapPin size={16} color="#6B7280" />
              <TextInput
                style={styles.locationTextInput}
                placeholder="e.g., Nairobi, Westlands"
                value={baseLocation}
                onChangeText={setBaseLocation}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text style={styles.helperText}>Your primary operating area</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 What&apos;s Next?</Text>
            <Text style={styles.infoText}>
              After quick start, you&apos;ll complete full verification:
              {'\n'}• Upload logbook/lease agreement
              {'\n'}• Insurance certificate
              {'\n'}• NTSA inspection
              {'\n'}• Vehicle photos
            </Text>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Financed vehicles can participate with restrictions until fully verified
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
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
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  vehicleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  vehicleInputs: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  ownershipToggle: {
    gap: 8,
  },
  ownershipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: 'white',
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  bannerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  hint: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
