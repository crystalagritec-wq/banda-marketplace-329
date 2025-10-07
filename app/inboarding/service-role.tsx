import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2, User } from 'lucide-react-native';
import { useServiceInboarding, ServiceProviderType } from '@/providers/service-inboarding-provider';
import { useRef, useEffect } from 'react';

export default function ServiceRoleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setProviderType } = useServiceInboarding();
  
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim1, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim1, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim1]);

  const handleRoleSelect = (type: ServiceProviderType) => {
    console.log('[ServiceRole] Selected type:', type);
    setProviderType(type);
    router.push('/inboarding/service-details');
  };

  const handlePress = (type: ServiceProviderType, scaleAnim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => handleRoleSelect(type));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Join as Service Provider', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Banda Services</Text>
          <Text style={styles.subtitle}>Choose your provider type to get started</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '10%' }]} />
            </View>
            <Text style={styles.progressText}>Step 1 of 9 • 10%</Text>
          </View>
        </View>

        <View style={styles.rolesContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handlePress('individual', scaleAnim1)}
              activeOpacity={0.9}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#007AFF15' }]}>
                <User size={48} color="#007AFF" />
              </View>
              <Text style={styles.roleTitle}>Individual Provider</Text>
              <Text style={styles.roleDescription}>
                Solo provider offering specialized services
              </Text>
              <View style={styles.features}>
                <Text style={styles.feature}>✓ Get instant requests</Text>
                <Text style={styles.feature}>✓ Direct client communication</Text>
                <Text style={styles.feature}>✓ Flexible scheduling</Text>
                <Text style={styles.feature}>✓ Personal branding</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Most Popular</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => handlePress('organization', scaleAnim2)}
              activeOpacity={0.9}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#34C75915' }]}>
                <Building2 size={48} color="#34C759" />
              </View>
              <Text style={styles.roleTitle}>Organization / Company</Text>
              <Text style={styles.roleDescription}>
                Multi-provider company with team management
              </Text>
              <View style={styles.features}>
                <Text style={styles.feature}>✓ Manage multiple team members</Text>
                <Text style={styles.feature}>✓ Company branding</Text>
                <Text style={styles.feature}>✓ Advanced analytics</Text>
                <Text style={styles.feature}>✓ Bulk service offerings</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: '#34C759' }]}>
                <Text style={styles.badgeText}>For Teams</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoBold}>Pro Tip:</Text> Providers with verified licenses get 2x more requests
          </Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
    alignSelf: 'center' as const,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  roleDescription: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  features: {
    gap: 12,
    marginBottom: 16,
  },
  feature: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center' as const,
    marginTop: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  infoText: {
    fontSize: 15,
    color: '#8B6914',
    lineHeight: 22,
  },
  infoBold: {
    fontWeight: '700' as const,
  },
});
