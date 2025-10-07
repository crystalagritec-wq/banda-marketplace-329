import React, { useState, useMemo, useCallback } from 'react';
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
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react-native';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
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
    banner: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop',
    description: 'Discover the latest in water-efficient farming technology. Live demos of drip irrigation systems and smart sensors.',
    location: 'Thika Innovation Hub',
    attendees: 245,
    maxAttendees: 400,
    category: 'Technology',
    organizer: 'AgriTech Kenya',
  },
].slice(0, 6);

export default function UpcomingEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [remindedEvents, setRemindedEvents] = useState<string[]>([]);

  const categories = useMemo(() => {
    const cats = new Set(mockEvents.map(e => e.category));
    return Array.from(cats);
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = mockEvents;
    
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Sort ongoing events first, then by date
    return filtered.sort((a, b) => {
      if (a.ongoing && !b.ongoing) return -1;
      if (!a.ongoing && b.ongoing) return 1;
      return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
    });
  }, [selectedCategory]);

  const handleJoinEvent = useCallback((event: EventItem) => {
    if (joinedEvents.includes(event.id)) {
      Alert.alert('Already Joined', `You have already joined ${event.title}`);
      return;
    }
    
    setJoinedEvents(prev => [...prev, event.id]);
    Alert.alert(
      'Event Joined!', 
      `You have successfully joined ${event.title}. You'll receive updates and reminders.`,
      [{ text: 'OK' }]
    );
  }, [joinedEvents]);

  const handleLearnMore = useCallback((event: EventItem) => {
    Alert.alert(
      event.title,
      `${event.description}\n\nOrganizer: ${event.organizer}\nLocation: ${event.location}\nAttendees: ${event.attendees}/${event.maxAttendees}`,
      [{ text: 'Close' }]
    );
  }, []);

  const handleRemindMe = useCallback((event: EventItem) => {
    if (remindedEvents.includes(event.id)) {
      Alert.alert('Reminder Set', `You already have a reminder set for ${event.title}`);
      return;
    }
    
    setRemindedEvents(prev => [...prev, event.id]);
    Alert.alert(
      'Reminder Set!', 
      `We'll remind you about ${event.title} one day before it starts.`,
      [{ text: 'OK' }]
    );
  }, [remindedEvents]);

  const getProgressPercentage = useCallback((attendees: number, maxAttendees: number) => {
    return Math.min((attendees / maxAttendees) * 100, 100);
  }, []);

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
        >
          <ArrowLeft size={24} color={GREEN} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Calendar size={20} color={GREEN} />
          <Text style={styles.headerTitle}>Upcoming Events</Text>
        </View>
        <View style={styles.headerSpacer} />
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map((event) => (
          <View 
            key={event.id} 
            style={[
              styles.eventCard,
              event.ongoing && styles.eventCardOngoing
            ]}
          >
            {/* Event Banner */}
            <View style={styles.eventBannerContainer}>
              <Image source={{ uri: event.banner }} style={styles.eventBanner} />
              
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
            </View>

            {/* Event Info */}
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaRow}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                
                <View style={styles.eventMetaRow}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
                
                <View style={styles.eventMetaRow}>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.eventAttendees}>
                    {event.attendees}/{event.maxAttendees} attending
                  </Text>
                </View>
              </View>

              <Text style={styles.eventDescription}>{event.description}</Text>
              
              <Text style={styles.eventOrganizer}>Organized by {event.organizer}</Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage(event.attendees, event.maxAttendees)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(getProgressPercentage(event.attendees, event.maxAttendees))}% full
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.eventActions}>
                <TouchableOpacity 
                  style={[
                    styles.joinButton,
                    joinedEvents.includes(event.id) && styles.joinButtonJoined
                  ]}
                  onPress={() => handleJoinEvent(event)}
                >
                  <Text style={[
                    styles.joinButtonText,
                    joinedEvents.includes(event.id) && styles.joinButtonTextJoined
                  ]}>
                    {joinedEvents.includes(event.id) ? 'Joined ✓' : 'Join'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.learnButton}
                  onPress={() => handleLearnMore(event)}
                >
                  <Text style={styles.learnButtonText}>Learn More</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.remindButton,
                    remindedEvents.includes(event.id) && styles.remindButtonSet
                  ]}
                  onPress={() => handleRemindMe(event)}
                >
                  <Clock size={14} color={remindedEvents.includes(event.id) ? GREEN : ORANGE} />
                  <Text style={[
                    styles.remindButtonText,
                    remindedEvents.includes(event.id) && styles.remindButtonTextSet
                  ]}>
                    {remindedEvents.includes(event.id) ? 'Reminder Set' : 'Remind Me'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
          </View>
        )}
      </ScrollView>
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
  filterContainer: {
    backgroundColor: WHITE,
    paddingVertical: 12,
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
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventCardOngoing: {
    borderWidth: 2,
    borderColor: GREEN,
    elevation: 6,
    shadowOpacity: 0.15,
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
  ongoingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: GREEN,
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
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
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
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventAttendees: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventOrganizer: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  joinButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    minWidth: 80,
  },
  joinButtonJoined: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: GREEN,
  },
  joinButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  joinButtonTextJoined: {
    color: GREEN,
  },
  learnButton: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    minWidth: 100,
  },
  learnButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  remindButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 120,
    justifyContent: 'center',
  },
  remindButtonSet: {
    backgroundColor: '#ECFDF5',
    borderColor: GREEN,
  },
  remindButtonText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '700',
  },
  remindButtonTextSet: {
    color: GREEN,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});