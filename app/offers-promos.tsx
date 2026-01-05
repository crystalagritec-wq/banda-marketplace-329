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
  Gift,
  Clock,
  Star,
  ShoppingBag,
  Award,
  ChevronRight,
  Sparkles,
  Percent,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface PromoItem {
  id: string;
  vendor: string;
  logo: string;
  title: string;
  description: string;
  expiry: string;
  expiryDate: string;
  discount: string;
  minPurchase?: number;
  category: string;
  featured: boolean;
  claimedCount: number;
  maxClaims: number;
  rating: number;
  reviews: number;
}

const mockPromos: PromoItem[] = [
  {
    id: 'p1',
    vendor: 'GreenFarm Ltd',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    title: 'Free Delivery Over KES 2,000',
    description: 'Get free delivery on all farm inputs and equipment when you spend KES 2,000 or more. Valid for all locations within 50km radius.',
    expiry: 'Oct 30',
    expiryDate: '2024-10-30',
    discount: 'Free Delivery',
    minPurchase: 2000,
    category: 'Delivery',
    featured: true,
    claimedCount: 234,
    maxClaims: 500,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: 'p2',
    vendor: 'AgriHub Kenya',
    logo: 'https://images.unsplash.com/photo-1520975867597-0f4c3b7ae441?w=200&auto=format&fit=crop',
    title: 'KES 100 Welcome Voucher',
    description: 'New customers get KES 100 off their first purchase. Perfect for trying our premium seeds and fertilizers.',
    expiry: 'Nov 12',
    expiryDate: '2024-11-12',
    discount: 'KES 100 OFF',
    category: 'Discount',
    featured: true,
    claimedCount: 89,
    maxClaims: 200,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: 'p3',
    vendor: 'FarmTech Solutions',
    logo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&auto=format&fit=crop',
    title: '20% Off Smart Irrigation',
    description: 'Upgrade to smart irrigation systems with 20% discount. Includes installation and 1-year warranty.',
    expiry: 'Nov 25',
    expiryDate: '2024-11-25',
    discount: '20% OFF',
    minPurchase: 5000,
    category: 'Equipment',
    featured: false,
    claimedCount: 45,
    maxClaims: 100,
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 'p4',
    vendor: 'Organic Seeds Co.',
    logo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&auto=format&fit=crop',
    title: 'Buy 2 Get 1 Free Seeds',
    description: 'Special offer on certified organic seeds. Buy any 2 seed packets and get the 3rd one absolutely free.',
    expiry: 'Dec 5',
    expiryDate: '2024-12-05',
    discount: 'Buy 2 Get 1',
    category: 'Seeds',
    featured: false,
    claimedCount: 167,
    maxClaims: 300,
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 'p5',
    vendor: 'Livestock Care Plus',
    logo: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=200&auto=format&fit=crop',
    title: 'Free Vet Consultation',
    description: 'Book a free veterinary consultation for your livestock. Includes basic health check and vaccination advice.',
    expiry: 'Dec 15',
    expiryDate: '2024-12-15',
    discount: 'Free Service',
    category: 'Services',
    featured: true,
    claimedCount: 78,
    maxClaims: 150,
    rating: 4.8,
    reviews: 98,
  },
];

export default function OffersPromosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [claimedOffers, setClaimedOffers] = useState<string[]>([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const categories = useMemo(() => {
    const cats = new Set(mockPromos.map(p => p.category));
    return Array.from(cats);
  }, []);

  const filteredPromos = useMemo(() => {
    let filtered = mockPromos;
    
    if (selectedCategory) {
      filtered = filtered.filter(promo => promo.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [selectedCategory]);

  const handleOfferPress = useCallback((promo: PromoItem) => {
    router.push({ pathname: '/offer/[offerId]', params: { offerId: promo.id } });
  }, [router]);

  const handleClaimOffer = useCallback((promo: PromoItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!claimedOffers.includes(promo.id)) {
      setClaimedOffers(prev => [...prev, promo.id]);
    }
  }, [claimedOffers]);

  const getDaysUntilExpiry = useCallback((expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  const getProgressPercentage = useCallback((claimed: number, max: number) => {
    return Math.min((claimed / max) * 100, 100);
  }, []);

  const totalSavings = useMemo(() => {
    return mockPromos.reduce((acc, p) => acc + p.claimedCount * 100, 0);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={ORANGE} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Gift size={22} color={ORANGE} />
          <Text style={styles.headerTitle}>Offers & Promos</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Sparkles size={28} color={WHITE} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Exclusive Deals Await!</Text>
            <Text style={styles.heroSubtitle}>Save big on farm supplies and services</Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{mockPromos.length}</Text>
            <Text style={styles.heroStatLabel}>Active Offers</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{mockPromos.filter(p => p.featured).length}</Text>
            <Text style={styles.heroStatLabel}>Featured</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>KES {(totalSavings / 1000).toFixed(0)}K+</Text>
            <Text style={styles.heroStatLabel}>Saved</Text>
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
              All Offers
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

      {/* Promos List */}
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.promosContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {filteredPromos.map((promo) => {
          const daysLeft = getDaysUntilExpiry(promo.expiryDate);
          const isExpiringSoon = daysLeft <= 3;
          const isClaimed = claimedOffers.includes(promo.id);
          const progressPercent = getProgressPercentage(promo.claimedCount, promo.maxClaims);
          
          return (
            <TouchableOpacity 
              key={promo.id} 
              style={[
                styles.promoCard,
                promo.featured && styles.promoCardFeatured,
                isExpiringSoon && styles.promoCardExpiring
              ]}
              onPress={() => handleOfferPress(promo)}
              activeOpacity={0.9}
            >
              {/* Badges */}
              {promo.featured && (
                <View style={styles.featuredBadge}>
                  <Award size={12} color={ORANGE} />
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
              )}
              
              {isExpiringSoon && (
                <View style={styles.expiringBadge}>
                  <Clock size={12} color={WHITE} />
                  <Text style={styles.expiringBadgeText}>Expires Soon!</Text>
                </View>
              )}

              {/* Main Content */}
              <View style={styles.promoContent}>
                {/* Vendor Logo */}
                <Image source={{ uri: promo.logo }} style={styles.vendorLogo} />
                
                <View style={styles.promoInfo}>
                  {/* Vendor Name & Rating */}
                  <View style={styles.vendorRow}>
                    <Text style={styles.vendorName}>{promo.vendor}</Text>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#FCD34D" fill="#FCD34D" />
                      <Text style={styles.ratingText}>{promo.rating}</Text>
                    </View>
                  </View>

                  {/* Title & Description */}
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoDescription} numberOfLines={2}>{promo.description}</Text>
                  
                  {/* Discount Badge */}
                  <View style={styles.discountRow}>
                    <View style={styles.discountBadge}>
                      <Percent size={14} color={WHITE} />
                      <Text style={styles.discountText}>{promo.discount}</Text>
                    </View>
                    {promo.minPurchase && (
                      <Text style={styles.minPurchaseText}>
                        Min. KES {promo.minPurchase.toLocaleString()}
                      </Text>
                    )}
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>{promo.claimedCount} claimed</Text>
                      <Text style={styles.progressRemaining}>{promo.maxClaims - promo.claimedCount} left</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <Animated.View 
                        style={[styles.progressFill, { width: `${progressPercent}%` }]} 
                      />
                    </View>
                  </View>

                  {/* Expiry Info */}
                  <View style={styles.expiryRow}>
                    <Clock size={14} color={isExpiringSoon ? '#EF4444' : '#6B7280'} />
                    <Text style={[styles.expiryText, isExpiringSoon && styles.expiryTextUrgent]}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.promoActions}>
                    <TouchableOpacity 
                      style={[styles.claimButton, isClaimed && styles.claimButtonClaimed]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleClaimOffer(promo);
                      }}
                      disabled={isClaimed || daysLeft <= 0}
                    >
                      <Gift size={16} color={isClaimed ? GREEN : WHITE} />
                      <Text style={[styles.claimButtonText, isClaimed && styles.claimButtonTextClaimed]}>
                        {isClaimed ? 'Claimed' : 'Claim'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.shopButton}>
                      <ShoppingBag size={16} color={WHITE} />
                      <Text style={styles.shopButtonText}>Shop</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.detailsButton}>
                      <ChevronRight size={20} color={GREEN} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredPromos.length === 0 && (
          <View style={styles.emptyState}>
            <Gift size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No offers found</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
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
    backgroundColor: '#FFF7ED',
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
    backgroundColor: ORANGE,
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
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
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
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
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
    backgroundColor: '#FFF7ED',
    borderColor: ORANGE,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: ORANGE,
  },
  scrollView: {
    flex: 1,
  },
  promosContainer: {
    padding: 16,
    gap: 16,
  },
  promoCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  promoCardFeatured: {
    borderWidth: 2,
    borderColor: ORANGE,
  },
  promoCardExpiring: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  featuredBadgeText: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '700',
  },
  expiringBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  expiringBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  promoContent: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 20,
  },
  vendorLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  promoInfo: {
    flex: 1,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vendorName: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  promoDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  minPurchaseText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  progressSection: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressRemaining: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 2,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  expiryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  expiryTextUrgent: {
    color: '#EF4444',
  },
  promoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  claimButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  claimButtonClaimed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: GREEN,
  },
  claimButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
  claimButtonTextClaimed: {
    color: GREEN,
  },
  shopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  shopButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
  detailsButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
