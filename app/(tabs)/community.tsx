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
  MessageCircle,
  Users,
  TrendingUp,
  Search,
  Plus,
  Star,
  Eye,
  ThumbsUp,
  Award,
  BookOpen,
  ChevronRight,
  Trophy,
  Lightbulb,
} from 'lucide-react-native';

const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';
const LIGHT_GREEN = '#E8F5E8';
const GRAY = '#666666';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  postCount: number;
  memberCount: number;
  color: string;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  replies: number;
  views: number;
  likes: number;
  timeAgo: string;
  isHot: boolean;
  isPinned: boolean;
  tags: string[];
}

interface Expert {
  id: string;
  name: string;
  avatar: string;
  expertise: string;
  rating: number;
  answersCount: number;
  isVerified: boolean;
}

const forumCategories: ForumCategory[] = [
  {
    id: '1',
    name: 'Crop Farming',
    description: 'Discuss crop cultivation, pest control, and harvest techniques',
    icon: <BookOpen size={24} color={GREEN} />,
    postCount: 1247,
    memberCount: 3420,
    color: GREEN,
  },
  {
    id: '2',
    name: 'Livestock & Poultry',
    description: 'Animal husbandry, breeding, and veterinary care',
    icon: <Users size={24} color={ORANGE} />,
    postCount: 892,
    memberCount: 2156,
    color: ORANGE,
  },
  {
    id: '3',
    name: 'Market Insights',
    description: 'Price trends, market analysis, and trading tips',
    icon: <TrendingUp size={24} color="#1976D2" />,
    postCount: 634,
    memberCount: 1890,
    color: '#1976D2',
  },
  {
    id: '4',
    name: 'Technology & Innovation',
    description: 'Modern farming techniques and agricultural technology',
    icon: <Award size={24} color="#7B1FA2" />,
    postCount: 423,
    memberCount: 1234,
    color: '#7B1FA2',
  },
];

const hotDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'Best practices for maize farming in dry season',
    author: 'John Kamau',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    category: 'Crop Farming',
    replies: 23,
    views: 456,
    likes: 34,
    timeAgo: '2 hours ago',
    isHot: true,
    isPinned: false,
    tags: ['maize', 'dry-season', 'irrigation'],
  },
  {
    id: '2',
    title: 'Dairy cow nutrition during lactation period',
    author: 'Mary Wanjiku',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    category: 'Livestock & Poultry',
    replies: 18,
    views: 289,
    likes: 27,
    timeAgo: '4 hours ago',
    isHot: true,
    isPinned: true,
    tags: ['dairy', 'nutrition', 'lactation'],
  },
  {
    id: '3',
    title: 'Current tomato prices in Nairobi markets',
    author: 'Peter Mwangi',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    category: 'Market Insights',
    replies: 12,
    views: 178,
    likes: 15,
    timeAgo: '6 hours ago',
    isHot: false,
    isPinned: false,
    tags: ['tomatoes', 'prices', 'nairobi'],
  },
];

const experts: Expert[] = [
  {
    id: '1',
    name: 'Dr. Sarah Njeri',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    expertise: 'Crop Protection Specialist',
    rating: 4.9,
    answersCount: 234,
    isVerified: true,
  },
  {
    id: '2',
    name: 'James Ochieng',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    expertise: 'Livestock Veterinarian',
    rating: 4.8,
    answersCount: 189,
    isVerified: true,
  },
  {
    id: '3',
    name: 'Grace Mutua',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    expertise: 'Agricultural Economist',
    rating: 4.7,
    answersCount: 156,
    isVerified: true,
  },
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'forums' | 'discussions' | 'experts'>('forums');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const insets = useSafeAreaInsets();

  const renderForumCategory = ({ item }: { item: ForumCategory }) => (
    <TouchableOpacity style={styles.categoryCard} testID={`category-${item.id}`}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: `${item.color}15` }]}>
          {item.icon}
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.categoryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.postCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.memberCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDiscussion = ({ item }: { item: Discussion }) => (
    <TouchableOpacity style={styles.discussionCard} testID={`discussion-${item.id}`}>
      {item.isPinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedText}>PINNED</Text>
        </View>
      )}
      {item.isHot && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>🔥 HOT</Text>
        </View>
      )}
      
      <View style={styles.discussionHeader}>
        <Image source={{ uri: item.authorAvatar }} style={styles.authorAvatar} />
        <View style={styles.discussionMeta}>
          <Text style={styles.discussionTitle}>{item.title}</Text>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.categoryTag}>{item.category}</Text>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
        </View>
      </View>

      <View style={styles.discussionTags}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.discussionStats}>
        <View style={styles.statGroup}>
          <MessageCircle size={16} color={GRAY} />
          <Text style={styles.statText}>{item.replies}</Text>
        </View>
        <View style={styles.statGroup}>
          <Eye size={16} color={GRAY} />
          <Text style={styles.statText}>{item.views}</Text>
        </View>
        <View style={styles.statGroup}>
          <ThumbsUp size={16} color={GRAY} />
          <Text style={styles.statText}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExpert = ({ item }: { item: Expert }) => (
    <TouchableOpacity style={styles.expertCard} testID={`expert-${item.id}`}>
      <View style={styles.expertHeader}>
        <Image source={{ uri: item.avatar }} style={styles.expertAvatar} />
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Award size={12} color={WHITE} />
          </View>
        )}
      </View>
      <Text style={styles.expertName}>{item.name}</Text>
      <Text style={styles.expertExpertise}>{item.expertise}</Text>
      
      <View style={styles.expertRating}>
        <Star size={14} color={ORANGE} fill={ORANGE} />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      
      <Text style={styles.answersCount}>{item.answersCount} answers</Text>
      
      <TouchableOpacity style={styles.askButton}>
        <Text style={styles.askButtonText}>Ask Question</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.newPostButton} testID="new-post-button">
          <Plus size={20} color={WHITE} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={GRAY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions, experts, topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forums' && styles.activeTab]}
          onPress={() => setActiveTab('forums')}
          testID="forums-tab"
        >
          <Text style={[styles.tabText, activeTab === 'forums' && styles.activeTabText]}>
            Forums
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussions' && styles.activeTab]}
          onPress={() => setActiveTab('discussions')}
          testID="discussions-tab"
        >
          <Text style={[styles.tabText, activeTab === 'discussions' && styles.activeTabText]}>
            Hot Topics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'experts' && styles.activeTab]}
          onPress={() => setActiveTab('experts')}
          testID="experts-tab"
        >
          <Text style={[styles.tabText, activeTab === 'experts' && styles.activeTabText]}>
            Experts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'forums' && (
          <>
            {/* Quick Access Cards */}
            <View style={styles.quickAccessContainer}>
              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={() => console.log('Navigate to success stories')}
              >
                <Trophy size={24} color={ORANGE} />
                <Text style={styles.quickAccessTitle}>Success Stories</Text>
                <Text style={styles.quickAccessSubtitle}>Inspiring farmer journeys</Text>
                <ChevronRight size={16} color={GRAY} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAccessCard}
                onPress={() => console.log('Navigate to knowledge hub')}
              >
                <Lightbulb size={24} color={GREEN} />
                <Text style={styles.quickAccessTitle}>Knowledge Hub</Text>
                <Text style={styles.quickAccessSubtitle}>Learn & grow together</Text>
                <ChevronRight size={16} color={GRAY} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={forumCategories}
              renderItem={renderForumCategory}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {activeTab === 'discussions' && (
          <FlatList
            data={hotDiscussions}
            renderItem={renderDiscussion}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}

        {activeTab === 'experts' && (
          <FlatList
            data={experts}
            renderItem={renderExpert}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.expertRow}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  newPostButton: {
    backgroundColor: GREEN,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
    paddingHorizontal: 20,
  },
  categoryCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: GRAY,
    lineHeight: 20,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: GREEN,
  },
  statLabel: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  discussionCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: GREEN,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: ORANGE,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  discussionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  discussionMeta: {
    flex: 1,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 22,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: GREEN,
    marginRight: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: ORANGE,
    backgroundColor: `${ORANGE}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: GRAY,
  },
  discussionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '500',
  },
  discussionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: GRAY,
    marginLeft: 4,
    fontWeight: '500',
  },
  expertCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  expertRow: {
    justifyContent: 'space-between',
  },
  expertHeader: {
    position: 'relative',
    marginBottom: 8,
  },
  expertAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: GREEN,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  expertExpertise: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 8,
  },
  expertRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: ORANGE,
    marginLeft: 4,
  },
  answersCount: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 12,
  },
  askButton: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  askButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 8,
  },
});