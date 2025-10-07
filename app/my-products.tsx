import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Star,
  Package,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';

type ProductStatus = 'active' | 'inactive' | 'pending' | 'sold';
type ProductType = 'product' | 'service';

interface UserProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  status: ProductStatus;
  category: string;
  images: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  location?: string;
  quantity?: number;
  unit?: string;
}

const mockProducts: UserProduct[] = [
  {
    id: '1',
    title: 'Fresh Organic Tomatoes',
    description: 'Premium quality organic tomatoes grown without pesticides. Perfect for cooking and salads.',
    price: 150,
    type: 'product',
    status: 'active',
    category: 'Vegetables',
    images: ['https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=400'],
    views: 245,
    likes: 18,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    location: 'Kiambu',
    quantity: 50,
    unit: 'kg',
  },
  {
    id: '2',
    title: 'Tractor Rental Service',
    description: 'Professional tractor rental with experienced operator. Available for plowing, planting, and harvesting.',
    price: 3500,
    type: 'service',
    status: 'active',
    category: 'Equipment Rental',
    images: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400'],
    views: 89,
    likes: 12,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    location: 'Nakuru',
  },
  {
    id: '3',
    title: 'Free Range Chicken Eggs',
    description: 'Fresh eggs from free-range chickens. Collected daily and delivered fresh to your doorstep.',
    price: 25,
    type: 'product',
    status: 'sold',
    category: 'Poultry',
    images: ['https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400'],
    views: 156,
    likes: 23,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-22',
    location: 'Meru',
    quantity: 0,
    unit: 'dozen',
  },
  {
    id: '4',
    title: 'Farm Labor Services',
    description: 'Experienced farm workers available for seasonal work. Specializing in crop harvesting and land preparation.',
    price: 800,
    type: 'service',
    status: 'pending',
    category: 'Labor',
    images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400'],
    views: 67,
    likes: 8,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    location: 'Eldoret',
  },
  {
    id: '5',
    title: 'Organic Maize',
    description: 'High-quality organic maize, perfect for animal feed or human consumption. Properly dried and stored.',
    price: 45,
    type: 'product',
    status: 'inactive',
    category: 'Grains',
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'],
    views: 198,
    likes: 31,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-15',
    location: 'Kisumu',
    quantity: 200,
    unit: 'kg',
  },
];

export default function MyProductsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | ProductType>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProductStatus>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || product.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'pending': return '#F59E0B';
      case 'sold': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: ProductStatus) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'pending': return Clock;
      case 'sold': return TrendingUp;
      default: return Clock;
    }
  };

  const handleProductAction = (action: string, productId: string) => {
    switch (action) {
      case 'edit':
        router.push(`/edit-product/${productId}` as any);
        break;
      case 'view':
        router.push(`/product/${productId}` as any);
        break;
      case 'delete':
        Alert.alert(
          'Delete Product',
          'Are you sure you want to delete this product? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete product:', productId) },
          ]
        );
        break;
      case 'toggle_status':
        console.log('Toggle status for product:', productId);
        break;
    }
  };

  const renderProductCard = (product: UserProduct) => {
    const StatusIcon = getStatusIcon(product.status);
    
    return (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <View style={styles.productTitleRow}>
              <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
              <TouchableOpacity style={styles.moreButton}>
                <MoreVertical size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
            <View style={styles.productMeta}>
              <View style={styles.typeTag}>
                {product.type === 'product' ? <Package size={12} color="#2D5016" /> : <Wrench size={12} color="#2D5016" />}
                <Text style={styles.typeText}>{product.type}</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: `${getStatusColor(product.status)}20` }]}>
                <StatusIcon size={12} color={getStatusColor(product.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(product.status) }]}>{product.status}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <Eye size={16} color="#666" />
            <Text style={styles.statText}>{product.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={16} color="#666" />
            <Text style={styles.statText}>{product.likes}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>KSh {product.price.toLocaleString()}</Text>
            {product.unit && <Text style={styles.unit}>/{product.unit}</Text>}
          </View>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleProductAction('view', product.id)}
          >
            <Eye size={16} color="#2D5016" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleProductAction('edit', product.id)}
          >
            <Edit3 size={16} color="#2D5016" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleProductAction('delete', product.id)}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="my-products-screen">
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#2D5016" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Products & Services</Text>
            <Text style={styles.headerSubtitle}>{filteredProducts.length} items</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-product' as any)}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your products and services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? "white" : "#2D5016"} />
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Type:</Text>
              <View style={styles.filterOptions}>
                {['all', 'product', 'service'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                    onPress={() => setSelectedType(type as any)}
                  >
                    <Text style={[styles.filterChipText, selectedType === type && styles.filterChipTextActive]}>
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterOptions}>
                {['all', 'active', 'inactive', 'pending', 'sold'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
                    onPress={() => setSelectedStatus(status as any)}
                  >
                    <Text style={[styles.filterChipText, selectedStatus === status && styles.filterChipTextActive]}>
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockProducts.filter(p => p.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockProducts.filter(p => p.status === 'sold').length}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockProducts.reduce((sum, p) => sum + p.views, 0)}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockProducts.reduce((sum, p) => sum + p.likes, 0)}</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
        </View>

        {/* Products List */}
        <ScrollView 
          style={styles.productsList}
          contentContainerStyle={styles.productsListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map(renderProductCard)
          ) : (
            <View style={styles.emptyState}>
              <Package size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyDescription}>
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first product or service'}
              </Text>
              {!searchQuery && selectedType === 'all' && selectedStatus === 'all' && (
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => router.push('/add-product' as any)}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.addFirstButtonText}>Add Your First Item</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#2D5016',
  },
  filtersContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  productsList: {
    flex: 1,
  },
  productsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5016',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});