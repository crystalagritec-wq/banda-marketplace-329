import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Clock,
  ShoppingBag,
  MessageCircle,
  Heart,
  Star,
  Package,
  CreditCard,
  User,
  TrendingUp,
  Eye,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

type ActivityType = 
  | 'order' 
  | 'message' 
  | 'wishlist' 
  | 'review' 
  | 'product_view' 
  | 'payment' 
  | 'profile_update'
  | 'market_insight';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    chatId?: string;
    userId?: string;
    amount?: number;
    rating?: number;
  };
  status?: 'completed' | 'pending' | 'failed';
}

const getActivityIcon = (type: ActivityType) => {
  const iconProps = { size: 20, color: '#666' };
  
  switch (type) {
    case 'order':
      return <ShoppingBag {...iconProps} />;
    case 'message':
      return <MessageCircle {...iconProps} />;
    case 'wishlist':
      return <Heart {...iconProps} />;
    case 'review':
      return <Star {...iconProps} />;
    case 'product_view':
      return <Eye {...iconProps} />;
    case 'payment':
      return <CreditCard {...iconProps} />;
    case 'profile_update':
      return <User {...iconProps} />;
    case 'market_insight':
      return <TrendingUp {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'order':
      return '#4CAF50';
    case 'message':
      return '#2196F3';
    case 'wishlist':
      return '#E91E63';
    case 'review':
      return '#FF9800';
    case 'product_view':
      return '#9C27B0';
    case 'payment':
      return '#00BCD4';
    case 'profile_update':
      return '#607D8B';
    case 'market_insight':
      return '#3F51B5';
    default:
      return '#666';
  }
};

const navigateToActivity = (activity: Activity) => {
  const { type, metadata } = activity;
  
  try {
    switch (type) {
      case 'order':
        if (metadata?.orderId) {
          router.push(`/order-details?id=${metadata.orderId}`);
        }
        break;
      case 'message':
        if (metadata?.chatId) {
          router.push(`/(tabs)/chat?chatId=${metadata.chatId}`);
        } else {
          router.push('/(tabs)/chat');
        }
        break;
      case 'wishlist':
        router.push('/favorites');
        break;
      case 'review':
        if (metadata?.productId) {
          router.push(`/(tabs)/product/${metadata.productId}`);
        }
        break;
      case 'product_view':
        if (metadata?.productId) {
          router.push(`/(tabs)/product/${metadata.productId}`);
        }
        break;
      case 'payment':
        router.push('/(tabs)/wallet');
        break;
      case 'profile_update':
        router.push('/profile');
        break;
      case 'market_insight':
        router.push('/insights');
        break;
      default:
        Alert.alert('Navigation', 'This activity type is not yet supported');
    }
  } catch (error) {
    console.error('Navigation error:', error);
    Alert.alert('Error', 'Unable to navigate to this activity');
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return activityTime.toLocaleDateString();
};

export default function RecentActivityScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | ActivityType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user activities using tRPC
  const activitiesQuery = trpc.activity.getUserActivity.useQuery({
    limit: 50,
    offset: 0,
    type: selectedFilter === 'all' ? undefined : selectedFilter,
  });

  // Mock data - replace with actual tRPC query
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'order',
      title: 'Order Completed',
      description: 'Your order for Fresh Tomatoes has been delivered',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: { orderId: 'ORD-001', amount: 1500 },
      status: 'completed'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      description: 'John Farmer sent you a message about your inquiry',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { chatId: 'chat-123', userId: 'user-456' }
    },
    {
      id: '3',
      type: 'wishlist',
      title: 'Item Added to Wishlist',
      description: 'Organic Carrots added to your favorites',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      metadata: { productId: 'prod-789' }
    },
    {
      id: '4',
      type: 'review',
      title: 'Review Submitted',
      description: 'You rated Fresh Vegetables Store 5 stars',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      metadata: { productId: 'prod-123', rating: 5 }
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment Successful',
      description: 'KES 2,500 deposited to your wallet',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      metadata: { amount: 2500 },
      status: 'completed'
    },
    {
      id: '6',
      type: 'market_insight',
      title: 'Market Trend Alert',
      description: 'Tomato prices increased by 15% in your area',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const filteredActivities = selectedFilter === 'all' 
    ? mockActivities 
    : mockActivities.filter(activity => activity.type === selectedFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filterOptions = [
    { key: 'all', label: 'All', icon: Clock },
    { key: 'order', label: 'Orders', icon: ShoppingBag },
    { key: 'message', label: 'Messages', icon: MessageCircle },
    { key: 'payment', label: 'Payments', icon: CreditCard },
    { key: 'market_insight', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Recent Activity',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerTitleStyle: { fontWeight: '600' },
        }} 
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedFilter === option.key;
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterTab,
                  isSelected && styles.filterTabActive
                ]}
                onPress={() => setSelectedFilter(option.key as any)}
              >
                <IconComponent 
                  size={16} 
                  color={isSelected ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.filterTabText,
                  isSelected && styles.filterTabTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Activity List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>
              Your activity will appear here as you use the app
            </Text>
          </View>
        ) : (
          <View style={styles.activitiesList}>
            {filteredActivities.map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  index === filteredActivities.length - 1 && styles.lastActivityItem
                ]}
                onPress={() => navigateToActivity(activity)}
                activeOpacity={0.7}
              >
                <View style={styles.activityContent}>
                  <View style={[
                    styles.activityIconContainer,
                    { backgroundColor: getActivityColor(activity.type) + '15' }
                  ]}>
                    {getActivityIcon(activity.type)}
                  </View>
                  
                  <View style={styles.activityDetails}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {activity.title}
                      </Text>
                      <Text style={styles.activityTime}>
                        {formatTimeAgo(activity.timestamp)}
                      </Text>
                    </View>
                    
                    <Text style={styles.activityDescription} numberOfLines={2}>
                      {activity.description}
                    </Text>
                    
                    {activity.status && (
                      <View style={styles.statusContainer}>
                        <View style={[
                          styles.statusBadge,
                          activity.status === 'completed' && styles.statusCompleted,
                          activity.status === 'pending' && styles.statusPending,
                          activity.status === 'failed' && styles.statusFailed,
                        ]}>
                          <Text style={[
                            styles.statusText,
                            activity.status === 'completed' && styles.statusTextCompleted,
                            activity.status === 'pending' && styles.statusTextPending,
                            activity.status === 'failed' && styles.statusTextFailed,
                          ]}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  
                  <ChevronRight size={16} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  activitiesList: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lastActivityItem: {
    marginBottom: 0,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetails: {
    flex: 1,
    gap: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusContainer: {
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusFailed: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  statusTextCompleted: {
    color: '#4CAF50',
  },
  statusTextPending: {
    color: '#FF9800',
  },
  statusTextFailed: {
    color: '#f44336',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});