import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import {
  Search,
  Mic,
  Camera,
  SlidersHorizontal,
  X,
  MapPin,
  Grid3x3,
  List,
  ChevronDown,
  Star,
  Calendar,
  TrendingUp,
  Clock,
  ShoppingCart,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartFeedback from '@/components/CartFeedback';
import { useCart } from '@/providers/cart-provider';
import * as Haptics from 'expo-haptics';
import HierarchicalLocationSelector from '@/components/HierarchicalLocationSelector';
import { County, SubCounty, Ward } from '@/constants/kenya-locations-complete';

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

type ViewMode = "grid" | "list";
type SearchType = "all" | "products" | "services";
type SortOption = "best-match" | "lowest-price" | "closest" | "top-rated" | "newest";

const PLACEHOLDER_HINTS = [
  "Search feeds, cages, services...",
  "Find a vet nearby",
  "Looking for dairy feed?",
  "Search tractors, equipment...",
  "Find transport services",
];

export default function SearchPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialQuery = typeof params.q === "string" ? params.q : "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy] = useState<SortOption>("best-match");
  const [showFilters, setShowFilters] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'add' | 'update' | 'remove' | 'success'>('add');
  const { addToCart } = useCart();
  const [showLocationSelector, setShowLocationSelector] = useState<boolean>(false);
  const [selectedLocationData, setSelectedLocationData] = useState<{
    county: County;
    subCounty: SubCounty;
    ward: Ward;
    formatted: string;
  } | null>(null);

  const [filters, setFilters] = useState({
    location: {
      country: "Kenya",
      county: "",
      subCounty: "",
      ward: "",
      town: "",
      nearbyOnly: false,
    },
    priceRange: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
    },
    category: "",
    vendorType: [] as ("verified" | "gold" | "new" | "all")[],
    rating: undefined as number | undefined,
    availability: "all" as const,
    deliveryOptions: [] as ("delivery" | "pickup")[],
  });

  const trendingQuery = trpc.search.trending.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });
  const recentQuery = trpc.search.recent.useQuery(undefined, {
    staleTime: 1000 * 60,
  });
  const saveSearchMutation = trpc.search.save.useMutation();

  const searchResults = trpc.search.advanced.useQuery(
    {
      query: debouncedQuery,
      type: searchType,
      sortBy,
      location: filters.location,
      priceRange: filters.priceRange,
      category: filters.category,
      vendorType: filters.vendorType,
      rating: filters.rating,
      availability: filters.availability,
      deliveryOptions: filters.deliveryOptions,
    },
    {
      enabled: debouncedQuery.length > 0,
      staleTime: 1000 * 30,
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.length > 2) {
        saveSearchMutation.mutate({ query: searchQuery });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_HINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleVoiceSearch = useCallback(() => {
    console.log("[Voice Search] Starting voice search");
  }, []);

  const handleImageSearch = useCallback(() => {
    console.log("[Image Search] Starting image search");
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedLocationData(null);
    setFilters({
      location: {
        country: "Kenya",
        county: "",
        subCounty: "",
        ward: "",
        town: "",
        nearbyOnly: false,
      },
      priceRange: {
        min: undefined,
        max: undefined,
      },
      category: "",
      vendorType: [],
      rating: undefined,
      availability: "all",
      deliveryOptions: [],
    });
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location.county) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.category) count++;
    if (filters.vendorType.length > 0) count++;
    if (filters.rating) count++;
    if (filters.availability !== "all") count++;
    if (filters.deliveryOptions.length > 0) count++;
    return count;
  }, [filters]);

  const renderProductCard = useCallback(
    (item: any) => {
      if (viewMode === "grid") {
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.gridCard}
            onPress={() => router.push(`/(tabs)/product/${item.id}`)}
            testID={`product-card-${item.id}`}
          >
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            <View style={styles.gridContent}>
              <Text style={styles.gridTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.vendorBadgeRow}>
                <Text style={styles.vendorName} numberOfLines={1}>
                  {item.vendor.name}
                </Text>
                {item.vendor.badge === "verified" && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.badgeText}>✓</Text>
                  </View>
                )}
                {item.vendor.badge === "gold" && (
                  <View style={styles.goldBadge}>
                    <Text style={styles.badgeText}>★</Text>
                  </View>
                )}
              </View>
              <View style={styles.locationRow}>
                <MapPin size={10} color="#666" />
                <Text style={styles.locationText}>
                  {item.vendor.location.town} • {item.vendor.location.distance}km
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={10} color="#FFA500" fill="#FFA500" />
                <Text style={styles.ratingText}>{item.vendor.rating}</Text>
              </View>
              <Text style={styles.gridPrice}>
                {item.currency} {item.price.toLocaleString()}
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addToCart(item as any, 1);
                  setFeedbackType('add');
                  setFeedbackMessage(`${item.title} added to cart`);
                  setFeedbackVisible(true);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  }
                }}
              >
                <ShoppingCart size={14} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          key={item.id}
          style={styles.listCard}
          onPress={() => router.push(`/(tabs)/product/${item.id}`)}
          testID={`product-card-${item.id}`}
        >
          <Image source={{ uri: item.image }} style={styles.listImage} />
          <View style={styles.listContent}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.listDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <View style={styles.vendorRow}>
              <Text style={styles.vendorName}>{item.vendor.name}</Text>
              {item.vendor.badge === "verified" && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              )}
              {item.vendor.badge === "gold" && (
                <View style={styles.goldBadge}>
                  <Text style={styles.badgeText}>Gold</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#666" />
                <Text style={styles.metaText}>
                  {item.vendor.location.town} • {item.vendor.location.distance}km
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={12} color="#FFA500" fill="#FFA500" />
                <Text style={styles.metaText}>{item.vendor.rating}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.listPrice}>
                {item.currency} {item.price.toLocaleString()}
              </Text>
              <TouchableOpacity 
                style={styles.addButtonList}
                onPress={() => {
                  addToCart(item as any, 1);
                  setFeedbackType('add');
                  setFeedbackMessage(`${item.title} added to cart`);
                  setFeedbackVisible(true);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  }
                }}
              >
                <ShoppingCart size={14} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [viewMode, router]
  );

  const renderServiceCard = useCallback(
    (item: any) => {
      if (viewMode === "grid") {
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.gridCard}
            testID={`service-card-${item.id}`}
          >
            <View style={styles.serviceIconContainer}>
              <Text style={styles.serviceIcon}>{item.icon}</Text>
            </View>
            <View style={styles.gridContent}>
              <Text style={styles.gridTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.vendorBadgeRow}>
                <Text style={styles.vendorName} numberOfLines={1}>
                  {item.provider.name}
                </Text>
                {item.provider.badge === "verified" && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.badgeText}>✓</Text>
                  </View>
                )}
                {item.provider.badge === "gold" && (
                  <View style={styles.goldBadge}>
                    <Text style={styles.badgeText}>★</Text>
                  </View>
                )}
              </View>
              <View style={styles.locationRow}>
                <MapPin size={10} color="#666" />
                <Text style={styles.locationText}>
                  {item.provider.location.town} • {item.provider.location.distance}km
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={10} color="#FFA500" fill="#FFA500" />
                <Text style={styles.ratingText}>{item.provider.rating}</Text>
              </View>
              <Text style={styles.gridPrice}>
                {item.currency} {item.rate.toLocaleString()}/{item.rateUnit}
              </Text>
              <TouchableOpacity style={styles.requestButton}>
                <Calendar size={14} color="#fff" />
                <Text style={styles.requestButtonText}>Request</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity key={item.id} style={styles.listCard} testID={`service-card-${item.id}`}>
          <View style={styles.serviceIconContainerList}>
            <Text style={styles.serviceIconList}>{item.icon}</Text>
          </View>
          <View style={styles.listContent}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.listDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <View style={styles.vendorRow}>
              <Text style={styles.vendorName}>{item.provider.name}</Text>
              {item.provider.badge === "verified" && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              )}
              {item.provider.badge === "gold" && (
                <View style={styles.goldBadge}>
                  <Text style={styles.badgeText}>Gold</Text>
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#666" />
                <Text style={styles.metaText}>
                  {item.provider.location.town} • {item.provider.location.distance}km
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={12} color="#FFA500" fill="#FFA500" />
                <Text style={styles.metaText}>{item.provider.rating}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.listPrice}>
                {item.currency} {item.rate.toLocaleString()}/{item.rateUnit}
              </Text>
              <TouchableOpacity style={styles.requestButtonSmall}>
                <Calendar size={14} color="#fff" />
                <Text style={styles.requestButtonText}>Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [viewMode]
  );

  const showInitialState = !debouncedQuery && !searchResults.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={PLACEHOLDER_HINTS[placeholderIndex]}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            testID="search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} testID="clear-search">
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleVoiceSearch} style={styles.iconButton}>
            <Mic size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImageSearch} style={styles.iconButton}>
            <Camera size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.typeFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.typeChip, searchType === "all" && styles.typeChipActive]}
              onPress={() => setSearchType("all")}
            >
              <Text style={[styles.typeChipText, searchType === "all" && styles.typeChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeChip, searchType === "products" && styles.typeChipActive]}
              onPress={() => setSearchType("products")}
            >
              <Text
                style={[styles.typeChipText, searchType === "products" && styles.typeChipTextActive]}
              >
                Products
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeChip, searchType === "services" && styles.typeChipActive]}
              onPress={() => setSearchType("services")}
            >
              <Text
                style={[styles.typeChipText, searchType === "services" && styles.typeChipTextActive]}
              >
                Services
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {showInitialState ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {recentQuery.data && recentQuery.data.recent.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color="#333" />
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <View style={styles.chipContainer}>
                {recentQuery.data.recent.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => setSearchQuery(item.query)}
                  >
                    <Text style={styles.chipText}>{item.query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {trendingQuery.data && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color="#333" />
                <Text style={styles.sectionTitle}>Trending Searches</Text>
              </View>
              <View style={styles.chipContainer}>
                {trendingQuery.data.trending.slice(0, 8).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => setSearchQuery(item.query)}
                  >
                    <Text style={styles.chipText}>{item.query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          <View style={styles.toolbar}>
            <Text style={styles.resultsCount}>
              {searchResults.data?.total || 0} results found
            </Text>
            <View style={styles.toolbarRight}>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? (
                  <List size={20} color="#333" />
                ) : (
                  <Grid3x3 size={20} color="#333" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolbarButton, activeFiltersCount > 0 && styles.filterButtonActive]}
                onPress={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={20} color={activeFiltersCount > 0 ? "#10B981" : "#333"} />
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {activeFiltersCount > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.activeFiltersRow}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {filters.location.county && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {filters.location.town || filters.location.county}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        location: { ...prev.location, county: "", town: "" },
                      }))
                    }
                  >
                    <X size={14} color="#10B981" />
                  </TouchableOpacity>
                </View>
              )}
              {(filters.priceRange.min || filters.priceRange.max) && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {filters.priceRange.min || 0} - {filters.priceRange.max || "∞"} KES
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: { min: undefined, max: undefined },
                      }))
                    }
                  >
                    <X size={14} color="#10B981" />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <View style={styles.sortRow}>
            <TouchableOpacity style={styles.sortButton} onPress={() => {}}>
              <Text style={styles.sortText}>Sort: {sortBy.replace("-", " ")}</Text>
              <ChevronDown size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {searchResults.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResults.data && searchResults.data.results.length > 0 ? (
            <ScrollView
              style={styles.resultsContainer}
              contentContainerStyle={
                viewMode === "grid" ? styles.gridContainer : styles.listContainer
              }
              showsVerticalScrollIndicator={false}
            >
              {searchResults.data.results.map((item) => {
                if (item.type === "product") {
                  return renderProductCard(item);
                } else {
                  return renderServiceCard(item);
                }
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Search size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )}
        </>
      )}

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearAll={clearFilters}
        selectedLocationData={selectedLocationData}
        onLocationSelect={() => setShowLocationSelector(true)}
        onLocationClear={() => {
          setSelectedLocationData(null);
          setFilters((prev) => ({
            ...prev,
            location: {
              country: "Kenya",
              county: "",
              subCounty: "",
              ward: "",
              town: "",
              nearbyOnly: false,
            },
          }));
        }}
      />
      
      <CartFeedback
        visible={feedbackVisible}
        type={feedbackType}
        message={feedbackMessage}
        onHide={() => setFeedbackVisible(false)}
      />
      
      <HierarchicalLocationSelector
        visible={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onSelect={(location) => {
          setSelectedLocationData(location);
          setFilters((prev) => ({
            ...prev,
            location: {
              country: "Kenya",
              county: location.county.name,
              subCounty: location.subCounty.name,
              ward: location.ward.name,
              town: location.ward.name,
              nearbyOnly: false,
            },
          }));
        }}
      />
    </SafeAreaView>
  );
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearAll: () => void;
  selectedLocationData: {
    county: County;
    subCounty: SubCounty;
    ward: Ward;
    formatted: string;
  } | null;
  onLocationSelect: () => void;
  onLocationClear: () => void;
}

function FilterModal({ visible, onClose, filters, onFiltersChange, onClearAll, selectedLocationData, onLocationSelect, onLocationClear }: FilterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Location</Text>
            <Text style={styles.filterSectionSubtitle}>
              Filter by location to find nearby items
            </Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onLocationSelect}
            >
              <MapPin size={20} color="#10B981" />
              <Text style={styles.locationButtonText}>
                {selectedLocationData
                  ? selectedLocationData.formatted
                  : 'Select Location'}
              </Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
            {selectedLocationData && (
              <TouchableOpacity
                style={styles.clearLocationButton}
                onPress={onLocationClear}
              >
                <Text style={styles.clearLocationText}>Clear Location</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceInputRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                keyboardType="numeric"
                value={filters.priceRange.min?.toString() || ""}
                onChangeText={(text) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: { ...filters.priceRange, min: parseInt(text) || undefined },
                  })
                }
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                keyboardType="numeric"
                value={filters.priceRange.max?.toString() || ""}
                onChangeText={(text) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: { ...filters.priceRange, max: parseInt(text) || undefined },
                  })
                }
              />
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Rating</Text>
            <View style={styles.ratingOptions}>
              {[4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    filters.rating === rating && styles.ratingOptionActive,
                  ]}
                  onPress={() =>
                    onFiltersChange({
                      ...filters,
                      rating: filters.rating === rating ? undefined : rating,
                    })
                  }
                >
                  <Star
                    size={16}
                    color={filters.rating === rating ? "#fff" : "#FFA500"}
                    fill={filters.rating === rating ? "#fff" : "#FFA500"}
                  />
                  <Text
                    style={[
                      styles.ratingOptionText,
                      filters.rating === rating && styles.ratingOptionTextActive,
                    ]}
                  >
                    {rating}+ stars
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
  typeFilterRow: {
    marginTop: 12,
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: "#10B981",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#666",
  },
  typeChipTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#333",
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
  },
  toolbarRight: {
    flexDirection: "row",
    gap: 12,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  filterButtonActive: {
    backgroundColor: "#E8F5F1",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#fff",
  },
  activeFiltersRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E8F5F1",
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600" as const,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },
  clearAllText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600" as const,
  },
  sortRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize" as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  resultsContainer: {
    flex: 1,
  },
  gridContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  gridImage: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    backgroundColor: "#f5f5f5",
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 4,
  },
  vendorBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  goldBadge: {
    backgroundColor: "#FFA500",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: "#fff",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 10,
    color: "#666",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 10,
    color: "#666",
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#10B981",
    marginBottom: 8,
  },
  listCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    padding: 12,
    gap: 12,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#10B981",
  },
  serviceIconContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    backgroundColor: "#E8F5F1",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIcon: {
    fontSize: 48,
  },
  serviceIconContainerList: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E8F5F1",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIconList: {
    fontSize: 40,
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
  },
  requestButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  requestButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#333",
  },
  modalContent: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 4,
  },
  filterSectionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  priceInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 16,
    color: "#666",
  },
  ratingOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  ratingOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  ratingOptionActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  ratingOptionText: {
    fontSize: 14,
    color: "#333",
  },
  ratingOptionTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666",
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonList: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationButtonText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    marginLeft: 12,
  },
  clearLocationButton: {
    marginTop: 8,
    alignSelf: "flex-start" as const,
  },
  clearLocationText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600" as const,
  },
});
