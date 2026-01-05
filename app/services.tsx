import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  Grid,
  List,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceCard from '@/components/ServiceCard';
import EmptyState from '@/components/EmptyState';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { trpc } from '@/lib/trpc';
import { useLocation } from '@/providers/location-provider';
import { calculateDistance } from '@/utils/geo-distance';

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
} as const;

const SERVICE_CATEGORIES = [
  'All Services',
  'Farm Management',
  'Plowing & Tilling',
  'Planting',
  'Harvesting',
  'Pest Control',
  'Irrigation',
  'Livestock Care',
  'Equipment Operation',
  'Consultation',
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Rating', value: 'rating' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Nearest', value: 'distance' },
];

export default function ServicesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    minRating: 0,
    priceRange: [0, 100000] as [number, number],
    verified: false,
    available: false,
  });

  const servicesQuery = trpc.serviceProviders.getMarketplaceServices.useQuery({
    category: selectedCategory !== 'All Services' ? selectedCategory : undefined,
    searchQuery: searchQuery || undefined,
    limit: 50,
  });

  const services = useMemo(() => {
    if (!servicesQuery.data?.services) return [];

    let filtered = [...servicesQuery.data.services];

    if (filters.minRating > 0) {
      filtered = filtered.filter((s: any) => s.rating >= filters.minRating);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (s: any) => s.priceFrom >= filters.priceRange[0] && s.priceFrom <= filters.priceRange[1]
      );
    }

    if (filters.verified) {
      filtered = filtered.filter((s: any) => s.verified);
    }

    if (filters.available) {
      filtered = filtered.filter((s: any) => s.availability === 'Available');
    }

    if (userLocation && sortBy === 'distance') {
      filtered = filtered.map((service: any) => ({
        ...service,
        distance: service.coordinates
          ? calculateDistance(
              userLocation.coordinates,
              service.coordinates
            )
          : 999,
      }));
      filtered.sort((a: any, b: any) => a.distance - b.distance);
    } else if (sortBy === 'rating') {
      filtered.sort((a: any, b: any) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      filtered.sort((a: any, b: any) => a.priceFrom - b.priceFrom);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a: any, b: any) => b.priceFrom - a.priceFrom);
    }

    return filtered;
  }, [servicesQuery.data, filters, sortBy, userLocation]);

  const handleToggleFavorite = useCallback((id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleServicePress = useCallback(
    (id: string) => {
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push(`/service-details?id=${id}`);
    },
    [router]
  );

  const handleRequestService = useCallback(
    (id: string) => {
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.push(`/service-details?id=${id}`);
    },
    [router]
  );

  const handleSearch = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    servicesQuery.refetch();
  }, [servicesQuery]);

  const renderServiceCard = useCallback(
    ({ item }: { item: any }) => (
      <ServiceCard
        id={item.id}
        name={item.name}
        category={item.category}
        providerName={item.providerName}
        priceFrom={item.priceFrom}
        location={item.location}
        rating={item.rating}
        image={item.image}
        verified={item.verified}
        availability={item.availability}
        onPress={handleServicePress}
        onRequestService={handleRequestService}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={favorites.has(item.id)}
      />
    ),
    [handleServicePress, handleRequestService, handleToggleFavorite, favorites]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              placeholderTextColor={COLORS.textLight}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => bottomSheetRef.current?.expand()}
          >
            <SlidersHorizontal size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {SERVICE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={18} color={viewMode === 'grid' ? COLORS.primary : COLORS.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <List size={18} color={viewMode === 'list' ? COLORS.primary : COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sortRow}>
          <View style={styles.locationBadge}>
            <MapPin size={14} color={COLORS.textLight} />
            <Text style={styles.locationText}>
              {userLocation ? `${userLocation.county || 'Kenya'}` : 'Select Location'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sortScroll}
          >
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortChip,
                  sortBy === option.value && styles.sortChipActive,
                ]}
                onPress={() => setSortBy(option.value)}
              >
                {sortBy === option.value && <TrendingUp size={14} color={COLORS.primary} />}
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === option.value && styles.sortChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {services.length} service{services.length !== 1 ? 's' : ''} available
          </Text>
          {filters.minRating > 0 ||
          filters.verified ||
          filters.available ||
          filters.priceRange[0] > 0 ||
          filters.priceRange[1] < 100000 ? (
            <TouchableOpacity
              onPress={() =>
                setFilters({
                  minRating: 0,
                  priceRange: [0, 100000],
                  verified: false,
                  available: false,
                })
              }
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {servicesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : services.length === 0 ? (
        <EmptyState
          type="search"
          title="No services found"
          message="Try adjusting your filters or search in a different location"
        />
      ) : (
        <FlashList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item: any) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterBottomSheet
        bottomSheetRef={bottomSheetRef}
        filters={filters}
        onApplyFilters={setFilters}
        maxPrice={100000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    marginTop: 12,
  },
  categoriesScroll: {
    flex: 1,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.surface,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginRight: 16,
  },
  viewButton: {
    padding: 6,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: COLORS.surface,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortScroll: {
    flex: 1,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#ECFDF5',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortChipTextActive: {
    color: COLORS.primary,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.orange,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: 16,
  },
});
