import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Sprout, Plus, X, Calendar } from 'lucide-react-native';

const CROP_TEMPLATES = ['Maize', 'Tomatoes', 'Potatoes', 'Beans', 'Cabbage', 'Kale', 'Onions', 'Carrots'];

export default function FarmCropsScreen() {
  const insets = useSafeAreaInsets();
  const { updateFarmData, setCurrentStep } = useOnboarding();
  
  const [crops, setCrops] = useState<{ name: string; plantingDate: string }[]>([
    { name: '', plantingDate: '' }
  ]);

  const progress = useMemo(() => {
    const baseProgress = 25;
    const stepWeight = 25;
    const validCrops = crops.filter(c => c.name.trim() && c.plantingDate.trim());
    
    if (validCrops.length === 0) return baseProgress;
    
    const stepProgress = Math.min(validCrops.length / 2, 1) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [crops]);

  const addCrop = () => {
    setCrops([...crops, { name: '', plantingDate: '' }]);
  };

  const removeCrop = (index: number) => {
    if (crops.length > 1) {
      setCrops(crops.filter((_, i) => i !== index));
    }
  };

  const updateCrop = (index: number, field: 'name' | 'plantingDate', value: string) => {
    const updated = [...crops];
    updated[index][field] = value;
    setCrops(updated);
  };

  const selectTemplate = (index: number, template: string) => {
    updateCrop(index, 'name', template);
  };

  const handleNext = () => {
    const validCrops = crops.filter(c => c.name.trim() && c.plantingDate.trim());
    
    if (validCrops.length === 0) {
      Alert.alert('Required', 'Please add at least one crop or livestock');
      return;
    }

    updateFarmData({
      crops: validCrops.map(c => ({
        ...c,
        tasks: generateTasks(c.name),
      })),
    });
    
    setCurrentStep('farm_workers');
    router.push('/onboarding/farm/workers' as any);
  };

  const generateTasks = (cropName: string): string[] => {
    const baseTasks = ['Watering', 'Weeding', 'Pest Control'];
    if (cropName.toLowerCase().includes('maize')) {
      return [...baseTasks, 'Fertilizing', 'Harvesting'];
    }
    if (cropName.toLowerCase().includes('tomato')) {
      return [...baseTasks, 'Pruning', 'Staking', 'Harvesting'];
    }
    return [...baseTasks, 'Monitoring', 'Harvesting'];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sprout size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Add Crops/Livestock</Text>
          <Text style={styles.subtitle}>What are you growing or raising?</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          {crops.map((crop, index) => (
            <View key={index} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropNumber}>Crop {index + 1}</Text>
                {crops.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCrop(index)}
                  >
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Crop/Livestock Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Maize, Tomatoes, Dairy Cows"
                  value={crop.name}
                  onChangeText={(value) => updateCrop(index, 'name', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.templateGrid}>
                {CROP_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template}
                    style={styles.templateChip}
                    onPress={() => selectTemplate(index, template)}
                  >
                    <Text style={styles.templateChipText}>{template}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Planting/Stocking Date *</Text>
                <View style={styles.dateInput}>
                  <Calendar size={20} color="#6B7280" />
                  <TextInput
                    style={styles.dateInputText}
                    placeholder="YYYY-MM-DD"
                    value={crop.plantingDate}
                    onChangeText={(value) => updateCrop(index, 'plantingDate', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addCrop}>
            <Plus size={20} color="#10B981" />
            <Text style={styles.addButtonText}>Add Another Crop</Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              🤖 AI will auto-generate key tasks like watering, feeding, and harvest schedules based on your crops
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
    paddingBottom: 24,
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
  cropCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
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
