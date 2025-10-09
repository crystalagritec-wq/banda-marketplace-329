import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Database, Package, Briefcase, Trash2, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { populateProducts, populateServices, populateAll, clearAllData, checkDataExists } from '@/utils/populate-database';

export default function PopulateDataScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [existingData, setExistingData] = useState<{ products: number; services: number }>({ products: 0, services: 0 });
  const [lastResult, setLastResult] = useState<string>('');

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    if (!user?.user_id) return;
    
    setChecking(true);
    try {
      const data = await checkDataExists(user.user_id);
      setExistingData(data);
    } catch (error) {
      console.error('Error checking data:', error);
    } finally {
      setChecking(false);
    }
  };

  const handlePopulateProducts = async () => {
    if (!user?.user_id) {
      Alert.alert('Error', 'You must be logged in to populate data');
      return;
    }

    setLoading(true);
    setLastResult('');
    try {
      const result = await populateProducts(user.user_id);
      setLastResult(result.message);
      
      if (result.success) {
        Alert.alert('Success', result.message);
        await checkExistingData();
      } else {
        Alert.alert('Error', result.message + (result.error ? `\n\n${result.error}` : ''));
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateServices = async () => {
    if (!user?.user_id) {
      Alert.alert('Error', 'You must be logged in to populate data');
      return;
    }

    setLoading(true);
    setLastResult('');
    try {
      const result = await populateServices(user.user_id);
      setLastResult(result.message);
      
      if (result.success) {
        Alert.alert('Success', result.message);
        await checkExistingData();
      } else {
        Alert.alert('Error', result.message + (result.error ? `\n\n${result.error}` : ''));
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateAll = async () => {
    if (!user?.user_id) {
      Alert.alert('Error', 'You must be logged in to populate data');
      return;
    }

    Alert.alert(
      'Populate All Data',
      'This will add sample products and services to your account. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Populate',
          onPress: async () => {
            setLoading(true);
            setLastResult('');
            try {
              const result = await populateAll(user.user_id);
              setLastResult(result.message);
              
              if (result.success) {
                Alert.alert('Success', result.message);
                await checkExistingData();
              } else {
                Alert.alert('Error', result.message + (result.error ? `\n\n${result.error}` : ''));
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    if (!user?.user_id) {
      Alert.alert('Error', 'You must be logged in to clear data');
      return;
    }

    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your products and services. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setLastResult('');
            try {
              const result = await clearAllData(user.user_id);
              setLastResult(result.message);
              
              if (result.success) {
                Alert.alert('Success', result.message);
                await checkExistingData();
              } else {
                Alert.alert('Error', result.message + (result.error ? `\n\n${result.error}` : ''));
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Populate Database',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Database size={48} color="#16A34A" />
          <Text style={styles.title}>Database Population</Text>
          <Text style={styles.subtitle}>
            Add sample data to test and explore Banda features
          </Text>
        </View>

        {checking ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.loadingText}>Checking existing data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Current Data</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Package size={24} color="#16A34A" />
                  <Text style={styles.statValue}>{existingData.products}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Briefcase size={24} color="#3B82F6" />
                  <Text style={styles.statValue}>{existingData.services}</Text>
                  <Text style={styles.statLabel}>Services</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Populate Options</Text>
              
              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handlePopulateProducts}
                disabled={loading}
              >
                <View style={styles.actionButtonLeft}>
                  <Package size={24} color="#fff" />
                  <View style={styles.actionButtonText}>
                    <Text style={styles.actionButtonTitle}>Add Sample Products</Text>
                    <Text style={styles.actionButtonSubtitle}>8 diverse agricultural products</Text>
                  </View>
                </View>
                {loading && <ActivityIndicator color="#fff" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonBlue, loading && styles.actionButtonDisabled]}
                onPress={handlePopulateServices}
                disabled={loading}
              >
                <View style={styles.actionButtonLeft}>
                  <Briefcase size={24} color="#fff" />
                  <View style={styles.actionButtonText}>
                    <Text style={styles.actionButtonTitle}>Add Sample Services</Text>
                    <Text style={styles.actionButtonSubtitle}>6 agricultural services</Text>
                  </View>
                </View>
                {loading && <ActivityIndicator color="#fff" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPurple, loading && styles.actionButtonDisabled]}
                onPress={handlePopulateAll}
                disabled={loading}
              >
                <View style={styles.actionButtonLeft}>
                  <Database size={24} color="#fff" />
                  <View style={styles.actionButtonText}>
                    <Text style={styles.actionButtonTitle}>Populate All Data</Text>
                    <Text style={styles.actionButtonSubtitle}>Add all sample data at once</Text>
                  </View>
                </View>
                {loading && <ActivityIndicator color="#fff" />}
              </TouchableOpacity>
            </View>

            {existingData.products > 0 || existingData.services > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonRed, loading && styles.actionButtonDisabled]}
                  onPress={handleClearAll}
                  disabled={loading}
                >
                  <View style={styles.actionButtonLeft}>
                    <Trash2 size={24} color="#fff" />
                    <View style={styles.actionButtonText}>
                      <Text style={styles.actionButtonTitle}>Clear All Data</Text>
                      <Text style={styles.actionButtonSubtitle}>Delete all products and services</Text>
                    </View>
                  </View>
                  {loading && <ActivityIndicator color="#fff" />}
                </TouchableOpacity>
              </View>
            ) : null}

            {lastResult ? (
              <View style={styles.resultCard}>
                <CheckCircle size={20} color="#16A34A" />
                <Text style={styles.resultText}>{lastResult}</Text>
              </View>
            ) : null}

            <View style={styles.infoCard}>
              <AlertCircle size={20} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>About Sample Data</Text>
                <Text style={styles.infoText}>
                  Sample data includes realistic agricultural products and services with images, descriptions, and pricing. Perfect for testing marketplace features, search, and ordering flows.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButtonBlue: {
    backgroundColor: '#3B82F6',
  },
  actionButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonRed: {
    backgroundColor: '#DC2626',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  resultCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
  },
  resultText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
