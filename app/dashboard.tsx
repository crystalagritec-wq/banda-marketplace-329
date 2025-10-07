import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Store,
  Wrench,
  Truck,
  Tractor,
  ArrowRight,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import { router } from 'expo-router';



interface BusinessUnit {
  id: string;
  name: string;
  icon: any;
  status: 'active' | 'setup' | 'not_created';
  progress: number;
  stats: {
    label: string;
    value: string | number;
  }[];
  walletBalance?: number;
  route?: string;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getRoleProgress, getRoleStatus } = useOnboarding();

  const businessUnits: BusinessUnit[] = [
    {
      id: 'shop',
      name: 'Shop',
      icon: Store,
      status: getRoleStatus('shop'),
      progress: getRoleProgress('shop'),
      stats: [
        { label: 'Products', value: 15 },
        { label: 'Orders', value: 32 },
      ],
      walletBalance: 12500,
      route: '/my-products',
    },
    {
      id: 'service',
      name: 'Service',
      icon: Wrench,
      status: getRoleStatus('service'),
      progress: getRoleProgress('service'),
      stats: [
        { label: 'Bookings', value: 2 },
        { label: 'Earnings', value: 'KSh 3,200' },
      ],
      walletBalance: 7800,
      route: '/post-service',
    },
    {
      id: 'logistics',
      name: 'Logistics',
      icon: Truck,
      status: getRoleStatus('logistics'),
      progress: getRoleProgress('logistics'),
      stats: [
        { label: 'Vehicles', value: 3 },
        { label: 'Drivers', value: 2 },
        { label: 'Deliveries', value: 7 },
      ],
      walletBalance: 18600,
      route: '/logistics',
    },
    {
      id: 'farm',
      name: 'Farm',
      icon: Tractor,
      status: getRoleStatus('farm'),
      progress: getRoleProgress('farm'),
      stats: [],
      route: '/insights',
    },
  ];

  const totalWalletBalance = 38900;
  const userTier = user?.tier || 'verified';
  const nextTierGoal = 'Complete 50 Deliveries';

  const getStatusIcon = (status: BusinessUnit['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} color="#10B981" />;
      case 'setup':
        return <Clock size={16} color="#F59E0B" />;
      case 'not_created':
        return <AlertCircle size={16} color="#9CA3AF" />;
    }
  };

  const getStatusText = (status: BusinessUnit['status']) => {
    switch (status) {
      case 'active':
        return 'Active ✅';
      case 'setup':
        return 'Setup in Progress ⏳';
      case 'not_created':
        return 'Not Created';
    }
  };

  const getTierDisplay = (tier: string) => {
    const tierMap: Record<string, { label: string; color: string }> = {
      none: { label: 'Basic', color: '#9CA3AF' },
      verified: { label: 'Verified Partner (Gold)', color: '#F59E0B' },
      gold: { label: 'Gold Partner', color: '#F59E0B' },
      premium: { label: 'Premium Partner', color: '#8B5CF6' },
      elite: { label: 'Elite Partner', color: '#DC2626' },
    };
    return tierMap[tier] || tierMap.none;
  };

  const tierInfo = getTierDisplay(userTier);

  const renderBusinessUnit = (unit: BusinessUnit) => (
    <TouchableOpacity
      key={unit.id}
      style={styles.businessCard}
      onPress={() => {
        if (unit.status === 'not_created') {
          return;
        }
        if (unit.route) {
          router.push(unit.route as any);
        }
      }}
      activeOpacity={unit.status === 'not_created' ? 1 : 0.7}
    >
      <View style={styles.businessCardHeader}>
        <View style={styles.businessCardTitle}>
          <View style={styles.businessIconContainer}>
            <unit.icon size={20} color="#2D5016" />
          </View>
          <Text style={styles.businessName}>{unit.name}</Text>
          <ArrowRight size={16} color="#9CA3AF" />
        </View>
        <View style={styles.statusBadge}>
          {getStatusIcon(unit.status)}
          <Text style={styles.statusBadgeText}>{getStatusText(unit.status)}</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${unit.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{unit.progress}%</Text>
      </View>

      {unit.status === 'not_created' ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (unit.id === 'shop') router.push('/onboarding/shop/profile' as any);
            else if (unit.id === 'service') router.push('/onboarding/service/profile' as any);
            else if (unit.id === 'logistics') router.push('/onboarding/logistics/role' as any);
            else if (unit.id === 'farm') router.push('/onboarding/farm/profile' as any);
          }}
        >
          <Plus size={16} color="#2D5016" />
          <Text style={styles.addButtonText}>Add {unit.name}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.statsRow}>
          {unit.stats.map((stat, index) => (
            <View key={index} style={styles.statBox}>
              <Text style={styles.statLabel}>{stat.label}:</Text>
              <Text style={styles.statValue}> {stat.value}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.divider} />
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeEmoji}>👋</Text>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}</Text>
          <Text style={styles.subtitle}>Your Banda Partner Hub</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.businessUnitsSection}>
          {businessUnits.map(renderBusinessUnit)}
        </View>

        <View style={styles.divider} />
        <View style={styles.walletSection}>
          <View style={styles.walletHeader}>
            <Text style={styles.walletTitle}>💰 Wallet (AgriPay):</Text>
            <Text style={styles.walletBalance}>KSh {totalWalletBalance.toLocaleString()}</Text>
          </View>
          <View style={styles.walletBreakdown}>
            <Text style={styles.walletBreakdownText}>
              Shop: {businessUnits[0].walletBalance?.toLocaleString()} | Services: {businessUnits[1].walletBalance?.toLocaleString()} | Logistics: {businessUnits[2].walletBalance?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.walletActions}>
            <TouchableOpacity
              style={styles.walletButton}
              onPress={() => router.push('/(tabs)/wallet' as any)}
            >
              <Text style={styles.walletButtonText}>Withdraw →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.walletButton}
              onPress={() => router.push('/(tabs)/wallet' as any)}
            >
              <Text style={styles.walletButtonText}>Transactions →</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Award size={20} color={tierInfo.color} />
            <Text style={[styles.statusText, { color: tierInfo.color }]}>
              Status: {tierInfo.label}
            </Text>
          </View>
          <View style={styles.nextGoalRow}>
            <TrendingUp size={18} color="#2D5016" />
            <Text style={styles.nextGoalText}>Next: Platinum → {nextTierGoal}</Text>
          </View>
        </View>
        <View style={styles.divider} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  businessUnitsSection: {
    gap: 16,
  },
  businessCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  businessCardHeader: {
    marginBottom: 12,
  },
  businessCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2D5016',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
    minWidth: 40,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
  },
  walletSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  walletHeader: {
    marginBottom: 8,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  walletBreakdown: {
    marginBottom: 12,
  },
  walletBreakdownText: {
    fontSize: 13,
    color: '#6B7280',
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  walletButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
  },
  statusSection: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextGoalText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
