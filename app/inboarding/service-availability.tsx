import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, MapPin, Zap } from 'lucide-react-native';
import { useServiceInboarding } from '@/providers/service-inboarding-provider';
import { useState, useMemo } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const KENYA_REGIONS = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
];

export default function ServiceAvailabilityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updateAvailability, nextStep } = useServiceInboarding();
  
  const [operatingHours, setOperatingHours] = useState(state.availability.operatingHours);
  const [serviceAreas, setServiceAreas] = useState<string[]>(state.availability.serviceAreas);
  const [discoverable, setDiscoverable] = useState(state.availability.discoverable);
  const [instantRequests, setInstantRequests] = useState(state.availability.instantRequests);

  const progress = useMemo(() => {
    return serviceAreas.length > 0 ? 80 : 70;
  }, [serviceAreas]);

  const toggleDay = (day: typeof DAYS[number]) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }));
  };

  const toggleServiceArea = (area: string) => {
    setServiceAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else {
        return [...prev, area];
      }
    });
  };

  const handleNext = () => {
    updateAvailability({
      operatingHours,
      serviceAreas,
      discoverable,
      instantRequests,
    });
    nextStep();
    router.push('/inboarding/service-payment' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Availability', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Availability & Discoverability</Text>
          <Text style={styles.subtitle}>Set your service availability</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step 6 of 9 • {progress}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Operating Hours</Text>
          </View>
          
          <View style={styles.daysList}>
            {DAYS.map((day, index) => (
              <View key={day} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{DAY_LABELS[index]}</Text>
                <Switch
                  value={!operatingHours[day].closed}
                  onValueChange={() => toggleDay(day)}
                  trackColor={{ false: '#E5E7EB', true: '#007AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Service Areas</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select regions you can serve</Text>
          
          <View style={styles.areasGrid}>
            {KENYA_REGIONS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[styles.areaChip, serviceAreas.includes(area) && styles.areaChipSelected]}
                onPress={() => toggleServiceArea(area)}
              >
                <Text style={[styles.areaText, serviceAreas.includes(area) && styles.areaTextSelected]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Discoverability</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Discoverable in Request Lists</Text>
              <Text style={styles.settingDescription}>
                Allow clients to find and invite you
              </Text>
            </View>
            <Switch
              value={discoverable}
              onValueChange={setDiscoverable}
              trackColor={{ false: '#E5E7EB', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Accept Instant Requests</Text>
              <Text style={styles.settingDescription}>
                Receive immediate service requests
              </Text>
            </View>
            <Switch
              value={instantRequests}
              onValueChange={setInstantRequests}
              trackColor={{ false: '#E5E7EB', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoBold}>Tip:</Text> Being discoverable increases request frequency by 40%
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600' as const,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  daysList: {
    gap: 12,
  },
  dayRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  dayLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500' as const,
  },
  areasGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  areaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  areaChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  areaText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8E8E93',
  },
  areaTextSelected: {
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  infoText: {
    fontSize: 15,
    color: '#8B6914',
    lineHeight: 22,
  },
  infoBold: {
    fontWeight: '700' as const,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
