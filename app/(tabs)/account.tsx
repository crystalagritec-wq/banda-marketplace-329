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
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  Crown,
  ShieldCheck,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/auth-provider';
import { useLoyalty } from '@/providers/loyalty-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';


export default function AccountScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { points, badges } = useLoyalty();
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const sessionQuery = trpc.profile.fetchSession.useQuery(undefined, {
    enabled: !!user,
  });

  const uploadPhotoMutation = trpc.profile.uploadPhoto.useMutation();
  const updateProfileMutation = trpc.profile.update.useMutation();

  useEffect(() => {
    if (sessionQuery.data?.success && sessionQuery.data.data) {
      setProfileData(sessionQuery.data.data);
    }
  }, [sessionQuery.data]);

  const displayName = user?.name || profileData?.user?.fullName || 'User';
  const displayEmail = user?.email || profileData?.user?.email || 'user@example.com';
  const displayPhone = user?.phone || profileData?.user?.phone || '';
  const displayAvatar = user?.avatar || profileData?.user?.profilePictureUrl;
  const displayVerified = user?.kycStatus === 'verified' || profileData?.user?.isVerified;
  const displayReputation = user?.reputationScore || profileData?.user?.reputationScore || 0;
  const displayTier = user?.membershipTier || profileData?.user?.membershipTier || 'basic';
  const displayRole = user?.role || 'buyer';

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

  const handleUploadPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        const asset = result.assets[0];
        
        let base64Data = '';
        if (Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const reader = new FileReader();
          base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(blob);
          });
        }

        const uploadResult = await uploadPhotoMutation.mutateAsync({
          photoBase64: base64Data,
          mimeType: 'image/jpeg',
        });

        if (uploadResult.success && uploadResult.photoUrl) {
          await updateProfile({ avatar: uploadResult.photoUrl });
          
          await updateProfileMutation.mutateAsync({
            profilePictureUrl: uploadResult.photoUrl,
          });
          
          Alert.alert('Success', 'Profile picture updated successfully!');
          sessionQuery.refetch();
        }
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const menuItems = [
    {
      icon: Award,
      label: 'Rewards Hub',
      route: '/rewards-hub',
      color: '#F59E0B',
    },
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
    <View style={styles.container} testID="account-screen">
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Header with Gradient Background */}
        <LinearGradient
          colors={['#2D5016', '#4A7C59', '#F9FAFB']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {displayAvatar ? (
                <Image
                  source={{ uri: displayAvatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <UserIcon size={48} color="#2D5016" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={handleUploadPhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Camera size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfoContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{displayName}</Text>
                {displayVerified && (
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={14} color="#10B981" />
                  </View>
                )}
              </View>
              
              {/* Role Badge */}
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{displayRole.toUpperCase()}</Text>
              </View>
              
              {/* Contact Info */}
              <View style={styles.contactContainer}>
                <View style={styles.contactRow}>
                  <Mail size={14} color="#E5E7EB" />
                  <Text style={styles.contactText}>{displayEmail}</Text>
                </View>
                
                {displayPhone && (
                  <View style={styles.contactRow}>
                    <Phone size={14} color="#E5E7EB" />
                    <Text style={styles.contactText}>{displayPhone}</Text>
                  </View>
                )}
              </View>
              
              {/* Edit Profile Button */}
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit size={14} color="#2D5016" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7}>
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Award size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{points || 0}</Text>
              <Text style={styles.statLabel}>Loyalty Points</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7}>
            <LinearGradient
              colors={['#DBEAFE', '#BFDBFE']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Star size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{badges?.length || 0}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7}>
            <LinearGradient
              colors={['#D1FAE5', '#A7F3D0']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{displayReputation}</Text>
              <Text style={styles.statLabel}>Reputation</Text>
            </LinearGradient>
          </TouchableOpacity>
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
        <TouchableOpacity 
          style={styles.membershipSection}
          onPress={() => router.push('/subscription' as any)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#FEF3C7', '#FBBF24']}
            style={styles.membershipCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.membershipIconContainer}>
              <Crown size={28} color="#92400E" />
            </View>
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipLabel}>Membership Tier</Text>
              <Text style={styles.membershipValue}>
                {displayTier.toUpperCase()}
              </Text>
            </View>
            <ChevronRight size={24} color="#92400E" />
          </LinearGradient>
        </TouchableOpacity>

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
    paddingBottom: 32,
  },
  headerGradient: {
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2D5016',
    borderRadius: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: 6,
    borderRadius: 20,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 1,
  },
  contactContainer: {
    gap: 6,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editButtonText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '700',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '600',
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
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  membershipIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(146, 64, 14, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipLabel: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
    fontWeight: '600',
  },
  membershipValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350F',
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
