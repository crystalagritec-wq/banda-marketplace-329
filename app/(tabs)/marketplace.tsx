import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  Menu,
  ShieldCheck,
  BadgePercent,
  CheckCircle2,
  Truck,
  Clock,
  ChevronRight,
  MessageCircle,
  TrendingUp,
  Globe,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Pressable,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCart } from '@/providers/cart-provider';
import { trpc } from '@/lib/trpc';
import SideMenu from '@/components/SideMenu';
import CartModal from '@/components/CartModal';
import LoadingAnimation from '@/components/LoadingAnimation';
import CartFeedback from '@/components/CartFeedback';
import ServiceCard from '@/components/ServiceCard';
import EquipmentCard from '@/components/EquipmentCard';

import { useLoading } from '@/hooks/useLoading';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useLocation } from '@/providers/location-provider';
import { calculateDistance } from '@/utils/geo-distance';
import { convertToCartProduct } from '@/utils/vendor-helpers';
import { useTranslation } from '@/hooks/useTranslation';

const WHITE = '#FFFFFF' as const;
const GREEN = '#2D5016' as const;
const ORANGE = '#F59E0B' as const;



interface Product {
  id: string;
  name: string;
  price: number;
  vendor: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  discount: number;
  verified: boolean;
  coordinates: { lat: number; lng: number } | null;
  distanceKm: number | null;
  stock: number;
  unit: string;
  inStock?: boolean;
  vendorVerified?: boolean;
  negotiable?: boolean;
  fastDelivery?: boolean;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  banner: string;
  description: string;
  ongoing?: boolean;
}

interface PromoItem {
  id: string;
  vendor: string;
  logo: string;
  title: string;
  description: string;
  expiry: string;
}

function formatPrice(amount: number) {
  try {
    return `KES ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `KES ${amount}`;
  }
}

interface ProductCardProps {
  product: Product;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  onOpen: (id: string) => void;
  onAddToCart: (product: Product) => void;
  addLabel: string;
  distanceKm?: number | null;
}

const ProductCard = React.memo<ProductCardProps>(({ product, onToggleFavorite, isFavorite, onOpen, onAddToCart, addLabel, distanceKm }) => {
  const [pressed, setPressed] = useState<boolean>(false);

  const handleFavoritePress = useCallback((e: any) => {
    e?.stopPropagation?.();
    onToggleFavorite(product.id);
  }, [onToggleFavorite, product.id]);

  const handleAddToCartPress = useCallback((e: any) => {
    e?.stopPropagation?.();
    onAddToCart(product);
  }, [onAddToCart, product]);

  return (
    <View style={[styles.productCard, pressed && styles.productCardActive]}>
      <Pressable
        onPress={() => onOpen(product.id)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={styles.productImageContainer}
        testID={`product-card-${product.id}`}
        accessibilityRole="button"
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />
        {product.discount ? (
          <View style={styles.discountBadge}>
            <BadgePercent size={12} color={WHITE} />
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        ) : null}
        {product.inStock ? (
          <View style={styles.stockBadge}>
            <CheckCircle2 size={12} color={WHITE} />
            <Text style={styles.stockText}>In Stock</Text>
          </View>
        ) : (
          <View style={styles.outOfStockBadge}>
            <Clock size={12} color={WHITE} />
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        {product.fastDelivery ? (
          <View style={styles.deliveryBadge}>
            <Truck size={10} color={WHITE} />
            <Text style={styles.deliveryText}>Fast</Text>
          </View>
        ) : null}
        {distanceKm !== null && distanceKm !== undefined ? (
          <View style={styles.distanceBadgeCard}>
            <MapPin size={10} color={WHITE} />
            <Text style={styles.distanceTextCard}>{distanceKm.toFixed(1)} km</Text>
          </View>
        ) : null}
      </Pressable>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
        accessibilityRole="button"
        testID={`favorite-${product.id}`}
      >
        <Heart
          size={18}
          color={isFavorite ? '#DC2626' : '#666'}
          fill={isFavorite ? '#DC2626' : 'transparent'}
        />
      </TouchableOpacity>

      <Pressable
        onPress={() => onOpen(product.id)}
        style={styles.productInfo}
        accessibilityRole="button"
      >
        <Text numberOfLines={2} style={styles.productName}>{product.name}</Text>

        <View style={styles.vendorSection}>
          <View style={styles.vendorRow}>
            <Text style={styles.vendorName} numberOfLines={1}>{product.vendor}</Text>
            {product.vendorVerified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#10B981" />
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <MapPin size={11} color="#9CA3AF" />
            <Text style={styles.locationText} numberOfLines={1}>{product.location}</Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          <View style={styles.priceMetaRow}>
            {product.negotiable ? (
              <View style={styles.negotiableBadge}>
                <MessageCircle size={11} color="#F59E0B" />
                <Text style={styles.negotiableText}>Negotiable</Text>
              </View>
            ) : (
              <View style={styles.fixedPriceBadge}>
                <Text style={styles.fixedPriceText}>Fixed Price</Text>
              </View>
            )}

            <View style={styles.ratingRow}>
              <Star size={12} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </Pressable>

      <TouchableOpacity
        style={[styles.addToCartButton, !product.inStock && styles.addToCartButtonDisabled]}
        disabled={!product.inStock}
        onPress={handleAddToCartPress}
        testID={`add-to-cart-${product.id}`}
      >
        <ShoppingCart size={14} color={WHITE} />
        <Text style={styles.addToCartText}>
          {addLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
});
ProductCard.displayName = 'ProductCard';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { addToCart, cartSummary } = useCart();
  const { userLocation } = useLocation();
  const [searchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeBanner, setActiveBanner] = useState<number>(0);
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false);
  const [cartModalVisible, setCartModalVisible] = useState<boolean>(false);

  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const { isLoading, withLoading } = useLoading();
  const [initialLoading] = useState<boolean>(false);
  const network = useNetworkStatus();
  const { t, language, setLanguage } = useTranslation();
  const i18n = useMemo(() => ({
    searchPh: t('marketplace.searchPlaceholder') || 'Search products...',
    flashSale: t('marketplace.flashSale') || 'Flash Sale',
    seeAll: t('common.viewAll') || 'See All',
    endsIn: t('marketplace.endsIn') || 'Ends in',
    add: t('marketplace.addToCart') || 'Add',
    categories: t('marketplace.categories') || 'Categories',
    trending: t('marketplace.trending') || 'Trending',
    upcoming: t('marketplace.upcomingEvents') || 'Upcoming Events',
    join: t('common.join') || 'Join',
    learn: t('common.learnMore') || 'Learn More',
    remind: t('common.remindMe') || 'Remind Me',
    offers: t('marketplace.offers') || 'Offers & Promos',
    shopNow: t('marketplace.shopNow') || 'Shop Now',
    claim: t('marketplace.claim') || 'Claim',
    featuredByVendor: t('marketplace.featuredByVendor') || 'Featured',
    allProducts: t('marketplace.allProducts') || 'All Products',
    items: t('marketplace.items') || 'items',
  }), [t]);
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'add' | 'update' | 'remove' | 'success'>('add');
  const [feedbackCount, setFeedbackCount] = useState<number>(1);
  const lastProductRef = useRef<string>('');
  const countRef = useRef<number>(1);

  type SortBy = 'price' | 'popularity' | 'location';
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const onToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => (prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]));
  }, []);

  const handleAddToCart = useCallback(async (product: Product) => {
    await withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cartProduct = convertToCartProduct(product);
      addToCart(cartProduct, 1);
      
      if (lastProductRef.current === product.id && feedbackVisible) {
        countRef.current += 1;
        setFeedbackCount(countRef.current);
        setFeedbackMessage(`${product.name} added to cart`);
        setFeedbackVisible(true);
      } else {
        countRef.current = 1;
        lastProductRef.current = product.id;
        setFeedbackCount(1);
        setFeedbackType('add');
        setFeedbackMessage(`${product.name} added to cart`);
        setFeedbackVisible(true);
      }
    });
  }, [addToCart, withLoading, feedbackVisible]);

  useEffect(() => {
    try {
      const p = params?.category;
      const cat = Array.isArray(p) ? p[0] : p;
      if (cat && typeof cat === 'string') {
        setSelectedCategory(cat);
      }
    } catch (e) {
      console.log('params parse error', e);
    }
  }, [params?.category]);

  const openDetails = useCallback(async (id: string) => {
    await withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      router.push({ pathname: '/(tabs)/product/[id]', params: { id } });
    });
  }, [router, withLoading]);

  const { data: marketplaceData } = trpc.marketplace.getItems.useQuery({
    category: selectedCategory || undefined,
    location: selectedLocation || undefined,
    search: searchQuery || undefined,
    sortBy: sortBy === 'price' ? 'price_low' : sortBy === 'popularity' ? 'popular' : 'newest',
    limit: 50,
  });

  const { data: servicesData } = trpc.serviceProviders.getMarketplaceServices.useQuery({
    county: selectedLocation || undefined,
    searchQuery: searchQuery || undefined,
    limit: 30,
  });

  const { data: equipmentData } = trpc.serviceProviders.getMarketplaceEquipment.useQuery({
    county: selectedLocation || undefined,
    searchQuery: searchQuery || undefined,
    limit: 30,
  });

  const allItems = useMemo(() => {
    const products = marketplaceData?.data || [];
    const services = servicesData?.services || [];
    const equipment = equipmentData?.equipment || [];
    
    const productsWithDistance = products.map((product: any) => {
      let distance: number | null = null;
      if (userLocation?.coordinates && product.location_lat && product.location_lng) {
        distance = calculateDistance(
          userLocation.coordinates,
          { lat: product.location_lat, lng: product.location_lng }
        );
      }
      return {
        ...product,
        id: product.id,
        name: product.title,
        price: product.price,
        vendor: product.vendor_name || 'Unknown Vendor',
        vendor_id: product.user_id || product.vendor_id,
        location: product.location_county || product.location_city || 'Unknown',
        rating: product.rating || 0,
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
        category: product.category,
        discount: product.negotiable ? 10 : 0,
        verified: product.status === 'active',
        coordinates: product.location_lat && product.location_lng ? {
          lat: product.location_lat,
          lng: product.location_lng
        } : null,
        distanceKm: distance,
        stock: product.stock,
        unit: product.unit || 'unit',
        inStock: product.stock > 0,
        vendorVerified: product.vendor_verified || product.status === 'active',
        negotiable: product.negotiable,
        fastDelivery: false,
      };
    });

    const servicesWithType = services.map((service: any) => ({
      ...service,
      itemType: 'service' as const,
      distanceKm: userLocation?.coordinates && service.coordinates
        ? calculateDistance(userLocation.coordinates, service.coordinates)
        : null,
    }));

    const equipmentWithType = equipment.map((item: any) => ({
      ...item,
      itemType: 'equipment' as const,
      distanceKm: userLocation?.coordinates && item.coordinates
        ? calculateDistance(userLocation.coordinates, item.coordinates)
        : null,
    }));

    const allItemsArray = [
      ...productsWithDistance.map((p: any) => ({ ...p, itemType: 'product' as const })),
      ...servicesWithType,
      ...equipmentWithType,
    ];

    if (sortBy === 'location' && userLocation?.coordinates) {
      allItemsArray.sort((a: any, b: any) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== null) return -1;
        if (b.distanceKm !== null) return 1;
        return 0;
      });
    }
    
    return allItemsArray;
  }, [marketplaceData, servicesData, equipmentData, sortBy, userLocation]);

  const handleScrollBanner = useCallback((e: any) => {
    try {
      const x = e?.nativeEvent?.contentOffset?.x ?? 0;
      const index = Math.round(x / (width - 40));
      if (index !== activeBanner) setActiveBanner(index);
    } catch (err) {
      console.log('handleScrollBanner error', err);
    }
  }, [activeBanner, width]);

  const [flashTime, setFlashTime] = useState<number>(2 * 60 * 60 + 45 * 60);
  useEffect(() => {
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

  const flashProducts = useMemo(() => allItems.filter((p: any) => p.itemType === 'product' && p.discount > 0).slice(0, 12), [allItems]);
  const trendingProducts = useMemo(() => allItems.filter((p: any) => p.itemType === 'product').slice(0, 6), [allItems]);

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((p: any) => set.add(p.location));
    return Array.from(set).slice(0, 8);
  }, [allItems]);


  const events: EventItem[] = useMemo(() => ([
    { id: 'e1', title: 'Harvest Festival', date: 'Oct 10–14', banner: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop', description: 'Up to 35% off season produce', ongoing: true },
    { id: 'e2', title: 'Tractor Hire Week', date: 'Nov 5–9', banner: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop', description: '5% off next booking' },
  ]), []);

  const promos: PromoItem[] = useMemo(() => ([
    { id: 'p1', vendor: 'GreenFarm Ltd', logo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&auto=format&fit=crop', title: 'Free delivery over KES 2,000', description: 'On all inputs', expiry: 'Oct 30' },
    { id: 'p2', vendor: 'AgriHub', logo: 'https://images.unsplash.com/photo-1520975867597-0f4c3b7ae441?w=200&auto=format&fit=crop', title: 'KES 100 voucher', description: 'For new buyers', expiry: 'Nov 12' },
  ]), []);

  const onJoinEvent = useCallback((title: string) => {
    Alert.alert('Joined', `You joined ${title}`);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', WHITE]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setSideMenuVisible(true)}
            testID="menu-btn"
          >
            <Menu size={24} color={GREEN} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.searchBarContainer}
            onPress={() => router.push('/search')}
            activeOpacity={0.7}
          >
            <Search size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>{i18n.searchPh}</Text>
          </TouchableOpacity>
          
          <View style={styles.headerRightIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => router.push('/chat')}
              testID="messages-btn"
            >
              <MessageCircle size={24} color={GREEN} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setCartModalVisible(true)}
              testID="cart-btn"
            >
              <ShoppingCart size={24} color={GREEN} />
              {cartSummary.itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartSummary.itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Language Toggle */}
        <View style={styles.languageBar}>
          <TouchableOpacity 
            style={styles.languageToggle}
            onPress={() => setLanguage(language === 'en' ? 'sw' : 'en')}
          >
            <Globe size={16} color={GREEN} />
            <Text style={styles.languageText}>
              {language === 'en' ? 'Kiswahili | English' : 'English | Kiswahili'}
            </Text>
            <View style={[styles.onlineIndicator, { backgroundColor: network.isConnected ? '#10B981' : '#F59E0B' }]} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={true}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollContainer}
        >
        {/* Promo Banners */}
        <View style={styles.promoBanners}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={handleScrollBanner}
            scrollEventThrottle={16}
            testID="promo-carousel"
          >
            <View style={[styles.promoBanner, { backgroundColor: ORANGE }]}>
              <View style={styles.promoBannerContent}>
                <Text style={styles.promoBannerTitle}>🎉 Flash Sale</Text>
                <Text style={styles.promoBannerSubtitle}>Up to 50% off selected items</Text>
                <TouchableOpacity style={styles.promoBannerButton}>
                  <Text style={styles.promoBannerButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.promoBanner, { backgroundColor: GREEN }]}>
              <View style={styles.promoBannerContent}>
                <Text style={styles.promoBannerTitle}>🌾 Harvest Festival</Text>
                <Text style={styles.promoBannerSubtitle}>Up to 35% off season produce</Text>
                <TouchableOpacity style={styles.promoBannerButton}>
                  <Text style={styles.promoBannerButtonText}>Explore</Text>
                </TouchableOpacity>
              </View>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&h=120&fit=crop' }}
                style={styles.promoBannerImage}
              />
            </View>
            
            <View style={[styles.promoBanner, { backgroundColor: WHITE, borderWidth: 2, borderColor: ORANGE }]}>
              <View style={styles.promoBannerContent}>
                <Text style={[styles.promoBannerTitle, { color: ORANGE }]}>🌟 Vendor Spotlight</Text>
                <Text style={[styles.promoBannerSubtitle, { color: '#666' }]}>Featured premium vendors</Text>
                <TouchableOpacity style={[styles.promoBannerButton, { backgroundColor: ORANGE }]}>
                  <Text style={styles.promoBannerButtonText}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.bannerIndicators}>
            {[0, 1, 2].map((index) => (
              <View 
                key={index} 
                style={[styles.bannerIndicator, index === activeBanner && styles.bannerIndicatorActive]} 
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.flashSaleHeader}>
            <Text style={styles.sectionTitle}>{i18n.categories}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {[
              { key: 'seeds', label: 'Seeds', icon: '🌱', color: '#E8F5E8' },
              { key: 'poultry', label: 'Poultry', icon: '🐔', color: '#FFF3E0' },
              { key: 'inputs', label: 'Inputs', icon: '🚜', color: '#E3F2FD' },
              { key: 'machinery', label: 'Machinery', icon: '⚙️', color: '#F3E5F5' },
              { key: 'services', label: 'Services', icon: '🛠️', color: '#FFF8E1' },
            ].map((category) => (
              <TouchableOpacity 
                key={category.key}
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Flash Sale Section */}
        <View style={styles.flashHeader} testID="flash-header">
          <LinearGradient colors={['#FFE8D6', '#FFD6A5']} style={styles.flashHeaderGradient}>
            <View style={styles.flashLeft}> 
              <View style={styles.flashTitleRow}>
                <Text style={[styles.flashTitle, { color: ORANGE }]}>🔥 {i18n.flashSale}</Text>
                <View style={styles.flashBadge}>
                  <Text style={styles.flashBadgeText}>HOT</Text>
                </View>
              </View>
              <Text style={[styles.flashTimer, { color: ORANGE }]}>⏰ {i18n.endsIn} {timeStr}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/flash-sale')} style={styles.seeAllButton}>
              <Text style={[styles.seeAll, { color: ORANGE }]}>{i18n.seeAll}</Text>
              <ChevronRight size={16} color={ORANGE} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashList} testID="flash-list">
          {flashProducts.map((fp: Product) => (
            <Pressable key={`flash-${fp.id}`} style={styles.flashCard} onPress={() => openDetails(fp.id)}>
              <Image source={{ uri: fp.image }} style={styles.flashImg} />
              <View style={styles.flashInfo}>
                <Text numberOfLines={1} style={styles.flashName}>{fp.name}</Text>
                <View style={styles.flashPriceRow}>
                  <Text style={[styles.flashPrice, { color: GREEN }]}>{formatPrice(fp.price)}</Text>
                  {!!fp.discount && <View style={styles.flashDiscountBadge}><BadgePercent size={12} color={WHITE} /><Text style={styles.flashDiscountBadgeText}>-{fp.discount}%</Text></View>}
                </View>
                <TouchableOpacity style={styles.greenAddBtn} onPress={() => handleAddToCart(fp)}>
                  <Text style={styles.greenAddText}>{i18n.add}</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.trendingHeaderRow}>
          <View style={styles.trendingTitleRow}>
            <TrendingUp size={18} color="#EF4444" />
            <Text style={styles.sectionHeading}>{i18n.trending}</Text>
            <View style={styles.trendingBadge}>
              <Text style={styles.trendingBadgeText}>🔥</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/trending-deals')}>
            <Text style={styles.seeAll}>{i18n.seeAll}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.trendingGrid}>
          {trendingProducts.map((tp: Product) => (
            <View key={`trg-${tp.id}`} style={styles.trendingGridCard}>
              <Pressable onPress={() => openDetails(tp.id)}>
                <Image source={{ uri: tp.image }} style={styles.trendingImgGrid} />
              </Pressable>
              {!!tp.discount && (
                <View style={styles.gridDiscount}><Text style={styles.gridDiscountText}>-{tp.discount}%</Text></View>
              )}
              <Text numberOfLines={1} style={styles.trendingName}>{tp.name}</Text>
              <Text style={[styles.trendingPrice, { color: GREEN }]}>{formatPrice(tp.price)}</Text>
              <TouchableOpacity style={styles.greenAddBtn} onPress={() => handleAddToCart(tp)}>
                <Text style={styles.greenAddText}>{i18n.add}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{i18n.upcoming}</Text>
          <TouchableOpacity onPress={() => router.push('/upcoming-events')}><Text style={styles.seeAll}>{i18n.seeAll}</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsRow} testID="events-list">
          {events.map(ev => (
            <View key={ev.id} style={[styles.eventCard, ev.ongoing && styles.eventOngoing]}>
              <Image source={{ uri: ev.banner }} style={styles.eventBanner} />
              <View style={styles.eventBody}>
                <Text numberOfLines={1} style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventDate}>{ev.date}</Text>
                <Text numberOfLines={2} style={styles.eventDesc}>{ev.description}</Text>
                <View style={styles.eventActions}>
                  <TouchableOpacity style={styles.greenAddBtn} onPress={() => onJoinEvent(ev.title)}>
                    <Text style={styles.greenAddText}>{i18n.join}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.whiteBtn} onPress={() => Alert.alert(ev.title, ev.description)}>
                    <Text style={styles.whiteBtnText}>{i18n.learn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.orangeBtn} onPress={() => Alert.alert('Reminder set', ev.title)}>
                    <Text style={styles.orangeBtnText}>{i18n.remind}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>{i18n.offers}</Text>
          <TouchableOpacity onPress={() => router.push('/offers-promos')}><Text style={styles.seeAll}>{i18n.seeAll}</Text></TouchableOpacity>
        </View>
        <View style={styles.promosStack}>
          {promos.map(p => (
            <View key={p.id} style={styles.promoCard}>
              <Image source={{ uri: p.logo }} style={styles.promoLogo} />
              <View style={styles.promoBody}>
                <Text style={styles.promoVendor}>{p.vendor}</Text>
                <Text style={styles.promoTitle}>{p.title}</Text>
                <Text numberOfLines={2} style={styles.promoDesc}>{p.description}</Text>
                <Text style={styles.promoExpiry}>Expires {p.expiry}</Text>
                <View style={styles.promoActions}>
                  <TouchableOpacity style={styles.greenAddBtn}><Text style={styles.greenAddText}>{i18n.shopNow}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.orangeBtn}><Text style={styles.orangeBtnText}>{i18n.claim}</Text></TouchableOpacity>
                </View>
              </View>
              <View style={styles.featuredTag}><Text style={styles.featuredTagText}>{i18n.featuredByVendor}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.allProductsHeader}>
          <Text style={styles.sectionHeadingSmall}>Browse All Items</Text>
          <Text style={styles.productCount}>{allItems.length} {i18n.items}</Text>
        </View>

        <View style={styles.filterSortBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {(['popularity','price','location'] as SortBy[]).map(k => (
              <TouchableOpacity
                key={k}
                onPress={() => setSortBy(k)}
                style={[styles.pill, sortBy === k && styles.pillActive]}
                testID={`sort-${k}`}
              >
                <Text style={[styles.pillText, sortBy === k && styles.pillTextActive]}>
                  {k === 'popularity' ? 'Popularity' : k === 'price' ? 'Price' : 'Location'}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.pillDivider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationPillsRow}>
              <TouchableOpacity
                onPress={() => setSelectedLocation('')}
                style={[styles.pill, selectedLocation === '' && styles.pillActive]}
                testID={'loc-all'}
              >
                <Text style={[styles.pillText, selectedLocation === '' && styles.pillTextActive]}>All</Text>
              </TouchableOpacity>
              {locationOptions.map(loc => (
                <TouchableOpacity
                  key={loc}
                  onPress={() => setSelectedLocation(loc)}
                  style={[styles.pill, selectedLocation === loc && styles.pillActive]}
                  testID={`loc-${loc}`}
                >
                  <Text style={[styles.pillText, selectedLocation === loc && styles.pillTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </View>

        <View style={styles.flashListContainer}>
          <FlashList
            data={allItems}
            renderItem={({ item }) => {
              if (item.itemType === 'product') {
                return (
                  <ProductCard
                    product={item}
                    onToggleFavorite={(id) => onToggleFavorite(id)}
                    isFavorite={favorites.includes(item.id)}
                    onOpen={openDetails}
                    onAddToCart={handleAddToCart}
                    addLabel={i18n.add}
                    distanceKm={item.distanceKm}
                  />
                );
              } else if (item.itemType === 'service') {
                return (
                  <ServiceCard
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    providerName={item.providerName}
                    priceFrom={item.priceFrom}
                    location={item.location}
                    rating={item.rating}
                    image={item.image}
                    verified={item.verified}
                    availability={item.availability}
                    onPress={(id) => router.push(`/service-details?id=${id}`)}
                    onRequestService={(id) => router.push(`/service-details?id=${id}`)}
                    onToggleFavorite={(id) => onToggleFavorite(id)}
                    isFavorite={favorites.includes(item.id)}
                  />
                );
              } else {
                return (
                  <EquipmentCard
                    id={item.id}
                    name={item.name}
                    category={item.category}
                    pricePerDay={item.pricePerDay}
                    location={item.location}
                    rating={item.rating}
                    image={item.image}
                    verified={item.verified}
                    available={item.available}
                    condition={item.condition}
                    onPress={(id) => router.push(`/equipment-details?id=${id}`)}
                    onRentEquipment={(id) => router.push(`/equipment-details?id=${id}`)}
                    onToggleFavorite={(id) => onToggleFavorite(id)}
                    isFavorite={favorites.includes(item.id)}
                  />
                );
              }
            }}
            keyExtractor={(item) => `${item.itemType}-${item.id}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flashListContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No items found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
              </View>
            }
          />
        </View>


        </ScrollView>
      </LinearGradient>

      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
      />

      <CartModal
        visible={cartModalVisible}
        onClose={() => setCartModalVisible(false)}
      />



      <LoadingAnimation
        visible={initialLoading}
        message="Loading Banda Marketplace..."
        type="marketplace"
        overlay={true}
      />

      <LoadingAnimation
        visible={isLoading}
        message="Processing..."
        type="default"
        overlay={true}
      />
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandWrap: { flex: 1, alignItems: 'center' },
  brandGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  brand: { fontSize: 20, fontWeight: '800', color: WHITE },
  brandIcon: { marginTop: 1 },
  topRightIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    backgroundColor: WHITE,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  langWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 6 },
  langText: { color: GREEN, fontWeight: '700' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },

  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 12, 
    fontSize: 16, 
    color: '#111827', 
    fontWeight: '500',
    outlineStyle: 'none',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  clearSearch: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  filterButton: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselWrap: { paddingHorizontal: 12, marginBottom: 8 },
  carouselContent: { gap: 12 },
  bannerCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  bannerTextWrap: { position: 'absolute', left: 16, bottom: 12 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: WHITE },
  bannerSubtitle: { fontSize: 13, color: WHITE, marginTop: 4 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: GREEN, width: 16 },

  categoriesGridWrap: { paddingHorizontal: 12, marginTop: 8 },
  categoriesHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeading: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  sectionHeadingSmall: { fontSize: 15.3, fontWeight: '800', color: '#1F2937' },
  clearFilter: { fontSize: 12, color: GREEN, fontWeight: '700' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  categoryItem: { width: '23%', alignItems: 'center' },
  categoryIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 6, overflow: 'hidden' },
  categoryIconImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  categoryLabel: { fontSize: 12, color: '#374151', fontWeight: '600', textAlign: 'center' },
  categoryLabelActive: { color: GREEN },

  flashHeader: {
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  flashHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  flashLeft: { flex: 1 },
  flashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  flashTitle: { fontSize: 18, fontWeight: '800' },
  flashBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flashBadgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  flashTimer: { fontSize: 13, fontWeight: '600' },
  seeAll: { fontSize: 13, color: '#92400E', fontWeight: '700' },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  flashList: { paddingHorizontal: 12, gap: 12, paddingBottom: 8 },
  flashCard: { width: 180, backgroundColor: WHITE, borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  flashImg: { width: '100%', height: 100 },
  flashInfo: { padding: 10 },
  flashName: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  flashPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  flashPrice: { fontSize: 14, fontWeight: '800' },
  flashDiscountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, gap: 4 },
  flashDiscountBadgeText: { color: WHITE, fontSize: 12, fontWeight: '700' },

  greenAddBtn: { backgroundColor: GREEN, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  greenAddText: { color: WHITE, fontWeight: '800' },
  orangeBtn: { backgroundColor: ORANGE, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  orangeBtnText: { color: WHITE, fontWeight: '800' },
  whiteBtn: { backgroundColor: WHITE, borderWidth: 1, borderColor: GREEN, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  whiteBtnText: { color: GREEN, fontWeight: '800' },

  trendingHeaderRow: { paddingHorizontal: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  trendingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trendingBadge: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  trendingBadgeText: { fontSize: 12 },
  trendingGrid: { paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  trendingGridCard: { width: '48%', backgroundColor: WHITE, borderRadius: 14, overflow: 'hidden', padding: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  trendingImgGrid: { width: '100%', height: 110, borderRadius: 12, marginBottom: 8 },
  gridDiscount: { position: 'absolute', top: 12, left: 12, backgroundColor: ORANGE, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  gridDiscountText: { color: WHITE, fontWeight: '800', fontSize: 12 },
  trendingName: { fontSize: 13, fontWeight: '600', color: '#374151', paddingHorizontal: 2, marginTop: 2 },
  trendingPrice: { fontSize: 14, fontWeight: '800', paddingHorizontal: 2, paddingBottom: 6 },

  sectionHeaderRow: { paddingHorizontal: 16, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventsRow: { paddingHorizontal: 12, gap: 12, paddingBottom: 8 },
  eventCard: { width: 260, backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  eventOngoing: { borderWidth: 2, borderColor: GREEN },
  eventBanner: { width: '100%', height: 110 },
  eventBody: { padding: 12 },
  eventTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  eventDate: { fontSize: 12, color: '#374151', marginBottom: 6 },
  eventDesc: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  eventActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  promosStack: { paddingHorizontal: 12, gap: 12, marginBottom: 4 },
  promoCard: { backgroundColor: WHITE, borderRadius: 16, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, position: 'relative' },
  promoLogo: { width: 44, height: 44, borderRadius: 10 },
  promoVendor: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  promoTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  promoDesc: { fontSize: 12, color: '#374151', marginTop: 2 },
  promoExpiry: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  promoActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  featuredTag: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFF7ED', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  featuredTagText: { color: ORANGE, fontSize: 10, fontWeight: '700' },

  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 20 },
  flashListContainer: { height: 800, paddingHorizontal: 8 },
  flashListContent: { paddingBottom: 20, paddingHorizontal: 8 },
  productCard: {
    width: '48%',
    backgroundColor: WHITE,
    borderRadius: 13,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productCardActive: { 
    transform: [{ scale: 0.97 as number }], 
    shadowOpacity: 0.18,
    elevation: 6,
  },
  productImageContainer: { 
    position: 'relative', 
    height: 114,
    backgroundColor: '#F9FAFB',
  },
  productImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover',
  },
  discountBadge: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    backgroundColor: '#EF4444', 
    borderRadius: 14, 
    paddingHorizontal: 8, 
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  discountText: { 
    color: WHITE, 
    fontSize: 11, 
    fontWeight: '700',
  },
  favoriteButton: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 18, 
    padding: 7,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  stockBadge: { 
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    backgroundColor: '#10B981', 
    borderRadius: 12, 
    paddingHorizontal: 7, 
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stockText: { 
    color: WHITE, 
    fontSize: 10, 
    fontWeight: '600',
  },
  outOfStockBadge: { 
    position: 'absolute', 
    bottom: 10, 
    left: 10, 
    backgroundColor: '#EF4444', 
    borderRadius: 12, 
    paddingHorizontal: 7, 
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  outOfStockText: { 
    color: WHITE, 
    fontSize: 10, 
    fontWeight: '600',
  },
  deliveryBadge: { 
    position: 'absolute', 
    bottom: 10, 
    right: 10, 
    backgroundColor: '#3B82F6', 
    borderRadius: 12, 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3,
  },
  deliveryText: { 
    color: WHITE, 
    fontSize: 9, 
    fontWeight: '700',
  },
  productInfo: { 
    padding: 11,
  },
  productName: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 6,
    lineHeight: 16,
  },
  vendorSection: { marginBottom: 7 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  vendorName: { fontSize: 11, color: '#2D5016', fontWeight: '600', flex: 1 },
  verifiedBadge: { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 9, color: '#6B7280', flex: 1 },
  priceSection: { marginBottom: 9 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 13, fontWeight: '800', color: '#2D5016' },
  unit: { fontSize: 10, color: '#6B7280', marginLeft: 3 },
  priceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  negotiableBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 9, paddingHorizontal: 5, paddingVertical: 2, gap: 2 },
  negotiableText: { fontSize: 8, color: '#F59E0B', fontWeight: '600' },
  fixedPriceBadge: { backgroundColor: '#F3F4F6', borderRadius: 9, paddingHorizontal: 5, paddingVertical: 2 },
  fixedPriceText: { fontSize: 8, color: '#6B7280', fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  addToCartButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN, borderRadius: 7, paddingVertical: 7, gap: 4, elevation: 2, shadowColor: '#2D5016', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  addToCartButtonDisabled: { backgroundColor: '#9CA3AF', elevation: 0, shadowOpacity: 0 },
  addToCartText: { color: WHITE, fontSize: 11, fontWeight: '700' },

  vendorHeaderRow: { paddingHorizontal: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vendorSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vendorSubText: { fontSize: 12, color: '#374151' },
  vendorList: { paddingHorizontal: 12, gap: 12, paddingBottom: 12 },
  vendorCard: { width: 140, backgroundColor: WHITE, borderRadius: 14, padding: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  vendorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2D5016', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  vendorNameSpotlight: { fontSize: 14, fontWeight: '700', color: '#111827' },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  vendorLoc: { fontSize: 12, color: '#6B7280' },

  allProductsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8, paddingHorizontal: 16 },
  productCount: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },

  fab: { 
    position: 'absolute', 
    bottom: 90, 
    right: 20, 
    backgroundColor: ORANGE, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 28, 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8 
  },
  fabText: { color: WHITE, fontSize: 14, fontWeight: '800' },
  cartIconContainer: { position: 'relative' },
  cartBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#DC2626', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: WHITE, fontSize: 12, fontWeight: '700' },

  filterSortBar: { paddingHorizontal: 12, marginBottom: 8 },
  filterPillsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: WHITE },
  pillActive: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  pillText: { color: '#374151', fontWeight: '600', fontSize: 12 },
  pillTextActive: { color: '#065F46' },
  pillDivider: { width: 1, height: 20, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
  locationPillsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoBody: { flex: 1 },
  
  // New styles for redesigned marketplace
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '600',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  promoBanners: {
    paddingVertical: 16,
  },
  promoBanner: {
    width: 320,
    height: 160,
    marginHorizontal: 8,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoBannerContent: {
    flex: 1,
  },
  promoBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 4,
  },
  promoBannerSubtitle: {
    fontSize: 14,
    color: WHITE,
    marginBottom: 12,
  },
  promoBannerButton: {
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  promoBannerButtonText: {
    color: GREEN,
    fontWeight: '700',
    fontSize: 14,
  },
  promoBannerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  bannerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  bannerIndicatorActive: {
    backgroundColor: GREEN,
    width: 20,
  },
  
  flashSaleSection: {
    paddingVertical: 16,
  },
  flashSaleHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  flashSaleTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
    marginLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: ORANGE,
    fontWeight: '700',
  },
  flashSaleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: ORANGE,
    fontWeight: '600',
  },
  flashSaleList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  flashSaleCard: {
    width: 160,
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flashSaleImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  flashSaleDiscount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flashSaleDiscountText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  flashSaleInfo: {
    padding: 12,
  },
  flashSaleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  flashSalePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  flashSaleOldPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  flashSaleNewPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN,
  },
  flashSaleAddButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  flashSaleAddText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  
  categoriesSection: {
    paddingVertical: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  postButton: {
    backgroundColor: ORANGE,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    position: 'absolute',
    top: -28,
    left: '50%',
    marginLeft: -28,
  },
  cartContainer: {
    position: 'relative',
  },
  cartIconWrapper: {
    backgroundColor: ORANGE,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cartGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: GREEN,
    opacity: 0.6,
  },
  cartBadgeNav: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeTextNav: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  distanceBadgeCard: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceTextCard: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '700',
  },
  
  // Scroll container styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productsGridFlat: {
    paddingBottom: 20,
  },
});
