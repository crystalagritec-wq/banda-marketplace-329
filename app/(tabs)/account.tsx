import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Bell,
  Search,
  TrendingUp,
  Users,
  ShoppingBag,
  Truck,
  Star,
  ArrowRight,
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  CheckCircle,
  Clock,
  BarChart3,
  MessageSquare,
  Tractor,
  Wrench,
  Package,
  Wallet,
  Crown,
  Award,
  Activity,
  Camera,
  ChevronRight,
  Zap,
  Plus,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  LayoutDashboard,
  Moon,
  Globe,
  FileText,
  ExternalLink,
  ShoppingCart,
  MessageCircle,
  UserX,
  BadgeCheck,
  Heart
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';





interface DashboardData {
  user: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    user_role: string;
    tier: string;
    verification_status: string;
  } | null;
  verification: {
    status: string;
    tier: string;
    progress: number;
    documents: {
      id: string;
      type: string;
      status: string;
      uploaded_at: string;
    }[];
  };
  subscription: {
    current_tier: string;
    tier_level: number;
    status: string;
    start_date?: string;
    end_date?: string;
    features: Record<string, boolean>;
    limits: Record<string, any>;
    auto_renew: boolean;
  };
  wallet: {
    trading_balance: number;
    savings_balance: number;
    reserve_balance: number;
    total_earned: number;
    total_spent: number;
    recent_transactions: {
      id: string;
      type: string;
      amount: number;
      status: string;
      description: string;
      created_at: string;
    }[];
  };
  active_orders: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    product_name: string;
  }[];
  qr_history: {
    id: string;
    qr_type: string;
    scan_result: string;
    created_at: string;
  }[];
  market_insights: {
    id: string;
    category: string;
    product_name: string;
    current_price: number;
    trend: string;
    ai_recommendation: string;
  }[];
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }[];
}

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'overview' | 'profile' | 'dashboard'>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [balanceVisible, setBalanceVisible] = useState(true);

  const walletQuery = trpc.wallet.getBalance.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });

  const loyaltyQuery = trpc.loyalty.getPoints.useQuery(
    { userId: user?.id || '' },
    {
      enabled: !!user?.id,
    }
  );


  // tRPC queries
  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({});
  const upgradeSubscriptionMutation = trpc.subscription.upgrade.useMutation();
  const updateDocumentsMutation = trpc.verification.updateDocuments.useMutation();

  useEffect(() => {
    if (dashboardQuery.data?.success) {
      setDashboardData(dashboardQuery.data.data);
    }
  }, [dashboardQuery.data]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);



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

  const handleNavigateToSettings = () => {
    router.push('/settings' as any);
  };

  const handleNavigateToOrders = () => {
    router.push('/orders' as any);
  };

  const handleNavigateToWallet = () => {
    router.push('/wallet' as any);
  };

  const handleNavigateToFavorites = () => {
    router.push('/favorites' as any);
  };

  const handleNavigateToMyProducts = () => {
    router.push('/my-products' as any);
  };

  const handleNavigateToNotifications = () => {
    router.push('/notifications' as any);
  };

  const handleNavigateToHelp = () => {
    router.push('/settings/help' as any);
  };

  const handleNavigateToSecurity = () => {
    router.push('/settings/security' as any);
  };

  const handleNavigateToVerification = () => {
    router.push('/verification' as any);
  };

  const handleNavigateToSubscription = () => {
    router.push('/subscription' as any);
  };

  const handleNavigateToInsights = () => {
    router.push('/insights' as any);
  };



  const handleNavigateToCustomerCare = () => {
    router.push('/customer-care' as any);
  };

  const handleNavigateToProfile = () => {
    router.push('/profile' as any);
  };

  const handleNavigateToAddress = () => {
    router.push('/address' as any);
  };

  const handleNavigateToLanguage = () => {
    router.push('/settings/language' as any);
  };

  const handleNavigateToAppearance = () => {
    router.push('/settings/appearance' as any);
  };

  const handleNavigateToFeedback = () => {
    router.push('/settings/feedback' as any);
  };

  const handleNavigateToLegal = () => {
    router.push('/settings/legal' as any);
  };

  const handleNavigateToDeleteAccount = () => {
    router.push('/settings/delete-account' as any);
  };

  const handleUploadDocuments = () => {
    Alert.alert(
      'Upload Documents',
      'Choose documents to upload for verification',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upload', 
          onPress: () => {
            const mockDocuments = [
              {
                type: 'national_id' as const,
                url: 'https://example.com/id.jpg',
                number: '12345678'
              }
            ];
            
            updateDocumentsMutation.mutate(
              { documents: mockDocuments },
              {
                onSuccess: () => {
                  Alert.alert('Success ✅', 'Documents uploaded successfully! Review in progress.');
                  dashboardQuery.refetch();
                },
                onError: (error) => {
                  Alert.alert('Error ❌', error.message);
                }
              }
            );
          }
        }
      ]
    );
  };

  const handleViewQR = () => {
    Alert.alert('QR Badge 📱', 'Your verification QR code would be displayed here for admin/agent verification.');
  };

  const handleUpgradeSubscription = () => {
    Alert.alert(
      'Upgrade Subscription 🚀',
      'Choose your new tier',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Gold (KSh 1,500/month)', 
          onPress: () => upgradeSubscription('Gold')
        },
        { 
          text: 'Premium (KSh 3,000/month)', 
          onPress: () => upgradeSubscription('Premium')
        }
      ]
    );
  };

  const upgradeSubscription = (tierName: 'Gold' | 'Premium') => {
    upgradeSubscriptionMutation.mutate(
      { tierName, paymentMethod: 'wallet' },
      {
        onSuccess: (data) => {
          Alert.alert('Success ✅', `${data.message} Amount deducted: KSh ${data.amountPaid}`);
          dashboardQuery.refetch();
        },
        onError: (error) => {
          Alert.alert('Error ❌', error.message);
        }
      }
    );
  };

  const handleViewBenefits = () => {
    Alert.alert('Subscription Benefits 🎯', 'Detailed benefits and features would be shown here.');
  };

  const handleAddMoney = () => {
    Alert.alert('Add Money 💰', 'M-Pesa, Bank Transfer, and Card payment options would be shown here.');
  };

  const handleSendMoney = () => {
    Alert.alert('Send Money 📤', 'Transfer money to other Banda users or mobile numbers.');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw 💸', 'Withdraw to M-Pesa or Bank account options would be shown here.');
  };

  const handleViewTransactions = () => {
    Alert.alert('Transactions 📊', 'Full transaction history with filters would be shown here.');
  };

  const quickActions: Record<string, { title: string; icon: any; color: string; route: string }[]> = {
    buyer: [
      { title: 'Browse Products', icon: Search, color: '#2D5016', route: '/marketplace' },
      { title: 'Track Orders', icon: Truck, color: '#1E40AF', route: '/orders' },
      { title: 'Find Services', icon: Users, color: '#7C2D12', route: '/services' },
      { title: 'Market Prices', icon: TrendingUp, color: '#8B4513', route: '/prices' },
    ],
    vendor: [
      { title: 'My Products', icon: Package, color: '#2D5016', route: '/my-products' },
      { title: 'Add Product', icon: ShoppingBag, color: '#1E40AF', route: '/products/add' },
      { title: 'View Orders', icon: Truck, color: '#8B4513', route: '/orders' },
      { title: 'Market Insights', icon: Star, color: '#7C2D12', route: '/insights' },
    ],
    driver: [
      { title: 'Available Deliveries', icon: Truck, color: '#1E40AF', route: '/deliveries' },
      { title: 'My Routes', icon: Search, color: '#2D5016', route: '/routes' },
      { title: 'Earnings', icon: TrendingUp, color: '#8B4513', route: '/wallet' },
      { title: 'Vehicle Info', icon: Users, color: '#7C2D12', route: '/vehicle' },
    ],
    service_provider: [
      { title: 'My Services', icon: Users, color: '#7C2D12', route: '/services' },
      { title: 'Bookings', icon: Search, color: '#2D5016', route: '/bookings' },
      { title: 'Earnings', icon: TrendingUp, color: '#8B4513', route: '/wallet' },
      { title: 'Reviews', icon: Star, color: '#1E40AF', route: '/reviews' },
    ],
  };

  const statsMap: Record<string, { label: string; value: string; color: string }[]> = {
    buyer: [
      { label: 'Orders This Month', value: '12', color: '#2D5016' },
      { label: 'Saved Amount', value: 'KSh 2,400', color: '#8B4513' },
      { label: 'Favorite Vendors', value: '8', color: '#1E40AF' },
    ],
    vendor: [
      { label: 'Products Listed', value: '24', color: '#2D5016' },
      { label: 'Monthly Revenue', value: 'KSh 45,600', color: '#8B4513' },
      { label: 'Customer Rating', value: '4.8★', color: '#FFD700' },
    ],
    driver: [
      { label: 'Deliveries Today', value: '8', color: '#1E40AF' },
      { label: 'Weekly Earnings', value: 'KSh 12,800', color: '#8B4513' },
      { label: 'Rating', value: '4.9★', color: '#FFD700' },
    ],
    service_provider: [
      { label: 'Services Offered', value: '6', color: '#7C2D12' },
      { label: 'Monthly Bookings', value: '18', color: '#2D5016' },
      { label: 'Client Rating', value: '4.7★', color: '#FFD700' },
    ],
  };

  const roleStatsForProfile = () => {
    switch (user?.role) {
      case 'buyer':
        return [
          { label: 'Orders Completed', value: '47', icon: TrendingUp },
          { label: 'Money Saved', value: 'KSh 12,400', icon: Star },
          { label: 'Favorite Vendors', value: '12', icon: Users },
        ];
      case 'vendor':
        return [
          { label: 'Products Sold', value: '234', icon: TrendingUp },
          { label: 'Total Revenue', value: 'KSh 156,800', icon: Star },
          { label: 'Customer Rating', value: '4.8★', icon: Users },
        ];
      case 'driver':
        return [
          { label: 'Deliveries Made', value: '89', icon: Truck },
          { label: 'Total Earnings', value: 'KSh 45,600', icon: TrendingUp },
          { label: 'Driver Rating', value: '4.9★', icon: Star },
        ];
      case 'service_provider':
        return [
          { label: 'Services Completed', value: '67', icon: TrendingUp },
          { label: 'Total Earnings', value: 'KSh 78,900', icon: Star },
          { label: 'Client Rating', value: '4.7★', icon: Users },
        ];
      default:
        return [];
    }
  };

  const currentActions = quickActions[user?.role || 'buyer'] || quickActions.buyer;
  const currentStats = statsMap[user?.role || 'buyer'] || statsMap.buyer;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="account-screen">
      <LinearGradient colors={['#F8FAFC', '#FFFFFF']} style={styles.gradient}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient 
                  colors={['#2D5016', '#4A7C59']} 
                  style={styles.avatarGradient}
                >
                  <UserIcon size={28} color="white" />
                </LinearGradient>
                <TouchableOpacity style={styles.cameraButton}>
                  <Camera size={14} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <View style={styles.userMeta}>
                  <View style={styles.verifiedBadge}>
                    <CheckCircle size={12} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                  <Text style={styles.userRole}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} testID="notif-button" onPress={handleNavigateToNotifications}>
                <Bell size={20} color="#2D5016" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleNavigateToSettings}>
                <Settings size={20} color="#2D5016" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Enhanced Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'profile', label: 'Profile', icon: UserIcon },
              { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
            ].map((tabItem) => {
              const IconComponent = tabItem.icon;
              const isActive = tab === tabItem.key;
              return (
                <TouchableOpacity
                  key={tabItem.key}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setTab(tabItem.key as any)}
                  testID={`segment-${tabItem.key}`}
                >
                  <IconComponent size={16} color={isActive ? '#2D5016' : '#666'} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tabItem.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {tab === 'dashboard' ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            testID="dashboard-tab"
          >
            <View style={styles.dashboardRedirect}>
              <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.dashboardRedirectGradient}>
                <LayoutDashboard size={48} color="white" />
                <Text style={styles.dashboardRedirectTitle}>Business Dashboard</Text>
                <Text style={styles.dashboardRedirectSubtitle}>
                  Manage your shop, services, logistics, and farm operations
                </Text>
                <TouchableOpacity 
                  style={styles.dashboardRedirectButton}
                  onPress={() => router.push('/dashboard' as any)}
                >
                  <Text style={styles.dashboardRedirectButtonText}>Open Dashboard</Text>
                  <ArrowRight size={16} color="#2D5016" />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View style={styles.dashboardFeatures}>
              <Text style={styles.sectionTitle}>Dashboard Features</Text>
              {[
                { icon: Package, title: 'Shop Management', description: 'Manage products, orders, and analytics' },
                { icon: Wrench, title: 'Service Management', description: 'Handle bookings and client relationships' },
                { icon: Truck, title: 'Logistics Control', description: 'Track deliveries and optimize routes' },
                { icon: Tractor, title: 'Farm Operations', description: 'Monitor crops and manage workers' },
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <View key={index} style={styles.featureCard}>
                    <View style={styles.featureIcon}>
                      <IconComponent size={24} color="#2D5016" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : tab === 'overview' ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            testID="overview-tab"

          >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.welcomeSubtext}>Here&apos;s what&apos;s happening with your account</Text>
            </View>

            {/* Quick Stats Cards */}
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStatsGrid}>
                <TouchableOpacity 
                  style={styles.quickStatCard}
                  onPress={handleNavigateToWallet}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.quickStatGradient}>
                    <Wallet size={24} color="white" />
                    <View style={styles.quickStatContent}>
                      <Text style={styles.quickStatValue}>
                        {balanceVisible 
                          ? `KSh ${(walletQuery.data?.wallet?.total_balance ?? 0).toLocaleString()}` 
                          : '••••••'
                        }
                      </Text>
                      <Text style={styles.quickStatLabel}>Total Balance</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setBalanceVisible(!balanceVisible);
                      }}
                    >
                      {balanceVisible ? <Eye size={16} color="white" /> : <EyeOff size={16} color="white" />}
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
                
                <View style={styles.quickStatCard}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.quickStatGradient}>
                    <TrendingUp size={24} color="white" />
                    <View style={styles.quickStatContent}>
                      <Text style={styles.quickStatValue}>+15.2%</Text>
                      <Text style={styles.quickStatLabel}>This Month</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
              
              <View style={styles.quickStatsGrid}>
                <TouchableOpacity 
                  style={styles.quickStatCard}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.quickStatGradient}>
                    <Star size={24} color="white" />
                    <View style={styles.quickStatContent}>
                      <Text style={styles.quickStatValue}>
                        {loyaltyQuery.data?.points ?? 0}
                      </Text>
                      <Text style={styles.quickStatLabel}>Loyalty Points</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickStatCard}
                  onPress={handleNavigateToSubscription}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.quickStatGradient}>
                    <Award size={24} color="white" />
                    <View style={styles.quickStatContent}>
                      <Text style={styles.quickStatValue}>
                        {dashboardData?.subscription?.current_tier || 'Free'}
                      </Text>
                      <Text style={styles.quickStatLabel}>Tier</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Enhanced Dashboard Cards */}
            {dashboardQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                  <RefreshCw size={32} color="#2D5016" />
                  <Text style={styles.loadingText}>Loading your dashboard...</Text>
                </View>
              </View>
            ) : dashboardData ? (
              <>
                {/* Modern Verification Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.cardIcon}>
                        <Shield size={20} color="#10B981" />
                      </View>
                      <View>
                        <Text style={styles.cardTitle}>Verification Status</Text>
                        <Text style={styles.cardSubtitle}>Build trust with verification</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cardAction} onPress={handleViewQR}>
                      <Text style={styles.cardActionText}>View QR</Text>
                      <ChevronRight size={16} color="#2D5016" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.verificationProgress}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${dashboardData.verification.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{dashboardData.verification.progress}% Complete</Text>
                  </View>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleUploadDocuments}>
                    <Upload size={16} color="white" />
                    <Text style={styles.primaryButtonText}>Upload Documents</Text>
                  </TouchableOpacity>
                </View>

                {/* Modern Subscription Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.cardIcon}>
                        <Crown size={20} color="#F59E0B" />
                      </View>
                      <View>
                        <Text style={styles.cardTitle}>Subscription</Text>
                        <Text style={styles.cardSubtitle}>{dashboardData.subscription.current_tier} Tier</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cardAction} onPress={handleViewBenefits}>
                      <Text style={styles.cardActionText}>Benefits</Text>
                      <ChevronRight size={16} color="#2D5016" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.subscriptionFeatures}>
                    {Object.entries(dashboardData.subscription.features).slice(0, 3).map(([key, value]) => (
                      <View key={key} style={styles.featureItem}>
                        <CheckCircle size={14} color={value ? '#10B981' : '#6B7280'} />
                        <Text style={styles.featureText}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {dashboardData.subscription.current_tier !== 'Premium' && (
                    <TouchableOpacity style={styles.primaryButton} onPress={handleUpgradeSubscription}>
                      <Zap size={16} color="white" />
                      <Text style={styles.primaryButtonText}>Upgrade Tier</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Modern Wallet Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.cardIcon}>
                        <Wallet size={20} color="#3B82F6" />
                      </View>
                      <View>
                        <Text style={styles.cardTitle}>Wallet Overview</Text>
                        <Text style={styles.cardSubtitle}>Manage your finances</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.cardAction} onPress={handleNavigateToWallet}>
                      <Text style={styles.cardActionText}>View All</Text>
                      <ChevronRight size={16} color="#2D5016" />
                    </TouchableOpacity>
                  </View>
                  {walletQuery.isLoading ? (
                    <View style={styles.walletLoading}>
                      <RefreshCw size={20} color="#2D5016" />
                      <Text style={styles.walletLoadingText}>Loading wallet...</Text>
                    </View>
                  ) : walletQuery.error ? (
                    <View style={styles.walletError}>
                      <Text style={styles.walletErrorText}>Failed to load wallet</Text>
                      <TouchableOpacity onPress={() => walletQuery.refetch()}>
                        <Text style={styles.walletRetryText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={styles.walletBalances}>
                        <View style={styles.balanceItem}>
                          <Text style={styles.balanceLabel}>Trading</Text>
                          <Text style={styles.balanceValue}>KSh {(walletQuery.data?.wallet?.trading_balance ?? 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.balanceItem}>
                          <Text style={styles.balanceLabel}>Savings</Text>
                          <Text style={styles.balanceValue}>KSh {(walletQuery.data?.wallet?.savings_balance ?? 0).toLocaleString()}</Text>
                        </View>
                        <View style={styles.balanceItem}>
                          <Text style={styles.balanceLabel}>Reserve</Text>
                          <Text style={[styles.balanceValue, { color: '#F59E0B' }]}>KSh {(walletQuery.data?.wallet?.reserve_balance ?? 0).toLocaleString()}</Text>
                        </View>
                      </View>
                      <View style={styles.walletActions}>
                        <TouchableOpacity style={styles.walletButton} onPress={handleNavigateToWallet}>
                          <Plus size={16} color="#2D5016" />
                          <Text style={styles.walletButtonText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.walletButton} onPress={handleNavigateToWallet}>
                          <ArrowRight size={16} color="#2D5016" />
                          <Text style={styles.walletButtonText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.walletButton} onPress={handleNavigateToWallet}>
                          <Download size={16} color="#2D5016" />
                          <Text style={styles.walletButtonText}>Withdraw</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </>
            ) : null}

            {/* Performance Metrics */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={styles.metricsGrid}>
                {currentStats.map((stat, index) => (
                  <View key={`stat-${index}`} style={styles.metricCard}>
                    <View style={[styles.metricIcon, { backgroundColor: `${stat.color}20` }]}>
                      <TrendingUp size={16} color={stat.color} />
                    </View>
                    <Text style={[styles.metricValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.metricLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Enhanced Quick Actions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <TouchableOpacity style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>Customize</Text>
                  <Settings size={14} color="#2D5016" />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScrollContent}>
                {currentActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <TouchableOpacity
                      key={`action-${index}`}
                      style={styles.modernActionCard}
                      onPress={() => {
                        console.log(`Navigating to: ${action.route}`);
                        router.push(action.route as any);
                      }}
                      activeOpacity={0.8}
                      testID={`quick-action-${index}`}
                    >
                      <LinearGradient
                        colors={[action.color, `${action.color}E6`]}
                        style={styles.modernActionGradient}
                      >
                        <IconComponent size={24} color="white" />
                      </LinearGradient>
                      <Text style={styles.modernActionTitle}>{action.title}</Text>
                      <ChevronRight size={14} color="#666" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Enhanced Recent Activity */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/recent-activity' as any)}>
                  <Text style={styles.seeAllText}>View All</Text>
                  <ExternalLink size={14} color="#2D5016" />
                </TouchableOpacity>
              </View>
              <View style={styles.modernActivityList}>
                {dashboardData?.notifications?.slice(0, 3).map((notification, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'order': return CheckCircle;
                      case 'verification': return Shield;
                      case 'market': return TrendingUp;
                      default: return Bell;
                    }
                  };
                  
                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case 'order': return '#10B981';
                      case 'verification': return '#3B82F6';
                      case 'market': return '#F59E0B';
                      default: return '#6B7280';
                    }
                  };
                  
                  const getTimeAgo = (dateString: string) => {
                    const now = new Date();
                    const date = new Date(dateString);
                    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                    
                    if (diffInHours < 1) return 'Just now';
                    if (diffInHours < 24) return `${diffInHours} hours ago`;
                    const diffInDays = Math.floor(diffInHours / 24);
                    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                  };
                  
                  const IconComponent = getActivityIcon(notification.type);
                  const color = getActivityColor(notification.type);
                  
                  return (
                    <TouchableOpacity 
                      key={`activity-${notification.id}`} 
                      style={styles.modernActivityItem}
                      onPress={() => {
                        if (notification.type === 'market') {
                          handleNavigateToInsights();
                        } else if (notification.type === 'order') {
                          handleNavigateToOrders();
                        } else {
                          handleNavigateToNotifications();
                        }
                      }}
                    >
                      <View style={[styles.modernActivityIcon, { backgroundColor: `${color}20` }]}>
                        <IconComponent size={16} color={color} />
                      </View>
                      <View style={styles.modernActivityContent}>
                        <Text style={styles.modernActivityTitle}>{notification.title}</Text>
                        <Text style={styles.modernActivityTime}>{getTimeAgo(notification.created_at)}</Text>
                      </View>
                      <View style={styles.activityAction}>
                        {!notification.is_read && <View style={styles.unreadDot} />}
                        <ChevronRight size={16} color="#666" />
                      </View>
                    </TouchableOpacity>
                  );
                }) || [
                  { icon: CheckCircle, title: 'Order #1234 delivered successfully', time: '2 hours ago', color: '#10B981' },
                  { icon: ShoppingBag, title: 'New product added to marketplace', time: '5 hours ago', color: '#3B82F6' },
                  { icon: Star, title: 'Received 5-star rating from customer', time: '1 day ago', color: '#F59E0B' }
                ].map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <View key={`activity-${index}`} style={styles.modernActivityItem}>
                      <View style={[styles.modernActivityIcon, { backgroundColor: `${activity.color}20` }]}>
                        <IconComponent size={16} color={activity.color} />
                      </View>
                      <View style={styles.modernActivityContent}>
                        <Text style={styles.modernActivityTitle}>{activity.title}</Text>
                        <Text style={styles.modernActivityTime}>{activity.time}</Text>
                      </View>
                      <TouchableOpacity style={styles.activityAction}>
                        <ChevronRight size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Enhanced Market Insights */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Market Insights</Text>
                <TouchableOpacity style={styles.seeAllButton} onPress={handleNavigateToInsights}>
                  <Text style={styles.seeAllText}>More Insights</Text>
                  <BarChart3 size={14} color="#2D5016" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.modernInsightCard}
                onPress={handleNavigateToInsights}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.modernInsightGradient}>
                  <View style={styles.insightHeader}>
                    <View style={styles.insightIconContainer}>
                      <TrendingUp size={24} color="white" />
                    </View>
                    <View style={styles.insightBadge}>
                      <Text style={styles.insightBadgeText}>AI Powered</Text>
                    </View>
                  </View>
                  <Text style={styles.modernInsightTitle}>
                    {dashboardData?.market_insights?.[0]?.product_name ? 
                      `${dashboardData.market_insights[0].product_name} prices trending ${dashboardData.market_insights[0].trend}` :
                      'Maize prices up 15% this week'
                    }
                  </Text>
                  <Text style={styles.modernInsightSubtitle}>
                    {dashboardData?.market_insights?.[0]?.ai_recommendation || 
                      'High demand in Nairobi markets. Consider increasing inventory.'
                    }
                  </Text>
                  <View style={styles.insightAction}>
                    <Text style={styles.insightActionText}>View Details</Text>
                    <ArrowRight size={14} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            testID="profile-tab"

          >
            <View style={styles.profileHeader}>
              <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.profileGradient}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <UserIcon size={48} color="white" />
                  </View>
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Edit3 size={16} color="#2D5016" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileRole}>{user?.role?.replace('_', ' ').toUpperCase() ?? ''}</Text>
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Mail size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.contactText}>{user?.email}</Text>
                  </View>
                  {!!user?.phone && (
                    <View style={styles.contactItem}>
                      <Phone size={16} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.contactText}>{user.phone}</Text>
                    </View>
                  )}
                  {!!user?.location && (
                    <View style={styles.contactItem}>
                      <MapPin size={16} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.contactText}>{user.location}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Account Stats */}
            <View style={styles.accountStatsSection}>
              <Text style={styles.accountStatsTitle}>Account Stats</Text>
              <Text style={styles.accountStatsSubtitle}>Your current standing on the platform.</Text>
              
              {/* Membership */}
              <View style={styles.membershipCard}>
                <View style={styles.membershipIcon}>
                  <Star size={20} color="#FFD700" />
                </View>
                <View style={styles.membershipInfo}>
                  <Text style={styles.membershipLabel}>Membership</Text>
                  <Text style={styles.membershipValue}>Gold</Text>
                </View>
              </View>

              {/* Reputation */}
              <View style={styles.reputationCard}>
                <View style={styles.reputationIcon}>
                  <Shield size={20} color="#3B82F6" />
                </View>
                <View style={styles.reputationInfo}>
                  <Text style={styles.reputationLabel}>Reputation</Text>
                  <Text style={styles.reputationValue}>88 / 100</Text>
                </View>
              </View>

              {/* Badges */}
              <View style={styles.badgesSection}>
                <Text style={styles.badgesTitle}>Badges</Text>
                <View style={styles.badgesContainer}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Top Seller</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Community Helper</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Early Adopter</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Earnings & Payments */}
            <View style={styles.earningsSection}>
              <Text style={styles.earningsTitle}>Earnings & Payments</Text>
              
              {/* Earnings Summary */}
              <View style={styles.earningsSummary}>
                <View style={styles.earningsHeader}>
                  <BarChart3 size={20} color="#10B981" />
                  <Text style={styles.earningsSummaryTitle}>Earnings Summary</Text>
                </View>
                <View style={styles.earningsGrid}>
                  <View style={styles.earningsItem}>
                    <Text style={styles.earningsLabel}>Weekly:</Text>
                    <Text style={styles.earningsValue}>Ksh 15,000</Text>
                  </View>
                  <View style={styles.earningsItem}>
                    <Text style={styles.earningsLabel}>Monthly:</Text>
                    <Text style={styles.earningsValue}>Ksh 62,000</Text>
                  </View>
                  <View style={styles.earningsItem}>
                    <Text style={styles.earningsLabel}>Total:</Text>
                    <Text style={styles.earningsValue}>Ksh 250,000</Text>
                  </View>
                </View>
              </View>

              {/* Pending Payments */}
              <View style={styles.pendingPayments}>
                <View style={styles.pendingHeader}>
                  <Clock size={20} color="#F59E0B" />
                  <Text style={styles.pendingTitle}>Pending Payments</Text>
                </View>
                <View style={styles.pendingItem}>
                  <Text style={styles.pendingDescription}>50 Crates of Tomatoes:</Text>
                  <Text style={styles.pendingAmount}>Ksh 12,500</Text>
                </View>
              </View>
            </View>

            {/* Activity Hub */}
            <View style={styles.activityHubSection}>
              <Text style={styles.activityHubTitle}>Activity Hub</Text>
              
              <View style={styles.activityGrid}>
                <View style={styles.activityCard}>
                  <View style={styles.activityCardIcon}>
                    <Tractor size={20} color="#10B981" />
                  </View>
                  <Text style={styles.activityCardTitle}>Linked Farms</Text>
                  <Text style={styles.activityCardValue}>1 Farms</Text>
                </View>
                
                <View style={styles.activityCard}>
                  <View style={styles.activityCardIcon}>
                    <Wrench size={20} color="#10B981" />
                  </View>
                  <Text style={styles.activityCardTitle}>Services Offered</Text>
                  <Text style={styles.activityCardValue}>2 Services</Text>
                </View>
                
                <View style={styles.activityCard}>
                  <View style={styles.activityCardIcon}>
                    <MessageSquare size={20} color="#10B981" />
                  </View>
                  <Text style={styles.activityCardTitle}>My Posts</Text>
                  <Text style={styles.activityCardValue}>3 Posts</Text>
                </View>
                
                <View style={styles.activityCard}>
                  <View style={styles.activityCardIcon}>
                    <Users size={20} color="#10B981" />
                  </View>
                  <Text style={styles.activityCardTitle}>Joined Groups</Text>
                  <Text style={styles.activityCardValue}>2 Groups</Text>
                </View>
              </View>
            </View>

            {/* Recommended for You */}
            <View style={styles.recommendedSection}>
              <View style={styles.recommendedHeader}>
                <TrendingUp size={20} color="#10B981" />
                <Text style={styles.recommendedTitle}>Recommended for You</Text>
              </View>
              <Text style={styles.recommendedSubtitle}>AI-suggested opportunities based on your profile.</Text>
              
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>High-yield tomato seeds available in your area.</Text>
                <TouchableOpacity style={styles.recommendationButton}>
                  <Text style={styles.recommendationButtonText}>View</Text>
                  <ArrowRight size={16} color="#2D5016" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>A buyer is looking for 500 kienyeji eggs in Kiambu.</Text>
                <TouchableOpacity style={styles.recommendationButton}>
                  <Text style={styles.recommendationButtonText}>View</Text>
                  <ArrowRight size={16} color="#2D5016" />
                </TouchableOpacity>
              </View>
            </View>

            {roleStatsForProfile().length > 0 && (
              <View style={styles.statsContainerAlt}>
                <Text style={styles.sectionTitle}>Your Performance</Text>
                <View style={styles.statsGrid}>
                  {roleStatsForProfile().map((stat, index) => {
                    const IconComponent = stat.icon as any;
                    return (
                      <View key={`pstat-${index}`} style={styles.statCard}>
                        <View style={styles.statIcon}>
                          <IconComponent size={24} color="#2D5016" />
                        </View>
                        <Text style={styles.statValueAlt}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.verificationContainer}>
              <View style={styles.verificationHeader}>
                <Shield size={20} color="#10B981" />
                <Text style={styles.verificationTitle}>Account Verification</Text>
              </View>
              <Text style={styles.verificationDescription}>
                Verify your account to increase trust and unlock premium features
              </Text>
              <TouchableOpacity style={styles.verifyButton} onPress={handleNavigateToVerification}>
                <Text style={styles.verifyButtonText}>Verify Account</Text>
              </TouchableOpacity>
            </View>

            {/* Enhanced Menu Sections */}
            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Account Management</Text>
              {[
                { icon: Edit3, label: 'Edit Profile', action: handleNavigateToProfile, description: 'Update your personal information' },
                { icon: Settings, label: 'Settings', action: handleNavigateToSettings, description: 'App preferences and configuration' },
                { icon: Shield, label: 'Privacy & Security', action: handleNavigateToSecurity, description: 'Manage your account security' },
                { icon: MapPin, label: 'Address Book', action: handleNavigateToAddress, description: 'Manage delivery addresses' },
                { icon: BadgeCheck, label: 'Verification', action: handleNavigateToVerification, description: 'Complete account verification' },
                { icon: Crown, label: 'Subscription', action: handleNavigateToSubscription, description: 'Manage your subscription plan' }
              ].map((item: any, index: number) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity key={`account-${index}`} style={styles.enhancedMenuItem} onPress={item.action}>
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIcon}>
                        <IconComponent size={20} color="#2D5016" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Business & Trading</Text>
              {[
                { icon: Package, label: 'My Products', action: handleNavigateToMyProducts, description: 'Manage your product listings' },
                { icon: ShoppingCart, label: 'My Orders', action: handleNavigateToOrders, description: 'Track and manage orders' },
                { icon: Wallet, label: 'Wallet & Payments', action: handleNavigateToWallet, description: 'Manage your finances' },
                { icon: Heart, label: 'Favorites', action: handleNavigateToFavorites, description: 'Your saved items and vendors' },
                { icon: BarChart3, label: 'Market Insights', action: handleNavigateToInsights, description: 'View market trends and analytics' }
              ].map((item: any, index: number) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity key={`business-${index}`} style={styles.enhancedMenuItem} onPress={item.action}>
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIcon}>
                        <IconComponent size={20} color="#2D5016" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>App Preferences</Text>
              {[
                { icon: Bell, label: 'Notifications', action: handleNavigateToNotifications, description: 'Manage notification settings' },
                { icon: Globe, label: 'Language', action: handleNavigateToLanguage, description: 'Change app language' },
                { icon: Moon, label: 'Appearance', action: handleNavigateToAppearance, description: 'Theme and display settings' }
              ].map((item: any, index: number) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity key={`prefs-${index}`} style={styles.enhancedMenuItem} onPress={item.action}>
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIcon}>
                        <IconComponent size={20} color="#2D5016" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Support & Help</Text>
              {[
                { icon: MessageCircle, label: 'Customer Care', action: handleNavigateToCustomerCare, description: 'Get help from our support team' },
                { icon: HelpCircle, label: 'Help Center', action: handleNavigateToHelp, description: 'FAQs and guides' },
                { icon: MessageSquare, label: 'Send Feedback', action: handleNavigateToFeedback, description: 'Share your thoughts with us' },
                { icon: FileText, label: 'Legal & Terms', action: handleNavigateToLegal, description: 'Privacy policy and terms' }
              ].map((item: any, index: number) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity key={`support-${index}`} style={styles.enhancedMenuItem} onPress={item.action}>
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIcon}>
                        <IconComponent size={20} color="#2D5016" />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              {[
                { icon: UserX, label: 'Delete Account', action: handleNavigateToDeleteAccount, description: 'Permanently delete your account', danger: true },
                { icon: LogOut, label: 'Logout', action: handleLogout, description: 'Sign out of your account', danger: true }
              ].map((item: any, index: number) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity key={`actions-${index}`} style={styles.enhancedMenuItem} onPress={item.action}>
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                        <IconComponent size={20} color={item.danger ? '#EF4444' : '#2D5016'} />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
                        <Text style={[styles.menuDescription, item.danger && styles.menuDescriptionDanger]}>{item.description}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={item.danger ? '#EF4444' : '#9CA3AF'} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>Banda v1.0.0</Text>
              <Text style={styles.appInfoText}>Made with ❤️ for East African farmers</Text>
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  segmentHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 12,
  },
  segments: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    gap: 8,
    alignSelf: 'flex-start',
  },
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#2D5016',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 16, color: '#666', marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#2D5016', marginBottom: 2 },
  userRole: { fontSize: 12, color: '#8B4513', fontWeight: '600', letterSpacing: 0.5 },
  notificationButton: { position: 'relative', padding: 8 },
  notificationBadge: {
    position: 'absolute', top: 4, right: 4, backgroundColor: '#DC2626', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'
  },
  notificationText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', marginBottom: 32, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D5016' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 14, color: '#2D5016', fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  actionCard: {
    width: '45%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  activityList: { gap: 16 },
  activityItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2
  },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(45, 80, 22, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  activityTime: { fontSize: 12, color: '#666' },
  insightCard: { borderRadius: 16, overflow: 'hidden' },
  insightGradient: { padding: 20 },
  insightContent: { flexDirection: 'row', alignItems: 'center' },
  insightText: { marginLeft: 16, flex: 1 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  insightSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' },

  profileHeader: { marginTop: 12, marginBottom: 24, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  profileGradient: { padding: 24, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', borderRadius: 16, padding: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  profileRole: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600', letterSpacing: 0.5, marginBottom: 16 },
  contactInfo: { alignItems: 'center', gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14 },
  statsContainerAlt: { marginBottom: 24 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(45, 80, 22, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValueAlt: { fontSize: 18, fontWeight: 'bold', color: '#2D5016', marginBottom: 4 },
  verificationContainer: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  verificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  verificationTitle: { fontSize: 16, fontWeight: 'bold', color: '#065F46' },
  verificationDescription: { fontSize: 14, color: '#065F46', marginBottom: 12, lineHeight: 20 },
  verifyButton: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
  verifyButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  menuContainer: { marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  enhancedMenuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(45, 80, 22, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  menuIconDanger: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  menuTextContainer: {
    flex: 1
  },
  menuLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  menuDescription: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  menuLabelDanger: { color: '#EF4444' },
  menuDescriptionDanger: { color: '#F87171' },
  appInfo: { alignItems: 'center', gap: 4 },
  appInfoText: { fontSize: 14, color: '#999', textAlign: 'center' },

  // Loading styles
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // Dashboard styles
  profileSummary: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileNameSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  profileContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
    marginLeft: 4,
  },
  communityStats: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  communityStatItem: {
    alignItems: 'center',
  },
  communityStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  communityStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  dashboardSection: {
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 16,
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dashboardCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dashboardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dashboardCardContent: {
    flex: 1,
  },
  dashboardCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dashboardCardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dashboardButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dashboardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },

  // Account Stats styles
  accountStatsSection: {
    marginBottom: 24,
  },
  accountStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 4,
  },
  accountStatsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  membershipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  membershipValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reputationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reputationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reputationInfo: {
    flex: 1,
  },
  reputationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  reputationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badgesSection: {
    marginBottom: 16,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Earnings styles
  earningsSection: {
    marginBottom: 24,
  },
  earningsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 16,
  },
  earningsSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  earningsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  earningsGrid: {
    gap: 8,
  },
  earningsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  pendingPayments: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingDescription: {
    fontSize: 14,
    color: '#92400E',
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },

  // Activity Hub styles
  activityHubSection: {
    marginBottom: 24,
  },
  activityHubTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activityCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  activityCardValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Recommended styles
  recommendedSection: {
    marginBottom: 24,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
    marginLeft: 8,
  },
  recommendedSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  recommendationButtonText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
    marginRight: 4,
  },

  // Modern Header Styles
  modernHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2D5016',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  // Tab Navigation Styles
  tabContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabScrollContent: {
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#E8F5E8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#2D5016',
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },

  // Quick Stats Styles
  quickStatsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickStatGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickStatContent: {
    flex: 1,
    marginLeft: 12,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  eyeButton: {
    padding: 4,
  },

  // Loading Content
  loadingContent: {
    alignItems: 'center',
    gap: 12,
  },

  // Modern Card Styles
  modernCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
  },

  // Verification Progress
  verificationProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Primary Button
  primaryButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Subscription Features
  subscriptionFeatures: {
    marginBottom: 16,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },

  // Wallet Styles
  walletBalances: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  walletActions: {
    flexDirection: 'row',
    gap: 8,
  },
  walletButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 4,
  },
  walletButtonText: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '600',
  },
  walletLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  walletLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  walletError: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  walletErrorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  walletRetryText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
  },

  // Metrics Section
  metricsSection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Actions Scroll Content
  actionsScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  modernActionCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modernActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modernActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },

  // Modern Activity Styles
  modernActivityList: {
    gap: 12,
  },
  modernActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modernActivityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modernActivityContent: {
    flex: 1,
  },
  modernActivityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modernActivityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityAction: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  // Modern Insight Styles
  modernInsightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernInsightGradient: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  modernInsightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    lineHeight: 22,
  },
  modernInsightSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  insightActionText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },

  dashboardRedirect: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dashboardRedirectGradient: {
    padding: 32,
    alignItems: 'center',
  },
  dashboardRedirectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  dashboardRedirectSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  dashboardRedirectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  dashboardRedirectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016',
  },
  dashboardFeatures: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
