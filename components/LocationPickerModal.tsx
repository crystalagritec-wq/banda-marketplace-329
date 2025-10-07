import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { MapPin, X, Navigation, Search } from 'lucide-react-native';
import { useLocation, UserLocation } from '@/providers/location-provider';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected?: (location: UserLocation) => void;
}

export function LocationPickerModal({
  visible,
  onClose,
  onLocationSelected,
}: LocationPickerModalProps) {
  const {
    getCurrentLocation,
    setManualLocation,
    isLoadingLocation,
  } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{
    display_name: string;
    lat: string;
    lon: string;
  }[]>([]);

  const handleUseCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      onLocationSelected?.(location);
      onClose();
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ke&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('[LocationPicker] Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const location: UserLocation = {
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      label: result.display_name.split(',')[0],
      address: result.display_name,
      timestamp: Date.now(),
    };
    
    await setManualLocation(location);
    onLocationSelected?.(location);
    setSearchResults([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleUseCurrentLocation}
              disabled={isLoadingLocation}
            >
              <View style={styles.optionIcon}>
                <Navigation size={20} color="#10B981" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Use Current Location</Text>
                <Text style={styles.optionSubtitle}>
                  {Platform.OS === 'web' 
                    ? 'Get your location from browser'
                    : 'Get your GPS location'}
                </Text>
              </View>
              {isLoadingLocation && <ActivityIndicator size="small" color="#10B981" />}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>Search Address</Text>
              <View style={styles.searchContainer}>
                <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter city, town, or address..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchAddress}
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchAddress}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.searchButtonText}>Search</Text>
                  )}
                </TouchableOpacity>
              </View>

              {searchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                  {searchResults.map((result, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.resultItem}
                      onPress={() => handleSelectSearchResult(result)}
                    >
                      <MapPin size={16} color="#10B981" />
                      <Text style={styles.resultText} numberOfLines={2}>
                        {result.display_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📍 Your location helps us show nearby sellers and calculate accurate delivery fees
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600' as const,
  },
  searchSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  resultsContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
