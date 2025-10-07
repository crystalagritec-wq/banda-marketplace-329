import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I sell my products on ShambaConnect?',
    answer: 'To sell products on ShambaConnect, go to the "Sell" tab, tap the "+" button, and fill in your product details including photos, description, price, and location. Once submitted, your listing will be reviewed and published within 24 hours.',
  },
  {
    id: '2',
    question: 'What is the verification process?',
    answer: 'Our verification process ensures all sellers are legitimate farmers or agricultural businesses. You\'ll need to provide identification, proof of farming activities, and location verification. This typically takes 2-3 business days to complete.',
  },
  {
    id: '3',
    question: 'How does logistics and delivery work?',
    answer: 'ShambaConnect partners with local logistics providers to ensure fresh produce reaches buyers quickly. Delivery options include same-day delivery within Nairobi, next-day delivery to major towns, and scheduled pickups for bulk orders.',
  },
  {
    id: '4',
    question: 'Can I offer services like farm labor or equipment rental?',
    answer: 'Yes! ShambaConnect supports service listings including farm labor, equipment rental, land preparation, and agricultural consulting. Simply select "Service" when creating your listing and provide detailed information about what you offer.',
  },
  {
    id: '5',
    question: 'How does the Community Q&A work?',
    answer: 'The Community Q&A is a space where farmers can ask questions, share knowledge, and get advice from experienced agricultural professionals. You can post questions, answer others\' queries, and build your reputation in the farming community.',
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqHeader} 
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6B7280" />
        ) : (
          <ChevronDown size={20} color="#6B7280" />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpSupportScreen() {
  const router = useRouter();
  
  const handleContactSupport = useCallback(() => {
    console.log('Opening contact support...');
    // In a real app, this would open a chat interface or contact form
  }, []);
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Help & Support',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Help & Support</Text>
        <Text style={styles.subheader}>
          Find quick answers to common questions about our platform and services.
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Can't find the answer you're looking for? Feel free to contact our support team.
          </Text>
          
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item) => (
              <FAQAccordion key={item.id} item={item} />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Still Need Help?</Text>
          <Text style={styles.sectionSubtitle}>
            Our support team is ready to assist you. Chat with our AI assistant for instant answers or contact us directly.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
              <MessageCircle size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.feedbackButton} 
              onPress={() => router.push('/settings/feedback')}
            >
              <Send size={20} color="#16A34A" />
              <Text style={styles.feedbackButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
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
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
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
  faqList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackButtonText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '600',
  },
});