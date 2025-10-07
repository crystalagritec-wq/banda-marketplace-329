import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Truck, User } from 'lucide-react-native';

export default function LogisticsRoleScreen() {
  const insets = useSafeAreaInsets();
  const { updateLogisticsData, setCurrentStep } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'driver' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;

    updateLogisticsData({ role: selectedRole });
    
    if (selectedRole === 'owner') {
      setCurrentStep('logistics_owner');
      router.push('/onboarding/logistics/owner' as any);
    } else {
      setCurrentStep('logistics_driver');
      router.push('/onboarding/logistics/driver' as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>Choose how you want to participate in logistics</Text>
        </View>

        <View style={styles.roleCards}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'owner' && styles.roleCardSelected,
            ]}
            onPress={() => setSelectedRole('owner')}
          >
            <View style={[
              styles.roleIcon,
              selectedRole === 'owner' && styles.roleIconSelected,
            ]}>
              <Truck size={32} color={selectedRole === 'owner' ? 'white' : '#3B82F6'} />
            </View>
            <Text style={[
              styles.roleTitle,
              selectedRole === 'owner' && styles.roleTextSelected,
            ]}>Vehicle Owner</Text>
            <Text style={[
              styles.roleDescription,
              selectedRole === 'owner' && styles.roleTextSelected,
            ]}>
              Own and manage delivery vehicles. Get private delivery requests and earn from your fleet.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'driver' && styles.roleCardSelected,
            ]}
            onPress={() => setSelectedRole('driver')}
          >
            <View style={[
              styles.roleIcon,
              selectedRole === 'driver' && styles.roleIconSelected,
            ]}>
              <User size={32} color={selectedRole === 'driver' ? 'white' : '#3B82F6'} />
            </View>
            <Text style={[
              styles.roleTitle,
              selectedRole === 'driver' && styles.roleTextSelected,
            ]}>Driver</Text>
            <Text style={[
              styles.roleDescription,
              selectedRole === 'driver' && styles.roleTextSelected,
            ]}>
              Drive for vehicle owners or be searchable in the marketplace. Earn from deliveries.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            💡 You can add both roles later from your dashboard
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selectedRole && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.buttonText}>Continue →</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  roleCards: {
    gap: 16,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  roleCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIconSelected: {
    backgroundColor: '#2563EB',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  roleTextSelected: {
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
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
