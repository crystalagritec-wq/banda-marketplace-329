import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,

} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, Shield, TrendingUp, Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WalletWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCreateWallet = () => {
    console.log('[WalletWelcome] Navigating to wallet onboarding...');
    router.push('/wallet-onboarding' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#2D5016', '#4A7C59']}
              style={styles.iconGradient}
            >
              <Wallet size={64} color="white" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Welcome to AgriPay</Text>
          <Text style={styles.subtitle}>
            Your secure wallet for payments and settlements
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Shield size={24} color="#2D5016" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure Transactions</Text>
                <Text style={styles.featureDescription}>
                  Protected by TradeGuard escrow system
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <TrendingUp size={24} color="#2D5016" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Track Your Money</Text>
                <Text style={styles.featureDescription}>
                  Real-time balance and transaction history
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Lock size={24} color="#2D5016" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>PIN Protection</Text>
                <Text style={styles.featureDescription}>
                  Secure your wallet with a 4-digit PIN
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateWallet}
            testID="create-wallet-button"
          >
            <LinearGradient
              colors={['#2D5016', '#4A7C59']}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>Create My Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D5016',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  features: {
    gap: 24,
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  createButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
