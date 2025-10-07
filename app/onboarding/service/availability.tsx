import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react-native';

export default function ServiceAvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const { completeRole, state } = useOnboarding();

  const handleComplete = () => {
    completeRole('service');
    router.replace('/dashboard' as any);
  };

  const totalEarnings = Object.values(state.serviceData.pricing).reduce((sum, price) => sum + price, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Setup Complete!</Text>
          <Text style={styles.subtitle}>Your service is ready to receive bookings</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4 • 100%</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Your Service Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Name:</Text>
            <Text style={styles.summaryValue}>{state.serviceData.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Category:</Text>
            <Text style={styles.summaryValue}>{state.serviceData.category}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Offerings:</Text>
            <Text style={styles.summaryValue}>{state.serviceData.offerings.length} services</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Potential Earnings:</Text>
            <Text style={styles.summaryValueHighlight}>KSh {totalEarnings.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Calendar size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Booking Management</Text>
              <Text style={styles.featureText}>
                Accept or decline bookings, manage your schedule, and track appointments
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Clock size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real-time Notifications</Text>
              <Text style={styles.featureText}>
                Get instant alerts when customers book your services
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <MapPin size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Location-based Discovery</Text>
              <Text style={styles.featureText}>
                Customers in your area can easily find and book your services
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.successBox}>
          <CheckCircle size={48} color="#10B981" />
          <Text style={styles.successTitle}>Service Hub Active! 🛠️</Text>
          <Text style={styles.successText}>
            Start receiving bookings and grow your service business with Banda
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  features: {
    gap: 16,
    marginBottom: 24,
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
