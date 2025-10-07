import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, ChevronRight, MapPin, Search } from 'lucide-react-native';
import {
  County,
  SubCounty,
  Ward,
  getAllCounties,
  getSubCountiesByCounty,
  getWardsBySubCounty,
  searchLocations,
  formatLocationString,
} from '@/constants/kenya-locations-complete';

interface HierarchicalLocationSelectorProps {
  visible?: boolean;
  onClose?: () => void;
  onSelect?: (location: {
    county: County;
    subCounty: SubCounty;
    ward: Ward;
    formatted: string;
  }) => void;
  onLocationSelect?: (location: {
    county: string;
    countyId: string;
    subCounty?: string;
    subCountyId?: string;
    ward?: string;
    wardId?: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  initialCounty?: string;
  initialSubCounty?: string;
  initialWard?: string;
  embedded?: boolean;
}

type SelectionStep = 'county' | 'subcounty' | 'ward';

export default function HierarchicalLocationSelector({
  visible = true,
  onClose,
  onSelect,
  onLocationSelect,
  initialCounty,
  initialSubCounty,
  initialWard,
  embedded = false,
}: HierarchicalLocationSelectorProps) {
  const [step, setStep] = useState<SelectionStep>('county');
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedSubCounty, setSelectedSubCounty] = useState<SubCounty | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const counties = useMemo(() => getAllCounties(), []);

  const subCounties = useMemo(() => {
    if (!selectedCounty) return [];
    return getSubCountiesByCounty(selectedCounty.id);
  }, [selectedCounty]);

  const wards = useMemo(() => {
    if (!selectedCounty || !selectedSubCounty) return [];
    return getWardsBySubCounty(selectedCounty.id, selectedSubCounty.id);
  }, [selectedCounty, selectedSubCounty]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchLocations(searchQuery);
  }, [searchQuery]);

  const handleCountySelect = (county: County) => {
    setSelectedCounty(county);
    setSelectedSubCounty(null);
    setSearchQuery('');
    setStep('subcounty');
  };

  const handleSubCountySelect = (subCounty: SubCounty) => {
    setSelectedSubCounty(subCounty);
    setSearchQuery('');
    setStep('ward');
  };

  const handleWardSelect = (ward: Ward) => {
    if (selectedCounty && selectedSubCounty) {
      const formatted = formatLocationString(
        selectedCounty.name,
        selectedSubCounty.name,
        ward.name
      );
      
      if (onSelect) {
        onSelect({
          county: selectedCounty,
          subCounty: selectedSubCounty,
          ward,
          formatted,
        });
      }
      
      if (onLocationSelect) {
        onLocationSelect({
          county: selectedCounty.name,
          countyId: selectedCounty.id,
          subCounty: selectedSubCounty.name,
          subCountyId: selectedSubCounty.id,
          ward: ward.name,
          wardId: ward.id,
          coordinates: selectedCounty.coordinates ? {
            lat: selectedCounty.coordinates.latitude,
            lng: selectedCounty.coordinates.longitude,
          } : undefined,
        });
      }
      
      if (!embedded) {
        handleClose();
      }
    }
  };

  const handleSearchResultSelect = (result: {
    county: County;
    subCounty?: SubCounty;
    ward?: Ward;
  }) => {
    if (result.ward && result.subCounty) {
      const formatted = formatLocationString(
        result.county.name,
        result.subCounty.name,
        result.ward.name
      );
      
      if (onSelect) {
        onSelect({
          county: result.county,
          subCounty: result.subCounty,
          ward: result.ward,
          formatted,
        });
      }
      
      if (onLocationSelect) {
        onLocationSelect({
          county: result.county.name,
          countyId: result.county.id,
          subCounty: result.subCounty.name,
          subCountyId: result.subCounty.id,
          ward: result.ward.name,
          wardId: result.ward.id,
          coordinates: result.county.coordinates ? {
            lat: result.county.coordinates.latitude,
            lng: result.county.coordinates.longitude,
          } : undefined,
        });
      }
      
      if (!embedded) {
        handleClose();
      }
    } else if (result.subCounty) {
      setSelectedCounty(result.county);
      setSelectedSubCounty(result.subCounty);
      setSearchQuery('');
      setStep('ward');
    } else {
      setSelectedCounty(result.county);
      setSearchQuery('');
      setStep('subcounty');
    }
  };

  const handleClose = () => {
    setStep('county');
    setSelectedCounty(null);
    setSelectedSubCounty(null);
    setSearchQuery('');
    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'ward') {
      setSelectedSubCounty(null);
      setStep('subcounty');
    } else if (step === 'subcounty') {
      setSelectedCounty(null);
      setStep('county');
    }
  };

  const renderBreadcrumb = () => {
    const parts: string[] = [];
    if (selectedCounty) parts.push(selectedCounty.name);
    if (selectedSubCounty) parts.push(selectedSubCounty.name);

    return (
      <View style={styles.breadcrumb}>
        <MapPin size={16} color="#666" />
        <Text style={styles.breadcrumbText}>
          {parts.length > 0 ? parts.join(' → ') : 'Select Location'}
        </Text>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!searchResults) return null;

    const hasResults =
      searchResults.counties.length > 0 ||
      searchResults.subCounties.length > 0 ||
      searchResults.wards.length > 0;

    if (!hasResults) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No locations found</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.searchResults}>
        {searchResults.wards.map((ward) => (
          <TouchableOpacity
            key={ward.id}
            style={styles.searchResultItem}
            onPress={() => {
              const county = counties.find((c) => c.name === ward.countyName);
              const subCounty = county?.subCounties.find(
                (sc) => sc.name === ward.subCountyName
              );
              if (county && subCounty) {
                handleSearchResultSelect({ county, subCounty, ward });
              }
            }}
          >
            <MapPin size={18} color="#007AFF" />
            <View style={styles.searchResultText}>
              <Text style={styles.searchResultName}>{ward.name}</Text>
              <Text style={styles.searchResultPath}>
                {ward.subCountyName}, {ward.countyName}
              </Text>
            </View>
            <ChevronRight size={18} color="#999" />
          </TouchableOpacity>
        ))}

        {searchResults.subCounties.map((subCounty) => (
          <TouchableOpacity
            key={subCounty.id}
            style={styles.searchResultItem}
            onPress={() => {
              const county = counties.find((c) => c.name === subCounty.countyName);
              if (county) {
                handleSearchResultSelect({ county, subCounty });
              }
            }}
          >
            <MapPin size={18} color="#007AFF" />
            <View style={styles.searchResultText}>
              <Text style={styles.searchResultName}>{subCounty.name}</Text>
              <Text style={styles.searchResultPath}>{subCounty.countyName}</Text>
            </View>
            <ChevronRight size={18} color="#999" />
          </TouchableOpacity>
        ))}

        {searchResults.counties.map((county) => (
          <TouchableOpacity
            key={county.id}
            style={styles.searchResultItem}
            onPress={() => handleSearchResultSelect({ county })}
          >
            <MapPin size={18} color="#007AFF" />
            <View style={styles.searchResultText}>
              <Text style={styles.searchResultName}>{county.name}</Text>
              <Text style={styles.searchResultPath}>County</Text>
            </View>
            <ChevronRight size={18} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCountyList = () => (
    <ScrollView style={styles.list}>
      {counties.map((county) => (
        <TouchableOpacity
          key={county.id}
          style={styles.listItem}
          onPress={() => handleCountySelect(county)}
        >
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{county.name}</Text>
            {county.capital && (
              <Text style={styles.listItemSubtitle}>Capital: {county.capital}</Text>
            )}
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSubCountyList = () => (
    <ScrollView style={styles.list}>
      {subCounties.map((subCounty) => (
        <TouchableOpacity
          key={subCounty.id}
          style={styles.listItem}
          onPress={() => handleSubCountySelect(subCounty)}
        >
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{subCounty.name}</Text>
            <Text style={styles.listItemSubtitle}>
              {subCounty.wards.length} wards
            </Text>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWardList = () => (
    <ScrollView style={styles.list}>
      {wards.map((ward) => (
        <TouchableOpacity
          key={ward.id}
          style={styles.listItem}
          onPress={() => handleWardSelect(ward)}
        >
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{ward.name}</Text>
          </View>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const content = (
    <View style={embedded ? styles.embeddedContainer : styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {step !== 'county' && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>
              {step === 'county' && 'Select County'}
              {step === 'subcounty' && 'Select Sub-County'}
              {step === 'ward' && 'Select Ward'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {renderBreadcrumb()}

          <View style={styles.searchContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search counties, sub-counties, or wards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {searchQuery.trim() ? (
            renderSearchResults()
          ) : (
            <>
              {step === 'county' && renderCountyList()}
              {step === 'subcounty' && renderSubCountyList()}
              {step === 'ward' && renderWardList()}
            </>
          )}
        </View>
      </View>
  );

  if (embedded) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  embeddedContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  searchResultPath: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
