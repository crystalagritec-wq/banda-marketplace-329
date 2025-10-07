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
  Trash2,
  Send,
  Clock,
} from 'lucide-react-native';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface DraftItem {
  id: string;
  type: 'product' | 'service' | 'request';
  title: string;
  category: string;
  description: string;
  price?: string;
  budgetMin?: string;
  budgetMax?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const mockDrafts: DraftItem[] = [
  {
    id: '1',
    type: 'product',
    title: 'Organic Maize Seeds - 10kg',
    category: 'Seeds',
    description: 'High quality organic maize seeds suitable for all soil types...',
    price: '2500',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
  },
  {
    id: '2',
    type: 'service',
    title: 'Tractor Plowing Service',
    category: 'Mechanization',
    description: 'Professional tractor plowing service for all farm sizes...',
    price: '5000',
    images: [],
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
  },
  {
    id: '3',
    type: 'request',
    title: 'Looking for Quality Fertilizer',
    category: 'Inputs',
    description: 'Need NPK fertilizer for 5 acres of maize farm...',
    budgetMin: '15000',
    budgetMax: '25000',
    images: [],
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-13T11:20:00Z',
  },
];

export default function MyDraftsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      // Mock loading from AsyncStorage/Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDrafts(mockDrafts);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDraft = (draft: DraftItem) => {
    // Navigate to appropriate edit screen
    switch (draft.type) {
      case 'product':
        router.push(`/post-product?draftId=${draft.id}`);
        break;
      case 'service':
        router.push(`/post-service?draftId=${draft.id}`);
        break;
      case 'request':
        router.push(`/post-request?draftId=${draft.id}`);
        break;
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDrafts(prev => prev.filter(d => d.id !== draftId));
          },
        },
      ]
    );
  };

  const handlePublishDraft = async (draft: DraftItem) => {
    Alert.alert(
      'Publish Draft',
      'Are you sure you want to publish this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              // Mock publish to Supabase
              await new Promise(resolve => setTimeout(resolve, 1500));
              setDrafts(prev => prev.filter(d => d.id !== draft.id));
              Alert.alert('Success', `${draft.type} published successfully!`);
            } catch (error) {
              Alert.alert('Error', 'Failed to publish draft');
            }
          },
        },
      ]
    );
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <Text style={styles.headerTitle}>My Drafts</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading drafts...</Text>
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
        <Text style={styles.headerTitle}>My Drafts</Text>
        <View style={styles.headerRight} />
      </View>

      {drafts.length === 0 ? (
        <View style={styles.emptyState}>
          <Clock size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Drafts Yet</Text>
          <Text style={styles.emptyStateText}>
            Your saved drafts will appear here. Start creating a post to save drafts.
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
            {drafts.length} Draft{drafts.length !== 1 ? 's' : ''}
          </Text>
          
          {drafts.map((draft) => (
            <View key={draft.id} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <View style={styles.draftTypeRow}>
                  {getTypeIcon(draft.type)}
                  <Text style={styles.draftType}>
                    {draft.type.charAt(0).toUpperCase() + draft.type.slice(1)}
                  </Text>
                </View>
                <Text style={styles.draftDate}>
                  {formatDate(draft.updatedAt)}
                </Text>
              </View>
              
              <View style={styles.draftContent}>
                <Text style={styles.draftTitle} numberOfLines={2}>
                  {draft.title}
                </Text>
                <Text style={styles.draftCategory}>{draft.category}</Text>
                <Text style={styles.draftDescription} numberOfLines={2}>
                  {draft.description}
                </Text>
                
                {draft.price && (
                  <Text style={styles.draftPrice}>KES {draft.price}</Text>
                )}
                
                {draft.budgetMin && draft.budgetMax && (
                  <Text style={styles.draftPrice}>
                    Budget: KES {draft.budgetMin} - {draft.budgetMax}
                  </Text>
                )}
                
                {draft.images.length > 0 && (
                  <View style={styles.draftImages}>
                    {draft.images.slice(0, 3).map((imageUri, index) => (
                      <Image
                        key={index}
                        source={{ uri: imageUri }}
                        style={styles.draftImage}
                      />
                    ))}
                    {draft.images.length > 3 && (
                      <View style={styles.moreImagesOverlay}>
                        <Text style={styles.moreImagesText}>
                          +{draft.images.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              
              <View style={styles.draftActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditDraft(draft)}
                  testID={`edit-draft-${draft.id}`}
                >
                  <Edit3 size={16} color="#6B7280" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDraft(draft.id)}
                  testID={`delete-draft-${draft.id}`}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.publishButton}
                  onPress={() => handlePublishDraft(draft)}
                  testID={`publish-draft-${draft.id}`}
                >
                  <Send size={16} color={WHITE} />
                  <Text style={styles.publishButtonText}>Publish</Text>
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
  draftCard: {
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
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  draftTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  draftType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  draftDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  draftContent: {
    marginBottom: 16,
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  draftCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  draftDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  draftPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: GREEN,
    marginBottom: 8,
  },
  draftImages: {
    flexDirection: 'row',
    gap: 8,
    position: 'relative',
  },
  draftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  moreImagesOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  draftActions: {
    flexDirection: 'row',
    gap: 8,
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
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  publishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: GREEN,
    gap: 6,
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
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