import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Phone, CheckCircle, Smartphone } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function ChangePhoneScreen() {
  const router = useRouter();
  const [currentPhone, setCurrentPhone] = useState<string>('+254 712 345 678');
  const [newPhone, setNewPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const changePhoneMutation = trpc.settings.changePhone.useMutation();

  const handleSendOTP = async () => {
    const cleanPhone = newPhone.replace(/\s+/g, '');
    
    if (!cleanPhone.startsWith('07') && !cleanPhone.startsWith('+2547')) {
      Alert.alert('Invalid Phone', 'Phone number must start with 07 or +2547');
      return;
    }

    if (cleanPhone.startsWith('07') && cleanPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must be 10 digits (07XXXXXXXX)');
      return;
    }

    if (cleanPhone.startsWith('+2547') && cleanPhone.length !== 13) {
      Alert.alert('Invalid Phone', 'Phone number must be 13 digits (+2547XXXXXXXX)');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await changePhoneMutation.mutateAsync({ newPhone: cleanPhone });
      
      if (result.requiresOtp) {
        Alert.alert(
          'Verification Code Sent',
          `A 6-digit code has been sent to ${newPhone} via SMS.`
        );
        setStep('verify');
      }
    } catch (error: any) {
      console.error('Phone change error:', error);
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await changePhoneMutation.mutateAsync({
        newPhone: newPhone.replace(/\s+/g, ''),
        otp: otpCode,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Phone number updated successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpCode('');
    await handleSendOTP();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Change Phone Number',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Smartphone size={48} color="#2D5016" />
        </View>

        <Text style={styles.title}>
          {step === 'input' ? 'Change Phone Number' : 'Verify New Number'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'input'
            ? 'Enter your new phone number. We\'ll send you a verification code via SMS.'
            : `Enter the 6-digit code sent to ${newPhone}`}
        </Text>

        {step === 'input' ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={currentPhone}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={newPhone}
                  onChangeText={(text) => {
                    if (text.startsWith('07') && text.length <= 10) {
                      setNewPhone(text);
                    } else if (text.startsWith('+2547') && text.length <= 13) {
                      setNewPhone(text);
                    } else if (text.length === 0) {
                      setNewPhone(text);
                    }
                  }}
                  placeholder="07XXXXXXXX or +2547XXXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <CheckCircle size={16} color="#2563EB" />
              <Text style={styles.infoText}>
                A 6-digit verification code will be sent to your new phone number via SMS. Standard SMS rates may apply.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, isProcessing && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={isProcessing || !newPhone}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.otpContainer}>
                <TextInput
                  style={styles.otpInput}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={isProcessing}
            >
              <Text style={styles.resendText}>Didn't receive code? Resend</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isProcessing && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isProcessing || otpCode.length !== 6}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify & Update</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setStep('input');
                setOtpCode('');
              }}
            >
              <Text style={styles.secondaryButtonText}>Use Different Number</Text>
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
  otpContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 8,
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
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
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
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
