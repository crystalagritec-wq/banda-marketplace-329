import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Truck, User, Package, DollarSign, TrendingUp, Settings, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useLogisticsInboarding } from '@/providers/logistics-inboarding-provider';

export default function LogisticsDashboardScreen() {
  const router = useRouter();
  const { role, ownerDetails, driverDetails, fullVerificationComplete, progress } = useLogisticsInboarding();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const isOwner = role === 'owner';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isOwner ? 'Fleet Dashboard' : 'Driver Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {isOwner ? (
              <Truck size={32} color="#007AFF" />
            ) : (
              <User size={32} color="#34C759" />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>
              {isOwner ? ownerDetails?.fullName : driverDetails?.fullName}
            </Text>
          </View>
        </View>

        {!fullVerificationComplete && (
          <TouchableOpacity
            style={styles.verificationBanner}
            onPress={() => {
              if (isOwner) {
                router.push('/inboarding/owner-verification');
              } else {
                router.push('/inboarding/driver-verification');
              }
            }}
          >
            <AlertCircle size={24} color="#FF9500" />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Complete Verification</Text>
              <Text style={styles.bannerSubtitle}>
                {progress}% complete • Unlock premium features
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {fullVerificationComplete && (
          <View style={styles.verifiedBadge}>
            <CheckCircle size={24} color="#34C759" />
            <Text style={styles.verifiedText}>
              {isOwner ? '✅ Verified Fleet Owner' : '⭐ Trusted Driver'}
            </Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Package size={24} color="#007AFF" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Active Deliveries</Text>
          </View>

          <View style={styles.statCard}>
            <DollarSign size={24} color="#34C759" />
            <Text style={styles.statValue}>KSh 0</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#FF9500" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {isOwner && ownerDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fleet Overview</Text>
            {ownerDetails.vehicles.map((vehicle, index) => (
              <View key={index} style={styles.vehicleCard}>
                <View style={styles.vehicleHeader}>
                  <Truck size={20} color="#007AFF" />
                  <Text style={styles.vehicleReg}>{vehicle.registrationNumber}</Text>
                  <View style={[styles.ownershipBadge, vehicle.ownershipType === 'financed' && styles.financedBadge]}>
                    <Text style={styles.ownershipText}>
                      {vehicle.ownershipType === 'owned' ? '✅ Owned' : '🟡 Financed'}
                    </Text>
                  </View>
                </View>
                <View style={styles.vehicleDetails}>
                  <Text style={styles.vehicleDetail}>Type: {vehicle.type}</Text>
                  <Text style={styles.vehicleDetail}>Color: {vehicle.color}</Text>
                  <Text style={styles.vehicleDetail}>Capacity: {vehicle.capacity}</Text>
                </View>
                <View style={styles.vehicleStatus}>
                  <View style={[styles.statusDot, styles.statusAvailable]} />
                  <Text style={styles.statusText}>Available</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {!isOwner && driverDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Status</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>License Class</Text>
                <Text style={styles.driverValue}>{driverDetails.licenseClass}</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>Availability</Text>
                <View style={styles.availabilityContainer}>
                  <View style={[styles.statusDot, styles.statusActive]} />
                  <Text style={styles.driverValue}>
                    {driverDetails.availability === 'active' ? 'Active' : 'Idle'}
                  </Text>
                </View>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverLabel}>Discovery</Text>
                <Text style={styles.driverValue}>
                  {driverDetails.allowDiscovery ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Package size={24} color="#007AFF" />
              <Text style={styles.actionText}>View Deliveries</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <DollarSign size={24} color="#34C759" />
              <Text style={styles.actionText}>Earnings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={24} color="#FF9500" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Settings size={24} color="#8E8E93" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  verificationBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#856404',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#856404',
  },
  verifiedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    justifyContent: 'center' as const,
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  statsGrid: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  vehicleHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    gap: 8,
  },
  vehicleReg: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    flex: 1,
  },
  ownershipBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  financedBadge: {
    backgroundColor: '#FFF3CD',
  },
  ownershipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  vehicleDetails: {
    gap: 4,
    marginBottom: 12,
  },
  vehicleDetail: {
    fontSize: 14,
    color: '#3C3C43',
  },
  vehicleStatus: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusAvailable: {
    backgroundColor: '#34C759',
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#34C759',
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 16,
  },
  driverInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  driverLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  driverValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  availabilityContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  actionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center' as const,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    textAlign: 'center' as const,
  },
});
