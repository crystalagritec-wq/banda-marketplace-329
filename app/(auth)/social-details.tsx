import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  User,
  Phone,
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
  Alert,
  Animated
} from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import CountrySelector from '@/components/CountrySelector';
import { countries, Country } from '@/constants/countries';

export default function SocialDetailsScreen() {
  const { completeLogin, isLoading, generateUserId, validateFullName, validatePhone, normalizePhoneNumber } = useAuth();
  const params = useLocalSearchParams();
  const provider = params.provider as string;
  const email = params.email as string;
  const rememberMe = params.rememberMe === 'true';
  const mode = params.mode as string; // 'signin' or 'signup'
  const termsAccepted = params.termsAccepted === 'true';
  const existingUserId = params.existingUserId as string; // For users with missing names
  
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(termsAccepted); // Pre-check if from signup
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const translations = {
    en: {
      language: 'English',
      completeProfile: 'Complete Your Profile',
      subtitle: existingUserId
        ? 'Please complete your profile to continue. We found your account but need additional details.'
        : mode === 'signup' 
        ? 'Please provide your name and phone number to complete your account setup. Terms already accepted.'
        : 'Please provide your name and phone number to complete your account setup.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      selectCountry: 'Select your country',
      continue: 'Continue',
      signedInWith: mode === 'signup' ? 'Signing up with' : 'Signed in with',
      agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
      termsRequired: 'Please agree to the Terms of Service and Privacy Policy to continue.'
    },
    sw: {
      language: 'Kiswahili',
      completeProfile: 'Kamilisha Wasifu Wako',
      subtitle: existingUserId
        ? 'Tafadhali kamilisha wasifu wako ili kuendelea. Tumeona akaunti yako lakini tunahitaji maelezo ya ziada.'
        : mode === 'signup'
        ? 'Tafadhali toa jina lako na nambari ya simu ili kukamilisha usanidi wa akaunti yako. Masharti yamekubaliwa.'
        : 'Tafadhali toa jina lako na nambari ya simu ili kukamilisha usanidi wa akaunti yako.',
      fullName: 'Jina Kamili',
      phone: 'Nambari ya Simu',
      selectCountry: 'Chagua nchi yako',
      continue: 'Endelea',
      signedInWith: mode === 'signup' ? 'Kujisajili na' : 'Umeingia kwa',
      agreeToTerms: 'Nakubali Masharti ya Huduma na Sera ya Faragha',
      termsRequired: 'Tafadhali kubali Masharti ya Huduma na Sera ya Faragha ili kuendelea.'
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



  const handleContinue = async () => {
    // Validate full name
    const nameValidation = validateFullName(fullName);
    if (nameValidation) {
      Alert.alert('Invalid Name', nameValidation.message);
      return;
    }
    
    // Validate phone number
    const phoneValidation = validatePhone(phone, selectedCountry.phoneCode);
    if (phoneValidation) {
      Alert.alert('Invalid Phone', phoneValidation.message);
      return;
    }

    // For users coming from sign in (new social users), terms must be accepted
    // Users from signup already accepted terms, and existing users don't need to re-accept
    if (mode === 'signin' && !existingUserId && !agreeToTerms) {
      Alert.alert('Terms Required', t.termsRequired);
      return;
    }

    try {
      console.log(`✅ Completing ${provider} profile for ${mode} flow${existingUserId ? ' (updating existing user)' : ''}...`);
      
      // Create user data for social registration or update existing user
      const userData = {
        id: existingUserId || generateUserId(), // Use existing ID if updating profile
        email: email,
        name: fullName.trim(),
        role: 'buyer' as const,
        phone: normalizePhoneNumber(phone, selectedCountry.phoneCode),
        location: 'Nairobi, Kenya',
        isElite: false,
        linkedProviders: [provider.toLowerCase()],
        lastLogin: Date.now(),
        lastDevice: 'demo_device_123',
        reputationScore: 0,
        membershipTier: 'basic' as const,
        kycStatus: 'verified' as const,
        trustScore: 50
      };
      
      // Complete the login process
      await completeLogin(userData, rememberMe);
      
      // Navigate to congratulations screen
      router.push({
        pathname: '/(auth)/congratulations',
        params: {
          identifier: email,
          method: 'email'
        }
      });
    } catch (error) {
      console.error('❌ Profile completion error:', error);
      Alert.alert('Error', 'Failed to complete profile. Please try again.');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'facebook': return '📘';
      case 'google': return '🔍';
      case 'apple': return '🍎';
      default: return '🔐';
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
              <View style={styles.providerInfo}>
                <Text style={styles.providerIcon}>{getProviderIcon(provider)}</Text>
                <Text style={styles.providerText}>
                  {t.signedInWith} {provider}
                </Text>
              </View>
              <Text style={styles.title}>{t.completeProfile}</Text>
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
              <Text style={styles.sectionTitle}>{t.selectCountry}</Text>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
              />

              <View style={[styles.inputContainer, focusedInput === 'fullName' && styles.inputContainerFocused]}>
                <User size={20} color="#2ECC71" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.fullName}
                  placeholderTextColor="#A0AEC0"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  testID="fullName-input"
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              
              <View style={[styles.inputContainer, focusedInput === 'phone' && styles.inputContainerFocused]}>
                <Phone size={20} color="#2ECC71" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={selectedCountry.phoneCode === '+254' ? '0712345678' : t.phone}
                  placeholderTextColor="#A0AEC0"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  testID="phone-input"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Terms checkbox for users coming from sign in (new social users only) */}
              {mode === 'signin' && !existingUserId && (
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
              )}

              <TouchableOpacity
                style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={isLoading}
                testID="continue-button"
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.continueGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.continueButtonText}>
                    {isLoading ? 'Setting up...' : t.continue}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
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
    marginBottom: 40,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  providerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  providerText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '600',
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
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
});