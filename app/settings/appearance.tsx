import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Sun, Moon, Monitor, Type, Wifi } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';
import { useTheme } from '@/providers/theme-provider';
import { useTranslation } from '@/hooks/useTranslation';
import { trpc } from '@/lib/trpc';

interface ThemeOption {
  id: string;
  name: string;
  icon: any;
  description: string;
}

interface FontSizeOption {
  id: string;
  name: string;
  description: string;
}

interface LayoutDensityOption {
  id: string;
  name: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Classic light theme' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { id: 'system', name: 'System', icon: Monitor, description: 'Follows device setting' },
];

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'small', name: 'Small', description: 'Compact text size' },
  { id: 'medium', name: 'Medium', description: 'Standard text size' },
  { id: 'large', name: 'Large', description: 'Easier to read' },
  { id: 'extra-large', name: 'Extra Large', description: 'Maximum readability' },
];

const LAYOUT_DENSITY_OPTIONS: LayoutDensityOption[] = [
  { id: 'compact', name: 'Compact', description: 'More content on screen' },
  { id: 'default', name: 'Default', description: 'Balanced spacing' },
  { id: 'comfortable', name: 'Comfortable', description: 'More breathing room' },
];

function ThemeCard({ theme, isSelected, onSelect, colors }: { 
  theme: ThemeOption; 
  isSelected: boolean; 
  onSelect: () => void;
  colors: any;
}) {
  const IconComp = theme.icon;
  
  return (
    <TouchableOpacity 
      style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }, isSelected && { borderColor: colors.primary, backgroundColor: colors.primary }]} 
      onPress={onSelect}
    >
      <View style={styles.themeIconContainer}>
        <IconComp size={24} color={isSelected ? '#fff' : colors.primary} />
      </View>
      <Text style={[styles.themeName, { color: colors.text }, isSelected && { color: '#fff' }]}>
        {theme.name}
      </Text>
    </TouchableOpacity>
  );
}



export default function AppearanceScreen() {
  const router = useRouter();
  const { setItem } = useStorage();
  const theme = useTheme();
  const { t } = useTranslation();

  const getPrefs = trpc.settings.getPreferences.useQuery(undefined, { staleTime: 60_000 });
  const updatePrefs = trpc.settings.updatePreferences.useMutation();
  
  const [selectedTheme, setSelectedTheme] = useState<string>(theme.mode);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(theme.highContrast);
  const [lowDataMode, setLowDataMode] = useState<boolean>(theme.lowDataMode);
  const [fontSize, setFontSize] = useState<string>(theme.fontSize);
  const [layoutDensity, setLayoutDensity] = useState<string>(theme.layoutDensity);

  useEffect(() => {
    if (!getPrefs.data?.success) return;
    const p: any = getPrefs.data.preferences ?? {};
    const appearance = p.appearance ?? {};
    const accessibility = p.accessibility ?? {};
    if (appearance.theme && typeof appearance.theme === 'string') setSelectedTheme(appearance.theme);
    if (appearance.fontSize && typeof appearance.fontSize === 'string') setFontSize(appearance.fontSize);
    if (appearance.layoutDensity && typeof appearance.layoutDensity === 'string') setLayoutDensity(appearance.layoutDensity);
    if (typeof accessibility.highContrast === 'boolean') setHighContrastMode(accessibility.highContrast);
    if (typeof accessibility.lowDataMode === 'boolean') setLowDataMode(accessibility.lowDataMode);
  }, [getPrefs.data?.success, getPrefs.data?.preferences]);
  
  const handleThemeSelect = useCallback(async (themeId: string) => {
    setSelectedTheme(themeId);
    try {
      await theme.setMode(themeId as any);
      await setItem('settings_theme', themeId);
      console.log('Theme preference saved locally:', themeId);
      
      try {
        await updatePrefs.mutateAsync({ category: 'appearance', preferences: { theme: themeId } });
        console.log('Theme preference synced to server');
      } catch (serverError) {
        console.log('Could not sync theme to server (this is ok):', serverError);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [setItem, theme, updatePrefs]);
  
  const handleHighContrastToggle = useCallback(async (enabled: boolean) => {
    setHighContrastMode(enabled);
    try {
      await theme.setHighContrast(enabled);
      await setItem('settings_high_contrast', enabled ? '1' : '0');
      console.log('High contrast mode saved locally:', enabled);
      
      try {
        await updatePrefs.mutateAsync({ category: 'accessibility', preferences: { highContrast: enabled } });
        console.log('High contrast synced to server');
      } catch (serverError) {
        console.log('Could not sync to server (this is ok):', serverError);
      }
    } catch (error) {
      console.error('Failed to save high contrast preference:', error);
      Alert.alert('Update failed', 'Could not update High Contrast preference.');
    }
  }, [setItem, theme, updatePrefs]);

  const handleLowDataModeToggle = useCallback(async (enabled: boolean) => {
    setLowDataMode(enabled);
    try {
      await theme.setLowDataMode(enabled);
      await setItem('settings_low_data_mode', enabled ? '1' : '0');
      console.log('Low data mode saved locally:', enabled);
      
      try {
        await updatePrefs.mutateAsync({ category: 'accessibility', preferences: { lowDataMode: enabled } });
        console.log('Low data mode synced to server');
      } catch (serverError) {
        console.log('Could not sync to server (this is ok):', serverError);
      }
    } catch (error) {
      console.error('Failed to save low data mode preference:', error);
      Alert.alert('Update failed', 'Could not update Low Data Mode preference.');
    }
  }, [setItem, theme, updatePrefs]);
  
  const handleFontSizeSelect = useCallback(async (size: string) => {
    setFontSize(size);
    try {
      await theme.setFontSize(size as any);
      await setItem('settings_font_size', size);
      console.log('Font size preference saved locally:', size);
      
      try {
        await updatePrefs.mutateAsync({ category: 'appearance', preferences: { fontSize: size } });
        console.log('Font size synced to server');
      } catch (serverError) {
        console.log('Could not sync to server (this is ok):', serverError);
      }
    } catch (error) {
      console.error('Failed to save font size preference:', error);
      Alert.alert('Update failed', 'Could not update Font Size preference.');
    }
  }, [setItem, theme, updatePrefs]);
  
  const handleLayoutDensitySelect = useCallback(async (density: string) => {
    setLayoutDensity(density);
    try {
      await theme.setLayoutDensity(density as any);
      await setItem('settings_layout_density', density);
      console.log('Layout density preference saved locally:', density);
      
      try {
        await updatePrefs.mutateAsync({ category: 'appearance', preferences: { layoutDensity: density } });
        console.log('Layout density synced to server');
      } catch (serverError) {
        console.log('Could not sync to server (this is ok):', serverError);
      }
    } catch (error) {
      console.error('Failed to save layout density preference:', error);
      Alert.alert('Update failed', 'Could not update Layout Density preference.');
    }
  }, [setItem, theme, updatePrefs]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{
          title: t('settings.appearance'),
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.colors.text }]}>{t('settings.appearance')}</Text>
        <Text style={[styles.subheader, { color: theme.colors.mutedText }]}>{t('settings.appearanceSettings.description')}</Text>
        {getPrefs.isLoading && (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('settings.appearanceSettings.theme')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.mutedText }]}>{t('settings.appearanceSettings.selectTheme')}</Text>
          
          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map((themeOption) => (
              <ThemeCard
                key={themeOption.id}
                theme={themeOption}
                isSelected={selectedTheme === themeOption.id}
                onSelect={() => handleThemeSelect(themeOption.id)}
                colors={theme.colors}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('settings.appearanceSettings.accessibility')}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.mutedText }]}>{t('settings.appearanceSettings.accessibilityDescription')}</Text>
          
          <View style={[styles.accessibilityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.accessibilityRow}>
              <View style={styles.accessibilityInfo}>
                <View style={styles.accessibilityIconContainer}>
                  <Type size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.accessibilityTextContainer}>
                  <Text style={[styles.accessibilityTitle, { color: theme.colors.text }]}>{t('settings.appearanceSettings.highContrast')}</Text>
                  <Text style={[styles.accessibilitySubtitle, { color: theme.colors.mutedText }]}>{t('settings.appearanceSettings.highContrastDescription')}</Text>
                </View>
              </View>
              <Switch
                value={highContrastMode}
                onValueChange={handleHighContrastToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
            
            <View style={[styles.accessibilityRow, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
              <View style={styles.accessibilityInfo}>
                <View style={styles.accessibilityIconContainer}>
                  <Wifi size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.accessibilityTextContainer}>
                  <Text style={[styles.accessibilityTitle, { color: theme.colors.text }]}>{t('settings.appearanceSettings.lowDataMode')}</Text>
                  <Text style={[styles.accessibilitySubtitle, { color: theme.colors.mutedText }]}>{t('settings.appearanceSettings.lowDataModeDescription')}</Text>
                </View>
              </View>
              <Switch
                value={lowDataMode}
                onValueChange={handleLowDataModeToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('settings.appearanceSettings.fontSize')}</Text>
          <View style={styles.optionGrid}>
            {FONT_SIZE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, fontSize === option.id && { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` }]}
                onPress={() => handleFontSizeSelect(option.id)}
              >
                <Text style={[styles.optionButtonText, { color: theme.colors.mutedText }, fontSize === option.id && { color: theme.colors.primary }]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('settings.appearanceSettings.layoutDensity')}</Text>
          <View style={styles.optionGrid}>
            {LAYOUT_DENSITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, layoutDensity === option.id && { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` }]}
                onPress={() => handleLayoutDensitySelect(option.id)}
              >
                <Text style={[styles.optionButtonText, { color: theme.colors.mutedText }, layoutDensity === option.id && { color: theme.colors.primary }]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accessibilityCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  accessibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accessibilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accessibilityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accessibilityTextContainer: {
    flex: 1,
  },
  accessibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  accessibilitySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  optionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});