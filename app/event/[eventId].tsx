import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Bell,
  CheckCircle2,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const GREEN = '#2E7D32' as const;
const WHITE = '#FFFFFF' as const;
const ORANGE = '#F57C00' as const;

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
  organizerLogo: string;
  schedule: { time: string; activity: string }[];
  highlights: string[];
  requirements: string[];
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
}

const mockEvents: Record<string, EventItem> = {
  e1: {
    id: 'e1',
    title: 'Harvest Festival 2024',
    date: 'Oct 10–14',
    dateStart: '2024-10-10',
    dateEnd: '2024-10-14',
    banner: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop',
    description: 'Join us for the biggest agricultural celebration of the year! Experience a week of farming excellence with up to 35% off seasonal produce, live demonstrations from expert farmers, networking opportunities with industry leaders, and hands-on workshops. This is your chance to connect with the agricultural community and discover the latest innovations in farming.',
    location: 'Nairobi Agricultural Center, Nairobi CBD',
    attendees: 1250,
    maxAttendees: 2000,
    ongoing: true,
    category: 'Festival',
    organizer: 'Kenya Agricultural Board',
    organizerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop',
    schedule: [
      { time: '09:00 AM', activity: 'Opening Ceremony & Keynote Speech' },
      { time: '11:00 AM', activity: 'Product Exhibition & Market Tours' },
      { time: '01:00 PM', activity: 'Lunch Break & Networking' },
      { time: '02:30 PM', activity: 'Live Farming Demonstrations' },
      { time: '04:00 PM', activity: 'Panel Discussion: Future of Agriculture' },
      { time: '06:00 PM', activity: 'Evening Mixer & Awards Ceremony' },
    ],
    highlights: [
      '35% discount on seasonal produce',
      'Meet 100+ verified vendors',
      'Live farming demonstrations',
      'Expert consultation sessions',
      'Networking opportunities',
      'Agricultural innovation showcase',
    ],
    requirements: [
      'Valid ID for registration',
      'Farming business card (if applicable)',
      'Comfortable footwear for tours',
      'Notebook for workshops',
    ],
    contact: {
      email: 'info@kenyaagriboard.co.ke',
      phone: '+254 700 123 456',
      website: 'www.harvestfestival.co.ke',
    },
  },
};

export default function EventDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [isReminded, setIsReminded] = useState(false);

  const event = useMemo(() => {
    return mockEvents[eventId as string] || mockEvents.e1;
  }, [eventId]);

  const getDaysUntilEvent = useCallback(() => {
    const today = new Date();
    const start = new Date(event.dateStart);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [event]);

  const daysLeft = getDaysUntilEvent();
  const progressPercent = Math.min((event.attendees / event.maxAttendees) * 100, 100);

  const handleRegister = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRegistered(true);
    Alert.alert(
      'Registration Successful!',
      `You're registered for ${event.title}. We'll send you a confirmation email shortly.`,
      [{ text: 'OK' }]
    );
  }, [event.title]);

  const handleRemind = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsReminded(!isReminded);
    if (!isReminded) {
      Alert.alert('Reminder Set', `We'll notify you before ${event.title} starts.`);
    }
  }, [isReminded, event.title]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${event.title}! ${event.date} at ${event.location}. Join ${event.attendees} attendees!`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [event]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: event.banner }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={WHITE} />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
        >
          <Share2 size={20} color={WHITE} />
        </TouchableOpacity>

        {/* Status Badges */}
        {event.ongoing && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>
        )}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{event.category}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>{event.title}</Text>
          
          {/* Organizer */}
          <View style={styles.organizerRow}>
            <Image source={{ uri: event.organizerLogo }} style={styles.organizerLogo} />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <Text style={styles.organizerName}>{event.organizer}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={16} color={GREEN} />
            </View>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#ECFDF5' }]}>
                <Calendar size={20} color={GREEN} />
              </View>
              <Text style={styles.quickInfoLabel}>Date</Text>
              <Text style={styles.quickInfoValue}>{event.date}</Text>
            </View>

            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#EDE9FE' }]}>
                <MapPin size={20} color="#7C3AED" />
              </View>
              <Text style={styles.quickInfoLabel}>Location</Text>
              <Text style={styles.quickInfoValue} numberOfLines={1}>{event.location.split(',')[0]}</Text>
            </View>

            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#FFF7ED' }]}>
                <Users size={20} color={ORANGE} />
              </View>
              <Text style={styles.quickInfoLabel}>Attendees</Text>
              <Text style={styles.quickInfoValue}>{event.attendees}</Text>
            </View>

            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: '#FEF2F2' }]}>
                <Clock size={20} color="#EF4444" />
              </View>
              <Text style={styles.quickInfoLabel}>Days Left</Text>
              <Text style={styles.quickInfoValue}>{daysLeft > 0 ? daysLeft : 'Live'}</Text>
            </View>
          </View>

          {/* Attendance Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Registration Status</Text>
              <Text style={styles.progressPercent}>{Math.round(progressPercent)}% Full</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.spotsText}>
              {event.maxAttendees - event.attendees} spots remaining out of {event.maxAttendees}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={ORANGE} />
              <Text style={styles.sectionTitle}>Event Highlights</Text>
            </View>
            {event.highlights.map((highlight, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemBullet}>
                  <CheckCircle2 size={16} color={GREEN} />
                </View>
                <Text style={styles.listItemText}>{highlight}</Text>
              </View>
            ))}
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={GREEN} />
              <Text style={styles.sectionTitle}>Event Schedule</Text>
            </View>
            {event.schedule.map((item, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.scheduleTimeText}>{item.time}</Text>
                </View>
                <View style={styles.scheduleActivity}>
                  <View style={styles.scheduleMarker} />
                  <Text style={styles.scheduleActivityText}>{item.activity}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Award size={20} color="#7C3AED" />
              <Text style={styles.sectionTitle}>What to Bring</Text>
            </View>
            {event.requirements.map((req, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemNumber}>
                  <Text style={styles.listItemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.listItemText}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{event.contact.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{event.contact.phone}</Text>
              </View>
              {event.contact.website && (
                <TouchableOpacity style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <View style={styles.websiteRow}>
                    <Text style={styles.websiteLink}>{event.contact.website}</Text>
                    <ExternalLink size={16} color={GREEN} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity 
          style={[styles.remindButton, isReminded && styles.remindButtonActive]}
          onPress={handleRemind}
        >
          <Bell size={20} color={isReminded ? GREEN : '#6B7280'} fill={isReminded ? GREEN : 'transparent'} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.registerButton, isRegistered && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isRegistered}
        >
          <Text style={styles.registerButtonText}>
            {isRegistered ? '✓ Registered' : 'Register Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerImageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 80,
    left: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  liveBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 36,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  organizerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  organizerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  organizerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 6,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickInfoCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 4,
  },
  spotsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  listItemBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  listItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  scheduleTime: {
    width: 90,
    paddingTop: 2,
  },
  scheduleTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  scheduleActivity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginTop: 6,
    marginRight: 12,
  },
  scheduleActivityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#1F2937',
  },
  contactCard: {
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  contactItem: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  websiteLink: {
    fontSize: 15,
    fontWeight: '600',
    color: GREEN,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  remindButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remindButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  registerButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#ECFDF5',
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: WHITE,
  },
});
