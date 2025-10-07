import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Truck, User } from 'lucide-react-native';
import { useLogisticsInboarding, LogisticsRole } from '@/providers/logistics-inboarding-provider';

export default function LogisticsRoleScreen() {
  const router = useRouter();
  const { setRole } = useLogisticsInboarding();

  const handleRoleSelect = (role: LogisticsRole) => {
    console.log('[LogisticsRole] Selected role:', role);
    setRole(role);
    
    if (role === 'owner') {
      router.push('/inboarding/owner-details');
    } else {
      router.push('/inboarding/driver-details');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Join Banda Logistics', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Join Banda Logistics as...</Text>
        <Text style={styles.subtitle}>Choose your role to get started</Text>

        <View style={styles.rolesContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('owner')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Truck size={48} color="#007AFF" />
            </View>
            <Text style={styles.roleTitle}>Vehicle Owner</Text>
            <Text style={styles.roleDescription}>
              Register your fleet, assign drivers, and track earnings
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>• Fleet management</Text>
              <Text style={styles.feature}>• Driver assignments</Text>
              <Text style={styles.feature}>• Earnings tracking</Text>
              <Text style={styles.feature}>• Route optimization</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('driver')}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <User size={48} color="#34C759" />
            </View>
            <Text style={styles.roleTitle}>Driver</Text>
            <Text style={styles.roleDescription}>
              Get verified, accept trips, and earn payouts
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>• Verified driver status</Text>
              <Text style={styles.feature}>• Accept delivery trips</Text>
              <Text style={styles.feature}>• Direct payouts</Text>
              <Text style={styles.feature}>• Performance tracking</Text>
            </View>
          </TouchableOpacity>
        </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center' as const,
  },
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
    alignSelf: 'center' as const,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  roleDescription: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  features: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
});
