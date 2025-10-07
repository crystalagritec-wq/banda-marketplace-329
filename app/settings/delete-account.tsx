import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, AlertTriangle, List, FileText, BarChart3, Trash2 } from 'lucide-react-native';

const DELETION_ITEMS = [
  {
    icon: List,
    text: 'Your product and service listings.',
  },
  {
    icon: FileText,
    text: 'Your community posts, comments, and messages.',
  },
  {
    icon: BarChart3,
    text: 'Your transaction history and analytics.',
  },
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  
  const [confirmationText, setConfirmationText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const handleDeleteAccount = useCallback(async () => {
    if (confirmationText.trim().toLowerCase() !== 'delete my account') {
      Alert.alert('Error', 'Please type "delete my account" exactly as shown to confirm.');
      return;
    }
    
    Alert.alert(
      'Final Confirmation',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted. Thank you for using ShambaConnect.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // In a real app, this would log out the user and navigate to login
                      router.replace('/(auth)/welcome' as any);
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  }, [confirmationText, router]);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Delete Account',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Delete Account</Text>
        <Text style={styles.subheader}>This action is permanent and cannot be undone.</Text>
        
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.warningTitle}>Are you absolutely sure?</Text>
          </View>
          <Text style={styles.warningText}>
            This will permanently delete your account and all associated data from our servers.
          </Text>
          
          <View style={styles.deletionList}>
            <Text style={styles.deletionListTitle}>This will remove:</Text>
            {DELETION_ITEMS.map((item, index) => (
              <View key={index} style={styles.deletionItem}>
                <item.icon size={16} color="#6B7280" />
                <Text style={styles.deletionItemText}>{item.text}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>
              To confirm, please type "delete my account" below:
            </Text>
            <TextInput
              style={styles.confirmationInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="delete my account"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.deleteButton, 
              isDeleting && styles.deleteButtonDisabled,
              confirmationText.trim().toLowerCase() !== 'delete my account' && styles.deleteButtonDisabled
            ]}
            onPress={handleDeleteAccount}
            disabled={isDeleting || confirmationText.trim().toLowerCase() !== 'delete my account'}
          >
            <Trash2 size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>
              {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  deletionList: {
    marginBottom: 24,
  },
  deletionListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  deletionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deletionItemText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  confirmationSection: {
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  confirmationInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});