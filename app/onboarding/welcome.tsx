import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { setCurrentStep } = useOnboarding();

  const handleGetStarted = () => {
    setCurrentStep('intro_tour');
    router.push('/onboarding/intro-tour' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌾 Banda</Text>
        </View>
        
        <Text style={styles.tagline}>
          Your Shop, Services, Logistics & Farm in One.
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureText}>Sell farm products</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛠</Text>
            <Text style={styles.featureText}>Offer agri-services</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureText}>Deliver goods</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌱</Text>
            <Text style={styles.featureText}>Manage your farm</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  tagline: {
    fontSize: 20,
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 48,
    lineHeight: 28,
  },
  features: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2D5016',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
