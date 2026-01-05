import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  X,
  Calendar,
  MapPin,
  Truck,
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCart } from '@/providers/cart-provider';

const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

interface EquipmentRentalModalProps {
  visible: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    name: string;
    category: string;
    pricePerDay: number;
    location: string;
    rating?: number;
    image?: string;
    condition?: string;
    securityDeposit?: number;
    ownerName?: string;
  };
  onRentalComplete?: (rental: EquipmentRental) => void;
}

export interface EquipmentRental {
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalPrice: number;
  securityDeposit: number;
  totalPrice: number;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  status: 'pending' | 'confirmed' | 'active' | 'returned';
}

export default function EquipmentRentalModal({
  visible,
  onClose,
  equipment,
  onRentalComplete,
}: EquipmentRentalModalProps) {
  const { addEquipmentRentalToCart } = useCart();
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const endDateOptions = useMemo(() => {
    if (!startDate) return [];
    const start = new Date(startDate);
    const dates: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, [startDate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const rentalPrice = useMemo(() => {
    return totalDays * equipment.pricePerDay;
  }, [totalDays, equipment.pricePerDay]);

  const securityDeposit = useMemo(() => {
    return equipment.securityDeposit || Math.round(equipment.pricePerDay * 3);
  }, [equipment]);

  const deliveryFee = useMemo(() => {
    return deliveryOption === 'delivery' ? 1500 : 0;
  }, [deliveryOption]);

  const totalPrice = useMemo(() => {
    return rentalPrice + securityDeposit + deliveryFee;
  }, [rentalPrice, securityDeposit, deliveryFee]);

  const isFormValid = useMemo(() => {
    const hasValidDates = startDate && endDate && totalDays > 0;
    const hasDeliveryAddress = deliveryOption === 'pickup' || deliveryAddress.trim().length > 0;
    return hasValidDates && hasDeliveryAddress && agreedToTerms;
  }, [startDate, endDate, totalDays, deliveryOption, deliveryAddress, agreedToTerms]);

  const handleStartDateSelect = useCallback((date: string) => {
    setStartDate(date);
    setEndDate('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleEndDateSelect = useCallback((date: string) => {
    setEndDate(date);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      const rental: EquipmentRental = {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        startDate,
        endDate,
        totalDays,
        rentalPrice,
        securityDeposit,
        totalPrice,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
        status: 'pending',
      };

      addEquipmentRentalToCart({
        id: equipment.id,
        name: equipment.name,
        category: equipment.category,
        pricePerDay: equipment.pricePerDay,
        image: equipment.image,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        totalDays,
        rentalPrice,
        securityDeposit,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
        location: equipment.location,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRentalComplete?.(rental);
      onClose();
    } catch (error) {
      console.error('[EquipmentRentalModal] Error submitting rental:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, equipment, startDate, endDate, totalDays, rentalPrice, securityDeposit, totalPrice, deliveryOption, deliveryAddress, addEquipmentRentalToCart, onRentalComplete, onClose]);

  const resetForm = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setDeliveryOption('pickup');
    setDeliveryAddress('');
    setAgreedToTerms(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Rent Equipment</Text>
            <Text style={styles.headerSubtitle}>{equipment.name}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.equipmentCard}>
            <View style={styles.equipmentIcon}>
              <Truck size={24} color={COLORS.primary} />
            </View>
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentName}>{equipment.name}</Text>
              <View style={styles.equipmentMeta}>
                <MapPin size={14} color={COLORS.textLight} />
                <Text style={styles.equipmentLocation}>{equipment.location}</Text>
              </View>
              {equipment.condition && (
                <View style={styles.conditionBadge}>
                  <Text style={styles.conditionText}>{equipment.condition}</Text>
                </View>
              )}
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceValue}>KSh {equipment.pricePerDay.toLocaleString()}</Text>
              <Text style={styles.priceLabel}>per day</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStartPicker(!showStartPicker)}
            >
              <Calendar size={20} color={COLORS.primary} />
              <Text style={[styles.pickerButtonText, !startDate && styles.placeholderText]}>
                {formatDate(startDate)}
              </Text>
              {showStartPicker ? (
                <ChevronUp size={20} color={COLORS.textLight} />
              ) : (
                <ChevronDown size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
            {showStartPicker && (
              <ScrollView
                horizontal
                style={styles.optionsScroll}
                showsHorizontalScrollIndicator={false}
              >
                {availableDates.slice(0, 30).map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateOption,
                      startDate === date && styles.dateOptionSelected,
                    ]}
                    onPress={() => handleStartDateSelect(date)}
                  >
                    <Text style={[
                      styles.dateOptionDay,
                      startDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).toLocaleDateString('en-KE', { weekday: 'short' })}
                    </Text>
                    <Text style={[
                      styles.dateOptionDate,
                      startDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).getDate()}
                    </Text>
                    <Text style={[
                      styles.dateOptionMonth,
                      startDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).toLocaleDateString('en-KE', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>End Date</Text>
            <TouchableOpacity
              style={[styles.pickerButton, !startDate && styles.pickerButtonDisabled]}
              onPress={() => startDate && setShowEndPicker(!showEndPicker)}
              disabled={!startDate}
            >
              <Calendar size={20} color={startDate ? COLORS.primary : COLORS.textLight} />
              <Text style={[styles.pickerButtonText, (!endDate || !startDate) && styles.placeholderText]}>
                {startDate ? formatDate(endDate) : 'Select start date first'}
              </Text>
              {showEndPicker ? (
                <ChevronUp size={20} color={COLORS.textLight} />
              ) : (
                <ChevronDown size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
            {showEndPicker && startDate && (
              <ScrollView
                horizontal
                style={styles.optionsScroll}
                showsHorizontalScrollIndicator={false}
              >
                {endDateOptions.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateOption,
                      endDate === date && styles.dateOptionSelected,
                    ]}
                    onPress={() => handleEndDateSelect(date)}
                  >
                    <Text style={[
                      styles.dateOptionDay,
                      endDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).toLocaleDateString('en-KE', { weekday: 'short' })}
                    </Text>
                    <Text style={[
                      styles.dateOptionDate,
                      endDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).getDate()}
                    </Text>
                    <Text style={[
                      styles.dateOptionMonth,
                      endDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).toLocaleDateString('en-KE', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {totalDays > 0 && (
            <View style={styles.durationBanner}>
              <Calendar size={18} color={COLORS.primary} />
              <Text style={styles.durationText}>
                Rental Duration: <Text style={styles.durationHighlight}>{totalDays} day{totalDays > 1 ? 's' : ''}</Text>
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Option</Text>
            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryOption === 'pickup' && styles.deliveryOptionSelected,
                ]}
                onPress={() => {
                  setDeliveryOption('pickup');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.deliveryOptionIcon}>
                  <MapPin size={20} color={deliveryOption === 'pickup' ? COLORS.surface : COLORS.primary} />
                </View>
                <View style={styles.deliveryOptionContent}>
                  <Text style={[
                    styles.deliveryOptionTitle,
                    deliveryOption === 'pickup' && styles.deliveryOptionTitleSelected,
                  ]}>
                    Self Pickup
                  </Text>
                  <Text style={[
                    styles.deliveryOptionDesc,
                    deliveryOption === 'pickup' && styles.deliveryOptionDescSelected,
                  ]}>
                    Pick up from {equipment.location}
                  </Text>
                </View>
                <Text style={[
                  styles.deliveryOptionPrice,
                  deliveryOption === 'pickup' && styles.deliveryOptionPriceSelected,
                ]}>
                  Free
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryOption === 'delivery' && styles.deliveryOptionSelected,
                ]}
                onPress={() => {
                  setDeliveryOption('delivery');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.deliveryOptionIcon}>
                  <Truck size={20} color={deliveryOption === 'delivery' ? COLORS.surface : COLORS.primary} />
                </View>
                <View style={styles.deliveryOptionContent}>
                  <Text style={[
                    styles.deliveryOptionTitle,
                    deliveryOption === 'delivery' && styles.deliveryOptionTitleSelected,
                  ]}>
                    Delivery
                  </Text>
                  <Text style={[
                    styles.deliveryOptionDesc,
                    deliveryOption === 'delivery' && styles.deliveryOptionDescSelected,
                  ]}>
                    Deliver to your location
                  </Text>
                </View>
                <Text style={[
                  styles.deliveryOptionPrice,
                  deliveryOption === 'delivery' && styles.deliveryOptionPriceSelected,
                ]}>
                  KSh 1,500
                </Text>
              </TouchableOpacity>
            </View>

            {deliveryOption === 'delivery' && (
              <View style={styles.deliveryAddressContainer}>
                <View style={styles.inputWithIcon}>
                  <MapPin size={20} color={COLORS.textLight} />
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter delivery address"
                    placeholderTextColor={COLORS.textLight}
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={styles.depositWarning}>
            <Shield size={20} color={COLORS.warning} />
            <View style={styles.depositWarningContent}>
              <Text style={styles.depositWarningTitle}>Security Deposit Required</Text>
              <Text style={styles.depositWarningText}>
                A refundable security deposit of KSh {securityDeposit.toLocaleString()} is required. 
                This will be refunded upon safe return of the equipment.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => {
              setAgreedToTerms(!agreedToTerms);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Check size={14} color={COLORS.surface} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the rental terms and conditions, including responsibility for any damage during the rental period.
            </Text>
          </TouchableOpacity>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Rental Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Equipment</Text>
              <Text style={styles.summaryValue}>{equipment.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Start Date</Text>
              <Text style={styles.summaryValue}>{formatDate(startDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>End Date</Text>
              <Text style={styles.summaryValue}>{formatDate(endDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{totalDays} day{totalDays !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rental ({totalDays} days × KSh {equipment.pricePerDay.toLocaleString()})</Text>
              <Text style={styles.summaryValue}>KSh {rentalPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Security Deposit (Refundable)</Text>
              <Text style={styles.summaryValue}>KSh {securityDeposit.toLocaleString()}</Text>
            </View>
            {deliveryOption === 'delivery' && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>KSh {deliveryFee.toLocaleString()}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>KSh {totalPrice.toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>Total (incl. deposit)</Text>
            <Text style={styles.footerPriceValue}>KSh {totalPrice.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  equipmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  equipmentLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  conditionBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  pickerButtonDisabled: {
    backgroundColor: COLORS.background,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  optionsScroll: {
    marginTop: 12,
  },
  dateOption: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateOptionDay: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateOptionDate: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 4,
  },
  dateOptionMonth: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dateOptionTextSelected: {
    color: COLORS.surface,
  },
  durationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.text,
  },
  durationHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  deliveryOptions: {
    gap: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  deliveryOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  deliveryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryOptionContent: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  deliveryOptionTitleSelected: {
    color: COLORS.surface,
  },
  deliveryOptionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deliveryOptionDescSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  deliveryOptionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deliveryOptionPriceSelected: {
    color: COLORS.surface,
  },
  deliveryAddressContainer: {
    marginTop: 12,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  addressInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  depositWarning: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  depositWarningContent: {
    flex: 1,
  },
  depositWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: 4,
  },
  depositWarningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 16,
  },
  footerPrice: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
