import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Share2,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
  Store,
  Package,
  Heart,
  ShoppingCart,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useLocation } from '@/providers/location-provider';
import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';
import { GeoCoordinates } from '@/constants/products';

const GREEN = '#2E7D32' as const;
const WHITE = '#FFFFFF' as const;

export default function VendorStorefrontScreen() {
  const insets = useSafeAreaInsets();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const { userLocation } = useLocation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const vendorProfileQuery = trpc.shop.getVendorProfile.useQuery(
    { vendorId: vendorId || '' },
    { enabled: !!vendorId }
  );

  const vendorProductsQuery = trpc.shop.getVendorProducts.useQuery(
    {
      vendorId: vendorId || '',
      userLocation: userLocation?.coordinates,
      category: selectedCategory || undefined,
    },
    { enabled: !!vendorId }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      vendorProfileQuery.refetch(),
      vendorProductsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${vendorProfileQuery.data?.profile.vendor_name || vendorProfileQuery.data?.profile.name || 'this shop'} on Banda! 🛒\n\nView their products and more.`,
        url: `banda://vendor/${vendorId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToCart = (product: any) => {
    const defaultCoordinates: GeoCoordinates = { lat: -1.286389, lng: 36.817223 };
    const coordinates: GeoCoordinates = 
      product.location_lat && product.location_lng
        ? { lat: product.location_lat, lng: product.location_lng }
        : defaultCoordinates;

    addToCart(
      {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.images?.[0] || 'https://via.placeholder.com/150',
        vendor: product.vendor_name,
        location: product.location_city || product.location_county || 'Kenya',
        unit: product.unit || 'unit',
        inStock: product.stock > 0,
        category: product.category,
        rating: 4.5,
        vendorVerified: true,
        negotiable: product.negotiable,
        fastDelivery: false,
        coordinates,
      },
      1
    );
  };

  if (vendorProfileQuery.isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Loading shop...</Text>
      </View>
    );
  }

  if (vendorProfileQuery.error || !vendorProfileQuery.data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Store size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vendor = vendorProfileQuery.data;
  const products = vendorProductsQuery.data?.products || [];
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={GREEN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share2 size={24} color={GREEN} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.vendorHeader}>
            <View style={styles.vendorAvatar}>
              <Store size={32} color={GREEN} />
            </View>
            <View style={styles.vendorInfo}>
              <View style={styles.vendorNameRow}>
                <Text style={styles.vendorName}>{vendor.profile.vendor_name || vendor.profile.name}</Text>
                {vendor.profile.verified && (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={16} color="#10B981" />
                  </View>
                )}
              </View>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.locationText}>
                  {vendor.profile.location_city && vendor.profile.location_county
                    ? `${vendor.profile.location_city}, ${vendor.profile.location_county}`
                    : vendor.profile.location || 'Kenya'}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Package size={14} color={GREEN} />
                  <Text style={styles.statText}>{products.length} Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Star size={14} color="#F59E0B" />
                  <Text style={styles.statText}>{vendor.stats.rating} Rating</Text>
                </View>
              </View>
            </View>
          </View>

          {vendor.profile.phone && (
            <View style={styles.contactSection}>
              <TouchableOpacity style={styles.contactButton}>
                <Phone size={20} color={GREEN} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MessageCircle size={20} color={GREEN} />
                <Text style={styles.contactButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          )}

          {categories.length > 0 && (
            <View style={styles.categoriesSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === '' && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === '' && styles.categoryChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
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
                        selectedCategory === category &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>
              Products ({products.length})
            </Text>
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() =>
                    router.push(`/(tabs)/product/${product.id}` as any)
                  }
                >
                  <Image
                    source={{
                      uri:
                        product.images?.[0] ||
                        'https://via.placeholder.com/150',
                    }}
                    style={styles.productImage}
                  />
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleWishlist(product.id)}
                  >
                    <Heart
                      size={16}
                      color={isInWishlist(product.id) ? '#DC2626' : '#666'}
                      fill={isInWishlist(product.id) ? '#DC2626' : 'transparent'}
                    />
                  </TouchableOpacity>
                  <View style={styles.productInfo}>
                    <Text numberOfLines={2} style={styles.productName}>
                      {product.title}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        KSh {product.price.toLocaleString()}
                      </Text>
                      <Text style={styles.productUnit}>/{product.unit}</Text>
                    </View>
                    {product.distanceKm !== null &&
                      product.distanceKm !== undefined && (
                        <View style={styles.distanceRow}>
                          <MapPin size={10} color="#6B7280" />
                          <Text style={styles.distanceText}>
                            {product.distanceKm.toFixed(1)} km away
                          </Text>
                        </View>
                      )}
                    <TouchableOpacity
                      style={styles.addToCartButton}
                      onPress={() => handleAddToCart(product)}
                    >
                      <ShoppingCart size={14} color={WHITE} />
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {products.length === 0 && (
              <View style={styles.emptyState}>
                <Package size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No products yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  This shop has not listed any products yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: GREEN,
    borderRadius: 8,
  },
  backButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  vendorHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 16,
  },
  vendorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInfo: {
    flex: 1,
    gap: 8,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: WHITE,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: GREEN,
  },
  categoriesSection: {
    paddingVertical: 16,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
  },
  categoryChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: WHITE,
  },
  productsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: WHITE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 6,
  },
  productInfo: {
    padding: 12,
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  productUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: GREEN,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
