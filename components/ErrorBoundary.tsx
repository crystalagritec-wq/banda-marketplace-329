import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { AlertTriangle, RefreshCw, Home, Database, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || undefined,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    router.replace('/(tabs)/marketplace');
  };

  handleOpenSupabaseSetup = () => {
    Linking.openURL('https://supabase.com/dashboard');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDatabaseError = this.state.error?.message?.includes('Database') || 
                             this.state.error?.message?.includes('database') ||
                             this.state.error?.message?.includes('setup required');

      return (
        <View style={styles.container}>
          <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.iconContainer}>
                {isDatabaseError ? (
                  <Database size={64} color="#3B82F6" />
                ) : (
                  <AlertTriangle size={64} color="#DC2626" />
                )}
              </View>
              
              <Text style={styles.title}>
                {isDatabaseError ? 'Database Setup Required' : 'Oops! Something went wrong'}
              </Text>
              <Text style={styles.subtitle}>
                {isDatabaseError 
                  ? 'Your Supabase database tables need to be created. Please run the SQL setup script in your Supabase dashboard to continue using the app.'
                  : 'We\'re sorry for the inconvenience. The app encountered an unexpected error.'
                }
              </Text>
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Error Details (Development Mode):</Text>
                  <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                  {this.state.errorInfo && (
                    <Text style={styles.errorStack}>{this.state.errorInfo}</Text>
                  )}
                </View>
              )}
              
              <View style={styles.actions}>
                {isDatabaseError && (
                  <TouchableOpacity style={styles.setupButton} onPress={this.handleOpenSupabaseSetup}>
                    <ExternalLink size={20} color="white" />
                    <Text style={styles.setupButtonText}>Open Supabase Dashboard</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                  <RefreshCw size={20} color="white" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.homeButton} onPress={this.handleGoHome}>
                  <Home size={20} color="#2D5016" />
                  <Text style={styles.homeButtonText}>Go to Marketplace</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#7F1D1D',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  setupButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  homeButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#2D5016',
  },
  homeButtonText: {
    color: '#2D5016',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ErrorBoundary;