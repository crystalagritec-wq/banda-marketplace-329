import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  User,
  Phone,
  Globe,
  Check
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

export default function CompleteProfileScreen() {
  const { updateProfile, isLoading, user, validateFullName, validatePhone, normalizePhoneNumber } = useAuth();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const translations = {
    en: {
      language: 'English',
      completeProfile: 'Complete Your Profile',
      subtitle: 'Please provide your name and phone number to complete your account setup.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      selectCountry: 'Select your country',
      continue: 'Continue',
      profileIncomplete: 'Profile Incomplete',
      completeToAccess: 'Please complete your profile to access your account.'
    },
    sw: {
      language: 'Kiswahili',
      completeProfile: 'Kamilisha Wasifu Wako',
      subtitle: 'Tafadhali toa jina lako na nambari ya simu ili kukamilisha usanidi wa akaunti yako.',
      fullName: 'Jina Kamili',
      phone: 'Nambari ya Simu',
      selectCountry: 'Chagua nchi yako',
      continue: 'Endelea',
      profileIncomplete: 'Wasifu Haujakamilika',
      completeToAccess: 'Tafadhali kamilisha wasifu wako ili kufikia akaunti yako.'
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

    try {
      console.log('✅ Completing user profile...');
      
      // Update user profile
      await updateProfile({
        name: fullName.trim(),
        phone: normalizePhoneNumber(phone, selectedCountry.phoneCode)
      });
      
      // Navigate to role selection screen for new users
      router.push('/role-selection' as any);
    } catch (error) {
      console.error('❌ Profile completion error:', error);
      Alert.alert('Error', 'Failed to complete profile. Please try again.');
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
              <View style={styles.alertContainer}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>{t.profileIncomplete}</Text>
              </View>
              <Text style={styles.title}>{t.completeProfile}</Text>
              <Text style={styles.subtitle}>{t.completeToAccess}</Text>
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
                {!validateFullName(fullName) && fullName.length > 0 && (
                  <Check size={20} color="#2ECC71" style={styles.validationIcon} />
                )}
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
                {!validatePhone(phone, selectedCountry.phoneCode) && phone.length > 0 && (
                  <Check size={20} color="#2ECC71" style={styles.validationIcon} />
                )}
              </View>

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
                    {isLoading ? 'Updating...' : t.continue}
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
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#E53E3E',
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
  validationIcon: {
    marginLeft: 8,
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
});