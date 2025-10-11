import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { useLocation } from '@/providers/location-provider';
import { trpc } from '@/lib/trpc';
import { TrendingUp, Users, Package, DollarSign, CheckCircle } from 'lucide-react-native';

export default function ShopTutorialScreen() {
  const insets = useSafeAreaInsets();
  const { completeRole, markOnboardingComplete, state } = useOnboarding();
  const { userLocation } = useLocation();
  const [readCards, setReadCards] = useState<Set<number>>(new Set());
  const [isActivating, setIsActivating] = useState(false);
  
  const createProductMutation = trpc.shop.createProduct.useMutation();
  const completeOnboardingMutation = trpc.shop.completeOnboarding.useMutation();

  const progress = useMemo(() => {
    const baseProgress = 75;
    const stepWeight = 25;
    const totalCards = 4;
    const cardProgress = (readCards.size / totalCards) * stepWeight;
    return Math.round(baseProgress + cardProgress);
  }, [readCards]);

  const handleCardPress = (cardIndex: number) => {
    setReadCards(prev => new Set([...prev, cardIndex]));
  };

  const handleComplete = async () => {
    setIsActivating(true);
    
    try {
      console.log('[Onboarding] Syncing shop data to database...');
      
      if (!userLocation) {
        Alert.alert('Location Required', 'Please set your location before completing setup');
        setIsActivating(false);
        return;
      }
      
      console.log('[Onboarding] Completing shop onboarding...');
      const onboardingResult = await completeOnboardingMutation.mutateAsync({
        shopName: state.shopData.name,
        category: state.shopData.category,
        contact: state.shopData.contact,
        productsCount: state.shopData.products,
        location: userLocation,
      });
      
      if (!onboardingResult.success) {
        throw new Error(onboardingResult.message || 'Failed to complete onboarding');
      }
      
      console.log('[Onboarding] Shop profile created successfully');
      
      if (state.shopData.products > 0) {
        console.log(`[Onboarding] Creating ${state.shopData.products} sample products...`);
        
        const sampleProducts = [
          {
            title: `${state.shopData.category} Product 1`,
            category: state.shopData.category || 'Other',
            description: 'Quality product from my shop',
            price: 1000,
            stock: 10,
            unit: 'unit',
          },
          {
            title: `${state.shopData.category} Product 2`,
            category: state.shopData.category || 'Other',
            description: 'Premium quality product',
            price: 1500,
            stock: 5,
            unit: 'unit',
          },
        ];
        
        for (const product of sampleProducts.slice(0, state.shopData.products)) {
          try {
            await createProductMutation.mutateAsync({
              ...product,
              negotiable: false,
              images: [],
              location: userLocation,
              isDraft: false,
            });
            console.log('[Onboarding] Product created:', product.title);
          } catch (error) {
            console.error('[Onboarding] Failed to create product:', error);
          }
        }
      }
      
      completeRole('shop');
      markOnboardingComplete();
      
      console.log('[Onboarding] Shop activation complete');
      router.replace('/shop-dashboard' as any);
    } catch (error: any) {
      console.error('[Onboarding] Activation error:', error);
      Alert.alert('Error', error.message || 'Failed to activate shop. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <CheckCircle size={48} color="#10B981" />
          </View>
          <Text style={styles.title}>Your Shop is Live! 🎉</Text>
          <Text style={styles.subtitle}>Here is what you can do next</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4 • {progress}%</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.card} onPress={() => handleCardPress(0)} activeOpacity={0.7}>
            <View style={styles.cardIcon}>
              <TrendingUp size={24} color="#10B981" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Track Sales</Text>
              <Text style={styles.cardText}>
                Monitor your sales, visits, and top products in real-time
              </Text>
            </View>
            {readCards.has(0) && <CheckCircle size={20} color="#10B981" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleCardPress(1)} activeOpacity={0.7}>
            <View style={styles.cardIcon}>
              <Users size={24} color="#3B82F6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Reach Customers</Text>
              <Text style={styles.cardText}>
                Your shop is now visible to thousands of buyers across Kenya
              </Text>
            </View>
            {readCards.has(1) && <CheckCircle size={20} color="#10B981" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleCardPress(2)} activeOpacity={0.7}>
            <View style={styles.cardIcon}>
              <Package size={24} color="#F59E0B" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manage Inventory</Text>
              <Text style={styles.cardText}>
                Update stock levels and add new products anytime
              </Text>
            </View>
            {readCards.has(2) && <CheckCircle size={20} color="#10B981" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleCardPress(3)} activeOpacity={0.7}>
            <View style={styles.cardIcon}>
              <DollarSign size={24} color="#8B5CF6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Get Paid Fast</Text>
              <Text style={styles.cardText}>
                Receive payments instantly after delivery confirmation
              </Text>
            </View>
            {readCards.has(3) && <CheckCircle size={20} color="#10B981" />}
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>✅ Shop Setup Complete</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, isActivating && styles.buttonDisabled]} 
          onPress={handleComplete}
          disabled={isActivating}
        >
          {isActivating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          )}
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
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
