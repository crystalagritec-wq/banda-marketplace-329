import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth, UserRole as AuthUserRole } from '@/providers/auth-provider';
import { roleService } from '@/services/role-service';
import { UserRole, UserTier } from '@/lib/supabase';
import { Store, Truck, Wrench, Sprout, ShoppingBag, CheckCircle, ArrowRight, Star, Crown, Shield, Award } from 'lucide-react-native';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  benefits: string[];
  requiresVerification: boolean;
  availableTiers: UserTier[];
}

interface UserStatus {
  currentRole: UserRole;
  currentTier: UserTier;
  availableUpgrades: {
    role: UserRole;
    tier: UserTier;
    canUpgrade: boolean;
    requiresVerification: boolean;
    requiresSubscription: boolean;
  }[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'buyer',
    title: 'Buyer',
    description: 'Browse and purchase items from the marketplace',
    icon: ShoppingBag,
    color: '#3B82F6',
    benefits: ['Browse marketplace', 'Make purchases', 'Leave reviews'],
    requiresVerification: false,
    availableTiers: ['none', 'verified', 'gold', 'premium']
  },
  {
    role: 'seller',
    title: 'Seller',
    description: 'Sell your products on Banda marketplace',
    icon: Store,
    color: '#10B981',
    benefits: ['List items', 'Seller dashboard', 'Analytics'],
    requiresVerification: true,
    availableTiers: ['verified', 'gold', 'premium', 'elite']
  },
  {
    role: 'service_provider',
    title: 'Service Provider',
    description: 'Offer services to the community',
    icon: Wrench,
    color: '#F59E0B',
    benefits: ['List services', 'Service bookings', 'Local priority'],
    requiresVerification: true,
    availableTiers: ['verified', 'gold', 'premium', 'elite']
  },
  {
    role: 'logistics_provider',
    title: 'Logistics Provider',
    description: 'Provide delivery and logistics services',
    icon: Truck,
    color: '#8B5CF6',
    benefits: ['Delivery services', 'Route optimization', 'Bulk contracts'],
    requiresVerification: true,
    availableTiers: ['verified', 'gold', 'premium', 'elite']
  },
  {
    role: 'farmer',
    title: 'Farmer',
    description: 'Manage your farm and connect to market',
    icon: Sprout,
    color: '#059669',
    benefits: ['Farm management', 'Market integration', 'Advisory services'],
    requiresVerification: true,
    availableTiers: ['verified', 'gold', 'premium', 'elite']
  }
];

const TIER_ICONS: Record<UserTier, React.ComponentType<any>> = {
  none: ShoppingBag,
  verified: CheckCircle,
  gold: Star,
  premium: Crown,
  elite: Award
};

const TIER_COLORS: Record<UserTier, string> = {
  none: '#9CA3AF',
  verified: '#10B981',
  gold: '#F59E0B',
  premium: '#8B5CF6',
  elite: '#DC2626'
};

export default function RoleSelectionScreen() {
  const { user, updateProfile } = useAuth();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserStatus();
    }
  }, [user, loadUserStatus]);

  const loadUserStatus = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get user's current roles and available upgrades
      // Get user's current roles and available upgrades
      // const roles = await roleService.getUserRoles(user.id);
      const currentRole = user.role as UserRole || 'buyer';
      // For now, default to 'none' tier since tier property is not yet fully integrated
      const currentTier: UserTier = 'none';
      
      // Calculate available upgrades
      const availableUpgrades = [];
      
      for (const roleOption of ROLE_OPTIONS) {
        if (roleOption.role === currentRole) continue;
        
        const upgradePath = await roleService.getRoleUpgradePath(user.id, roleOption.role);
        
        for (const upgrade of upgradePath.availableUpgrades) {
          if (upgrade.canUpgrade) {
            availableUpgrades.push({
              role: roleOption.role,
              tier: upgrade.tier,
              canUpgrade: true,
              requiresVerification: roleOption.requiresVerification,
              requiresSubscription: upgrade.tier === 'premium' || upgrade.tier === 'elite'
            });
          }
        }
      }
      
      setUserStatus({
        currentRole,
        currentTier,
        availableUpgrades
      });
    } catch (error) {
      console.error('❌ Error loading user status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleUpgradeRequest = async (role: UserRole, targetTier: UserTier, requiresVerification: boolean, requiresSubscription: boolean) => {
    if (!user) return;

    try {
      setIsUpgrading(true);

      if (requiresSubscription) {
        // Navigate to subscription screen
        router.push({
          pathname: '/subscription' as any,
          params: {
            role,
            tier: targetTier,
            userId: user.id
          }
        });
        return;
      }

      if (requiresVerification) {
        // Navigate to verification screen
        router.push({
          pathname: '/verification' as any,
          params: {
            roleType: role,
            verificationMethod: roleService.getRequiredVerificationMethod(targetTier),
            userId: user.id
          }
        });
        return;
      }

      // Direct upgrade for buyer role
      const result = await roleService.requestRoleUpgrade({
        userId: user.id,
        roleType: role,
        verificationMethod: 'ai_id'
      });

      if (result.success) {
        await updateProfile({ role: role as AuthUserRole });
        Alert.alert(
          'Success!',
          result.message || 'Your role has been upgraded successfully!',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)/marketplace')
            }
          ]
        );
      } else {
        Alert.alert(
          'Upgrade Failed',
          result.error || 'Failed to upgrade your role. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Role upgrade error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleContinueAsBuyer = () => {
    router.replace('/(tabs)/marketplace');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your account status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load account status</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserStatus}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentRoleOption = ROLE_OPTIONS.find(option => option.role === userStatus.currentRole);
  const TierIcon = TIER_ICONS[userStatus.currentTier];
  const tierColor = TIER_COLORS[userStatus.currentTier];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Account Status</Text>
          <Text style={styles.subtitle}>
            Roles are automatically assigned based on verifications, subscriptions, and performance.
          </Text>
        </View>

        {/* Current Status */}
        <View style={styles.currentStatusContainer}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.currentStatusCard}>
            <View style={styles.currentStatusHeader}>
              <View style={[styles.currentStatusIcon, { backgroundColor: currentRoleOption?.color + '20' }]}>
                {currentRoleOption && <currentRoleOption.icon size={24} color={currentRoleOption.color} />}
              </View>
              <View style={styles.currentStatusInfo}>
                <Text style={styles.currentRoleTitle}>{currentRoleOption?.title || 'Buyer'}</Text>
                <View style={styles.tierBadge}>
                  <TierIcon size={16} color={tierColor} />
                  <Text style={[styles.tierText, { color: tierColor }]}>
                    {userStatus.currentTier.charAt(0).toUpperCase() + userStatus.currentTier.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.currentStatusDescription}>
              {currentRoleOption?.description || 'Browse and purchase items from the marketplace'}
            </Text>
          </View>
        </View>

        {/* Available Upgrades */}
        {userStatus.availableUpgrades.length > 0 && (
          <View style={styles.upgradesContainer}>
            <Text style={styles.sectionTitle}>Available Upgrades</Text>
            <Text style={styles.upgradesSubtitle}>
              Unlock new features through verification and subscriptions
            </Text>
            
            {userStatus.availableUpgrades.map((upgrade, index) => {
              const roleOption = ROLE_OPTIONS.find(option => option.role === upgrade.role);
              if (!roleOption) return null;
              
              const Icon = roleOption.icon;
              const UpgradeTierIcon = TIER_ICONS[upgrade.tier];
              const upgradeTierColor = TIER_COLORS[upgrade.tier];
              
              return (
                <TouchableOpacity
                  key={`${upgrade.role}-${upgrade.tier}-${index}`}
                  style={styles.upgradeCard}
                  onPress={() => handleUpgradeRequest(
                    upgrade.role,
                    upgrade.tier,
                    upgrade.requiresVerification,
                    upgrade.requiresSubscription
                  )}
                  disabled={isUpgrading}
                  testID={`upgrade-${upgrade.role}-${upgrade.tier}`}
                >
                  <View style={styles.upgradeHeader}>
                    <View style={[styles.upgradeIcon, { backgroundColor: roleOption.color + '20' }]}>
                      <Icon size={20} color={roleOption.color} />
                    </View>
                    <View style={styles.upgradeInfo}>
                      <Text style={styles.upgradeTitle}>{roleOption.title}</Text>
                      <View style={styles.upgradeTierBadge}>
                        <UpgradeTierIcon size={14} color={upgradeTierColor} />
                        <Text style={[styles.upgradeTierText, { color: upgradeTierColor }]}>
                          {upgrade.tier.charAt(0).toUpperCase() + upgrade.tier.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.upgradeRequirements}>
                      {upgrade.requiresVerification && (
                        <View style={styles.requirementBadge}>
                          <Shield size={12} color="#F59E0B" />
                          <Text style={styles.requirementText}>Verification</Text>
                        </View>
                      )}
                      {upgrade.requiresSubscription && (
                        <View style={[styles.requirementBadge, { backgroundColor: '#FEE2E2' }]}>
                          <Crown size={12} color="#DC2626" />
                          <Text style={[styles.requirementText, { color: '#DC2626' }]}>Subscription</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.upgradeDescription}>{roleOption.description}</Text>
                  
                  <View style={styles.upgradeBenefits}>
                    {roleOption.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                      <View key={`${upgrade.role}-${upgrade.tier}-benefit-${benefitIndex}`} style={styles.upgradeBenefitItem}>
                        <View style={[styles.upgradeBenefitDot, { backgroundColor: roleOption.color }]} />
                        <Text style={styles.upgradeBenefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.upgradeAction}>
                    <ArrowRight size={16} color={roleOption.color} />
                    <Text style={[styles.upgradeActionText, { color: roleOption.color }]}>
                      {upgrade.requiresSubscription ? 'Subscribe' : upgrade.requiresVerification ? 'Verify' : 'Upgrade'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {userStatus.availableUpgrades.length === 0 && (
          <View style={styles.noUpgradesContainer}>
            <Text style={styles.noUpgradesTitle}>All Set!</Text>
            <Text style={styles.noUpgradesText}>
              You have access to all available features for your current role. 
              Keep using Banda to unlock performance-based upgrades.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueAsBuyer}
          testID="continue-button"
        >
          <Text style={styles.continueButtonText}>Continue to Marketplace</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  currentStatusContainer: {
    padding: 16,
    marginBottom: 8,
  },
  currentStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentStatusInfo: {
    flex: 1,
  },
  currentRoleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentStatusDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  upgradesContainer: {
    padding: 16,
  },
  upgradesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  upgradeTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upgradeTierText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upgradeRequirements: {
    gap: 4,
  },
  requirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requirementText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
  },
  upgradeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  upgradeBenefits: {
    gap: 4,
    marginBottom: 8,
  },
  upgradeBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upgradeBenefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  upgradeBenefitText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  upgradeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  upgradeActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noUpgradesContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  noUpgradesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  noUpgradesText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});