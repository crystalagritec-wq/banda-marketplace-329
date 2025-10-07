import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Tractor, Stethoscope, Fish, GraduationCap, Bug, 
  HardHat, MapPin, Shield, Truck, Wrench, Briefcase, MoreHorizontal 
} from 'lucide-react-native';
import { useServiceInboarding, ServiceCategory } from '@/providers/service-inboarding-provider';
import { useState, useMemo } from 'react';
import { SERVICE_TYPES, ServiceType } from '@/constants/service-types';

const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; icon: any; description: string }[] = [
  { id: 'agriculture', label: 'Agriculture', icon: Tractor, description: 'Farming, plowing, harvesting' },
  { id: 'veterinary', label: 'Veterinary', icon: Stethoscope, description: 'Animal health & care' },
  { id: 'fisheries', label: 'Fisheries', icon: Fish, description: 'Fish farming & aquaculture' },
  { id: 'training', label: 'Training', icon: GraduationCap, description: 'Education & workshops' },
  { id: 'pest_control', label: 'Pest Control', icon: Bug, description: 'Pest management services' },
  { id: 'construction', label: 'Construction', icon: HardHat, description: 'Building & infrastructure' },
  { id: 'survey', label: 'Survey', icon: MapPin, description: 'Land surveying & mapping' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Security services' },
  { id: 'transport', label: 'Transport', icon: Truck, description: 'Transportation services' },
  { id: 'equipment_rental', label: 'Equipment Rental', icon: Wrench, description: 'Machinery & tools rental' },
  { id: 'consultation', label: 'Consultation', icon: Briefcase, description: 'Professional consulting' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, description: 'Other specialized services' },
];

export default function ServiceTypesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setServiceTypes, nextStep } = useServiceInboarding();
  
  const [selectedTypes, setSelectedTypes] = useState<ServiceCategory[]>(state.serviceTypes);
  const [selectedSpecializations, setSelectedSpecializations] = useState<ServiceType[]>([]);

  const progress = useMemo(() => {
    return selectedTypes.length > 0 ? 30 : 20;
  }, [selectedTypes]);

  const toggleServiceType = (type: ServiceCategory) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleNext = () => {
    if (selectedTypes.length === 0) {
      return;
    }
    
    const specializations = SERVICE_TYPES.filter(st => 
      selectedTypes.some(type => st.category === type)
    );
    
    setServiceTypes(selectedTypes);
    nextStep();
    router.push('/inboarding/service-verification' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Service Types', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What Services Do You Offer?</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step 3 of 9 • {progress}%</Text>
          </View>
        </View>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedTypes.length} {selectedTypes.length === 1 ? 'service' : 'services'} selected
          </Text>
        </View>

        <View style={styles.grid}>
          {SERVICE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedTypes.includes(category.id);
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleServiceType(category.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Icon size={28} color={isSelected ? '#FFFFFF' : '#007AFF'} />
                </View>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                  {category.label}
                </Text>
                <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                  {category.description}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoBold}>Tip:</Text> Common combinations: Agriculture + Pest Control, Veterinary + Training
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, selectedTypes.length === 0 && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={selectedTypes.length === 0}
        >
          <Text style={styles.buttonText}>
            Continue → {selectedTypes.length > 0 && `(${selectedTypes.length})`}
          </Text>
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
    marginBottom: 20,
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
  selectedCount: {
    backgroundColor: '#007AFF15',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center' as const,
  },
  selectedCountText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative' as const,
  },
  cardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF15',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#FFFFFF30',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  cardDescriptionSelected: {
    color: '#FFFFFF90',
  },
  checkmark: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#007AFF',
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
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
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
