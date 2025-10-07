import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { CalendarDays, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStorage } from '@/providers/storage-provider';

interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  isAvailable: boolean;
}

interface HourSlots {
  dateKey: string;
  dateLabel: string;
  slots: TimeSlot[];
}

function buildHourlySlots(): HourSlots[] {
  const out: HourSlots[] = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const startHour = currentMinute < 30 ? currentHour + 1 : currentHour + 2;
  
  for (let hour = 0; hour < 24; hour++) {
    const slotHour = (startHour + hour) % 24;
    const daysToAdd = Math.floor((startHour + hour) / 24);
    
    const slotDate = new Date(now);
    slotDate.setDate(slotDate.getDate() + daysToAdd);
    slotDate.setHours(slotHour, 0, 0, 0);
    
    const endDate = new Date(slotDate);
    endDate.setHours(slotHour + 1, 0, 0, 0);
    
    const dateKey = slotDate.toISOString().slice(0, 10);
    const isToday = daysToAdd === 0;
    const isTomorrow = daysToAdd === 1;
    
    let dayLabel = '';
    if (isToday) {
      dayLabel = 'Today';
    } else if (isTomorrow) {
      dayLabel = 'Tomorrow';
    } else {
      const weekday = slotDate.toLocaleDateString(undefined, { weekday: 'short' });
      const monthDay = slotDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dayLabel = `${weekday}, ${monthDay}`;
    }
    
    const formatTime = (date: Date) => {
      const h = date.getHours();
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour}:00 ${period}`;
    };
    
    const startTime = formatTime(slotDate);
    const endTime = formatTime(endDate);
    const label = `${startTime} - ${endTime}`;
    
    const slot: TimeSlot = {
      id: `${dateKey}-${slotHour}`,
      label: label,
      start: slotDate.toISOString(),
      end: endDate.toISOString(),
      isAvailable: true,
    };
    
    const existingDay = out.find(d => d.dateKey === dateKey);
    if (existingDay) {
      existingDay.slots.push(slot);
    } else {
      out.push({
        dateKey,
        dateLabel: dayLabel,
        slots: [slot],
      });
    }
  }
  
  return out;
}

export default function DeliverySchedulingScreen() {
  const insets = useSafeAreaInsets();
  const storage = useStorage();
  const days = useMemo(buildHourlySlots, []);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const s = await storage.getItem('delivery:selectedSlot');
        if (s) setSelectedSlot(s);
      } catch (e) {
        console.log('[DeliveryScheduling] load error', e);
      }
    };
    load();
  }, [storage]);

  const onSave = useCallback(async () => {
    if (!selectedSlot) {
      Alert.alert('⏰ Select a time', 'Please choose a delivery time slot.');
      return;
    }
    try {
      const slotData = days.flatMap(d => d.slots).find(s => s.id === selectedSlot);
      if (!slotData) {
        Alert.alert('❌ Error', 'Invalid time slot selected.');
        return;
      }

      const slotInfo = {
        id: slotData.id,
        label: slotData.label,
        start: slotData.start,
        end: slotData.end,
        savedAt: new Date().toISOString(),
      };

      await storage.setItem('delivery:selectedSlot', slotData.label);
      await storage.setItem('delivery:selectedSlotData', JSON.stringify(slotInfo));
      
      console.log('✅ Delivery slot saved:', slotInfo);
      Alert.alert('✅ Saved', `Delivery time slot saved: ${slotData.label}`);
      router.back();
    } catch (e) {
      console.error('❌ Failed to save delivery slot:', e);
      Alert.alert('❌ Error', 'Failed to save selection. Please try again.');
    }
  }, [selectedSlot, storage, days]);

  const totalSlots = days.reduce((sum, day) => sum + day.slots.length, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }] }>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#F5F5DC", "#FFFFFF"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <CalendarDays size={20} color="#1F2937" />
            <Text style={styles.headerTitle}>Delivery Scheduling</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📦 Choose Your Delivery Window</Text>
            <Text style={styles.infoText}>
              Select a 1-hour delivery window from the next 24 hours. Our delivery partners will arrive during your selected time.
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalSlots}</Text>
                <Text style={styles.statLabel}>Available Slots</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24hrs</Text>
                <Text style={styles.statLabel}>Time Range</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1hr</Text>
                <Text style={styles.statLabel}>Window</Text>
              </View>
            </View>
          </View>

          {days.map((day) => (
            <View key={day.dateKey} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{day.dateLabel}</Text>
                <Text style={styles.dayCount}>{day.slots.length} slots</Text>
              </View>
              <View style={styles.slotGrid}>
                {day.slots.map((slot) => {
                  const active = selectedSlot === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.slotCard,
                        active && styles.slotCardActive,
                        !slot.isAvailable && styles.slotCardDisabled
                      ]}
                      onPress={() => slot.isAvailable && setSelectedSlot(slot.id)}
                      disabled={!slot.isAvailable}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active, disabled: !slot.isAvailable }}
                      accessibilityLabel={`Time slot ${slot.label}`}
                      testID={`slot-${slot.id}`}
                    >
                      <Clock size={16} color={active ? '#FFFFFF' : slot.isAvailable ? '#2D5016' : '#9CA3AF'} />
                      <Text style={[
                        styles.slotText,
                        active && styles.slotTextActive,
                        !slot.isAvailable && styles.slotTextDisabled
                      ]}>
                        {slot.label}
                      </Text>
                      {active && (
                        <CheckCircle2 size={16} color="#FFFFFF" style={styles.slotCheck} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={[styles.saveButton, !selectedSlot && styles.saveDisabled]}
            onPress={onSave}
            disabled={!selectedSlot}
            accessibilityLabel="Save delivery time slot"
            testID="save-schedule"
          >
            <CheckCircle2 size={18} color="#FFFFFF" />
            <Text style={styles.saveText}>{selectedSlot ? 'Confirm Time Slot' : 'Select a time'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 6 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800' as const, color: '#1F2937' },
  content: { flex: 1, paddingHorizontal: 16 },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#1E3A8A',
  },
  daySection: { marginBottom: 24 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: { fontSize: 16, fontWeight: '700' as const, color: '#374151' },
  dayCount: { fontSize: 13, color: '#6B7280', fontWeight: '600' as const },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#2D5016',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: '47%',
    position: 'relative',
  },
  slotCardActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  slotCardDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    opacity: 0.5,
  },
  slotText: { fontSize: 13, fontWeight: '700' as const, color: '#2D5016', flex: 1 },
  slotTextActive: { color: '#FFFFFF' },
  slotTextDisabled: { color: '#9CA3AF' },
  slotCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D5016',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' as const },
  saveDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
});
