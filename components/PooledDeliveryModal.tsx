import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Users, TrendingDown, Clock, MapPin, Package } from 'lucide-react-native';

interface PooledDeliveryOption {
  poolId: string;
  orderId: string;
  distanceKm: number;
  estimatedSavings: number;
  waitTimeMinutes: number;
  poolingType: 'common_route' | 'nearby_delivery';
  commonSellers: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'optional';
}

interface PooledDeliveryModalProps {
  visible: boolean;
  onClose: () => void;
  suggestions: PooledDeliveryOption[];
  onSelectPool: (poolId: string) => void;
  isLoading?: boolean;
}

export function PooledDeliveryModal({
  visible,
  onClose,
  suggestions,
  onSelectPool,
  isLoading = false,
}: PooledDeliveryModalProps) {
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  const handleSelect = (poolId: string) => {
    setSelectedPoolId(poolId);
    onSelectPool(poolId);
  };

  const getBadgeColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'recommended':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Users size={24} color="#10B981" />
              </View>
              <View>
                <Text style={styles.title}>Pooled Delivery Options</Text>
                <Text style={styles.subtitle}>Save money by sharing delivery</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Finding pooling opportunities...</Text>
            </View>
          ) : suggestions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Package size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Pooling Options Available</Text>
              <Text style={styles.emptyText}>
                We could not find any nearby orders to pool with right now.
                Your order will be delivered individually.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>💡 How Pooled Delivery Works</Text>
                <Text style={styles.infoText}>
                  Your order is combined with nearby deliveries going in the same direction.
                  This reduces costs and environmental impact!
                </Text>
              </View>

              {suggestions.map((option) => {
                const badgeColors = getBadgeColor(option.recommendation);
                const isSelected = selectedPoolId === option.poolId;

                return (
                  <TouchableOpacity
                    key={option.poolId}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => handleSelect(option.poolId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionHeader}>
                      <View style={[styles.optionBadge, { backgroundColor: badgeColors.bg }]}>
                        <Text style={[styles.optionBadgeText, { color: badgeColors.text }]}>
                          {option.recommendation === 'highly_recommended' ? '⭐ Best Deal' :
                           option.recommendation === 'recommended' ? '👍 Good Deal' : 'Available'}
                        </Text>
                      </View>
                      <Text style={styles.poolType}>
                        {option.poolingType === 'common_route' ? '🚛 Same Route' : '📍 Nearby'}
                      </Text>
                    </View>

                    <View style={styles.savingsRow}>
                      <TrendingDown size={20} color="#10B981" />
                      <Text style={styles.savingsText}>
                        Save <Text style={styles.savingsAmount}>KSh {option.estimatedSavings}</Text>
                      </Text>
                    </View>

                    <View style={styles.optionStats}>
                      <View style={styles.optionStat}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.optionStatText}>+{option.waitTimeMinutes} min wait</Text>
                      </View>
                      <View style={styles.optionStat}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.optionStatText}>{option.distanceKm.toFixed(1)} km away</Text>
                      </View>
                    </View>

                    {option.commonSellers.length > 0 && (
                      <View style={styles.sellersTag}>
                        <Text style={styles.sellersTagText}>
                          Common sellers: {option.commonSellers.join(', ')}
                        </Text>
                      </View>
                    )}

                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓ Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.skipButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Skip Pooling - Deliver Individually</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1E40AF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  poolType: {
    fontSize: 12,
    color: '#6B7280',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 14,
    color: '#1F2937',
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  optionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  optionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sellersTag: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  sellersTagText: {
    fontSize: 11,
    color: '#059669',
  },
  selectedIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  skipButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
