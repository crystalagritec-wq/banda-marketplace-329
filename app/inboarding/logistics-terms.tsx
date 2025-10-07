import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Shield, DollarSign, TrendingUp, CheckCircle } from 'lucide-react-native';
import { useLogisticsInboarding } from '@/providers/logistics-inboarding-provider';

export default function LogisticsTermsScreen() {
  const router = useRouter();
  const { acceptTerms, role } = useLogisticsInboarding();

  const handleAccept = () => {
    console.log('[LogisticsTerms] Accepting terms');
    acceptTerms();
    router.push('/inboarding/logistics-complete');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Partnership Terms', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '90%' }]} />
        </View>
        <Text style={styles.progressText}>90% Complete</Text>

        <Text style={styles.title}>How Banda Logistics Works</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <DollarSign size={32} color="#007AFF" />
            </View>
            <Text style={styles.featureTitle}>Transparent Earnings</Text>
            <Text style={styles.featureDescription}>
              {role === 'owner' 
                ? 'Clear owner/driver split. Track all earnings in real-time.'
                : 'Fair pay for every delivery. Direct payouts to your wallet.'}
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <Shield size={32} color="#34C759" />
            </View>
            <Text style={styles.featureTitle}>Escrow Protection</Text>
            <Text style={styles.featureDescription}>
              Funds held securely until delivery confirmation. Disputes resolved through app.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconContainer}>
              <TrendingUp size={32} color="#FF9500" />
            </View>
            <Text style={styles.featureTitle}>Smart Matching</Text>
            <Text style={styles.featureDescription}>
              AI-powered route optimization. Pooling opportunities to maximize earnings.
            </Text>
          </View>
        </View>

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Partnership Terms</Text>
          <View style={styles.termsList}>
            <View style={styles.termItem}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.termText}>
                Payments tracked and released after delivery confirmation
              </Text>
            </View>
            <View style={styles.termItem}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.termText}>
                GPS & QR verification required for all deliveries
              </Text>
            </View>
            <View style={styles.termItem}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.termText}>
                Ratings system for accountability and trust
              </Text>
            </View>
            <View style={styles.termItem}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.termText}>
                Anti-exploitation measures protect all parties
              </Text>
            </View>
            <View style={styles.termItem}>
              <CheckCircle size={20} color="#34C759" />
              <Text style={styles.termText}>
                Maintenance alerts ensure vehicle safety
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ By continuing, you agree to Banda Logistics Partner Terms & Rules. 
            All deliveries must be completed professionally and on time.
          </Text>
        </View>

        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>I Agree - Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewTermsButton} onPress={() => {}}>
          <Text style={styles.viewTermsText}>View Full Terms & Conditions</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FA',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  termsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  viewTermsButton: {
    padding: 12,
    alignItems: 'center' as const,
  },
  viewTermsText: {
    fontSize: 15,
    color: '#007AFF',
    textDecorationLine: 'underline' as const,
  },
});
