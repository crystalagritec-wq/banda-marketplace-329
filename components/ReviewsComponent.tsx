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
  Modal,
  Alert,
} from 'react-native';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  User,
  Camera,
  X,
  Send,
  Filter,
  ChevronDown,
} from 'lucide-react-native';
import { useLoyalty } from '@/providers/loyalty-provider';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

const GREEN = '#2E7D32';
const ORANGE = '#F57C00';
const WHITE = '#FFFFFF';
const GRAY = '#666666';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  replies: ReviewReply[];
}

interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  date: string;
  isVendor: boolean;
}

interface ReviewsComponentProps {
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  averageRating: number;
  totalReviews: number;
  onClose: () => void;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Mary Wanjiku',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    title: 'Excellent quality maize!',
    comment: 'The maize was fresh and of excellent quality. Delivered on time and well packaged. Will definitely order again.',
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop'],
    date: '2 days ago',
    verified: true,
    helpful: 12,
    notHelpful: 1,
    replies: [
      {
        id: 'reply1',
        userId: 'vendor1',
        userName: 'John Kamau (Vendor)',
        comment: 'Thank you for your positive feedback! We appreciate your business.',
        date: '1 day ago',
        isVendor: true,
      },
    ],
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Peter Mwangi',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    title: 'Good product, minor issues',
    comment: 'Overall good quality but some kernels were a bit dry. Price is fair and delivery was prompt.',
    images: [],
    date: '5 days ago',
    verified: true,
    helpful: 8,
    notHelpful: 2,
    replies: [],
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Grace Mutua',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    title: 'Perfect for my restaurant',
    comment: 'Consistent quality and great for bulk orders. The vendor is reliable and communicates well.',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop',
    ],
    date: '1 week ago',
    verified: true,
    helpful: 15,
    notHelpful: 0,
    replies: [],
  },
];

const ratingDistribution = [
  { stars: 5, count: 45, percentage: 75 },
  { stars: 4, count: 12, percentage: 20 },
  { stars: 3, count: 2, percentage: 3 },
  { stars: 2, count: 1, percentage: 2 },
  { stars: 1, count: 0, percentage: 0 },
];

export default function ReviewsComponent({
  productId,
  productName,
  vendorId,
  vendorName,
  averageRating,
  totalReviews,
  onClose,
}: ReviewsComponentProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'write'>('reviews');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>('newest');
  const [showSortModal, setShowSortModal] = useState<boolean>(false);
  
  const loyalty = useLoyalty();
  const { user } = useAuth();
  const submitReviewMutation = trpc.reviews.submit.useMutation();
  const awardPointsMutation = trpc.loyalty.awardPoints.useMutation();
  
  // Write review state
  const [newRating, setNewRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  const filteredReviews = mockReviews.filter(review => 
    filterRating ? review.rating === filterRating : true
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment about the product.');
      return;
    }

    try {
      const result = await submitReviewMutation.mutateAsync({
        userId: user?.id || '',
        productId: productId,
        vendorId: vendorId,
        rating: newRating,
        title: reviewTitle,
        comment: reviewComment,
        images: reviewImages,
      });

      if (result.success) {
        loyalty.awardPoints('review');
        
        await awardPointsMutation.mutateAsync({
          userId: user?.id || '',
          event: 'review',
          metadata: {
            reviewId: result.reviewId,
          },
        }).catch((err) => {
          console.error('[Reviews] Failed to award loyalty points:', err);
        });

        Alert.alert(
          'Review Submitted',
          'Thank you for your review! You earned 10 loyalty points. Your review will be published after verification.'
        );
        setActiveTab('reviews');
        setNewRating(0);
        setReviewTitle('');
        setReviewComment('');
        setReviewImages([]);
      } else {
        Alert.alert('Error', result.error || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('[Reviews] Submit error:', error);
      Alert.alert('Error', error?.message || 'Failed to submit review. Please try again.');
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setNewRating(star)}
            style={interactive ? styles.interactiveStar : undefined}
          >
            <Star
              size={size}
              color={star <= rating ? ORANGE : '#E5E5E5'}
              fill={star <= rating ? ORANGE : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.userAvatar }} style={styles.reviewerAvatar} />
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerNameRow}>
            <Text style={styles.reviewerName}>{item.userName}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.reviewMeta}>
            {renderStars(item.rating, 14)}
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
      </View>

      {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
      <Text style={styles.reviewComment}>{item.comment}</Text>

      {item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.helpfulButton}>
          <ThumbsUp size={16} color={GRAY} />
          <Text style={styles.helpfulText}>Helpful ({item.helpful})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpfulButton}>
          <ThumbsDown size={16} color={GRAY} />
          <Text style={styles.helpfulText}>({item.notHelpful})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.replyButton}>
          <MessageCircle size={16} color={GRAY} />
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
      </View>

      {item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <Text style={[styles.replyAuthor, reply.isVendor && styles.vendorReply]}>
                  {reply.userName}
                </Text>
                <Text style={styles.replyDate}>{reply.date}</Text>
              </View>
              <Text style={styles.replyComment}>{reply.comment}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Vendor Reviews</Text>
            <Text style={styles.headerSubtitle}>{vendorName}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={GRAY} />
          </TouchableOpacity>
        </View>

        <View style={styles.ratingOverview}>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
            {renderStars(averageRating, 20)}
            <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
          </View>
          
          <View style={styles.ratingDistribution}>
            {ratingDistribution.map((item) => (
              <TouchableOpacity
                key={item.stars}
                style={styles.distributionRow}
                onPress={() => setFilterRating(filterRating === item.stars ? null : item.stars)}
              >
                <Text style={styles.distributionStars}>{item.stars}</Text>
                <Star size={12} color={ORANGE} fill={ORANGE} />
                <View style={styles.distributionBar}>
                  <View
                    style={[
                      styles.distributionFill,
                      { width: `${item.percentage}%` },
                      filterRating === item.stars && styles.distributionActive,
                    ]}
                  />
                </View>
                <Text style={styles.distributionCount}>{item.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              All Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'write' && styles.activeTab]}
            onPress={() => setActiveTab('write')}
          >
            <Text style={[styles.tabText, activeTab === 'write' && styles.activeTabText]}>
              Write Review
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'reviews' ? (
          <>
            <View style={styles.filtersContainer}>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setShowSortModal(true)}
              >
                <Filter size={16} color={GRAY} />
                <Text style={styles.sortText}>Sort by: {sortBy}</Text>
                <ChevronDown size={16} color={GRAY} />
              </TouchableOpacity>
              
              {filterRating && (
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setFilterRating(null)}
                >
                  <Text style={styles.filterChipText}>{filterRating} stars</Text>
                  <X size={14} color={WHITE} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={sortedReviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.reviewsList}
            />
          </>
        ) : (
          <ScrollView style={styles.writeReviewContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.writeTitle}>Share your experience with {vendorName}</Text>
            
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Your Rating *</Text>
              {renderStars(newRating, 32, true)}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Review Title (Optional)</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Summarize your experience"
                value={reviewTitle}
                onChangeText={setReviewTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Your Review *</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Tell others about your experience with this product..."
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{reviewComment.length}/500</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Add Photos (Optional)</Text>
              <TouchableOpacity style={styles.photoButton}>
                <Camera size={24} color={GRAY} />
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Send size={18} color={WHITE} />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <Modal visible={showSortModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowSortModal(false)}
          >
            <View style={styles.sortModal}>
              <Text style={styles.sortModalTitle}>Sort Reviews</Text>
              {[
                { key: 'newest', label: 'Newest First' },
                { key: 'oldest', label: 'Oldest First' },
                { key: 'helpful', label: 'Most Helpful' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.sortOption}
                  onPress={() => {
                    setSortBy(option.key as any);
                    setShowSortModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.key && styles.sortOptionActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: GRAY,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  ratingOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  overallRating: {
    alignItems: 'center',
    marginRight: 24,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 12,
    color: GRAY,
    marginTop: 4,
  },
  ratingDistribution: {
    flex: 1,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distributionStars: {
    fontSize: 12,
    color: GRAY,
    width: 12,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 4,
  },
  distributionActive: {
    backgroundColor: GREEN,
  },
  distributionCount: {
    fontSize: 12,
    color: GRAY,
    width: 20,
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sortText: {
    fontSize: 14,
    color: GRAY,
    marginHorizontal: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: WHITE,
    marginRight: 4,
  },
  reviewsList: {
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: GREEN,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: GRAY,
    marginLeft: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  helpfulText: {
    fontSize: 12,
    color: GRAY,
    marginLeft: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyText: {
    fontSize: 12,
    color: GRAY,
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#F0F0F0',
  },
  replyCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  vendorReply: {
    color: GREEN,
  },
  replyDate: {
    fontSize: 12,
    color: GRAY,
  },
  replyComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  writeReviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  writeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginVertical: 16,
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactiveStar: {
    padding: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'right',
    marginTop: 4,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 24,
  },
  photoButtonText: {
    fontSize: 16,
    color: GRAY,
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: GRAY,
    textAlign: 'center',
  },
  sortOptionActive: {
    color: GREEN,
    fontWeight: '600',
  },
});