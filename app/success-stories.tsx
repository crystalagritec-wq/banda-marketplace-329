import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  Quote,
  TrendingUp,
  Award,
  Users,
  Calendar,
  MapPin,
  Play,
  Heart,
  Share2,
  ChevronRight,
} from 'lucide-react-native';
import { router } from 'expo-router';

const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';
const GRAY = '#666666';

interface SuccessStory {
  id: string;
  title: string;
  summary: string;
  farmerName: string;
  farmerAvatar: string;
  location: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  videoThumbnail?: string;
  hasVideo: boolean;
  metrics: {
    yieldIncrease: number;
    incomeIncrease: number;
    timeframe: string;
  };
  tags: string[];
  date: string;
  likes: number;
  isLiked: boolean;
  testimonial: string;
}

interface Testimonial {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  authorTitle: string;
  location: string;
  rating: number;
  date: string;
  category: string;
  verified: boolean;
}

const mockSuccessStories: SuccessStory[] = [
  {
    id: '1',
    title: 'From 2 to 20 Acres: Mary\'s Organic Farming Journey',
    summary: 'How Mary Wanjiku transformed her small plot into a thriving organic farm using sustainable practices and community support.',
    farmerName: 'Mary Wanjiku',
    farmerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    location: 'Kiambu County',
    category: 'Organic Farming',
    beforeImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&h=200&fit=crop',
    videoThumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
    hasVideo: true,
    metrics: {
      yieldIncrease: 300,
      incomeIncrease: 450,
      timeframe: '2 years',
    },
    tags: ['Organic', 'Sustainable', 'Community'],
    date: '2024-01-15',
    likes: 234,
    isLiked: false,
    testimonial: 'Banda connected me with the right buyers and taught me organic farming techniques. My income has increased by 450% in just 2 years!',
  },
  {
    id: '2',
    title: 'Tech-Enabled Dairy Farming Success',
    summary: 'John Kamau leveraged modern technology and data-driven insights to triple his dairy production.',
    farmerName: 'John Kamau',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    location: 'Nakuru County',
    category: 'Dairy Farming',
    beforeImage: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=200&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop',
    hasVideo: false,
    metrics: {
      yieldIncrease: 200,
      incomeIncrease: 280,
      timeframe: '18 months',
    },
    tags: ['Technology', 'Dairy', 'Innovation'],
    date: '2024-02-20',
    likes: 189,
    isLiked: true,
    testimonial: 'The platform helped me access modern farming techniques and connect with veterinary services. My dairy production has tripled!',
  },
  {
    id: '3',
    title: 'Youth in Agriculture: Peter\'s Greenhouse Revolution',
    summary: 'A young entrepreneur\'s journey from unemployment to running a successful greenhouse business.',
    farmerName: 'Peter Mwangi',
    farmerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    location: 'Meru County',
    category: 'Greenhouse Farming',
    beforeImage: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=300&h=200&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
    videoThumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    hasVideo: true,
    metrics: {
      yieldIncrease: 500,
      incomeIncrease: 600,
      timeframe: '1 year',
    },
    tags: ['Youth', 'Greenhouse', 'Innovation'],
    date: '2024-03-10',
    likes: 312,
    isLiked: false,
    testimonial: 'Banda gave me the knowledge and connections I needed to start my greenhouse business. Now I employ 5 people!',
  },
];

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    content: 'Banda has revolutionized how I sell my produce. Direct access to buyers means better prices and no middlemen taking cuts.',
    author: 'Grace Mutua',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Vegetable Farmer',
    location: 'Machakos County',
    rating: 5,
    date: '2024-01-20',
    category: 'Marketplace',
    verified: true,
  },
  {
    id: '2',
    content: 'The community forums are incredible. I\'ve learned so much from other farmers and experts. It\'s like having an agricultural university in my pocket.',
    author: 'Samuel Kiprop',
    authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Maize Farmer',
    location: 'Uasin Gishu County',
    rating: 5,
    date: '2024-02-05',
    category: 'Community',
    verified: true,
  },
  {
    id: '3',
    content: 'Fast delivery and quality products. Banda has made it so easy to get farming inputs delivered right to my farm.',
    author: 'Rose Wanjiru',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    authorTitle: 'Dairy Farmer',
    location: 'Nyeri County',
    rating: 4,
    date: '2024-02-15',
    category: 'Delivery',
    verified: false,
  },
];

export default function SuccessStoriesScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'stories' | 'testimonials'>('stories');
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set(['2']));

  const toggleLike = (storyId: string) => {
    const newLikedStories = new Set(likedStories);
    if (newLikedStories.has(storyId)) {
      newLikedStories.delete(storyId);
    } else {
      newLikedStories.add(storyId);
    }
    setLikedStories(newLikedStories);
  };

  const renderSuccessStory = ({ item }: { item: SuccessStory }) => (
    <TouchableOpacity style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <Image source={{ uri: item.farmerAvatar }} style={styles.farmerAvatar} />
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{item.farmerName}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={GRAY} />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.storyActions}>
          <TouchableOpacity onPress={() => toggleLike(item.id)}>
            <Heart
              size={20}
              color={likedStories.has(item.id) ? '#DC2626' : GRAY}
              fill={likedStories.has(item.id) ? '#DC2626' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Share2 size={18} color={GRAY} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.storyTitle}>{item.title}</Text>
      <Text style={styles.storySummary}>{item.summary}</Text>

      <View style={styles.beforeAfterContainer}>
        <View style={styles.beforeAfterItem}>
          <Text style={styles.beforeAfterLabel}>Before</Text>
          <Image source={{ uri: item.beforeImage }} style={styles.beforeAfterImage} />
        </View>
        <View style={styles.beforeAfterArrow}>
          <ChevronRight size={24} color={GREEN} />
        </View>
        <View style={styles.beforeAfterItem}>
          <Text style={styles.beforeAfterLabel}>After</Text>
          <View style={styles.afterImageContainer}>
            <Image source={{ uri: item.afterImage }} style={styles.beforeAfterImage} />
            {item.hasVideo && (
              <TouchableOpacity style={styles.playButton}>
                <Play size={16} color={WHITE} fill={WHITE} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <TrendingUp size={16} color={GREEN} />
          <Text style={styles.metricValue}>+{item.metrics.yieldIncrease}%</Text>
          <Text style={styles.metricLabel}>Yield</Text>
        </View>
        <View style={styles.metricItem}>
          <Award size={16} color={ORANGE} />
          <Text style={styles.metricValue}>+{item.metrics.incomeIncrease}%</Text>
          <Text style={styles.metricLabel}>Income</Text>
        </View>
        <View style={styles.metricItem}>
          <Calendar size={16} color={'#3B82F6'} />
          <Text style={styles.metricValue}>{item.metrics.timeframe}</Text>
          <Text style={styles.metricLabel}>Timeline</Text>
        </View>
      </View>

      <View style={styles.testimonialContainer}>
        <Quote size={16} color={GREEN} />
        <Text style={styles.testimonialText}>{item.testimonial}</Text>
      </View>

      <View style={styles.storyFooter}>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.storyStats}>
          <Text style={styles.likesCount}>{item.likes + (likedStories.has(item.id) ? 1 : 0)} likes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTestimonial = ({ item }: { item: Testimonial }) => (
    <View style={styles.testimonialCard}>
      <View style={styles.testimonialHeader}>
        <Image source={{ uri: item.authorAvatar }} style={styles.testimonialAvatar} />
        <View style={styles.testimonialAuthorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={styles.testimonialAuthor}>{item.author}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Award size={12} color={WHITE} />
              </View>
            )}
          </View>
          <Text style={styles.authorTitle}>{item.authorTitle}</Text>
          <View style={styles.testimonialLocationRow}>
            <MapPin size={10} color={GRAY} />
            <Text style={styles.testimonialLocation}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              color={star <= item.rating ? ORANGE : '#E5E5E5'}
              fill={star <= item.rating ? ORANGE : 'transparent'}
            />
          ))}
        </View>
      </View>

      <Text style={styles.testimonialContent}>{item.content}</Text>

      <View style={styles.testimonialFooter}>
        <View style={styles.testimonialCategoryBadge}>
          <Text style={styles.testimonialCategoryText}>{item.category}</Text>
        </View>
        <Text style={styles.testimonialDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={GRAY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Success Stories</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.statsOverview}>
        <View style={styles.statCard}>
          <Users size={20} color={GREEN} />
          <Text style={styles.statNumber}>2,500+</Text>
          <Text style={styles.statLabel}>Farmers Helped</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={ORANGE} />
          <Text style={styles.statNumber}>350%</Text>
          <Text style={styles.statLabel}>Avg. Income Increase</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color={'#3B82F6'} />
          <Text style={styles.statNumber}>95%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stories' && styles.activeTab]}
          onPress={() => setActiveTab('stories')}
        >
          <Text style={[styles.tabText, activeTab === 'stories' && styles.activeTabText]}>
            Success Stories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'testimonials' && styles.activeTab]}
          onPress={() => setActiveTab('testimonials')}
        >
          <Text style={[styles.tabText, activeTab === 'testimonials' && styles.activeTabText]}>
            Testimonials
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'stories' ? (
          <FlatList
            data={mockSuccessStories}
            renderItem={renderSuccessStory}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
          />
        ) : (
          <FlatList
            data={mockTestimonials}
            renderItem={renderTestimonial}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsList}
          />
        )}
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
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
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
  content: {
    flex: 1,
  },
  storiesList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  storyCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  farmerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    color: GRAY,
  },
  categoryBadge: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '500',
  },
  storyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
  },
  storySummary: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  beforeAfterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  beforeAfterItem: {
    flex: 1,
    alignItems: 'center',
  },
  beforeAfterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
    marginBottom: 8,
  },
  beforeAfterImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  beforeAfterArrow: {
    paddingHorizontal: 8,
  },
  afterImageContainer: {
    position: 'relative',
    width: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  metricLabel: {
    fontSize: 12,
    color: GRAY,
  },
  testimonialContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  testimonialText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  tag: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: GREEN,
    fontWeight: '500',
  },
  storyStats: {
    marginLeft: 12,
  },
  likesCount: {
    fontSize: 12,
    color: GRAY,
    fontWeight: '500',
  },
  testimonialsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  testimonialCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialAuthorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  verifiedBadge: {
    backgroundColor: GREEN,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorTitle: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 4,
  },
  testimonialLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  testimonialLocation: {
    fontSize: 10,
    color: GRAY,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testimonialCategoryBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  testimonialCategoryText: {
    fontSize: 10,
    color: ORANGE,
    fontWeight: '500',
  },
  testimonialDate: {
    fontSize: 10,
    color: GRAY,
  },
});