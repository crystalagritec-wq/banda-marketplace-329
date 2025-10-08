import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Sun, Moon, Monitor, Type, Wifi } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';
import { useTheme } from '@/providers/theme-provider';
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
  { id: 'default', name: 'Default', description: 'Standard text size' },
  { id: 'large', name: 'Large', description: 'Easier to read' },
];

const LAYOUT_DENSITY_OPTIONS: LayoutDensityOption[] = [
  { id: 'compact', name: 'Compact', description: 'More content on screen' },
  { id: 'default', name: 'Default', description: 'Balanced spacing' },
  { id: 'comfortable', name: 'Comfortable', description: 'More breathing room' },
];

function ThemeCard({ theme, isSelected, onSelect }: { 
  theme: ThemeOption; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  const IconComp = theme.icon;
  
  return (
    <TouchableOpacity 
      style={[styles.themeCard, isSelected && styles.themeCardSelected]} 
      onPress={onSelect}
    >
      <View style={styles.themeIconContainer}>
        <IconComp size={24} color={isSelected ? '#fff' : '#16A34A'} />
      </View>
      <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>
        {theme.name}
      </Text>
    </TouchableOpacity>
  );
}

function OptionRow({ title, options, selectedValue, onSelect }: {
  title: string;
  options: Array<{ id: string; name: string; description?: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.optionSection}>
      <Text style={styles.optionTitle}>{title}</Text>
      <View style={styles.optionGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionButton, selectedValue === option.id && styles.optionButtonSelected]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={[styles.optionButtonText, selectedValue === option.id && styles.optionButtonTextSelected]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function AppearanceScreen() {
  const router = useRouter();
  const { getItem, setItem } = useStorage();
  const theme = useTheme();

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
      await updatePrefs.mutateAsync({ category: 'appearance', preferences: { theme: themeId } });
      console.log('Theme preference saved:', themeId);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [setItem, theme]);
  
  const handleHighContrastToggle = useCallback(async (enabled: boolean) => {
    setHighContrastMode(enabled);
    try {
      await theme.setHighContrast(enabled);
      await setItem('settings_high_contrast', enabled ? '1' : '0');
      await updatePrefs.mutateAsync({ category: 'accessibility', preferences: { highContrast: enabled } });
      console.log('High contrast mode:', enabled);
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
      await updatePrefs.mutateAsync({ category: 'accessibility', preferences: { lowDataMode: enabled } });
      console.log('Low data mode:', enabled);
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
      await updatePrefs.mutateAsync({ category: 'appearance', preferences: { fontSize: size } });
      console.log('Font size preference saved:', size);
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
      await updatePrefs.mutateAsync({ category: 'appearance', preferences: { layoutDensity: density } });
      console.log('Layout density preference saved:', density);
    } catch (error) {
      console.error('Failed to save layout density preference:', error);
      Alert.alert('Update failed', 'Could not update Layout Density preference.');
    }
  }, [setItem, theme, updatePrefs]);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Appearance',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Appearance</Text>
        <Text style={styles.subheader}>Customize the look and feel of the app to your preference.</Text>
        {getPrefs.isLoading && (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator color="#16A34A" />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.sectionSubtitle}>Select the theme for the application.</Text>
          
          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={() => handleThemeSelect(theme.id)}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <Text style={styles.sectionSubtitle}>Adjust settings to improve your viewing experience.</Text>
          
          <View style={styles.accessibilityCard}>
            <View style={styles.accessibilityRow}>
              <View style={styles.accessibilityInfo}>
                <View style={styles.accessibilityIconContainer}>
                  <Type size={20} color="#16A34A" />
                </View>
                <View style={styles.accessibilityTextContainer}>
                  <Text style={styles.accessibilityTitle}>High Contrast Mode</Text>
                  <Text style={styles.accessibilitySubtitle}>Increase color contrast for better readability.</Text>
                </View>
              </View>
              <Switch
                value={highContrastMode}
                onValueChange={handleHighContrastToggle}
                trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
                thumbColor={highContrastMode ? '#fff' : '#fff'}
              />
            </View>
            
            <View style={[styles.accessibilityRow, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}>
              <View style={styles.accessibilityInfo}>
                <View style={styles.accessibilityIconContainer}>
                  <Wifi size={20} color="#16A34A" />
                </View>
                <View style={styles.accessibilityTextContainer}>
                  <Text style={styles.accessibilityTitle}>Low Data Mode</Text>
                  <Text style={styles.accessibilitySubtitle}>Reduce data usage by limiting auto-loading content.</Text>
                </View>
              </View>
              <Switch
                value={lowDataMode}
                onValueChange={handleLowDataModeToggle}
                trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
                thumbColor={lowDataMode ? '#fff' : '#fff'}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <OptionRow
            title="Font Size"
            options={FONT_SIZE_OPTIONS}
            selectedValue={fontSize}
            onSelect={handleFontSizeSelect}
          />
        </View>
        
        <View style={styles.section}>
          <OptionRow
            title="Layout Density"
            options={LAYOUT_DENSITY_OPTIONS}
            selectedValue={layoutDensity}
            onSelect={handleLayoutDensitySelect}
          />
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  themeCardSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
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
    color: '#111827',
  },
  themeNameSelected: {
    color: '#fff',
  },
  accessibilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
  },
  accessibilitySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  optionSection: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#16A34A',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionButtonTextSelected: {
    color: '#16A34A',
  },
});