import { Redirect } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { state, isLoading: onboardingLoading } = useOnboarding();
  
  if (authLoading || onboardingLoading) {
    return (
      <View style={styles.container}>
        <LoadingAnimation 
          visible={true} 
          message="Initializing Banda..." 
          type="marketplace"
          overlay={false}
        />
      </View>
    );
  }
  
  if (user) {
    if (!state.hasSeenOnboarding) {
      return <Redirect href="/onboarding/welcome" />;
    }
    return <Redirect href="/dashboard" />;
  }
  
  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
  },
});