import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';

import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Wallet, 
  Bell,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Package,
  Zap,
  Clock,
  Calendar,
  BadgePercent,
  ShoppingCart
} from 'lucide-react-native';
import { mockProducts, type Product } from '@/constants/products';
import { useCart } from '@/providers/cart-provider';

const COLORS = {
  primary: '#2E7D32',
  secondary: '#F57C00',
  accent: '#E91E63',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { addToCart } = useCart();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Get flash sale products (limit to 10)
  const flashSaleProducts = useMemo(() => {
    return mockProducts.filter(p => p.discount && p.discount > 0).slice(0, 10);
  }, []);

  // Get trending products (limit to 10)
  const trendingProducts = useMemo(() => {
    return mockProducts
      .filter(p => p.rating >= 4.5 && p.inStock)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, []);

  // Get all products for compact grid
  const allProducts = useMemo(() => {
    return mockProducts.filter(p => p.inStock).slice(0, 20);
  }, []);

  const formatPrice = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE')}`;
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const openProductDetails = (id: string) => {
    router.push({ pathname: '/(tabs)/product/[id]', params: { id } });
  };

  const quickActions = [
    {
      key: 'marketplace',
      title: 'Marketplace',
      subtitle: 'Browse products',
      icon: ShoppingBag,
      route: '/(tabs)/marketplace',
      color: COLORS.primary,
      gradient: ['#2E7D32', '#4CAF50']
    },
    {
      key: 'wallet',
      title: 'Wallet',
      subtitle: 'Manage funds',
      icon: Wallet,
      route: '/(tabs)/wallet',
      color: COLORS.secondary,
      gradient: ['#F57C00', '#FF9800']
    },
    {
      key: 'orders',
      title: 'Orders',
      subtitle: 'Track orders',
      icon: Package,
      route: '/(tabs)/orders',
      color: COLORS.accent,
      gradient: ['#E91E63', '#F06292']
    },
    {
      key: 'trending',
      title: 'Trending',
      subtitle: 'Hot deals',
      icon: TrendingUp,
      route: '/trending-deals',
      color: COLORS.error,
      gradient: ['#EF4444', '#F87171']
    },
  ];

  const featuredSections = [
    {
      title: 'Market Insights',
      subtitle: 'Price trends & analytics',
      icon: TrendingUp,
      route: '/insights',
      color: COLORS.success,
      badge: 'New'
    },
  ];

  const stats = [
    { label: 'Active Orders', value: '3', color: COLORS.primary },
    { label: 'Wallet Balance', value: 'KES 12,500', color: COLORS.secondary },
    { label: 'This Month', value: '8 Orders', color: COLORS.accent },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.userNameText}>Welcome back!</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={24} color={COLORS.text} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/marketplace')}
          >
            <Search size={20} color={COLORS.textLight} />
            <Text style={styles.searchPlaceholder}>Search products, farmers...</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.key}
                  style={styles.quickActionCard}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <IconComponent size={24} color={COLORS.surface} />
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Featured Sections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {featuredSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <TouchableOpacity
                key={section.title}
                style={styles.featuredCard}
                onPress={() => router.push(section.route as any)}
                activeOpacity={0.9}
              >
                <View style={styles.featuredContent}>
                  <View style={[styles.featuredIcon, { backgroundColor: section.color }]}>
                    <IconComponent size={28} color={COLORS.surface} />
                  </View>
                  <View style={styles.featuredText}>
                    <View style={styles.featuredTitleRow}>
                      <Text style={styles.featuredTitle}>{section.title}</Text>
                      {section.badge && (
                        <View style={[styles.badge, { backgroundColor: section.color }]}>
                          <Text style={styles.badgeText}>{section.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.featuredSubtitle}>{section.subtitle}</Text>
                  </View>
                  <ArrowRight size={20} color={COLORS.textLight} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Flash Sale Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Zap size={20} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>🔥 Flash Sale</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/flash-sale')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalProductList}>
              {flashSaleProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.horizontalProductCard}
                  onPress={() => openProductDetails(product.id)}
                >
                  <View style={styles.horizontalProductImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.horizontalProductImage} />
                    <View style={styles.discountBadge}>
                      <BadgePercent size={10} color={COLORS.surface} />
                      <Text style={styles.discountText}>-{product.discount}%</Text>
                    </View>
                  </View>
                  <View style={styles.horizontalProductInfo}>
                    <Text numberOfLines={2} style={styles.horizontalProductName}>
                      {product.name}
                    </Text>
                    <Text style={styles.horizontalProductVendor} numberOfLines={1}>
                      {product.vendor}
                    </Text>
                    <View style={styles.horizontalProductPriceRow}>
                      <Text style={styles.horizontalProductOldPrice}>
                        KES {Math.round(product.price * 1.3).toLocaleString()}
                      </Text>
                      <Text style={styles.horizontalProductPrice}>
                        {formatPrice(product.price)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.horizontalAddButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCart size={12} color={COLORS.surface} />
                      <Text style={styles.horizontalAddButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={20} color={COLORS.error} />
              <Text style={styles.sectionTitle}>🔥 Trending</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/trending-deals')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalProductList}>
              {trendingProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.horizontalProductCard}
                  onPress={() => openProductDetails(product.id)}
                >
                  <View style={styles.horizontalProductImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.horizontalProductImage} />
                    <View style={styles.trendingBadge}>
                      <TrendingUp size={10} color={COLORS.surface} />
                      <Text style={styles.trendingText}>HOT</Text>
                    </View>
                  </View>
                  <View style={styles.horizontalProductInfo}>
                    <Text numberOfLines={2} style={styles.horizontalProductName}>
                      {product.name}
                    </Text>
                    <Text style={styles.horizontalProductVendor} numberOfLines={1}>
                      {product.vendor}
                    </Text>
                    <View style={styles.horizontalProductRating}>
                      <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
                      <Text style={styles.horizontalProductRatingText}>{product.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.horizontalProductPrice}>
                      {formatPrice(product.price)}
                    </Text>
                    <TouchableOpacity
                      style={styles.horizontalAddButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingCart size={12} color={COLORS.surface} />
                      <Text style={styles.horizontalAddButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Calendar size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/upcoming-events')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalEventList}>
              {[
                {
                  id: 'e1',
                  title: 'Harvest Festival 2024',
                  date: 'Oct 10–14',
                  location: 'Nairobi Agricultural Center',
                  image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
                  ongoing: true,
                },
                {
                  id: 'e2',
                  title: 'Tractor Hire Week',
                  date: 'Nov 5–9',
                  location: 'Mombasa Equipment Hub',
                  image: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop',
                },
                {
                  id: 'e3',
                  title: 'Organic Farming Workshop',
                  date: 'Nov 12–13',
                  location: 'Kisumu Training Center',
                  image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
                },
                {
                  id: 'e4',
                  title: 'Seed Exchange Market',
                  date: 'Nov 20–21',
                  location: 'Eldoret Market Square',
                  image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop',
                },
                {
                  id: 'e5',
                  title: 'Livestock Health Summit',
                  date: 'Dec 1–3',
                  location: 'Nakuru Convention Center',
                  image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop',
                },
                {
                  id: 'e6',
                  title: 'Smart Irrigation Expo',
                  date: 'Dec 8–10',
                  location: 'Thika Innovation Hub',
                  image: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop',
                },
              ].slice(0, 6).map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push('/upcoming-events')}
                >
                  <View style={styles.eventImageContainer}>
                    <Image source={{ uri: event.image }} style={styles.eventImage} />
                    {event.ongoing && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.eventInfo}>
                    <Text numberOfLines={2} style={styles.eventTitle}>
                      {event.title}
                    </Text>
                    <View style={styles.eventMeta}>
                      <Calendar size={12} color={COLORS.textLight} />
                      <Text style={styles.eventDate}>{event.date}</Text>
                    </View>
                    <View style={styles.eventMeta}>
                      <MapPin size={12} color={COLORS.textLight} />
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* All Products - Compact Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.compactProductGrid}>
            {allProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.compactProductCard}
                onPress={() => openProductDetails(product.id)}
              >
                <View style={styles.compactProductImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.compactProductImage} />
                  {product.discount && (
                    <View style={styles.compactDiscountBadge}>
                      <Text style={styles.compactDiscountText}>-{product.discount}%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.compactProductInfo}>
                  <Text numberOfLines={1} style={styles.compactProductName}>
                    {product.name}
                  </Text>
                  <Text style={styles.compactProductPrice}>
                    {formatPrice(product.price)}
                  </Text>
                  <View style={styles.compactProductRating}>
                    <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.compactProductRatingText}>{product.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location & Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <TouchableOpacity 
            style={styles.communityCard}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <View style={styles.communityHeader}>
              <View style={styles.communityIcon}>
                <Users size={24} color={COLORS.primary} />
              </View>
              <View style={styles.communityText}>
                <Text style={styles.communityTitle}>Join Local Farmers</Text>
                <Text style={styles.communitySubtitle}>Connect with 2,500+ farmers in your area</Text>
              </View>
            </View>
            <View style={styles.communityStats}>
              <View style={styles.communityStat}>
                <MapPin size={16} color={COLORS.textLight} />
                <Text style={styles.communityStatText}>Nairobi Region</Text>
              </View>
              <View style={styles.communityStat}>
                <Star size={16} color={COLORS.warning} />
                <Text style={styles.communityStatText}>4.8 Rating</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textLight,
  },
  statsSection: {
    paddingVertical: 20,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
    minWidth: 120,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 150,
    maxWidth: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  featuredCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.surface,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  communityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  communityText: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  communitySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  communityStats: {
    flexDirection: 'row',
    gap: 20,
  },
  communityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityStatText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 8,
  },
  // New styles for product sections
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalProductList: {
    flexDirection: 'row',
    paddingLeft: 20,
    gap: 12,
  },
  horizontalProductCard: {
    width: 140,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  horizontalProductImageContainer: {
    position: 'relative',
    height: 100,
  },
  horizontalProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  discountText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  trendingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendingText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  horizontalProductInfo: {
    padding: 8,
  },
  horizontalProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  horizontalProductVendor: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  horizontalProductPriceRow: {
    marginBottom: 4,
  },
  horizontalProductOldPrice: {
    fontSize: 10,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  horizontalProductPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  horizontalProductRatingText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  horizontalAddButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  horizontalAddButtonText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  // Event styles
  horizontalEventList: {
    flexDirection: 'row',
    paddingLeft: 20,
    gap: 12,
  },
  eventCard: {
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eventImageContainer: {
    position: 'relative',
    height: 100,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surface,
  },
  liveText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  eventInfo: {
    padding: 8,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  eventDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  // Compact product grid styles
  compactProductGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  compactProductCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  compactProductImageContainer: {
    position: 'relative',
    height: 80,
  },
  compactProductImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactDiscountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  compactDiscountText: {
    color: COLORS.surface,
    fontSize: 8,
    fontWeight: '700',
  },
  compactProductInfo: {
    padding: 6,
  },
  compactProductName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  compactProductPrice: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  compactProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactProductRatingText: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});