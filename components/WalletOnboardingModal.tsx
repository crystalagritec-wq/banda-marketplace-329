import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  Shield,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  Smartphone,
  Copy,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useAgriPay } from '@/providers/agripay-provider';
import * as Clipboard from 'expo-clipboard';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingStep = 'welcome' | 'phone' | 'pin' | 'terms' | 'success';

interface WalletOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WalletOnboardingModal({
  visible,
  onClose,
  onSuccess,
}: WalletOnboardingModalProps) {
  const { user } = useAuth();
  const { createWallet } = useAgriPay();
  const setPinMutation = trpc.agripay.setPin.useMutation();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [phoneNumber, setPhoneNumber] = useState<string>('07');
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdWallet, setCreatedWallet] = useState<any>(null);
  const [walletDisplayId, setWalletDisplayId] = useState<string>('');

  const handleClose = async () => {
    if (currentStep === 'success') {
      await AsyncStorage.setItem('wallet_onboarding_completed', 'true');
      onSuccess?.();
    }
    setCurrentStep('welcome');
    setPin('');
    setConfirmPin('');
    setTermsAccepted(false);
    setCreatedWallet(null);
    setWalletDisplayId('');
    onClose();
  };

  const handlePhoneVerification = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone.startsWith('07') || cleanPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must start with 07 and be 10 digits');
      return;
    }
    setCurrentStep('pin');
  };

  const handlePinCreation = () => {
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

    setCurrentStep('terms');
  };

  const handleWalletCreation = async () => {
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[WalletOnboardingModal] Creating wallet...');
      const walletResult = await createWallet();

      if (!walletResult.success || !walletResult.wallet) {
        throw new Error(walletResult.message || 'Failed to create wallet');
      }

      console.log('[WalletOnboardingModal] Wallet created:', walletResult.wallet.id);
      setCreatedWallet(walletResult.wallet);

      const walletIdClean = walletResult.wallet.id.replace(/-/g, '');
      const displayId = walletIdClean.substring(0, 12).toUpperCase();
      setWalletDisplayId(displayId);

      console.log('[WalletOnboardingModal] Setting PIN...');
      await setPinMutation.mutateAsync({
        walletId: walletResult.wallet.id,
        pin: pin,
      });

      console.log('[WalletOnboardingModal] Saving wallet session...');
      await AsyncStorage.setItem('wallet_id', walletResult.wallet.id);
      await AsyncStorage.setItem('wallet_display_id', displayId);
      await AsyncStorage.setItem('wallet_created_at', new Date().toISOString());

      console.log('[WalletOnboardingModal] Wallet creation complete!');
      setCurrentStep('success');
    } catch (error: any) {
      console.error('[WalletOnboardingModal] Error:', error);
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyWalletId = async () => {
    if (walletDisplayId) {
      await Clipboard.setStringAsync(walletDisplayId);
      Alert.alert('Copied!', 'Wallet ID copied to clipboard');
    }
  };

  const renderProgressDots = () => {
    const steps = ['welcome', 'phone', 'pin', 'terms', 'success'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.progressDots}>
        {steps.map((step, index) => (
          <View
            key={step}
            style={[
              styles.dot,
              index <= currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#2D5016', '#4A7C59']}
          style={styles.iconGradient}
        >
          <Wallet size={48} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Welcome to AgriPay</Text>
      <Text style={styles.subtitle}>
        Your secure wallet for payments and settlements
      </Text>

      <View style={styles.features}>
        <View style={styles.featureRow}>
          <View style={styles.featureIconSmall}>
            <Shield size={20} color="#2D5016" />
          </View>
          <Text style={styles.featureText}>Secure Transactions</Text>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIconSmall}>
            <Lock size={20} color="#2D5016" />
          </View>
          <Text style={styles.featureText}>PIN Protection</Text>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIconSmall}>
            <CheckCircle size={20} color="#2D5016" />
          </View>
          <Text style={styles.featureText}>TradeGuard Escrow</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setCurrentStep('phone')}
      >
        <LinearGradient
          colors={['#2D5016', '#4A7C59']}
          style={styles.buttonGradient}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPhoneStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepNumber}>Step 1 of 4</Text>
      <Text style={styles.title}>Verify Your Number</Text>
      <Text style={styles.subtitle}>
        Confirm your phone number to secure your wallet
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputWrapper}>
          <Smartphone size={20} color="#F97316" />
          <TextInput
            style={styles.phoneInput}
            value={phoneNumber}
            onChangeText={(text) => {
              if (text.length === 0) {
                setPhoneNumber('07');
                setIsPhoneValid(false);
                return;
              }
              if (!text.startsWith('07')) {
                return;
              }
              const cleanPhone = text.replace(/\D/g, '');
              if (cleanPhone.length <= 10) {
                setPhoneNumber(text);
                setIsPhoneValid(cleanPhone.length === 10);
              }
            }}
            placeholder="0712345678"
            keyboardType="phone-pad"
            maxLength={10}
          />
          {isPhoneValid && <CheckCircle size={20} color="#10B981" />}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('welcome')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1 }]}
          onPress={handlePhoneVerification}
          disabled={!isPhoneValid}
        >
          <LinearGradient
            colors={isPhoneValid ? ['#2D5016', '#4A7C59'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.buttonGradient}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPinStep = () => {
    const isPinComplete = pin.length === 4;
    const isConfirmComplete = confirmPin.length === 4;
    const pinsMatch = isPinComplete && isConfirmComplete && pin === confirmPin;
    const showMismatch = isConfirmComplete && pin !== confirmPin;
    const isConfirmMode = isPinComplete && !pinsMatch;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepNumber}>Step 2 of 4</Text>
        <Text style={styles.title}>
          {!isPinComplete ? 'Create Your PIN' : isConfirmMode ? 'Confirm Your PIN' : 'PIN Created!'}
        </Text>
        <Text style={styles.subtitle}>
          {!isPinComplete
            ? 'Choose a secure 4-digit PIN to protect your wallet'
            : isConfirmMode
            ? 'Re-enter your PIN to confirm'
            : 'Your PIN has been set successfully'}
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {!isPinComplete ? 'Enter 4-Digit PIN' : 'Confirm 4-Digit PIN'}
            </Text>
            <View style={styles.pinInputWrapper}>
              {[0, 1, 2, 3].map((index) => {
                const currentPin = !isPinComplete || !isConfirmMode ? pin : confirmPin;
                const isFilled = currentPin.length > index;
                const isError = showMismatch && isConfirmMode;

                return (
                  <View
                    key={index}
                    style={[
                      styles.pinDot,
                      isFilled && styles.pinDotFilled,
                      isError && styles.pinDotError,
                      pinsMatch && styles.pinDotSuccess,
                    ]}
                  >
                    {showPin && currentPin[index] ? (
                      <Text style={styles.pinDigit}>{currentPin[index]}</Text>
                    ) : isFilled ? (
                      <View style={styles.pinDotIndicator} />
                    ) : null}
                  </View>
                );
              })}
            </View>
            <TextInput
              style={styles.hiddenInput}
              value={!isPinComplete || !isConfirmMode ? pin : confirmPin}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                if (!isPinComplete || !isConfirmMode) {
                  setPin(cleaned);
                } else {
                  setConfirmPin(cleaned);
                }
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={!showPin}
              autoFocus
            />
          </View>

          {showMismatch && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>PINs do not match. Please try again.</Text>
            </View>
          )}

          {pinsMatch && (
            <View style={styles.successBanner}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.successText}>PINs match! Ready to continue.</Text>
            </View>
          )}

          <View style={styles.pinActions}>
            <TouchableOpacity
              style={styles.showPinButton}
              onPress={() => setShowPin(!showPin)}
            >
              {showPin ? (
                <Eye size={18} color="#666" />
              ) : (
                <EyeOff size={18} color="#666" />
              )}
              <Text style={styles.showPinText}>Show PIN</Text>
            </TouchableOpacity>

            {(pin.length > 0 || confirmPin.length > 0) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  if (isConfirmMode) {
                    setConfirmPin('');
                  } else {
                    setPin('');
                    setConfirmPin('');
                  }
                }}
              >
                <X size={18} color="#EF4444" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.pinRequirements}>
          <Text style={styles.pinRequirementsTitle}>PIN Requirements:</Text>
          <Text style={styles.pinRequirementItem}>• Must be exactly 4 digits</Text>
          <Text style={styles.pinRequirementItem}>• Only numbers allowed (0-9)</Text>
          <Text style={styles.pinRequirementItem}>• Avoid obvious patterns (1234, 0000)</Text>
          <Text style={styles.pinRequirementItem}>• Never share with anyone</Text>
        </View>

        <View style={styles.securityTip}>
          <Lock size={16} color="#F97316" />
          <Text style={styles.securityTipText}>
            Security Tip: Choose a PIN that&apos;s easy to remember but hard to guess. Avoid birthdays or sequential numbers.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setPin('');
              setConfirmPin('');
              setCurrentStep('phone');
            }}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1 }]}
            onPress={handlePinCreation}
            disabled={!pinsMatch}
          >
            <LinearGradient
              colors={
                pinsMatch
                  ? ['#2D5016', '#4A7C59']
                  : ['#D1D5DB', '#9CA3AF']
              }
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTermsStep = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepNumber}>Step 3 of 4</Text>
      <Text style={styles.title}>Terms & Conditions</Text>
      <Text style={styles.subtitle}>
        Please review and accept our terms
      </Text>

      <View style={styles.termsContainer}>
        <Text style={styles.termsTitle}>AgriPay Wallet Terms & Conditions</Text>

        <Text style={styles.termsSection}>1. Account Security & PIN Protection</Text>
        <Text style={styles.termsText}>
          • You are solely responsible for maintaining the confidentiality of your 4-digit PIN
          {"\n"}• Never share your PIN with anyone, including AgriPay staff
          {"\n"}• You will be liable for all transactions made using your PIN
          {"\n"}• Report lost or compromised PINs immediately
        </Text>

        <Text style={styles.termsSection}>2. Transaction Protection & TradeGuard</Text>
        <Text style={styles.termsText}>
          • All payments are protected by our TradeGuard escrow system
          {"\n"}• Funds are held securely until delivery confirmation
          {"\n"}• Disputes must be raised within 48 hours of delivery
          {"\n"}• Resolution process takes 3-5 business days
        </Text>

        <Text style={styles.termsSection}>3. Fees & Transaction Limits</Text>
        <Text style={styles.termsText}>
          • Wallet deposits: Free for M-Pesa, 2% for cards
          {"\n"}• Withdrawals: KES 25 flat fee per transaction
          {"\n"}• Daily transaction limit: KES 150,000
          {"\n"}• Single transaction limit: KES 50,000
        </Text>

        <Text style={styles.termsSection}>4. Privacy & Data Protection</Text>
        <Text style={styles.termsText}>
          • Your data is protected with bank-level 256-bit encryption
          {"\n"}• We comply with Kenya Data Protection Act 2019
          {"\n"}• Transaction data is stored for 7 years as per CBK regulations
          {"\n"}• We never share your data without explicit consent
        </Text>

        <Text style={styles.termsSection}>5. Account Suspension & Termination</Text>
        <Text style={styles.termsText}>
          • Accounts may be suspended for suspicious activity
          {"\n"}• You may close your account anytime with zero balance
          {"\n"}• Remaining funds will be transferred to your M-Pesa
          {"\n"}• Closed accounts cannot be reopened
        </Text>

        <Text style={styles.termsSection}>6. Liability & Indemnification</Text>
        <Text style={styles.termsText}>
          • AgriPay is not liable for losses due to PIN compromise
          {"\n"}• You indemnify AgriPay against unauthorized use of your account
          {"\n"}• Maximum liability is limited to your wallet balance
          {"\n"}• Force majeure events exempt AgriPay from liability
        </Text>
      </View>

      <Pressable
        style={styles.checkboxContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
          {termsAccepted && <CheckCircle size={18} color="white" />}
        </View>
        <Text style={styles.checkboxLabel}>
          I have read and agree to all the Terms & Conditions, Privacy Policy, and understand my responsibilities regarding PIN security and transaction limits.
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('pin')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1 }]}
          onPress={handleWalletCreation}
          disabled={!termsAccepted || isProcessing}
        >
          <LinearGradient
            colors={
              termsAccepted && !isProcessing
                ? ['#2D5016', '#4A7C59']
                : ['#D1D5DB', '#9CA3AF']
            }
            style={styles.buttonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Wallet</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.successIcon}>
        <LinearGradient
          colors={['#2D5016', '#4A7C59']}
          style={styles.successIconGradient}
        >
          <CheckCircle size={48} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.successTitle}>Wallet Created! 🎉</Text>
      <Text style={styles.subtitle}>
        Your AgriPay wallet is ready to use
      </Text>

      <View style={styles.walletCard}>
        <View style={styles.walletCardHeader}>
          <Text style={styles.walletCardLabel}>YOUR 12-DIGIT WALLET ID</Text>
          <TouchableOpacity onPress={copyWalletId} style={styles.copyIconButton}>
            <Copy size={18} color="#F97316" />
          </TouchableOpacity>
        </View>
        <Text style={styles.walletId}>
          {walletDisplayId || 'GENERATING...'}
        </Text>
        <Text style={styles.walletIdHint}>
          Save this unique 12-digit ID - you&apos;ll need it to receive payments
        </Text>
        <TouchableOpacity style={styles.copyFullButton} onPress={copyWalletId}>
          <Copy size={16} color="#2D5016" />
          <Text style={styles.copyFullButtonText}>Copy Wallet ID</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.protectionBanner}>
        <Shield size={20} color="#F97316" />
        <View style={styles.protectionContent}>
          <Text style={styles.protectionTitle}>Your wallet is protected</Text>
          <Text style={styles.protectionText}>
            256-bit encryption • TradeGuard enabled
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleClose}
      >
        <LinearGradient
          colors={['#2D5016', '#4A7C59']}
          style={styles.buttonGradient}
        >
          <Text style={styles.primaryButtonText}>Continue to Wallet</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            {renderProgressDots()}
            {currentStep !== 'success' && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalBody}>
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'phone' && renderPhoneStep()}
            {currentStep === 'pin' && renderPinStep()}
            {currentStep === 'terms' && renderTermsStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#2D5016',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  stepContent: {
    gap: 16,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  features: {
    gap: 12,
    marginVertical: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D5016',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  form: {
    gap: 16,
    marginTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  pinInputWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  pinDot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotFilled: {
    borderColor: '#2D5016',
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
  },
  pinDotError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pinDotSuccess: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pinDotIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D5016',
  },
  pinDigit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  pinActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  showPinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  showPinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  successText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  securityTipText: {
    flex: 1,
    fontSize: 13,
    color: '#F97316',
    fontWeight: '500',
    lineHeight: 18,
  },
  pinRequirements: {
    backgroundColor: 'rgba(45, 80, 22, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  pinRequirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 8,
  },
  pinRequirementItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  termsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 12,
  },
  termsSection: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  successIcon: {
    alignItems: 'center',
    marginVertical: 16,
  },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5016',
    textAlign: 'center',
  },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#F97316',
    elevation: 4,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
    letterSpacing: 1.5,
  },
  copyIconButton: {
    padding: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 8,
  },
  walletId: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 12,
    letterSpacing: 4,
    textAlign: 'center',
  },
  walletIdHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  copyFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  copyFullButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
  },
  protectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginTop: 8,
  },
  protectionContent: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 2,
  },
  protectionText: {
    fontSize: 11,
    color: '#F97316',
  },
});
