import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Briefcase,
  Wrench,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Package,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

export default function ServiceProviderDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const profileQuery = trpc.serviceProviders.getMyProfile.useQuery();

  const stats = {
    todayEarnings: 0,
    jobsCompleted: 0,
    averageRating: 0,
    activeListings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
  };

  const handleAddService = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/management/services/listings/new');
  };

  const handleListEquipment = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/management/services/equipment/new');
  };

  if (profileQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Provider</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Manage your services and grow your business
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
              <DollarSign size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>
              KES {stats.todayEarnings.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Today&apos;s Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Calendar size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>{stats.jobsCompleted}</Text>
            <Text style={styles.statLabel}>Jobs Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Star size={24} color={COLORS.orange} />
            </View>
            <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E0F2FE' }]}>
              <Package size={24} color="#0284C7" />
            </View>
            <Text style={styles.statValue}>{stats.activeListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleAddService}>
            <View style={styles.actionIcon}>
              <Briefcase size={28} color={COLORS.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add New Service</Text>
              <Text style={styles.actionDescription}>
                List your skills and expertise
              </Text>
            </View>
            <Plus size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleListEquipment}>
            <View style={styles.actionIcon}>
              <Wrench size={28} color={COLORS.orange} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>List Equipment</Text>
              <Text style={styles.actionDescription}>
                Add equipment for rent
              </Text>
            </View>
            <Plus size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Manage</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View style={styles.menuIconContainer}>
              <Briefcase size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Services</Text>
              <Text style={styles.menuSubtitle}>View and edit your service listings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View style={styles.menuIconContainer}>
              <Wrench size={22} color={COLORS.orange} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Equipment</Text>
              <Text style={styles.menuSubtitle}>Manage your equipment rentals</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          >
            <View style={styles.menuIconContainer}>
              <Calendar size={22} color={COLORS.success} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Bookings</Text>
              <Text style={styles.menuSubtitle}>
                {stats.pendingBookings} pending bookings
              </Text>
            </View>
            {stats.pendingBookings > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendingBookings}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <TrendingUp size={22} color="#0284C7" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Analytics</Text>
              <Text style={styles.menuSubtitle}>View performance insights</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Users size={22} color="#8B5CF6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Reviews</Text>
              <Text style={styles.menuSubtitle}>Manage customer feedback</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.earningsCard}>
          <Text style={styles.earningsTitle}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>
            KES {stats.totalEarnings.toLocaleString()}
          </Text>
          <TouchableOpacity style={styles.withdrawButton}>
            <DollarSign size={18} color={COLORS.surface} />
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuSection: {
    padding: 20,
    paddingTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  badge: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface,
  },
  earningsCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
    opacity: 0.8,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.surface,
    marginBottom: 20,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  withdrawButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomSpacing: {
    height: 40,
  },
});
