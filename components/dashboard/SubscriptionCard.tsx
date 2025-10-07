import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Crown, Star, Zap, ArrowRight, Calendar, CheckCircle } from 'lucide-react-native';

interface SubscriptionCardProps {
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
  onUpgrade: () => void;
  onViewBenefits: () => void;
}

export default function SubscriptionCard({ subscription, onUpgrade, onViewBenefits }: SubscriptionCardProps) {
  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium': return Crown;
      case 'gold': return Star;
      case 'verified': return Zap;
      default: return CheckCircle;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'premium': return '#8B5CF6';
      case 'gold': return '#F59E0B';
      case 'verified': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const TierIcon = getTierIcon(subscription.current_tier);
  const tierColor = getTierColor(subscription.current_tier);
  const daysRemaining = getDaysRemaining(subscription.end_date);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${tierColor}20` }]}>
            <TierIcon size={24} color={tierColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Subscription</Text>
            <Text style={[styles.tier, { color: tierColor }]}>
              {subscription.current_tier} Tier
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: subscription.status === 'active' ? '#10B981' : '#6B7280' }
        ]}>
          <Text style={styles.statusText}>
            {subscription.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Subscription Details */}
      {subscription.status === 'active' && subscription.end_date && (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#666" />
            <Text style={styles.detailText}>
              Expires: {formatDate(subscription.end_date)}
            </Text>
            {daysRemaining !== null && daysRemaining <= 7 && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningText}>
                  {daysRemaining} days left
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.detailText}>
              Auto-renew: {subscription.auto_renew ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
      )}

      {/* Key Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Key Benefits</Text>
        <View style={styles.featuresList}>
          {Object.entries(subscription.features).slice(0, 3).map(([key, value]) => (
            <View key={key} style={styles.featureItem}>
              <CheckCircle size={14} color={value ? '#10B981' : '#6B7280'} />
              <Text style={[
                styles.featureText,
                { color: value ? '#333' : '#666' }
              ]}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Limits */}
      {subscription.limits && Object.keys(subscription.limits).length > 0 && (
        <View style={styles.limitsSection}>
          <Text style={styles.sectionTitle}>Current Limits</Text>
          <View style={styles.limitsList}>
            {Object.entries(subscription.limits).slice(0, 2).map(([key, value]) => (
              <View key={key} style={styles.limitItem}>
                <Text style={styles.limitKey}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </Text>
                <Text style={styles.limitValue}>
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.benefitsButton} 
          onPress={onViewBenefits}
          activeOpacity={0.8}
        >
          <Text style={styles.benefitsButtonText}>View All Benefits</Text>
          <ArrowRight size={16} color="#2D5016" />
        </TouchableOpacity>

        {subscription.current_tier !== 'Premium' && (
          <TouchableOpacity 
            style={styles.upgradeButton} 
            onPress={onUpgrade}
            activeOpacity={0.8}
          >
            <Crown size={16} color="white" />
            <Text style={styles.upgradeButtonText}>Upgrade Tier</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  tier: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  limitsSection: {
    marginBottom: 16,
  },
  limitsList: {
    gap: 8,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitKey: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  limitValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  benefitsButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  benefitsButtonText: {
    color: '#2D5016',
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});