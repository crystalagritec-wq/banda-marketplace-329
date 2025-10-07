import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
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
} from 'lucide-react-native';

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
  claimed: boolean;
  claimedCount: number;
  maxClaims: number;
}

const mockPromos: PromoItem[] = [
  {
    id: 'p1',
    vendor: 'GreenFarm Ltd',
    logo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&auto=format&fit=crop',
    title: 'Free Delivery Over KES 2,000',
    description: 'Get free delivery on all farm inputs and equipment when you spend KES 2,000 or more. Valid for all locations within 50km radius.',
    expiry: 'Oct 30',
    expiryDate: '2024-10-30',
    discount: 'Free Delivery',
    minPurchase: 2000,
    category: 'Delivery',
    featured: true,
    claimed: false,
    claimedCount: 234,
    maxClaims: 500,
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
    claimed: false,
    claimedCount: 89,
    maxClaims: 200,
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
    claimed: false,
    claimedCount: 45,
    maxClaims: 100,
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
    claimed: false,
    claimedCount: 167,
    maxClaims: 300,
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
    claimed: false,
    claimedCount: 78,
    maxClaims: 150,
  },
];

export default function OffersPromosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [claimedOffers, setClaimedOffers] = useState<string[]>([]);

  const categories = useMemo(() => {
    const cats = new Set(mockPromos.map(p => p.category));
    return Array.from(cats);
  }, []);

  const filteredPromos = useMemo(() => {
    let filtered = mockPromos;
    
    if (selectedCategory) {
      filtered = filtered.filter(promo => promo.category === selectedCategory);
    }
    
    // Sort featured promos first, then by expiry date
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [selectedCategory]);

  const handleShopNow = useCallback((promo: PromoItem) => {
    Alert.alert(
      'Shop Now',
      `Redirecting to ${promo.vendor} store with your ${promo.discount} offer applied.`,
      [{ text: 'Continue', onPress: () => console.log(`Shopping at ${promo.vendor}`) }]
    );
  }, []);

  const handleClaimOffer = useCallback((promo: PromoItem) => {
    if (claimedOffers.includes(promo.id)) {
      Alert.alert('Already Claimed', `You have already claimed this offer from ${promo.vendor}`);
      return;
    }
    
    setClaimedOffers(prev => [...prev, promo.id]);
    Alert.alert(
      'Offer Claimed!',
      `${promo.title} has been added to your account. Use it before ${promo.expiry}.`,
      [{ text: 'OK' }]
    );
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
        <View style={styles.headerTitleContainer}>
          <Gift size={20} color={ORANGE} />
          <Text style={styles.headerTitle}>Offers & Promos</Text>
        </View>
        <View style={styles.headerSpacer} />
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.promosContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredPromos.map((promo) => {
          const daysLeft = getDaysUntilExpiry(promo.expiryDate);
          const isExpiringSoon = daysLeft <= 3;
          const isClaimed = claimedOffers.includes(promo.id);
          
          return (
            <View 
              key={promo.id} 
              style={[
                styles.promoCard,
                promo.featured && styles.promoCardFeatured,
                isExpiringSoon && styles.promoCardExpiring
              ]}
            >
              {/* Featured Badge */}
              {promo.featured && (
                <View style={styles.featuredBadge}>
                  <Award size={12} color={ORANGE} />
                  <Text style={styles.featuredBadgeText}>Featured by Vendor</Text>
                </View>
              )}
              
              {/* Expiring Soon Badge */}
              {isExpiringSoon && (
                <View style={styles.expiringBadge}>
                  <Clock size={12} color={WHITE} />
                  <Text style={styles.expiringBadgeText}>Expires Soon!</Text>
                </View>
              )}

              <View style={styles.promoContent}>
                {/* Vendor Logo */}
                <Image source={{ uri: promo.logo }} style={styles.vendorLogo} />
                
                <View style={styles.promoInfo}>
                  <Text style={styles.vendorName}>{promo.vendor}</Text>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoDescription}>{promo.description}</Text>
                  
                  {/* Discount Badge */}
                  <View style={styles.discountContainer}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{promo.discount}</Text>
                    </View>
                    {promo.minPurchase && (
                      <Text style={styles.minPurchaseText}>
                        Min. purchase: KES {promo.minPurchase.toLocaleString()}
                      </Text>
                    )}
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${getProgressPercentage(promo.claimedCount, promo.maxClaims)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {promo.claimedCount}/{promo.maxClaims} claimed
                    </Text>
                  </View>

                  {/* Expiry Info */}
                  <View style={styles.expiryContainer}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={[styles.expiryText, isExpiringSoon && styles.expiryTextUrgent]}>
                      {daysLeft > 0 ? `Expires in ${daysLeft} days` : 'Expired'}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.promoActions}>
                    <TouchableOpacity 
                      style={styles.shopButton}
                      onPress={() => handleShopNow(promo)}
                    >
                      <ShoppingBag size={14} color={WHITE} />
                      <Text style={styles.shopButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.claimButton,
                        isClaimed && styles.claimButtonClaimed
                      ]}
                      onPress={() => handleClaimOffer(promo)}
                      disabled={isClaimed || daysLeft <= 0}
                    >
                      <Text style={[
                        styles.claimButtonText,
                        isClaimed && styles.claimButtonTextClaimed
                      ]}>
                        {isClaimed ? 'Claimed ✓' : daysLeft <= 0 ? 'Expired' : 'Claim Offer'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Rating/Reviews */}
              <View style={styles.vendorRating}>
                <Star size={12} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.ratingText}>4.{Math.floor(Math.random() * 3) + 6}</Text>
                <Text style={styles.reviewCount}>({Math.floor(Math.random() * 200) + 50} reviews)</Text>
              </View>
            </View>
          );
        })}

        {filteredPromos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No offers found</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
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
    backgroundColor: '#FFF3E0',
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
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  promoCardFeatured: {
    borderWidth: 2,
    borderColor: ORANGE,
    elevation: 6,
    shadowOpacity: 0.15,
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
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  featuredBadgeText: {
    color: ORANGE,
    fontSize: 10,
    fontWeight: '700',
  },
  expiringBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  expiringBadgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  promoContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  vendorLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  promoInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  promoDescription: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  minPurchaseText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
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
  shopButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  shopButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  claimButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimButtonClaimed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: GREEN,
  },
  claimButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  claimButtonTextClaimed: {
    color: GREEN,
  },
  vendorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
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