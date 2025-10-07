import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Filter,
  Search,
  BadgePercent,
  ShoppingCart,
  Star,
  MapPin,
} from 'lucide-react-native';
import { mockProducts, type Product } from '@/constants/products';
import { useCart } from '@/providers/cart-provider';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

type SortBy = 'category' | 'price' | 'popularity';

function formatPrice(amount: number) {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export default function FlashSaleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { addToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Flash sale countdown timer
  const [flashTime, setFlashTime] = useState(2 * 60 * 60 + 45 * 60); // 2h 45m
  
  React.useEffect(() => {
    const id = setInterval(() => {
      setFlashTime((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  
  const timeStr = useMemo(() => {
    const h = Math.floor(flashTime / 3600);
    const m = Math.floor((flashTime % 3600) / 60);
    const s = flashTime % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [flashTime]);

  // Filter flash sale products (only products with discounts) - limit to 10 items
  const flashProducts = useMemo(() => {
    return mockProducts.filter(p => p.discount && p.discount > 0).slice(0, 10);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = flashProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'popularity') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'category') {
      filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category));
    }

    return filtered;
  }, [flashProducts, searchQuery, selectedCategory, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(flashProducts.map(p => p.category));
    return Array.from(cats);
  }, [flashProducts]);

  const handleAddToCart = useCallback((product: Product) => {
    addToCart(product, 1);
  }, [addToCart]);

  const openProductDetails = useCallback((id: string) => {
    router.push({ pathname: '/(tabs)/product/[id]', params: { id } });
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔥 Flash Sale</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Countdown Timer */}
      <View style={styles.timerBar}>
        <Clock size={16} color={ORANGE} />
        <Text style={styles.timerText}>⏰ Ends in {timeStr}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search flash sale products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter & Sort Controls */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* Sort Options */}
          {(['category', 'price', 'popularity'] as SortBy[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterPill, sortBy === option && styles.filterPillActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.filterPillText, sortBy === option && styles.filterPillTextActive]}>
                {option === 'category' ? 'Category' : option === 'price' ? 'Price' : 'Popularity'}
              </Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.filterDivider} />
          
          {/* Category Filter */}
          <TouchableOpacity
            style={[styles.filterPill, selectedCategory === '' && styles.filterPillActive]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.filterPillText, selectedCategory === '' && styles.filterPillTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterPill, selectedCategory === category && styles.filterPillActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.filterPillText, selectedCategory === category && styles.filterPillTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => openProductDetails(product.id)}
            >
              <View style={styles.productImageContainer}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                
                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                  <BadgePercent size={12} color={WHITE} />
                  <Text style={styles.discountText}>-{product.discount}%</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <Text numberOfLines={2} style={styles.productName}>
                  {product.name}
                </Text>
                
                <View style={styles.vendorRow}>
                  <Text style={styles.vendorName} numberOfLines={1}>
                    {product.vendor}
                  </Text>
                </View>
                
                <View style={styles.locationRow}>
                  <MapPin size={12} color="#9CA3AF" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {product.location}
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.oldPrice}>
                    KES {Math.round(product.price * 1.3).toLocaleString()}
                  </Text>
                  <Text style={styles.newPrice}>
                    {formatPrice(product.price)}
                  </Text>
                </View>

                <View style={styles.ratingRow}>
                  <Star size={12} color="#FCD34D" fill="#FCD34D" />
                  <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <ShoppingCart size={14} color={WHITE} />
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No flash sale products found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF3E0',
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: ORANGE,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    backgroundColor: WHITE,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: GREEN,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: GREEN,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  productsContainer: {
    padding: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: 'relative',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  vendorRow: {
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  oldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});