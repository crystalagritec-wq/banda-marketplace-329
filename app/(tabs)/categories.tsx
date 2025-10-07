import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoriesList } from '@/constants/products';
import { Search, ArrowLeft, ChevronRight, MapPin, Filter } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';


// Location and category data structures
interface Location {
  id: string;
  name: string;
  type: 'town' | 'county' | 'national';
  parent_id?: string;
}

interface CategoryDeal {
  id: string;
  title: string;
  category: string;
  location?: string;
  count: number;
}

interface CategoryWithLocation {
  id: string;
  name: string;
  location_filter: 'town' | 'county' | 'national';
  product_count: number;
}

const categoryDeals: Record<string, Omit<CategoryDeal, 'count'>[]> = {
  'Vegetables': [
    { id: '1', title: 'Fresh Vegetable Deals', category: 'Vegetables' },
    { id: '2', title: 'Organic Vegetable Deals', category: 'Vegetables' },
    { id: '3', title: 'Leafy Greens Deals', category: 'Vegetables' },
    { id: '4', title: 'Root Vegetable Deals', category: 'Vegetables' },
  ],
  'Fruits': [
    { id: '5', title: 'Tropical Fruit Deals', category: 'Fruits' },
    { id: '6', title: 'Citrus Fruit Deals', category: 'Fruits' },
    { id: '7', title: 'Seasonal Fruit Deals', category: 'Fruits' },
    { id: '8', title: 'Exotic Fruit Deals', category: 'Fruits' },
  ],
  'Grains': [
    { id: '9', title: 'Cereal Grain Deals', category: 'Grains' },
    { id: '10', title: 'Legume Deals', category: 'Grains' },
    { id: '11', title: 'Rice & Wheat Deals', category: 'Grains' },
    { id: '12', title: 'Organic Grain Deals', category: 'Grains' },
  ],
  'Dairy': [
    { id: '13', title: 'Fresh Milk Deals', category: 'Dairy' },
    { id: '14', title: 'Cheese & Yogurt Deals', category: 'Dairy' },
    { id: '15', title: 'Butter & Cream Deals', category: 'Dairy' },
    { id: '16', title: 'Organic Dairy Deals', category: 'Dairy' },
  ],
  'Poultry': [
    { id: '17', title: 'Chicken Deals', category: 'Poultry' },
    { id: '18', title: 'Egg Deals', category: 'Poultry' },
    { id: '19', title: 'Turkey Deals', category: 'Poultry' },
    { id: '20', title: 'Duck Deals', category: 'Poultry' },
  ],
  'Livestock': [
    { id: '21', title: 'Beef Deals', category: 'Livestock' },
    { id: '22', title: 'Goat Meat Deals', category: 'Livestock' },
    { id: '23', title: 'Sheep Deals', category: 'Livestock' },
    { id: '24', title: 'Pork Deals', category: 'Livestock' },
  ],
  'Inputs': [
    { id: '25', title: 'Fertilizer Deals', category: 'Inputs' },
    { id: '26', title: 'Seed Deals', category: 'Inputs' },
    { id: '27', title: 'Pesticide Deals', category: 'Inputs' },
    { id: '28', title: 'Organic Input Deals', category: 'Inputs' },
  ],
  'Equipment': [
    { id: '29', title: 'Hand Tool Deals', category: 'Equipment' },
    { id: '30', title: 'Machinery Deals', category: 'Equipment' },
    { id: '31', title: 'Irrigation Deals', category: 'Equipment' },
    { id: '32', title: 'Storage Deals', category: 'Equipment' },
  ],
};

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Vegetables');
  const [locationFilter, setLocationFilter] = useState<'town' | 'county' | 'national'>('national');
  const [locations, setLocations] = useState<Location[]>([]);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<CategoryWithLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // const filteredProducts = useMemo(() => {
  //   if (!selectedCategory) return [];
  //   return mockProducts.filter(product => product.category === selectedCategory);
  // }, [selectedCategory]); // Unused for now

  // Fetch locations and categories with product counts
  useEffect(() => {
    fetchLocationsAndCategories();
  }, [locationFilter]);

  const fetchLocationsAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories with product counts based on location filter
      const { data: categoryData, error: categoryError } = await supabase
        .rpc('fetch_categories_by_location', {
          location_type: locationFilter
        });

      if (categoryError) {
        console.error('Error fetching categories:', categoryError);
        // Fallback to static data
        setCategoriesWithCounts(categoriesList.map(cat => ({
          id: cat.key,
          name: cat.label,
          location_filter: locationFilter,
          product_count: Math.floor(Math.random() * 100) + 10
        })));
      } else {
        setCategoriesWithCounts(categoryData || []);
      }

      // Fetch locations for filter
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('type', locationFilter)
        .order('name');

      if (!locationError && locationData) {
        setLocations(locationData);
      }
    } catch (error) {
      console.error('Error in fetchLocationsAndCategories:', error);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, categoriesList]);



  const currentDeals = useMemo(() => {
    const baseDeals = categoryDeals[selectedCategory] || [];
    const categoryWithCount = categoriesWithCounts.find(c => c.name === selectedCategory);
    const productCount = categoryWithCount?.product_count || 0;
    
    return baseDeals.map(deal => ({
      ...deal,
      count: Math.floor(productCount / baseDeals.length) + Math.floor(Math.random() * 20)
    }));
  }, [selectedCategory, categoriesWithCounts]);

  const selectCategory = useCallback((categoryKey: string) => {
    if (!categoryKey?.trim()) return;
    console.log('Selected category:', categoryKey);
    setSelectedCategory(categoryKey);
  }, []);

  const handleDealPress = useCallback((deal: CategoryDeal) => {
    if (!deal?.category?.trim()) return;
    console.log('Deal pressed:', deal.title);
    // Navigate to marketplace with category filter
    router.push({ pathname: '/(tabs)/marketplace', params: { category: deal.category } });
  }, [router]);

  const handleSeeAllPress = useCallback((category: string) => {
    if (!category?.trim()) return;
    console.log('See all pressed for:', category);
    // Navigate to marketplace with category filter
    router.push({ pathname: '/(tabs)/marketplace', params: { category } });
  }, [router]);

  // const clear = useCallback(() => setQuery(''), []); // Unused for now

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft size={24} color="#fff" />
        <Text style={styles.headerTitle}>Popular Categories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar and Location Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories, deals..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Location Filter */}
      <View style={styles.locationFilterContainer}>
        <View style={styles.locationFilterHeader}>
          <MapPin size={18} color="#2D5016" />
          <Text style={styles.locationFilterTitle}>Location Filter</Text>
        </View>
        <View style={styles.locationFilterButtons}>
          <TouchableOpacity
            style={[styles.locationButton, locationFilter === 'town' && styles.locationButtonActive]}
            onPress={() => setLocationFilter('town')}
            testID="location-filter-town"
          >
            <Text style={[styles.locationButtonText, locationFilter === 'town' && styles.locationButtonTextActive]}>Towns</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.locationButton, locationFilter === 'county' && styles.locationButtonActive]}
            onPress={() => setLocationFilter('county')}
            testID="location-filter-county"
          >
            <Text style={[styles.locationButtonText, locationFilter === 'county' && styles.locationButtonTextActive]}>Counties</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.locationButton, locationFilter === 'national' && styles.locationButtonActive]}
            onPress={() => setLocationFilter('national')}
            testID="location-filter-national"
          >
            <Text style={[styles.locationButtonText, locationFilter === 'national' && styles.locationButtonTextActive]}>National</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Left Sidebar - Categories */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categoriesWithCounts.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.name && styles.categoryItemActive
                ]}
                onPress={() => selectCategory(category.name)}
                testID={`category-${category.id}`}
              >
                <View style={styles.categoryContent}>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryCount}>({category.product_count})</Text>
                </View>
                {selectedCategory === category.name && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content - Deals */}
        <View style={styles.contentArea}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dealsContainer}>
            {/* Category Deals Section */}
            <View style={styles.dealsSection}>
              <View style={styles.dealsSectionHeader}>
                <Text style={styles.dealsSectionTitle}>{selectedCategory} deals</Text>
                <TouchableOpacity onPress={() => handleSeeAllPress(selectedCategory)}>
                  <Text style={styles.seeAllText}>See All {selectedCategory} deals &gt;&gt;</Text>
                </TouchableOpacity>
              </View>
              
              {currentDeals.map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  style={styles.dealItem}
                  onPress={() => handleDealPress(deal)}
                  testID={`deal-${deal.id}`}
                >
                  <View style={styles.dealContent}>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealCount}>{deal.count} items</Text>
                  </View>
                  <ChevronRight size={16} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional sections can be added here */}
            <View style={styles.dealsSection}>
              <View style={styles.dealsSectionHeader}>
                <Text style={styles.dealsSectionTitle}>Fresh Deals</Text>
              </View>
              
              <TouchableOpacity style={styles.dealItem} onPress={() => handleSeeAllPress(selectedCategory)}>
                <Text style={styles.dealTitle}>Great Value</Text>
                <ChevronRight size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.dealsSection}>
              <View style={styles.dealsSectionHeader}>
                <Text style={styles.dealsSectionTitle}>Special Offers</Text>
              </View>
              
              <TouchableOpacity style={styles.dealItem} onPress={() => handleSeeAllPress(selectedCategory)}>
                <Text style={styles.dealTitle}>Flash Sale</Text>
                <ChevronRight size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dealItem} onPress={() => handleSeeAllPress(selectedCategory)}>
                <Text style={styles.dealTitle}>Weekend Deals</Text>
                <ChevronRight size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Search Styles
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  
  // Main Content Layout
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // Sidebar Styles
  sidebar: {
    width: 120,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
  },
  categoryItemActive: {
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'left',
  },
  categoryTextActive: {
    color: '#F97316',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#F97316',
  },
  
  // Content Area Styles
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dealsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Deals Section Styles
  dealsSection: {
    marginTop: 20,
  },
  dealsSectionHeader: {
    marginBottom: 12,
  },
  dealsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Deal Item Styles
  dealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dealTitle: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Header spacer
  headerSpacer: {
    width: 24,
  },
  
  // Location Filter Styles
  locationFilterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  locationFilterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016',
  },
  locationFilterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationButtonActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  locationButtonTextActive: {
    color: '#fff',
  },
  
  // Enhanced Category Styles
  categoryContent: {
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  
  // Enhanced Deal Styles
  dealContent: {
    flex: 1,
  },
  dealCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
