import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe
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
  Animated,
  Modal,
  Linking,
  Image
} from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { authService } from '@/services/auth';
import { getAlert, getAlertStyle, mapCodeToField, ALERT_CODES, validateInput } from '@/utils/auth-alerts';

export default function SignInScreen() {
  const { isLoading: authLoading, emailPasswordLogin, socialLogin } = useAuth();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<{[key: string]: any}>({});
  const [globalAlert, setGlobalAlert] = useState<any>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const translations = {
    en: {
      language: 'English',
      signIn: 'Log in',
      welcomeBack: 'Welcome Back',
      subtitle: 'Enter your email and password to securely access your account and manage your services.',
      email: 'Email address',
      password: 'Password',
      rememberMe: 'Remember me',

      forgotPassword: 'Forgot Password',
      login: 'Login',
      dontHaveAccount: "Don't have an account?",
      signUp: 'Sign Up here',
      orContinueWith: 'Or Continue With Account',
      facebook: 'Facebook',
      google: 'Google',
      apple: 'Apple'
    },
    sw: {
      language: 'Kiswahili',
      signIn: 'Ingia',
      welcomeBack: 'Karibu Tena',
      subtitle: 'Ingiza barua pepe na nywila yako ili kuingia kwa usalama kwenye akaunti yako.',
      email: 'Barua pepe',
      password: 'Nywila',
      rememberMe: 'Nikumbuke',

      forgotPassword: 'Umesahau Nywila',
      login: 'Ingia',
      dontHaveAccount: 'Huna akaunti?',
      signUp: 'Jisajili hapa',
      orContinueWith: 'Au Endelea na Akaunti',
      facebook: 'Facebook',
      google: 'Google',
      apple: 'Apple'
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
  }, [fadeAnim, slideAnim]);

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

  const handleSignIn = async () => {
    clearAlerts();
    
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

    try {
      setIsLoading(true);
      await emailPasswordLogin(email, password, rememberMe);
      
      // Navigate directly to marketplace after successful login
      router.replace('/(tabs)/marketplace' as any);
      
    } catch (error: any) {
      console.error('Password sign-in failed:', error);
      
      // Map error to appropriate alert code
      let alertCode: string = ALERT_CODES.PASS_INCORRECT;
      if (error?.message?.includes('email') || error?.message?.includes('Email')) {
        alertCode = ALERT_CODES.EMAIL_NOT_FOUND;
      } else if (error?.message?.includes('password') || error?.message?.includes('Password')) {
        alertCode = ALERT_CODES.PASS_INCORRECT;
      } else if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        alertCode = ALERT_CODES.DB_CONNECTION;
      } else if (error?.message?.includes('database') || error?.message?.includes('Database')) {
        alertCode = ALERT_CODES.DB_NOT_CONFIGURED;
      }
      
      const errorAlert = getAlert(alertCode, language);
      showAlert(errorAlert);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      clearAlerts();
      setIsLoading(true);
      console.log(`🔐 Attempting ${provider} social sign in...`);
      
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
      console.error(`❌ ${provider} sign in error:`, error);
      
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
              <View style={styles.headerSpacer} />
              
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
              <Text style={styles.title}>{t.signIn}</Text>
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

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  testID="remember-me-checkbox"
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>{t.rememberMe}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  testID="forgot-password-link"
                >
                  <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
                </TouchableOpacity>
              </View>
              


              <TouchableOpacity
                style={[styles.signInButton, (isLoading || authLoading) && styles.signInButtonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading || authLoading}
                testID="signin-button"
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.signInGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.signInButtonText}>
                    {(isLoading || authLoading) ? 'Signing in...' : t.login}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {t.dontHaveAccount}{' '}
                  <Text
                    style={styles.signUpText}
                    onPress={() => router.push('/(auth)/signup')}
                    testID="signup-link"
                  >
                    {t.signUp}
                  </Text>
                </Text>
              </View>

              <View style={styles.helpText}>
                <Text style={styles.helpDescription}>
                  {language === 'en' 
                    ? 'Having trouble? You can change your email or phone number during sign in if needed.'
                    : 'Una shida? Unaweza kubadilisha barua pepe au nambari ya simu wakati wa kuingia ikiwa inahitajika.'
                  }
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
                  onPress={() => handleSocialAuth('google')}
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
                  onPress={() => handleSocialAuth('apple')}
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
  headerSpacer: {
    width: 40, // Same width as back button to maintain balance
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
    marginBottom: 40,
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
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    lineHeight: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '400',
    lineHeight: 20,
    flex: 1,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
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
  signUpText: {
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
  helpText: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  helpDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
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