import { useCallback, useEffect, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useStorage } from '@/providers/storage-provider';
import { en, TranslationKeys } from '@/constants/translations/en';
import { sw } from '@/constants/translations/sw';

export type SupportedLanguage = 'en' | 'sw';

export interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string) => string;
  translations: TranslationKeys;
  isRTL: boolean;
}

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en,
  sw,
};

const languageNames: Record<SupportedLanguage, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili' },
};

export const getLanguageName = (code: SupportedLanguage) => languageNames[code];

export const [I18nProvider, useI18n] = createContextHook<I18nContextValue>(() => {
  const storage = useStorage();
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await storage.getItem('settings_language');
        if (savedLanguage === 'en' || savedLanguage === 'sw') {
          setLanguageState(savedLanguage);
          console.log('[I18n] Loaded language:', savedLanguage);
        }
      } catch (error) {
        console.error('[I18n] Failed to load language:', error);
      }
    };
    loadLanguage();
  }, [storage]);

  const setLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      try {
        setLanguageState(lang);
        await storage.setItem('settings_language', lang);
        console.log('[I18n] Language changed to:', lang);
      } catch (error) {
        console.error('[I18n] Failed to save language:', error);
      }
    },
    [storage]
  );

  const t = useCallback(
    (key: string): string => {
      try {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            console.warn(`[I18n] Translation key not found: ${key}, falling back to English`);
            let fallbackValue: any = translations['en'];
            for (const fk of keys) {
              if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
                fallbackValue = fallbackValue[fk];
              } else {
                console.error(`[I18n] Translation key not found in fallback: ${key}`);
                return key.split('.').pop() || key;
              }
            }
            if (typeof fallbackValue === 'string') {
              return fallbackValue;
            }
            return key.split('.').pop() || key;
          }
        }

        if (typeof value === 'string') {
          return value;
        }

        console.warn(`[I18n] Translation value is not a string: ${key}`);
        return key.split('.').pop() || key;
      } catch (error) {
        console.error(`[I18n] Error translating key: ${key}`, error);
        return key.split('.').pop() || key;
      }
    },
    [language]
  );

  const isRTL = useMemo(() => {
    return false;
  }, []);

  return useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      translations: translations[language],
      isRTL,
    }),
    [language, setLanguage, t, isRTL]
  );
});
