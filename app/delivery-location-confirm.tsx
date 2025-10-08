import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DeliveryLocationConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation] = useState({
    name: 'National Gallery Of Modern Art',
    address: 'Jaipur House, India Gate, Shershah Road, Delhi High Court, India Gate, New Delhi',
  });

  const handleConfirmLocation = () => {
    console.log('Location confirmed:', selectedLocation);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm map pin location</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for area, street name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapOverlay}>
            <View style={styles.tooltipContainer}>
              <Text style={styles.tooltipText}>Your order will be delivered here</Text>
              <Text style={styles.tooltipSubtext}>Move pin to your exact location</Text>
            </View>
            <View style={styles.pinContainer}>
              <View style={styles.pinCircle} />
              <View style={styles.pinStick} />
            </View>
            <View style={styles.locationBadge}>
              <Text style={styles.locationBadgeText}>{selectedLocation.name}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.sectionTitle}>Delivering your order to</Text>
        
        <View style={styles.addressCard}>
          <View style={styles.addressIconContainer}>
            <View style={styles.addressPin}>
              <View style={styles.addressPinInner} />
            </View>
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressName}>{selectedLocation.name}</Text>
            <Text style={styles.addressText}>{selectedLocation.address}</Text>
          </View>
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>Confirm location</Text>
          <Text style={styles.confirmButtonArrow}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#e8f4f8',
  },
  mapPlaceholder: {
    flex: 1,
    position: 'relative',
  },
  mapOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    maxWidth: width - 80,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  tooltipSubtext: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinStick: {
    width: 4,
    height: 20,
    backgroundColor: '#2196F3',
    marginTop: -2,
  },
  locationBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginTop: 20,
  },
  locationBadgeText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addressIconContainer: {
    marginRight: 12,
  },
  addressPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  addressContent: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeButtonText: {
    color: '#2e7d32',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600' as const,
    marginRight: 8,
  },
  confirmButtonArrow: {
    color: '#fff',
    fontSize: 14,
  },
});
