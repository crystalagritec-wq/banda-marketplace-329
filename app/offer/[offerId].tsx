import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Share,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Share2,
  Heart,
  Gift,
  CheckCircle,
  Copy,
  ShoppingBag,
  Star,
  Users,
  Tag,
  Percent,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface PromoItem {
  id: string;
  vendor: string;
  vendorLogo: string;
  vendorRating: number;
  vendorReviews: number;
  title: string;
  description: string;
  longDescription: string;
  expiry: string;
  expiryDate: string;
  discount: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed' | 'freebie';
  minPurchase?: number;
  maxDiscount?: number;
  category: string;
  featured: boolean;
  claimedCount: number;
  maxClaims: number;
  code: string;
  terms: string[];
  applicableProducts: string[];
  banner: string;
}

const mockPromos: Record<string, PromoItem> = {
  'p1': {
    id: 'p1',
    vendor: 'GreenFarm Ltd',
    vendorLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    vendorRating: 4.8,
    vendorReviews: 234,
    title: 'Free Delivery Over KES 2,000',
    description: 'Get free delivery on all farm inputs and equipment when you spend KES 2,000 or more.',
    longDescription: 'Enjoy complimentary delivery on all orders above KES 2,000. This exclusive offer applies to our entire catalog of farm inputs, seeds, fertilizers, and equipment. Valid for all locations within 50km radius of our distribution centers in Nairobi, Mombasa, and Kisumu.',
    expiry: 'Oct 30',
    expiryDate: '2024-10-30',
    discount: 'Free Delivery',
    discountValue: 100,
    discountType: 'freebie',
    minPurchase: 2000,
    category: 'Delivery',
    featured: true,
    claimedCount: 234,
    maxClaims: 500,
    code: 'FREEDEL2K',
    terms: [
      'Valid on orders above KES 2,000',
      'Delivery within 50km radius only',
      'Cannot be combined with other offers',
      'Valid until October 30, 2024',
      'One use per customer',
    ],
    applicableProducts: ['Seeds', 'Fertilizers', 'Farm Tools', 'Equipment'],
    banner: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
  },
  'p2': {
    id: 'p2',
    vendor: 'AgriHub Kenya',
    vendorLogo: 'https://images.unsplash.com/photo-1520975867597-0f4c3b7ae441?w=200&auto=format&fit=crop',
    vendorRating: 4.6,
    vendorReviews: 156,
    title: 'KES 100 Welcome Voucher',
    description: 'New customers get KES 100 off their first purchase.',
    longDescription: 'Welcome to AgriHub Kenya! As a new customer, enjoy KES 100 off your very first order. Perfect for trying our premium selection of certified seeds, organic fertilizers, and quality farm supplies. Start your farming journey with savings!',
    expiry: 'Nov 12',
    expiryDate: '2024-11-12',
    discount: 'KES 100 OFF',
    discountValue: 100,
    discountType: 'fixed',
    category: 'Discount',
    featured: true,
    claimedCount: 89,
    maxClaims: 200,
    code: 'WELCOME100',
    terms: [
      'For new customers only',
      'Valid on first purchase',
      'No minimum order required',
      'Valid until November 12, 2024',
      'Cannot be combined with other vouchers',
    ],
    applicableProducts: ['All Products'],
    banner: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop',
  },
  'p3': {
    id: 'p3',
    vendor: 'FarmTech Solutions',
    vendorLogo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&auto=format&fit=crop',
    vendorRating: 4.9,
    vendorReviews: 312,
    title: '20% Off Smart Irrigation',
    description: 'Upgrade to smart irrigation systems with 20% discount.',
    longDescription: 'Transform your farm with cutting-edge smart irrigation technology. Our automated systems help you save water, reduce labor costs, and maximize crop yields. This limited-time offer includes professional installation and a comprehensive 1-year warranty on all components.',
    expiry: 'Nov 25',
    expiryDate: '2024-11-25',
    discount: '20% OFF',
    discountValue: 20,
    discountType: 'percentage',
    minPurchase: 5000,
    maxDiscount: 10000,
    category: 'Equipment',
    featured: false,
    claimedCount: 45,
    maxClaims: 100,
    code: 'SMART20',
    terms: [
      'Minimum purchase of KES 5,000',
      'Maximum discount of KES 10,000',
      'Includes free installation',
      '1-year warranty included',
      'Valid until November 25, 2024',
    ],
    applicableProducts: ['Drip Irrigation', 'Sprinklers', 'Smart Controllers', 'Sensors'],
    banner: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop',
  },
};

export default function OfferDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  
  const [isClaimed, setIsClaimed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  const promo = mockPromos[offerId || 'p1'] || mockPromos['p1'];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(countdownAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(countdownAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [countdownAnim]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

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

  const handleClaim = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsClaimed(true);
  }, []);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleCopyCode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, []);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out this offer: ${promo.title} from ${promo.vendor}! Use code ${promo.code} to save. Expires ${promo.expiry}.`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [promo]);

  const handleShopNow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/marketplace');
  }, [router]);

  const daysLeft = getDaysUntilExpiry(promo.expiryDate);
  const isExpiringSoon = daysLeft <= 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.animatedHeaderTitle} numberOfLines={1}>{promo.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={22} color={WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Fixed Back Button */}
      <TouchableOpacity 
        style={[styles.floatingBackButton, { top: insets.top + 12 }]} 
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={WHITE} />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Animated.View style={[styles.heroContainer, { transform: [{ scale: imageScale }] }]}>
          <Image source={{ uri: promo.banner }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          {/* Discount Badge */}
          <View style={styles.discountBadgeLarge}>
            <Percent size={20} color={WHITE} />
            <Text style={styles.discountBadgeText}>{promo.discount}</Text>
          </View>

          {promo.featured && (
            <View style={styles.featuredBadge}>
              <Sparkles size={14} color={ORANGE} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}

          <View style={styles.heroActions}>
            <TouchableOpacity 
              style={[styles.heroActionButton, isFavorite && styles.heroActionButtonActive]} 
              onPress={handleFavorite}
            >
              <Heart size={20} color={isFavorite ? '#EF4444' : WHITE} fill={isFavorite ? '#EF4444' : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroActionButton} onPress={handleShare}>
              <Share2 size={20} color={WHITE} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Vendor Info */}
          <TouchableOpacity style={styles.vendorCard}>
            <Image source={{ uri: promo.vendorLogo }} style={styles.vendorLogo} />
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{promo.vendor}</Text>
              <View style={styles.vendorRating}>
                <Star size={14} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.vendorRatingText}>{promo.vendorRating}</Text>
                <Text style={styles.vendorReviews}>({promo.vendorReviews} reviews)</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.promoTitle}>{promo.title}</Text>
            <Text style={styles.promoDescription}>{promo.longDescription}</Text>
          </View>

          {/* Urgency Banner */}
          <Animated.View 
            style={[
              styles.urgencyBanner, 
              isExpiringSoon && styles.urgencyBannerUrgent,
              { transform: [{ scale: isExpiringSoon ? countdownAnim : 1 }] }
            ]}
          >
            <Clock size={18} color={isExpiringSoon ? '#EF4444' : ORANGE} />
            <Text style={[styles.urgencyText, isExpiringSoon && styles.urgencyTextUrgent]}>
              {daysLeft > 0 ? `${daysLeft} days left to claim this offer!` : 'Offer expired'}
            </Text>
          </Animated.View>

          {/* Promo Code */}
          <View style={styles.codeSection}>
            <Text style={styles.sectionTitle}>Promo Code</Text>
            <View style={styles.codeCard}>
              <View style={styles.codeLeft}>
                <Tag size={20} color={GREEN} />
                <Text style={styles.codeText}>{promo.code}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.copyButton, codeCopied && styles.copyButtonCopied]} 
                onPress={handleCopyCode}
              >
                {codeCopied ? (
                  <>
                    <CheckCircle size={16} color={GREEN} />
                    <Text style={styles.copyButtonTextCopied}>Copied!</Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color={WHITE} />
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Offer Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offer Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <View style={[styles.detailIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Percent size={18} color={GREEN} />
                </View>
                <Text style={styles.detailLabel}>Discount</Text>
                <Text style={styles.detailValue}>{promo.discount}</Text>
              </View>
              
              {promo.minPurchase && (
                <View style={styles.detailCard}>
                  <View style={[styles.detailIcon, { backgroundColor: '#FEF3C7' }]}>
                    <ShoppingBag size={18} color={ORANGE} />
                  </View>
                  <Text style={styles.detailLabel}>Min. Purchase</Text>
                  <Text style={styles.detailValue}>KES {promo.minPurchase.toLocaleString()}</Text>
                </View>
              )}
              
              {promo.maxDiscount && (
                <View style={styles.detailCard}>
                  <View style={[styles.detailIcon, { backgroundColor: '#EDE9FE' }]}>
                    <Gift size={18} color="#7C3AED" />
                  </View>
                  <Text style={styles.detailLabel}>Max. Savings</Text>
                  <Text style={styles.detailValue}>KES {promo.maxDiscount.toLocaleString()}</Text>
                </View>
              )}
              
              <View style={styles.detailCard}>
                <View style={[styles.detailIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Clock size={18} color="#EF4444" />
                </View>
                <Text style={styles.detailLabel}>Expires</Text>
                <Text style={styles.detailValue}>{promo.expiry}</Text>
              </View>
            </View>
          </View>

          {/* Claims Progress */}
          <View style={styles.section}>
            <View style={styles.claimsHeader}>
              <Text style={styles.sectionTitle}>Claims</Text>
              <View style={styles.claimsCount}>
                <Users size={14} color="#6B7280" />
                <Text style={styles.claimsCountText}>{promo.claimedCount} claimed</Text>
              </View>
            </View>
            <View style={styles.progressBarLarge}>
              <View 
                style={[
                  styles.progressFillLarge, 
                  { width: `${getProgressPercentage(promo.claimedCount, promo.maxClaims)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {promo.maxClaims - promo.claimedCount} remaining out of {promo.maxClaims} total
            </Text>
          </View>

          {/* Applicable Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Applicable Products</Text>
            <View style={styles.productsGrid}>
              {promo.applicableProducts.map((product, index) => (
                <View key={index} style={styles.productPill}>
                  <Text style={styles.productPillText}>{product}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <View style={styles.termsList}>
              {promo.terms.map((term, index) => (
                <View key={index} style={styles.termItem}>
                  <View style={styles.termBullet}>
                    <AlertCircle size={14} color="#6B7280" />
                  </View>
                  <Text style={styles.termText}>{term}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 140 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.claimButton, isClaimed && styles.claimButtonClaimed]}
          onPress={handleClaim}
          disabled={isClaimed || daysLeft <= 0}
        >
          {isClaimed ? (
            <>
              <CheckCircle size={22} color={GREEN} />
              <Text style={styles.claimButtonTextClaimed}>Offer Claimed</Text>
            </>
          ) : (
            <>
              <Gift size={22} color={WHITE} />
              <Text style={styles.claimButtonText}>Claim Offer</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shopButton} onPress={handleShopNow}>
          <ShoppingBag size={22} color={WHITE} />
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: ORANGE,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerBackButton: {
    padding: 4,
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  discountBadgeLarge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: ORANGE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountBadgeText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '800',
  },
  featuredBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredText: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: '700',
  },
  heroActions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  heroActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActionButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  content: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 20,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    gap: 12,
  },
  vendorLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  vendorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  vendorReviews: {
    fontSize: 12,
    color: '#6B7280',
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  promoDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 23,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  urgencyBannerUrgent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '700',
    color: ORANGE,
  },
  urgencyTextUrgent: {
    color: '#EF4444',
  },
  codeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: GREEN,
    borderStyle: 'dashed',
  },
  codeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  copyButtonCopied: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: GREEN,
  },
  copyButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  copyButtonTextCopied: {
    color: GREEN,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  claimsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  claimsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  claimsCountText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressBarLarge: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  productPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: WHITE,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  claimButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  claimButtonClaimed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: GREEN,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  claimButtonTextClaimed: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  shopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
});
