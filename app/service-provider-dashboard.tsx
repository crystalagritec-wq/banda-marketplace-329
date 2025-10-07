import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Briefcase, Clock, DollarSign, Star, TrendingUp, 
  Settings, Bell, Award, Users, Calendar 
} from 'lucide-react-native';
import { useServiceInboarding } from '@/providers/service-inboarding-provider';
import { useState } from 'react';

export default function ServiceProviderDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useServiceInboarding();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const stats = [
    { label: 'Active Requests', value: '0', icon: Briefcase, color: '#007AFF' },
    { label: 'Completed', value: '0', icon: Clock, color: '#34C759' },
    { label: 'Earnings', value: 'KES 0', icon: DollarSign, color: '#FF9500' },
    { label: 'Rating', value: '0.0', icon: Star, color: '#FFD700' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.providerName}>
            {state.providerType === 'individual' 
              ? state.personalDetails.fullName 
              : state.organizationDetails.businessName}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={24} color="#1C1C1E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Profile Completion</Text>
            <Text style={styles.progressPercentage}>{state.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${state.progress}%` }]} />
          </View>
          {state.progress < 100 && (
            <Text style={styles.progressHint}>
              Complete your profile to unlock more features
            </Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Briefcase size={28} color="#007AFF" />
              <Text style={styles.actionLabel}>View Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Calendar size={28} color="#34C759" />
              <Text style={styles.actionLabel}>My Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Users size={28} color="#FF9500" />
              <Text style={styles.actionLabel}>Clients</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={28} color="#FF3B30" />
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Services</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.servicesContainer}>
            {state.serviceTypes.length > 0 ? (
              state.serviceTypes.map((service, index) => (
                <View key={index} style={styles.serviceChip}>
                  <Text style={styles.serviceChipText}>
                    {service.replace('_', ' ').charAt(0).toUpperCase() + service.slice(1).replace('_', ' ')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No services added yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {state.equipment.length > 0 ? (
            <View style={styles.equipmentList}>
              {state.equipment.slice(0, 3).map((equipment) => (
                <View key={equipment.id} style={styles.equipmentItem}>
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{equipment.name}</Text>
                    <Text style={styles.equipmentType}>{equipment.type}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    equipment.availability === 'available' && styles.statusAvailable,
                    equipment.availability === 'in_use' && styles.statusInUse,
                  ]}>
                    <Text style={styles.statusText}>
                      {equipment.availability === 'available' ? 'Available' : 
                       equipment.availability === 'in_use' ? 'In Use' : 'Maintenance'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No equipment added yet</Text>
            </View>
          )}
        </View>

        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <View style={styles.badgesRow}>
            {state.badges.verified && (
              <View style={styles.badge}>
                <Award size={20} color="#34C759" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
            {state.badges.pending && (
              <View style={[styles.badge, styles.badgePending]}>
                <Clock size={20} color="#FF9500" />
                <Text style={styles.badgeText}>Pending</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  headerActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  actionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    textAlign: 'center' as const,
  },
  servicesContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  serviceChip: {
    backgroundColor: '#007AFF15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  serviceChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  equipmentList: {
    gap: 12,
  },
  equipmentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  statusAvailable: {
    backgroundColor: '#34C75915',
  },
  statusInUse: {
    backgroundColor: '#FF950015',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#8E8E93',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center' as const,
  },
  badgesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgesRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: '#34C75915',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  badgePending: {
    backgroundColor: '#FF950015',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
});
