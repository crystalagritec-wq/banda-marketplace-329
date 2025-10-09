import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Privacy Policy',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Banda Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Banda is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our agricultural marketplace platform.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Account Information:</Text> Name, email, phone number, password</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Profile Information:</Text> Photo, bio, location, business details</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Verification Documents:</Text> ID cards, business registration, tax certificates</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Payment Information:</Text> M-Pesa number, bank account details</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Transaction Data:</Text> Purchase history, sales records, payment details</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Communication Data:</Text> Messages, reviews, support tickets</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Location Data:</Text> GPS coordinates, delivery addresses</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Device Information:</Text> Device type, OS version, unique identifiers</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Usage Data:</Text> Pages viewed, features used, search queries</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:
          </Text>
          <Text style={styles.bulletPoint}>• Create and manage your account</Text>
          <Text style={styles.bulletPoint}>• Process transactions and payments</Text>
          <Text style={styles.bulletPoint}>• Facilitate communication between users</Text>
          <Text style={styles.bulletPoint}>• Verify your identity and prevent fraud</Text>
          <Text style={styles.bulletPoint}>• Provide customer support</Text>
          <Text style={styles.bulletPoint}>• Send notifications about orders and account activity</Text>
          <Text style={styles.bulletPoint}>• Improve our services and develop new features</Text>
          <Text style={styles.bulletPoint}>• Personalize your experience</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• Resolve disputes and enforce our policies</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>With Other Users:</Text> Profile information, ratings, reviews</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>With Service Providers:</Text> Payment processors, delivery partners, cloud hosting</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>For Legal Reasons:</Text> Law enforcement, court orders, legal proceedings</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Business Transfers:</Text> Mergers, acquisitions, asset sales</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>With Your Consent:</Text> When you explicitly agree to share information</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information to third parties.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement security measures to protect your information:
          </Text>
          <Text style={styles.bulletPoint}>• End-to-end encryption for sensitive data</Text>
          <Text style={styles.bulletPoint}>• Secure socket layer (SSL) technology</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and penetration testing</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication</Text>
          <Text style={styles.bulletPoint}>• Secure data centers with physical security</Text>
          <Text style={styles.bulletPoint}>• Employee training on data protection</Text>
          <Text style={styles.paragraph}>
            However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as necessary to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide our services</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• Resolve disputes</Text>
          <Text style={styles.bulletPoint}>• Enforce our agreements</Text>
          <Text style={styles.paragraph}>
            When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it by law.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Your Privacy Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Access:</Text> Request a copy of your personal data</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Correction:</Text> Update or correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Deletion:</Text> Request deletion of your account and data</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Portability:</Text> Receive your data in a structured format</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Objection:</Text> Object to certain data processing activities</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Restriction:</Text> Request limitation of data processing</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Withdraw Consent:</Text> Revoke previously given consent</Text>
          <Text style={styles.paragraph}>
            To exercise these rights, contact us at privacy@banda.co.ke
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Location Data</Text>
          <Text style={styles.paragraph}>
            We collect location data to:
          </Text>
          <Text style={styles.bulletPoint}>• Show nearby products and services</Text>
          <Text style={styles.bulletPoint}>• Calculate delivery fees and routes</Text>
          <Text style={styles.bulletPoint}>• Enable real-time delivery tracking</Text>
          <Text style={styles.bulletPoint}>• Provide location-based recommendations</Text>
          <Text style={styles.paragraph}>
            You can control location permissions in your device settings. Disabling location may limit certain features.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar technologies to:
          </Text>
          <Text style={styles.bulletPoint}>• Remember your preferences</Text>
          <Text style={styles.bulletPoint}>• Analyze usage patterns</Text>
          <Text style={styles.bulletPoint}>• Improve platform performance</Text>
          <Text style={styles.bulletPoint}>• Provide personalized content</Text>
          <Text style={styles.paragraph}>
            You can control cookies through your browser settings.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            We integrate with third-party services:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Payment Processors:</Text> M-Pesa, Stripe, PayPal</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Analytics:</Text> Google Analytics, Mixpanel</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Cloud Services:</Text> AWS, Supabase</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Communication:</Text> Twilio, SendGrid</Text>
          <Text style={styles.paragraph}>
            These services have their own privacy policies. We encourage you to review them.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Children&apos;s Privacy</Text>
          <Text style={styles.paragraph}>
            Banda is not intended for users under 18 years of age. We do not knowingly collect information from children. If we discover that we have collected information from a child, we will delete it immediately.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than Kenya. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Marketing Communications</Text>
          <Text style={styles.paragraph}>
            We may send you promotional emails about:
          </Text>
          <Text style={styles.bulletPoint}>• New features and updates</Text>
          <Text style={styles.bulletPoint}>• Special offers and discounts</Text>
          <Text style={styles.bulletPoint}>• Tips and best practices</Text>
          <Text style={styles.bulletPoint}>• Community events</Text>
          <Text style={styles.paragraph}>
            You can opt out of marketing emails at any time by clicking the unsubscribe link or updating your notification preferences.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Data Breach Notification</Text>
          <Text style={styles.paragraph}>
            In the event of a data breach that affects your personal information, we will notify you within 72 hours via email and in-app notification, along with steps you can take to protect yourself.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or prominent notice on the Platform. Your continued use after changes constitutes acceptance of the updated policy.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. Contact Us</Text>
          <Text style={styles.paragraph}>
            For privacy-related questions or concerns:
          </Text>
          <Text style={styles.bulletPoint}>Email: privacy@banda.co.ke</Text>
          <Text style={styles.bulletPoint}>Phone: +254 700 000 002</Text>
          <Text style={styles.bulletPoint}>Address: Data Protection Officer, Banda, Nairobi, Kenya</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>17. Regulatory Compliance</Text>
          <Text style={styles.paragraph}>
            Banda complies with:
          </Text>
          <Text style={styles.bulletPoint}>• Kenya Data Protection Act, 2019</Text>
          <Text style={styles.bulletPoint}>• GDPR (for EU users)</Text>
          <Text style={styles.bulletPoint}>• Industry best practices for data protection</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Banda, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  lastUpdated: {
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
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginLeft: 12,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  footerText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '600',
  },
});
