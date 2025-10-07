import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAgriPay } from '@/providers/agripay-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WalletCreatePinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPin } = useAgriPay();
  
  const [pin, setLocalPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreatePin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      Alert.alert('Invalid PIN', 'PIN must contain only numbers');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }

    setIsCreating(true);
    try {
      console.log('[CreatePin] Creating PIN...');
      const result = await setPin(pin);
      
      console.log('[CreatePin] PIN creation result:', result);
      
      if (result.success) {
        Alert.alert(
          'PIN Created!',
          'Your wallet PIN has been created successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('[CreatePin] Navigating back to wallet');
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to create PIN');
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('[CreatePin] Error creating PIN:', error);
      Alert.alert('Error', error.message || 'Failed to create PIN. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#2D5016', '#4A7C59']}
              style={styles.iconGradient}
            >
              <Lock size={48} color="white" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Create Wallet PIN</Text>
          <Text style={styles.subtitle}>
            Set a 4-digit PIN to secure your wallet transactions
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter PIN</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={pin}
                  onChangeText={setLocalPin}
                  placeholder="Enter 4-digit PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showPin}
                  testID="pin-input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <Eye size={20} color="#666" />
                  ) : (
                    <EyeOff size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm PIN</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Re-enter PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showConfirmPin}
                  testID="confirm-pin-input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPin(!showConfirmPin)}
                >
                  {showConfirmPin ? (
                    <Eye size={20} color="#666" />
                  ) : (
                    <EyeOff size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {pin.length === 4 && confirmPin.length === 4 && pin === confirmPin && (
              <View style={styles.matchIndicator}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.matchText}>PINs match</Text>
              </View>
            )}
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Security Tips:</Text>
            <Text style={styles.securityText}>• Use a unique PIN</Text>
            <Text style={styles.securityText}>• Don't share your PIN with anyone</Text>
            <Text style={styles.securityText}>• Avoid using obvious numbers like 1234</Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreatePin}
            disabled={isCreating || pin.length !== 4 || confirmPin.length !== 4}
            testID="create-pin-button"
          >
            <LinearGradient
              colors={['#2D5016', '#4A7C59']}
              style={styles.createButtonGradient}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.createButtonText}>Create PIN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isCreating}
          >
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5016',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
  },
  eyeButton: {
    padding: 12,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  matchText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  securityInfo: {
    backgroundColor: 'rgba(45, 80, 22, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5016',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  createButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
