import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Lock, Grid3x3 } from 'lucide-react-native';
import { useAppLock } from '@/providers/app-lock-provider';
import { trpc } from '@/lib/trpc';

export default function AppLockSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ method: 'pin' | 'pattern' }>();
  const { setPin, setPattern, setLockMethod } = useAppLock();
  const updatePrefs = trpc.settings.updatePreferences.useMutation();

  const [pin, setLocalPin] = useState<string>('');
  const [confirmPin, setConfirmLocalPin] = useState<string>('');
  const [pattern, setLocalPattern] = useState<number[]>([]);
  const [confirmPattern, setConfirmLocalPattern] = useState<number[]>([]);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const handlePinSubmit = useCallback(async () => {
    if (!isConfirming) {
      if (pin.length < 4) {
        Alert.alert('Invalid PIN', 'PIN must be at least 4 digits');
        return;
      }
      setIsConfirming(true);
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      setLocalPin('');
      setConfirmLocalPin('');
      setIsConfirming(false);
      return;
    }

    try {
      await setPin(pin);
      await setLockMethod('pin');
      await updatePrefs.mutateAsync({
        category: 'security',
        preferences: {
          appLockEnabled: true,
          appLockMethod: 'pin',
          appLockPin: pin,
        },
      });

      Alert.alert('Success', 'PIN lock has been set up successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set up PIN lock');
      console.error('PIN setup error:', error);
    }
  }, [pin, confirmPin, isConfirming, setPin, setLockMethod, updatePrefs, router]);

  const handlePatternSubmit = useCallback(async () => {
    if (!isConfirming) {
      if (pattern.length < 4) {
        Alert.alert('Invalid Pattern', 'Pattern must connect at least 4 dots');
        return;
      }
      setIsConfirming(true);
      return;
    }

    if (JSON.stringify(pattern) !== JSON.stringify(confirmPattern)) {
      Alert.alert('Pattern Mismatch', 'Patterns do not match. Please try again.');
      setLocalPattern([]);
      setConfirmLocalPattern([]);
      setIsConfirming(false);
      return;
    }

    try {
      const patternString = pattern.join(',');
      await setPattern(patternString);
      await setLockMethod('pattern');
      await updatePrefs.mutateAsync({
        category: 'security',
        preferences: {
          appLockEnabled: true,
          appLockMethod: 'pattern',
          appLockPattern: patternString,
        },
      });

      Alert.alert('Success', 'Pattern lock has been set up successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to set up pattern lock');
      console.error('Pattern setup error:', error);
    }
  }, [pattern, confirmPattern, isConfirming, setPattern, setLockMethod, updatePrefs, router]);

  const handlePatternDotPress = useCallback((index: number) => {
    if (isConfirming) {
      if (!confirmPattern.includes(index)) {
        setConfirmLocalPattern([...confirmPattern, index]);
      }
    } else {
      if (!pattern.includes(index)) {
        setLocalPattern([...pattern, index]);
      }
    }
  }, [pattern, confirmPattern, isConfirming]);

  const renderPatternGrid = () => {
    const currentPattern = isConfirming ? confirmPattern : pattern;
    
    return (
      <View style={styles.patternGrid}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.patternDot,
              currentPattern.includes(index) && styles.patternDotActive,
            ]}
            onPress={() => handlePatternDotPress(index)}
          >
            {currentPattern.includes(index) && (
              <Text style={styles.patternDotNumber}>
                {currentPattern.indexOf(index) + 1}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: params.method === 'pin' ? 'Set up PIN' : 'Set up Pattern',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          {params.method === 'pin' ? (
            <Lock size={48} color="#16A34A" />
          ) : (
            <Grid3x3 size={48} color="#16A34A" />
          )}
        </View>

        <Text style={styles.title}>
          {isConfirming ? 'Confirm your ' : 'Create a '}
          {params.method === 'pin' ? 'PIN' : 'pattern'}
        </Text>

        <Text style={styles.subtitle}>
          {params.method === 'pin'
            ? isConfirming
              ? 'Re-enter your PIN to confirm'
              : 'Enter a PIN with at least 4 digits'
            : isConfirming
            ? 'Draw your pattern again to confirm'
            : 'Connect at least 4 dots to create your pattern'}
        </Text>

        {params.method === 'pin' ? (
          <View style={styles.pinContainer}>
            <TextInput
              style={styles.pinInput}
              value={isConfirming ? confirmPin : pin}
              onChangeText={isConfirming ? setConfirmLocalPin : setLocalPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              placeholder="Enter PIN"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.pinLength}>
              {isConfirming ? confirmPin.length : pin.length} digits
            </Text>
          </View>
        ) : (
          <View style={styles.patternContainer}>
            {renderPatternGrid()}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                if (isConfirming) {
                  setConfirmLocalPattern([]);
                } else {
                  setLocalPattern([]);
                }
              }}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (params.method === 'pin'
              ? isConfirming
                ? confirmPin.length < 4
                : pin.length < 4
              : isConfirming
              ? confirmPattern.length < 4
              : pattern.length < 4) && styles.submitButtonDisabled,
          ]}
          onPress={params.method === 'pin' ? handlePinSubmit : handlePatternSubmit}
          disabled={
            params.method === 'pin'
              ? isConfirming
                ? confirmPin.length < 4
                : pin.length < 4
              : isConfirming
              ? confirmPattern.length < 4
              : pattern.length < 4
          }
        >
          <Text style={styles.submitButtonText}>
            {isConfirming ? 'Confirm' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  pinContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  pinInput: {
    width: '100%',
    maxWidth: 300,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 8,
  },
  pinLength: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  patternContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  patternGrid: {
    width: 240,
    height: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  patternDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternDotActive: {
    borderColor: '#16A34A',
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  patternDotNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16A34A',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
