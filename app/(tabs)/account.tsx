import React, { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Edit3,
  ShieldCheck,
  Crown,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  QrCode,
  Bell,
  Wallet,
  Truck,
  ShoppingBag,
  Star,
  Clock,
  Settings,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';


interface StatItem {
  label: string;
  value: string;
}

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const [errorText, setErrorText] = useState<string | null>(null);

  const sessionQuery = trpc.profile.fetchSession.useQuery(undefined, {
    enabled: !!user,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({}, {
    enabled: !!user,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (dashboardQuery.error) {
      console.error('[Account] dashboard error', dashboardQuery.error);
      setErrorText('Could not load account details. Pull to refresh.');
    }
  }, [dashboardQuery.error]);

  const displayName = sessionQuery.data?.data?.user?.fullName || user?.name || 'Banda User';
  const displayEmail = sessionQuery.data?.data?.user?.email || user?.email || '';
  const displayPhone = sessionQuery.data?.data?.user?.phone || user?.phone || '';
  const displayAvatar = sessionQuery.data?.data?.user?.profilePictureUrl || user?.avatar;

  const stats: StatItem[] = useMemo(() => {
    return [
      { label: 'Orders', value: `${dashboardQuery.data?.data?.active_orders?.length ?? 0}` },
      { label: 'Wallet', value: `KSh ${dashboardQuery.data?.data?.wallet?.trading_balance ?? 0}` },
      { label: 'Savings', value: `KSh ${dashboardQuery.data?.data?.wallet?.savings_balance ?? 0}` },
    ];
  }, [dashboardQuery.data]);

  const onEditProfile = () => router.push('/settings' as any);
  const onViewNotifications = () => router.push('/notifications' as any);
  const onOpenOrders = () => router.push('/orders' as any);
  const onOpenWallet = () => router.push('/wallet' as any);
  const onShowVerificationQR = () => {
    if (Platform.OS === 'web') {
      console.log('Verification QR: would display modal with QR for agent scanning.');
    } else {
      Alert.alert('Verification QR', 'Your verification QR would be shown here for agent scanning.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container} testID="account-screen">
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        testID="account-scroll"
      >
        <View style={styles.headerWrap}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop' }}
            style={styles.cover}
            imageStyle={styles.coverImage}
          >
            <LinearGradient colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.0)"]} style={styles.coverOverlay} />
          </ImageBackground>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: displayAvatar ?? 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop' }}
                style={styles.avatar}
                contentFit="cover"
                transition={300}
              />
              <TouchableOpacity onPress={onEditProfile} style={styles.editAvatarBtn} accessibilityRole="button" testID="edit-avatar-button" activeOpacity={0.8}>
                <Edit3 size={16} color="#2D5016" />
              </TouchableOpacity>
            </View>
            <View style={styles.identity}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <View style={styles.metaRow}>
                {!!displayEmail && (
                  <View style={styles.metaItem}>
                    <Mail size={14} color="#4B5563" />
                    <Text style={styles.metaText}>{displayEmail}</Text>
                  </View>
                )}
                {!!displayPhone && (
                  <View style={styles.metaItem}>
                    <Phone size={14} color="#4B5563" />
                    <Text style={styles.metaText}>{displayPhone}</Text>
                  </View>
                )}
                {!!user?.location && (
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#4B5563" />
                    <Text style={styles.metaText}>{user.location}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onViewNotifications} style={styles.bellBtn} testID="open-notifications">
              <Bell size={20} color="#2D5016" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ribbonRow}>
          <View style={styles.ribbon}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.ribbonText}>{dashboardQuery.data?.data?.verification?.tier ?? 'Unverified'}</Text>
          </View>
          <View style={styles.ribbon}>
            <Crown size={16} color="#F59E0B" />
            <Text style={styles.ribbonText}>{dashboardQuery.data?.data?.subscription?.current_tier ?? 'Free'}</Text>
          </View>
          <TouchableOpacity onPress={onShowVerificationQR} style={[styles.ribbon, styles.qr]} testID="show-verification-qr">
            <QrCode size={16} color="#111827" />
            <Text style={[styles.ribbonText, { color: '#111827' }]}>ID QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={`stat-${i}`} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsGrid}>
            <ActionTile title="Orders" subtitle="Track & Manage" onPress={onOpenOrders} icon={<Truck size={22} color="white" />} colors={["#1E40AF", "#3B82F6"]} testID="qa-orders" />
            <ActionTile title="Wallet" subtitle="Balances & Activity" onPress={onOpenWallet} icon={<Wallet size={22} color="white" />} colors={["#8B4513", "#D97706"]} testID="qa-wallet" />
            <ActionTile title="Marketplace" subtitle="Discover" onPress={() => router.push('/marketplace' as any)} icon={<ShoppingBag size={22} color="white" />} colors={["#065F46", "#10B981"]} testID="qa-market" />
            <ActionTile title="Settings" subtitle="Preferences" onPress={onEditProfile} icon={<Settings size={22} color="white" />} colors={["#2D5016", "#4A7C59"]} testID="qa-settings" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <TouchableOpacity style={styles.seeAll} accessibilityRole="button">
              <Text style={styles.seeAllText}>See all</Text>
              <ArrowRight size={14} color="#2D5016" />
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {(dashboardQuery.data?.data?.notifications ?? []).slice(0, 5).map((n: { id: string; title: string; message: string }) => (
              <View key={n.id} style={styles.activityItem}>
                <View style={styles.activityIcon}><Clock size={16} color="#2D5016" /></View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityTitle}>{n.title}</Text>
                  <Text style={styles.activitySub} numberOfLines={1}>{n.message}</Text>
                </View>
              </View>
            ))}
            {(!dashboardQuery.data?.data?.notifications || dashboardQuery.data?.data?.notifications.length === 0) && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No recent notifications</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightsRow}>
            <HighlightCard label="Rating" value={`${(dashboardQuery.data?.data?.user?.tier ?? '').toUpperCase() || '—'}`} icon={<Star size={18} color="#F59E0B" />} />
            <HighlightCard label="Reserve" value={`KSh ${dashboardQuery.data?.data?.wallet?.reserve_balance ?? 0}`} icon={<ShieldCheck size={18} color="#10B981" />} />
          </View>
        </View>

        {errorText && (
          <View style={styles.errorBox} testID="account-error">
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        {(dashboardQuery.isFetching || sessionQuery.isFetching) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#2D5016" size="small" />
            <Text style={styles.loadingText}>Refreshing…</Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

function ActionTile({
  title,
  subtitle,
  onPress,
  icon,
  colors,
  testID,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: React.ReactNode;
  colors: [string, string];
  testID?: string;
}) {
  return (
    <TouchableOpacity style={styles.actionTile} onPress={onPress} activeOpacity={0.85} testID={testID}>
      <LinearGradient colors={colors} style={styles.actionTileGradient}>
        <View style={styles.actionIcon}>{icon as React.ReactElement}</View>
      </LinearGradient>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function HighlightCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={styles.highlightCard}>
      <View style={styles.highlightIcon}>{icon as React.ReactElement}</View>
      <Text style={styles.highlightValue}>{value}</Text>
      <Text style={styles.highlightLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1 },

  headerWrap: { marginBottom: 16 },
  cover: { height: 160, backgroundColor: '#E5E7EB' },
  coverImage: { resizeMode: 'cover' },
  coverOverlay: { flex: 1 },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
  },
  avatar: { width: '100%', height: '100%' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  identity: { flex: 1, marginLeft: 12 },
  greeting: { color: '#6B7280', fontSize: 12, marginBottom: 2 },
  name: { color: '#111827', fontSize: 22, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#4B5563', fontSize: 12 },
  bellBtn: { padding: 8 },

  ribbonRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16 },
  ribbon: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'white', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  qr: { backgroundColor: '#F3F4F6' },
  ribbonText: { fontSize: 12, color: '#065F46', fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280' },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seeAllText: { color: '#2D5016', fontWeight: '600', fontSize: 12 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionTile: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  actionTileGradient: { width: '100%', borderRadius: 12, height: 64, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  actionTextWrap: { marginTop: 10 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  actionSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  activityList: { gap: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  activityIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(45,80,22,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  activityBody: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  activitySub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyBox: { borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FAFAFA', padding: 16, borderRadius: 12 },
  emptyText: { color: '#6B7280', fontSize: 12 },

  highlightsRow: { flexDirection: 'row', gap: 12 },
  highlightCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  highlightIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  highlightValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  highlightLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  errorBox: { marginHorizontal: 20, backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1, padding: 12, borderRadius: 12, marginTop: 16 },
  errorText: { color: '#991B1B', fontSize: 12 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  loadingText: { color: '#6B7280', fontSize: 12 },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },

  footerSpace: { height: 100 },
});
