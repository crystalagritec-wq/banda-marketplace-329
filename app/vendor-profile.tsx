import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Award,
  Calendar,
  Package,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Heart,
  Share2,
  Grid3X3,
  List,
} from 'lucide-react-native';
import { router } from 'expo-router';
const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';
const GRAY = '#666666';

interface VendorProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  rating: number;
  inStock: boolean;
  category: string;
}

interface VendorStats {
  totalProducts: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  responseTime: string;
  joinDate: string;
  completionRate: number;
}

interface VendorCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  verified: boolean;
}

const mockVendorData = {
  id: 'vendor1',
  name: 'John Kamau',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=200&fit=crop',
  location: 'Kiambu County, Kenya',
  bio: 'Experienced farmer with over 15 years in sustainable agriculture. Specializing in high-quality maize, beans, and vegetables. Committed to organic farming practices and fair trade.',
  verified: true,
  businessName: 'Kamau Fresh Farms',
  businessType: 'Organic Farm',
  phone: '+254 712 345 678',
  email: 'john@kamauffarms.co.ke',
  website: 'www.kamauffarms.co.ke',
  stats: {
    totalProducts: 24,
    totalSales: 1250,
    rating: 4.8,
    reviewCount: 156,
    responseTime: '< 2 hours',
    joinDate: 'March 2020',
    completionRate: 98,
  } as VendorStats,
  certifications: [
    {
      id: '1',
      name: 'Organic Certification',
      issuer: 'Kenya Organic Agriculture Network',
      date: '2023',
      verified: true,
    },
    {
      id: '2',
      name: 'Fair Trade Certified',
      issuer: 'Fair Trade Kenya',
      date: '2022',
      verified: true,
    },
    {
      id: '3',
      name: 'Good Agricultural Practices',
      issuer: 'Ministry of Agriculture',
      date: '2023',
      verified: true,
    },
  ] as VendorCertification[],
  specialties: ['Organic Maize', 'French Beans', 'Tomatoes', 'Kale', 'Carrots'],
  gallery: [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=200&fit=crop',
    'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=300&h=200&fit=crop',
  ],
};

const mockProducts: VendorProduct[] = [
  {
    id: '1',
    name: 'Organic White Maize',
    price: 45,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop',
    rating: 4.9,
    inStock: true,
    category: 'Cereals',
  },
  {
    id: '2',
    name: 'Fresh French Beans',
    price: 120,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    rating: 4.7,
    inStock: true,
    category: 'Vegetables',
  },
  {
    id: '3',
    name: 'Organic Tomatoes',
    price: 80,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=300&h=200&fit=crop',
    rating: 4.8,
    inStock: false,
    category: 'Vegetables',
  },
  {
    id: '4',
    name: 'Fresh Kale (Sukuma)',
    price: 25,
    unit: 'bunch',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=200&fit=crop',
    rating: 4.6,
    inStock: true,
    category: 'Vegetables',
  },
];

export default function VendorProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'gallery'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const renderProduct = ({ item }: { item: VendorProduct }) => {
    if (viewMode === 'grid') {
      return (
        <TouchableOpacity 
          style={styles.gridProductCard}
          onPress={() => router.push({ pathname: '/(tabs)/product/[id]', params: { id: item.id } })}
        >
          <Image source={{ uri: item.image }} style={styles.gridProductImage} />
          {!item.inStock && <View style={styles.outOfStockOverlay} />}
          <View style={styles.gridProductInfo}>
            <Text style={styles.gridProductName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.gridProductMeta}>
              <Text style={styles.gridProductPrice}>KSh {item.price.toLocaleString()}</Text>
              <View style={styles.gridProductRating}>
                <Star size={12} color={ORANGE} fill={ORANGE} />
                <Text style={styles.gridRatingText}>{item.rating}</Text>
              </View>
            </View>
            {!item.inStock && (
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.listProductCard}
        onPress={() => router.push({ pathname: '/(tabs)/product/[id]', params: { id: item.id } })}
      >
        <Image source={{ uri: item.image }} style={styles.listProductImage} />
        <View style={styles.listProductInfo}>
          <Text style={styles.listProductName}>{item.name}</Text>
          <Text style={styles.listProductCategory}>{item.category}</Text>
          <View style={styles.listProductMeta}>
            <Text style={styles.listProductPrice}>KSh {item.price.toLocaleString()}/{item.unit}</Text>
            <View style={styles.listProductRating}>
              <Star size={14} color={ORANGE} fill={ORANGE} />
              <Text style={styles.listRatingText}>{item.rating}</Text>
            </View>
          </View>
          <View style={styles.listProductStatus}>
            {item.inStock ? (
              <Text style={styles.inStockText}>In Stock</Text>
            ) : (
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGalleryImage = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.galleryImageContainer}>
      <Image source={{ uri: item }} style={[styles.galleryImage, { width: (width - 56) / 2 }]} />
    </TouchableOpacity>
  );

  const renderCertification = ({ item }: { item: VendorCertification }) => (
    <View style={styles.certificationCard}>
      <View style={styles.certificationHeader}>
        <Award size={20} color={GREEN} />
        <View style={styles.certificationInfo}>
          <Text style={styles.certificationName}>{item.name}</Text>
          <Text style={styles.certificationIssuer}>{item.issuer}</Text>
        </View>
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Shield size={14} color={WHITE} />
          </View>
        )}
      </View>
      <Text style={styles.certificationDate}>Issued: {item.date}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: mockVendorData.coverImage }} style={styles.coverImage} />
          <View style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <ArrowLeft size={20} color={WHITE} />
              </TouchableOpacity>
              <View style={styles.headerRightActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <Share2 size={18} color={WHITE} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setIsFollowing(!isFollowing)}
                >
                  <Heart 
                    size={18} 
                    color={isFollowing ? '#DC2626' : WHITE} 
                    fill={isFollowing ? '#DC2626' : 'transparent'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Vendor Info */}
        <View style={styles.vendorInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: mockVendorData.avatar }} style={styles.avatar} />
            {mockVendorData.verified && (
              <View style={styles.verifiedBadgeAvatar}>
                <Award size={16} color={WHITE} />
              </View>
            )}
          </View>
          
          <View style={styles.vendorDetails}>
            <View style={styles.vendorNameRow}>
              <Text style={styles.vendorName}>{mockVendorData.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color={ORANGE} fill={ORANGE} />
                <Text style={styles.ratingText}>{mockVendorData.stats.rating}</Text>
                <Text style={styles.reviewCount}>({mockVendorData.stats.reviewCount})</Text>
              </View>
            </View>
            
            <Text style={styles.businessName}>{mockVendorData.businessName}</Text>
            <Text style={styles.businessType}>{mockVendorData.businessType}</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={14} color={GRAY} />
              <Text style={styles.location}>{mockVendorData.location}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Package size={20} color={GREEN} />
            <Text style={styles.statNumber}>{mockVendorData.stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={20} color={ORANGE} />
            <Text style={styles.statNumber}>{mockVendorData.stats.totalSales}</Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color={'#3B82F6'} />
            <Text style={styles.statNumber}>{mockVendorData.stats.responseTime}</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color={'#7B1FA2'} />
            <Text style={styles.statNumber}>{mockVendorData.stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={18} color={WHITE} />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <MessageCircle size={18} color={GREEN} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Products ({mockProducts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
              Gallery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'products' && (
            <>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>Products</Text>
                <View style={styles.viewModeToggle}>
                  <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
                    onPress={() => setViewMode('grid')}
                  >
                    <Grid3X3 size={16} color={viewMode === 'grid' ? WHITE : GRAY} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
                    onPress={() => setViewMode('list')}
                  >
                    <List size={16} color={viewMode === 'list' ? WHITE : GRAY} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <FlatList
                data={mockProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={viewMode === 'grid' ? 2 : 1}
                key={viewMode}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsList}
              />
            </>
          )}

          {activeTab === 'about' && (
            <View style={styles.aboutContent}>
              <Text style={styles.sectionTitle}>About {mockVendorData.name}</Text>
              <Text style={styles.bio}>{mockVendorData.bio}</Text>
              
              <View style={styles.specialtiesSection}>
                <Text style={styles.subsectionTitle}>Specialties</Text>
                <View style={styles.specialtiesList}>
                  {mockVendorData.specialties.map((specialty) => (
                    <View key={specialty} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.certificationsSection}>
                <Text style={styles.subsectionTitle}>Certifications</Text>
                <FlatList
                  data={mockVendorData.certifications}
                  renderItem={renderCertification}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              <View style={styles.businessInfoSection}>
                <Text style={styles.subsectionTitle}>Business Information</Text>
                <View style={styles.businessInfoItem}>
                  <Calendar size={16} color={GRAY} />
                  <Text style={styles.businessInfoText}>Member since {mockVendorData.stats.joinDate}</Text>
                </View>
                <View style={styles.businessInfoItem}>
                  <Phone size={16} color={GRAY} />
                  <Text style={styles.businessInfoText}>{mockVendorData.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'gallery' && (
            <View style={styles.galleryContent}>
              <Text style={styles.sectionTitle}>Farm Gallery</Text>
              <FlatList
                data={mockVendorData.gallery}
                renderItem={renderGalleryImage}
                keyExtractor={(item) => item}
                numColumns={2}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.galleryGrid}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  vendorInfo: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: WHITE,
    marginTop: -40,
  },
  verifiedBadgeAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: GREEN,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: WHITE,
  },
  vendorDetails: {
    flex: 1,
    paddingTop: 8,
  },
  vendorNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 14,
    color: GRAY,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: GREEN,
    marginBottom: 2,
  },
  businessType: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: GRAY,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: GRAY,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  contactButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: GREEN,
  },
  messageButtonText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: '600',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  followingButton: {
    backgroundColor: ORANGE,
  },
  followButtonText: {
    color: ORANGE,
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: WHITE,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: GREEN,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
  },
  activeTabText: {
    color: GREEN,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeViewMode: {
    backgroundColor: GREEN,
  },
  productsList: {
    gap: 12,
  },
  gridProductCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  gridProductImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gridProductInfo: {
    padding: 12,
  },
  gridProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 18,
  },
  gridProductMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  gridProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridRatingText: {
    fontSize: 12,
    color: GRAY,
  },
  listProductCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  listProductImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  listProductInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  listProductCategory: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 8,
  },
  listProductMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  listProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listRatingText: {
    fontSize: 14,
    color: GRAY,
  },
  listProductStatus: {
    alignSelf: 'flex-start',
  },
  inStockText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '600',
  },
  outOfStockText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  aboutContent: {
    paddingBottom: 20,
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  specialtiesSection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '500',
  },
  certificationsSection: {
    marginBottom: 24,
  },
  certificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  certificationIssuer: {
    fontSize: 14,
    color: GRAY,
  },
  verifiedBadge: {
    backgroundColor: GREEN,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificationDate: {
    fontSize: 12,
    color: GRAY,
  },
  businessInfoSection: {
    marginBottom: 24,
  },
  businessInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  businessInfoText: {
    fontSize: 14,
    color: '#374151',
  },
  galleryContent: {
    paddingBottom: 20,
  },
  galleryGrid: {
    gap: 8,
  },
  galleryImageContainer: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  galleryImage: {
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});