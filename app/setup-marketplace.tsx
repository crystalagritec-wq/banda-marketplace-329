import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { CheckCircle, XCircle, Database, Trash2, RefreshCw } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import {
  insertMockProducts,
  insertSampleServices,
  clearAllProducts,
  checkProductsExist,
} from '@/utils/insert-mock-data';

export default function SetupMarketplaceScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [productsCount, setProductsCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const checkExistingData = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setStatus('Checking existing data...');
    setError('');

    try {
      const result = await checkProductsExist(user.id);
      
      if (result.error) {
        setError(result.error);
      } else {
        setProductsCount(result.count);
        setStatus(`Found ${result.count} products in database`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleInsertProducts = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Insert Mock Products',
      'This will insert 40 sample products into the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Insert',
          onPress: async () => {
            setLoading(true);
            setStatus('Inserting mock products...');
            setError('');

            try {
              const result = await insertMockProducts(user.id);
              
              if (result.success) {
                setProductsCount(result.count);
                setStatus(`Successfully inserted ${result.count} products`);
                Alert.alert('Success', `Inserted ${result.count} products`);
              } else {
                setError(result.error || 'Failed to insert products');
                Alert.alert('Error', result.error || 'Failed to insert products');
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Unknown error';
              setError(errorMsg);
              Alert.alert('Error', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleInsertServices = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Insert Sample Services',
      'This will insert 3 sample services into the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Insert',
          onPress: async () => {
            setLoading(true);
            setStatus('Inserting sample services...');
            setError('');

            try {
              const result = await insertSampleServices(user.id);
              
              if (result.success) {
                setServicesCount(result.count);
                setStatus(`Successfully inserted ${result.count} services`);
                Alert.alert('Success', `Inserted ${result.count} services`);
              } else {
                setError(result.error || 'Failed to insert services');
                Alert.alert('Error', result.error || 'Failed to insert services');
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Unknown error';
              setError(errorMsg);
              Alert.alert('Error', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Clear All Products',
      'This will delete all your products from the database. This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setStatus('Clearing all products...');
            setError('');

            try {
              const result = await clearAllProducts(user.id);
              
              if (result.success) {
                setProductsCount(0);
                setStatus(`Successfully deleted ${result.count} products`);
                Alert.alert('Success', `Deleted ${result.count} products`);
              } else {
                setError(result.error || 'Failed to clear products');
                Alert.alert('Error', result.error || 'Failed to clear products');
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Unknown error';
              setError(errorMsg);
              Alert.alert('Error', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    checkExistingData();
  }, [checkExistingData]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Marketplace Setup',
          headerStyle: { backgroundColor: '#10B981' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Database size={48} color="#10B981" />
          <Text style={styles.title}>Database Setup</Text>
          <Text style={styles.subtitle}>
            Insert mock data to test the marketplace system
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Status</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : (
            <>
              <View style={styles.countRow}>
                <Text style={styles.countLabel}>Products:</Text>
                <Text style={styles.countValue}>{productsCount}</Text>
              </View>
              <View style={styles.countRow}>
                <Text style={styles.countLabel}>Services:</Text>
                <Text style={styles.countValue}>{servicesCount}</Text>
              </View>
              {status && (
                <View style={styles.statusRow}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.statusSuccess}>{status}</Text>
                </View>
              )}
              {error && (
                <View style={styles.errorRow}>
                  <XCircle size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleInsertProducts}
            disabled={loading}
          >
            <Database size={20} color="#fff" />
            <Text style={styles.buttonText}>Insert Mock Products (40)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleInsertServices}
            disabled={loading}
          >
            <Database size={20} color="#10B981" />
            <Text style={styles.secondaryButtonText}>Insert Sample Services (3)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={checkExistingData}
            disabled={loading}
          >
            <RefreshCw size={20} color="#6B7280" />
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearData}
            disabled={loading}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.buttonText}>Clear All Products</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Important Notes</Text>
          <Text style={styles.infoText}>
            • Mock data is for testing purposes only{'\n'}
            • Products will be associated with your user account{'\n'}
            • You can clear data anytime{'\n'}
            • In production, sellers create their own products{'\n'}
            • Make sure you&apos;ve run the database schema first
          </Text>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.back()}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  countValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  statusSuccess: {
    fontSize: 14,
    color: '#10B981',
    flex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  refreshButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
