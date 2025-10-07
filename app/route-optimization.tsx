import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,

} from 'react-native';
import {
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Target,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';

interface OptimizedRoute {
  providerId: string;
  providerName: string;
  vehicleType: string;
  rating: number;
  totalDistance: number;
  estimatedTime: number;
  deliveryFee: number;
  stops: {
    orderId: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    priority: number;
  }[];
  efficiency: number;
  isPooled: boolean;
  poolingDiscount: number;
  finalFee: number;
}

export default function RouteOptimizationScreen() {
  useAuth();
  const insets = useSafeAreaInsets();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizedRoute[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [prioritizeSpeed, setPrioritizeSpeed] = useState(false);

  // Mock orders for demonstration
  const availableOrders = [
    { id: '1', address: 'Nairobi CBD', amount: 2500, items: 'Electronics' },
    { id: '2', address: 'Westlands', amount: 1800, items: 'Groceries' },
    { id: '3', address: 'Karen', amount: 3200, items: 'Furniture' },
    { id: '4', address: 'Kileleshwa', amount: 1500, items: 'Books' },
    { id: '5', address: 'Lavington', amount: 2800, items: 'Clothing' },
  ];

  const optimizeRoutesMutation = trpc.logistics.optimizeDeliveryRoutes.useMutation({
    onSuccess: (data) => {
      setOptimizationResults(data.optimizedRoutes);
      setShowResults(true);
    },
    onError: (error) => {
      if (error?.message) {
        console.error('Route optimization failed:', error.message);
      }
    }
  });

  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleOptimizeRoutes = () => {
    if (selectedOrders.length === 0) {
      return;
    }

    optimizeRoutesMutation.mutate({
      orderIds: selectedOrders,
      maxProvidersToConsider: 5,
      prioritizeSpeed
    });
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          title: 'AI Route Optimization',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

      <LinearGradient colors={['#F3E8FF', '#FFFFFF']} style={styles.gradient}>
        <ScrollView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Zap size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.title}>AI Route Optimization</Text>
            <Text style={styles.subtitle}>
              Select orders to optimize delivery routes using AI-powered logistics
            </Text>
          </View>

          {/* Optimization Settings */}
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Optimization Settings</Text>
            <TouchableOpacity
              style={styles.settingOption}
              onPress={() => setPrioritizeSpeed(!prioritizeSpeed)}
            >
              <View style={styles.settingLeft}>
                <Target size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Prioritize Speed over Cost</Text>
              </View>
              <View style={[styles.toggle, prioritizeSpeed && styles.toggleActive]}>
                {prioritizeSpeed && <CheckCircle size={16} color="white" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Order Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Orders to Optimize</Text>
            <Text style={styles.sectionSubtitle}>
              Choose multiple orders for better route optimization and pooling opportunities
            </Text>
            
            {availableOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderCard,
                  selectedOrders.includes(order.id) && styles.orderCardSelected
                ]}
                onPress={() => handleOrderToggle(order.id)}
              >
                <View style={styles.orderLeft}>
                  <View style={[
                    styles.orderCheckbox,
                    selectedOrders.includes(order.id) && styles.orderCheckboxSelected
                  ]}>
                    {selectedOrders.includes(order.id) && (
                      <CheckCircle size={16} color="white" />
                    )}
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderAddress}>{order.address}</Text>
                    <Text style={styles.orderItems}>{order.items}</Text>
                  </View>
                </View>
                <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optimize Button */}
          {selectedOrders.length > 0 && (
            <TouchableOpacity
              style={styles.optimizeButton}
              onPress={handleOptimizeRoutes}
              disabled={optimizeRoutesMutation.isPending}
            >
              {optimizeRoutesMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Zap size={20} color="white" />
                  <Text style={styles.optimizeButtonText}>
                    Optimize {selectedOrders.length} Orders
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Optimization Results */}
          {showResults && optimizationResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Optimization Results</Text>
              <Text style={styles.sectionSubtitle}>
                AI-generated route options ranked by efficiency
              </Text>

              {optimizationResults.map((route, index) => (
                <View key={route.providerId} style={styles.routeCard}>
                  <View style={styles.routeHeader}>
                    <View style={styles.routeRank}>
                      <Text style={styles.routeRankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeProvider}>{route.providerName}</Text>
                      <Text style={styles.routeVehicle}>{route.vehicleType}</Text>
                    </View>
                    <View style={styles.routeRating}>
                      <Text style={styles.routeRatingText}>{route.rating.toFixed(1)}★</Text>
                    </View>
                  </View>

                  <View style={styles.routeMetrics}>
                    <View style={styles.metric}>
                      <MapPin size={16} color="#666" />
                      <Text style={styles.metricText}>{route.totalDistance.toFixed(1)} km</Text>
                    </View>
                    <View style={styles.metric}>
                      <Clock size={16} color="#666" />
                      <Text style={styles.metricText}>{formatTime(route.estimatedTime)}</Text>
                    </View>
                    <View style={styles.metric}>
                      <DollarSign size={16} color="#666" />
                      <Text style={styles.metricText}>{formatCurrency(route.finalFee)}</Text>
                    </View>
                  </View>

                  {route.isPooled && (
                    <View style={styles.poolingInfo}>
                      <Users size={16} color="#10B981" />
                      <Text style={styles.poolingText}>
                        Pooled delivery • {route.stops.length} stops • Save {formatCurrency(route.deliveryFee * route.poolingDiscount)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.efficiencyBar}>
                    <Text style={styles.efficiencyLabel}>Efficiency Score</Text>
                    <View style={styles.efficiencyBarContainer}>
                      <View 
                        style={[
                          styles.efficiencyBarFill,
                          { width: `${route.efficiency}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.efficiencyScore}>{route.efficiency}%</Text>
                  </View>

                  <TouchableOpacity style={styles.selectRouteButton}>
                    <Text style={styles.selectRouteButtonText}>Select This Route</Text>
                    <ArrowRight size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8B5CF6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderCheckboxSelected: {
    backgroundColor: '#8B5CF6',
  },
  orderInfo: {
    flex: 1,
  },
  orderAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  orderItems: {
    fontSize: 12,
    color: '#666',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  optimizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeRankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeInfo: {
    flex: 1,
  },
  routeProvider: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  routeVehicle: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  routeRating: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeRatingText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  routeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  poolingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  poolingText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
    flex: 1,
  },
  efficiencyBar: {
    marginBottom: 16,
  },
  efficiencyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  efficiencyBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  efficiencyBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  efficiencyScore: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'right',
  },
  selectRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  selectRouteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});