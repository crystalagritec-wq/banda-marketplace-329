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
  RefreshControl,
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
  Bell,
  Wallet,
  Truck,
  Star,
  Clock,
  Store,
  Package,
  LogOut,
  Settings,
  Award,
  TrendingUp,
  Heart,
  ShoppingBag,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';
import { hasShopProfile, getShopInfo } from '@/utils/vendor-helpers';

interface StatItem {
  label: string;
  value: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [errorText, setErrorText] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({}, {
    enabled: !!user,
    refetchOnMount: true,
  });

  const shopQuery = trpc.shop.getMyShop.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  const serviceProviderQuery = trpc.serviceProviders.getMyProfile.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dashboardQuery.refetch(),
      shopQuery.refetch(),
      serviceProviderQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (dashboardQuery.error) {
      console.error('[Profile] dashboard error', dashboardQuery.error);
      setErrorText('Could not load profile details. Pull to refresh.');
    }
  }, [dashboardQuery.error]);

  const stats: StatItem[] = useMemo(() => {
    return [
      { label: 'Orders', value: `${dashboardQuery.data?.data?.active_orders?.length ?? 0}` },
      { label: 'Wallet', value: `KSh ${dashboardQuery.data?.data?.wallet?.trading_balance ?? 0}` },
      { label: 'Savings', value: `KSh ${dashboardQuery.data?.data?.wallet?.savings_balance ?? 0}` },
    ];
  }, [dashboardQuery.data]);

  const onEditProfile = () => router.push('/settings' as any);
  const onViewNotifications = () => router.push('/notifications' as any);
  const onOpenOrders = () => router.push('/(tabs)/orders' as any);
  const onOpenWallet = () => router.push('/(tabs)/wallet' as any);

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

  const hasShop = useMemo(() => {
    return hasShopProfile(shopQuery.data);
  }, [shopQuery.data]);
  
  const shopInfo = useMemo(() => {
    return getShopInfo(shopQuery.data);
  }, [shopQuery.data]);
  
  const hasServiceProvider = useMemo(() => {
    return serviceProviderQuery.data?.profile != null;
  }, [serviceProviderQuery.data?.profile]);

  return (
    <View style={styles.container} testID="profile-screen">
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        testID="profile-scroll" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5016" />
        }
      >
        <View style={styles.headerWrap}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop' }}
            style={styles.cover}
            imageStyle={styles.coverImage}
          >
            <LinearGradient colors={["rgba(45,80,22,0.7)", "rgba(45,80,22,0.3)"]} style={styles.coverOverlay}>
              <View style={styles.coverActions}>
                <TouchableOpacity onPress={onViewNotifications} style={styles.coverBtn} testID="open-notifications">
                  <Bell size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.coverBtn}>
                  <Settings size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: (user as any)?.avatar ?? 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop' }}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={300}
                />
                <TouchableOpacity onPress={() => router.push('/edit-profile' as any)} style={styles.editAvatarBtn} accessibilityRole="button" testID="edit-avatar-button" activeOpacity={0.8}>
                  <Edit3 size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.name} numberOfLines={1}>{dashboardQuery.data?.data?.user?.full_name || user?.name || 'Banda User'}</Text>
              <View style={styles.metaRow}>
                {!!(dashboardQuery.data?.data?.user?.email || user?.email) && (
                  <View style={styles.metaItem}>
                    <Mail size={12} color="#6B7280" />
                    <Text style={styles.metaText} numberOfLines={1}>{dashboardQuery.data?.data?.user?.email || user?.email}</Text>
                  </View>
                )}
                {!!(dashboardQuery.data?.data?.user?.phone || user?.phone) && (
                  <View style={styles.metaItem}>
                    <Phone size={12} color="#6B7280" />
                    <Text style={styles.metaText}>{dashboardQuery.data?.data?.user?.phone || user?.phone}</Text>
                  </View>
                )}
              </View>
              {!!user?.location && (
                <View style={[styles.metaItem, { marginTop: 4 }]}>
                  <MapPin size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{user.location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <TouchableOpacity 
            style={styles.badgeCard} 
            onPress={() => router.push('/my-verification' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.badgeGradient}>
              <ShieldCheck size={20} color="#FFFFFF" />
              <Text style={styles.badgeLabel}>Verification</Text>
              <Text style={styles.badgeValue}>{dashboardQuery.data?.data?.verification?.tier ?? 'Unverified'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.badgeCard}
            onPress={() => router.push('/my-subscription' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.badgeGradient}>
              <Crown size={20} color="#FFFFFF" />
              <Text style={styles.badgeLabel}>Subscription</Text>
              <Text style={styles.badgeValue}>{dashboardQuery.data?.data?.subscription?.current_tier ?? 'Free'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.badgeCard}
            onPress={() => router.push('/my-loyalty' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.badgeGradient}>
              <Star size={20} color="#FFFFFF" />
              <Text style={styles.badgeLabel}>Rewards</Text>
              <Text style={styles.badgeValue}>{dashboardQuery.data?.data?.wallet?.loyalty_points ?? 0} pts</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard} onPress={onOpenOrders} activeOpacity={0.8}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <ShoppingBag size={20} color="#1E40AF" />
            </View>
            <Text style={styles.statValue}>{dashboardQuery.data?.data?.active_orders?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={onOpenWallet} activeOpacity={0.8}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Wallet size={20} color="#059669" />
            </View>
            <Text style={styles.statValue}>KSh {dashboardQuery.data?.data?.wallet?.trading_balance ?? 0}</Text>
            <Text style={styles.statLabel}>Wallet Balance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/favorites' as any)} activeOpacity={0.8}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Heart size={20} color="#DC2626" />
            </View>
            <Text style={styles.statValue}>{dashboardQuery.data?.data?.wishlist_count ?? 0}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {(hasShop || hasServiceProvider) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Dashboards</Text>
            <View style={styles.dashboardsGrid}>
              {hasShop && (
                <TouchableOpacity 
                  style={styles.dashboardCard}
                  onPress={() => router.push('/shop-dashboard' as any)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#2D5016", "#4A7C59"]} style={styles.dashboardGradient}>
                    <Store size={28} color="white" />
                    <Text style={styles.dashboardTitle}>Shop Dashboard</Text>
                    <Text style={styles.dashboardSubtitle}>Manage your store</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {hasServiceProvider && (
                <TouchableOpacity 
                  style={styles.dashboardCard}
                  onPress={() => router.push('/service-provider-dashboard' as any)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#1E40AF", "#3B82F6"]} style={styles.dashboardGradient}>
                    <Package size={28} color="white" />
                    <Text style={styles.dashboardTitle}>Service Dashboard</Text>
                    <Text style={styles.dashboardSubtitle}>Manage services</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionTile title="Orders" subtitle="Track & Manage" onPress={onOpenOrders} icon={<Truck size={20} color="white" />} colors={["#1E40AF", "#3B82F6"]} testID="qa-orders" />
            <ActionTile title="Wallet" subtitle="AgriPay Balance" onPress={onOpenWallet} icon={<Wallet size={20} color="white" />} colors={["#10B981", "#34D399"]} testID="qa-wallet" />
            <ActionTile title="Favorites" subtitle="Saved Items" onPress={() => router.push('/favorites' as any)} icon={<Heart size={20} color="white" />} colors={["#EF4444", "#F87171"]} testID="qa-favorites" />
            <ActionTile title="Insights" subtitle="Analytics" onPress={() => router.push('/insights' as any)} icon={<TrendingUp size={20} color="white" />} colors={["#8B5CF6", "#A78BFA"]} testID="qa-insights" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <TouchableOpacity style={styles.seeAll} accessibilityRole="button" onPress={() => router.push('/recent-activity' as any)}>
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
          <View style={styles.errorBox} testID="profile-error">
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        {dashboardQuery.isFetching && (
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
        <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>{title}</Text>
      </LinearGradient>
      <View style={styles.actionTextWrap}>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flexGrow: 1 },

  headerWrap: { marginBottom: 20 },
  cover: { height: 180, backgroundColor: '#2D5016' },
  coverImage: { resizeMode: 'cover' as const },
  coverOverlay: { flex: 1, justifyContent: 'flex-start', paddingTop: 48 },
  coverActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, gap: 8 },
  coverBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  profileSection: { paddingHorizontal: 20, marginTop: -50 },
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: { width: '100%', height: '100%' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2D5016',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: { alignItems: 'center' },
  greeting: { color: '#6B7280', fontSize: 13, marginBottom: 4, textAlign: 'center' as const },
  name: { color: '#111827', fontSize: 24, fontWeight: '700' as const, marginBottom: 8, textAlign: 'center' as const },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#6B7280', fontSize: 12 },

  badgesRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 20 },
  badgeCard: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  badgeGradient: { padding: 12, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  badgeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 6, textAlign: 'center' as const },
  badgeValue: { fontSize: 14, fontWeight: '700' as const, color: '#FFFFFF', marginTop: 2, textAlign: 'center' as const },

  statsContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 20 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '700' as const, color: '#111827', marginBottom: 4, textAlign: 'center' as const },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' as const },

  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: '#111827', marginBottom: 12 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seeAllText: { color: '#2D5016', fontWeight: '600' as const, fontSize: 13 },

  dashboardsGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  dashboardCard: { width: '48%', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  dashboardGradient: { padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 140 },
  dashboardTitle: { fontSize: 16, fontWeight: '700' as const, color: 'white', marginTop: 12 },
  dashboardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionTile: { width: '48%', backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  actionTileGradient: { width: '100%', height: 80, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionTextWrap: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 },
  actionTitle: { fontSize: 13, fontWeight: '700' as const, color: '#111827', textAlign: 'center' as const },
  actionSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' as const },

  activityList: { gap: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  activityIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(45,80,22,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  activityBody: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600' as const, color: '#111827' },
  activitySub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyBox: { borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FAFAFA', padding: 16, borderRadius: 12 },
  emptyText: { color: '#6B7280', fontSize: 12 },

  highlightsRow: { flexDirection: 'row', gap: 12 },
  highlightCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  highlightIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  highlightValue: { fontSize: 16, fontWeight: '700' as const, color: '#111827' },
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
    fontWeight: '600' as const,
    color: '#EF4444',
    marginLeft: 8,
  },

  footerSpace: { height: 100 },
});
