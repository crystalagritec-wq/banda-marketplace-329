import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
} from 'react-native';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  Filter,
  Sparkles,
  MapPin,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { mockProducts, bandaMarketplaceSchema, searchItems } from '@/constants/products';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#2E7D32',
  secondary: '#F57C00',
  accent: '#E91E63',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

interface SmartSearchProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onLocationFilter: (location: string) => void;
  placeholder?: string;
  showFilters?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'location' | 'trending' | 'recent';
  icon?: React.ReactNode;
  count?: number;
}

export default function SmartSearch({
  onSearch,
  onCategoryFilter,
  onLocationFilter,
  placeholder = "Search products, farmers, or services...",
  showFilters = true,
}: SmartSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string;
    location: string;
    priceRange: string;
    availability: string;
  }>({
    category: '',
    location: '',
    priceRange: '',
    availability: '',
  });

  const animatedValue = useMemo(() => new Animated.Value(0), []);
  const filterAnimatedValue = useMemo(() => new Animated.Value(0), []);

  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Generate smart suggestions based on query
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!query.trim()) {
      // Show trending and recent searches when no query
      const trending: SearchSuggestion[] = [
        { id: 't1', text: 'Organic Maize', type: 'trending', icon: <TrendingUp size={16} color={COLORS.warning} />, count: 234 },
        { id: 't2', text: 'Fresh Tomatoes', type: 'trending', icon: <TrendingUp size={16} color={COLORS.warning} />, count: 189 },
        { id: 't3', text: 'Dairy Cows', type: 'trending', icon: <TrendingUp size={16} color={COLORS.warning} />, count: 156 },
        { id: 't4', text: 'Fertilizer NPK', type: 'trending', icon: <TrendingUp size={16} color={COLORS.warning} />, count: 143 },
      ];

      const recent: SearchSuggestion[] = recentSearches.slice(0, 3).map((search, index) => ({
        id: `r${index}`,
        text: search,
        type: 'recent' as const,
        icon: <Clock size={16} color={COLORS.textLight} />,
      }));

      return [...trending, ...recent];
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchSuggestion[] = [];

    // Product suggestions
    const productMatches = mockProducts
      .filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.vendor.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 4)
      .map(product => ({
        id: `p${product.id}`,
        text: product.name,
        type: 'product' as const,
        icon: <Tag size={16} color={COLORS.primary} />,
      }));

    // Category suggestions
    const categoryMatches = bandaMarketplaceSchema.categories
      .filter(category => 
        category.name.toLowerCase().includes(lowerQuery) ||
        category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(lowerQuery) ||
          sub.items.some(item => 
            typeof item === 'string' && item.toLowerCase().includes(lowerQuery)
          )
        )
      )
      .slice(0, 3)
      .map(category => ({
        id: `c${category.id}`,
        text: category.name,
        type: 'category' as const,
        icon: <Text style={{ fontSize: 16 }}>{category.emoji}</Text>,
      }));

    // Location suggestions
    const locations = Array.from(new Set(mockProducts.map(p => p.location)));
    const locationMatches = locations
      .filter(location => location.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map(location => ({
        id: `l${location}`,
        text: location,
        type: 'location' as const,
        icon: <MapPin size={16} color={COLORS.secondary} />,
      }));

    return [...productMatches, ...categoryMatches, ...locationMatches];
  }, [query, recentSearches]);

  // Animation effects
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, animatedValue]);

  useEffect(() => {
    Animated.timing(filterAnimatedValue, {
      toValue: showAdvancedFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showAdvancedFilters, filterAnimatedValue]);

  const handleFocus = useCallback(() => {
    setIsActive(true);
    setShowSuggestions(true);
    triggerHaptic();
  }, [triggerHaptic]);

  const handleBlur = useCallback(() => {
    // Delay to allow suggestion tap
    setTimeout(() => {
      setIsActive(false);
      setShowSuggestions(false);
    }, 150);
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
        return updated;
      });
      
      onSearch(searchQuery);
      setQuery(searchQuery);
      setShowSuggestions(false);
      triggerHaptic();
    }
  }, [onSearch, triggerHaptic]);

  const handleSuggestionPress = useCallback((suggestion: SearchSuggestion) => {
    triggerHaptic();
    
    switch (suggestion.type) {
      case 'product':
      case 'trending':
      case 'recent':
        handleSearch(suggestion.text);
        break;
      case 'category':
        onCategoryFilter(suggestion.text);
        setShowSuggestions(false);
        break;
      case 'location':
        onLocationFilter(suggestion.text);
        setShowSuggestions(false);
        break;
    }
  }, [handleSearch, onCategoryFilter, onLocationFilter, triggerHaptic]);

  const clearSearch = useCallback(() => {
    setQuery('');
    onSearch('');
    triggerHaptic();
  }, [onSearch, triggerHaptic]);

  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
    triggerHaptic();
  }, [triggerHaptic]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  const filterHeight = filterAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <View style={styles.container}>
      {/* Main Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            borderColor,
            shadowOpacity,
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Search size={20} color={isActive ? COLORS.primary : COLORS.textLight} />
          
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}

          {showFilters && (
            <TouchableOpacity 
              onPress={toggleAdvancedFilters}
              style={[styles.filterButton, showAdvancedFilters && styles.filterButtonActive]}
            >
              <Filter size={18} color={showAdvancedFilters ? COLORS.surface : COLORS.textSecondary} />
              {showAdvancedFilters ? (
                <ChevronUp size={14} color={COLORS.surface} />
              ) : (
                <ChevronDown size={14} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* AI Suggestion Indicator */}
        {isActive && suggestions.length > 0 && (
          <View style={styles.aiIndicator}>
            <Sparkles size={12} color={COLORS.warning} />
            <Text style={styles.aiText}>AI Suggestions</Text>
          </View>
        )}
      </Animated.View>

      {/* Advanced Filters */}
      {showFilters && (
        <Animated.View style={[styles.advancedFilters, { height: filterHeight }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {/* Category Filter */}
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>Category</Text>
                <ChevronDown size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Location Filter */}
              <TouchableOpacity style={styles.filterChip}>
                <MapPin size={14} color={COLORS.textSecondary} />
                <Text style={styles.filterChipText}>Location</Text>
                <ChevronDown size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Price Range Filter */}
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>Price Range</Text>
                <ChevronDown size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Availability Filter */}
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>In Stock</Text>
              </TouchableOpacity>

              {/* Verified Vendors */}
              <TouchableOpacity style={styles.filterChip}>
                <Text style={styles.filterChipText}>Verified</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {!query.trim() && (
              <>
                <View style={styles.suggestionSection}>
                  <Text style={styles.sectionTitle}>🔥 Trending Searches</Text>
                  {suggestions.filter(s => s.type === 'trending').map((suggestion) => (
                    <Pressable
                      key={suggestion.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      {suggestion.icon}
                      <Text style={styles.suggestionText}>{suggestion.text}</Text>
                      {suggestion.count && (
                        <Text style={styles.suggestionCount}>{suggestion.count} searches</Text>
                      )}
                    </Pressable>
                  ))}
                </View>

                {recentSearches.length > 0 && (
                  <View style={styles.suggestionSection}>
                    <Text style={styles.sectionTitle}>🕒 Recent Searches</Text>
                    {suggestions.filter(s => s.type === 'recent').map((suggestion) => (
                      <Pressable
                        key={suggestion.id}
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        {suggestion.icon}
                        <Text style={styles.suggestionText}>{suggestion.text}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}

            {query.trim() && (
              <View style={styles.suggestionSection}>
                <Text style={styles.sectionTitle}>✨ Smart Suggestions</Text>
                {suggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion.id}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    {suggestion.icon}
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                    <Text style={styles.suggestionType}>
                      {suggestion.type === 'product' ? 'Product' : 
                       suggestion.type === 'category' ? 'Category' : 'Location'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    outlineStyle: 'none',
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  aiText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
  advancedFilters: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
  },
  filterScroll: {
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginTop: 4,
    maxHeight: 300,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  suggestionCount: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  suggestionType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});