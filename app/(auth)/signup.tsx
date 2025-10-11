import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  User,
  Check,
  Phone
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
  Linking,
  Image
} from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { authService } from '@/services/auth';
import CountrySelector from '@/components/CountrySelector';
import { countries, Country } from '@/constants/countries';
import { getAlert, getAlertStyle, mapCodeToField, ALERT_CODES, validateInput } from '@/utils/auth-alerts';

export default function SignUpScreen() {
  const { isLoading: authLoading, socialLogin, validateFullName, validateEmail, validatePhone, validatePassword, normalizePhoneNumber } = useAuth();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<{[key: string]: any}>({});
  const [globalAlert, setGlobalAlert] = useState<any>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const translations = {
    en: {
      language: 'English',
      createAccount: 'Create Account',
      subtitle: 'Create a new account to get started and enjoy seamless access to our features.',
      fullName: 'Name',
      phone: 'Phone Number',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      selectCountry: 'Select your country',
      agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
      createAccountButton: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign In here',
      orContinueWith: 'Or Continue With Account',
      facebook: 'Facebook',
      google: 'Google',
      apple: 'Apple',
      passwordMatch: 'Passwords match',
      passwordNoMatch: 'Passwords do not match',
      passwordWeak: 'Password too weak',
      passwordStrong: 'Strong password'
    },
    sw: {
      language: 'Kiswahili',
      createAccount: 'Fungua Akaunti',
      subtitle: 'Fungua akaunti mpya ili kuanza na kufurahia huduma zetu.',
      fullName: 'Jina',
      phone: 'Nambari ya Simu',
      email: 'Barua pepe',
      password: 'Nywila',
      confirmPassword: 'Thibitisha Nywila',
      selectCountry: 'Chagua nchi yako',
      agreeToTerms: 'Nakubali Masharti ya Huduma na Sera ya Faragha',
      createAccountButton: 'Fungua Akaunti',
      alreadyHaveAccount: 'Una akaunti tayari?',
      signIn: 'Ingia hapa',
      orContinueWith: 'Au Endelea na Akaunti',
      facebook: 'Facebook',
      google: 'Google',
      apple: 'Apple',
      passwordMatch: 'Nywila zinalingana',
      passwordNoMatch: 'Nywila hazilingani',
      passwordWeak: 'Nywila dhaifu',
      passwordStrong: 'Nywila imara'
    }
  };

  const t = translations[language];

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
  }, []);

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

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { strength: 'weak', color: '#E53E3E', text: t.passwordWeak };
    if (pwd.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      return { strength: 'strong', color: '#2ECC71', text: t.passwordStrong };
    }
    return { strength: 'medium', color: '#F6AD55', text: 'Medium strength' };
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordStrength = getPasswordStrength(password);



  const handleSignUp = async () => {
    clearAlerts();
    
    // Validate full name
    const nameValidation = validateInput('fullName', fullName, { lang: language });
    if (nameValidation) {
      showAlert(nameValidation, 'fullName');
      return;
    }
    
    // Validate phone number
    if (!phone.trim()) {
      const alert = getAlert(ALERT_CODES.PHONE_REQUIRED, language);
      showAlert(alert, 'phone');
      return;
    }
    
    if (!validatePhoneFormat(phone, selectedCountry.phoneCode)) {
      const customAlert = {
        code: 'PHONE_FORMAT_ERROR',
        message: getPhoneValidationMessage(selectedCountry.phoneCode),
        type: 'error'
      };
      showAlert(customAlert, 'phone');
      return;
    }
    
    // Validate email
    const emailValidation = validateInput('email', email, { lang: language });
    if (emailValidation) {
      showAlert(emailValidation, 'email');
      return;
    }
    
    // Validate password
    const passwordValidation = validateInput('password', password, { lang: language });
    if (passwordValidation) {
      showAlert(passwordValidation, 'password');
      return;
    }
    
    if (!confirmPassword.trim()) {
      const alert = getAlert(ALERT_CODES.PASS_REQUIRED, language);
      showAlert(alert, 'confirmPassword');
      return;
    }
    
    if (password !== confirmPassword) {
      const alert = getAlert(ALERT_CODES.PASS_MISMATCH, language);
      showAlert(alert, 'confirmPassword');
      return;
    }
    
    if (!agreeToTerms) {
      const alert = getAlert(ALERT_CODES.TERMS_REQUIRED, language);
      showAlert(alert);
      return;
    }

    try {
      setIsLoading(true);
      
      // Create user account directly using auth service
      const createResult = await authService.createUser({
        fullName,
        email,
        phone: normalizePhoneNumber(phone, selectedCountry.phoneCode),
        countryCode: selectedCountry.code,
        termsAccepted: true,
        providerType: 'phone'
      });
      
      if (!createResult.success) {
        const errorAlert = getAlert(ALERT_CODES.EMAIL_INVALID, language);
        showAlert(errorAlert, 'email');
        return;
      }
      
      // Show success message
      const successAlert = {
        code: 'SIGNUP_SUCCESS',
        message: language === 'en' ? '🎉 Account created successfully! Welcome to BANDA.' : '🎉 Akaunti imeundwa kikamilifu! Karibu BANDA.',
        type: 'success'
      };
      showAlert(successAlert);
      
      // Navigate to marketplace after short delay to show success message
      setTimeout(() => {
        router.replace('/(tabs)/marketplace' as any);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      const errorAlert = getAlert(ALERT_CODES.EMAIL_INVALID, language);
      showAlert(errorAlert, 'email');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSocialAuth = async (provider: string) => {
    clearAlerts();
    
    // Check if terms are agreed to first
    if (!agreeToTerms) {
      const alert = getAlert(ALERT_CODES.TERMS_REQUIRED, language);
      showAlert(alert);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`🔐 Attempting ${provider} social signup...`);
      
      const result = await authService.socialSignIn(provider.toLowerCase() as any);
      
      if (!result.success) {
        throw new Error(result.error || 'Social login failed');
      }

      if (Platform.OS !== 'web' && result.url) {
        // For mobile, open the OAuth URL
        const supported = await Linking.canOpenURL(result.url);
        if (supported) {
          await Linking.openURL(result.url);
          // The callback will be handled by deep link listener
        } else {
          throw new Error(`Cannot open ${provider} authentication`);
        }
      }
      // For web, the redirect happens automatically in socialSignIn
      
    } catch (error: any) {
      console.error(`❌ ${provider} signup error:`, error);
      
      let alertCode: string = ALERT_CODES.SOCIAL_FAILED;
      if (error?.message?.includes('database') || error?.message?.includes('Database')) {
        alertCode = ALERT_CODES.DB_NOT_CONFIGURED;
      } else if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        alertCode = ALERT_CODES.DB_CONNECTION;
      }
      
      const errorAlert = getAlert(alertCode, language, { provider });
      showAlert(errorAlert);
    } finally {
      setIsLoading(false);
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
              <Text style={styles.title}>{t.createAccount}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
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
                styles.form,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.sectionTitle}>{t.selectCountry}</Text>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
              />

              <View style={[styles.inputContainer, focusedInput === 'fullName' && styles.inputContainerFocused, alerts.fullName && styles.inputContainerError]}>
                <User size={20} color={alerts.fullName ? "#EF4444" : "#2ECC71"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.fullName}
                  placeholderTextColor="#A0AEC0"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (alerts.fullName) {
                      setAlerts(prev => ({ ...prev, fullName: null }));
                    }
                  }}
                  autoCapitalize="words"
                  testID="fullName-input"
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              {alerts.fullName && (
                <View style={styles.alertContainer}>
                  <Text style={[styles.alertText, { color: getAlertStyle(alerts.fullName.type).color }]}>
                    {getAlertStyle(alerts.fullName.type).icon} {alerts.fullName.message}
                  </Text>
                </View>
              )}
              
              <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputContainerFocused, alerts.phone && styles.inputContainerError]}>
                <Phone size={20} color={alerts.phone ? "#EF4444" : "#2ECC71"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={getPhonePlaceholder(selectedCountry.phoneCode)}
                  placeholderTextColor="#A0AEC0"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (alerts.phone) {
                      setAlerts(prev => ({ ...prev, phone: null }));
                    }
                  }}
                  keyboardType="phone-pad"
                  testID="phone-input"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
                {validatePhoneFormat(phone, selectedCountry.phoneCode) && phone.length > 0 && (
                  <Check size={20} color="#2ECC71" style={styles.validationIcon} />
                )}
              </View>
              {alerts.phone && (
                <View style={styles.alertContainer}>
                  <Text style={[styles.alertText, { color: getAlertStyle(alerts.phone.type).color }]}>
                    {getAlertStyle(alerts.phone.type).icon} {alerts.phone.message}
                  </Text>
                </View>
              )}
              
              <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused, alerts.email && styles.inputContainerError]}>
                <Mail size={20} color={alerts.email ? "#EF4444" : "#2ECC71"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.email}
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (alerts.email) {
                      setAlerts(prev => ({ ...prev, email: null }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  testID="email-input"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
                {email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
                  <Check size={20} color="#2ECC71" style={styles.validationIcon} />
                )}
              </View>
              {alerts.email && (
                <View style={styles.alertContainer}>
                  <Text style={[styles.alertText, { color: getAlertStyle(alerts.email.type).color }]}>
                    {getAlertStyle(alerts.email.type).icon} {alerts.email.message}
                  </Text>
                </View>
              )}
              
              <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputContainerFocused, alerts.password && styles.inputContainerError]}>
                <Lock size={20} color={alerts.password ? "#EF4444" : "#2ECC71"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.password}
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (alerts.password) {
                      setAlerts(prev => ({ ...prev, password: null }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  testID="password-input"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#718096" />
                  ) : (
                    <Eye size={20} color="#718096" />
                  )}
                </TouchableOpacity>
              </View>
              {alerts.password && (
                <View style={styles.alertContainer}>
                  <Text style={[styles.alertText, { color: getAlertStyle(alerts.password.type).color }]}>
                    {getAlertStyle(alerts.password.type).icon} {alerts.password.message}
                  </Text>
                </View>
              )}
              
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color }]} />
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}
              
              <View style={[styles.inputContainer, focusedInput === 'confirmPassword' && styles.inputContainerFocused, alerts.confirmPassword && styles.inputContainerError]}>
                <Lock size={20} color={alerts.confirmPassword ? "#EF4444" : "#2ECC71"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.confirmPassword}
                  placeholderTextColor="#A0AEC0"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (alerts.confirmPassword) {
                      setAlerts(prev => ({ ...prev, confirmPassword: null }));
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  testID="confirmPassword-input"
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#718096" />
                  ) : (
                    <Eye size={20} color="#718096" />
                  )}
                </TouchableOpacity>
              </View>
              {alerts.confirmPassword && (
                <View style={styles.alertContainer}>
                  <Text style={[styles.alertText, { color: getAlertStyle(alerts.confirmPassword.type).color }]}>
                    {getAlertStyle(alerts.confirmPassword.type).icon} {alerts.confirmPassword.message}
                  </Text>
                </View>
              )}
              
              {confirmPassword.length > 0 && (
                <View style={styles.passwordMatch}>
                  {passwordsMatch ? (
                    <>
                      <Check size={16} color="#2ECC71" />
                      <Text style={[styles.matchText, { color: '#2ECC71' }]}>
                        {t.passwordMatch}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.matchText, { color: '#E53E3E' }]}>❌</Text>
                      <Text style={[styles.matchText, { color: '#E53E3E' }]}>
                        {t.passwordNoMatch}
                      </Text>
                    </>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                testID="terms-checkbox"
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>{t.agreeToTerms}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signUpButton, (isLoading || authLoading) && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading || authLoading}
                testID="signup-button"
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.signUpGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.signUpButtonText}>
                    {(isLoading || authLoading) ? 'Creating Account...' : t.createAccountButton}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {t.alreadyHaveAccount}{' '}
                  <Text
                    style={styles.signInText}
                    onPress={() => router.push('/(auth)/signin')}
                    testID="signin-link"
                  >
                    {t.signIn}
                  </Text>
                </Text>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t.orContinueWith}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialAuth('Facebook')}
                  testID="facebook-auth-button"
                >
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' }}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={() => handleSocialAuth('Google')}
                  testID="google-auth-button"
                >
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialAuth('Apple')}
                  testID="apple-auth-button"
                >
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' }}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    paddingTop: 20,
    paddingBottom: 20,
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
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
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
  form: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
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
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    lineHeight: 20,
  },
  signUpButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  signInText: {
    color: '#2ECC71',
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F7FAFC',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DADCE0',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ECC71',
    marginRight: 8,
    paddingVertical: 18,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  alertContainer: {
    marginTop: -15,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
  },
  globalAlertContainer: {
    marginHorizontal: 24,
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
});