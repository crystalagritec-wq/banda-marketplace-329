import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Check, Globe } from 'lucide-react-native';
import { useI18n, SupportedLanguage, getLanguageName } from '@/providers/i18n-provider';
import { useTheme } from '@/providers/theme-provider';

const AVAILABLE_LANGUAGES: SupportedLanguage[] = ['en', 'sw'];

function LanguageOption({ 
  languageCode, 
  isSelected, 
  onSelect,
  colors 
}: { 
  languageCode: SupportedLanguage; 
  isSelected: boolean; 
  onSelect: () => void;
  colors: any;
}) {
  const langInfo = getLanguageName(languageCode);
  
  return (
    <TouchableOpacity 
      style={[
        styles.languageOption, 
        { borderBottomColor: colors.border },
        isSelected && { backgroundColor: 'rgba(16,185,129,0.05)' }
      ]} 
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.languageInfo}>
        <Text style={[
          styles.languageName, 
          { color: isSelected ? '#16A34A' : colors.text }
        ]}>
          {langInfo.name}
        </Text>
        {langInfo.nativeName !== langInfo.name && (
          <Text style={[
            styles.languageNative, 
            { color: isSelected ? '#16A34A' : colors.mutedText }
          ]}>
            {langInfo.nativeName}
          </Text>
        )}
      </View>
      
      {isSelected && (
        <View style={styles.checkIcon}>
          <Check size={20} color="#16A34A" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function LanguageScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();
  const { colors } = useTheme();
  
  const handleLanguageSelect = useCallback(async (languageCode: SupportedLanguage) => {
    try {
      await setLanguage(languageCode);
      Alert.alert(
        t('settings.languageSettings.languageChanged'),
        t('success.updated'),
        [{ text: t('common.ok') }]
      );
      console.log('[Language] Language changed to:', languageCode);
    } catch (error) {
      console.error('[Language] Failed to change language:', error);
      Alert.alert(
        t('common.error'),
        t('errors.somethingWentWrong'),
        [{ text: t('common.ok') }]
      );
    }
  }, [setLanguage, t]);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: t('settings.language'),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.headerSection, { backgroundColor: colors.card }]}>
          <View style={styles.iconContainer}>
            <Globe size={32} color="#16A34A" />
          </View>
          <Text style={[styles.header, { color: colors.text }]}>
            {t('settings.languageSettings.title')}
          </Text>
          <Text style={[styles.subheader, { color: colors.mutedText }]}>
            {t('settings.languageSettings.selectLanguage')}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('settings.languageSettings.availableLanguages')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.mutedText }]}>
            {t('settings.languageSettings.translationNote')}
          </Text>
          
          <View style={[styles.languageList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {AVAILABLE_LANGUAGES.map((langCode) => (
              <LanguageOption
                key={langCode}
                languageCode={langCode}
                isSelected={language === langCode}
                onSelect={() => handleLanguageSelect(langCode)}
                colors={colors}
              />
            ))}
          </View>
        </View>
        
        <View style={[styles.currentLanguageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.currentLanguageLabel, { color: colors.mutedText }]}>
            {t('settings.languageSettings.currentLanguage')}
          </Text>
          <Text style={[styles.currentLanguageValue, { color: colors.text }]}>
            {getLanguageName(language).nativeName}
          </Text>
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
  headerSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  languageList: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageNative: {
    fontSize: 14,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 12,
  },
  currentLanguageCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  currentLanguageLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  currentLanguageValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});