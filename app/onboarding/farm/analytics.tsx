import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { BarChart3, TrendingUp, DollarSign, Calendar, CheckCircle } from 'lucide-react-native';

export default function FarmAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { completeRole } = useOnboarding();

  const handleComplete = () => {
    completeRole('farm');
    router.replace('/dashboard' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics Preview</Text>
          <Text style={styles.subtitle}>Track your farm performance</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4 • 100%</Text>
        </View>

        <View style={styles.dashboardPreview}>
          <Text style={styles.previewTitle}>Your Farm Dashboard Will Show:</Text>
          
          <View style={styles.features}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <BarChart3 size={24} color="#10B981" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Yield Tracking</Text>
                <Text style={styles.featureText}>
                  Monitor crop yields, harvest dates, and production trends over time
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <DollarSign size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Expense Management</Text>
                <Text style={styles.featureText}>
                  Track inputs, labor costs, and calculate profit margins
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <TrendingUp size={24} color="#F59E0B" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Market Prices</Text>
                <Text style={styles.featureText}>
                  Real-time market prices for your crops and livestock
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Calendar size={24} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Task Calendar</Text>
                <Text style={styles.featureText}>
                  Automated reminders for planting, watering, and harvesting
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.successBox}>
          <CheckCircle size={48} color="#10B981" />
          <Text style={styles.successTitle}>Farm Ready for Monitoring! 🌱</Text>
          <Text style={styles.successText}>
            Your farm profile is complete. Start tracking your crops, managing workers, and analyzing your farm performance.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  dashboardPreview: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
