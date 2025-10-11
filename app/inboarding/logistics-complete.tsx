import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CheckCircle, Truck, User } from 'lucide-react-native';
import { useLogisticsInboarding } from '@/providers/logistics-inboarding-provider';
import { trpc } from '@/lib/trpc';

export default function LogisticsCompleteScreen() {
  const router = useRouter();
  const { role, fullVerificationComplete, ownerDetails, driverDetails } = useLogisticsInboarding();
  const completeMutation = trpc.logisticsInboarding.completeOnboarding.useMutation();

  const handleGoToDashboard = async () => {
    try {
      console.log('[LogisticsComplete] Finalizing onboarding...');
      if (!role) {
        router.replace('/logistics-dashboard' as any);
        return;
      }
      if (role === 'owner' && ownerDetails) {
        const payload: any = {
          role: 'owner' as const,
          ownerDetails: {
            fullName: ownerDetails.fullName,
            phone: ownerDetails.phone,
            kraPin: ownerDetails.kraPin,
            areaOfOperation: ownerDetails.areaOfOperation,
            vehicles: (ownerDetails.vehicles || []).map(v => ({
              type: v.type,
              registrationNumber: v.registrationNumber,
              color: v.color,
              capacity: v.capacity,
              photos: v.photos || [],
              ownershipType: v.ownershipType,
            })),
          },
        };
        await completeMutation.mutateAsync(payload);
      } else if (role === 'driver' && driverDetails) {
        const payload: any = {
          role: 'driver' as const,
          driverDetails: {
            fullName: driverDetails.fullName,
            phone: driverDetails.phone,
            idNumber: driverDetails.nationalIdUri || '',
            license: driverDetails.driverLicenseUri,
            selfie: driverDetails.selfieUri,
            discoverable: driverDetails.allowDiscovery,
          },
        };
        await completeMutation.mutateAsync(payload);
      }
    } catch (e: any) {
      console.error('[LogisticsComplete] Finalization error', e);
      Alert.alert('Error', e?.message ?? 'Failed to finalize logistics onboarding');
    } finally {
      console.log('[LogisticsComplete] Navigating to dashboard');
      router.replace('/logistics-dashboard' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {role === 'owner' ? (
            <Truck size={64} color="#007AFF" />
          ) : (
            <User size={64} color="#34C759" />
          )}
        </View>

        <CheckCircle size={80} color="#34C759" style={styles.checkIcon} />

        <Text style={styles.title}>
          {fullVerificationComplete ? 'Fully Verified!' : 'Quick Start Complete!'}
        </Text>

        <Text style={styles.subtitle}>
          {fullVerificationComplete
            ? `Your ${role === 'owner' ? 'fleet' : 'driver profile'} is fully verified and ready for premium deliveries`
            : `Your ${role === 'owner' ? 'logistics hub' : 'driver profile'} is active. Complete verification to unlock more features.`}
        </Text>

        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {fullVerificationComplete
                ? role === 'owner'
                  ? '✅ Verified Fleet Owner'
                  : '⭐ Trusted Driver'
                : '🚚💨 Logistics Hub Active (Pending Full Verification)'}
            </Text>
          </View>
        </View>

        {!fullVerificationComplete && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Complete Verification to Unlock:</Text>
            {role === 'owner' ? (
              <>
                <Text style={styles.infoItem}>• Pooling jobs & premium routes</Text>
                <Text style={styles.infoItem}>• Fleet analytics dashboard</Text>
                <Text style={styles.infoItem}>• Higher earning potential</Text>
                <Text style={styles.infoItem}>• Verified Fleet Owner badge</Text>
              </>
            ) : (
              <>
                <Text style={styles.infoItem}>• Premium delivery orders</Text>
                <Text style={styles.infoItem}>• Higher-value routes</Text>
                <Text style={styles.infoItem}>• Priority job assignments</Text>
                <Text style={styles.infoItem}>• Trusted Driver ⭐ badge</Text>
              </>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.dashboardButton} onPress={handleGoToDashboard}>
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        {!fullVerificationComplete && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => {
              if (role === 'owner') {
                router.push('/inboarding/owner-verification');
              } else {
                router.push('/inboarding/driver-verification');
              }
            }}
          >
            <Text style={styles.verifyButtonText}>Complete Verification Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  checkIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  badgeContainer: {
    marginBottom: 32,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    textAlign: 'center' as const,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 24,
  },
  dashboardButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  dashboardButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  verifyButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
});
