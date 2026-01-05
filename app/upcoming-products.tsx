import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bell,
  Star,
  Sparkles,
  ChevronRight,
  Package,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface UpcomingProduct {
  id: string;
  name: string;
  vendor: string;
  vendorLogo: string;
  image: string;
  expectedPrice: number;
  launchDate: string;
  launchDateFormatted: string;
  category: string;
  description: string;
  features: string[];
  preOrderCount: number;
  isHot: boolean;
}

const mockUpcomingProducts: UpcomingProduct[] = [
  {
    id: 'up1',
    name: 'Smart Soil Analyzer Pro',
    vendor: 'AgriTech Kenya',
    vendorLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    expectedPrice: 12500,
    launchDate: '2024-11-15',
    launchDateFormatted: 'Nov 15, 2024',
    category: 'Technology',
    description: 'Advanced soil testing device with real-time NPK analysis and smartphone connectivity.',
    features: ['Real-time NPK testing', 'Bluetooth connectivity', 'Cloud data sync', '2-year warranty'],
    preOrderCount: 156,
    isHot: true,
  },
  {
    id: 'up2',
    name: 'Hybrid Maize Seeds - SuperYield',
    vendor: 'Kenya Seed Company',
    vendorLogo: 'https://images.unsplash.com/photo-1520975867597-0f4c3b7ae441?w=200&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop',
    expectedPrice: 850,
    launchDate: '2024-11-20',
    launchDateFormatted: 'Nov 20, 2024',
    category: 'Seeds',
    description: 'New drought-resistant hybrid variety with 40% higher yield potential.',
    features: ['Drought resistant', '40% higher yield', 'Disease resistant', '90-day maturity'],
    preOrderCount: 324,
    isHot: true,
  },
  {
    id: 'up3',
    name: 'Solar-Powered Water Pump',
    vendor: 'GreenEnergy Solutions',
    vendorLogo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=800&auto=format&fit=crop',
    expectedPrice: 45000,
    launchDate: '2024-12-01',
    launchDateFormatted: 'Dec 1, 2024',
    category: 'Equipment',
    description: 'Zero-cost operation water pump powered entirely by solar energy.',
    features: ['100% solar powered', '5000L/hour capacity', 'Auto-start system', '5-year warranty'],
    preOrderCount: 89,
    isHot: false,
  },
  {
    id: 'up4',
    name: 'Organic Fertilizer - BioGrow',
    vendor: 'Organic Farms Ltd',
    vendorLogo: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop',
    expectedPrice: 1200,
    launchDate: '2024-12-10',
    launchDateFormatted: 'Dec 10, 2024',
    category: 'Fertilizers',
    description: 'Premium organic fertilizer made from locally sourced materials.',
    features: ['100% organic', 'Slow release', 'Soil enriching', 'Eco-friendly packaging'],
    preOrderCount: 210,
    isHot: false,
  },
  {
    id: 'up5',
    name: 'Smart Greenhouse Kit',
    vendor: 'ModernFarm Tech',
    vendorLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
    expectedPrice: 125000,
    launchDate: '2024-12-20',
    launchDateFormatted: 'Dec 20, 2024',
    category: 'Equipment',
    description: 'Complete smart greenhouse solution with automated climate control.',
    features: ['Auto temperature control', 'Smart irrigation', 'Mobile app control', 'Weather sensors'],
    preOrderCount: 45,
    isHot: true,
  },
];

export default function UpcomingProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notifiedProducts, setNotifiedProducts] = useState<string[]>([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const categories = useMemo(() => {
    const cats = new Set(mockUpcomingProducts.map(p => p.category));
    return Array.from(cats);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return mockUpcomingProducts;
    return mockUpcomingProducts.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const getDaysUntilLaunch = useCallback((launchDate: string) => {
    const today = new Date();
    const launch = new Date(launchDate);
    const diffTime = launch.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const handleNotifyMe = useCallback((product: UpcomingProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (notifiedProducts.includes(product.id)) {
      setNotifiedProducts(prev => prev.filter(id => id !== product.id));
    } else {
      setNotifiedProducts(prev => [...prev, product.id]);
    }
  }, [notifiedProducts]);

  const handleProductPress = useCallback((product: UpcomingProduct) => {
    router.push({ pathname: '/(tabs)/product/[id]', params: { id: product.id } });
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Package size={22} color={GREEN} />
          <Text style={styles.headerTitle}>Coming Soon</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Sparkles size={28} color={WHITE} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>New Products Launching</Text>
            <Text style={styles.heroSubtitle}>Be the first to know about exciting new arrivals</Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{mockUpcomingProducts.length}</Text>
            <Text style={styles.heroStatLabel}>Products</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{mockUpcomingProducts.reduce((acc, p) => acc + p.preOrderCount, 0)}</Text>
            <Text style={styles.heroStatLabel}>Pre-orders</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterPill, selectedCategory === '' && styles.filterPillActive]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.filterPillText, selectedCategory === '' && styles.filterPillTextActive]}>
              All Products
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

      {/* Products List */}
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {filteredProducts.map((product, index) => {
          const daysLeft = getDaysUntilLaunch(product.launchDate);
          const isNotified = notifiedProducts.includes(product.id);
          
          return (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              onPress={() => handleProductPress(product)}
              activeOpacity={0.9}
            >
              {/* Product Image */}
              <View style={styles.productImageContainer}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.imageOverlay} />
                
                {/* Hot Badge */}
                {product.isHot && (
                  <View style={styles.hotBadge}>
                    <Sparkles size={12} color={WHITE} />
                    <Text style={styles.hotBadgeText}>HOT</Text>
                  </View>
                )}

                {/* Launch Countdown */}
                <View style={styles.countdownBadge}>
                  <Clock size={14} color={WHITE} />
                  <Text style={styles.countdownText}>
                    {daysLeft > 0 ? `${daysLeft} days` : 'Launching today!'}
                  </Text>
                </View>

                {/* Category */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{product.category}</Text>
                </View>
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                {/* Vendor */}
                <View style={styles.vendorRow}>
                  <Image source={{ uri: product.vendorLogo }} style={styles.vendorLogo} />
                  <Text style={styles.vendorName}>{product.vendor}</Text>
                  <View style={styles.vendorRating}>
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <Text style={styles.vendorRatingText}>4.8</Text>
                  </View>
                </View>

                {/* Product Name */}
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>

                {/* Features */}
                <View style={styles.featuresRow}>
                  {product.features.slice(0, 2).map((feature, idx) => (
                    <View key={idx} style={styles.featurePill}>
                      <Text style={styles.featurePillText}>{feature}</Text>
                    </View>
                  ))}
                  {product.features.length > 2 && (
                    <Text style={styles.moreFeatures}>+{product.features.length - 2} more</Text>
                  )}
                </View>

                {/* Launch Date & Price */}
                <View style={styles.launchRow}>
                  <View style={styles.launchInfo}>
                    <Calendar size={14} color="#6B7280" />
                    <Text style={styles.launchDate}>{product.launchDateFormatted}</Text>
                  </View>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Expected Price</Text>
                    <Text style={styles.priceValue}>KES {product.expectedPrice.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Pre-order Count & Actions */}
                <View style={styles.actionsRow}>
                  <View style={styles.preOrderInfo}>
                    <Text style={styles.preOrderCount}>{product.preOrderCount}</Text>
                    <Text style={styles.preOrderLabel}>pre-orders</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.notifyButton, isNotified && styles.notifyButtonActive]}
                      onPress={() => handleNotifyMe(product)}
                    >
                      <Bell size={18} color={isNotified ? GREEN : '#6B7280'} fill={isNotified ? GREEN : 'transparent'} />
                      <Text style={[styles.notifyButtonText, isNotified && styles.notifyButtonTextActive]}>
                        {isNotified ? 'Notified' : 'Notify Me'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.detailsButton}>
                      <Text style={styles.detailsButtonText}>Details</Text>
                      <ChevronRight size={16} color={WHITE} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No upcoming products</Text>
            <Text style={styles.emptyStateSubtext}>Check back soon for new arrivals</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
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
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  heroBanner: {
    backgroundColor: GREEN,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: WHITE,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterContainer: {
    backgroundColor: WHITE,
    paddingVertical: 12,
    marginTop: 12,
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
  scrollView: {
    flex: 1,
  },
  productsContainer: {
    padding: 16,
    gap: 16,
  },
  productCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImageContainer: {
    height: 180,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  hotBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  countdownBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },
  productInfo: {
    padding: 16,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  vendorLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  vendorName: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  vendorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorRatingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  featurePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featurePillText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  moreFeatures: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '600',
    alignSelf: 'center',
  },
  launchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  launchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  launchDate: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preOrderInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  preOrderCount: {
    fontSize: 18,
    fontWeight: '800',
    color: ORANGE,
  },
  preOrderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  notifyButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  notifyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  notifyButtonTextActive: {
    color: GREEN,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
