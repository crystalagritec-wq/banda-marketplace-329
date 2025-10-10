import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { useI18n, SupportedLanguage, getLanguageName } from '@/providers/i18n-provider';
import { useTheme } from '@/providers/theme-provider';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  showIcon?: boolean;
}

export default function LanguageSwitcher({ variant = 'compact', showIcon = true }: LanguageSwitcherProps) {
  const { language, setLanguage } = useI18n();
  const { colors } = useTheme();

  const toggleLanguage = async () => {
    const newLang: SupportedLanguage = language === 'en' ? 'sw' : 'en';
    await setLanguage(newLang);
  };

  const currentLangInfo = getLanguageName(language);

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={toggleLanguage}
        activeOpacity={0.7}
      >
        {showIcon && <Globe size={16} color={colors.primary} />}
        <Text style={[styles.compactText, { color: colors.text }]}>
          {language.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.fullButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      {showIcon && (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Globe size={20} color={colors.primary} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.fullLabel, { color: colors.mutedText }]}>Language</Text>
        <Text style={[styles.fullValue, { color: colors.text }]}>
          {currentLangInfo.nativeName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  fullLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  fullValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});
