import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Leaf,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  Info,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface MarketInsight {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

interface PriceAlert {
  id: string;
  product: string;
  currentPrice: number;
  targetPrice: number;
  status: 'above' | 'below' | 'reached';
}

const mockInsights: MarketInsight[] = [
  {
    id: '1',
    title: 'Maize Price',
    value: 'KSh 45/kg',
    change: 12.5,
    trend: 'up',
    icon: Leaf,
    color: '#10B981',
  },
  {
    id: '2',
    title: 'Tomato Demand',
    value: 'High',
    change: -5.2,
    trend: 'down',
    icon: TrendingUp,
    color: '#EF4444',
  },
  {
    id: '3',
    title: 'Active Buyers',
    value: '1,247',
    change: 8.3,
    trend: 'up',
    icon: Users,
    color: '#3B82F6',
  },
  {
    id: '4',
    title: 'Orders Today',
    value: '89',
    change: 15.7,
    trend: 'up',
    icon: Package,
    color: '#F59E0B',
  },
];

const mockPriceAlerts: PriceAlert[] = [
  {
    id: '1',
    product: 'Maize',
    currentPrice: 45,
    targetPrice: 50,
    status: 'below',
  },
  {
    id: '2',
    product: 'Tomatoes',
    currentPrice: 80,
    targetPrice: 75,
    status: 'above',
  },
  {
    id: '3',
    product: 'Beans',
    currentPrice: 120,
    targetPrice: 120,
    status: 'reached',
  },
];

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderInsightCard = (insight: MarketInsight) => {
    const IconComponent = insight.icon;
    const trendIcon = insight.trend === 'up' ? TrendingUp : 
                     insight.trend === 'down' ? TrendingDown : null;
    const TrendIcon = trendIcon;
    
    return (
      <View key={insight.id} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
            <IconComponent size={20} color={insight.color} />
          </View>
          <Text style={styles.insightTitle}>{insight.title}</Text>
        </View>
        
        <Text style={styles.insightValue}>{insight.value}</Text>
        
        <View style={styles.insightChange}>
          {TrendIcon && (
            <TrendIcon 
              size={16} 
              color={insight.trend === 'up' ? '#10B981' : '#EF4444'} 
            />
          )}
          <Text 
            style={[
              styles.insightChangeText,
              { color: insight.trend === 'up' ? '#10B981' : '#EF4444' }
            ]}
          >
            {insight.change > 0 ? '+' : ''}{insight.change}%
          </Text>
        </View>
      </View>
    );
  };

  const renderPriceAlert = (alert: PriceAlert) => {
    const statusColor = alert.status === 'reached' ? '#10B981' : 
                       alert.status === 'above' ? '#EF4444' : '#F59E0B';
    const statusText = alert.status === 'reached' ? 'Target Reached' :
                      alert.status === 'above' ? 'Above Target' : 'Below Target';
    
    return (
      <View key={alert.id} style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertProduct}>{alert.product}</Text>
          <View style={[styles.alertStatus, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.alertStatusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
        
        <View style={styles.alertPrices}>
          <Text style={styles.alertCurrentPrice}>
            Current: KSh {alert.currentPrice}/kg
          </Text>
          <Text style={styles.alertTargetPrice}>
            Target: KSh {alert.targetPrice}/kg
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Market Insights</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['7d', '30d', '90d'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Market Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <View style={styles.insightsGrid}>
              {mockInsights.map(renderInsightCard)}
            </View>
          </View>

          {/* Price Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Price Alerts</Text>
              <TouchableOpacity 
                style={styles.manageButton}
                onPress={() => {
                  console.log('📊 Managing price alerts');
                  // Navigate to price alerts management
                }}
              >
                <Text style={styles.manageButtonText}>Manage</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.alertsList}>
              {mockPriceAlerts.map(renderPriceAlert)}
            </View>
          </View>

          {/* Market Trends */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Trends</Text>
            
            <View style={styles.trendsCard}>
              <View style={styles.trendsHeader}>
                <BarChart3 size={20} color="#2D5016" />
                <Text style={styles.trendsTitle}>Top Performing Products</Text>
              </View>
              
              <View style={styles.trendsList}>
                <View style={styles.trendItem}>
                  <Text style={styles.trendProduct}>Maize</Text>
                  <View style={styles.trendBar}>
                    <View style={[styles.trendBarFill, { width: '85%' }]} />
                  </View>
                  <Text style={styles.trendValue}>+12.5%</Text>
                </View>
                
                <View style={styles.trendItem}>
                  <Text style={styles.trendProduct}>Beans</Text>
                  <View style={styles.trendBar}>
                    <View style={[styles.trendBarFill, { width: '70%' }]} />
                  </View>
                  <Text style={styles.trendValue}>+8.3%</Text>
                </View>
                
                <View style={styles.trendItem}>
                  <Text style={styles.trendProduct}>Rice</Text>
                  <View style={styles.trendBar}>
                    <View style={[styles.trendBarFill, { width: '45%' }]} />
                  </View>
                  <Text style={styles.trendValue}>+3.2%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Regional Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regional Insights</Text>
            
            <View style={styles.regionCard}>
              <View style={styles.regionHeader}>
                <MapPin size={20} color="#2D5016" />
                <Text style={styles.regionTitle}>Nairobi Region</Text>
              </View>
              
              <View style={styles.regionStats}>
                <View style={styles.regionStat}>
                  <Text style={styles.regionStatValue}>1,247</Text>
                  <Text style={styles.regionStatLabel}>Active Buyers</Text>
                </View>
                <View style={styles.regionStat}>
                  <Text style={styles.regionStatValue}>89</Text>
                  <Text style={styles.regionStatLabel}>Orders Today</Text>
                </View>
                <View style={styles.regionStat}>
                  <Text style={styles.regionStatValue}>KSh 2.1M</Text>
                  <Text style={styles.regionStatLabel}>Volume</Text>
                </View>
              </View>
            </View>
          </View>

          {/* AI Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Info size={20} color="#3B82F6" />
                <Text style={styles.recommendationTitle}>Optimal Selling Time</Text>
              </View>
              
              <Text style={styles.recommendationText}>
                Based on market trends, the best time to sell your maize is in the next 2-3 days. 
                Prices are expected to peak at KSh 48/kg before declining.
              </Text>
              
              <TouchableOpacity 
                style={styles.recommendationAction}
                onPress={() => {
                  console.log('📊 Viewing AI recommendation details');
                  // Navigate to detailed market analysis or show modal
                }}
              >
                <Text style={styles.recommendationActionText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginVertical: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#2D5016',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2D5016',
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  insightChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertProduct: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  alertStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertCurrentPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertTargetPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  trendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  trendsList: {
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 60,
  },
  trendBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trendBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    width: 50,
    textAlign: 'right',
  },
  regionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  regionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  regionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  regionStat: {
    alignItems: 'center',
  },
  regionStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D5016',
    marginBottom: 4,
  },
  regionStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendationCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  recommendationText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  recommendationActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});