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
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
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
} as const;

const DURATION_OPTIONS = [
  { label: '1 Hour', value: 1, unit: 'hour' as const },
  { label: '2 Hours', value: 2, unit: 'hour' as const },
  { label: '4 Hours', value: 4, unit: 'hour' as const },
  { label: 'Half Day', value: 0.5, unit: 'day' as const },
  { label: '1 Day', value: 1, unit: 'day' as const },
  { label: '2 Days', value: 2, unit: 'day' as const },
  { label: '1 Week', value: 7, unit: 'day' as const },
  { label: 'Project Based', value: 0, unit: 'project' as const },
];

const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

interface ServiceBookingModalProps {
  visible: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    category: string;
    providerName: string;
    priceFrom: number;
    location: string;
    rating?: number;
    image?: string;
    hourlyRate?: number;
    dailyRate?: number;
    projectRate?: number;
  };
  onBookingComplete?: (booking: ServiceBooking) => void;
}

export interface ServiceBooking {
  serviceId: string;
  serviceName: string;
  providerName: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  durationUnit: 'hour' | 'day' | 'project';
  jobDetails: string;
  location: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
}

export default function ServiceBookingModal({
  visible,
  onClose,
  service,
  onBookingComplete,
}: ServiceBookingModalProps) {
  const { addServiceToCart } = useCart();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<typeof DURATION_OPTIONS[0] | null>(null);
  const [jobDetails, setJobDetails] = useState<string>('');
  const [workLocation, setWorkLocation] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showDurationPicker, setShowDurationPicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

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

  const calculateTotalPrice = useCallback(() => {
    if (!selectedDuration) return service.priceFrom;
    
    const { value, unit } = selectedDuration;
    if (unit === 'hour') {
      return (service.hourlyRate || service.priceFrom) * value;
    } else if (unit === 'day') {
      return (service.dailyRate || service.priceFrom * 8) * value;
    } else {
      return service.projectRate || service.priceFrom * 10;
    }
  }, [selectedDuration, service]);

  const isFormValid = useMemo(() => {
    return selectedDate && selectedTime && selectedDuration && jobDetails.trim().length >= 10;
  }, [selectedDate, selectedTime, selectedDuration, jobDetails]);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      const booking: ServiceBooking = {
        serviceId: service.id,
        serviceName: service.name,
        providerName: service.providerName,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        duration: selectedDuration!.value,
        durationUnit: selectedDuration!.unit,
        jobDetails,
        location: workLocation || service.location,
        totalPrice: calculateTotalPrice(),
        status: 'pending',
      };

      addServiceToCart({
        id: service.id,
        name: service.name,
        category: service.category,
        providerName: service.providerName,
        price: calculateTotalPrice(),
        image: service.image,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        duration: selectedDuration!.value,
        durationUnit: selectedDuration!.unit,
        jobDetails,
        location: workLocation || service.location,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onBookingComplete?.(booking);
      onClose();
    } catch (error) {
      console.error('[ServiceBookingModal] Error submitting booking:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, service, selectedDate, selectedTime, selectedDuration, jobDetails, workLocation, calculateTotalPrice, addServiceToCart, onBookingComplete, onClose]);

  const resetForm = useCallback(() => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration(null);
    setJobDetails('');
    setWorkLocation('');
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
            <Text style={styles.headerTitle}>Book Service</Text>
            <Text style={styles.headerSubtitle}>{service.name}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.providerCard}>
            <View style={styles.providerIcon}>
              <User size={24} color={COLORS.primary} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{service.providerName}</Text>
              <View style={styles.providerMeta}>
                <MapPin size={14} color={COLORS.textLight} />
                <Text style={styles.providerLocation}>{service.location}</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.priceValue}>KSh {service.priceFrom.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar size={20} color={COLORS.primary} />
              <Text style={[styles.pickerButtonText, !selectedDate && styles.placeholderText]}>
                {formatDate(selectedDate)}
              </Text>
              {showDatePicker ? (
                <ChevronUp size={20} color={COLORS.textLight} />
              ) : (
                <ChevronDown size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
            {showDatePicker && (
              <ScrollView
                horizontal
                style={styles.optionsScroll}
                showsHorizontalScrollIndicator={false}
              >
                {availableDates.map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateOption,
                      selectedDate === date && styles.dateOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[
                      styles.dateOptionDay,
                      selectedDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).toLocaleDateString('en-KE', { weekday: 'short' })}
                    </Text>
                    <Text style={[
                      styles.dateOptionDate,
                      selectedDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).getDate()}
                    </Text>
                    <Text style={[
                      styles.dateOptionMonth,
                      selectedDate === date && styles.dateOptionTextSelected,
                    ]}>
                      {new Date(date).toLocaleDateString('en-KE', { month: 'short' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(!showTimePicker)}
            >
              <Clock size={20} color={COLORS.primary} />
              <Text style={[styles.pickerButtonText, !selectedTime && styles.placeholderText]}>
                {selectedTime || 'Select Time'}
              </Text>
              {showTimePicker ? (
                <ChevronUp size={20} color={COLORS.textLight} />
              ) : (
                <ChevronDown size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
            {showTimePicker && (
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected,
                    ]}
                    onPress={() => {
                      setSelectedTime(time);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextSelected,
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDurationPicker(!showDurationPicker)}
            >
              <Clock size={20} color={COLORS.primary} />
              <Text style={[styles.pickerButtonText, !selectedDuration && styles.placeholderText]}>
                {selectedDuration?.label || 'Select Duration'}
              </Text>
              {showDurationPicker ? (
                <ChevronUp size={20} color={COLORS.textLight} />
              ) : (
                <ChevronDown size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
            {showDurationPicker && (
              <View style={styles.durationGrid}>
                {DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.durationOption,
                      selectedDuration?.label === option.label && styles.durationOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedDuration(option);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[
                      styles.durationOptionText,
                      selectedDuration?.label === option.label && styles.durationOptionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {selectedDuration?.label === option.label && (
                      <Check size={16} color={COLORS.surface} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Details & Requirements</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the work needed, specific requirements, tools needed, etc..."
              placeholderTextColor={COLORS.textLight}
              value={jobDetails}
              onChangeText={setJobDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {jobDetails.trim().length < 10 && jobDetails.length > 0 && (
              <View style={styles.warningRow}>
                <AlertCircle size={14} color={COLORS.orange} />
                <Text style={styles.warningText}>Please provide more details (min 10 characters)</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Location (Optional)</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.locationInput}
                placeholder={service.location}
                placeholderTextColor={COLORS.textLight}
                value={workLocation}
                onChangeText={setWorkLocation}
              />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>{service.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{selectedTime || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{selectedDuration?.label || '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>KSh {calculateTotalPrice().toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>Total</Text>
            <Text style={styles.footerPriceValue}>KSh {calculateTotalPrice().toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Request Service'}
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
  providerCard: {
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
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  providerLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
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
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  timeSlot: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeSlotTextSelected: {
    color: COLORS.surface,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  durationOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  durationOptionTextSelected: {
    color: COLORS.surface,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.orange,
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
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
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
