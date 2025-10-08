import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Key, Lock, Smartphone, Mail, MessageSquare, Shield, Eye, EyeOff } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';

interface SecurityOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'toggle' | 'action' | 'radio';
  value?: boolean | string;
  options?: string[];
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

function SecuritySection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

function SecurityRow({ option }: { option: SecurityOption }) {
  const IconComp = option.icon;
  
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <IconComp size={20} color="#16A34A" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.rowTitle}>{option.title}</Text>
          {option.subtitle && <Text style={styles.rowSubtitle}>{option.subtitle}</Text>}
        </View>
      </View>
      
      {option.type === 'toggle' && (
        <Switch
          value={option.value as boolean}
          onValueChange={option.onToggle}
          trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
          thumbColor={option.value ? '#fff' : '#fff'}
        />
      )}
      
      {option.type === 'action' && (
        <TouchableOpacity onPress={option.onPress} style={styles.actionButton}>
          <Text style={styles.actionText}>Change</Text>
        </TouchableOpacity>
      )}
      
      {option.type === 'radio' && (
        <TouchableOpacity onPress={option.onPress} style={styles.radioContainer}>
          <View style={[styles.radioButton, option.value && styles.radioButtonSelected]}>
            {option.value && <View style={styles.radioButtonInner} />}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SecurityScreen() {
  const router = useRouter();
  const { getItem, setItem } = useStorage();
  
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [lockMethod, setLockMethod] = useState<string>('none');
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);
  const [phoneLinked, setPhoneLinked] = useState<boolean>(true);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string>('off');
  const [taggingEnabled, setTaggingEnabled] = useState<boolean>(true);
  const [directMessagesFrom, setDirectMessagesFrom] = useState<string>('everyone');
  
  const handleUpdatePassword = useCallback(() => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    Alert.alert('Success', 'Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [currentPassword, newPassword, confirmPassword]);
  
  const handleChangePhoneNumber = useCallback(() => {
    Alert.alert('Change Phone Number', 'This feature will be available soon.');
  }, []);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Security',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Security</Text>
        <Text style={styles.subheader}>Manage your password and other security settings.</Text>
        
        <SecuritySection 
          title="Account Password" 
          subtitle="Set or change your password. For your security, we recommend choosing a strong password that you don't use elsewhere."
        >
          <View style={styles.passwordForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password (leave blank if new)</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  {showCurrentPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  {showNewPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
              <Text style={styles.updateButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </SecuritySection>
        
        <SecuritySection 
          title="App Lock" 
          subtitle="Add an extra layer of security when opening the app. Choose a primary lock method, then enable biometrics for convenience."
        >
          <Text style={styles.subsectionTitle}>Primary Lock Method</Text>
          
          <SecurityRow option={{
            id: 'lock-none',
            title: 'None (Not recommended)',
            icon: Lock,
            type: 'radio',
            value: lockMethod === 'none',
            onPress: () => setLockMethod('none')
          }} />
          
          <SecurityRow option={{
            id: 'lock-pin',
            title: 'Numeric PIN',
            icon: Key,
            type: 'radio',
            value: lockMethod === 'pin',
            onPress: () => setLockMethod('pin')
          }} />
          
          <SecurityRow option={{
            id: 'lock-pattern',
            title: 'Pattern',
            icon: Shield,
            type: 'radio',
            value: lockMethod === 'pattern',
            onPress: () => setLockMethod('pattern')
          }} />
          
          <View style={styles.divider} />
          
          <Text style={styles.subsectionTitle}>Biometric Lock</Text>
          <SecurityRow option={{
            id: 'biometrics',
            title: 'Use Biometrics (Fingerprint, Face ID)',
            subtitle: 'Unlock the app with your device\'s biometrics.',
            icon: Smartphone,
            type: 'toggle',
            value: biometricsEnabled,
            onToggle: setBiometricsEnabled
          }} />
          
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>Note</Text>
            <Text style={styles.noteDescription}>This is a conceptual feature. Full biometric and device-level lock integration requires a native mobile application.</Text>
          </View>
        </SecuritySection>
        
        <SecuritySection 
          title="Phone Number Linking" 
          subtitle="Link your phone to enable SMS-based 2FA and receive important account alerts."
        >
          <View style={styles.phoneSection}>
            <Text style={styles.phoneLabel}>Phone number is linked</Text>
            <Text style={styles.phoneNumber}>+254 712 345 678</Text>
            <TouchableOpacity style={styles.changeNumberButton} onPress={handleChangePhoneNumber}>
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>
        </SecuritySection>
        
        <SecuritySection 
          title="Two-Factor Authentication (2FA)" 
          subtitle="Add an extra layer of security to your account. Receive a unique code each time you sign in."
        >
          <SecurityRow option={{
            id: '2fa-off',
            title: 'Off',
            subtitle: 'No two-factor authentication will be used.',
            icon: Lock,
            type: 'radio',
            value: twoFactorMethod === 'off',
            onPress: () => setTwoFactorMethod('off')
          }} />
          
          <SecurityRow option={{
            id: '2fa-email',
            title: 'Email',
            subtitle: 'Receive a code via your email (janedoe@example.com).',
            icon: Mail,
            type: 'radio',
            value: twoFactorMethod === 'email',
            onPress: () => setTwoFactorMethod('email')
          }} />
          
          <SecurityRow option={{
            id: '2fa-sms',
            title: 'SMS',
            subtitle: 'Receive a code via your linked phone number.',
            icon: MessageSquare,
            type: 'radio',
            value: twoFactorMethod === 'sms',
            onPress: () => setTwoFactorMethod('sms')
          }} />
        </SecuritySection>
        
        <SecuritySection 
          title="Community Hub Security" 
          subtitle="Manage your visibility and interactions in the community."
        >
          <SecurityRow option={{
            id: 'tagging',
            title: 'Tagging',
            subtitle: 'Allow others to tag you in photos and posts.',
            icon: Shield,
            type: 'toggle',
            value: taggingEnabled,
            onToggle: setTaggingEnabled
          }} />
          
          <View style={styles.divider} />
          
          <Text style={styles.subsectionTitle}>Direct Messages</Text>
          <Text style={styles.subsectionSubtitle}>Control who can send you direct messages.</Text>
          
          <SecurityRow option={{
            id: 'dm-everyone',
            title: 'Everyone',
            icon: Shield,
            type: 'radio',
            value: directMessagesFrom === 'everyone',
            onPress: () => setDirectMessagesFrom('everyone')
          }} />
          
          <SecurityRow option={{
            id: 'dm-following',
            title: 'People you follow',
            icon: Shield,
            type: 'radio',
            value: directMessagesFrom === 'following',
            onPress: () => setDirectMessagesFrom('following')
          }} />
        </SecuritySection>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#16A34A',
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  radioContainer: {
    padding: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#16A34A',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  passwordForm: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 12,
  },
  updateButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subsectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  noteContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  noteDescription: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  phoneSection: {
    padding: 16,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  changeNumberButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  changeNumberText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});