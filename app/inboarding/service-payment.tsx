import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet, CreditCard, Building2, CheckSquare } from 'lucide-react-native';
import { useServiceInboarding } from '@/providers/service-inboarding-provider';
import { useState, useMemo } from 'react';

export default function ServicePaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updatePayment, nextStep } = useServiceInboarding();
  
  const [paymentMethod, setPaymentMethod] = useState<'agripay' | 'mpesa' | 'bank' | null>(state.payment.method);
  const [accountDetails, setAccountDetails] = useState(state.payment.accountDetails);
  const [termsAccepted, setTermsAccepted] = useState(state.payment.termsAccepted);

  const progress = useMemo(() => {
    let base = 80;
    if (paymentMethod) base += 5;
    if (accountDetails) base += 5;
    if (termsAccepted) base += 10;
    return base;
  }, [paymentMethod, accountDetails, termsAccepted]);

  const handleNext = () => {
    if (!paymentMethod) {
      Alert.alert('Required', 'Please select a payment method');
      return;
    }
    if (!accountDetails.trim()) {
      Alert.alert('Required', 'Please enter account details');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Required', 'Please accept the terms and conditions');
      return;
    }

    updatePayment({
      method: paymentMethod,
      accountDetails,
      termsAccepted,
    });
    nextStep();
    router.push('/inboarding/service-summary' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Payment Setup', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment & Terms</Text>
          <Text style={styles.subtitle}>Set up your payment method</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step 7 of 9 • {progress}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'agripay' && styles.paymentCardSelected]}
            onPress={() => setPaymentMethod('agripay')}
          >
            <View style={styles.paymentIcon}>
              <Wallet size={28} color={paymentMethod === 'agripay' ? '#007AFF' : '#8E8E93'} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, paymentMethod === 'agripay' && styles.paymentTitleSelected]}>
                AgriPay Wallet
              </Text>
              <Text style={styles.paymentDescription}>
                Instant payouts, low fees
              </Text>
            </View>
            {paymentMethod === 'agripay' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'mpesa' && styles.paymentCardSelected]}
            onPress={() => setPaymentMethod('mpesa')}
          >
            <View style={styles.paymentIcon}>
              <CreditCard size={28} color={paymentMethod === 'mpesa' ? '#007AFF' : '#8E8E93'} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, paymentMethod === 'mpesa' && styles.paymentTitleSelected]}>
                M-Pesa
              </Text>
              <Text style={styles.paymentDescription}>
                Direct to mobile money
              </Text>
            </View>
            {paymentMethod === 'mpesa' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'bank' && styles.paymentCardSelected]}
            onPress={() => setPaymentMethod('bank')}
          >
            <View style={styles.paymentIcon}>
              <Building2 size={28} color={paymentMethod === 'bank' ? '#007AFF' : '#8E8E93'} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, paymentMethod === 'bank' && styles.paymentTitleSelected]}>
                Bank Transfer
              </Text>
              <Text style={styles.paymentDescription}>
                Direct bank deposit
              </Text>
            </View>
            {paymentMethod === 'bank' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <TextInput
            style={styles.input}
            placeholder={
              paymentMethod === 'agripay' ? 'AgriPay Account Number' :
              paymentMethod === 'mpesa' ? 'M-Pesa Phone Number' :
              paymentMethod === 'bank' ? 'Bank Account Number' :
              'Select payment method first'
            }
            value={accountDetails}
            onChangeText={setAccountDetails}
            keyboardType={paymentMethod === 'mpesa' ? 'phone-pad' : 'default'}
            placeholderTextColor="#8E8E93"
            editable={!!paymentMethod}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <CheckSquare size={20} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              I agree to Banda Service Provider Terms & Conditions
            </Text>
          </TouchableOpacity>

          <View style={styles.termsDetails}>
            <Text style={styles.termsDetailText}>• Escrow payment protection</Text>
            <Text style={styles.termsDetailText}>• Transparent fee structure</Text>
            <Text style={styles.termsDetailText}>• Dispute resolution process</Text>
            <Text style={styles.termsDetailText}>• Service quality standards</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔒 <Text style={styles.infoBold}>Secure Payments:</Text> All transactions are protected by escrow. Funds released after service confirmation.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, (!paymentMethod || !accountDetails || !termsAccepted) && styles.buttonDisabled]} 
          onPress={handleNext}
          disabled={!paymentMethod || !accountDetails || !termsAccepted}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative' as const,
  },
  paymentCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF05',
  },
  paymentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  paymentTitleSelected: {
    color: '#007AFF',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  termsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  termsText: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  termsDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  termsDetailText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  infoText: {
    fontSize: 15,
    color: '#1565C0',
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
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
