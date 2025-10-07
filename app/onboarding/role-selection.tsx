import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding, BusinessRole } from '@/providers/onboarding-provider';
import { Store, Wrench, Truck, Tractor, ArrowRight } from 'lucide-react-native';

interface RoleCard {
  role: BusinessRole;
  icon: any;
  title: string;
  description: string;
  color: string;
  route: string;
}

const roleCards: RoleCard[] = [
  {
    role: 'shop',
    icon: Store,
    title: 'Shop',
    description: 'Sell your farm produce',
    color: '#10B981',
    route: '/onboarding/shop/profile',
  },
  {
    role: 'service',
    icon: Wrench,
    title: 'Services',
    description: 'Offer agri-services',
    color: '#F59E0B',
    route: '/onboarding/service/profile',
  },
  {
    role: 'logistics',
    icon: Truck,
    title: 'Logistics',
    description: 'Own fleet or drive?',
    color: '#3B82F6',
    route: '/onboarding/logistics/role',
  },
  {
    role: 'farm',
    icon: Tractor,
    title: 'Farm',
    description: 'Monitor crops & livestock',
    color: '#8B5CF6',
    route: '/onboarding/farm/profile',
  },
];

export default function RoleSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { selectRole, setCurrentStep } = useOnboarding();

  const handleSelectRole = (card: RoleCard) => {
    selectRole(card.role);
    
    switch (card.role) {
      case 'shop':
        setCurrentStep('shop_profile');
        break;
      case 'service':
        setCurrentStep('service_profile');
        break;
      case 'logistics':
        setCurrentStep('logistics_role');
        break;
      case 'farm':
        setCurrentStep('farm_profile');
        break;
    }
    
    router.push(card.route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your First Card</Text>
          <Text style={styles.subtitle}>
            Select a business area to get started. You can add more later.
          </Text>
        </View>

        <View style={styles.cardsGrid}>
          {roleCards.map((card) => (
            <TouchableOpacity
              key={card.role}
              style={[styles.card, { borderColor: card.color }]}
              onPress={() => handleSelectRole(card)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                <card.icon size={40} color={card.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
              <ArrowRight size={20} color={card.color} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            router.replace('/dashboard' as any);
          }}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  cardsGrid: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});
