import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { User, Eye, EyeOff } from 'lucide-react-native';

export default function LogisticsDriverScreen() {
  const insets = useSafeAreaInsets();
  const { updateLogisticsData, setCurrentStep } = useOnboarding();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [license, setLicense] = useState('');
  const [discoverable, setDiscoverable] = useState(false);

  const progress = useMemo(() => {
    let filled = 0;
    const totalFields = 4;
    
    if (fullName.trim()) filled++;
    if (phone.trim()) filled++;
    if (idNumber.trim()) filled++;
    if (license.trim()) filled++;
    
    return Math.round((filled / totalFields) * 60);
  }, [fullName, phone, idNumber, license]);

  const handleNext = () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert('Required', 'Please enter your ID number');
      return;
    }
    if (!license.trim()) {
      Alert.alert('Required', 'Please enter your license number');
      return;
    }

    updateLogisticsData({
      driverDetails: {
        fullName,
        phone,
        idNumber,
        license,
        selfie: '',
        discoverable,
      },
    });
    
    setCurrentStep('logistics_delivery');
    router.push('/onboarding/logistics/delivery' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <User size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Driver Details</Text>
          <Text style={styles.subtitle}>Set up your driver profile</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Quick Start • {progress}% Complete</Text>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>🎯 {60 - progress}% remaining to activate your logistics hub</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0712345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>National ID Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12345678"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Driver&apos;s License *</Text>
            <TextInput
              style={styles.input}
              placeholder="License number (e.g., BCE)"
              value={license}
              onChangeText={setLicense}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
            <Text style={styles.helperText}>Include license class (BCE, etc.)</Text>
          </View>

          <View style={styles.discoverableCard}>
            <View style={styles.discoverableHeader}>
              {discoverable ? (
                <Eye size={20} color="#10B981" />
              ) : (
                <EyeOff size={20} color="#6B7280" />
              )}
              <View style={styles.discoverableText}>
                <Text style={styles.discoverableTitle}>Discoverable by Vehicle Owners</Text>
                <Text style={styles.discoverableSubtitle}>
                  {discoverable 
                    ? 'Owners can find and invite you for deliveries'
                    : 'Only you can apply to vehicle owners'}
                </Text>
              </View>
            </View>
            <Switch
              value={discoverable}
              onValueChange={setDiscoverable}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={discoverable ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 What&apos;s Next?</Text>
            <Text style={styles.infoText}>
              After quick start, you&apos;ll complete full verification:
              {'\n'}• Selfie with National ID
              {'\n'}• Driver&apos;s license photo
              {'\n'}• Certificate of Good Conduct
              {'\n'}• Background check & QR verification
            </Text>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Trusted drivers unlock premium routes and higher-value deliveries after verification
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
    backgroundColor: '#3B82F620',
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
    backgroundColor: '#3B82F6',
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
  discoverableCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discoverableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  discoverableText: {
    flex: 1,
  },
  discoverableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  discoverableSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  banner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  bannerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
