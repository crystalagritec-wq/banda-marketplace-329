import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Users, MapPin, Mail, Phone, Share2, Database } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';
import { trpc } from '@/lib/trpc';

interface PrivacySetting {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

function PrivacySection({ title, subtitle, children }: { 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode; 
}) {
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

function PrivacyRow({ setting }: { setting: PrivacySetting }) {
  const IconComp = setting.icon;
  
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <IconComp size={20} color="#16A34A" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.rowTitle}>{setting.title}</Text>
          {setting.subtitle && <Text style={styles.rowSubtitle}>{setting.subtitle}</Text>}
        </View>
      </View>
      
      <Switch
        value={setting.enabled}
        onValueChange={setting.onToggle}
        trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
        thumbColor={setting.enabled ? '#fff' : '#fff'}
      />
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { getItem, setItem } = useStorage();

  const getPrefs = trpc.settings.getPreferences.useQuery(undefined, { staleTime: 60_000 });
  const updatePrefs = trpc.settings.updatePreferences.useMutation();
  
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [showPhone, setShowPhone] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [allowMessagesFromStrangers, setAllowMessagesFromStrangers] = useState<boolean>(true);
  const [shareDataWithPartners, setShareDataWithPartners] = useState<boolean>(false);
  const [activityStatus, setActivityStatus] = useState<boolean>(true);
  const [readReceipts, setReadReceipts] = useState<boolean>(true);

  useEffect(() => {
    if (!getPrefs.data?.success) return;
    const p = getPrefs.data.preferences as any;
    const privacy = p?.privacy ?? {};
    
    if (privacy.profileVisibility) setProfileVisibility(privacy.profileVisibility);
    if (typeof privacy.showEmail === 'boolean') setShowEmail(privacy.showEmail);
    if (typeof privacy.showPhone === 'boolean') setShowPhone(privacy.showPhone);
    if (typeof privacy.showLocation === 'boolean') setShowLocation(privacy.showLocation);
    if (typeof privacy.allowMessagesFromStrangers === 'boolean') setAllowMessagesFromStrangers(privacy.allowMessagesFromStrangers);
    if (typeof privacy.shareDataWithPartners === 'boolean') setShareDataWithPartners(privacy.shareDataWithPartners);
    
    (async () => {
      try {
        const activity = await getItem('privacy_activity_status');
        const receipts = await getItem('privacy_read_receipts');
        if (activity !== null) setActivityStatus(activity === '1');
        if (receipts !== null) setReadReceipts(receipts === '1');
      } catch {}
    })();
  }, [getPrefs.data?.success, getPrefs.data?.preferences, getItem]);
  
  const syncPreferences = useCallback(async (partial: Record<string, unknown>) => {
    try {
      await updatePrefs.mutateAsync({ category: 'privacy', preferences: partial });
      console.log('✅ Privacy preferences updated:', partial);
    } catch (e) {
      Alert.alert('Update failed', 'We could not save your privacy setting.');
      throw e;
    }
  }, [updatePrefs]);
  
  const saveSetting = useCallback(async (key: string, value: boolean) => {
    try {
      await setItem(`privacy_${key}`, value ? '1' : '0');
      console.log(`Privacy setting saved: ${key} = ${value}`);
    } catch (error) {
      console.error(`Failed to save privacy setting ${key}:`, error);
    }
  }, [setItem]);
  
  const handleProfileVisibilityToggle = useCallback(async () => {
    const newVisibility = profileVisibility === 'public' ? 'private' : 'public';
    setProfileVisibility(newVisibility);
    await syncPreferences({ profileVisibility: newVisibility });
  }, [profileVisibility, syncPreferences]);
  
  const handleShowEmailToggle = useCallback(async (enabled: boolean) => {
    setShowEmail(enabled);
    await syncPreferences({ showEmail: enabled });
  }, [syncPreferences]);
  
  const handleShowPhoneToggle = useCallback(async (enabled: boolean) => {
    setShowPhone(enabled);
    await syncPreferences({ showPhone: enabled });
  }, [syncPreferences]);
  
  const handleShowLocationToggle = useCallback(async (enabled: boolean) => {
    setShowLocation(enabled);
    await syncPreferences({ showLocation: enabled });
  }, [syncPreferences]);
  
  const handleMessagesToggle = useCallback(async (enabled: boolean) => {
    setAllowMessagesFromStrangers(enabled);
    await syncPreferences({ allowMessagesFromStrangers: enabled });
  }, [syncPreferences]);
  
  const handleDataSharingToggle = useCallback(async (enabled: boolean) => {
    setShareDataWithPartners(enabled);
    await syncPreferences({ shareDataWithPartners: enabled });
  }, [syncPreferences]);
  
  const handleActivityStatusToggle = useCallback((enabled: boolean) => {
    setActivityStatus(enabled);
    saveSetting('activity_status', enabled);
  }, [saveSetting]);
  
  const handleReadReceiptsToggle = useCallback((enabled: boolean) => {
    setReadReceipts(enabled);
    saveSetting('read_receipts', enabled);
  }, [saveSetting]);
  
  const profileSettings: PrivacySetting[] = [
    {
      id: 'profile-visibility',
      title: 'Public Profile',
      subtitle: profileVisibility === 'public' ? 'Your profile is visible to everyone' : 'Your profile is private',
      icon: profileVisibility === 'public' ? Eye : EyeOff,
      enabled: profileVisibility === 'public',
      onToggle: handleProfileVisibilityToggle,
    },
    {
      id: 'show-email',
      title: 'Show Email Address',
      subtitle: 'Display your email on your public profile',
      icon: Mail,
      enabled: showEmail,
      onToggle: handleShowEmailToggle,
    },
    {
      id: 'show-phone',
      title: 'Show Phone Number',
      subtitle: 'Display your phone number on your public profile',
      icon: Phone,
      enabled: showPhone,
      onToggle: handleShowPhoneToggle,
    },
    {
      id: 'show-location',
      title: 'Show Location',
      subtitle: 'Display your location on your public profile',
      icon: MapPin,
      enabled: showLocation,
      onToggle: handleShowLocationToggle,
    },
  ];
  
  const communicationSettings: PrivacySetting[] = [
    {
      id: 'messages-strangers',
      title: 'Messages from Anyone',
      subtitle: 'Allow messages from people you don\'t follow',
      icon: Users,
      enabled: allowMessagesFromStrangers,
      onToggle: handleMessagesToggle,
    },
    {
      id: 'activity-status',
      title: 'Activity Status',
      subtitle: 'Show when you\'re active on Banda',
      icon: Eye,
      enabled: activityStatus,
      onToggle: handleActivityStatusToggle,
    },
    {
      id: 'read-receipts',
      title: 'Read Receipts',
      subtitle: 'Let others know when you\'ve read their messages',
      icon: Eye,
      enabled: readReceipts,
      onToggle: handleReadReceiptsToggle,
    },
  ];
  
  const dataSettings: PrivacySetting[] = [
    {
      id: 'data-sharing',
      title: 'Share Data with Partners',
      subtitle: 'Help improve services by sharing anonymized data',
      icon: Share2,
      enabled: shareDataWithPartners,
      onToggle: handleDataSharingToggle,
    },
  ];
  
  const handleDownloadData = useCallback(() => {
    Alert.alert(
      'Download Your Data',
      'We\'ll prepare a copy of your data and send it to your email within 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => Alert.alert('Request Submitted', 'You\'ll receive an email when your data is ready.') },
      ]
    );
  }, []);
  
  return (
    <View style={styles.container} testID="privacy-screen">
      <Stack.Screen 
        options={{
          title: 'Privacy',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Privacy</Text>
        <Text style={styles.subheader}>Control your data visibility and privacy settings.</Text>
        
        {getPrefs.isLoading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#16A34A" />
          </View>
        ) : getPrefs.error ? (
          <Text style={{ color: '#B91C1C', padding: 12 }}>Failed to load preferences.</Text>
        ) : null}
        
        <PrivacySection 
          title="Profile Visibility" 
          subtitle="Control what information is visible on your profile."
        >
          {profileSettings.map((setting) => (
            <PrivacyRow key={setting.id} setting={setting} />
          ))}
        </PrivacySection>
        
        <PrivacySection 
          title="Communication" 
          subtitle="Manage how others can interact with you."
        >
          {communicationSettings.map((setting) => (
            <PrivacyRow key={setting.id} setting={setting} />
          ))}
        </PrivacySection>
        
        <PrivacySection 
          title="Data & Analytics" 
          subtitle="Control how your data is used."
        >
          {dataSettings.map((setting) => (
            <PrivacyRow key={setting.id} setting={setting} />
          ))}
        </PrivacySection>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          <Text style={styles.sectionSubtitle}>Request a copy of your personal data.</Text>
          
          <TouchableOpacity style={styles.dataButton} onPress={handleDownloadData}>
            <Database size={20} color="#16A34A" />
            <Text style={styles.dataButtonText}>Download My Data</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            We take your privacy seriously. Your data is encrypted and stored securely. 
            We never sell your personal information to third parties.
          </Text>
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
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  dataButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
