import React, { useState, useEffect } from 'react';
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
  Package,
  Wrench,
  MessageSquare,
  Edit3,
  Archive,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
} from 'lucide-react-native';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface PostItem {
  id: string;
  type: 'product' | 'service' | 'request';
  title: string;
  category: string;
  description: string;
  price?: string;
  budgetMin?: string;
  budgetMax?: string;
  images: string[];
  status: 'published' | 'archived';
  views: number;
  likes: number;
  messages: number;
  createdAt: string;
  updatedAt: string;
}

const mockPosts: PostItem[] = [
  {
    id: '1',
    type: 'product',
    title: 'Premium Hybrid Maize Seeds - 20kg',
    category: 'Seeds',
    description: 'High yielding hybrid maize seeds with excellent drought resistance...',
    price: '4500',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'],
    status: 'published',
    views: 156,
    likes: 23,
    messages: 8,
    createdAt: '2024-01-10T08:30:00Z',
    updatedAt: '2024-01-10T08:30:00Z',
  },
  {
    id: '2',
    type: 'service',
    title: 'Professional Crop Spraying Service',
    category: 'Mechanization',
    description: 'Expert crop spraying service using modern equipment...',
    price: '3000',
    images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'],
    status: 'published',
    views: 89,
    likes: 12,
    messages: 15,
    createdAt: '2024-01-08T14:15:00Z',
    updatedAt: '2024-01-08T14:15:00Z',
  },
  {
    id: '3',
    type: 'request',
    title: 'Seeking Organic Fertilizer Supplier',
    category: 'Inputs',
    description: 'Looking for reliable supplier of organic fertilizer for 10 acres...',
    budgetMin: '20000',
    budgetMax: '35000',
    images: [],
    status: 'published',
    views: 67,
    likes: 8,
    messages: 22,
    createdAt: '2024-01-05T11:45:00Z',
    updatedAt: '2024-01-05T11:45:00Z',
  },
  {
    id: '4',
    type: 'product',
    title: 'Used Tractor - Good Condition',
    category: 'Machinery',
    description: 'Well maintained tractor, perfect for small to medium farms...',
    price: '850000',
    images: ['https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?w=400'],
    status: 'archived',
    views: 234,
    likes: 45,
    messages: 31,
    createdAt: '2023-12-28T09:20:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },
];

export default function MyPostsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'archived'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // Mock loading from Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: PostItem) => {
    // Navigate to appropriate edit screen
    switch (post.type) {
      case 'product':
        router.push(`/post-product?postId=${post.id}`);
        break;
      case 'service':
        router.push(`/post-service?postId=${post.id}`);
        break;
      case 'request':
        router.push(`/post-request?postId=${post.id}`);
        break;
    }
  };

  const handleArchivePost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    const isArchiving = post?.status === 'published';
    
    Alert.alert(
      isArchiving ? 'Archive Post' : 'Restore Post',
      isArchiving 
        ? 'Are you sure you want to archive this post? It will no longer be visible to others.'
        : 'Are you sure you want to restore this post? It will be visible to others again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isArchiving ? 'Archive' : 'Restore',
          onPress: () => {
            setPosts(prev => prev.map(p => 
              p.id === postId 
                ? { ...p, status: isArchiving ? 'archived' : 'published' }
                : p
            ));
          },
        },
      ]
    );
  };

  const handleViewPost = (post: PostItem) => {
    // Navigate to post detail view
    router.push(`/(tabs)/product/${post.id}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package size={20} color={GREEN} />;
      case 'service':
        return <Wrench size={20} color={ORANGE} />;
      case 'request':
        return <MessageSquare size={20} color="#2196F3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={GREEN} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Posts</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </View>
    );
  }

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
          testID="back-button"
        >
          <ArrowLeft size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Posts</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'published', label: 'Published' },
          { key: 'archived', label: 'Archived' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(tab.key as any)}
            testID={`filter-${tab.key}`}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Package size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
          <Text style={styles.emptyStateText}>
            Your published posts will appear here. Start creating your first post.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.back()}
          >
            <Text style={styles.createButtonText}>Create New Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            {filteredPosts.length} Post{filteredPosts.length !== 1 ? 's' : ''}
          </Text>
          
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postTypeRow}>
                  {getTypeIcon(post.type)}
                  <Text style={styles.postType}>
                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    post.status === 'published' ? styles.statusBadgePublished : styles.statusBadgeArchived
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      post.status === 'published' ? styles.statusBadgeTextPublished : styles.statusBadgeTextArchived
                    ]}>
                      {post.status === 'published' ? 'Live' : 'Archived'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.postDate}>
                  {formatDate(post.createdAt)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.postContent}
                onPress={() => handleViewPost(post)}
              >
                <View style={styles.postMainContent}>
                  <Text style={styles.postTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={styles.postCategory}>{post.category}</Text>
                  <Text style={styles.postDescription} numberOfLines={2}>
                    {post.description}
                  </Text>
                  
                  {post.price && (
                    <Text style={styles.postPrice}>KES {post.price}</Text>
                  )}
                  
                  {post.budgetMin && post.budgetMax && (
                    <Text style={styles.postPrice}>
                      Budget: KES {post.budgetMin} - {post.budgetMax}
                    </Text>
                  )}
                </View>
                
                {post.images.length > 0 && (
                  <Image
                    source={{ uri: post.images[0] }}
                    style={styles.postImage}
                  />
                )}
              </TouchableOpacity>
              
              {/* Stats */}
              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <Eye size={16} color="#6B7280" />
                  <Text style={styles.statText}>{post.views}</Text>
                </View>
                <View style={styles.statItem}>
                  <Heart size={16} color="#6B7280" />
                  <Text style={styles.statText}>{post.likes}</Text>
                </View>
                <View style={styles.statItem}>
                  <MessageCircle size={16} color="#6B7280" />
                  <Text style={styles.statText}>{post.messages}</Text>
                </View>
                <View style={styles.statItem}>
                  <TrendingUp size={16} color="#6B7280" />
                  <Text style={styles.statText}>
                    {((post.likes + post.messages) / post.views * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewPost(post)}
                  testID={`view-post-${post.id}`}
                >
                  <Eye size={16} color="#6B7280" />
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPost(post)}
                  testID={`edit-post-${post.id}`}
                >
                  <Edit3 size={16} color="#6B7280" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.archiveButton}
                  onPress={() => handleArchivePost(post.id)}
                  testID={`archive-post-${post.id}`}
                >
                  <Archive size={16} color={ORANGE} />
                  <Text style={styles.archiveButtonText}>
                    {post.status === 'published' ? 'Archive' : 'Restore'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  filterTabActive: {
    backgroundColor: GREEN,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgePublished: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeArchived: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextPublished: {
    color: '#16A34A',
  },
  statusBadgeTextArchived: {
    color: '#D97706',
  },
  postDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postContent: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  postMainContent: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  postCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  postPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: GREEN,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  archiveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    gap: 6,
  },
  archiveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ORANGE,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: GREEN,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WHITE,
  },
});