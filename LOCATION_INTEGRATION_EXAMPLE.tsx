/**
 * LOCATION-AWARE CHECKOUT INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the location-aware delivery system
 * into the checkout screen for optimal user experience.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation, TrendingUp } from 'lucide-react-native';
import { useLocation, OptimalDeliveryOption } from '@/providers/location-provider';
import { useCart } from '@/providers/cart-provider';
import { LocationPickerModal } from '@/components/LocationPickerModal';

export default function EnhancedCheckoutScreen() {
  const { 
    userLocation, 
    getOptimalDeliveryOption,
    isLoadingLocation,
  } = useLocation();
  
  const { cartItems, groupedBySeller, cartSummary } = useCart();
  
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [optimalDelivery, setOptimalDelivery] = useState<OptimalDeliveryOption | null>(null);
  const [totalDeliveryFee, setTotalDeliveryFee] = useState(0);

  // Calculate optimal delivery when location or cart changes
  useEffect(() => {
    if (!userLocation || groupedBySeller.length === 0) return;

    const sellers = groupedBySeller
      .map(group => {
        const coords = cartItems.find(item => item.sellerId === group.sellerId)?.product.coordinates;
        if (!coords) return null;
        return {
          sellerId: group.sellerId,
          sellerName: group.sellerName,
          coordinates: coords,
          orderValue: group.subtotal,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const optimal = getOptimalDeliveryOption(sellers, userLocation);
    if (optimal) {
      setOptimalDelivery(optimal);
      setTotalDeliveryFee(optimal.totalFee);
      console.log('[Checkout] Auto-selected optimal delivery:', optimal);
    }
  }, [userLocation, groupedBySeller, cartItems, getOptimalDeliveryOption]);

  return (
    <View style={styles.container}>
      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Location</Text>
        
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => setShowLocationPicker(true)}
        >
          <View style={styles.locationIcon}>
            <MapPin size={20} color="#10B981" />
          </View>
          
          <View style={styles.locationContent}>
            {userLocation ? (
              <>
                <Text style={styles.locationLabel}>
                  {userLocation.label || 'Selected Location'}
                </Text>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {userLocation.address || userLocation.city || 'Custom location'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.locationPlaceholder}>
                  Set delivery location
                </Text>
                <Text style={styles.locationHint}>
                  Tap to enable GPS or search address
                </Text>
              </>
            )}
          </View>

          {isLoadingLocation ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <Text style={styles.changeText}>Change</Text>
          )}
        </TouchableOpacity>

        {!userLocation && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              📍 Enable location to see accurate delivery fees and find nearby sellers
            </Text>
          </View>
        )}
      </View>

      {/* Optimal Delivery Recommendation */}
      {optimalDelivery && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Delivery</Text>
            <View style={styles.badge}>
              <TrendingUp size={12} color="#10B981" />
              <Text style={styles.badgeText}>Optimal</Text>
            </View>
          </View>

          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryIcon}>
                <Navigation size={20} color="#10B981" />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryName}>
                  {optimalDelivery.providerName}
                </Text>
                <Text style={styles.deliveryReason}>
                  {optimalDelivery.reason}
                </Text>
              </View>
            </View>

            <View style={styles.deliveryDetails}>
              <View style={styles.deliveryDetailItem}>
                <Text style={styles.deliveryDetailLabel}>Distance</Text>
                <Text style={styles.deliveryDetailValue}>
                  {optimalDelivery.distanceKm.toFixed(1)} km
                </Text>
              </View>
              <View style={styles.deliveryDetailItem}>
                <Text style={styles.deliveryDetailLabel}>ETA</Text>
                <Text style={styles.deliveryDetailValue}>
                  {optimalDelivery.estimatedTime}
                </Text>
              </View>
              <View style={styles.deliveryDetailItem}>
                <Text style={styles.deliveryDetailLabel}>Fee</Text>
                <Text style={styles.deliveryDetailValue}>
                  KES {optimalDelivery.totalFee}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Order Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({cartSummary.itemCount} items)
          </Text>
          <Text style={styles.summaryValue}>
            KES {cartSummary.subtotal.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>
            {totalDeliveryFee > 0 
              ? `KES ${totalDeliveryFee.toLocaleString()}`
              : 'Calculating...'}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>
            KES {(cartSummary.subtotal + totalDeliveryFee).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelected={(location) => {
          console.log('[Checkout] Location selected:', location);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700' as const,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationPlaceholder: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  locationHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  changeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  deliveryReason: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  deliveryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  deliveryDetailItem: {
    alignItems: 'center',
  },
  deliveryDetailLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  deliveryDetailValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
});
