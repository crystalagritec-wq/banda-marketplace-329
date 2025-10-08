import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Package, ShoppingBag, Home, HelpCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type OrderStage = 'placed' | 'claimed' | 'shopping' | 'delivered';

interface TimelineStep {
  key: OrderStage;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function OrderDetailsEnhancedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [currentStage, setCurrentStage] = useState<OrderStage>('placed');
  const [showLess, setShowLess] = useState(false);

  const timelineSteps: TimelineStep[] = [
    {
      key: 'placed',
      label: 'Order placed',
      icon: <Package size={20} color="#CC0000" />,
      description: 'Your shopper will text you when they start your order.',
    },
    {
      key: 'claimed',
      label: 'Order claimed',
      icon: <Package size={16} color="#999" />,
      description: '',
    },
    {
      key: 'shopping',
      label: 'Shopping',
      icon: <ShoppingBag size={16} color="#999" />,
      description: '',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: <Home size={16} color="#999" />,
      description: '',
    },
  ];

  const currentIndex = timelineSteps.findIndex(step => step.key === currentStage);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order details</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderHeader}>
          <Text style={styles.storeName}>Target</Text>
          <Text style={styles.orderNumber}>• Order #38868916</Text>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Order placed</Text>
            <TouchableOpacity onPress={() => setShowLess(!showLess)}>
              <Text style={styles.showLessButton}>{showLess ? 'Show more' : 'Show less'}</Text>
            </TouchableOpacity>
          </View>

          {!showLess && (
            <View style={styles.timeline}>
              {timelineSteps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;
                const isLast = index === timelineSteps.length - 1;

                return (
                  <View key={step.key} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineIconContainer,
                        isActive && styles.timelineIconActive,
                        isCompleted && !isActive && styles.timelineIconCompleted,
                      ]}>
                        {step.icon}
                      </View>
                      {!isLast && (
                        <View style={[
                          styles.timelineConnector,
                          isCompleted && styles.timelineConnectorCompleted,
                        ]} />
                      )}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={[
                        styles.timelineLabel,
                        isActive && styles.timelineLabelActive,
                      ]}>
                        {step.label}
                      </Text>
                      {step.description && isActive && (
                        <View style={styles.deliveryInfo}>
                          <Text style={styles.deliveryTime}>Delivery tomorrow, 8 am–9 am</Text>
                          <Text style={styles.deliveryDescription}>{step.description}</Text>
                          
                          <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.selectBackupsButton}>
                              <Text style={styles.selectBackupsText}>Select backups</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editItemsButton}>
                              <Text style={styles.editItemsText}>Edit items</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items in order</Text>
          <TouchableOpacity style={styles.itemCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1586201375761-83865001e31c' }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemCount}>1 item</Text>
            </View>
            <ChevronLeft size={20} color="#999" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Delivery details</Text>
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryLabel}>Delivery address</Text>
            <Text style={styles.deliveryAddress}>1226 University Dr</Text>
            <Text style={styles.deliveryCity}>Menlo Park, CA 94025</Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactLabel}>Contact #</Text>
          <View style={styles.contactDivider} />
          <ChevronLeft size={20} color="#999" style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000',
  },
  helpButton: {
    padding: 8,
  },
  helpText: {
    fontSize: 16,
    color: '#CC0000',
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  timelineCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
  },
  showLessButton: {
    fontSize: 14,
    color: '#CC0000',
    fontWeight: '500' as const,
  },
  timeline: {
    marginTop: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 40,
  },
  timelineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#CC0000',
  },
  timelineIconCompleted: {
    backgroundColor: '#f5f5f5',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineConnectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666',
    marginBottom: 4,
  },
  timelineLabelActive: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  deliveryInfo: {
    marginTop: 8,
  },
  deliveryTime: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 8,
  },
  deliveryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  selectBackupsButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectBackupsText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  editItemsButton: {
    backgroundColor: '#1a0033',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editItemsText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  itemsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  deliverySection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  deliveryCard: {
    backgroundColor: '#fff',
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 4,
  },
  deliveryCity: {
    fontSize: 14,
    color: '#666',
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  contactDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
    marginHorizontal: 16,
  },
});
