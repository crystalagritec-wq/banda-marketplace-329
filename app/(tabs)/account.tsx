import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  User as UserIcon,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Wallet,
  Package,
  ShoppingCart,
  Heart,
  MapPin,
  Bell,
  HelpCircle,
  FileText,
  Camera,
  Award,
  Star,
  Phone,
  Mail,
  Edit,
  TrendingUp,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useLoyalty } from '@/providers/loyalty-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';


export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { points, badges } = useLoyalty();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<any>(null);

  const sessionQuery = trpc.profile.fetchSession.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (sessionQuery.data?.success && sessionQuery.data.data) {
      setProfileData(sessionQuery.data.data);
    }
  }, [sessionQuery.data]);

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

  const handleEditProfile = () => {
    router.push('/profile' as any);
  };

  const menuItems = [
    {
      icon: Wallet,
      label: 'Wallet',
      route: '/wallet',
      color: '#10B981',
    },
    {
      icon: Package,
      label: 'My Products',
      route: '/my-products',
      color: '#3B82F6',
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      route: '/orders',
      color: '#F59E0B',
    },
    {
      icon: Heart,
      label: 'Favorites',
      route: '/favorites',
      color: '#EF4444',
    },
    {
      icon: MapPin,
      label: 'Address',
      route: '/address',
      color: '#8B5CF6',
    },
    {
      icon: Bell,
      label: 'Notifications',
      route: '/notifications',
      color: '#EC4899',
    },
    {
      icon: Shield,
      label: 'Security',
      route: '/settings/security',
      color: '#06B6D4',
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      route: '/settings/help',
      color: '#6366F1',
    },
    {
      icon: FileText,
      label: 'Legal',
      route: '/settings/legal',
      color: '#64748B',
    },
    {
      icon: Settings,
      label: 'Settings',
      route: '/settings',
      color: '#475569',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="account-screen">
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar || profileData?.user?.profilePictureUrl ? (
              <Image
                source={{ uri: user?.avatar || profileData?.user?.profilePictureUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <UserIcon size={40} color="#2D5016" />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleEditProfile}>
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || profileData?.user?.fullName || 'User'}</Text>
              {(user?.kycStatus === 'verified' || profileData?.user?.isVerified) && (
                <View style={styles.verifiedBadge}>
                  <Shield size={12} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            
            {/* Contact Info */}
            <View style={styles.contactRow}>
              <Mail size={14} color="#6B7280" />
              <Text style={styles.contactText}>{user?.email || profileData?.user?.email || 'user@example.com'}</Text>
            </View>
            
            {user?.phone && (
              <View style={styles.contactRow}>
                <Phone size={14} color="#6B7280" />
                <Text style={styles.contactText}>{user.phone}</Text>
              </View>
            )}
            
            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Edit size={14} color="#2D5016" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Award size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{points || 0}</Text>
            <Text style={styles.statLabel}>Loyalty Points</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Star size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{badges?.length || 0}</Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{user?.reputationScore || profileData?.user?.reputationScore || 0}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
        </View>

        {/* Badges Display */}
        {badges && badges.length > 0 && (
          <View style={styles.badgesDisplaySection}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
              {badges.map((badge, index) => (
                <View key={badge.id || index} style={styles.badgeCard}>
                  <View style={styles.badgeIconContainer}>
                    <Award size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Membership Tier */}
        {(user?.membershipTier || profileData?.user?.membershipTier) && (
          <View style={styles.membershipSection}>
            <View style={styles.membershipCard}>
              <View style={styles.membershipIconContainer}>
                <Award size={24} color="#F59E0B" />
              </View>
              <View style={styles.membershipInfo}>
                <Text style={styles.membershipLabel}>Membership Tier</Text>
                <Text style={styles.membershipValue}>
                  {(user?.membershipTier || profileData?.user?.membershipTier || 'basic').toUpperCase()}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </View>
        )}

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                  <IconComponent size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Banda v1.0.0</Text>
        </View>
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
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2D5016',
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  editButtonText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  badgesDisplaySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  badgesScroll: {
    flexDirection: 'row',
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  membershipSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  membershipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  membershipValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
