import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Search, 
  ShoppingCart, 
  Gift, 
  MessageCircle,
  Package,
  Truck,
  DollarSign,
  Star,
  Bell,
  CheckCircle2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  isRead: boolean;
  badge?: string;
}

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface ChatMessage {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  unreadCount?: number;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'offers' | 'requests'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const notificationsQuery = trpc.notifications.getNotifications.useQuery(
    { unreadOnly: false, limit: 50, offset: 0 },
    { enabled: !!user?.id, refetchOnMount: true }
  );

  const markReadMutation = trpc.notifications.markRead.useMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await notificationsQuery.refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markReadMutation.mutateAsync({ notificationId });
        notificationsQuery.refetch();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'delivery': return Truck;
      case 'payment': return DollarSign;
      case 'review': return Star;
      case 'offer': return Gift;
      case 'reminder': return Bell;
      case 'message': return MessageCircle;
      case 'success': return CheckCircle2;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return { icon: '#10B981', bg: '#D1FAE5' };
      case 'delivery': return { icon: '#3B82F6', bg: '#DBEAFE' };
      case 'payment': return { icon: '#F59E0B', bg: '#FEF3C7' };
      case 'review': return { icon: '#8B5CF6', bg: '#EDE9FE' };
      case 'offer': return { icon: '#EF4444', bg: '#FEE2E2' };
      case 'reminder': return { icon: '#F59E0B', bg: '#FEF3C7' };
      case 'message': return { icon: '#10B981', bg: '#D1FAE5' };
      case 'success': return { icon: '#10B981', bg: '#D1FAE5' };
      default: return { icon: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const notifications: Notification[] = (notificationsQuery.data?.data || []).map((n: NotificationData) => {
    const colors = getNotificationColor(n.type);
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.message,
      time: new Date(n.created_at).toLocaleString(),
      icon: getNotificationIcon(n.type),
      iconColor: colors.icon,
      iconBg: colors.bg,
      isRead: n.is_read,
      badge: n.type.charAt(0).toUpperCase() + n.type.slice(1),
    };
  });

  const chatMessages: ChatMessage[] = [
    {
      id: '1',
      name: 'Rift Hatcheries',
      message: 'Your order for 100 broiler chicks has been confirmed.',
      time: '2025-08-05',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Wanja Farms',
      message: 'Hello, why is my order for eggs taking so long to deliver?',
      time: '2025-01-20',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      unreadCount: 1
    },
    {
      id: '3',
      name: 'Agri-Machinery Dealers',
      message: '[Picture]',
      time: '2025-08-04',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n: Notification) => !n.isRead);
      case 'offers':
        return notifications.filter((n: Notification) => n.type === 'offer' || n.type === 'promo');
      case 'requests':
        return notifications.filter((n: Notification) => n.type === 'request');
      default:
        return notifications;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'unread':
        return notifications.filter((n: Notification) => !n.isRead).length;
      case 'offers':
        return notifications.filter((n: Notification) => n.type === 'offer' || n.type === 'promo').length;
      case 'requests':
        return notifications.filter((n: Notification) => n.type === 'request').length;
      default:
        return notifications.length;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton}>
            <ShoppingCart size={20} color="#6B7280" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notificationsQuery.isLoading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          )}
          {/* My Messages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Messages</Text>
            <Text style={styles.sectionSubtitle}>All your notifications, reminders, and offers in one place.</Text>
            
            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{getTabCount('all')}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
                onPress={() => setActiveTab('unread')}
              >
                <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>Unread</Text>
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{getTabCount('unread')}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'offers' && styles.activeTab]}
                onPress={() => setActiveTab('offers')}
              >
                <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>Offers & Promos</Text>
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{getTabCount('offers')}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                onPress={() => setActiveTab('requests')}
              >
                <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests</Text>
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{getTabCount('requests')}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <View style={styles.notificationsList}>
              {getFilteredNotifications().length === 0 && !notificationsQuery.isLoading ? (
                <View style={styles.emptyState}>
                  <Bell size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateTitle}>No notifications yet</Text>
                  <Text style={styles.emptyStateText}>You&apos;ll see updates about your orders, deliveries, and more here</Text>
                </View>
              ) : (
                getFilteredNotifications().map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <TouchableOpacity 
                      key={notification.id} 
                      style={[
                        styles.notificationItem,
                        !notification.isRead && styles.notificationItemUnread
                      ]}
                      onPress={() => handleNotificationPress(notification.id, notification.isRead)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.notificationIcon, { backgroundColor: notification.iconBg }]}>
                        <IconComponent size={20} color={notification.iconColor} />
                      </View>
                      
                      <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          <View style={styles.notificationMeta}>
                            <Text style={styles.notificationTime}>{notification.time}</Text>
                            {!notification.isRead && <View style={styles.unreadDot} />}
                          </View>
                        </View>
                        
                        <Text style={styles.notificationDescription} numberOfLines={2}>{notification.description}</Text>
                        
                        <View style={styles.notificationBadge}>
                          <Text style={styles.notificationBadgeText}>{notification.badge}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {/* Chats with Sellers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Chats with Sellers</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Your direct conversations with marketplace sellers.</Text>
            
            <View style={styles.chatsList}>
              {chatMessages.map((chat) => (
                <TouchableOpacity key={chat.id} style={styles.chatItem}>
                  <Image source={{ uri: chat.avatar }} style={styles.chatAvatar} />
                  
                  <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatName}>{chat.name}</Text>
                      <Text style={styles.chatTime}>{chat.time}</Text>
                    </View>
                    <Text style={styles.chatMessage}>{chat.message}</Text>
                  </View>
                  
                  {chat.unreadCount && (
                    <View style={styles.chatUnreadBadge}>
                      <Text style={styles.chatUnreadText}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 6,
  },
  activeTabText: {
    color: '#1F2937',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationItemUnread: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  chatsList: {
    gap: 16,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  chatUnreadBadge: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  chatUnreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});