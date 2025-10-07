import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { useStorage } from '@/providers/storage-provider';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colorScheme: Exclude<ColorSchemeName, 'no-preference'> | 'light' | 'dark';
  highContrast: boolean;
  lowDataMode: boolean;
  fontSize: 'small' | 'default' | 'large';
  layoutDensity: 'compact' | 'default' | 'comfortable';
  colors: {
    background: string;
    card: string;
    text: string;
    mutedText: string;
    primary: string;
    accent: string;
    border: string;
  };
  scaleFont: (size: number) => number;
  setMode: (mode: ThemeMode) => Promise<void>;
  setHighContrast: (b: boolean) => Promise<void>;
  setLowDataMode: (b: boolean) => Promise<void>;
  setFontSize: (s: 'small' | 'default' | 'large') => Promise<void>;
  setLayoutDensity: (d: 'compact' | 'default' | 'comfortable') => Promise<void>;
}

const lightColors = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  mutedText: '#6B7280',
  primary: '#2D5016',
  accent: '#10B981',
  border: '#E5E7EB',
};

const darkColors = {
  background: '#0B0F0E',
  card: '#111418',
  text: '#F3F4F6',
  mutedText: '#9CA3AF',
  primary: '#34D399',
  accent: '#8B5CF6',
  border: '#1F2937',
};

export const [ThemeProvider, useTheme] = createContextHook<Theme>(() => {
  const storage = useStorage();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [lowDataMode, setLowDataModeState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<'small' | 'default' | 'large'>('default');
  const [layoutDensity, setLayoutDensityState] = useState<'compact' | 'default' | 'comfortable'>('default');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(() => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'));

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const m = (await storage.getItem('settings_theme')) as ThemeMode | null;
        const hc = await storage.getItem('settings_high_contrast');
        const ldm = await storage.getItem('settings_low_data_mode');
        const fs = (await storage.getItem('settings_font_size')) as 'small' | 'default' | 'large' | null;
        const ld = (await storage.getItem('settings_layout_density')) as 'compact' | 'default' | 'comfortable' | null;
        if (m === 'light' || m === 'dark' || m === 'system') setModeState(m);
        if (hc != null) setHighContrastState(hc === '1');
        if (ldm != null) setLowDataModeState(ldm === '1');
        if (fs) setFontSizeState(fs);
        if (ld) setLayoutDensityState(ld);
      } catch (e) {
        console.log('[ThemeProvider] load settings error', e);
      }
    };
    load();
  }, [storage]);

  const colorScheme: 'light' | 'dark' = useMemo(() => {
    const scheme = mode === 'system' ? systemScheme : mode;
    return scheme === 'dark' ? 'dark' : 'light';
  }, [mode, systemScheme]);

  const colors = useMemo(() => {
    const base = colorScheme === 'dark' ? darkColors : lightColors;
    if (!highContrast) return base;
    return {
      ...base,
      text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
      mutedText: colorScheme === 'dark' ? '#D1D5DB' : '#111827',
      border: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    };
  }, [colorScheme, highContrast]);

  const scaleFont = useCallback(
    (size: number) => {
      const factor = fontSize === 'small' ? 0.9 : fontSize === 'large' ? 1.15 : 1.0;
      return Math.round(size * factor);
    },
    [fontSize]
  );

  const setMode = useCallback(async (m: ThemeMode) => {
    setModeState(m);
    try {
      await storage.setItem('settings_theme', m);
    } catch (e) {
      console.log('[ThemeProvider] setMode error', e);
    }
  }, [storage]);

  const setHighContrast = useCallback(async (b: boolean) => {
    setHighContrastState(b);
    try {
      await storage.setItem('settings_high_contrast', b ? '1' : '0');
    } catch (e) {
      console.log('[ThemeProvider] setHighContrast error', e);
    }
  }, [storage]);

  const setLowDataMode = useCallback(async (b: boolean) => {
    setLowDataModeState(b);
    try {
      await storage.setItem('settings_low_data_mode', b ? '1' : '0');
    } catch (e) {
      console.log('[ThemeProvider] setLowDataMode error', e);
    }
  }, [storage]);

  const setFontSize = useCallback(async (s: 'small' | 'default' | 'large') => {
    setFontSizeState(s);
    try {
      await storage.setItem('settings_font_size', s);
    } catch (e) {
      console.log('[ThemeProvider] setFontSize error', e);
    }
  }, [storage]);

  const setLayoutDensity = useCallback(async (d: 'compact' | 'default' | 'comfortable') => {
    setLayoutDensityState(d);
    try {
      await storage.setItem('settings_layout_density', d);
    } catch (e) {
      console.log('[ThemeProvider] setLayoutDensity error', e);
    }
  }, [storage]);

  return useMemo<Theme>(() => ({
    mode,
    colorScheme,
    highContrast,
    lowDataMode,
    fontSize,
    layoutDensity,
    colors,
    scaleFont,
    setMode,
    setHighContrast,
    setLowDataMode,
    setFontSize,
    setLayoutDensity,
  }), [mode, colorScheme, highContrast, lowDataMode, fontSize, layoutDensity, colors, scaleFont, setMode, setHighContrast, setLowDataMode, setFontSize, setLayoutDensity]);
});
