import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSendOTP = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;

      Alert.alert(
        'Verification Email Sent',
        `A verification link has been sent to ${newEmail}. Please check your inbox and click the link to confirm your new email.`
      );
      setStep('verify');
    } catch (error: any) {
      console.error('Email change error:', error);
      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setIsProcessing(true);
    try {
      Alert.alert(
        'Success',
        'Email updated successfully! Please check your new email for confirmation.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Change Email',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={48} color="#2D5016" />
        </View>

        <Text style={styles.title}>
          {step === 'input' ? 'Change Email Address' : 'Verify New Email'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'input'
            ? 'Enter your new email address. We\'ll send you a verification link.'
            : 'Check your email for the verification link and click it to confirm.'}
        </Text>

        {step === 'input' ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={currentEmail}
                  onChangeText={setCurrentEmail}
                  placeholder="current@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="new@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <CheckCircle size={16} color="#2563EB" />
              <Text style={styles.infoText}>
                A verification link will be sent to your new email address. You must click the link to complete the change.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, isProcessing && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={isProcessing || !newEmail}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Link</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.successBox}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.successText}>
                Verification email sent to {newEmail}
              </Text>
            </View>

            <View style={styles.instructionBox}>
              <Text style={styles.instructionTitle}>Next Steps:</Text>
              <Text style={styles.instructionItem}>1. Check your email inbox</Text>
              <Text style={styles.instructionItem}>2. Click the verification link</Text>
              <Text style={styles.instructionItem}>3. Your email will be updated</Text>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep('input')}
            >
              <Text style={styles.secondaryButtonText}>Use Different Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2563EB',
    lineHeight: 18,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  instructionBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2D5016',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
