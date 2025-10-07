import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, Store, Share2, TrendingUp, Package, DollarSign, Users } from 'lucide-react-native';

export default function ShopActivationScreen() {
  const insets = useSafeAreaInsets();

  const handleShareShop = async () => {
    try {
      await Share.share({
        message: 'Check out my shop on Banda! 🛒',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGoToDashboard = () => {
    router.replace('/shop-dashboard' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.celebrationContainer}>
          <View style={styles.iconContainer}>
            <CheckCircle size={64} color="#10B981" />
          </View>
          <Text style={styles.title}>Your Shop is Live! 🎉</Text>
          <Text style={styles.subtitle}>
            Congratulations! Your shop is now visible to thousands of buyers across Kenya
          </Text>
        </View>

        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Store size={24} color="#10B981" />
            <Text style={styles.badgeText}>Shop Active</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <TrendingUp size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Your Sales</Text>
              <Text style={styles.featureText}>
                Monitor sales, visits, and top products in real-time from your dashboard
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Package size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Manage Products</Text>
              <Text style={styles.featureText}>
                Add more products, update prices, and manage your inventory
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <DollarSign size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Get Paid Fast</Text>
              <Text style={styles.featureText}>
                Receive payments instantly after delivery confirmation via AgriPay
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Users size={24} color="#8B5CF6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Reach More Customers</Text>
              <Text style={styles.featureText}>
                Your products appear in Marketplace, Flash Sales, and Trending sections
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.shareContainer}>
          <Text style={styles.shareTitle}>Share Your Shop</Text>
          <Text style={styles.shareText}>
            Let your customers know you're on Banda
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareShop}>
            <Share2 size={20} color="#10B981" />
            <Text style={styles.shareButtonText}>Share on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGoToDashboard}>
          <Text style={styles.primaryButtonText}>Go to My Shop Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  shareContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  shareText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
