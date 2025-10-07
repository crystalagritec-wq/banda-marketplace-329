import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Sprout } from 'lucide-react-native';

const FARM_TYPES = ['Crops', 'Dairy', 'Poultry', 'Mixed', 'Livestock', 'Horticulture'];

export default function FarmProfileScreen() {
  const insets = useSafeAreaInsets();
  const { updateFarmData, setCurrentStep } = useOnboarding();
  
  const [farmName, setFarmName] = useState('');
  const [gpsPin, setGpsPin] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const progress = useMemo(() => {
    const baseProgress = 0;
    const stepWeight = 25;
    let filled = 0;
    const totalFields = 3;
    
    if (farmName.trim()) filled++;
    if (gpsPin.trim()) filled++;
    if (selectedTypes.length > 0) filled++;
    
    const stepProgress = (filled / totalFields) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [farmName, gpsPin, selectedTypes]);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleNext = () => {
    if (!farmName.trim()) {
      Alert.alert('Required', 'Please enter your farm name');
      return;
    }
    if (!gpsPin.trim()) {
      Alert.alert('Required', 'Please enter GPS location');
      return;
    }
    if (selectedTypes.length === 0) {
      Alert.alert('Required', 'Please select at least one farm type');
      return;
    }

    updateFarmData({
      name: farmName,
      gpsPin,
      type: selectedTypes,
    });
    
    setCurrentStep('farm_crops');
    router.push('/onboarding/farm/crops' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sprout size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Farm Profile</Text>
          <Text style={styles.subtitle}>Set up your farm information</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Farm Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Green Valley Farm"
              value={farmName}
              onChangeText={setFarmName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GPS Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., -1.2921, 36.8219"
              value={gpsPin}
              onChangeText={setGpsPin}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>Enter coordinates or use map pin</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Farm Type * (Select all that apply)</Text>
            <View style={styles.typeGrid}>
              {FARM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    selectedTypes.includes(type) && styles.typeChipSelected,
                  ]}
                  onPress={() => toggleType(type)}
                >
                  <Text style={[
                    styles.typeChipText,
                    selectedTypes.includes(type) && styles.typeChipTextSelected,
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Complete farm profiles get better market insights and recommendations
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeChipTextSelected: {
    color: 'white',
  },
  hint: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
