import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, FileText, ShoppingCart, Shield, ChevronRight } from 'lucide-react-native';

interface LegalDocument {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  onPress: () => void;
}

export default function LegalScreen() {
  const router = useRouter();
  
  const handleTermsOfUse = () => {
    router.push('/settings/terms-of-use');
  };
  
  const handleTermsOfSale = () => {
    router.push('/settings/terms-of-sale');
  };
  
  const handlePrivacyPolicy = () => {
    router.push('/settings/privacy-policy');
  };
  
  const legalDocuments: LegalDocument[] = [
    {
      id: 'terms-of-use',
      title: 'Terms of Use',
      subtitle: 'The rules for using our platform and services.',
      icon: FileText,
      onPress: handleTermsOfUse,
    },
    {
      id: 'terms-of-sale',
      title: 'Terms of Sale',
      subtitle: 'The terms governing purchases and sales on the marketplace.',
      icon: ShoppingCart,
      onPress: handleTermsOfSale,
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy and Agreement',
      subtitle: 'How we collect, use, and protect your data.',
      icon: Shield,
      onPress: handlePrivacyPolicy,
    },
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Legal Information',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Legal Information</Text>
        <Text style={styles.subheader}>Review our terms, policies, and legal documents.</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policies & Agreements</Text>
          <Text style={styles.sectionSubtitle}>
            Important documents governing your use of ShambaConnect.
          </Text>
          
          <View style={styles.documentList}>
            {legalDocuments.map((document) => (
              <TouchableOpacity
                key={document.id}
                style={styles.documentItem}
                onPress={document.onPress}
              >
                <View style={styles.documentLeft}>
                  <View style={styles.documentIconContainer}>
                    <document.icon size={20} color="#16A34A" />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{document.title}</Text>
                    <Text style={styles.documentSubtitle}>{document.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
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
  documentList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  documentSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});