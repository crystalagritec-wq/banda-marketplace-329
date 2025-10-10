import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => Promise<void>;
  fontScale: number;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_KEY = '@banda_font_size';

const fontScaleMap: Record<FontSize, number> = {
  'small': 0.85,
  'medium': 1.0,
  'large': 1.15,
  'extra-large': 1.3,
};

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [fontScale, setFontScale] = useState<number>(1.0);

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const stored = await AsyncStorage.getItem(FONT_SIZE_KEY);
      if (stored && (stored === 'small' || stored === 'medium' || stored === 'large' || stored === 'extra-large')) {
        setFontSizeState(stored as FontSize);
        setFontScale(fontScaleMap[stored as FontSize]);
      }
    } catch (error) {
      console.error('Failed to load font size:', error);
    }
  };

  const setFontSize = async (size: FontSize) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, size);
      setFontSizeState(size);
      setFontScale(fontScaleMap[size]);
    } catch (error) {
      console.error('Failed to save font size:', error);
      throw error;
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, fontScale }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return context;
}
