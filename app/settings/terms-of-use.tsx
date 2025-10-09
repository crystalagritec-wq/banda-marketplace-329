import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsOfUseScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Terms of Use',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Banda Terms of Use</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using Banda ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Banda is a comprehensive agricultural marketplace platform that connects buyers, sellers, service providers, and logistics providers. The Platform facilitates:
          </Text>
          <Text style={styles.bulletPoint}>• Product listings and sales</Text>
          <Text style={styles.bulletPoint}>• Service provider bookings</Text>
          <Text style={styles.bulletPoint}>• Delivery and logistics coordination</Text>
          <Text style={styles.bulletPoint}>• Secure payment processing through AgriPay</Text>
          <Text style={styles.bulletPoint}>• Dispute resolution through TradeGuard</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To access certain features of the Platform, you must register for an account. You agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate, current, and complete information</Text>
          <Text style={styles.bulletPoint}>• Maintain the security of your password</Text>
          <Text style={styles.bulletPoint}>• Accept responsibility for all activities under your account</Text>
          <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized use</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to use the Platform to:
          </Text>
          <Text style={styles.bulletPoint}>• Post false, inaccurate, misleading, or fraudulent content</Text>
          <Text style={styles.bulletPoint}>• Violate any laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Infringe on intellectual property rights</Text>
          <Text style={styles.bulletPoint}>• Transmit viruses or malicious code</Text>
          <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
          <Text style={styles.bulletPoint}>• Engage in price manipulation or unfair practices</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Verification and Tiers</Text>
          <Text style={styles.paragraph}>
            Banda operates a tiered verification system:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Unverified:</Text> Limited access (1 listing)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Verified:</Text> Standard access (50 listings)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Premium:</Text> Enhanced features (200 listings)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Gold:</Text> Advanced tools (500 listings)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Elite:</Text> Unlimited access</Text>
          <Text style={styles.paragraph}>
            Verification may require submission of identification documents and business registration details.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Content Ownership</Text>
          <Text style={styles.paragraph}>
            You retain ownership of content you post on the Platform. By posting content, you grant Banda a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of operating and promoting the Platform.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Prohibited Items</Text>
          <Text style={styles.paragraph}>
            The following items are strictly prohibited on the Platform:
          </Text>
          <Text style={styles.bulletPoint}>• Illegal drugs or controlled substances</Text>
          <Text style={styles.bulletPoint}>• Weapons and explosives</Text>
          <Text style={styles.bulletPoint}>• Stolen goods</Text>
          <Text style={styles.bulletPoint}>• Counterfeit products</Text>
          <Text style={styles.bulletPoint}>• Endangered species or protected wildlife</Text>
          <Text style={styles.bulletPoint}>• Hazardous materials without proper licensing</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Fees and Payments</Text>
          <Text style={styles.paragraph}>
            Banda may charge fees for certain services, including:
          </Text>
          <Text style={styles.bulletPoint}>• Transaction fees on sales</Text>
          <Text style={styles.bulletPoint}>• Subscription fees for premium tiers</Text>
          <Text style={styles.bulletPoint}>• Boost and promotion fees</Text>
          <Text style={styles.bulletPoint}>• Verification fees</Text>
          <Text style={styles.paragraph}>
            All fees will be clearly disclosed before you incur them.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account at any time for:
          </Text>
          <Text style={styles.bulletPoint}>• Violation of these Terms</Text>
          <Text style={styles.bulletPoint}>• Fraudulent activity</Text>
          <Text style={styles.bulletPoint}>• Repeated customer complaints</Text>
          <Text style={styles.bulletPoint}>• Non-payment of fees</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            Banda is a platform that connects users. We are not responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Quality, safety, or legality of items listed</Text>
          <Text style={styles.bulletPoint}>• Accuracy of listings or user content</Text>
          <Text style={styles.bulletPoint}>• Ability of sellers to complete transactions</Text>
          <Text style={styles.bulletPoint}>• Ability of buyers to pay for items</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, Banda shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            Disputes between users should first be resolved through our TradeGuard system. If unresolved, disputes will be subject to arbitration under Kenyan law.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the Platform after changes constitutes acceptance of the new Terms.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.bulletPoint}>Email: legal@banda.co.ke</Text>
          <Text style={styles.bulletPoint}>Phone: +254 700 000 000</Text>
          <Text style={styles.bulletPoint}>Address: Nairobi, Kenya</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Banda, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
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
