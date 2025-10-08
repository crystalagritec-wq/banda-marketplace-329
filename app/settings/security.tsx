import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Key, Lock, Smartphone, Mail, MessageSquare, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';
import { trpc } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';

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
  const [userEmail, setUserEmail] = useState<string>('user@example.com');
  const [userPhone, setUserPhone] = useState<string>('+254 712 345 678');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const getPrefs = trpc.settings.getPreferences.useQuery(undefined, { staleTime: 60_000 });
  const updatePrefs = trpc.settings.updatePreferences.useMutation();
  const enable2FA = trpc.settings.enable2FA.useMutation();

  useEffect(() => {    
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'user@example.com');
          setUserPhone(user.phone || '+254 712 345 678');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (!getPrefs.data?.success) return;
    const p: any = getPrefs.data.preferences ?? {};
    const security = p.security ?? {};
    const privacy = p.privacy ?? {};
    
    if (typeof security.twoFactorEnabled === 'boolean' && security.twoFactorEnabled) {
      setTwoFactorMethod('email');
    }
    if (typeof security.biometricEnabled === 'boolean') setBiometricsEnabled(security.biometricEnabled);
    if (typeof privacy.allowMessagesFromStrangers === 'boolean') {
      setDirectMessagesFrom(privacy.allowMessagesFromStrangers ? 'everyone' : 'following');
    }
  }, [getPrefs.data?.success, getPrefs.data?.preferences]);
  
  const calculatePasswordStrength = useCallback((password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  }, []);

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword, calculatePasswordStrength]);

  const handleUpdatePassword = useCallback(async () => {
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
    if (passwordStrength < 50) {
      Alert.alert('Weak Password', 'Please choose a stronger password with a mix of uppercase, lowercase, numbers, and special characters.');
      return;
    }
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      console.log('✅ Password updated successfully');
    } catch (error: any) {
      console.error('❌ Password update error:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  }, [currentPassword, newPassword, confirmPassword, passwordStrength]);
  
  const changePhone = trpc.settings.changePhone.useMutation();
  const [isChangingPhone, setIsChangingPhone] = useState<boolean>(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);

  const handleChangePhoneNumber = useCallback(() => {
    Alert.prompt(
      'Change Phone Number',
      'Enter your new phone number with country code (e.g., +254712345678)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Code',
          onPress: async (phone) => {
            if (!phone || phone.length < 10) {
              Alert.alert('Invalid Phone', 'Please enter a valid phone number');
              return;
            }
            setIsChangingPhone(true);
            setNewPhoneNumber(phone);
            try {
              const result = await changePhone.mutateAsync({ newPhone: phone });
              if (result.requiresOtp) {
                setOtpSent(true);
                Alert.prompt(
                  'Verify Phone Number',
                  'Enter the verification code sent to your new phone number',
                  [
                    { text: 'Cancel', style: 'cancel', onPress: () => {
                      setIsChangingPhone(false);
                      setOtpSent(false);
                    }},
                    {
                      text: 'Verify',
                      onPress: async (otp) => {
                        if (!otp || otp.length < 4) {
                          Alert.alert('Invalid Code', 'Please enter the verification code');
                          setIsChangingPhone(false);
                          setOtpSent(false);
                          return;
                        }
                        try {
                          const verifyResult = await changePhone.mutateAsync({
                            newPhone: phone,
                            otp,
                          });
                          if (verifyResult.success) {
                            Alert.alert('Success', 'Phone number updated successfully');
                            setUserPhone(phone);
                          }
                        } catch (error: any) {
                          Alert.alert('Error', error.message || 'Failed to verify code');
                        } finally {
                          setIsChangingPhone(false);
                          setOtpSent(false);
                        }
                      },
                    },
                  ],
                  'plain-text'
                );
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to send verification code');
              setIsChangingPhone(false);
            }
          },
        },
      ],
      'plain-text'
    );
  }, [changePhone]);

  const handleToggle2FA = useCallback(async (method: string) => {
    if (method === 'off') {
      setTwoFactorMethod('off');
      try {
        await updatePrefs.mutateAsync({ 
          category: 'security', 
          preferences: { twoFactorEnabled: false } 
        });
        console.log('✅ 2FA disabled');
      } catch (error) {
        console.error('❌ Failed to disable 2FA:', error);
      }
      return;
    }

    setIsUpdating(true);
    try {
      const result = await enable2FA.mutateAsync({ 
        method: method as 'sms' | 'app' | 'email',
        phone: method === 'sms' ? userPhone : undefined
      });
      
      if (result.success) {
        setTwoFactorMethod(method);
        await updatePrefs.mutateAsync({ 
          category: 'security', 
          preferences: { twoFactorEnabled: true, twoFactorMethod: method } 
        });
        Alert.alert(
          '2FA Enabled',
          `Two-factor authentication via ${method} has been enabled successfully.`,
          [{ text: 'OK' }]
        );
        console.log('✅ 2FA enabled:', method);
      }
    } catch (error: any) {
      console.error('❌ 2FA setup error:', error);
      Alert.alert('Error', 'Failed to enable 2FA. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [enable2FA, updatePrefs, userPhone]);

  const handleBiometricsToggle = useCallback(async (enabled: boolean) => {
    setBiometricsEnabled(enabled);
    try {
      await setItem('security_biometrics', enabled ? '1' : '0');
      await updatePrefs.mutateAsync({ 
        category: 'security', 
        preferences: { biometricEnabled: enabled } 
      });
      console.log('✅ Biometrics setting updated:', enabled);
    } catch (error) {
      console.error('❌ Failed to update biometrics setting:', error);
    }
  }, [setItem, updatePrefs]);

  const handlePrivacyToggle = useCallback(async (setting: string, value: boolean | string) => {
    if (setting === 'tagging') {
      setTaggingEnabled(value as boolean);
    } else if (setting === 'directMessages') {
      setDirectMessagesFrom(value as string);
    }
    
    try {
      await updatePrefs.mutateAsync({ 
        category: 'privacy', 
        preferences: { 
          [setting === 'tagging' ? 'allowTagging' : 'allowMessagesFromStrangers']: 
            setting === 'tagging' ? value : value === 'everyone'
        } 
      });
      console.log('✅ Privacy setting updated:', setting, value);
    } catch (error) {
      console.error('❌ Failed to update privacy setting:', error);
    }
  }, [updatePrefs]);
  
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
            
            {newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View 
                    style={[
                      styles.passwordStrengthFill, 
                      { 
                        width: `${passwordStrength}%`,
                        backgroundColor: passwordStrength < 50 ? '#EF4444' : passwordStrength < 75 ? '#F59E0B' : '#10B981'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.passwordStrengthText}>
                  {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]} 
              onPress={handleUpdatePassword}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update Password</Text>
              )}
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
            onPress: () => {
              setLockMethod('pin');
              router.push('/app-lock-setup?method=pin');
            }
          }} />
          
          <SecurityRow option={{
            id: 'lock-pattern',
            title: 'Pattern',
            icon: Shield,
            type: 'radio',
            value: lockMethod === 'pattern',
            onPress: () => {
              setLockMethod('pattern');
              router.push('/app-lock-setup?method=pattern');
            }
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
            onToggle: handleBiometricsToggle
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
            <View style={styles.phoneHeader}>
              <Text style={styles.phoneLabel}>Phone number is linked</Text>
              <CheckCircle size={20} color="#10B981" />
            </View>
            <Text style={styles.phoneNumber}>{userPhone}</Text>
            <TouchableOpacity style={styles.changeNumberButton} onPress={handleChangePhoneNumber}>
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>
        </SecuritySection>
        
        <SecuritySection 
          title="Two-Factor Authentication (2FA)" 
          subtitle="Add an extra layer of security to your account. Receive a unique code each time you sign in."
        >
          {isUpdating && (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <ActivityIndicator color="#16A34A" />
            </View>
          )}
          
          <SecurityRow option={{
            id: '2fa-off',
            title: 'Off',
            subtitle: 'No two-factor authentication will be used.',
            icon: Lock,
            type: 'radio',
            value: twoFactorMethod === 'off',
            onPress: () => handleToggle2FA('off')
          }} />
          
          <SecurityRow option={{
            id: '2fa-email',
            title: 'Email',
            subtitle: `Receive a code via your email (${userEmail}).`,
            icon: Mail,
            type: 'radio',
            value: twoFactorMethod === 'email',
            onPress: () => handleToggle2FA('email')
          }} />
          
          <SecurityRow option={{
            id: '2fa-sms',
            title: 'SMS',
            subtitle: 'Receive a code via your linked phone number.',
            icon: MessageSquare,
            type: 'radio',
            value: twoFactorMethod === 'sms',
            onPress: () => handleToggle2FA('sms')
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
            onToggle: (v) => handlePrivacyToggle('tagging', v)
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
            onPress: () => handlePrivacyToggle('directMessages', 'everyone')
          }} />
          
          <SecurityRow option={{
            id: 'dm-following',
            title: 'People you follow',
            icon: Shield,
            type: 'radio',
            value: directMessagesFrom === 'following',
            onPress: () => handlePrivacyToggle('directMessages', 'following')
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
    paddingTop: 8,
    paddingBottom: 24,
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
  updateButtonDisabled: {
    opacity: 0.6,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  passwordStrengthBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  passwordStrengthText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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