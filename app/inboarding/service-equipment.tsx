import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Trash2, CheckCircle, X } from 'lucide-react-native';
import { useServiceInboarding, Equipment } from '@/providers/service-inboarding-provider';
import { useState, useMemo } from 'react';

export default function ServiceEquipmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, addEquipment, removeEquipment, nextStep } = useServiceInboarding();
  
  const [showModal, setShowModal] = useState(false);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [ownershipType, setOwnershipType] = useState<'owned' | 'leased' | 'financed'>('owned');
  const [maintenanceStatus, setMaintenanceStatus] = useState<'excellent' | 'good' | 'fair' | 'needs_service'>('good');

  const progress = useMemo(() => {
    return state.equipment.length > 0 ? 70 : 60;
  }, [state.equipment]);

  const handleAddEquipment = () => {
    if (!equipmentName.trim() || !equipmentType.trim()) {
      Alert.alert('Required', 'Please fill in equipment name and type');
      return;
    }

    const newEquipment: Equipment = {
      id: `eq_${Date.now()}`,
      name: equipmentName,
      type: equipmentType,
      ownershipType,
      maintenanceStatus,
      availability: 'available',
      photos: [],
    };

    addEquipment(newEquipment);
    setEquipmentName('');
    setEquipmentType('');
    setOwnershipType('owned');
    setMaintenanceStatus('good');
    setShowModal(false);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove Equipment', 'Are you sure you want to remove this equipment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeEquipment(id) },
    ]);
  };

  const handleNext = () => {
    nextStep();
    router.push('/inboarding/service-availability' as any);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Equipment Setup?',
      'Adding equipment helps clients understand your capabilities.',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Skip for Now',
          onPress: () => {
            nextStep();
            router.push('/inboarding/service-availability' as any);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Equipment Setup', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Farm Machinery & Equipment</Text>
          <Text style={styles.subtitle}>Add your available equipment</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step 5 of 9 • {progress}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={24} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Equipment</Text>
        </TouchableOpacity>

        {state.equipment.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No equipment added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add tractors, plows, harvesters, sprayers, and other equipment
            </Text>
          </View>
        ) : (
          <View style={styles.equipmentList}>
            {state.equipment.map((equipment) => (
              <View key={equipment.id} style={styles.equipmentCard}>
                <View style={styles.equipmentHeader}>
                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName}>{equipment.name}</Text>
                    <Text style={styles.equipmentType}>{equipment.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(equipment.id)}>
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.equipmentDetails}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {equipment.ownershipType === 'owned' ? '✓ Owned' : 
                       equipment.ownershipType === 'leased' ? '📋 Leased' : '💳 Financed'}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.badgeStatus]}>
                    <Text style={styles.badgeText}>
                      {equipment.maintenanceStatus === 'excellent' ? '⭐ Excellent' :
                       equipment.maintenanceStatus === 'good' ? '✓ Good' :
                       equipment.maintenanceStatus === 'fair' ? '⚠️ Fair' : '🔧 Needs Service'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoBold}>Tip:</Text> Complete your equipment list to unlock higher-paying requests
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Equipment</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Equipment Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., John Deere Tractor"
                  value={equipmentName}
                  onChangeText={setEquipmentName}
                  placeholderTextColor="#8E8E93"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tractor, Plow, Harvester"
                  value={equipmentType}
                  onChangeText={setEquipmentType}
                  placeholderTextColor="#8E8E93"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ownership Type</Text>
                <View style={styles.optionsRow}>
                  {(['owned', 'leased', 'financed'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.optionChip, ownershipType === type && styles.optionChipSelected]}
                      onPress={() => setOwnershipType(type)}
                    >
                      <Text style={[styles.optionText, ownershipType === type && styles.optionTextSelected]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Maintenance Status</Text>
                <View style={styles.optionsColumn}>
                  {(['excellent', 'good', 'fair', 'needs_service'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[styles.optionChip, maintenanceStatus === status && styles.optionChipSelected]}
                      onPress={() => setMaintenanceStatus(status)}
                    >
                      <Text style={[styles.optionText, maintenanceStatus === status && styles.optionTextSelected]}>
                        {status === 'needs_service' ? 'Needs Service' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddEquipment}>
              <Text style={styles.modalButtonText}>Add Equipment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed' as const,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center' as const,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  equipmentList: {
    gap: 12,
  },
  equipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  equipmentHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  equipmentDetails: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  badge: {
    backgroundColor: '#007AFF15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeStatus: {
    backgroundColor: '#34C75915',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
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
    flexDirection: 'row' as const,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  button: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1C1C1E',
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  optionsRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  optionsColumn: {
    gap: 8,
  },
  optionChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center' as const,
  },
  optionChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#8E8E93',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
