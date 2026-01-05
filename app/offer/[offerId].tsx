import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Gift,
  Clock,
  Star,
  Share2,
  ShoppingBag,
  Award,
  Percent,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const GREEN = '#2E7D32' as const;
const WHITE = '#FFFFFF' as const;
const ORANGE = '#F57C00' as const;

interface PromoItem {
  id: string;
  vendor: string;
  vendorId: string;
  logo: string;
  coverImage: string;
  title: string;
  description: string;
  expiry: string;
  expiryDate: string;
  discount: string;
  minPurchase?: number;
  maxDiscount?: number;
  category: string;
  featured: boolean;
  claimedCount: number;
  maxClaims: number;
  rating: number;
  reviews: number;
  promoCode: string;
  terms: string[];
  howToUse: string[];
  validProducts: string[];
}

const mockPromos: Record<string, PromoItem> = {
  p1: {
    id: 'p1',
    vendor: 'GreenFarm Ltd',
    vendorId: 'vendor123',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop',
    title: 'Free Delivery Over KES 2,000',
    description: 'Get free delivery on all farm inputs and equipment when you spend KES 2,000 or more. Valid for all locations within 50km radius. This offer includes all categories of products including seeds, fertilizers, pesticides, and farming equipment.',
    expiry: 'Oct 30',
    expiryDate: '2024-10-30',
    discount: 'Free Delivery',
    minPurchase: 2000,
    maxDiscount: 500,
    category: 'Delivery',
    featured: true,
    claimedCount: 234,
    maxClaims: 500,
    rating: 4.8,
    reviews: 234,
    promoCode: 'FREEDEL2K',
    terms: [
      'Minimum purchase of KES 2,000 required',
      'Valid only within 50km radius',
      'Cannot be combined with other offers',
      'One-time use per customer',
      'Applies to standard delivery only',
    ],
    howToUse: [
      'Add items worth KES 2,000 or more to your cart',
      'Enter promo code FREEDEL2K at checkout',
      'Delivery fee will be automatically waived',
      'Complete your purchase',
    ],
    validProducts: [
      'All Seeds & Seedlings',
      'Farm Inputs',
      'Equipment & Machinery',
      'Irrigation Systems',
      'Pest Control Products',
    ],
  },
};

export default function OfferDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  
  const [isClaimed, setIsClaimed] = useState(false);

  const offer = useMemo(() => {
    return mockPromos[offerId as string] || mockPromos.p1;
  }, [offerId]);

  const getDaysUntilExpiry = useCallback(() => {
    const today = new Date();
    const expiry = new Date(offer.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [offer]);

  const daysLeft = getDaysUntilExpiry();
  const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;
  const progressPercent = Math.min((offer.claimedCount / offer.maxClaims) * 100, 100);

  const handleClaim = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsClaimed(true);
    Alert.alert(
      'Offer Claimed!',
      `Use code ${offer.promoCode} at checkout. The code has been copied to your clipboard.`,
      [{ text: 'OK' }]
    );
    Clipboard.setStringAsync(offer.promoCode);
  }, [offer.promoCode]);

  const handleCopyCode = useCallback(async () => {
    await Clipboard.setStringAsync(offer.promoCode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Copied!', 'Promo code copied to clipboard');
  }, [offer.promoCode]);

  const handleShopNow = useCallback(() => {
    router.push({ pathname: '/vendor/[vendorId]', params: { vendorId: offer.vendorId } });
  }, [router, offer.vendorId]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out this offer from ${offer.vendor}: ${offer.title}! Use code ${offer.promoCode}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [offer]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: offer.coverImage }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
        >
          <Share2 size={20} color={WHITE} />
        </TouchableOpacity>

        {/* Status Badges */}
        {offer.featured && (
          <View style={styles.featuredBadge}>
            <Award size={14} color={WHITE} />
            <Text style={styles.featuredBadgeText}>FEATURED</Text>
          </View>
        )}

        {isExpiringSoon && (
          <View style={styles.urgentBadge}>
            <AlertCircle size={14} color={WHITE} />
            <Text style={styles.urgentBadgeText}>EXPIRES SOON</Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Vendor Info */}
          <View style={styles.vendorRow}>
            <Image source={{ uri: offer.logo }} style={styles.vendorLogo} />
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{offer.vendor}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.ratingText}>{offer.rating}</Text>
                <Text style={styles.reviewsText}>({offer.reviews} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.vendorButton}>
              <Text style={styles.vendorButtonText}>Visit</Text>
              <ExternalLink size={14} color={GREEN} />
            </TouchableOpacity>
          </View>

          {/* Title & Category */}
          <Text style={styles.title}>{offer.title}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{offer.category}</Text>
          </View>

          {/* Discount Card */}
          <View style={styles.discountCard}>
            <View style={styles.discountHeader}>
              <Percent size={28} color={WHITE} />
              <Text style={styles.discountValue}>{offer.discount}</Text>
            </View>
            {offer.minPurchase && (
              <Text style={styles.discountCondition}>
                Min. purchase: KES {offer.minPurchase.toLocaleString()}
              </Text>
            )}
            {offer.maxDiscount && (
              <Text style={styles.discountCondition}>
                Max. discount: KES {offer.maxDiscount.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Promo Code */}
          <View style={styles.promoCodeSection}>
            <Text style={styles.sectionTitle}>Promo Code</Text>
            <View style={styles.promoCodeCard}>
              <Text style={styles.promoCode}>{offer.promoCode}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyCode}
              >
                <Copy size={18} color={GREEN} />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiry & Claims */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={20} color={isExpiringSoon ? '#EF4444' : '#6B7280'} />
              <Text style={styles.statLabel}>Expires In</Text>
              <Text style={[styles.statValue, isExpiringSoon && styles.statValueUrgent]}>
                {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Gift size={20} color={ORANGE} />
              <Text style={styles.statLabel}>Claimed</Text>
              <Text style={styles.statValue}>{offer.claimedCount}/{offer.maxClaims}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {offer.maxClaims - offer.claimedCount} claims remaining
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Offer</Text>
            <Text style={styles.description}>{offer.description}</Text>
          </View>

          {/* How to Use */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 size={20} color={GREEN} />
              <Text style={styles.sectionTitle}>How to Use</Text>
            </View>
            {offer.howToUse.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Valid Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShoppingBag size={20} color={ORANGE} />
              <Text style={styles.sectionTitle}>Valid Products</Text>
            </View>
            <View style={styles.productsGrid}>
              {offer.validProducts.map((product, index) => (
                <View key={index} style={styles.productTag}>
                  <Text style={styles.productTagText}>{product}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#6B7280" />
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            </View>
            {offer.terms.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <View style={styles.termBullet} />
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.claimButton, isClaimed && styles.claimButtonClaimed]}
          onPress={handleClaim}
          disabled={isClaimed || daysLeft <= 0}
        >
          <Gift size={20} color={isClaimed ? GREEN : WHITE} />
          <Text style={[styles.claimButtonText, isClaimed && styles.claimButtonTextClaimed]}>
            {isClaimed ? 'Claimed' : 'Claim Offer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shopButton}
          onPress={handleShopNow}
        >
          <ShoppingBag size={20} color={WHITE} />
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
  headerImageContainer: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 80,
    left: 16,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  urgentBadge: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainContent: {
    padding: 20,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  vendorLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewsText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  vendorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  vendorButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 34,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 20,
  },
  categoryTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: ORANGE,
  },
  discountCard: {
    backgroundColor: GREEN,
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  discountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: WHITE,
  },
  discountCondition: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  promoCodeSection: {
    marginBottom: 20,
  },
  promoCodeCard: {
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: GREEN,
    borderStyle: 'dashed',
  },
  promoCode: {
    fontSize: 24,
    fontWeight: '800',
    color: GREEN,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  statValueUrgent: {
    color: '#EF4444',
  },
  progressSection: {
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: WHITE,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  productTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: ORANGE,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginTop: 8,
    marginRight: 12,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  claimButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: ORANGE,
  },
  claimButtonClaimed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: GREEN,
  },
  claimButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: WHITE,
  },
  claimButtonTextClaimed: {
    color: GREEN,
  },
  shopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
  },
  shopButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: WHITE,
  },
});
