import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Bell,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const GREEN = '#2E7D32' as const;
const WHITE = '#FFFFFF' as const;

interface EventItem {
  id: string;
  title: string;
  date: string;
  dateStart: string;
  dateEnd: string;
  banner: string;
  description: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  ongoing?: boolean;
  category: string;
  organizer: string;
}

const mockEvents: EventItem[] = [
  {
    id: 'e1',
    title: 'Harvest Festival 2024',
    date: 'Oct 10–14',
    dateStart: '2024-10-10',
    dateEnd: '2024-10-14',
    banner: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
    description: 'Join us for the biggest agricultural celebration of the year! Up to 35% off seasonal produce, live demonstrations, and networking opportunities.',
    location: 'Nairobi Agricultural Center',
    attendees: 1250,
    maxAttendees: 2000,
    ongoing: true,
    category: 'Festival',
    organizer: 'Kenya Agricultural Board',
  },
  {
    id: 'e2',
    title: 'Tractor Hire Week',
    date: 'Nov 5–9',
    dateStart: '2024-11-05',
    dateEnd: '2024-11-09',
    banner: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop',
    description: 'Special discounts on tractor rentals and farm machinery. 15% off your next booking plus free maintenance consultation.',
    location: 'Mombasa Equipment Hub',
    attendees: 340,
    maxAttendees: 500,
    category: 'Equipment',
    organizer: 'AgriMachinery Ltd',
  },
  {
    id: 'e3',
    title: 'Organic Farming Workshop',
    date: 'Nov 12–13',
    dateStart: '2024-11-12',
    dateEnd: '2024-11-13',
    banner: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    description: 'Learn sustainable farming practices from expert agriculturalists. Hands-on training and certification included.',
    location: 'Kisumu Training Center',
    attendees: 89,
    maxAttendees: 150,
    category: 'Training',
    organizer: 'Green Farming Institute',
  },
  {
    id: 'e4',
    title: 'Seed Exchange Market',
    date: 'Nov 20–21',
    dateStart: '2024-11-20',
    dateEnd: '2024-11-21',
    banner: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1200&auto=format&fit=crop',
    description: 'Trade and discover new seed varieties. Connect with fellow farmers and expand your crop diversity.',
    location: 'Eldoret Market Square',
    attendees: 156,
    maxAttendees: 300,
    category: 'Market',
    organizer: 'Farmers Cooperative Union',
  },
  {
    id: 'e5',
    title: 'Livestock Health Summit',
    date: 'Dec 1–3',
    dateStart: '2024-12-01',
    dateEnd: '2024-12-03',
    banner: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop',
    description: 'Veterinary experts share latest practices in animal health and disease prevention. Free health checks for your livestock.',
    location: 'Nakuru Convention Center',
    attendees: 78,
    maxAttendees: 200,
    category: 'Health',
    organizer: 'Kenya Veterinary Association',
  },
  {
    id: 'e6',
    title: 'Smart Irrigation Expo',
    date: 'Dec 8–10',
    dateStart: '2024-12-08',
    dateEnd: '2024-12-10',
    banner: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1200&auto=format&fit=crop',
    description: 'Discover the latest in water-efficient farming technology. Live demos of drip irrigation systems and smart sensors.',
    location: 'Thika Innovation Hub',
    attendees: 245,
    maxAttendees: 400,
    category: 'Technology',
    organizer: 'AgriTech Kenya',
  },
];

export default function UpcomingEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [remindedEvents, setRemindedEvents] = useState<string[]>([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const categories = useMemo(() => {
    const cats = new Set(mockEvents.map(e => e.category));
    return Array.from(cats);
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = mockEvents;
    
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      if (a.ongoing && !b.ongoing) return -1;
      if (!a.ongoing && b.ongoing) return 1;
      return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
    });
  }, [selectedCategory]);

  const handleEventPress = useCallback((event: EventItem) => {
    router.push({ pathname: '/event/[eventId]', params: { eventId: event.id } });
  }, [router]);

  const handleRemindMe = useCallback((event: EventItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (remindedEvents.includes(event.id)) {
      setRemindedEvents(prev => prev.filter(id => id !== event.id));
    } else {
      setRemindedEvents(prev => [...prev, event.id]);
    }
  }, [remindedEvents]);

  const getProgressPercentage = useCallback((attendees: number, maxAttendees: number) => {
    return Math.min((attendees / maxAttendees) * 100, 100);
  }, []);

  const ongoingCount = useMemo(() => mockEvents.filter(e => e.ongoing).length, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Calendar size={22} color={GREEN} />
          <Text style={styles.headerTitle}>Events</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Sparkles size={28} color={WHITE} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Discover Agricultural Events</Text>
            <Text style={styles.heroSubtitle}>Workshops, festivals, and networking opportunities</Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{mockEvents.length}</Text>
            <Text style={styles.heroStatLabel}>Upcoming</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{ongoingCount}</Text>
            <Text style={styles.heroStatLabel}>Live Now</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{categories.length}</Text>
            <Text style={styles.heroStatLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterPill, selectedCategory === '' && styles.filterPillActive]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.filterPillText, selectedCategory === '' && styles.filterPillTextActive]}>
              All Events
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterPill, selectedCategory === category && styles.filterPillActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.filterPillText, selectedCategory === category && styles.filterPillTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {filteredEvents.map((event) => {
          const isReminded = remindedEvents.includes(event.id);
          const progressPercent = getProgressPercentage(event.attendees, event.maxAttendees);
          
          return (
            <TouchableOpacity 
              key={event.id} 
              style={[styles.eventCard, event.ongoing && styles.eventCardOngoing]}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.9}
            >
              {/* Event Banner */}
              <View style={styles.eventBannerContainer}>
                <Image source={{ uri: event.banner }} style={styles.eventBanner} />
                <View style={styles.bannerOverlay} />
                
                {/* Ongoing Badge */}
                {event.ongoing && (
                  <View style={styles.ongoingBadge}>
                    <View style={styles.ongoingDot} />
                    <Text style={styles.ongoingText}>LIVE NOW</Text>
                  </View>
                )}
                
                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{event.category}</Text>
                </View>

                {/* Attendees Preview */}
                <View style={styles.attendeesPreview}>
                  <Users size={14} color={WHITE} />
                  <Text style={styles.attendeesPreviewText}>{event.attendees.toLocaleString()}</Text>
                </View>
              </View>

              {/* Event Info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                
                <View style={styles.eventMeta}>
                  <View style={styles.eventMetaItem}>
                    <View style={[styles.metaIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Calendar size={14} color={GREEN} />
                    </View>
                    <Text style={styles.metaText}>{event.date}</Text>
                  </View>
                  
                  <View style={styles.eventMetaItem}>
                    <View style={[styles.metaIcon, { backgroundColor: '#EDE9FE' }]}>
                      <MapPin size={14} color="#7C3AED" />
                    </View>
                    <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                  </View>
                </View>

                <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                
                <Text style={styles.eventOrganizer}>By {event.organizer}</Text>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Attendance</Text>
                    <Text style={styles.progressPercent}>{Math.round(progressPercent)}% full</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { width: `${progressPercent}%` },
                        event.ongoing && styles.progressFillOngoing
                      ]} 
                    />
                  </View>
                  <Text style={styles.spotsLeft}>
                    {event.maxAttendees - event.attendees} spots remaining
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.eventActions}>
                  <TouchableOpacity 
                    style={[styles.remindButton, isReminded && styles.remindButtonActive]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemindMe(event);
                    }}
                  >
                    <Bell size={16} color={isReminded ? GREEN : '#6B7280'} fill={isReminded ? GREEN : 'transparent'} />
                    <Text style={[styles.remindButtonText, isReminded && styles.remindButtonTextActive]}>
                      {isReminded ? 'Reminded' : 'Remind Me'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <ChevronRight size={16} color={WHITE} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  heroBanner: {
    backgroundColor: GREEN,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: WHITE,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterContainer: {
    backgroundColor: WHITE,
    paddingVertical: 12,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: GREEN,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: GREEN,
  },
  scrollView: {
    flex: 1,
  },
  eventsContainer: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventCardOngoing: {
    borderWidth: 2,
    borderColor: GREEN,
  },
  eventBannerContainer: {
    position: 'relative',
    height: 160,
  },
  eventBanner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  ongoingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ongoingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  ongoingText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },
  attendeesPreview: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendeesPreviewText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 12,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventOrganizer: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  progressSection: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 3,
  },
  progressFillOngoing: {
    backgroundColor: '#EF4444',
  },
  spotsLeft: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 10,
  },
  remindButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  remindButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  remindButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  remindButtonTextActive: {
    color: GREEN,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
