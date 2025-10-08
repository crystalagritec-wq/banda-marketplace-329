import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Bell, Mail, Smartphone, Users, ShoppingBag, MessageSquare } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';
import { trpc } from '@/lib/trpc';

interface NotificationSetting {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

function NotificationSection({ title, subtitle, children }: { 
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

function NotificationRow({ setting }: { setting: NotificationSetting }) {
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

export default function NotificationsScreen() {
  const router = useRouter();
  const { getItem, setItem } = useStorage();

  const getPrefs = trpc.settings.getPreferences.useQuery(undefined, {
    staleTime: 60_000,
  });
  const updatePrefs = trpc.settings.updatePreferences.useMutation();
  
  // Channel settings
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [inAppNotifications, setInAppNotifications] = useState<boolean>(true);
  
  // Community settings
  const [newFollower, setNewFollower] = useState<boolean>(true);
  const [commentOnPost, setCommentOnPost] = useState<boolean>(true);
  
  // Marketplace settings
  const [itemSold, setItemSold] = useState<boolean>(true);
  const [newBidOnItem, setNewBidOnItem] = useState<boolean>(false);

  useEffect(() => {
    if (!getPrefs.data?.success) return;
    const p = getPrefs.data.preferences as any;
    const notif = p?.notifications ?? {};
    const push = notif.push ?? {};
    const email = notif.email ?? {};
    setPushNotifications(Boolean(push.enabled ?? true));
    setEmailNotifications(Boolean(email.enabled ?? true));
    // local fallbacks
    (async () => {
      try {
        const inApp = await getItem('notification_in_app');
        setInAppNotifications(inApp ? inApp === '1' : true);
      } catch {}
    })();
  }, [getPrefs.data?.success, getPrefs.data?.preferences, getItem]);
  
  const syncPreferences = useCallback(async (partial: Record<string, unknown>) => {
    try {
      await updatePrefs.mutateAsync({ category: 'notifications', preferences: partial });
    } catch (e) {
      Alert.alert('Update failed', 'We could not save your notification setting.');
      throw e;
    }
  }, [updatePrefs]);
  
  const saveSetting = useCallback(async (key: string, value: boolean) => {
    try {
      await setItem(`notification_${key}`, value ? '1' : '0');
      console.log(`Notification setting saved: ${key} = ${value}`);
    } catch (error) {
      console.error(`Failed to save notification setting ${key}:`, error);
    }
  }, [setItem]);
  
  const handlePushToggle = useCallback(async (enabled: boolean) => {
    setPushNotifications(enabled);
    await syncPreferences({ push: { enabled } });
  }, [syncPreferences]);
  
  const handleEmailToggle = useCallback(async (enabled: boolean) => {
    setEmailNotifications(enabled);
    await syncPreferences({ email: { enabled } });
  }, [syncPreferences]);
  
  const handleInAppToggle = useCallback((enabled: boolean) => {
    setInAppNotifications(enabled);
    saveSetting('in_app', enabled);
  }, [saveSetting]);
  
  const handleNewFollowerToggle = useCallback((enabled: boolean) => {
    setNewFollower(enabled);
    saveSetting('new_follower', enabled);
  }, [saveSetting]);
  
  const handleCommentToggle = useCallback((enabled: boolean) => {
    setCommentOnPost(enabled);
    saveSetting('comment_on_post', enabled);
  }, [saveSetting]);
  
  const handleItemSoldToggle = useCallback((enabled: boolean) => {
    setItemSold(enabled);
    saveSetting('item_sold', enabled);
  }, [saveSetting]);
  
  const handleNewBidToggle = useCallback((enabled: boolean) => {
    setNewBidOnItem(enabled);
    saveSetting('new_bid', enabled);
  }, [saveSetting]);
  
  const channelSettings: NotificationSetting[] = [
    {
      id: 'push',
      title: 'Push Notifications',
      icon: Bell,
      enabled: pushNotifications,
      onToggle: handlePushToggle,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      icon: Mail,
      enabled: emailNotifications,
      onToggle: handleEmailToggle,
    },
    {
      id: 'in-app',
      title: 'In-App Notifications',
      icon: Smartphone,
      enabled: inAppNotifications,
      onToggle: handleInAppToggle,
    },
  ];
  
  const communitySettings: NotificationSetting[] = [
    {
      id: 'new-follower',
      title: 'New follower',
      icon: Users,
      enabled: newFollower,
      onToggle: handleNewFollowerToggle,
    },
    {
      id: 'comment',
      title: 'Comment on your post',
      icon: MessageSquare,
      enabled: commentOnPost,
      onToggle: handleCommentToggle,
    },
  ];
  
  const marketplaceSettings: NotificationSetting[] = [
    {
      id: 'item-sold',
      title: 'An item you listed is sold',
      icon: ShoppingBag,
      enabled: itemSold,
      onToggle: handleItemSoldToggle,
    },
    {
      id: 'new-bid',
      title: 'New bid on your item',
      icon: ShoppingBag,
      enabled: newBidOnItem,
      onToggle: handleNewBidToggle,
    },
  ];
  
  return (
    <View style={styles.container} testID="notifications-screen">
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Notifications</Text>
        <Text style={styles.subheader}>Manage how you receive notifications from Banda.</Text>
        {getPrefs.isLoading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#16A34A" />
          </View>
        ) : getPrefs.error ? (
          <Text style={{ color: '#B91C1C', padding: 12 }}>Failed to load preferences.</Text>
        ) : null}
        
        <NotificationSection 
          title="Channels" 
          subtitle="Choose how you get notified."
        >
          {channelSettings.map((setting) => (
            <NotificationRow key={setting.id} setting={setting} />
          ))}
        </NotificationSection>
        
        <NotificationSection 
          title="Activity" 
          subtitle="Select notifications for specific activities."
        >
          <Text style={styles.subsectionTitle}>Community</Text>
          {communitySettings.map((setting) => (
            <NotificationRow key={setting.id} setting={setting} />
          ))}
          
          <View style={styles.divider} />
          
          <Text style={styles.subsectionTitle}>Marketplace</Text>
          {marketplaceSettings.map((setting) => (
            <NotificationRow key={setting.id} setting={setting} />
          ))}
        </NotificationSection>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
});