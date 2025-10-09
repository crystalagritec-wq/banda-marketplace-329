import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MapPin,
  ShoppingCart,
  Star,
  MessageCircle,
  Share2,
  Phone,
  Shield,
  Truck,
  Clock,
  Package,
  User,
  BadgeCheck,
  ChevronRight,
  MessageSquare,
  Activity,
  Award,
  Info,
  Calendar,
  TrendingUp,
  Zap,
  X,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Animated,
  PanResponder,
  Share,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { mockProducts, type Product, type VariantGroup, type VariantOption } from '@/constants/products';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/providers/cart-provider';
import { useWishlist } from '@/providers/wishlist-provider';
import ReviewsComponent from '@/components/ReviewsComponent';
import { useStorage } from '@/providers/storage-provider';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { trpc } from '@/lib/trpc';
import { useLoyalty } from '@/providers/loyalty-provider';
import CartFeedback from '@/components/CartFeedback';
import { useLocation } from '@/providers/location-provider';
import { calculateDistance } from '@/utils/geo-distance';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductChat from '@/components/ProductChat';
import ProductQA from '@/components/ProductQA';
import { useTheme } from '@/providers/theme-provider';



export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { points } = useLoyalty();
  const storage = useStorage();
  const network = useNetworkStatus();
  const theme = useTheme();

  const [quantity, setQuantity] = useState<number>(1);
  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [lazyReady, setLazyReady] = useState<boolean>(false);
  const [offlineProduct, setOfflineProduct] = useState<Product | null>(null);
  const [prefetchDone, setPrefetchDone] = useState<boolean>(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOption>>({});
  const [now, setNow] = useState<number>(Date.now());
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'add' | 'update' | 'remove' | 'success'>('add');
  const [feedbackCount, setFeedbackCount] = useState<number>(1);
  const lastProductRef = useRef<string>('');
  const countRef = useRef<number>(1);
  const { userLocation } = useLocation();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const imageScrollRef = useRef<ScrollView>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showImageGallery, setShowImageGallery] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showQA, setShowQA] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSpecs, setShowSpecs] = useState<boolean>(false);
  const [imageLoadProgress, setImageLoadProgress] = useState<number>(0);
  const [criticalContentLoaded, setCriticalContentLoaded] = useState<boolean>(false);


  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const [imageZoomed, setImageZoomed] = useState<boolean>(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setImageZoomed(true);
        Animated.spring(scale, { toValue: 1.8, useNativeDriver: true, tension: 40, friction: 7 }).start();
      },
      onPanResponderMove: (_, gesture) => {
        if (imageZoomed) {
          translateX.setValue(gesture.dx * 0.5);
          translateY.setValue(gesture.dy * 0.5);
        }
      },
      onPanResponderRelease: () => {
        setImageZoomed(false);
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 40, friction: 7 }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 40, friction: 7 }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 40, friction: 7 }),
        ]).start();
      },
    })
  ).current;

  const product: Product | undefined = useMemo(() => {
    console.log('[ProductDetails] resolving product for id', id);
    return mockProducts.find((p) => p.id === String(id));
  }, [id]);

  const isFavorite = useMemo(() => isInWishlist(String(id)), [isInWishlist, id]);

  const handleShare = async () => {
    const p = product ?? offlineProduct;
    if (!p) return;
    
    try {
      const result = await Share.share({
        message: `Check out ${p.name} on Banda Marketplace!\n\nPrice: KSh ${p.price.toLocaleString('en-KE')}/${p.unit}\nSeller: ${p.vendor}\nLocation: ${p.location}\n\nGet fresh produce delivered to your doorstep!`,
        title: p.name,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('[ProductDetails] Product shared successfully');
      }
    } catch (error) {
      console.error('[ProductDetails] Share error:', error);
      Alert.alert('Error', 'Failed to share product');
    }
  };

  const handleContact = () => {
    const vendor = product?.vendor ?? offlineProduct?.vendor ?? 'vendor';
    console.log('[ProductDetails] contact vendor', vendor);
    Alert.alert('Contact Vendor', `Contact ${vendor} directly`);
  };

  const handleAddToCart = () => {
    const p = product ?? offlineProduct;
    if (p) {
      console.log('[ProductDetails] add to cart', { id: p.id, quantity });
      addToCart(p, quantity);
      
      if (lastProductRef.current === p.id && feedbackVisible) {
        countRef.current += 1;
        setFeedbackCount(countRef.current);
        setFeedbackMessage(`${p.name} added to cart`);
        setFeedbackVisible(true);
      } else {
        countRef.current = 1;
        lastProductRef.current = p.id;
        setFeedbackCount(1);
        setFeedbackType('add');
        setFeedbackMessage(`${p.name} added to cart`);
        setFeedbackVisible(true);
      }
    } else {
      Alert.alert('Unavailable', 'Product data is not available. Please reconnect.');
    }
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const list = mockProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 8);
    console.log('[ProductDetails] related products size', list.length);
    return list;
  }, [product]);

  useEffect(() => {
    if (product) {
      const save = async () => {
        try {
          await storage.setItem('banda:lastProduct', JSON.stringify(product));
          console.log('[ProductDetails] cached product');
        } catch (e) {
          console.log('[ProductDetails] cache save error', e);
        }
      };
      save();
    } else {
      const load = async () => {
        try {
          const data = await storage.getItem('banda:lastProduct');
          if (data) {
            const parsed = JSON.parse(data) as Product;
            setOfflineProduct(parsed);
            console.log('[ProductDetails] loaded cached product');
          }
        } catch (e) {
          console.log('[ProductDetails] cache load error', e);
        }
      };
      load();
    }
  }, [product, storage]);

  useEffect(() => {
    setCriticalContentLoaded(true);
    const t = setTimeout(() => setLazyReady(true), 250);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (product && !prefetchDone) {
      relatedProducts.forEach((r) => {
        if (r.image) Image.prefetch(r.image).catch(() => {});
      });
      setPrefetchDone(true);
    }
  }, [product, relatedProducts, prefetchDone]);

  const current = product ?? offlineProduct ?? null;

  const distanceFromUser = useMemo(() => {
    if (!current?.coordinates || !userLocation?.coordinates) return null;
    const distance = calculateDistance(userLocation.coordinates, current.coordinates);
    return distance;
  }, [current?.coordinates, userLocation?.coordinates]);

  const variantGroups: VariantGroup[] = useMemo(() => current?.variants ?? [], [current?.variants]);

  const effectivePrice = useMemo(() => {
    if (!current) return 0;
    const mods = Object.values(selectedVariants).reduce((sum, opt) => sum + (opt.priceModifier ?? 0), 0);
    const base = current.price + mods;
    const fs = current.flashSale;
    const fsActive = fs ? new Date(fs.endsAt).getTime() > now : false;
    const discountPercent = fsActive ? fs!.discountPercent : current.discount ?? 0;
    const discounted = discountPercent ? Math.max(0, Math.round(base * (1 - discountPercent / 100))) : base;
    return discounted;
  }, [current, selectedVariants, now]);

  const flashRemaining = useMemo(() => {
    const fs = current?.flashSale;
    if (!fs) return null;
    const end = new Date(fs.endsAt).getTime();
    const diff = Math.max(0, end - now);
    if (diff <= 0) return 'Ended';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }, [current?.flashSale, now]);

  const marketAveragePrice = useMemo(() => {
    if (!current) return null;
    return Math.round(current.price * 1.15);
  }, [current?.price]);

  const isSuspiciousPrice = useMemo(() => {
    if (!current || !marketAveragePrice) return false;
    const deviation = Math.abs(current.price - marketAveragePrice) / marketAveragePrice;
    return deviation > 0.4;
  }, [current?.price, marketAveragePrice]);

  const productSpecs = useMemo(() => {
    if (!current) return [];
    return [
      { label: 'Category', value: current.category },
      { label: 'Unit', value: current.unit },
      { label: 'Location', value: current.location },
      { label: 'Vendor', value: current.vendor },
      { label: 'Stock Status', value: current.inStock ? 'In Stock' : 'Out of Stock' },
      { label: 'Delivery', value: current.fastDelivery ? 'Fast Delivery Available' : 'Standard Delivery' },
      { label: 'Negotiable', value: current.negotiable ? 'Yes' : 'Fixed Price' },
    ];
  }, [current]);

  const productTags = useMemo(() => {
    if (!current) return [];
    const tags = [current.category];
    if (current.vendorVerified) tags.push('Verified');
    if (current.fastDelivery) tags.push('Fast Delivery');
    if (current.negotiable) tags.push('Negotiable');
    if (current.discount) tags.push('On Sale');
    if (current.flashSale) tags.push('Flash Sale');
    return tags;
  }, [current]);

  const selectedOutOfStock = useMemo(() => {
    const options = Object.values(selectedVariants);
    if (options.length === 0) return false;
    return options.some((o) => (o.stock ?? 1) <= 0);
  }, [selectedVariants]);

  const productCountersQuery = trpc.analytics.getProductCounters.useQuery(
    current ? { productId: current.id } : undefined as unknown as { productId: string },
    { enabled: !!current, staleTime: 60_000 }
  );

  const viewsToday = useMemo<number>(() => {
    if (!current) return 0;
    const v = productCountersQuery.data?.viewsToday ?? 0;
    return v;
  }, [current?.id, productCountersQuery.data?.viewsToday]);

  const inCarts = useMemo<number>(() => {
    if (!current) return 0;
    const c = productCountersQuery.data?.inCarts ?? 0;
    return c;
  }, [current?.id, productCountersQuery.data?.inCarts]);

  const estimatedWeight = useMemo<number>(() => {
    if (!current) return 1;
    const unit = (current.unit || '').toLowerCase();
    if (unit.includes('kg')) return 5 * quantity;
    if (unit.includes('liter')) return 2 * quantity;
    if (unit.includes('piece') || unit.includes('bunch') || unit.includes('head')) return 1 * quantity;
    return 2 * quantity;
  }, [current?.unit, quantity]);

  const deliveryArea = useMemo<string>(() => current?.location ?? 'Nairobi', [current?.location]);

  const aiDeliveryQuery = trpc.checkout.getAIDeliveryOptions.useQuery(
    current
      ? {
          orderWeight: estimatedWeight,
          distance: 8,
          productCategories: [current.category],
          urgency: 'standard',
          orderValue: effectivePrice * quantity,
          deliveryArea,
        }
      : undefined as unknown as {
          orderWeight: number; distance: number; productCategories: string[]; urgency: 'standard' | 'express'; orderValue: number; deliveryArea: string;
        },
    {
      enabled: !!current,
      staleTime: 5 * 60 * 1000,
    }
  );

  const pointsEarned = useMemo<number>(() => {
    const pts = Math.max(0, Math.floor((effectivePrice * quantity) * 0.05));
    return pts;
  }, [effectivePrice, quantity]);

  const productPolicyQuery = trpc.products.getPolicies.useQuery(
    current ? { productId: current.id } : undefined as unknown as { productId: string },
    { enabled: !!current, staleTime: 5 * 60_000 }
  );

  const aiRecommendationsQuery = trpc.products.getAIRecommendations.useQuery(
    current ? { productId: current.id, category: current.category, limit: 8 } : undefined as unknown as { productId: string; category: string; limit: number },
    { enabled: !!current && lazyReady, staleTime: 10 * 60_000 }
  );

  const frequentlyBoughtQuery = trpc.products.getFrequentlyBoughtTogether.useQuery(
    current ? { productId: current.id } : undefined as unknown as { productId: string },
    { enabled: !!current && lazyReady, staleTime: 10 * 60_000 }
  );

  const reviewStatsQuery = trpc.reviews.getStats.useQuery(
    current ? { productId: current.id } : undefined as unknown as { productId: string },
    { enabled: !!current, staleTime: 5 * 60_000 }
  );

  const logActivity = trpc.activity.logActivity.useMutation();
  const incrementView = trpc.analytics.incrementProductView.useMutation();

  useEffect(() => {
    if (current) {
      try {
        logActivity.mutate({
          type: 'product_view',
          title: `Viewed ${current.name}`,
          description: `Product ${current.id} viewed`,
          metadata: { productId: current.id },
          status: 'completed',
        });
        incrementView.mutate({ productId: current.id });
      } catch (e) {
        console.log('[ProductDetails] log activity error', e);
      }
    }
  }, [current?.id]);

  const renderRelatedProduct = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => router.push({ pathname: '/(tabs)/product/[id]', params: { id: item.id } })}
      testID={`related-${item.id}`}
    >
      <Image source={{ uri: item.image }} style={styles.relatedImage} />
      <Text numberOfLines={2} style={styles.relatedName}>{item.name}</Text>
      <Text style={styles.relatedPrice}>KSh {item.price.toLocaleString('en-KE')}</Text>
    </TouchableOpacity>
  ), []);

  const renderBundleProduct = useCallback(({ item }: { item: any }) => (
    <View style={styles.bundleItem}>
      <Image source={{ uri: item.image_url || 'https://via.placeholder.com/60' }} style={styles.bundleImage} />
      <View style={styles.bundleInfo}>
        <Text numberOfLines={1} style={styles.bundleName}>{item.name}</Text>
        <Text style={styles.bundlePrice}>KSh {item.price?.toLocaleString('en-KE')}</Text>
      </View>
    </View>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {!current ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Product not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="go-back">
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!network.isConnected && (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineText}>
                  {isRefreshing ? '🔄 Refreshing...' : '📴 Offline • Showing cached details'}
                </Text>
              </View>
            )}

            {theme.lowDataMode && (
              <View style={styles.lowDataBanner}>
                <Text style={styles.lowDataText}>📶 Low Data Mode Active</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.headerBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="back-btn">
                  <ArrowLeft size={24} color={theme.highContrast ? '#000' : '#1F2937'} />
                  <Text style={[styles.backText, theme.highContrast && styles.highContrastText]}>Back</Text>
                </TouchableOpacity>
                {criticalContentLoaded ? (
                  <Text style={[styles.headerTitle, theme.highContrast && styles.highContrastText]} numberOfLines={1} testID="product-title-header">{current.name}</Text>
                ) : (
                  <View style={styles.headerTitleSkeleton} />
                )}
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={handleShare} testID="share-btn">
                    <Share2 size={20} color={theme.highContrast ? '#000' : '#1F2937'} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => toggleWishlist(current)} testID="fav-btn">
                    <Heart size={22} color={isFavorite ? '#DC2626' : (theme.highContrast ? '#000' : '#1F2937')} fill={isFavorite ? '#DC2626' : 'transparent'} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.carouselWrap}
                onPress={() => setShowImageGallery(true)}
                activeOpacity={0.9}
              >
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.imageContainer,
                    {
                      transform: [
                        { scale },
                        { translateX },
                        { translateY },
                      ],
                    },
                  ]}
                >
                  {!criticalContentLoaded ? (
                    <View style={styles.imageSkeleton}>
                      <View style={styles.imageSkeletonShimmer} />
                    </View>
                  ) : (
                    <Image 
                      source={{ uri: current.image }} 
                      style={styles.image}
                      accessibilityLabel={`Product image: ${current.name}`}
                      onLoadStart={() => setImageLoadProgress(0)}
                      onProgress={(e) => setImageLoadProgress((e.nativeEvent.loaded / e.nativeEvent.total) * 100)}
                      onLoadEnd={() => setImageLoadProgress(100)}
                    />
                  )}
                  {imageLoadProgress > 0 && imageLoadProgress < 100 && (
                    <View style={styles.imageLoadProgress}>
                      <View style={[styles.imageLoadBar, { width: `${imageLoadProgress}%` }]} />
                    </View>
                  )}
                  {imageZoomed && <View style={styles.zoomOverlay} />}
                  {current.inStock ? (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>In Stock</Text>
                    </View>
                  ) : (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                  )}
                  {current.flashSale && flashRemaining !== 'Ended' ? (
                    <View style={styles.flashBadge}>
                      <Clock size={14} color="#FFF" />
                      <Text style={styles.flashText}>Flash {current.flashSale?.discountPercent}% • {flashRemaining}</Text>
                    </View>
                  ) : null}
                  {!current.flashSale && current.discount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{current.discount}%</Text>
                    </View>
                  ) : null}
                  {current.vendorVerified ? (
                    <View style={styles.verifiedOverlay}>
                      <Text style={styles.verifiedOverlayText}>Verified Seller</Text>
                    </View>
                  ) : null}
                </Animated.View>
                <Text style={styles.zoomHint}>Tap to view gallery • Hold to zoom</Text>
              </TouchableOpacity>

              <View style={[styles.infoCard, theme.highContrast && styles.highContrastCard]}>
                {criticalContentLoaded ? (
                  <Text style={[styles.title, theme.highContrast && styles.highContrastText]} testID="product-title">{current.name}</Text>
                ) : (
                  <View style={styles.titleSkeleton} />
                )}

                {isSuspiciousPrice && (
                  <View style={styles.fraudAlert}>
                    <Shield size={16} color="#DC2626" />
                    <Text style={styles.fraudAlertText}>
                      ⚠️ Price Alert: This price is {current.price < marketAveragePrice! ? 'significantly lower' : 'significantly higher'} than market average (KSh {marketAveragePrice?.toLocaleString('en-KE')}). Please verify before purchase.
                    </Text>
                  </View>
                )}

                <View style={styles.priceSection}>
                  {criticalContentLoaded ? (
                    <View style={styles.priceRow}>
                      {effectivePrice !== current.price ? (
                        <>
                          <Text style={[styles.price, theme.highContrast && styles.highContrastText]}>KSh {effectivePrice.toLocaleString('en-KE')}</Text>
                          <Text style={styles.unit}>/{current.unit}</Text>
                          <Text style={styles.strikePrice}>KSh {Math.max(0, current.price + Object.values(selectedVariants).reduce((s,o)=>s+(o.priceModifier??0),0)).toLocaleString('en-KE')}</Text>
                        </>
                      ) : (
                        <>
                          <Text style={[styles.price, theme.highContrast && styles.highContrastText]}>KSh {current.price.toLocaleString('en-KE')}</Text>
                          <Text style={styles.unit}>/{current.unit}</Text>
                        </>
                      )}
                    </View>
                  ) : (
                    <View style={styles.priceSkeleton} />
                  )}

                  <View style={styles.priceMetaRow}>
                    {current.negotiable ? (
                      <View style={styles.negotiableBadge}>
                        <MessageCircle size={14} color="#F59E0B" />
                        <Text style={styles.negotiableText}>Price Negotiable</Text>
                      </View>
                    ) : (
                      <View style={styles.fixedPriceBadge}>
                        <Text style={styles.fixedPriceText}>Fixed Price</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.ratingRow}
                      onPress={() => setShowReviews(true)}
                      testID="reviews-open"
                    >
                      <Star size={16} color="#FCD34D" fill="#FCD34D" />
                      <Text style={styles.ratingText}>{current.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({reviewStatsQuery.data?.totalReviews ?? 0} reviews)</Text>
                      <ChevronRight size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>



                  <View style={styles.pointsBadge} testID="points-badge">
                    <Award size={14} color="#1F2937" />
                    <Text style={styles.pointsText}>Earn {pointsEarned.toLocaleString('en-KE')} pts on this order</Text>
                    <View style={styles.dot} />
                    <Text style={styles.pointsText}>You have {points} pts</Text>
                  </View>
                </View>

                {variantGroups.length > 0 && (
                  <View style={styles.variantSection}>
                    {variantGroups.map((group) => (
                      <View key={group.name} style={styles.variantGroup}>
                        <Text style={styles.variantLabel}>{group.name}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantPills}>
                          {group.options.map((opt) => {
                            const selected = selectedVariants[group.name]?.value === opt.value;
                            const disabled = (opt.stock ?? 1) <= 0;
                            const priceChange = opt.priceModifier ?? 0;
                            return (
                              <TouchableOpacity
                                key={`${group.name}-${opt.value}`}
                                style={[styles.variantPill, selected && styles.variantPillSelected, disabled && styles.variantPillDisabled]}
                                onPress={() => {
                                  if (disabled) return;
                                  setSelectedVariants((prev) => ({ ...prev, [group.name]: opt }));
                                }}
                                disabled={disabled}
                                testID={`variant-${group.name}-${opt.value}`}
                                accessibilityLabel={`${opt.value}${priceChange !== 0 ? `, ${priceChange > 0 ? '+' : ''}KSh ${priceChange}` : ''}${disabled ? ', out of stock' : ''}`}
                              >
                                <Text style={[styles.variantPillText, selected && styles.variantPillTextSelected, disabled && styles.variantPillTextDisabled]}>
                                  {opt.value}
                                </Text>
                                {priceChange !== 0 && !disabled && (
                                  <Text style={[styles.variantPriceModifier, selected && styles.variantPriceModifierSelected]}>
                                    {priceChange > 0 ? '+' : ''}{priceChange}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.vendorCard}
                  onPress={() => router.push(`/vendor/${current.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.vendorHeader}>
                    <View style={styles.vendorAvatar}>
                      <User size={20} color="#2D5016" />
                    </View>
                    <View style={styles.vendorInfo}>
                      <View style={styles.vendorNameRow}>
                        <Text style={styles.vendorName}>{current.vendor}</Text>
                        {current.vendorVerified && (
                          <View style={styles.verifiedBadge}>
                            <BadgeCheck size={16} color="#10B981" />
                          </View>
                        )}
                      </View>
                      <View style={styles.locationRow}>
                        <MapPin size={12} color="#666" />
                        <Text style={styles.location}>{current.location}</Text>
                        {distanceFromUser !== null && (
                          <View style={styles.distanceBadge}>
                            <Text style={styles.distanceText}>• {distanceFromUser.toFixed(1)} km away</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.viewShopRow}>
                        <Text style={styles.viewShopText}>View Shop</Text>
                        <ChevronRight size={14} color="#2D5016" />
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.contactBtn} 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleContact();
                      }} 
                      testID="contact-vendor"
                    >
                      <Phone size={16} color="#2D5016" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                <View style={styles.featuresSection}>
                  <Text style={styles.featuresTitle}>Product Features</Text>
                  <View style={styles.featuresGrid}>
                    {current.inStock && (
                      <View style={styles.featureItem}>
                        <Package size={16} color="#10B981" />
                        <Text style={styles.featureText}>In Stock</Text>
                      </View>
                    )}
                    {current.fastDelivery && (
                      <View style={styles.featureItem}>
                        <Truck size={16} color="#3B82F6" />
                        <Text style={styles.featureText}>Fast Delivery</Text>
                      </View>
                    )}
                    {current.vendorVerified && (
                      <View style={styles.featureItem}>
                        <Shield size={16} color="#10B981" />
                        <Text style={styles.featureText}>Verified Vendor</Text>
                      </View>
                    )}
                    <View style={styles.featureItem}>
                      <Clock size={16} color="#F59E0B" />
                      <Text style={styles.featureText}>Fresh Daily</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.specsCard}
                  onPress={() => setShowSpecs(!showSpecs)}
                  testID="specs-toggle"
                >
                  <View style={styles.specsHeader}>
                    <Package size={16} color="#2D5016" />
                    <Text style={styles.specsTitle}>Product Specifications</Text>
                    {showSpecs ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
                  </View>
                  {showSpecs && (
                    <View style={styles.specsBody}>
                      {productSpecs.map((spec, idx) => (
                        <View key={idx} style={styles.specRow}>
                          <Text style={styles.specLabel}>{spec.label}</Text>
                          <Text style={styles.specValue}>{spec.value}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.tagsSection}>
                  <Text style={styles.tagsTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {productTags.map((tag, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={styles.tag}
                        onPress={() => router.push({ pathname: '/(tabs)/marketplace', params: { category: tag } })}
                      >
                        <Text style={styles.tagText}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.policyCard} testID="return-policy-badge">
                  <Shield size={16} color="#065F46" />
                  {current ? (
                    productPolicyQuery.isLoading ? (
                      <Text style={styles.policyText}>Checking policy…</Text>
                    ) : productPolicyQuery.error ? (
                      <Text style={styles.policyText}>Escrow enabled • 24h returns</Text>
                    ) : (
                      <Text style={styles.policyText}>
                        {productPolicyQuery.data?.escrowEnabled ? 'Escrow protected' : 'Direct payment'}
                        {typeof productPolicyQuery.data?.returnWindowHours === 'number' ? ` • ${productPolicyQuery.data.returnWindowHours}h returns` : ''}
                        {productPolicyQuery.data?.refundPolicy ? ` • ${String(productPolicyQuery.data.refundPolicy).toUpperCase()} refund` : ''}
                      </Text>
                    )
                  ) : (
                    <Text style={styles.policyText}>Escrow enabled • 24h returns</Text>
                  )}
                  <Info size={14} color="#6B7280" />
                </View>

                <View style={styles.aiDeliveryCard} testID="ai-delivery-card">
                  <View style={styles.aiDeliveryHeader}>
                    <Truck size={16} color="#1F2937" />
                    <Text style={styles.aiDeliveryTitle}>Delivery ETA</Text>
                  </View>
                  {aiDeliveryQuery.isLoading ? (
                    <View style={styles.deliverySkeleton} />
                  ) : aiDeliveryQuery.error ? (
                    <Text style={styles.aiDeliveryError}>Could not load delivery estimate. Try again later.</Text>
                  ) : (
                    <View style={styles.aiDeliveryBody}>
                      <Text style={styles.aiDeliveryLine}>
                        {aiDeliveryQuery.data?.topRecommendation?.estimatedTime ?? '1-2 hours'} • Zone {aiDeliveryQuery.data?.deliveryZone ?? 'N/A'}
                      </Text>
                      {aiDeliveryQuery.data?.topRecommendation ? (
                        <Text style={styles.aiDeliverySub}>AI suggested {aiDeliveryQuery.data.topRecommendation.vehicleType} • {aiDeliveryQuery.data.topRecommendation.reason}</Text>
                      ) : null}
                      <TouchableOpacity
                        style={styles.scheduleBtn}
                        onPress={() => router.push('/delivery-scheduling')}
                        testID="schedule-delivery"
                      >
                        <Calendar size={14} color="#2D5016" />
                        <Text style={styles.scheduleBtnText}>Schedule Delivery</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {lazyReady && !theme.lowDataMode ? (
                  <View>
                    <Text style={[styles.description, theme.highContrast && styles.highContrastText]}>
                      Fresh, high-quality {current.category.toLowerCase()} sourced from trusted farms. Perfect for restaurants, markets, and home use. Our {current.vendor} ensures the best quality produce delivered fresh to your location.
                    </Text>
                  </View>
                ) : !lazyReady ? (
                  <View style={styles.skeletonText} testID="desc-skeleton" />
                ) : null}

                {lazyReady && !theme.lowDataMode ? (
                  <>
                    <View style={styles.interactiveSection}>
                      <TouchableOpacity style={styles.qaButton} onPress={() => setShowQA(true)}>
                        <View style={styles.qaHeader}>
                          <MessageSquare size={18} color="#2E7D32" />
                          <Text style={styles.qaTitle}>Questions & Answers</Text>
                        </View>
                        <Text style={styles.qaSubtitle}>Ask about this product</Text>
                        <ChevronRight size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.reviewsSection} onPress={() => setShowReviews(true)}>
                    <View style={styles.reviewsHeader}>
                      <Text style={styles.reviewsTitle}>Customer Reviews</Text>
                      <ChevronRight size={20} color="#6B7280" />
                    </View>
                    <View style={styles.reviewsSummary}>
                      <View style={styles.ratingOverview}>
                        <Text style={styles.averageRating}>{current.rating.toFixed(1)}</Text>
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              color={star <= Math.floor(current.rating) ? '#FCD34D' : '#E5E5E5'}
                              fill={star <= Math.floor(current.rating) ? '#FCD34D' : 'transparent'}
                            />
                          ))}
                        </View>
                        <Text style={styles.totalReviews}>{reviewStatsQuery.data?.totalReviews ?? 0} reviews</Text>
                      </View>
                      <View style={styles.recentReviews}>
                        <Text style={styles.recentReviewText}>&ldquo;Excellent quality! Fresh and well packaged.&rdquo;</Text>
                        <Text style={styles.recentReviewAuthor}>- Verified Buyer</Text>
                      </View>
                    </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.reviewsSkeleton} testID="reviews-skeleton" />
                )}

                <View style={styles.quantitySection}>
                  {selectedOutOfStock && (
                    <Text style={styles.variantOutOfStockText} testID="variant-out-of-stock">Selected option is out of stock</Text>
                  )}
                  <Text style={styles.quantityLabel}>Quantity</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityBtn}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      testID="qty-decrease"
                    >
                      <Text style={styles.quantityBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity} {current.unit}</Text>
                    <TouchableOpacity
                      style={styles.quantityBtn}
                      onPress={() => setQuantity(quantity + 1)}
                      testID="qty-increase"
                    >
                      <Text style={styles.quantityBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {lazyReady && frequentlyBoughtQuery.data && frequentlyBoughtQuery.data.products.length > 0 && (
                <View style={styles.bundleSection}>
                  <View style={styles.bundleHeader}>
                    <TrendingUp size={18} color="#1F2937" />
                    <Text style={styles.bundleTitle}>Frequently Bought Together</Text>
                  </View>
                  <FlatList
                    data={frequentlyBoughtQuery.data.products}
                    renderItem={renderBundleProduct}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                  />
                  <View style={styles.bundleFooter}>
                    <View>
                      <Text style={styles.bundleTotalLabel}>Bundle Price</Text>
                      <Text style={styles.bundleTotal}>KSh {frequentlyBoughtQuery.data.bundlePrice.toLocaleString('en-KE')}</Text>
                      <Text style={styles.bundleSavings}>Save KSh {frequentlyBoughtQuery.data.savings.toLocaleString('en-KE')}</Text>
                    </View>
                    <TouchableOpacity style={styles.bundleBtn} onPress={() => Alert.alert('Bundle', 'Add bundle to cart')}>
                      <Zap size={16} color="#FFF" />
                      <Text style={styles.bundleBtnText}>Add Bundle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {lazyReady && (
                <View style={styles.relatedSection}>
                  <Text style={styles.relatedTitle}>
                    {aiRecommendationsQuery.data?.recommendations && aiRecommendationsQuery.data.recommendations.length > 0
                      ? 'AI Recommended For You'
                      : 'Recommended For You'}
                  </Text>
                  {aiRecommendationsQuery.isLoading ? (
                    <View style={styles.relatedSkeleton} />
                  ) : (
                    <FlatList
                      data={(aiRecommendationsQuery.data?.recommendations && aiRecommendationsQuery.data.recommendations.length > 0
                        ? aiRecommendationsQuery.data.recommendations.filter(Boolean)
                        : relatedProducts) as Product[]}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.relatedCard}
                          onPress={() => router.push({ pathname: '/(tabs)/product/[id]', params: { id: item.id } })}
                          onLongPress={() => setQuickViewProduct(item)}
                          testID={`related-${item.id}`}
                        >
                          <Image source={{ uri: item.image }} style={styles.relatedImage} />
                          {item.discount && (
                            <View style={styles.relatedDiscountBadge}>
                              <Text style={styles.relatedDiscountText}>-{item.discount}%</Text>
                            </View>
                          )}
                          <View style={styles.relatedContent}>
                            <Text numberOfLines={2} style={styles.relatedName}>{item.name}</Text>
                            <View style={styles.relatedPriceRow}>
                              <Text style={styles.relatedPrice}>KSh {item.price.toLocaleString('en-KE')}</Text>
                              <View style={styles.relatedRating}>
                                <Star size={10} color="#FCD34D" fill="#FCD34D" />
                                <Text style={styles.relatedRatingText}>{item.rating.toFixed(1)}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.relatedList}
                      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                    />
                  )}
                </View>
              )}

              <View style={styles.actionButtons}>
                {current.negotiable && (
                  <TouchableOpacity 
                    style={styles.negotiateBtn} 
                    onPress={() => router.push('/(tabs)/chat')} 
                    testID="negotiate-btn"
                    accessibilityLabel="Negotiate price with seller"
                  >
                    <MessageCircle size={18} color="#F59E0B" />
                    <Text style={styles.negotiateBtnText}>Negotiate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 8) }]} testID="sticky-footer">
              <View style={styles.stickyPriceInfo}>
                <Text style={styles.stickyPrice}>KSh {effectivePrice.toLocaleString('en-KE')}</Text>
                <Text style={styles.stickyUnit}>/{current.unit}</Text>
              </View>
              <TouchableOpacity 
                style={styles.chatBtn} 
                onPress={() => setShowChat(true)} 
                testID="chat-seller"
                accessibilityLabel="Chat with seller"
              >
                <MessageSquare size={20} color="#2D5016" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buyNowBtn, (!current.inStock || selectedOutOfStock) && styles.ctaDisabled]}
                disabled={!current.inStock || selectedOutOfStock}
                onPress={() => {
                  handleAddToCart();
                  setTimeout(() => router.push('/checkout'), 300);
                }}
                testID="buy-now-btn"
                accessibilityLabel="Buy now"
              >
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addToCartBtnSticky, (!current.inStock || selectedOutOfStock) && styles.ctaDisabled]}
                disabled={!current.inStock || selectedOutOfStock}
                onPress={handleAddToCart}
                testID="add-to-cart-sticky"
                accessibilityLabel={current.inStock ? `Add ${quantity} ${current.unit} to cart` : 'Product out of stock'}
              >
                <ShoppingCart size={20} color="white" />
                <Text style={styles.addToCartTextSticky}>
                  {current.inStock ? `Add ${quantity}` : 'Out of Stock'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>

      {showReviews && current && (
        <ReviewsComponent
          productId={current.id}
          productName={current.name}
          vendorId={current.vendor}
          vendorName={current.vendor}
          averageRating={current.rating}
          totalReviews={24}
          onClose={() => setShowReviews(false)}
        />
      )}
      
      <CartFeedback
        visible={feedbackVisible}
        type={feedbackType}
        message={feedbackMessage}
        count={feedbackCount}
        onHide={() => {
          setFeedbackVisible(false);
          countRef.current = 1;
          lastProductRef.current = '';
        }}
      />

      {showImageGallery && current && (
        <ProductImageGallery
          images={[current.image, ...(current.gallery ?? [])].slice(0, 6)}
          productName={current.name}
          initialIndex={0}
          onClose={() => setShowImageGallery(false)}
          onShare={handleShare}
          onToggleFavorite={() => toggleWishlist(current)}
          isFavorite={isFavorite}
        />
      )}

      {showChat && current && (
        <ProductChat
          visible={showChat}
          onClose={() => setShowChat(false)}
          productId={current.id}
          productName={current.name}
          productImage={current.image}
          productPrice={effectivePrice}
          vendorId={current.vendor}
          vendorName={current.vendor}
          vendorVerified={current.vendorVerified}
          negotiable={current.negotiable}
          disableCall={true}
          disableAttachments={true}
          disableContactShare={true}
          disableSocialLinks={true}
        />
      )}

      {showQA && current && (
        <ProductQA
          visible={showQA}
          onClose={() => setShowQA(false)}
          productId={current.id}
          productName={current.name}
          vendorId={current.vendor}
          vendorName={current.vendor}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { paddingBottom: 140 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111827' },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  carouselWrap: {
    height: 300,
    margin: 12,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  zoomHint: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 6, fontStyle: 'italic' },
  zoomOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  outOfStockBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: '#DC2626', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: '#2E7D32', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  activeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  discountBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#DC2626', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  discountText: { color: 'white', fontSize: 12, fontWeight: '800' },
  verifiedOverlay: { position: 'absolute', top: 12, left: 12, backgroundColor: '#065F46', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedOverlayText: { color: 'white', fontSize: 12, fontWeight: '700' },
  flashBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#DC2626', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashText: { color: 'white', fontSize: 12, fontWeight: '800' },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D5016',
  },
  strikePrice: {
    marginLeft: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  unit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  negotiableText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  fixedPriceBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fixedPriceText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  socialProofText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
  pointsBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pointsText: { fontSize: 12, color: '#111827', fontWeight: '700' },
  reviewsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingOverview: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentReviews: {
    flex: 1,
  },
  recentReviewText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  recentReviewAuthor: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  vendorCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F3E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  viewShopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  viewShopText: {
    fontSize: 13,
    color: '#2D5016',
    fontWeight: '600',
  },
  distanceBadge: {
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  contactBtn: {
    backgroundColor: '#E5F3E5',
    borderRadius: 20,
    padding: 8,
  },
  featuresSection: {
    marginVertical: 16,
  },
  variantSection: { marginTop: 8, gap: 12 },
  variantGroup: { marginBottom: 8 },
  variantLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  variantPills: { gap: 8, paddingVertical: 2, paddingRight: 8 },
  variantPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 0 },
  variantPillSelected: { backgroundColor: '#ECFDF5', borderColor: '#34D399' },
  variantPillDisabled: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', opacity: 0.6 },
  variantPillText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  variantPillTextSelected: { color: '#065F46' },
  variantPillTextDisabled: { color: '#9CA3AF' },
  variantPriceModifier: { fontSize: 11, color: '#6B7280', marginLeft: 4, fontWeight: '600' },
  variantPriceModifierSelected: { color: '#065F46' },
  outOfStockText: { color: 'white', fontSize: 12, fontWeight: '700' },
  variantOutOfStockText: { color: '#B91C1C', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  policyText: { color: '#065F46', fontSize: 13, fontWeight: '700' },
  aiDeliveryCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
  },
  aiDeliveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  aiDeliveryTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  aiDeliveryBody: { gap: 4 },
  aiDeliveryLine: { fontSize: 13, color: '#1F2937', fontWeight: '600' },
  aiDeliverySub: { fontSize: 12, color: '#6B7280' },
  aiDeliveryError: { fontSize: 12, color: '#B91C1C' },
  deliverySkeleton: { height: 16, backgroundColor: '#E5E7EB', borderRadius: 6 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E5F3E5', borderRadius: 10, alignSelf: 'flex-start' },
  scheduleBtnText: { fontSize: 13, fontWeight: '700', color: '#2D5016' },
  quantitySection: {
    marginTop: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityBtn: {
    backgroundColor: '#2D5016',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    minWidth: 80,
    textAlign: 'center',
  },
  bundleSection: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  bundleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  bundleTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  bundleItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 8 },
  bundleImage: { width: 60, height: 60, borderRadius: 8 },
  bundleInfo: { flex: 1 },
  bundleName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  bundlePrice: { fontSize: 13, fontWeight: '700', color: '#2D5016' },
  bundleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  bundleTotalLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  bundleTotal: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  bundleSavings: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  bundleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2D5016', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  bundleBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  relatedSection: {
    marginTop: 24,
    marginHorizontal: 12,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  relatedList: {
    gap: 12,
    paddingRight: 12,
  },
  relatedCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  relatedImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  relatedDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  relatedDiscountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  relatedContent: {
    padding: 10,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 16,
  },
  relatedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D5016',
  },
  relatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  relatedRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  relatedSkeleton: { height: 120, backgroundColor: '#E5E7EB', borderRadius: 12 },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  negotiateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  negotiateBtnText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '700',
  },
  description: { fontSize: 14, color: '#374151', marginTop: 12, lineHeight: 20 },
  skeletonText: { height: 60, backgroundColor: '#E5E7EB', borderRadius: 8, marginTop: 12 },
  reviewsSkeleton: { height: 100, backgroundColor: '#E5E7EB', borderRadius: 12, marginVertical: 16 },
  offlineBanner: { backgroundColor: '#FFF7ED', padding: 8, alignItems: 'center' },
  offlineText: { color: '#9A3412', fontSize: 12, fontWeight: '600' },
  ctaBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D5016',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stickyPriceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  stickyPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D5016',
  },
  stickyUnit: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 2,
  },
  chatBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buyNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  addToCartBtnSticky: {
    flex: 1,
    backgroundColor: '#2D5016',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addToCartTextSticky: { color: 'white', fontSize: 16, fontWeight: '800' },
  ctaDisabled: { backgroundColor: '#9CA3AF', elevation: 0, shadowOpacity: 0 },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  backButton: { backgroundColor: '#2D5016', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageModalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  quickViewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  quickViewContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  quickViewClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 8,
  },
  quickViewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  quickViewInfo: {
    padding: 20,
  },
  quickViewName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  quickViewPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  quickViewPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D5016',
  },
  quickViewUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  quickViewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  quickViewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickViewRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickViewLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickViewLocationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickViewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickViewButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickViewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickViewAddButton: {
    flex: 1,
    backgroundColor: '#2D5016',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickViewAddButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  interactiveSection: {
    marginVertical: 16,
  },
  qaButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  qaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  qaSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  lowDataBanner: {
    backgroundColor: '#DBEAFE',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  lowDataText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
  },
  lowDataToggle: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  headerTitleSkeleton: {
    flex: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 16,
  },
  imageSkeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSkeletonShimmer: {
    width: '80%',
    height: '80%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  imageLoadProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  imageLoadBar: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  highContrastCard: {
    borderWidth: 2,
    borderColor: '#000',
  },
  highContrastText: {
    color: '#000',
    fontWeight: '900',
  },
  titleSkeleton: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    width: '80%',
  },
  fraudAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  fraudAlertText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
    fontWeight: '600',
  },
  priceSkeleton: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
    width: '60%',
  },
  specsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  specsBody: {
    marginTop: 12,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  tagsSection: {
    marginVertical: 12,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  accessibilityActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  accessibilityBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accessibilityBtnText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
});
