import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ArrowLeft, MapPin, Mail, Phone, Twitter, Facebook, Linkedin, Instagram, MessageCircle, HelpCircle } from 'lucide-react-native';

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface SocialLink {
  icon: React.ReactNode;
  name: string;
  onPress: () => void;
}

export default function ContactUsScreen() {
  const router = useRouter();
  
  const contactMethods: ContactMethod[] = [
    {
      icon: <MapPin size={24} color="#16A34A" />,
      title: 'Our Office',
      subtitle: '123 AgriBiz Plaza, Nairobi, Kenya',
      onPress: () => {
        const url = 'https://maps.google.com/?q=123+AgriBiz+Plaza,+Nairobi,+Kenya';
        Linking.openURL(url);
      }
    },
    {
      icon: <Mail size={24} color="#16A34A" />,
      title: 'Email Us',
      subtitle: 'support@shambaconnect.com',
      onPress: () => {
        Linking.openURL('mailto:support@shambaconnect.com');
      }
    },
    {
      icon: <Phone size={24} color="#16A34A" />,
      title: 'Call Us',
      subtitle: '+254 705 256 259',
      onPress: () => {
        Linking.openURL('tel:+254705256259');
      }
    }
  ];
  
  const socialLinks: SocialLink[] = [
    {
      icon: <Twitter size={24} color="#6B7280" />,
      name: 'Twitter',
      onPress: () => Linking.openURL('https://twitter.com/shambaconnect')
    },
    {
      icon: <Facebook size={24} color="#6B7280" />,
      name: 'Facebook',
      onPress: () => Linking.openURL('https://facebook.com/shambaconnect')
    },
    {
      icon: <Linkedin size={24} color="#6B7280" />,
      name: 'LinkedIn',
      onPress: () => Linking.openURL('https://linkedin.com/company/shambaconnect')
    },
    {
      icon: <Instagram size={24} color="#6B7280" />,
      name: 'Instagram',
      onPress: () => Linking.openURL('https://instagram.com/shambaconnect')
    }
  ];
  
  const supportOptions = [
    {
      icon: <Phone size={20} color="#16A34A" />,
      title: 'Call for Support',
      onPress: () => Linking.openURL('tel:+254705256259')
    },
    {
      icon: <MessageCircle size={20} color="#25D366" />,
      title: 'Chat on WhatsApp',
      onPress: () => Linking.openURL('https://wa.me/254705256259')
    }
  ];
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Contact Us',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Contact Us</Text>
        
        {/* Contact Methods */}
        <View style={styles.section}>
          {contactMethods.map((method, index) => (
            <TouchableOpacity key={index} style={styles.contactItem} onPress={method.onPress}>
              <View style={styles.contactIcon}>
                {method.icon}
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity key={index} style={styles.socialButton} onPress={social.onPress}>
                {social.icon}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Need Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help Placing Order?</Text>
          <View style={styles.supportContainer}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.supportOption} onPress={option.onPress}>
                {option.icon}
                <Text style={styles.supportOptionText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.supportOption, styles.liveChatButton]} 
              onPress={() => {
                // Navigate to chat or open live chat
                console.log('Opening live chat...');
              }}
            >
              <MessageCircle size={20} color="#fff" />
              <Text style={[styles.supportOptionText, styles.liveChatText]}>Support Live Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Answers Fast?</Text>
          <Text style={styles.sectionSubtitle}>
            Check out our Help & Support page for frequently asked questions and guides.
          </Text>
          
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => router.push('/settings/help')}
          >
            <HelpCircle size={20} color="#6B7280" />
            <Text style={styles.helpButtonText}>Visit Help Center</Text>
          </TouchableOpacity>
        </View>
        
        {/* Feedback Link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Your Feedback</Text>
          <Text style={styles.sectionSubtitle}>
            Have suggestions or found a bug? We'd love to hear from you!
          </Text>
          
          <TouchableOpacity 
            style={styles.feedbackButton} 
            onPress={() => router.push('/settings/feedback')}
          >
            <MessageCircle size={20} color="#16A34A" />
            <Text style={styles.feedbackButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
        
        {/* Customer Care */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat with Customer Care</Text>
          <Text style={styles.sectionSubtitle}>
            Our digital assistant can answer questions about our platform or help you get in touch with our team.
          </Text>
          
          <TouchableOpacity 
            style={styles.customerCareButton} 
            onPress={() => router.push('/customer-care')}
            testID="customer-care-button"
          >
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.customerCareButtonText}>Start Chat with AI Assistant</Text>
          </TouchableOpacity>
        </View>
        
        {/* Database Status Check */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <Text style={styles.sectionSubtitle}>
            Check if all systems are working properly.
          </Text>
          
          <TouchableOpacity 
            style={styles.statusButton} 
            onPress={() => router.push('/database-setup')}
            testID="system-status-button"
          >
            <MessageCircle size={20} color="#16A34A" />
            <Text style={styles.statusButtonText}>Check System Status</Text>
          </TouchableOpacity>
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  supportOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  liveChatButton: {
    backgroundColor: '#F59E0B',
  },
  liveChatText: {
    color: '#fff',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16A34A',
  },
  customerCareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  customerCareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16A34A',
  },
});