import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, X, CheckCircle2, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddresses, type UnifiedAddress } from '@/providers/address-provider';
import HierarchicalLocationSelector from '@/components/HierarchicalLocationSelector';
import { useLocation } from '@/providers/location-provider';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<UnifiedAddress | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    city: string;
    phone: string;
    county?: string;
    countyId?: string;
    subCounty?: string;
    subCountyId?: string;
    ward?: string;
    wardId?: string;
    coordinates?: { lat: number; lng: number };
  }>({
    name: '',
    address: '',
    city: '',
    phone: '',
  });
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);
  const { setManualLocation } = useLocation();
  const [isCapturingGPS, setIsCapturingGPS] = useState<boolean>(false);

  const handleOpenAddModal = useCallback(() => {
    setEditingAddress(null);
    setFormData({ name: '', address: '', city: '', phone: '', county: '', subCounty: '', ward: '' });
    setShowAddModal(true);
  }, []);

  const handleOpenEditModal = useCallback((address: UnifiedAddress) => {
    setEditingAddress(address);
    const extendedAddress = address as any;
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      phone: address.phone,
      county: extendedAddress.county,
      countyId: extendedAddress.countyId,
      subCounty: extendedAddress.subCounty,
      subCountyId: extendedAddress.subCountyId,
      ward: extendedAddress.ward,
      wardId: extendedAddress.wardId,
      coordinates: extendedAddress.coordinates,
    });
    setShowAddModal(true);
  }, []);

  const handleSaveAddress = useCallback(async () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!formData.county || !formData.subCounty || !formData.ward) {
      Alert.alert('Location Required', 'Please select your location (County, Sub-County, Ward)');
      return;
    }

    if (!formData.coordinates || !formData.coordinates.lat || !formData.coordinates.lng) {
      Alert.alert(
        '📍 GPS Location Required',
        'Please capture your device GPS coordinates for accurate delivery. This ensures drivers can find your exact location.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Capture GPS', onPress: handleCaptureGPS }
        ]
      );
      return;
    }

    const addressData = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city || formData.ward || '',
      phone: formData.phone.trim(),
      country: 'Kenya',
      county: formData.county!,
      countyId: formData.countyId!,
      subCounty: formData.subCounty!,
      subCountyId: formData.subCountyId!,
      ward: formData.ward!,
      wardId: formData.wardId!,
      coordinates: formData.coordinates,
      isDefault: addresses.length === 0,
    };

    if (editingAddress) {
      const success = await updateAddress(editingAddress.id, addressData);
      if (success) {
        Alert.alert('Success', 'Address updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update address');
        return;
      }
    } else {
      const newAddress = await addAddress(addressData);
      if (newAddress) {
        Alert.alert('Success', 'Address added successfully');
      } else {
        Alert.alert('Error', 'Failed to add address');
        return;
      }
      
      if (formData.coordinates) {
        setManualLocation({
          coordinates: formData.coordinates,
          label: formData.name.trim(),
          address: formData.address.trim(),
          city: formData.city || formData.ward || '',
          county: formData.county,
          countyId: formData.countyId,
          subCounty: formData.subCounty,
          subCountyId: formData.subCountyId,
          ward: formData.ward,
          wardId: formData.wardId,
          timestamp: Date.now(),
        });
      }
    }

    setShowAddModal(false);
    setFormData({ name: '', address: '', city: '', phone: '', county: '', subCounty: '', ward: '' });
    setEditingAddress(null);
  }, [formData, editingAddress, addAddress, updateAddress, addresses.length, setManualLocation]);

  const handleDeleteAddress = useCallback((addressId: string, addressName: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${addressName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(addressId);
            Alert.alert('Deleted', 'Address removed successfully');
          },
        },
      ]
    );
  }, [deleteAddress]);

  const handleSetDefault = useCallback((addressId: string) => {
    setDefaultAddress(addressId);
  }, [setDefaultAddress]);

  const handleCaptureGPS = useCallback(async () => {
    setIsCapturingGPS(true);
    try {
      console.log('[Address] Requesting GPS location...');
      
      if (Platform.OS === 'web') {
        if (!('geolocation' in navigator)) {
          Alert.alert('GPS Not Available', 'Geolocation is not supported on this device');
          setIsCapturingGPS(false);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            console.log('[Address] GPS captured (Web):', coords);
            setFormData(prev => ({ ...prev, coordinates: coords }));
            Alert.alert('✅ GPS Captured', `Location: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
            setIsCapturingGPS(false);
          },
          (error) => {
            console.error('[Address] GPS error (Web):', error);
            Alert.alert('GPS Error', error.message || 'Failed to get location');
            setIsCapturingGPS(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to capture GPS coordinates');
          setIsCapturingGPS(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        
        console.log('[Address] GPS captured (Native):', coords);
        setFormData(prev => ({ ...prev, coordinates: coords }));
        Alert.alert('✅ GPS Captured', `Location: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}\nAccuracy: ±${Math.round(location.coords.accuracy || 0)}m`);
        setIsCapturingGPS(false);
      }
    } catch (error: any) {
      console.error('[Address] GPS capture error:', error);
      Alert.alert('GPS Error', error?.message || 'Failed to capture GPS location');
      setIsCapturingGPS(false);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Addresses</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenAddModal}
          >
            <Plus size={24} color="#2D5016" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Addresses Yet</Text>
              <Text style={styles.emptyDescription}>
                Add your delivery addresses to make checkout faster
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleOpenAddModal}
              >
                <Plus size={20} color="#FFF" />
                <Text style={styles.emptyButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((address) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTitleRow}>
                      <MapPin size={18} color="#2D5016" />
                      <Text style={styles.addressName}>{address.name}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.addressBody}>
                    <Text style={styles.addressText}>{address.address}</Text>
                    <Text style={styles.addressCity}>{address.city}</Text>
                    <Text style={styles.addressPhone}>{address.phone}</Text>
                  </View>

                  <View style={styles.addressActions}>
                    {!address.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(address.id)}
                      >
                        <CheckCircle2 size={16} color="#10B981" />
                        <Text style={styles.actionButtonText}>Set Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleOpenEditModal(address)}
                    >
                      <Edit2 size={16} color="#3B82F6" />
                      <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteAddress(address.id, address.name)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                      <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Address Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., Home, Office, Farm"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Street Address *</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    placeholder="Enter your street address"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location (County, Sub-County, Ward) *</Text>
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => setShowLocationSelector(true)}
                  >
                    <MapPin size={18} color="#6B7280" />
                    <Text style={[
                      styles.locationButtonText,
                      !formData.county && styles.locationButtonPlaceholder
                    ]}>
                      {formData.county && formData.subCounty && formData.ward
                        ? `${formData.ward}, ${formData.subCounty}, ${formData.county}`
                        : 'Select your location'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Specific Area/Landmark (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., Near Nakumatt, Opposite Police Station"
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>GPS Coordinates *</Text>
                  <View style={styles.gpsContainer}>
                    {formData.coordinates ? (
                      <View style={styles.gpsDisplay}>
                        <MapPin size={16} color="#10B981" />
                        <View style={styles.gpsCoords}>
                          <Text style={styles.gpsText}>Lat: {formData.coordinates.lat.toFixed(6)}</Text>
                          <Text style={styles.gpsText}>Lng: {formData.coordinates.lng.toFixed(6)}</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.gpsPlaceholder}>No GPS coordinates captured</Text>
                    )}
                    <TouchableOpacity
                      style={[styles.gpsButton, isCapturingGPS && styles.gpsButtonDisabled]}
                      onPress={handleCaptureGPS}
                      disabled={isCapturingGPS}
                    >
                      <MapPin size={16} color="white" />
                      <Text style={styles.gpsButtonText}>
                        {isCapturingGPS ? 'Capturing...' : formData.coordinates ? 'Recapture' : 'Capture GPS'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.gpsHint}>📍 Tap to capture your exact device location for accurate delivery</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="+254 700 000 000"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveAddress}
                >
                  <Text style={styles.saveButtonText}>
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <HierarchicalLocationSelector
          visible={showLocationSelector}
          onClose={() => setShowLocationSelector(false)}
          onSelect={(location) => {
            console.log('[Address] Location selected:', location);
            setFormData({
              ...formData,
              county: location.county.name,
              countyId: location.county.id,
              subCounty: location.subCounty.name,
              subCountyId: location.subCounty.id,
              ward: location.ward.name,
              wardId: location.ward.id,
              coordinates: location.county.coordinates ? {
                lat: location.county.coordinates.latitude,
                lng: location.county.coordinates.longitude,
              } : undefined,
            });
            setShowLocationSelector(false);
          }}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2D5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addressList: {
    paddingVertical: 16,
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addressHeader: {
    marginBottom: 12,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  addressBody: {
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  addressCity: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2D5016',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  locationButtonPlaceholder: {
    color: '#9CA3AF',
  },
  gpsContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  gpsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  gpsCoords: {
    flex: 1,
  },
  gpsText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  gpsPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  gpsButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  gpsButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  gpsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  gpsHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
});