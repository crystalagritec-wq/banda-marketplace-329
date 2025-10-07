import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  User,
  MessageCircle,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  timePosted: string;
  status: 'open' | 'in_progress' | 'completed';
  requester: {
    name: string;
    rating: number;
    verified: boolean;
  };
  responses: number;
  urgency: 'low' | 'medium' | 'high';
}

const mockRequests: Request[] = [
  {
    id: '1',
    title: 'Need 50kg of Quality Maize Seeds',
    description: 'Looking for certified maize seeds for planting season. Must be drought resistant variety.',
    category: 'Seeds',
    location: 'Nakuru',
    budget: 15000,
    timePosted: '2 hours ago',
    status: 'open',
    requester: {
      name: 'John Kamau',
      rating: 4.8,
      verified: true,
    },
    responses: 12,
    urgency: 'high',
  },
  {
    id: '2',
    title: 'Tractor Services for Land Preparation',
    description: 'Need tractor services for 5 acres of land preparation. Must be available next week.',
    category: 'Services',
    location: 'Eldoret',
    budget: 25000,
    timePosted: '4 hours ago',
    status: 'open',
    requester: {
      name: 'Mary Wanjiku',
      rating: 4.6,
      verified: true,
    },
    responses: 8,
    urgency: 'medium',
  },
  {
    id: '3',
    title: 'Organic Fertilizer - 20 Bags',
    description: 'Looking for organic fertilizer for vegetable farming. Prefer locally made.',
    category: 'Inputs',
    location: 'Meru',
    budget: 12000,
    timePosted: '6 hours ago',
    status: 'in_progress',
    requester: {
      name: 'Peter Mwangi',
      rating: 4.9,
      verified: false,
    },
    responses: 15,
    urgency: 'low',
  },
  {
    id: '4',
    title: 'Fresh Tomatoes - 100kg Weekly Supply',
    description: 'Restaurant needs consistent supply of fresh tomatoes. Long-term contract available.',
    category: 'Produce',
    location: 'Nairobi',
    budget: 8000,
    timePosted: '1 day ago',
    status: 'open',
    requester: {
      name: 'Grace Akinyi',
      rating: 4.7,
      verified: true,
    },
    responses: 23,
    urgency: 'medium',
  },
];

const categories = ['All', 'Seeds', 'Services', 'Inputs', 'Produce', 'Equipment', 'Livestock'];

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredRequests = useMemo(() => {
    return mockRequests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           request.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || request.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatPrice = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Requests</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => console.log('Create new request')}
            testID="add-request-btn"
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Post Request</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search requests..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="search-input"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => console.log('Open filters')}
            testID="filter-btn"
          >
            <Filter size={20} color="#2D5016" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              testID={`category-${category}`}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filter */}
        <View style={styles.statusContainer}>
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'open', label: 'Open' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
          ].map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusPill,
                selectedStatus === status.key && styles.statusPillActive,
              ]}
              onPress={() => setSelectedStatus(status.key)}
              testID={`status-${status.key}`}
            >
              <Text
                style={[
                  styles.statusText,
                  selectedStatus === status.key && styles.statusTextActive,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Requests List */}
        <ScrollView
          style={styles.requestsList}
          contentContainerStyle={styles.requestsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() => console.log('Open request details', request.id)}
              testID={`request-${request.id}`}
            >
              <View style={styles.requestHeader}>
                <View style={styles.requestHeaderLeft}>
                  <Text style={styles.requestTitle} numberOfLines={2}>
                    {request.title}
                  </Text>
                  <View style={styles.requestMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{request.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.urgencyBadge,
                        { backgroundColor: getUrgencyColor(request.urgency) },
                      ]}
                    >
                      <Text style={styles.urgencyText}>
                        {request.urgency.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.requestDescription} numberOfLines={2}>
                {request.description}
              </Text>

              <View style={styles.requestDetails}>
                <View style={styles.locationContainer}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.locationText}>{request.location}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.timeText}>{request.timePosted}</Text>
                </View>
              </View>

              <View style={styles.requestFooter}>
                <View style={styles.requesterInfo}>
                  <View style={styles.requesterAvatar}>
                    <User size={16} color="#2D5016" />
                  </View>
                  <View style={styles.requesterDetails}>
                    <View style={styles.requesterNameRow}>
                      <Text style={styles.requesterName}>{request.requester.name}</Text>
                      {request.requester.verified && (
                        <CheckCircle2 size={14} color="#10B981" />
                      )}
                    </View>
                    <View style={styles.ratingContainer}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.rating}>{request.requester.rating}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <Text style={styles.budget}>{formatPrice(request.budget)}</Text>
                  <View style={styles.responsesContainer}>
                    <MessageCircle size={16} color="#666" />
                    <Text style={styles.responsesText}>{request.responses}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredRequests.length === 0 && (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No requests found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5016',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryPill: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryPillActive: {
    backgroundColor: '#2D5016',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTextActive: {
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  statusPill: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusPillActive: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusTextActive: {
    color: 'white',
  },
  requestsList: {
    flex: 1,
  },
  requestsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  urgencyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  requestDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requesterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  requesterDetails: {
    flex: 1,
  },
  requesterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  requestActions: {
    alignItems: 'flex-end',
  },
  budget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  responsesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responsesText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});