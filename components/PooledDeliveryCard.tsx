import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, TrendingDown, Clock, Truck } from 'lucide-react-native';

interface PooledDeliveryCardProps {
  poolId: string;
  estimatedSavings: number;
  waitTimeMinutes: number;
  poolingType: 'common_route' | 'nearby_delivery';
  commonSellers?: string[];
  distanceKm: number;
  recommendation: 'highly_recommended' | 'recommended' | 'optional';
  onAccept: () => void;
  onDecline: () => void;
}

export function PooledDeliveryCard({
  poolId,
  estimatedSavings,
  waitTimeMinutes,
  poolingType,
  commonSellers = [],
  distanceKm,
  recommendation,
  onAccept,
  onDecline,
}: PooledDeliveryCardProps) {
  const getBadgeColor = () => {
    switch (recommendation) {
      case 'highly_recommended':
        return { bg: '#DCFCE7', text: '#166534', border: '#10B981' };
      case 'recommended':
        return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  const badgeColors = getBadgeColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Users size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.title}>Pooled Delivery Available</Text>
            <Text style={styles.subtitle}>
              {poolingType === 'common_route' ? 'Same route' : 'Nearby delivery'}
            </Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColors.bg, borderColor: badgeColors.border }]}>
          <Text style={[styles.badgeText, { color: badgeColors.text }]}>
            {recommendation === 'highly_recommended' ? '⭐ Best' : 
             recommendation === 'recommended' ? '👍 Good' : 'OK'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TrendingDown size={16} color="#10B981" />
          <Text style={styles.statLabel}>Save</Text>
          <Text style={styles.statValue}>KSh {estimatedSavings}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Clock size={16} color="#F59E0B" />
          <Text style={styles.statLabel}>Wait</Text>
          <Text style={styles.statValue}>{waitTimeMinutes} min</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Truck size={16} color="#6B7280" />
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{distanceKm.toFixed(1)} km</Text>
        </View>
      </View>

      {commonSellers.length > 0 && (
        <View style={styles.sellersContainer}>
          <Text style={styles.sellersLabel}>Common sellers:</Text>
          <Text style={styles.sellersText}>{commonSellers.join(', ')}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Text style={styles.declineText}>No Thanks</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Text style={styles.acceptText}>Join Pool & Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Your order will be delivered with other nearby orders to reduce costs
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  sellersContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  sellersLabel: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  sellersText: {
    fontSize: 12,
    color: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  declineText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
});
