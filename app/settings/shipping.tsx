import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Home, Building, Edit3, Trash2, Plus, MapPin, Navigation, X } from 'lucide-react-native';
import { useAddresses, type UnifiedAddress } from '@/providers/address-provider';
import { useLocation } from '@/providers/location-provider';
import { GeoCoordinates } from '@/constants/products';
import HierarchicalLocationSelector from '@/components/HierarchicalLocationSelector';



function AddressCard({ address, onEdit, onDelete, onSetDefault }: { 
  address: UnifiedAddress; 
  onEdit: () => void; 
  onDelete: () => void; 
  onSetDefault: () => void; 
}) {
  const IconComp = address.name.toLowerCase().includes('work') ? Building : Home;
  
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressIconContainer}>
          <IconComp size={20} color="#16A34A" />
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.addressTitleRow}>
            <Text style={styles.addressTitle}>{address.name}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText}>{address.address}</Text>
          <Text style={styles.addressText}>{address.city}</Text>
          <Text style={styles.addressText}>{address.country}</Text>
        </View>
      </View>
      
      <View style={styles.addressActions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Edit3 size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      {!address.isDefault && (
        <TouchableOpacity onPress={onSetDefault} style={styles.setDefaultButton}>
          <Text style={styles.setDefaultText}>Set as default</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function AddAddressForm({ onSave, onCancel }: { onSave: (address: Omit<UnifiedAddress, 'id' | 'createdAt' | 'updatedAt'>) => void; onCancel: () => void }) {
  const { getCurrentLocation, isLoadingLocation, setManualLocation } = useLocation();
  const [label, setLabel] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('Kenya');
  const [county, setCounty] = useState<string>('');
  const [countyId, setCountyId] = useState<string>('');
  const [subCounty, setSubCounty] = useState<string>('');
  const [subCountyId, setSubCountyId] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [wardId, setWardId] = useState<string>('');
  const [coordinates, setCoordinates] = useState<GeoCoordinates | undefined>(undefined);
  const [setAsDefault, setSetAsDefault] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);
  
  const handleGetCurrentLocation = useCallback(async () => {
    setGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setCoordinates(location.coordinates);
        if (location.city) setCity(location.city);
        if (location.address) setAddress(location.address);
        Alert.alert('✅ Success', 'Current location captured successfully');
      } else {
        Alert.alert('❌ Error', 'Failed to get current location. Please check location permissions.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to get current location');
    } finally {
      setGettingLocation(false);
    }
  }, [getCurrentLocation]);

  const handleSave = useCallback(async () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter an address label');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }
    if (!county || !countyId || !subCounty || !ward) {
      Alert.alert('Error', 'Please select complete location (County, Sub-County, Ward)');
      return;
    }
    if (!coordinates) {
      Alert.alert('Error', 'Please capture GPS location');
      return;
    }
    if (!label.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const newAddress: Omit<UnifiedAddress, 'id' | 'createdAt' | 'updatedAt'> = {
      name: label,
      address,
      city: city || county,
      phone: '+254700000000',
      country,
      county,
      countyId,
      subCounty,
      subCountyId,
      ward,
      wardId,
      coordinates,
      isDefault: setAsDefault,
    };
    
    if (coordinates) {
      await setManualLocation({
        coordinates,
        label,
        address,
        city: city || county,
        county,
        countyId,
        subCounty,
        subCountyId,
        ward,
        wardId,
        timestamp: Date.now(),
      });
    }
    
    onSave(newAddress);
  }, [label, address, city, country, county, countyId, subCounty, subCountyId, ward, wardId, coordinates, setAsDefault, onSave, setManualLocation]);
  
  return (
    <View style={styles.addAddressForm}>
      <Text style={styles.formTitle}>Add New Address</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Label</Text>
        <TextInput
          style={styles.textInput}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g., Home, Work, Farm Gate"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.textInput}
          value={address}
          onChangeText={setAddress}
          placeholder="e.g., 123 Green Valley, Off Kiambu Rd"
          placeholderTextColor="#9CA3AF"
          multiline
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Location (County, SubCounty, Ward)</Text>
        <TouchableOpacity
          style={styles.locationSelectorButton}
          onPress={() => setShowLocationSelector(true)}
        >
          <MapPin size={16} color="#16A34A" />
          <Text style={[styles.locationSelectorText, (county || city) && styles.locationSelectorTextSelected]}>
            {county ? `${county}${subCounty ? ` → ${subCounty}` : ''}${ward ? ` → ${ward}` : ''}` : 'Select Location'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>City / Town (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={city}
          onChangeText={setCity}
          placeholder="e.g., Nairobi CBD"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Country</Text>
        <View style={styles.countrySelector}>
          <Text style={styles.countryText}>{country}</Text>
          <TouchableOpacity style={styles.countryDropdown}>
            <Text style={styles.countryDropdownText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>GPS Location</Text>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleGetCurrentLocation}
          disabled={gettingLocation || isLoadingLocation}
        >
          {gettingLocation || isLoadingLocation ? (
            <ActivityIndicator size="small" color="#16A34A" />
          ) : (
            <Navigation size={20} color="#16A34A" />
          )}
          <Text style={styles.locationButtonText}>
            {coordinates ? '✓ Location Captured' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
        {coordinates && (
          <Text style={styles.coordinatesText}>
            📍 {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.checkboxRow} 
        onPress={() => setSetAsDefault(!setAsDefault)}
      >
        <View style={[styles.checkbox, setAsDefault && styles.checkboxChecked]}>
          {setAsDefault && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Set as default address</Text>
      </TouchableOpacity>
      
      <View style={styles.formActions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={showLocationSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationSelector(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <HierarchicalLocationSelector
              embedded
              onSelect={(selection) => {
                setCounty(selection.county.name);
                setCountyId(selection.county.id);
                setSubCounty(selection.subCounty.name);
                setSubCountyId(selection.subCounty.id);
                setWard(selection.ward.name);
                setWardId(selection.ward.id);
                if (selection.county.coordinates) {
                  setCoordinates({
                    lat: selection.county.coordinates.latitude,
                    lng: selection.county.coordinates.longitude,
                  });
                }
                if (!city && selection.county.name) {
                  setCity(selection.county.name);
                }
                setShowLocationSelector(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function ShippingAddressesScreen() {
  const router = useRouter();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, error } = useAddresses();
  
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  const handleAddAddress = useCallback(async (newAddress: Omit<UnifiedAddress, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await addAddress(newAddress);
    if (result) {
      setShowAddForm(false);
      Alert.alert('Success', 'Address added successfully');
    } else {
      Alert.alert('Error', error || 'Failed to add address');
    }
  }, [addAddress, error]);
  
  const handleEditAddress = useCallback((addressId: string) => {
    Alert.alert('Edit Address', 'Please delete and create a new address to update.');
  }, []);
  
  const handleDeleteAddress = useCallback((addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            const success = await deleteAddress(addressId);
            if (success) {
              Alert.alert('Success', 'Address deleted successfully');
            } else {
              Alert.alert('Error', error || 'Failed to delete address');
            }
          }
        },
      ]
    );
  }, [deleteAddress, error]);
  
  const handleSetDefault = useCallback(async (addressId: string) => {
    const success = await setDefaultAddress(addressId);
    if (success) {
      Alert.alert('Success', 'Default address updated');
    } else {
      Alert.alert('Error', error || 'Failed to update default address');
    }
  }, [setDefaultAddress, error]);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Shipping Addresses',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Shipping Addresses</Text>
        <Text style={styles.subheader}>Manage your saved addresses for marketplace deliveries.</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Addresses</Text>
          <Text style={styles.sectionSubtitle}>The default address will be selected automatically at checkout.</Text>
          
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleEditAddress(address.id)}
              onDelete={() => handleDeleteAddress(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </View>
        
        {showAddForm ? (
          <AddAddressForm
            onSave={handleAddAddress}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <TouchableOpacity 
            style={styles.addAddressButton} 
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={20} color="#16A34A" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.mapButton}>
          <MapPin size={20} color="#16A34A" />
          <Text style={styles.mapButtonText}>Choose on Map</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  setDefaultText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#16A34A',
    borderStyle: 'dashed',
  },
  addAddressText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapButtonText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#16A34A',
    gap: 8,
  },
  locationButtonText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  addAddressForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  countryText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  countryDropdown: {
    padding: 4,
  },
  countryDropdownText: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  locationSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
  },
  locationSelectorTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});