import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useStorage } from '@/providers/storage-provider';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
];

function LanguageOption({ language, isSelected, onSelect }: { 
  language: Language; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  return (
    <TouchableOpacity 
      style={[styles.languageOption, isSelected && styles.languageOptionSelected]} 
      onPress={onSelect}
    >
      <View style={styles.languageInfo}>
        <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
          {language.name}
        </Text>
        {language.nativeName !== language.name && (
          <Text style={[styles.languageNative, isSelected && styles.languageNativeSelected]}>
            {language.nativeName}
          </Text>
        )}
      </View>
      
      <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
}

export default function LanguageScreen() {
  const router = useRouter();
  const { getItem, setItem } = useStorage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  
  const handleLanguageSelect = useCallback(async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      await setItem('settings_language', languageCode);
      console.log('Language preference saved:', languageCode);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, [setItem]);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Language',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Language</Text>
        <Text style={styles.subheader}>Choose your preferred language for the app.</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Language</Text>
          <Text style={styles.sectionSubtitle}>
            Your experience will be updated to reflect your selection. Currently showing languages available in Kenya.
          </Text>
          
          <View style={styles.languageList}>
            {AVAILABLE_LANGUAGES.map((language) => (
              <LanguageOption
                key={language.code}
                language={language}
                isSelected={selectedLanguage === language.code}
                onSelect={() => handleLanguageSelect(language.code)}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.featureNotice}>
          <View style={styles.featureNoticeHeader}>
            <Info size={20} color="#3B82F6" />
            <Text style={styles.featureNoticeTitle}>Feature in Development</Text>
          </View>
          <Text style={styles.featureNoticeText}>
            Full app translation is coming soon. While you can select a language, the content will remain in English for now.
          </Text>
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
    marginBottom: 24,
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
  languageList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  languageNameSelected: {
    color: '#16A34A',
  },
  languageNative: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  languageNativeSelected: {
    color: '#16A34A',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#16A34A',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  featureNotice: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  featureNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 8,
  },
  featureNoticeText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});