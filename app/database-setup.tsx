import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Lock } from 'lucide-react-native';
import { runDatabaseDiagnostics } from '@/utils/database-setup';
import { testDatabaseConnection } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: string;
}

const ADMIN_EMAILS = [
  'admin@banda.com',
  'dev@banda.com',
];

export default function DatabaseSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [results, setResults] = useState<{
    connection: DiagnosticResult | null;
    tables: DiagnosticResult | null;
    testUser: DiagnosticResult | null;
  }>({
    connection: null,
    tables: null,
    testUser: null,
  });

  useEffect(() => {
    const checkAuthorization = () => {
      if (!user) {
        console.log('🔒 Database setup: No user logged in');
        setIsAuthorized(false);
        return;
      }

      const userEmail = user.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.some(email => userEmail === email.toLowerCase());
      
      if (!isAdmin) {
        console.log('🔒 Database setup: Unauthorized access attempt by:', userEmail);
        setIsAuthorized(false);
        Alert.alert(
          'Access Denied',
          'This screen is only accessible to system administrators.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      console.log('✅ Database setup: Admin access granted');
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [user, router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const quickTest = async () => {
      console.log('🔍 Running quick connection test...');
      const connectionResult = await testDatabaseConnection();
      setResults(prev => ({
        ...prev,
        connection: {
          success: connectionResult.success,
          message: connectionResult.success ? '✅ Connection successful' : connectionResult.error || 'Connection failed',
          details: connectionResult.error
        }
      }));
    };
    quickTest();
  }, [isAuthorized]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults({ connection: null, tables: null, testUser: null });

    try {
      console.log('🚀 Starting database diagnostics...');
      const diagnostics = await runDatabaseDiagnostics();
      setResults(diagnostics);
      
      if (diagnostics.connection.success && diagnostics.tables.success && diagnostics.testUser.success) {
        Alert.alert(
          '✅ Database Ready!',
          'Your Banda database is fully set up and ready to use.',
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Diagnostics failed:', error);
      Alert.alert(
        '❌ Diagnostics Failed',
        error.message || 'An unexpected error occurred',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (result: DiagnosticResult | null) => {
    if (!result) return <AlertCircle size={20} color="#6B7280" />;
    if (result.success) return <CheckCircle size={20} color="#10B981" />;
    return <XCircle size={20} color="#EF4444" />;
  };

  const getStatusColor = (result: DiagnosticResult | null) => {
    if (!result) return '#6B7280';
    if (result.success) return '#10B981';
    return '#EF4444';
  };

  const showSetupInstructions = () => {
    Alert.alert(
      '📋 Setup Instructions',
      '1. Go to supabase.com/dashboard\n2. Select your project\n3. Open SQL Editor\n4. Copy & paste SUPABASE_COMPLETE_SCHEMA.sql\n5. Click Run\n6. Come back and test again',
      [
        { text: 'Got it!', style: 'default' }
      ]
    );
  };

  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Lock size={64} color="#EF4444" />
          <Text style={styles.unauthorizedTitle}>Access Restricted</Text>
          <Text style={styles.unauthorizedText}>
            This diagnostic tool is only available to system administrators.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Database size={32} color="#3B82F6" />
          <Text style={styles.title}>Database Setup</Text>
          <Text style={styles.subtitle}>
            Verify your Banda database is properly configured
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnostic Results</Text>
          
          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              {getStatusIcon(results.connection)}
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>Database Connection</Text>
                <Text style={[styles.resultMessage, { color: getStatusColor(results.connection) }]}>
                  {results.connection?.message || 'Not tested yet'}
                </Text>
                {results.connection?.details && (
                  <Text style={styles.resultDetails}>{results.connection.details}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              {getStatusIcon(results.tables)}
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>Database Tables</Text>
                <Text style={[styles.resultMessage, { color: getStatusColor(results.tables) }]}>
                  {results.tables?.message || 'Not tested yet'}
                </Text>
                {results.tables?.details && (
                  <Text style={styles.resultDetails}>{results.tables.details}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              {getStatusIcon(results.testUser)}
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>User Operations</Text>
                <Text style={[styles.resultMessage, { color: getStatusColor(results.testUser) }]}>
                  {results.testUser?.message || 'Not tested yet'}
                </Text>
                {results.testUser?.details && (
                  <Text style={styles.resultDetails}>{results.testUser.details}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw size={20} color="#FFFFFF" />
            )}
            <Text style={styles.primaryButtonText}>
              {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={showSetupInstructions}
          >
            <Text style={styles.secondaryButtonText}>Setup Instructions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>What This Tests:</Text>
          <Text style={styles.infoText}>
            • Connection to your Supabase database{'\n'}
            • Existence of all required tables{'\n'}
            • User creation and data operations{'\n'}
            • Row Level Security policies
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});