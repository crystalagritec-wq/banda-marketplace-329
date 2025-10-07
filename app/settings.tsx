import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  User,
  Shield,
  Lock,
  Bell,
  Palette,
  Languages,
  MapPin,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Trash2,
  LogOut,
  ChevronRight,
  MessageCircle,
  Settings as SettingsIcon,
  Activity,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useStorage } from '@/providers/storage-provider';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!description && <Text style={styles.sectionDescription}>{description}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ item }: { item: ListItem }) {
  const IconComp = item.icon;
  return (
    <TouchableOpacity
      style={[styles.row, item.danger && styles.rowDanger]}
      onPress={item.onPress}
      activeOpacity={0.8}
      testID={`settings-row-${item.id}`}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, item.danger && styles.rowIconDanger]}>
          <IconComp size={20} color={item.danger ? '#EF4444' : '#16A34A'} />
        </View>
        <View style={styles.rowTextWrap}>
          <Text style={[styles.rowTitle, item.danger && styles.rowTitleDanger]}>{item.title}</Text>
          {!!item.subtitle && <Text style={styles.rowSubtitle}>{item.subtitle}</Text>}
        </View>
      </View>
      {item.right ?? <ChevronRight size={18} color={item.danger ? '#EF4444' : '#9CA3AF'} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { getItem, setItem } = useStorage();

  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [language, setLanguage] = useState<string>('English');

  const version = useMemo(() => Constants?.expoConfig?.version ?? '1.0.0', []);
  const platformName = useMemo(() => (Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'), []);

  useEffect(() => {
    const load = async () => {
      try {
        const sPush = await getItem('settings_push');
        const sEmail = await getItem('settings_email');
        const sTheme = await getItem('settings_theme');
        const sLang = await getItem('settings_lang');
        setPushEnabled(sPush ? sPush === '1' : true);
        setEmailEnabled(sEmail ? sEmail === '1' : false);
        setTheme((sTheme as 'system' | 'light' | 'dark') ?? 'system');
        setLanguage(sLang ?? 'English');
      } catch (e) {
        console.log('load settings error', e);
      }
    };
    load();
  }, [getItem]);

  const persist = useCallback(async (key: string, value: string) => {
    try {
      await setItem(key, value);
    } catch (e) {
      Alert.alert('Save failed', 'We could not save your setting. Please try again.');
    }
  }, [setItem]);

  const onDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently remove your account and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Requested', 'Account deletion request submitted.') },
      ]
    );
  }, []);

  const accountItems: ListItem[] = [
    { id: 'edit', title: 'Edit Profile', subtitle: 'Change your photo, name and bio', icon: User, onPress: () => router.push('/(tabs)/account' as any) },
    { id: 'security', title: 'Security', subtitle: 'Password and 2‑factor authentication', icon: Lock, onPress: () => router.push('/settings/security' as any) },
    { id: 'privacy', title: 'Privacy', subtitle: 'Control your data visibility', icon: Shield, onPress: () => Alert.alert('Privacy Settings', 'Privacy settings will be available in the next update.') },
    { id: 'shipping', title: 'Shipping Addresses', subtitle: 'Manage your delivery locations', icon: MapPin, onPress: () => router.push('/settings/shipping' as any) },
  ];

  const appItems: ListItem[] = [
    { id: 'appearance', title: 'Appearance', subtitle: 'Theme, font size and layout', icon: Palette, right: (
      <View style={styles.rightInline}>
        <Text style={styles.rightInlineText}>{theme}</Text>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    ), onPress: () => router.push('/settings/appearance' as any) },
    { id: 'notifications', title: 'Notifications', subtitle: 'Choose how you get notified', icon: Bell, onPress: () => router.push('/settings/notifications' as any) },
    { id: 'email', title: 'Email Updates', subtitle: 'Promotions and order updates', icon: Mail, right: (
      <Switch value={emailEnabled} onValueChange={(v) => { setEmailEnabled(v); persist('settings_email', v ? '1' : '0'); }} />
    ) },
    { id: 'language', title: 'Language', subtitle: 'Select your preferred language', icon: Languages, right: (
      <View style={styles.rightInline}>
        <Text style={styles.rightInlineText}>{language}</Text>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    ), onPress: () => router.push('/settings/language' as any) },
  ];

  const supportItems: ListItem[] = [
    { id: 'customer-care', title: 'Customer Care AI', subtitle: 'Chat with our AI assistant', icon: MessageCircle, onPress: () => router.push('/customer-care' as any) },
    { id: 'contact', title: 'Contact Us', subtitle: 'Get in touch with our team', icon: Phone, onPress: () => router.push('/contact' as any) },
    { id: 'help', title: 'Help & Support', subtitle: 'Find answers in our FAQ', icon: HelpCircle, onPress: () => router.push('/settings/help' as any) },
    { id: 'feedback', title: 'Submit Feedback', subtitle: 'Suggest a feature or report a bug', icon: SettingsIcon, onPress: () => router.push('/settings/feedback' as any) },
  ];

  const systemItems: ListItem[] = [
    { id: 'system-health', title: 'System Health Check', subtitle: 'Monitor AgriPay & TradeGuard status', icon: Activity, onPress: () => router.push('/system-test' as any) },
  ];

  return (
    <View style={styles.container} testID="settings-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subheader}>Manage your account settings and preferences.</Text>

        <Section title="Account" description="Settings related to your personal account on Banda.">
          {accountItems.map((it) => (<Row key={it.id} item={it} />))}
        </Section>

        <Section title="App Settings" description="Customize your experience across the application.">
          {appItems.map((it) => (<Row key={it.id} item={it} />))}
        </Section>

        <Section title="Support & Feedback" description="Get help and share your thoughts with us.">
          {supportItems.map((it) => (<Row key={it.id} item={it} />))}
        </Section>

        <Section title="System" description="Monitor system health and performance.">
          {systemItems.map((it) => (<Row key={it.id} item={it} />))}
        </Section>

        <Section title="About">
          <Row item={{ id: 'legal', title: 'Legal Information', subtitle: 'Terms of Use, Privacy Policy, and more.', icon: FileText, onPress: () => router.push('/settings/legal' as any) }} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>App Version</Text>
            <Text style={styles.metaValue}>{version}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Platform</Text>
            <Text style={styles.metaValue}>{platformName}</Text>
          </View>
        </Section>

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Row item={{ id: 'delete', title: 'Delete Account', subtitle: 'Permanently remove your account and all data.', icon: Trash2, onPress: () => router.push('/settings/delete-account' as any), danger: true }} />
          <Text style={styles.signedInText}>You are currently logged in as {user?.email ?? 'guest'}.</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            testID="logout-button"
          >
            <LogOut size={18} color="#fff" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerCopy}>© 2025 Banda. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <View style={[styles.container, styles.center]}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMsg}>{error?.message ?? 'Unknown error'}</Text>
      <Text style={styles.errorSub}>Please go back and try again.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subheader: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sectionDescription: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F3F4F6' },
  rowDanger: { backgroundColor: 'rgba(239,68,68,0.04)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowIconDanger: { backgroundColor: 'rgba(239,68,68,0.12)' },
  rowTextWrap: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowTitleDanger: { color: '#EF4444' },
  rowSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rightInline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rightInlineText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F3F4F6', backgroundColor: '#fff' },
  metaLabel: { fontSize: 14, color: '#6B7280' },
  metaValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  dangerCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5', paddingBottom: 12, marginTop: 8 },
  dangerTitle: { fontSize: 18, fontWeight: '800', color: '#B91C1C', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  signedInText: { fontSize: 12, color: '#6B7280', paddingHorizontal: 14, marginTop: 8 },
  logoutButton: { marginHorizontal: 14, marginTop: 12, backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  logoutText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  footerCopy: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 16 },
  center: { alignItems: 'center', justifyContent: 'center' },
  errorTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 6 },
  errorMsg: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  errorSub: { fontSize: 12, color: '#9CA3AF' },
});
