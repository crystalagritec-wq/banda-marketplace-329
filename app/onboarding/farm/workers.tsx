import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Users, Plus, X } from 'lucide-react-native';

const WORKER_ROLES = ['Farmhand', 'Supervisor', 'Tractor Operator', 'Livestock Handler', 'Irrigation Specialist'];

export default function FarmWorkersScreen() {
  const insets = useSafeAreaInsets();
  const { updateFarmData, setCurrentStep } = useOnboarding();
  
  const [workers, setWorkers] = useState<{ name: string; role: string }[]>([
    { name: '', role: '' }
  ]);

  const progress = useMemo(() => {
    const baseProgress = 50;
    const stepWeight = 25;
    const validWorkers = workers.filter(w => w.name.trim() && w.role.trim());
    
    if (validWorkers.length === 0) return baseProgress;
    
    const stepProgress = Math.min(validWorkers.length / 2, 1) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [workers]);

  const addWorker = () => {
    setWorkers([...workers, { name: '', role: '' }]);
  };

  const removeWorker = (index: number) => {
    if (workers.length > 1) {
      setWorkers(workers.filter((_, i) => i !== index));
    }
  };

  const updateWorker = (index: number, field: 'name' | 'role', value: string) => {
    const updated = [...workers];
    updated[index][field] = value;
    setWorkers(updated);
  };

  const handleNext = () => {
    const validWorkers = workers.filter(w => w.name.trim() && w.role.trim());

    updateFarmData({
      workers: validWorkers.map(w => ({
        ...w,
        tasks: [],
      })),
    });
    
    setCurrentStep('farm_analytics');
    router.push('/onboarding/farm/analytics' as any);
  };

  const handleSkip = () => {
    updateFarmData({ workers: [] });
    setCurrentStep('farm_analytics');
    router.push('/onboarding/farm/analytics' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Users size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Add Workers</Text>
          <Text style={styles.subtitle}>Manage your farm team (optional)</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          {workers.map((worker, index) => (
            <View key={index} style={styles.workerCard}>
              <View style={styles.workerHeader}>
                <Text style={styles.workerNumber}>Worker {index + 1}</Text>
                {workers.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeWorker(index)}
                  >
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., John Kamau"
                  value={worker.name}
                  onChangeText={(value) => updateWorker(index, 'name', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Farmhand, Supervisor"
                  value={worker.role}
                  onChangeText={(value) => updateWorker(index, 'role', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.roleGrid}>
                {WORKER_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.roleChip}
                    onPress={() => updateWorker(index, 'role', role)}
                  >
                    <Text style={styles.roleChipText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addWorker}>
            <Plus size={20} color="#10B981" />
            <Text style={styles.addButtonText}>Add Another Worker</Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 You can assign tasks to workers and track their progress from your farm dashboard
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
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
  workerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerNumber: {
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
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
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
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 1,
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
