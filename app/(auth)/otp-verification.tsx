import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  Globe,
  MessageSquare,
  RefreshCw,
  Shield,
  CheckCircle2,
  Smartphone,
  Mail,
  Phone,
  Copy,
  Zap
} from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  Keyboard
} from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { authService } from '@/services/auth';
import { countries, getCountryByCode } from '@/constants/countries';
import useSMSAutoDetect from '@/hooks/useSMSAutoDetect';
import useClipboardDetection from '@/hooks/useClipboardDetection';
import { getAlert, getAlertStyle, mapCodeToField, ALERT_CODES, validateInput } from '@/utils/auth-alerts';

type AuthMode = 'signin' | 'signup' | 'reset';
type SignInMethod = 'phone' | 'email';
type UserRole = 'buyer' | 'vendor' | 'driver' | 'service_provider' | 'admin';
type OTPChannel = 'sms' | 'whatsapp' | 'email';

interface OTPSession {
  sessionId: string;
  channels: OTPChannel[];
  primaryChannel: OTPChannel;
  secondaryOptions: OTPChannel[];
  phone: string;
  email: string;
  maskedPhone: string;
  maskedEmail: string;
  otp: string;
  expiry: string;
  resendCount: number;
  currentChannel: OTPChannel;
}

export default function OTPVerificationScreen() {
  const { login, isLoading, createUser } = useAuth();
  const params = useLocalSearchParams<{
    identifier?: string;
    method?: SignInMethod;
    mode?: AuthMode;
    fullName?: string;
    country?: string;
    whatsapp?: string;
    authProvider?: 'google' | 'facebook';
    rememberMe?: string;
  }>();
  
  // Validate and provide defaults for missing parameters
  const identifier = params.identifier || '';
  const method = (params.method as SignInMethod) || 'email';
  const mode = (params.mode as AuthMode) || 'signin';
  const country = params.country || 'KE';
  const rememberMe = params.rememberMe === 'true';
  
  // Validate required parameters
  useEffect(() => {
    if (!identifier) {
      console.error('Missing identifier parameter');
      Alert.alert(
        'Error',
        'Missing required information. Please go back and try again.',
        [
          {
            text: 'Go Back',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(auth)/signin');
              }
            }
          }
        ]
      );
      return;
    }
  }, [identifier]);
  
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<{[key: string]: any}>({});
  const [globalAlert, setGlobalAlert] = useState<any>(null);
  const [currentChannel, setCurrentChannel] = useState<OTPChannel>(
    method === 'phone' ? 'sms' : 'email'
  );
  const [showChannelSelector, setShowChannelSelector] = useState<boolean>(false);
  const [otpSession] = useState<OTPSession>({
    sessionId: 'demo_session_123',
    channels: ['sms', 'whatsapp', 'email'],
    primaryChannel: method === 'phone' ? 'sms' : 'email',
    secondaryOptions: method === 'phone' ? ['whatsapp', 'email'] : ['sms', 'whatsapp'],
    phone: method === 'phone' ? identifier : '+254700000000',
    email: method === 'email' ? identifier : 'user@example.com',
    maskedPhone: '+2547******59',
    maskedEmail: 'u***r@example.com',
    otp: '123456',
    expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    resendCount: 0,
    currentChannel: method === 'phone' ? 'sms' : 'email'
  });
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const selectedCountry = getCountryByCode(country) || countries[0];
  
  // Auto-detection hooks
  const { detectedOTP: smsOTP, startListening, stopListening, clearDetectedOTP } = useSMSAutoDetect();
  const { detectedOTP: clipboardOTP, startMonitoring, stopMonitoring, clearDetected } = useClipboardDetection();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const translations = {
    en: {
      language: 'English',
      verifyOTP: 'Verification Code',
      enterOTP: 'We sent a verification code to:',
      verify: 'Confirm',
      resendOTP: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      didntReceive: "Didn't receive the code?",
      verifying: 'Verifying...',
      success: 'Success!',
      successMessage: 'Successfully authenticated!',
      continue: 'Continue',
      tryAnotherWay: 'Try another way:',
      sendViaSMS: 'Send via SMS',
      sendViaWhatsApp: 'Send via WhatsApp',
      sendViaEmail: 'Send via Email',
      autoDetected: 'Auto-detected',
      pasteFromClipboard: 'Paste from clipboard',
      channelSMS: 'SMS',
      channelWhatsApp: 'WhatsApp',
      channelEmail: 'Email'
    },
    sw: {
      language: 'Kiswahili',
      verifyOTP: 'Nambari ya Uthibitisho',
      enterOTP: 'Tumetuma nambari ya uthibitisho kwa:',
      verify: 'Thibitisha',
      resendOTP: 'Tuma Tena Nambari',
      resendIn: 'Tuma tena baada ya',
      seconds: 'sekunde',
      didntReceive: 'Hukupokea nambari?',
      verifying: 'Inathibitisha...',
      success: 'Imefanikiwa!',
      successMessage: 'Umefanikiwa kuthibitishwa!',
      continue: 'Endelea',
      tryAnotherWay: 'Jaribu njia nyingine:',
      sendViaSMS: 'Tuma kupitia SMS',
      sendViaWhatsApp: 'Tuma kupitia WhatsApp',
      sendViaEmail: 'Tuma kupitia Barua pepe',
      autoDetected: 'Imegunduliwa kiotomatiki',
      pasteFromClipboard: 'Bandika kutoka clipboard',
      channelSMS: 'SMS',
      channelWhatsApp: 'WhatsApp',
      channelEmail: 'Barua pepe'
    }
  };

  const t = translations[language];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
    
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    
    // Start auto-detection based on current channel
    if (currentChannel === 'sms') {
      startListening();
    } else {
      startMonitoring();
    }
    
    return () => {
      clearTimeout(timer);
      stopListening();
      stopMonitoring();
    };
  }, [fadeAnim, slideAnim, currentChannel, startListening, startMonitoring, stopListening, stopMonitoring]);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, [pulseAnim]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  const clearAlerts = () => {
    setAlerts({});
    setGlobalAlert(null);
  };

  const showAlert = (alert: any, field?: string) => {
    if (field && mapCodeToField(alert.code) === field) {
      setAlerts(prev => ({ ...prev, [field]: alert }));
    } else {
      setGlobalAlert(alert);
    }
  };

  // Auto-fill detected OTP
  useEffect(() => {
    const detectedCode = smsOTP || clipboardOTP;
    if (detectedCode && detectedCode.length === 6) {
      console.log('🎯 Auto-filling detected OTP:', detectedCode);
      const otpArray = detectedCode.split('');
      setOtp(otpArray);
      
      // Hide keyboard when auto-filling
      Keyboard.dismiss();
      
      // Clear the detected OTP
      clearDetectedOTP();
      clearDetected();
      
      // Auto-verify the detected OTP after a short delay
      setTimeout(() => {
        if (!isVerifying) {
          console.log('🚀 Auto-verifying detected OTP:', detectedCode);
          handleVerifyOTP();
        }
      }, 1500); // Increased delay for better UX
    }
  }, [smsOTP, clipboardOTP, clearDetectedOTP, clearDetected, isVerifying]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    if (!/^[0-9]*$/.test(value) || value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear any existing alerts when user starts typing
    clearAlerts();

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all 6 digits are entered
    if (value && index === 5) {
      const completeOtp = newOtp.join('');
      if (completeOtp.length === 6 && !isVerifying) {
        console.log('🚀 Auto-verifying complete OTP:', completeOtp);
        // Hide keyboard before auto-verification
        Keyboard.dismiss();
        setTimeout(() => {
          handleVerifyOTP();
        }, 1200); // Increased delay for better UX
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVirtualKeyPress = (digit: string) => {
    const currentIndex = otp.findIndex(val => val === '');
    if (currentIndex !== -1) {
      const newOtp = [...otp];
      newOtp[currentIndex] = digit;
      setOtp(newOtp);
      
      // Clear any existing alerts when user starts typing
      clearAlerts();
      
      // Auto-verify when all 6 digits are entered
      if (currentIndex === 5) {
        const completeOtp = newOtp.join('');
        if (completeOtp.length === 6 && !isVerifying) {
          console.log('🚀 Auto-verifying complete OTP:', completeOtp);
          // Hide keyboard before auto-verification
          Keyboard.dismiss();
          setTimeout(() => {
            handleVerifyOTP();
          }, 1200); // Increased delay for better UX
        }
      }
    }
  };

  const handleVirtualBackspace = () => {
    const lastFilledIndex = otp.map((val, idx) => val ? idx : -1).filter(idx => idx !== -1).pop();
    if (lastFilledIndex !== undefined) {
      const newOtp = [...otp];
      newOtp[lastFilledIndex] = '';
      setOtp(newOtp);
      
      // Clear any existing alerts when user starts editing
      clearAlerts();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    clearAlerts();
    
    // Hide keyboard when verifying
    Keyboard.dismiss();
    
    if (!identifier) {
      Alert.alert('Error', 'Missing identifier. Please go back and try again.');
      return;
    }

    // Validate OTP format
    if (!otpCode || otpCode.length !== 6) {
      const alert = getAlert(ALERT_CODES.OTP_LENGTH);
      showAlert(alert, 'otp');
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      const alert = getAlert(ALERT_CODES.OTP_INVALID);
      showAlert(alert, 'otp');
      return;
    }

    try {
      setIsVerifying(true);
      console.log('🔐 Verifying OTP:', otpCode, 'for identifier:', identifier);
      console.log('📋 Signup data:', { fullName: params.fullName, phone: params.whatsapp, country: params.country });
      
      // Use auth service to verify OTP
      const result = await authService.verifyOTP(identifier, otpCode, currentChannel);
      
      if (!result.success) {
        console.error('❌ OTP verification failed:', result.error);
        
        // Show appropriate error alert
        if (result.error?.includes('6 digits')) {
          const alert = getAlert(ALERT_CODES.OTP_LENGTH);
          showAlert(alert, 'otp');
        } else if (result.error?.includes('Invalid') || result.error?.includes('expired')) {
          const alert = getAlert(ALERT_CODES.OTP_INVALID);
          showAlert(alert, 'otp');
        } else if (result.error?.includes('network') || result.error?.includes('connection')) {
          const alert = getAlert(ALERT_CODES.DB_CONNECTION);
          showAlert(alert);
        } else {
          const alert = getAlert(ALERT_CODES.OTP_INVALID);
          showAlert(alert, 'otp');
        }
        return;
      }
      
      console.log('✅ OTP verification successful');
      
      // If this is a signup and user needs to be created
      if (mode === 'signup' && result.requiresProfile && params.fullName && params.whatsapp) {
        console.log('👤 Creating new user account with full details...');
        
        const createResult = await createUser({
          fullName: params.fullName,
          email: identifier,
          phone: params.whatsapp,
          countryCode: params.country || 'KE',
          termsAccepted: true,
          providerType: 'phone'
        });
        
        if (!createResult.success) {
          console.error('❌ User creation failed:', createResult.error);
          Alert.alert('Error', createResult.error || 'Failed to create account');
          return;
        }
        
        console.log('✅ User account created successfully');
      }
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      
      // Navigate to congratulations screen
      router.push({
        pathname: '/(auth)/congratulations',
        params: {
          identifier,
          method: currentChannel === 'sms' ? 'phone' : 'email',
          mode,
          verified: 'true'
        }
      });
      
    } catch (error: any) {
      console.error('❌ Error during OTP verification:', error);
      const alert = getAlert(ALERT_CODES.OTP_INVALID);
      showAlert(alert, 'otp');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    console.log('📤 Resending OTP via', currentChannel, 'to:', identifier);
    
    try {
      // Use Supabase to resend OTP
      const resendResult = await authService.resendOTP(
        identifier, 
        currentChannel, 
        currentChannel !== 'email' ? country : undefined
      );
      
      if (!resendResult.success) {
        Alert.alert('Error', resendResult.error || 'Failed to resend OTP');
        return;
      }
      
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
        Keyboard.dismiss(); // Keep keyboard hidden
      }, 100);
      
      // Restart appropriate detection
      if (currentChannel === 'sms') {
        stopMonitoring();
        startListening();
      } else {
        stopListening();
        startMonitoring();
      }
      
      const channelName = currentChannel === 'sms' ? 'SMS' : 
                         currentChannel === 'whatsapp' ? 'WhatsApp' : 'Email';
      
      Alert.alert(
        `📤 ${channelName} Sent`, 
        `New OTP sent via ${channelName} to ${maskedIdentifier()}`,
        [{ text: 'OK', onPress: () => {
          inputRefs.current[0]?.focus();
          Keyboard.dismiss(); // Keep keyboard hidden
        }}]
      );
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };
  
  const handleChannelSwitch = async (channel: OTPChannel) => {
    console.log('🔄 Switching to channel:', channel);
    
    try {
      // Send OTP via new channel using Supabase
      const sendResult = await authService.sendOTP(
        identifier, 
        channel, 
        channel !== 'email' ? country : undefined
      );
      
      if (!sendResult.success) {
        Alert.alert('Error', sendResult.error || `Failed to send OTP via ${channel}`);
        return;
      }
      
      setCurrentChannel(channel);
      setShowChannelSelector(false);
      setOtp(['', '', '', '', '', '']);
      
      // Hide keyboard when switching channels
      Keyboard.dismiss();
      
      // Stop current detection and start new one
      stopListening();
      stopMonitoring();
      
      if (channel === 'sms') {
        startListening();
      } else {
        startMonitoring();
      }
      
      const channelName = channel === 'sms' ? 'SMS' : 
                         channel === 'whatsapp' ? 'WhatsApp' : 'Email';
      
      Alert.alert(
        `📤 ${channelName} Sent`,
        `OTP sent via ${channelName} to ${maskedIdentifier()}`,
        [{ text: 'OK', onPress: () => {
          inputRefs.current[0]?.focus();
          Keyboard.dismiss(); // Keep keyboard hidden
        }}]
      );
    } catch (error) {
      console.error('❌ Channel switch error:', error);
      Alert.alert('Error', `Failed to send OTP via ${channel}. Please try again.`);
    }
  };

  const maskedIdentifier = () => {
    if (currentChannel === 'sms' || currentChannel === 'whatsapp') {
      return otpSession.maskedPhone;
    } else {
      return otpSession.maskedEmail;
    }
  };
  
  const getChannelIcon = (channel: OTPChannel) => {
    switch (channel) {
      case 'sms': return <Smartphone size={16} color="#2ECC71" />;
      case 'whatsapp': return <MessageSquare size={16} color="#25D366" />;
      case 'email': return <Mail size={16} color="#3B82F6" />;
    }
  };
  
  const getChannelColor = (channel: OTPChannel) => {
    switch (channel) {
      case 'sms': return '#2ECC71';
      case 'whatsapp': return '#25D366';
      case 'email': return '#3B82F6';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F9F9F9', '#FFFFFF']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                testID="back-button"
              >
                <ArrowLeft size={24} color="#2D3748" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
                <Globe size={20} color="#718096" />
                <Text style={styles.languageText}>{t.language}</Text>
              </TouchableOpacity>
            </View>

            <Animated.View 
              style={[
                styles.titleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.securityIconContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.securityIconGradient}
                >
                  <Shield size={32} color="white" />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.title}>{t.verifyOTP}</Text>
              <Text style={styles.subtitle}>{t.enterOTP}</Text>
              
              <TouchableOpacity 
                style={[
                  styles.identifierContainer,
                  { borderColor: getChannelColor(currentChannel) + '40' }
                ]}
                activeOpacity={0.7}
              >
                {getChannelIcon(currentChannel)}
                <Text style={[
                  styles.identifier,
                  { color: getChannelColor(currentChannel) }
                ]}>
                  {t[`channel${currentChannel.charAt(0).toUpperCase() + currentChannel.slice(1)}` as keyof typeof t] as string}: {maskedIdentifier()}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.demoInfo}>
                <Text style={styles.demoText}>
                  🔐 Demo OTP Codes Available
                </Text>
                <Text style={[styles.demoText, { fontSize: 12, marginTop: 4, opacity: 0.8 }]}>
                  ✅ Use: 123456, 000000, 111111, 999999, or 555555
                </Text>
                <Text style={[styles.demoText, { fontSize: 11, marginTop: 2, opacity: 0.7 }]}>
                  📱 For testing: {identifier}
                </Text>
              </View>
            </Animated.View>

            {globalAlert && (
              <Animated.View style={[
                styles.globalAlertContainer,
                { backgroundColor: getAlertStyle(globalAlert.type).backgroundColor }
              ]}>
                <Text style={[styles.globalAlertText, { color: getAlertStyle(globalAlert.type).color }]}>
                  {getAlertStyle(globalAlert.type).icon} {globalAlert.message}
                </Text>
              </Animated.View>
            )}

            <Animated.View 
              style={[
                styles.otpContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={`otp-${index}`}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput, 
                    digit && styles.otpInputFilled,
                    focusedIndex === index && styles.otpInputFocused
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => {
                    setFocusedIndex(index);
                    // Hide keyboard immediately when focusing OTP input
                    Keyboard.dismiss();
                  }}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  showSoftInputOnFocus={false}
                  editable={false}
                  secureTextEntry={digit ? true : false}
                  testID={`otp-input-${index}`}
                />
              ))}
            </Animated.View>

            {alerts.otp && (
              <Animated.View style={[
                styles.alertContainer,
                { backgroundColor: getAlertStyle(alerts.otp.type).backgroundColor }
              ]}>
                <Text style={[styles.alertText, { color: getAlertStyle(alerts.otp.type).color }]}>
                  {getAlertStyle(alerts.otp.type).icon} {alerts.otp.message}
                </Text>
              </Animated.View>
            )}

            {/* Virtual Numeric Keyboard */}
            <Animated.View
              style={[
                styles.virtualKeyboard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.keyboardRow}>
                {['1', '2', '3'].map(digit => (
                  <TouchableOpacity
                    key={digit}
                    style={styles.keyboardButton}
                    onPress={() => handleVirtualKeyPress(digit)}
                    testID={`virtual-key-${digit}`}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keyboardButtonText}>{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.keyboardRow}>
                {['4', '5', '6'].map(digit => (
                  <TouchableOpacity
                    key={digit}
                    style={styles.keyboardButton}
                    onPress={() => handleVirtualKeyPress(digit)}
                    testID={`virtual-key-${digit}`}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keyboardButtonText}>{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.keyboardRow}>
                {['7', '8', '9'].map(digit => (
                  <TouchableOpacity
                    key={digit}
                    style={styles.keyboardButton}
                    onPress={() => handleVirtualKeyPress(digit)}
                    testID={`virtual-key-${digit}`}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keyboardButtonText}>{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.keyboardRow}>
                <View style={styles.keyboardButton} />
                <TouchableOpacity
                  style={styles.keyboardButton}
                  onPress={() => handleVirtualKeyPress('0')}
                  testID="virtual-key-0"
                  activeOpacity={0.7}
                >
                  <Text style={styles.keyboardButtonText}>0</Text>
                </TouchableOpacity>
                <View style={styles.keyboardButton} />
              </View>
            </Animated.View>

            {/* Verify Button */}
            <Animated.View
              style={[
                styles.verifyButtonContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (otp.join('').length !== 6 || isVerifying) && styles.verifyButtonDisabled
                ]}
                onPress={handleVerifyOTP}
                disabled={otp.join('').length !== 6 || isVerifying}
                testID="verify-button"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={otp.join('').length === 6 && !isVerifying ? ['#2ECC71', '#27AE60'] : ['#CBD5E0', '#A0AEC0']}
                  style={styles.verifyGradient}
                >
                  {isVerifying ? (
                    <RefreshCw size={20} color="white" />
                  ) : (
                    <Shield size={20} color="white" />
                  )}
                  {isVerifying || otp.join('').length === 6 ? (
                    <Text style={[styles.verifyButtonText, { marginLeft: 8 }]}>
                      {isVerifying ? t.verifying : t.verify}
                    </Text>
                  ) : null}

                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Auto-verification status */}
            {isVerifying && (
              <Animated.View
                style={[
                  styles.verifyingContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
              >
                <Text style={styles.verifyingText}>Processing...</Text>
              </Animated.View>
            )}

            <Animated.View 
              style={[
                styles.resendContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.resendText}>{t.didntReceive}</Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResendOTP} testID="resend-button" style={styles.resendButtonContainer}>
                  <RefreshCw size={16} color={getChannelColor(currentChannel)} />
                  <Text style={[styles.resendButton, { color: getChannelColor(currentChannel) }]}>{t.resendOTP}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdown}>
                    {t.resendIn} </Text>
                  <Text style={styles.countdownNumber}>{countdown}</Text>
                  <Text style={styles.countdown}> {t.seconds}
                  </Text>
                </View>
              )}
              
              {/* Channel Switching Options */}
              <View style={styles.channelSwitchContainer}>
                <Text style={styles.channelSwitchText}>{t.tryAnotherWay}</Text>
                <View style={styles.channelOptions}>
                  {otpSession.secondaryOptions.map((channel) => (
                    <TouchableOpacity
                      key={channel}
                      style={[
                        styles.channelOption,
                        { borderColor: getChannelColor(channel) + '40' }
                      ]}
                      onPress={() => handleChannelSwitch(channel)}
                      testID={`channel-${channel}`}
                    >
                      {getChannelIcon(channel)}
                      <Text style={[
                        styles.channelOptionText,
                        { color: getChannelColor(channel) }
                      ]}>
                        {channel === 'sms' ? t.sendViaSMS :
                         channel === 'whatsapp' ? t.sendViaWhatsApp :
                         t.sendViaEmail}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Auto-detection Status */}
              {(smsOTP || clipboardOTP) && (
                <Animated.View style={styles.autoDetectionBanner}>
                  <Zap size={16} color="#F59E0B" />
                  <Text style={styles.autoDetectionText}>
                    {t.autoDetected}: {smsOTP || clipboardOTP}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const code = smsOTP || clipboardOTP;
                      if (code) {
                        const otpArray = code.split('');
                        setOtp(otpArray);
                        // Auto-verify after manual paste
                        setTimeout(() => {
                          if (!isVerifying) {
                            console.log('🚀 Auto-verifying manually pasted OTP:', code);
                            Keyboard.dismiss(); // Hide keyboard before verification
                            handleVerifyOTP();
                          }
                        }, 1000);
                      }
                    }}
                    style={styles.autoDetectionButton}
                  >
                    <Copy size={14} color="#F59E0B" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
  },
  languageText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  securityIconContainer: {
    marginBottom: 20,
  },
  securityIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  identifierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 8,
  },
  identifier: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  otpInputFilled: {
    borderColor: '#2ECC71',
    backgroundColor: '#F0FFF4',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  otpInputFocused: {
    borderColor: '#2ECC71',
    backgroundColor: '#F0FFF4',
    elevation: 6,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    transform: [{ scale: 1.05 }],
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 12,
    fontWeight: '500',
  },
  resendButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  resendButton: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '700',
    marginLeft: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  countdown: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  countdownNumber: {
    fontSize: 18,
    color: '#E53E3E',
    fontWeight: '700',
  },
  demoInfo: {
    marginTop: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  demoText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '600',
    textAlign: 'center',
  },
  virtualKeyboard: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyboardButton: {
    width: 65,
    height: 55,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keyboardButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
  },
  channelSwitchContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  channelSwitchText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    marginBottom: 12,
  },
  channelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  channelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  channelOptionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  autoDetectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  autoDetectionText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  autoDetectionButton: {
    padding: 4,
  },
  alertContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alertText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  globalAlertContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  globalAlertText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyingContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  verifyingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ECC71',
  },
  verifyButtonContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});