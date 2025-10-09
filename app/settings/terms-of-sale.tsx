import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsOfSaleScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Terms of Sale',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Banda Terms of Sale</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Marketplace Overview</Text>
          <Text style={styles.paragraph}>
            Banda operates as a marketplace platform connecting buyers and sellers of agricultural products, services, and logistics. These Terms of Sale govern all transactions conducted through the Platform.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Seller Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a seller on Banda, you agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate product descriptions and images</Text>
          <Text style={styles.bulletPoint}>• Honor the prices listed at the time of purchase</Text>
          <Text style={styles.bulletPoint}>• Maintain adequate stock levels</Text>
          <Text style={styles.bulletPoint}>• Ship items within the stated timeframe</Text>
          <Text style={styles.bulletPoint}>• Package items securely to prevent damage</Text>
          <Text style={styles.bulletPoint}>• Respond to buyer inquiries within 24 hours</Text>
          <Text style={styles.bulletPoint}>• Comply with all applicable laws and regulations</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Buyer Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a buyer on Banda, you agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate delivery information</Text>
          <Text style={styles.bulletPoint}>• Complete payment for confirmed orders</Text>
          <Text style={styles.bulletPoint}>• Be available to receive deliveries</Text>
          <Text style={styles.bulletPoint}>• Inspect items upon delivery</Text>
          <Text style={styles.bulletPoint}>• Report issues within 48 hours of delivery</Text>
          <Text style={styles.bulletPoint}>• Treat sellers and delivery personnel with respect</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Pricing and Payment</Text>
          <Text style={styles.paragraph}>
            All prices are listed in Kenyan Shillings (KES) unless otherwise stated. Prices include:
          </Text>
          <Text style={styles.bulletPoint}>• Product cost</Text>
          <Text style={styles.bulletPoint}>• Applicable taxes (where required)</Text>
          <Text style={styles.bulletPoint}>• Delivery fees (if applicable)</Text>
          <Text style={styles.paragraph}>
            Payment is processed through AgriPay, our secure payment system. Accepted payment methods include:
          </Text>
          <Text style={styles.bulletPoint}>• M-Pesa</Text>
          <Text style={styles.bulletPoint}>• AgriPay Wallet</Text>
          <Text style={styles.bulletPoint}>• Bank Transfer</Text>
          <Text style={styles.bulletPoint}>• Card Payment</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. TradeGuard Escrow System</Text>
          <Text style={styles.paragraph}>
            All transactions are protected by TradeGuard, our escrow system:
          </Text>
          <Text style={styles.bulletPoint}>• Payment is held securely until delivery is confirmed</Text>
          <Text style={styles.bulletPoint}>• Sellers receive payment after successful delivery</Text>
          <Text style={styles.bulletPoint}>• Buyers can raise disputes if items are not as described</Text>
          <Text style={styles.bulletPoint}>• Funds are released automatically after 7 days if no dispute is raised</Text>
          <Text style={styles.bulletPoint}>• Disputed funds are held until resolution</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Order Processing</Text>
          <Text style={styles.paragraph}>
            When you place an order:
          </Text>
          <Text style={styles.bulletPoint}>1. You receive an order confirmation</Text>
          <Text style={styles.bulletPoint}>2. Seller confirms availability within 24 hours</Text>
          <Text style={styles.bulletPoint}>3. Payment is processed and held in escrow</Text>
          <Text style={styles.bulletPoint}>4. Seller prepares and ships the item</Text>
          <Text style={styles.bulletPoint}>5. You receive tracking information</Text>
          <Text style={styles.bulletPoint}>6. Delivery is completed and verified via QR code</Text>
          <Text style={styles.bulletPoint}>7. Payment is released to seller</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Delivery and Shipping</Text>
          <Text style={styles.paragraph}>
            Delivery options include:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Standard Delivery:</Text> 3-7 business days</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Express Delivery:</Text> 1-2 business days</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Same-Day Delivery:</Text> Available in select areas</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Pickup:</Text> Collect from seller location</Text>
          <Text style={styles.paragraph}>
            Delivery fees are calculated based on distance, weight, and delivery speed. Pooled delivery options may be available for reduced costs.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Returns and Refunds</Text>
          <Text style={styles.paragraph}>
            Returns are accepted under the following conditions:
          </Text>
          <Text style={styles.bulletPoint}>• Item is significantly different from description</Text>
          <Text style={styles.bulletPoint}>• Item is damaged or defective</Text>
          <Text style={styles.bulletPoint}>• Wrong item was delivered</Text>
          <Text style={styles.bulletPoint}>• Item is expired (for perishables)</Text>
          <Text style={styles.paragraph}>
            To request a return:
          </Text>
          <Text style={styles.bulletPoint}>1. Contact seller within 48 hours of delivery</Text>
          <Text style={styles.bulletPoint}>2. Provide photos and description of the issue</Text>
          <Text style={styles.bulletPoint}>3. Wait for seller response (24 hours)</Text>
          <Text style={styles.bulletPoint}>4. If unresolved, raise a dispute through TradeGuard</Text>
          <Text style={styles.paragraph}>
            Refunds are processed within 5-7 business days after approval.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Quality Standards</Text>
          <Text style={styles.paragraph}>
            All products must meet the following standards:
          </Text>
          <Text style={styles.bulletPoint}>• Fresh and in good condition (for perishables)</Text>
          <Text style={styles.bulletPoint}>• Match the description and images provided</Text>
          <Text style={styles.bulletPoint}>• Be properly packaged and labeled</Text>
          <Text style={styles.bulletPoint}>• Comply with food safety regulations (for consumables)</Text>
          <Text style={styles.bulletPoint}>• Include necessary certifications (where applicable)</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Prohibited Practices</Text>
          <Text style={styles.paragraph}>
            The following practices are strictly prohibited:
          </Text>
          <Text style={styles.bulletPoint}>• Price manipulation or artificial inflation</Text>
          <Text style={styles.bulletPoint}>• Fake reviews or ratings</Text>
          <Text style={styles.bulletPoint}>• Bait-and-switch tactics</Text>
          <Text style={styles.bulletPoint}>• Selling counterfeit or expired products</Text>
          <Text style={styles.bulletPoint}>• Requesting payment outside the platform</Text>
          <Text style={styles.bulletPoint}>• Harassment or discrimination</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            If a dispute arises:
          </Text>
          <Text style={styles.bulletPoint}>1. Contact the other party directly through chat</Text>
          <Text style={styles.bulletPoint}>2. If unresolved, raise a formal dispute in TradeGuard</Text>
          <Text style={styles.bulletPoint}>3. Provide evidence (photos, messages, receipts)</Text>
          <Text style={styles.bulletPoint}>4. Banda mediates and makes a decision within 5 business days</Text>
          <Text style={styles.bulletPoint}>5. Decision is final and binding</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Seller Fees</Text>
          <Text style={styles.paragraph}>
            Banda charges the following fees to sellers:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Transaction Fee:</Text> 3% of sale price</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Payment Processing:</Text> 1.5% (M-Pesa/Card)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Boost Fee:</Text> Variable (optional)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Premium Tier:</Text> Monthly subscription (optional)</Text>
          <Text style={styles.paragraph}>
            Fees are automatically deducted from the sale amount before payout.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Cancellations</Text>
          <Text style={styles.paragraph}>
            Orders can be cancelled:
          </Text>
          <Text style={styles.bulletPoint}>• By buyer: Before seller confirms shipment (full refund)</Text>
          <Text style={styles.bulletPoint}>• By seller: If item is unavailable (full refund to buyer)</Text>
          <Text style={styles.bulletPoint}>• By Banda: For policy violations (case-by-case basis)</Text>
          <Text style={styles.paragraph}>
            Repeated cancellations may result in account restrictions.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Ratings and Reviews</Text>
          <Text style={styles.paragraph}>
            After each transaction, both parties can leave ratings and reviews. Reviews must:
          </Text>
          <Text style={styles.bulletPoint}>• Be honest and based on actual experience</Text>
          <Text style={styles.bulletPoint}>• Not contain offensive language</Text>
          <Text style={styles.bulletPoint}>• Not include personal information</Text>
          <Text style={styles.bulletPoint}>• Not be used for blackmail or threats</Text>
          <Text style={styles.paragraph}>
            Banda reserves the right to remove reviews that violate these guidelines.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Liability</Text>
          <Text style={styles.paragraph}>
            Banda acts as a marketplace platform and is not responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Quality or condition of products sold</Text>
          <Text style={styles.bulletPoint}>• Actions or omissions of sellers or buyers</Text>
          <Text style={styles.bulletPoint}>• Delivery delays due to external factors</Text>
          <Text style={styles.bulletPoint}>• Loss or damage during shipping (covered by insurance)</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. Contact for Sales Issues</Text>
          <Text style={styles.paragraph}>
            For questions or issues related to sales:
          </Text>
          <Text style={styles.bulletPoint}>Email: sales@banda.co.ke</Text>
          <Text style={styles.bulletPoint}>Phone: +254 700 000 001</Text>
          <Text style={styles.bulletPoint}>In-App: Customer Care Chat</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By making a purchase or listing an item on Banda, you acknowledge that you have read, understood, and agree to these Terms of Sale.
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
