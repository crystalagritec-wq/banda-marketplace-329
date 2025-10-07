import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  Mail, 
  Phone, 
  ArrowLeft,
  Globe,
  MessageSquare,
  Check,
  MessageCircle,
  RefreshCw
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
  ScrollView,
  Alert,
  Animated,
  Pressable,
  Linking
} from 'react-native';
import CountrySelector from '@/components/CountrySelector';
import { countries, Country } from '@/constants/countries';

type ResetMethod = 'phone' | 'email';

export default function ForgotPasswordScreen() {
  const [resetMethod, setResetMethod] = useState<ResetMethod>('phone');
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputRef = useRef<TextInput>(null);

  const translations = {
    en: {
      language: 'English',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      subtitle: 'Enter your phone number or email to receive reset instructions',
      phone: 'Phone Number',
      email: 'Email Address',
      usePhone: 'Use Phone',
      useEmail: 'Use Email',
      sendReset: 'Send Reset Code',
      sending: 'Sending...',
      backToSignIn: 'Back to Sign In',
      otpWillBeSent: 'OTP will be sent to verify your identity',
      needHelp: 'Need help? Contact Banda support',
      callSupport: 'Call Support',
      whatsappSupport: 'WhatsApp Support',
      supportNumber: 'Contact Support',
      whatsappMessage: 'Hi, I need help resetting my password for email: ',
    },
    sw: {
      language: 'Kiswahili',
      forgotPassword: 'Umesahau Nywila',
      resetPassword: 'Weka Nywila Mpya',
      subtitle: 'Ingiza nambari ya simu au barua pepe kupokea maagizo ya kuweka nywila mpya',
      phone: 'Nambari ya Simu',
      email: 'Barua Pepe',
      usePhone: 'Tumia Simu',
      useEmail: 'Tumia Barua Pepe',
      sendReset: 'Tuma Nambari ya Kuweka Upya',
      sending: 'Inatuma...',
      backToSignIn: 'Rudi Kwenye Kuingia',
      otpWillBeSent: 'OTP itatumwa kuthibitisha utambulisho wako',
      needHelp: 'Unahitaji msaada? Wasiliana na msaada wa Banda',
      callSupport: 'Piga Simu Msaada',
      whatsappSupport: 'WhatsApp Msaada',
      supportNumber: 'Wasiliana na Msaada',
      whatsappMessage: 'Hujambo, nahitaji msaada kuweka nywila mpya kwa barua pepe: ',
    }
  };

  const t = translations[language];

  const getPhonePlaceholder = (phoneCode: string): string => {
    switch (phoneCode) {
      case '+254': // Kenya
        return '0712345678';
      case '+256': // Uganda
        return '0701234567';
      case '+255': // Tanzania
        return '0612345678';
      case '+250': // Rwanda
        return '0781234567';
      case '+251': // Ethiopia
        return '0911234567';
      case '+233': // Ghana
        return '0201234567';
      case '+234': // Nigeria
        return '08012345678';
      case '+27': // South Africa
        return '0821234567';
      default:
        return t.phone;
    }
  };

  const getPhoneValidationMessage = (phoneCode: string): string => {
    switch (phoneCode) {
      case '+254': // Kenya
        return language === 'en' ? 'Please enter number starting with 07*** (e.g., 0712345678)' : 'Tafadhali ingiza nambari inayoanza na 07*** (mfano, 0712345678)';
      case '+256': // Uganda
        return language === 'en' ? 'Please enter number starting with 07*** (e.g., 0701234567)' : 'Tafadhali ingiza nambari inayoanza na 07*** (mfano, 0701234567)';
      case '+255': // Tanzania
        return language === 'en' ? 'Please enter number starting with 06*** or 07*** (e.g., 0612345678)' : 'Tafadhali ingiza nambari inayoanza na 06*** au 07*** (mfano, 0612345678)';
      case '+250': // Rwanda
        return language === 'en' ? 'Please enter number starting with 07*** or 08*** (e.g., 0781234567)' : 'Tafadhali ingiza nambari inayoanza na 07*** au 08*** (mfano, 0781234567)';
      case '+251': // Ethiopia
        return language === 'en' ? 'Please enter number starting with 09*** (e.g., 0911234567)' : 'Tafadhali ingiza nambari inayoanza na 09*** (mfano, 0911234567)';
      case '+233': // Ghana
        return language === 'en' ? 'Please enter number starting with 02***, 03***, 05*** (e.g., 0201234567)' : 'Tafadhali ingiza nambari inayoanza na 02***, 03***, 05*** (mfano, 0201234567)';
      case '+234': // Nigeria
        return language === 'en' ? 'Please enter number starting with 070***, 080***, 081***, 090*** (e.g., 08012345678)' : 'Tafadhali ingiza nambari inayoanza na 070***, 080***, 081***, 090*** (mfano, 08012345678)';
      case '+27': // South Africa
        return language === 'en' ? 'Please enter number starting with 06***, 07***, 08*** (e.g., 0821234567)' : 'Tafadhali ingiza nambari inayoanza na 06***, 07***, 08*** (mfano, 0821234567)';
      default:
        return language === 'en' ? 'Please enter a valid phone number' : 'Tafadhali ingiza nambari sahihi ya simu';
    }
  };

  const validatePhoneFormat = (phoneNumber: string, countryCode: string): boolean => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    switch (countryCode) {
      case '+254': // Kenya
        return /^(0[71]\d{8})$/.test(cleanPhone);
      case '+256': // Uganda
        return /^(0[71]\d{8})$/.test(cleanPhone);
      case '+255': // Tanzania
        return /^(0[67]\d{8})$/.test(cleanPhone);
      case '+250': // Rwanda
        return /^(0[78]\d{8})$/.test(cleanPhone);
      case '+251': // Ethiopia
        return /^(0[9]\d{8})$/.test(cleanPhone);
      case '+233': // Ghana
        return /^(0[235]\d{8})$/.test(cleanPhone);
      case '+234': // Nigeria
        return /^(0[789]\d{9})$/.test(cleanPhone);
      case '+27': // South Africa
        return /^(0[678]\d{8})$/.test(cleanPhone);
      default:
        return cleanPhone.length >= 8 && cleanPhone.length <= 12;
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
    
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  const handleSendReset = async () => {
    const identifier = resetMethod === 'phone' ? `${selectedCountry.phoneCode}${phone}` : email;
    
    if (!identifier.trim()) {
      Alert.alert('❌ Error', `Please enter your ${resetMethod}`);
      return;
    }
    
    if (resetMethod === 'phone' && !validatePhoneFormat(phone, selectedCountry.phoneCode)) {
      Alert.alert('❌ Invalid Format', getPhoneValidationMessage(selectedCountry.phoneCode));
      return;
    }
    
    if (resetMethod === 'email' && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('❌ Invalid Format', 'Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate sending reset code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '✅ Reset Code Sent',
        `Password reset code has been sent to ${identifier}\n\nFor demo, use OTP: 123456`,
        [
          {
            text: 'Continue',
            onPress: () => {
              router.push({
                pathname: '/(auth)/otp-verification',
                params: {
                  identifier,
                  method: resetMethod,
                  mode: 'reset',
                  country: selectedCountry.code,
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallSupport = async () => {
    const phoneNumber = 'tel:+254700000000'; // Replace with actual support number
    const supported = await Linking.canOpenURL(phoneNumber);
    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      Alert.alert('Unable to Call', 'Your device cannot make phone calls.');
    }
  };

  const handleWhatsAppSupport = async () => {
    const whatsappNumber = '+254700000000'; // Replace with actual support WhatsApp
    const message = encodeURIComponent(t.whatsappMessage + (resetMethod === 'email' ? email : `${selectedCountry.phoneCode}${phone}`));
    const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${message}`;
    
    const supported = await Linking.canOpenURL(whatsappUrl);
    if (supported) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to web WhatsApp
      const webWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      await Linking.openURL(webWhatsappUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F9F9F9', '#FFFFFF']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
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
              <Text style={styles.lockEmoji}>🔐</Text>
              <Text style={styles.title}>{t.forgotPassword}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.form,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.methodToggle}>
                <TouchableOpacity
                  style={[styles.methodButton, resetMethod === 'phone' && styles.methodButtonActive]}
                  onPress={() => setResetMethod('phone')}
                  testID="phone-method"
                >
                  <Phone size={18} color={resetMethod === 'phone' ? '#2ECC71' : '#718096'} />
                  <Text style={[styles.methodButtonText, resetMethod === 'phone' && styles.methodButtonTextActive]}>
                    {t.usePhone}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodButton, resetMethod === 'email' && styles.methodButtonActive]}
                  onPress={() => setResetMethod('email')}
                  testID="email-method"
                >
                  <Mail size={18} color={resetMethod === 'email' ? '#2ECC71' : '#718096'} />
                  <Text style={[styles.methodButtonText, resetMethod === 'email' && styles.methodButtonTextActive]}>
                    {t.useEmail}
                  </Text>
                </TouchableOpacity>
              </View>

              {resetMethod === 'phone' && (
                <>
                  <CountrySelector
                    selectedCountry={selectedCountry}
                    onCountrySelect={setSelectedCountry}
                  />
                  
                  <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputContainerFocused]}>
                    <Phone size={20} color="#2ECC71" style={styles.inputIcon} />
                    <TextInput
                      ref={inputRef}
                      style={styles.input}
                      placeholder={getPhonePlaceholder(selectedCountry.phoneCode)}
                      placeholderTextColor="#A0AEC0"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      testID="phone-input"
                      autoFocus={true}
                      onFocus={() => setFocusedInput('phone')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {validatePhoneFormat(phone, selectedCountry.phoneCode) && (
                      <Check size={20} color="#2ECC71" style={styles.validationIcon} />
                    )}
                  </View>
                </>
              )}

              {resetMethod === 'email' && (
                <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
                  <Mail size={20} color="#2ECC71" style={styles.inputIcon} />
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={t.email}
                    placeholderTextColor="#A0AEC0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    testID="email-input"
                    autoFocus={true}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
                    <Check size={20} color="#2ECC71" style={styles.validationIcon} />
                  )}
                </View>
              )}

              <Text style={styles.otpInfo}>
                <MessageSquare size={14} color="#718096" /> {t.otpWillBeSent}
              </Text>

              <Pressable
                style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                onPress={handleSendReset}
                disabled={isLoading}
                testID="reset-button"
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.resetGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.resetButtonText}>
                    {isLoading ? '📤 ' + t.sending : '🔐 ' + t.sendReset}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.supportSection}>
                <Text style={styles.supportTitle}>{t.needHelp}</Text>
                
                <View style={styles.supportButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={handleCallSupport}
                    testID="call-support"
                  >
                    <Phone size={18} color="#2ECC71" />
                    <Text style={styles.callButtonText}>{t.callSupport}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={handleWhatsAppSupport}
                    testID="whatsapp-support"
                  >
                    <MessageCircle size={18} color="#25D366" />
                    <Text style={styles.whatsappButtonText}>{t.whatsappSupport}</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.supportNumber}>Available 24/7</Text>
              </View>
            </Animated.View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backToSignInText}>
                  ← {t.backToSignIn}
                </Text>
              </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
    minHeight: 50,
  },
  backButton: {
    padding: 8,
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
    marginBottom: 24,
    marginTop: 10,
  },
  lockEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  form: {
    flex: 1,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  methodButtonTextActive: {
    color: '#2ECC71',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#2ECC71',
    backgroundColor: '#F0FFF4',
    elevation: 6,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    transform: [{ scale: 1.02 }],
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 18,
    color: '#1A202C',
    fontWeight: '500',
    outlineStyle: 'none',
  },
  validationIcon: {
    marginLeft: 8,
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ECC71',
    marginRight: 8,
    paddingVertical: 18,
  },
  otpInfo: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
    fontWeight: '500',
  },
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  supportSection: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    gap: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    gap: 8,
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#25D366',
  },
  supportNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ECC71',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  backToSignInText: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '600',
  },
});