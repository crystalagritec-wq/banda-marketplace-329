import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  CheckCircle2,
  Shield,
  Smartphone,
  ArrowRight
} from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CongratulationsScreen() {
  const params = useLocalSearchParams();
  const identifier = params.identifier as string;
  const method = params.method as string;
  
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const translations = {
    en: {
      verified: 'Verified',
      welcome: 'You are all set! Welcome to your Banda!! 🎊',
      subtitle: 'Your device has been securely verified. You can now access your account with confidence.',
      securityNote: 'This device is now trusted for future sign-ins',
      continue: 'Continue to App',
      verifiedWith: method === 'phone' ? 'Verified via SMS' : 'Verified via Email',
      secureConnection: 'Secure Connection Established'
    },
    sw: {
      verified: 'Imethibitishwa',
      welcome: 'Umekamilika! Karibu kwenye Banda yako!! 🎊',
      subtitle: 'Kifaa chako kimethibitishwa kwa usalama. Sasa unaweza kufikia akaunti yako kwa ujasiri.',
      securityNote: 'Kifaa hiki sasa kinaaminiwa kwa kuingia kwa wakati ujao',
      continue: 'Endelea kwenye Programu',
      verifiedWith: method === 'phone' ? 'Imethibitishwa kupitia SMS' : 'Imethibitishwa kupitia Barua pepe',
      secureConnection: 'Muunganisho Salama Umeanzishwa'
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Success animation sequence
    Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Scale up the success icon
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide up content
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Confetti animation
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the icon
    const pulseAnimation = Animated.loop(
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
    
    const pulseTimer = setTimeout(() => pulseAnimation.start(), 800);
    
    return () => {
      clearTimeout(pulseTimer);
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, slideAnim, pulseAnim, confettiAnim]);

  const handleContinue = () => {
    router.replace('/(tabs)/marketplace');
  };

  const maskedIdentifier = () => {
    if (!identifier) return '';
    
    if (method === 'phone') {
      if (identifier.length >= 6) {
        return `${identifier.slice(0, 3)}***${identifier.slice(-2)}`;
      }
      return identifier;
    } else {
      const [local, domain] = identifier.split('@');
      if (local && domain) {
        return `${local.slice(0, 2)}***@${domain}`;
      }
      return identifier;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F0FFF4', '#FFFFFF']} style={styles.gradient}>
        {/* Confetti Effect */}
        <Animated.View 
          style={[
            styles.confettiContainer,
            {
              opacity: confettiAnim,
              transform: [{
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }]
            }
          ]}
        >
          {[...Array(12)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confetti,
                {
                  left: (i * width / 12) + Math.random() * 50,
                  backgroundColor: ['#2ECC71', '#27AE60', '#F39C12', '#E74C3C', '#3498DB'][i % 5],
                  transform: [{
                    translateY: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 200 + Math.random() * 300]
                    })
                  }, {
                    rotate: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${360 * (i % 2 === 0 ? 1 : -1)}deg`]
                    })
                  }]
                }
              ]}
            />
          ))}
        </Animated.View>

        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#2ECC71', '#27AE60']}
              style={styles.iconGradient}
            >
              <CheckCircle2 size={60} color="white" />
            </LinearGradient>
          </Animated.View>

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>{t.verified}</Text>
            <Text style={styles.subtitle}>{t.welcome}</Text>
            <Text style={styles.description}>{t.subtitle}</Text>

            {/* Verification Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Shield size={20} color="#2ECC71" />
                <Text style={styles.detailText}>{t.secureConnection}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Smartphone size={20} color="#2ECC71" />
                <Text style={styles.detailText}>{t.verifiedWith}</Text>
              </View>
              
              <View style={styles.identifierContainer}>
                <Text style={styles.identifierLabel}>Verified:</Text>
                <Text style={styles.identifier}>{maskedIdentifier()}</Text>
              </View>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityText}>{t.securityNote}</Text>
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              testID="continue-button"
            >
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={styles.continueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueButtonText}>{t.continue}</Text>
                <ArrowRight size={20} color="white" style={styles.arrowIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#2ECC71',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  description: {
    fontSize: 17,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.1)',
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
    marginLeft: 12,
  },
  identifierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 204, 113, 0.1)',
  },
  identifierLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginRight: 8,
  },
  identifier: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '700',
  },
  securityNote: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    width: '100%',
  },
  securityText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});