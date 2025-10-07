import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Video,
  FileText,
  Users,
  Star,
  Play,
  Bookmark,
  Share2,
  Filter,
  TrendingUp,
  Award,
  Eye,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';

const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';
const GRAY = '#666666';

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'webinar';
  category: string;
  author: string;
  authorAvatar: string;
  authorTitle: string;
  thumbnail: string;
  duration?: string;
  readTime?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviewCount: number;
  views: number;
  likes: number;
  bookmarks: number;
  publishDate: string;
  tags: string[];
  isBookmarked: boolean;
  isLiked: boolean;
  isPremium: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  itemCount: number;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Crop Farming',
    icon: <BookOpen size={20} color={GREEN} />,
    color: GREEN,
    itemCount: 124,
  },
  {
    id: '2',
    name: 'Livestock',
    icon: <Users size={20} color={ORANGE} />,
    color: ORANGE,
    itemCount: 89,
  },
  {
    id: '3',
    name: 'Technology',
    icon: <TrendingUp size={20} color="#3B82F6" />,
    color: '#3B82F6',
    itemCount: 67,
  },
  {
    id: '4',
    name: 'Business',
    icon: <Award size={20} color="#7B1FA2" />,
    color: '#7B1FA2',
    itemCount: 45,
  },
];

const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    title: 'Complete Guide to Organic Maize Farming',
    description: 'Learn sustainable maize farming techniques that increase yield while protecting the environment.',
    type: 'guide',
    category: 'Crop Farming',
    author: 'Dr. Sarah Njeri',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Agricultural Specialist',
    thumbnail: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop',
    readTime: '15 min read',
    difficulty: 'Intermediate',
    rating: 4.8,
    reviewCount: 234,
    views: 1250,
    likes: 189,
    bookmarks: 67,
    publishDate: '2024-01-15',
    tags: ['Organic', 'Maize', 'Sustainable'],
    isBookmarked: false,
    isLiked: true,
    isPremium: false,
  },
  {
    id: '2',
    title: 'Modern Dairy Farming Techniques',
    description: 'Video series covering modern dairy farming practices, from feeding to milking automation.',
    type: 'video',
    category: 'Livestock',
    author: 'James Ochieng',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Livestock Veterinarian',
    thumbnail: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=200&fit=crop',
    duration: '45 min',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 156,
    views: 890,
    likes: 234,
    bookmarks: 89,
    publishDate: '2024-02-01',
    tags: ['Dairy', 'Technology', 'Automation'],
    isBookmarked: true,
    isLiked: false,
    isPremium: true,
  },
  {
    id: '3',
    title: 'Pest Control in Vegetable Gardens',
    description: 'Natural and chemical methods for controlling common pests in vegetable farming.',
    type: 'article',
    category: 'Crop Farming',
    author: 'Grace Mutua',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Crop Protection Expert',
    thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    readTime: '8 min read',
    difficulty: 'Beginner',
    rating: 4.6,
    reviewCount: 98,
    views: 567,
    likes: 123,
    bookmarks: 45,
    publishDate: '2024-02-10',
    tags: ['Pest Control', 'Vegetables', 'Natural'],
    isBookmarked: false,
    isLiked: false,
    isPremium: false,
  },
  {
    id: '4',
    title: 'Agricultural Finance & Investment Webinar',
    description: 'Live webinar on securing funding and making smart investments in agriculture.',
    type: 'webinar',
    category: 'Business',
    author: 'Peter Mwangi',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Agricultural Economist',
    thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
    duration: '90 min',
    difficulty: 'Intermediate',
    rating: 4.7,
    reviewCount: 67,
    views: 345,
    likes: 89,
    bookmarks: 34,
    publishDate: '2024-02-20',
    tags: ['Finance', 'Investment', 'Business'],
    isBookmarked: true,
    isLiked: true,
    isPremium: true,
  },
];

export default function KnowledgeHubScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'trending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set(['2', '4']));
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set(['1', '4']));

  const toggleBookmark = (itemId: string) => {
    const newBookmarked = new Set(bookmarkedItems);
    if (newBookmarked.has(itemId)) {
      newBookmarked.delete(itemId);
    } else {
      newBookmarked.add(itemId);
    }
    setBookmarkedItems(newBookmarked);
  };

  const toggleLike = (itemId: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
    }
    setLikedItems(newLiked);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} color={WHITE} />;
      case 'article':
        return <FileText size={16} color={WHITE} />;
      case 'guide':
        return <BookOpen size={16} color={WHITE} />;
      case 'webinar':
        return <Users size={16} color={WHITE} />;
      default:
        return <FileText size={16} color={WHITE} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return '#DC2626';
      case 'article':
        return '#3B82F6';
      case 'guide':
        return GREEN;
      case 'webinar':
        return '#7B1FA2';
      default:
        return GRAY;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10B981';
      case 'Intermediate':
        return ORANGE;
      case 'Advanced':
        return '#DC2626';
      default:
        return GRAY;
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && { borderColor: item.color, borderWidth: 2 },
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${item.color}15` }]}>
        {item.icon}
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.itemCount} items</Text>
    </TouchableOpacity>
  );

  const renderKnowledgeItem = ({ item }: { item: KnowledgeItem }) => (
    <TouchableOpacity style={styles.knowledgeCard}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]}>
          {getTypeIcon(item.type)}
        </View>
        {item.type === 'video' && (
          <TouchableOpacity style={styles.playButton}>
            <Play size={20} color={WHITE} fill={WHITE} />
          </TouchableOpacity>
        )}
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Award size={12} color={WHITE} />
          </View>
        )}
      </View>

      <View style={styles.knowledgeContent}>
        <View style={styles.knowledgeHeader}>
          <Text style={styles.knowledgeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.knowledgeActions}>
            <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
              <Bookmark
                size={18}
                color={bookmarkedItems.has(item.id) ? ORANGE : GRAY}
                fill={bookmarkedItems.has(item.id) ? ORANGE : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Share2 size={16} color={GRAY} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.knowledgeDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.authorInfo}>
          <Image source={{ uri: item.authorAvatar }} style={styles.authorAvatar} />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.authorTitle}>{item.authorTitle}</Text>
          </View>
        </View>

        <View style={styles.knowledgeMeta}>
          <View style={styles.metaLeft}>
            <View style={styles.ratingContainer}>
              <Star size={12} color={ORANGE} fill={ORANGE} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.duration}>
              {item.type === 'video' || item.type === 'webinar' ? item.duration : item.readTime}
            </Text>
          </View>
        </View>

        <View style={styles.knowledgeStats}>
          <View style={styles.statItem}>
            <Eye size={12} color={GRAY} />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.statItem}>
            <TouchableOpacity onPress={() => toggleLike(item.id)}>
              <ThumbsUp
                size={12}
                color={likedItems.has(item.id) ? GREEN : GRAY}
                fill={likedItems.has(item.id) ? GREEN : 'transparent'}
              />
            </TouchableOpacity>
            <Text style={styles.statText}>{item.likes + (likedItems.has(item.id) ? 1 : 0)}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={12} color={GRAY} />
            <Text style={styles.statText}>{item.reviewCount}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredItems = mockKnowledgeItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || 
                           categories.find(c => c.id === selectedCategory)?.name === item.category;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'bookmarks' && bookmarkedItems.has(item.id)) ||
                      (activeTab === 'trending' && item.views > 500);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={GRAY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Knowledge Hub</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={18} color={GRAY} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={GRAY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles, videos, guides..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Content
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.activeTabText]}>
            Bookmarks
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FlatList
          data={filteredItems}
          renderItem={renderKnowledgeItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.knowledgeList}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  categoriesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 10,
    color: GRAY,
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
    fontSize: 14,
    fontWeight: '600',
    color: GRAY,
  },
  activeTabText: {
    color: GREEN,
  },
  content: {
    flex: 1,
  },
  knowledgeList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  knowledgeCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  typeIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: ORANGE,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knowledgeContent: {
    padding: 16,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  knowledgeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
    marginRight: 12,
  },
  knowledgeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  knowledgeDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  authorTitle: {
    fontSize: 10,
    color: GRAY,
  },
  knowledgeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 10,
    color: GRAY,
  },
  difficultyBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  difficultyText: {
    fontSize: 10,
    color: WHITE,
    fontWeight: '600',
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 12,
    color: GRAY,
    fontWeight: '500',
  },
  knowledgeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: GRAY,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '500',
  },
});