import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Smartphone,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Copy,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { useAgriPay } from '@/providers/agripay-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingStep = 'phone' | 'pin' | 'terms' | 'success' | 'dashboard';

export default function WalletOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createWallet } = useAgriPay();
  const setPinMutation = trpc.agripay.setPin.useMutation();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdWallet, setCreatedWallet] = useState<any>(null);

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'phone': return 1;
      case 'pin': return 2;
      case 'terms': return 3;
      case 'success': return 4;
      case 'dashboard': return 4;
      default: return 1;
    }
  };

  const handlePhoneVerification = () => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
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
    
    setPhoneVerified(true);
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
      Alert.alert('Terms Required', 'Please accept the terms and conditions to continue');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[WalletOnboarding] Creating wallet...');
      const walletResult = await createWallet();

      if (!walletResult.success || !walletResult.wallet) {
        throw new Error(walletResult.message || 'Failed to create wallet');
      }

      console.log('[WalletOnboarding] Wallet created:', walletResult.wallet.id);
      setCreatedWallet(walletResult.wallet);

      console.log('[WalletOnboarding] Setting PIN for wallet:', walletResult.wallet.id);
      const pinResult = await setPinMutation.mutateAsync({
        walletId: walletResult.wallet.id,
        pin: pin,
      });

      if (!pinResult.success) {
        console.warn('[WalletOnboarding] PIN creation failed, but wallet exists');
      } else {
        console.log('[WalletOnboarding] PIN set successfully');
      }

      setCurrentStep('success');
    } catch (error: any) {
      console.error('[WalletOnboarding] Error:', error);
      Alert.alert('Error', error.message || 'Failed to create wallet. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueToDashboard = async () => {
    try {
      await AsyncStorage.setItem('wallet_onboarding_completed', 'true');
      console.log('[WalletOnboarding] Onboarding marked as completed');
    } catch (error) {
      console.error('[WalletOnboarding] Failed to save onboarding status:', error);
    }
    console.log('[WalletOnboarding] Navigating to wallet screen');
    router.replace('/(tabs)/wallet' as any);
  };

  const copyWalletId = async () => {
    const idToCopy = createdWallet?.display_id || createdWallet?.id;
    if (idToCopy) {
      await Clipboard.setStringAsync(idToCopy);
      Alert.alert('Copied!', 'Wallet ID copied to clipboard');
    }
  };

  const renderProgressBar = () => {
    const totalSteps = 4;
    const currentStepNum = getStepNumber();

    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index < currentStepNum && styles.progressBarActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2D5016" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <Text style={styles.stepTitle}>Step 1 of 4</Text>
      <Text style={styles.title}>Verify Your Number</Text>
      <Text style={styles.subtitle}>
        We&apos;ll send you a verification code to confirm it&apos;s you
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputWrapper}>
          <Smartphone size={20} color="#666" />
          <TextInput
            style={styles.phoneInput}
            value={phoneNumber}
            onChangeText={(text) => {
              if (text.startsWith('07') && text.length <= 10) {
                setPhoneNumber(text);
              } else if (text.startsWith('+2547') && text.length <= 13) {
                setPhoneNumber(text);
              } else if (text.length === 0) {
                setPhoneNumber(text);
              }
            }}
            placeholder="07XXXXXXXX"
            keyboardType="phone-pad"
            editable={!phoneVerified}
            autoFocus
          />
          {phoneVerified && <CheckCircle size={20} color="#10B981" />}
        </View>
      </View>

      {phoneVerified && (
        <View style={styles.successBanner}>
          <CheckCircle size={16} color="#10B981" />
          <Text style={styles.successText}>Number verified successfully!</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handlePhoneVerification}
        disabled={!phoneNumber || phoneNumber.length < 10}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            phoneNumber && phoneNumber.length >= 10
              ? ['#2D5016', '#4A7C59']
              : ['#D1D5DB', '#9CA3AF']
          }
          style={styles.continueGradient}
        >
          <Text style={[styles.continueText, (!phoneNumber || phoneNumber.length < 10) && styles.continueTextDisabled]}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPinStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('phone')}
        >
          <ArrowLeft size={24} color="#2D5016" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <Text style={styles.stepTitle}>Step 2 of 4</Text>
      <Text style={styles.title}>Create Your PIN</Text>
      <Text style={styles.subtitle}>
        Choose a 4-digit PIN to secure your wallet transactions
      </Text>
      
      {pin.length === 0 && (
        <View style={styles.instructionBanner}>
          <Text style={styles.instructionText}>👆 Tap below to enter your PIN</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter 4-Digit PIN</Text>
          <View style={styles.pinInputWrapper}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  pin.length > index && styles.pinDotFilled,
                ]}
              >
                {showPin && pin[index] && (
                  <Text style={styles.pinDigit}>{pin[index]}</Text>
                )}
              </View>
            ))}
          </View>
          <TextInput
            style={styles.hiddenInput}
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={!showPin}
            autoFocus
          />
          <View style={styles.pinActions}>
            <TouchableOpacity
              style={styles.pinActionButton}
              onPress={() => setShowPin(!showPin)}
            >
              {showPin ? (
                <Eye size={18} color="#666" />
              ) : (
                <EyeOff size={18} color="#666" />
              )}
              <Text style={styles.pinActionText}>Show</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pinActionButton}
              onPress={() => setPin('')}
              disabled={pin.length === 0}
            >
              <Text style={[styles.pinActionText, pin.length === 0 && styles.pinActionTextDisabled]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pin.length === 4 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Your PIN</Text>
            <View style={styles.pinInputWrapper}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    confirmPin.length > index && styles.pinDotFilled,
                    pin.length === 4 && confirmPin.length === 4 && pin === confirmPin && styles.pinDotSuccess,
                    pin.length === 4 && confirmPin.length === 4 && pin !== confirmPin && styles.pinDotError,
                  ]}
                >
                  {showConfirmPin && confirmPin[index] && (
                    <Text style={styles.pinDigit}>{confirmPin[index]}</Text>
                  )}
                </View>
              ))}
            </View>
            <TextInput
              style={styles.hiddenInput}
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={!showConfirmPin}
              autoFocus
            />
            <View style={styles.pinActions}>
              <TouchableOpacity
                style={styles.pinActionButton}
                onPress={() => setShowConfirmPin(!showConfirmPin)}
              >
                {showConfirmPin ? (
                  <Eye size={18} color="#666" />
                ) : (
                  <EyeOff size={18} color="#666" />
                )}
                <Text style={styles.pinActionText}>Show</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pinActionButton}
                onPress={() => setConfirmPin('')}
                disabled={confirmPin.length === 0}
              >
                <Text style={[styles.pinActionText, confirmPin.length === 0 && styles.pinActionTextDisabled]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {pin.length === 4 && confirmPin.length > 0 && (
          <View style={[
            styles.pinMatchIndicator,
            pin === confirmPin ? styles.pinMatchSuccess : styles.pinMatchError
          ]}>
            <CheckCircle size={16} color={pin === confirmPin ? '#10B981' : '#EF4444'} />
            <Text style={[
              styles.pinMatchText,
              pin === confirmPin ? styles.pinMatchTextSuccess : styles.pinMatchTextError
            ]}>
              {pin === confirmPin ? 'PINs match! ✓' : 'PINs do not match'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.securityTip}>
        <Lock size={16} color="#92400E" />
        <View style={{ flex: 1 }}>
          <Text style={styles.securityTipTitle}>Security Tips:</Text>
          <Text style={styles.securityTipText}>• Never share your PIN with anyone</Text>
          <Text style={styles.securityTipText}>• Avoid using obvious numbers (1234, 0000)</Text>
          <Text style={styles.securityTipText}>• We&apos;ll never ask for your PIN</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handlePinCreation}
        disabled={pin.length !== 4 || confirmPin.length !== 4 || pin !== confirmPin}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            pin.length === 4 && confirmPin.length === 4 && pin === confirmPin
              ? ['#2D5016', '#4A7C59']
              : ['#D1D5DB', '#9CA3AF']
          }
          style={styles.continueGradient}
        >
          <Text style={[styles.continueText, (pin.length !== 4 || confirmPin.length !== 4 || pin !== confirmPin) && styles.continueTextDisabled]}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTermsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('pin')}
        >
          <ArrowLeft size={24} color="#2D5016" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <Text style={styles.stepTitle}>Step 3 of 4</Text>
      <Text style={styles.title}>Terms & Conditions</Text>
      <Text style={styles.subtitle}>
        Please review and accept our terms to continue
      </Text>

      <View style={styles.termsBox}>
        <ScrollView style={styles.termsScrollContainer} showsVerticalScrollIndicator={true}>
          <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>AgriPay Wallet Agreement</Text>

          <Text style={styles.termsSection}>1. Account Security</Text>
          <Text style={styles.termsText}>
            You are solely responsible for maintaining the confidentiality of your PIN
            and account credentials. Never share your PIN with anyone, including AgriPay staff.
            Any transactions made using your PIN will be considered authorized by you.
          </Text>

          <Text style={styles.termsSection}>2. Transaction Protection</Text>
          <Text style={styles.termsText}>
            All payments made through AgriPay are protected by our TradeGuard escrow
            system. Funds are held securely in escrow until delivery confirmation is provided.
            This protects both buyers and sellers in every transaction.
          </Text>

          <Text style={styles.termsSection}>3. Fees & Charges</Text>
          <Text style={styles.termsText}>
            Standard transaction fees apply: 2% for deposits, 1.5% for withdrawals, and 0.5%
            for wallet-to-wallet transfers. Fees are clearly displayed before confirming any transaction.
            No hidden charges will be applied to your account.
          </Text>

          <Text style={styles.termsSection}>4. Dispute Resolution</Text>
          <Text style={styles.termsText}>
            In case of disputes, our automated system will review the transaction evidence
            and resolve within 48 hours. You must provide proof of delivery or non-delivery
            to support your claim. Decisions are final and binding.
          </Text>

          <Text style={styles.termsSection}>5. Privacy & Data Protection</Text>
          <Text style={styles.termsText}>
            We protect your data with bank-level 256-bit encryption. Your personal information
            and transaction history are stored securely and never shared with third parties
            without your explicit consent, except as required by law.
          </Text>

          <Text style={styles.termsSection}>6. Prohibited Activities</Text>
          <Text style={styles.termsText}>
            You may not use AgriPay for illegal activities, money laundering, fraud, or any
            activities that violate Kenyan law. Violation will result in immediate account
            suspension and reporting to relevant authorities.
          </Text>

          <Text style={styles.termsSection}>7. Account Termination</Text>
          <Text style={styles.termsText}>
            You may close your account at any time by contacting support. Any remaining balance
            will be transferred to your linked M-Pesa account within 5-7 business days after
            verification. Accounts inactive for 2 years may be closed automatically.
          </Text>

          <Text style={styles.termsSection}>8. Liability Limitations</Text>
          <Text style={styles.termsText}>
            AgriPay is not liable for losses resulting from unauthorized access due to your
            failure to secure your credentials, network failures, or force majeure events.
            Our maximum liability is limited to the transaction amount in dispute.
          </Text>

          <Text style={styles.termsSection}>9. Changes to Terms</Text>
          <Text style={styles.termsText}>
            We reserve the right to modify these terms at any time. You will be notified
            of significant changes via email or in-app notification. Continued use of the
            service after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.termsSection}>10. Governing Law</Text>
          <Text style={styles.termsText}>
            These terms are governed by the laws of Kenya. Any disputes shall be resolved
            in Kenyan courts. By accepting these terms, you consent to the jurisdiction
            of Kenyan courts for any legal proceedings.
          </Text>
          </View>
        </ScrollView>
      </View>

      <Pressable
        style={styles.checkboxContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
          {termsAccepted && <CheckCircle size={20} color="white" />}
        </View>
        <Text style={styles.checkboxLabel}>
          I have read and agree to the{' '}
          <Text style={styles.checkboxLink}>Terms & Conditions</Text> and{' '}
          <Text style={styles.checkboxLink}>Privacy Policy</Text>
        </Text>
      </Pressable>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleWalletCreation}
        disabled={!termsAccepted || isProcessing}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            termsAccepted && !isProcessing
              ? ['#2D5016', '#4A7C59']
              : ['#D1D5DB', '#9CA3AF']
          }
          style={styles.continueGradient}
        >
          {isProcessing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.continueText}>Creating Wallet...</Text>
            </View>
          ) : (
            <Text style={[styles.continueText, (!termsAccepted) && styles.continueTextDisabled]}>Create My Wallet</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      {renderProgressBar()}

      <View style={styles.successIcon}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.successIconGradient}
        >
          <CheckCircle size={64} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.successTitle}>Wallet Created! 🎉</Text>
      <Text style={styles.successSubtitle}>
        Your AgriPay wallet is ready to use
      </Text>

      <View style={styles.walletCard}>
        <View style={styles.walletCardHeader}>
          <Text style={styles.walletCardLabel}>YOUR WALLET ID</Text>
          <TouchableOpacity onPress={copyWalletId} style={styles.copyIconButton}>
            <Copy size={18} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>
        </View>
        <Text style={styles.walletId}>{createdWallet?.display_id || createdWallet?.id?.substring(0, 12) || 'N/A'}</Text>
        <Text style={styles.walletIdHint}>
          Use this ID to receive payments from other users
        </Text>

        <TouchableOpacity style={styles.copyButton} onPress={copyWalletId}>
          <Copy size={16} color="white" />
          <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.walletDetails}>
        <View style={styles.walletDetailRow}>
          <Text style={styles.walletDetailLabel}>Wallet Address</Text>
          <Text style={styles.walletDetailValue}>
            {createdWallet?.id?.substring(0, 12) || 'N/A'}...
          </Text>
        </View>
        <View style={styles.walletDetailRow}>
          <Text style={styles.walletDetailLabel}>Created</Text>
          <Text style={styles.walletDetailValue}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.walletDetailRow}>
          <Text style={styles.walletDetailLabel}>Current Balance</Text>
          <Text style={styles.walletDetailValue}>KES 0</Text>
        </View>
        <View style={styles.walletDetailRow}>
          <Text style={styles.walletDetailLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>● Active</Text>
          </View>
        </View>
      </View>

      <View style={styles.protectionBanner}>
        <Shield size={20} color="#2563EB" />
        <View style={styles.protectionContent}>
          <Text style={styles.protectionTitle}>Your wallet is protected</Text>
          <Text style={styles.protectionText}>
            256-bit encryption • TradeGuard enabled • Biometric security
            available
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.dashboardButton}
        onPress={handleContinueToDashboard}
      >
        <LinearGradient
          colors={['#2D5016', '#4A7C59']}
          style={styles.dashboardGradient}
        >
          <Text style={styles.dashboardButtonText}>Continue to Dashboard</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 'phone' && renderPhoneStep()}
          {currentStep === 'pin' && renderPinStep()}
          {currentStep === 'terms' && renderTermsStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5016',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#2D5016',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
    borderColor: '#10B981',
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  pinInputWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
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
  pinDotSuccess: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pinDotError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pinDigit: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  instructionBanner: {
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
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
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  pinActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pinActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
  },
  pinActionTextDisabled: {
    color: '#D1D5DB',
  },
  pinMatchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  pinMatchSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pinMatchError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pinMatchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pinMatchTextSuccess: {
    color: '#10B981',
  },
  pinMatchTextError: {
    color: '#EF4444',
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  securityTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  securityTipText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 2,
  },
  termsBox: {
    height: 280,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  termsScrollContainer: {
    flex: 1,
    paddingRight: 4,
  },
  termsContainer: {
    padding: 16,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: 12,
  },
  termsSection: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
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
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkboxLink: {
    color: '#2D5016',
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  continueGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  continueTextDisabled: {
    opacity: 0.6,
  },
  successIcon: {
    alignItems: 'center',
    marginVertical: 32,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D5016',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  walletCard: {
    backgroundColor: '#2D5016',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyIconButton: {
    padding: 4,
  },
  walletCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  walletId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  walletIdHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  walletDetails: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  walletDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  walletDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  walletDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  protectionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  protectionContent: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  protectionText: {
    fontSize: 12,
    color: '#2563EB',
    lineHeight: 18,
  },
  dashboardButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  dashboardGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
