import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Share,
  Linking,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  Bell,
  CheckCircle,
  ChevronRight,
  Star,
  Ticket,
  Navigation,
  Phone,
  Mail,
  Globe,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';


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
  address: string;
  attendees: number;
  maxAttendees: number;
  ongoing?: boolean;
  category: string;
  organizer: string;
  organizerLogo: string;
  organizerPhone: string;
  organizerEmail: string;
  organizerWebsite: string;
  ticketPrice: number;
  highlights: string[];
  schedule: { time: string; activity: string }[];
  speakers: { name: string; role: string; avatar: string }[];
}

const mockEvents: Record<string, EventItem> = {
  'e1': {
    id: 'e1',
    title: 'Harvest Festival 2024',
    date: 'Oct 10–14',
    dateStart: '2024-10-10',
    dateEnd: '2024-10-14',
    banner: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
    description: 'Join us for the biggest agricultural celebration of the year! Experience live demonstrations, networking opportunities with industry leaders, and exclusive discounts up to 35% on seasonal produce. This five-day festival brings together farmers, suppliers, and agricultural enthusiasts from across East Africa.',
    location: 'Nairobi Agricultural Center',
    address: 'Uhuru Gardens, Lang\'ata Road, Nairobi',
    attendees: 1250,
    maxAttendees: 2000,
    ongoing: true,
    category: 'Festival',
    organizer: 'Kenya Agricultural Board',
    organizerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    organizerPhone: '+254 700 123 456',
    organizerEmail: 'events@kab.co.ke',
    organizerWebsite: 'https://kab.co.ke',
    ticketPrice: 500,
    highlights: [
      'Up to 35% off seasonal produce',
      'Live farming demonstrations',
      'Networking with industry leaders',
      'Free soil testing services',
      'Kids activity zone',
    ],
    schedule: [
      { time: '08:00 AM', activity: 'Registration & Welcome Coffee' },
      { time: '09:00 AM', activity: 'Opening Ceremony' },
      { time: '10:00 AM', activity: 'Keynote: Future of Agriculture' },
      { time: '12:00 PM', activity: 'Lunch Break & Networking' },
      { time: '02:00 PM', activity: 'Workshop Sessions' },
      { time: '05:00 PM', activity: 'Product Showcase' },
    ],
    speakers: [
      { name: 'Dr. Sarah Wanjiku', role: 'Agricultural Scientist', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop' },
      { name: 'John Mwangi', role: 'Farming Expert', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop' },
      { name: 'Grace Achieng', role: 'Sustainability Lead', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop' },
    ],
  },
  'e2': {
    id: 'e2',
    title: 'Tractor Hire Week',
    date: 'Nov 5–9',
    dateStart: '2024-11-05',
    dateEnd: '2024-11-09',
    banner: 'https://images.unsplash.com/photo-1506801310323-534be5e7e4e5?q=80&w=1200&auto=format&fit=crop',
    description: 'Special discounts on tractor rentals and farm machinery. Get 15% off your next booking plus free maintenance consultation. Perfect opportunity for small-scale farmers to access premium equipment at affordable rates.',
    location: 'Mombasa Equipment Hub',
    address: 'Industrial Area, Mombasa',
    attendees: 340,
    maxAttendees: 500,
    category: 'Equipment',
    organizer: 'AgriMachinery Ltd',
    organizerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    organizerPhone: '+254 711 234 567',
    organizerEmail: 'rentals@agrimachinery.co.ke',
    organizerWebsite: 'https://agrimachinery.co.ke',
    ticketPrice: 0,
    highlights: [
      '15% off all tractor rentals',
      'Free maintenance consultation',
      'Flexible payment plans',
      'On-site training available',
    ],
    schedule: [
      { time: '09:00 AM', activity: 'Equipment Showcase Opens' },
      { time: '11:00 AM', activity: 'Live Demonstrations' },
      { time: '02:00 PM', activity: 'One-on-One Consultations' },
      { time: '04:00 PM', activity: 'Special Offers Announcement' },
    ],
    speakers: [
      { name: 'Peter Ochieng', role: 'Equipment Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop' },
    ],
  },
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  
  const [isJoined, setIsJoined] = useState(false);
  const [isReminded, setIsReminded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const event = mockEvents[eventId || 'e1'] || mockEvents['e1'];

  useEffect(() => {
    if (event.ongoing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [event.ongoing, pulseAnim]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  const getProgressPercentage = useCallback((attendees: number, maxAttendees: number) => {
    return Math.min((attendees / maxAttendees) * 100, 100);
  }, []);

  const handleJoin = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsJoined(!isJoined);
  }, [isJoined]);

  const handleReminder = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsReminded(!isReminded);
  }, [isReminded]);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out ${event.title} happening ${event.date} at ${event.location}!`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [event]);

  const handleDirections = useCallback(() => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(event.address)}`;
    Linking.openURL(url);
  }, [event.address]);

  const handleCall = useCallback(() => {
    Linking.openURL(`tel:${event.organizerPhone}`);
  }, [event.organizerPhone]);

  const handleEmail = useCallback(() => {
    Linking.openURL(`mailto:${event.organizerEmail}`);
  }, [event.organizerEmail]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={WHITE} />
          </TouchableOpacity>
          <Text style={styles.animatedHeaderTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={22} color={WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Fixed Back Button */}
      <TouchableOpacity 
        style={[styles.floatingBackButton, { top: insets.top + 12 }]} 
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={WHITE} />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Animated.View style={[styles.heroContainer, { transform: [{ scale: imageScale }] }]}>
          <Image source={{ uri: event.banner }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          
          {event.ongoing && (
            <Animated.View style={[styles.liveBadge, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>HAPPENING NOW</Text>
            </Animated.View>
          )}

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity 
              style={[styles.heroActionButton, isFavorite && styles.heroActionButtonActive]} 
              onPress={handleFavorite}
            >
              <Heart size={20} color={isFavorite ? '#EF4444' : WHITE} fill={isFavorite ? '#EF4444' : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroActionButton} onPress={handleShare}>
              <Share2 size={20} color={WHITE} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Users size={16} color={GREEN} />
                <Text style={styles.statText}>{event.attendees.toLocaleString()} attending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Star size={16} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.statText}>4.8 rating</Text>
              </View>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#ECFDF5' }]}>
                <Calendar size={20} color={GREEN} />
              </View>
              <View style={styles.quickInfoText}>
                <Text style={styles.quickInfoLabel}>Date</Text>
                <Text style={styles.quickInfoValue}>{event.date}</Text>
              </View>
            </View>

            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#FEF3C7' }]}>
                <Clock size={20} color={ORANGE} />
              </View>
              <View style={styles.quickInfoText}>
                <Text style={styles.quickInfoLabel}>Time</Text>
                <Text style={styles.quickInfoValue}>8:00 AM - 6:00 PM</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.quickInfoCard} onPress={handleDirections}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#EDE9FE' }]}>
                <MapPin size={20} color="#7C3AED" />
              </View>
              <View style={styles.quickInfoText}>
                <Text style={styles.quickInfoLabel}>Location</Text>
                <Text style={styles.quickInfoValue} numberOfLines={1}>{event.location}</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Attendance Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Attendance</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getProgressPercentage(event.attendees, event.maxAttendees))}% full
              </Text>
            </View>
            <View style={styles.progressBarLarge}>
              <View 
                style={[
                  styles.progressFillLarge, 
                  { width: `${getProgressPercentage(event.attendees, event.maxAttendees)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {event.maxAttendees - event.attendees} spots remaining
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Highlights</Text>
            <View style={styles.highlightsList}>
              {event.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <View style={styles.highlightBullet}>
                    <CheckCircle size={16} color={GREEN} />
                  </View>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Schedule</Text>
            <View style={styles.scheduleList}>
              {event.schedule.map((item, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <View style={styles.scheduleTime}>
                    <Text style={styles.scheduleTimeText}>{item.time}</Text>
                  </View>
                  <View style={styles.scheduleConnector}>
                    <View style={styles.scheduleConnectorDot} />
                    {index < event.schedule.length - 1 && <View style={styles.scheduleConnectorLine} />}
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleActivity}>{item.activity}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Speakers */}
          {event.speakers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Speakers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speakersList}>
                {event.speakers.map((speaker, index) => (
                  <View key={index} style={styles.speakerCard}>
                    <Image source={{ uri: speaker.avatar }} style={styles.speakerAvatar} />
                    <Text style={styles.speakerName}>{speaker.name}</Text>
                    <Text style={styles.speakerRole}>{speaker.role}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Organizer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organized By</Text>
            <View style={styles.organizerCard}>
              <Image source={{ uri: event.organizerLogo }} style={styles.organizerLogo} />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.organizer}</Text>
                <View style={styles.organizerActions}>
                  <TouchableOpacity style={styles.organizerAction} onPress={handleCall}>
                    <Phone size={16} color={GREEN} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.organizerAction} onPress={handleEmail}>
                    <Mail size={16} color={GREEN} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.organizerAction} onPress={() => Linking.openURL(event.organizerWebsite)}>
                    <Globe size={16} color={GREEN} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Location Map Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.mapCard} onPress={handleDirections}>
              <View style={styles.mapPlaceholder}>
                <MapPin size={32} color={GREEN} />
                <Text style={styles.mapText}>{event.location}</Text>
                <Text style={styles.mapAddress}>{event.address}</Text>
              </View>
              <View style={styles.directionsButton}>
                <Navigation size={16} color={WHITE} />
                <Text style={styles.directionsText}>Get Directions</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceSection}>
          {event.ticketPrice > 0 ? (
            <>
              <Text style={styles.priceLabel}>Entry Fee</Text>
              <Text style={styles.priceValue}>KES {event.ticketPrice.toLocaleString()}</Text>
            </>
          ) : (
            <>
              <Text style={styles.priceLabel}>Entry</Text>
              <Text style={[styles.priceValue, { color: GREEN }]}>FREE</Text>
            </>
          )}
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={[styles.reminderButton, isReminded && styles.reminderButtonActive]} 
            onPress={handleReminder}
          >
            <Bell size={20} color={isReminded ? GREEN : '#6B7280'} fill={isReminded ? GREEN : 'transparent'} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.joinButton, isJoined && styles.joinButtonJoined]}
            onPress={handleJoin}
          >
            {isJoined ? (
              <>
                <CheckCircle size={20} color={GREEN} />
                <Text style={styles.joinButtonTextJoined}>Joined</Text>
              </>
            ) : (
              <>
                <Ticket size={20} color={WHITE} />
                <Text style={styles.joinButtonText}>Join Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: GREEN,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerBackButton: {
    padding: 4,
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  liveBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  liveText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
  },
  heroActions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  heroActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActionButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  content: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  quickInfoContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  quickInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  quickInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickInfoText: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '700',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressPercentage: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '700',
  },
  progressBarLarge: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 5,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  scheduleList: {
    gap: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleTime: {
    width: 80,
  },
  scheduleTimeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  scheduleConnector: {
    alignItems: 'center',
    width: 24,
  },
  scheduleConnectorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
    borderWidth: 3,
    borderColor: '#ECFDF5',
  },
  scheduleConnectorLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  scheduleContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  scheduleActivity: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  speakersList: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  speakerCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  speakerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#ECFDF5',
  },
  speakerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  speakerRole: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  organizerLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  organizerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  organizerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  mapText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  mapAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    paddingVertical: 14,
    gap: 8,
  },
  directionsText: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceSection: {},
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  joinButtonJoined: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: GREEN,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  joinButtonTextJoined: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
});
