import { useI18n } from '@/providers/i18n-provider';

export function useTranslation() {
  const { t, language, setLanguage, translations } = useI18n();
  
  return {
    t,
    language,
    setLanguage,
    translations,
  };
}

export function formatTranslation(template: string, params: Record<string, string | number>): string {
  let result = template;
  
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  
  return result;
}
