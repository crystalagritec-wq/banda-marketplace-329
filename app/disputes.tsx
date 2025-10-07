import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Brain,
  Search as SearchIcon,
  Filter as FilterIcon,

  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDisputes, type Dispute } from '@/providers/dispute-provider';

const getStatusColor = (status: Dispute['status']) => {
  switch (status) {
    case 'open':
      return '#F59E0B';
    case 'ai_analyzing':
      return '#8B5CF6';
    case 'under_review':
      return '#3B82F6';
    case 'resolved':
      return '#10B981';
    case 'closed':
      return '#6B7280';
    case 'escalated':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: Dispute['status']) => {
  const color = getStatusColor(status);
  switch (status) {
    case 'open':
      return <AlertTriangle size={16} color={color} />;
    case 'ai_analyzing':
      return <Brain size={16} color={color} />;
    case 'under_review':
      return <Clock size={16} color={color} />;
    case 'resolved':
      return <CheckCircle2 size={16} color={color} />;
    case 'closed':
      return <CheckCircle2 size={16} color={color} />;
    case 'escalated':
      return <AlertTriangle size={16} color={color} />;
    default:
      return <Clock size={16} color={color} />;
  }
};

const getPriorityColor = (priority: Dispute['priority']) => {
  switch (priority) {
    case 'low':
      return '#10B981';
    case 'medium':
      return '#F59E0B';
    case 'high':
      return '#EF4444';
    case 'urgent':
      return '#DC2626';
    default:
      return '#6B7280';
  }
};

const DisputeCard = ({
  dispute,
  onPress,
}: {
  dispute: Dispute;
  onPress: (disputeId: string) => void;
}) => (
  <TouchableOpacity
    style={styles.disputeCard}
    onPress={() => onPress(dispute.disputeId)}
    testID={`dispute-card-${dispute.disputeId}`}
  >
    <View style={styles.disputeHeader}>
      <View style={styles.disputeIdSection}>
        <Text style={styles.disputeId}>{dispute.disputeId}</Text>
        <View style={styles.statusBadge}>
          {getStatusIcon(dispute.status)}
          <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
            {dispute.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(dispute.priority) + '20' }]}>
        <Text style={[styles.priorityText, { color: getPriorityColor(dispute.priority) }]}>
          {dispute.priority.toUpperCase()}
        </Text>
      </View>
    </View>
    
    <Text style={styles.disputeReason} numberOfLines={2}>
      {dispute.reason}
    </Text>
    
    <View style={styles.disputeInfo}>
      <Text style={styles.infoLabel}>Order:</Text>
      <Text style={styles.infoValue}>#{dispute.orderId}</Text>
    </View>
    
    <View style={styles.disputeInfo}>
      <Text style={styles.infoLabel}>Raised by:</Text>
      <Text style={styles.infoValue}>{dispute.raisedBy}</Text>
    </View>
    
    <View style={styles.disputeInfo}>
      <Text style={styles.infoLabel}>Evidence:</Text>
      <Text style={styles.infoValue}>{dispute.evidence.length} items</Text>
    </View>
    
    <View style={styles.disputeInfo}>
      <Text style={styles.infoLabel}>Created:</Text>
      <Text style={styles.infoValue}>
        {dispute.createdAt.toLocaleDateString()}
      </Text>
    </View>
    
    {dispute.aiAnalysis && (
      <View style={styles.aiIndicator}>
        <Brain size={14} color="#8B5CF6" />
        <Text style={styles.aiIndicatorText}>
          AI: {Math.round(dispute.aiAnalysis.confidenceScore * 100)}% confidence
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function DisputesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { disputes, disputeStats } = useDisputes();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'all' | Dispute['status']>('all');
  const [query, setQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'priority'>('recent');
  
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  const onRefresh = useCallback(async () => {
    console.log('DisputesScreen:onRefresh');
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const handleDisputePress = useCallback((disputeId: string) => {
    console.log('DisputesScreen:handleDisputePress', disputeId);
    router.push(`/dispute/${disputeId}` as any);
  }, [router]);
  
  const filteredDisputes = useMemo(() => {
    let list = disputes.filter(dispute => {
      if (selectedTab !== 'all' && dispute.status !== selectedTab) {
        return false;
      }
      return true;
    });
    
    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      list = list.filter(dispute => {
        const inId = dispute.disputeId.toLowerCase().includes(q);
        const inOrderId = dispute.orderId.toLowerCase().includes(q);
        const inReason = dispute.reason.toLowerCase().includes(q);
        return inId || inOrderId || inReason;
      });
    }
    
    list = [...list].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return list;
  }, [disputes, selectedTab, query, sortBy]);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="disputes-screen">
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="back-button">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dispute Center</Text>
          <Text style={styles.disputeCount}>{disputes.length} disputes</Text>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{Math.round(disputeStats.aiResolutionRate)}%</Text>
              <Text style={styles.statLabel}>AI Resolved</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Brain size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{disputeStats.analyzing}</Text>
              <Text style={styles.statLabel}>Analyzing</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Users size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{disputeStats.underReview}</Text>
              <Text style={styles.statLabel}>Under Review</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search disputes by ID, order, or reason"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              testID="disputes-search"
            />
          </View>
          <TouchableOpacity
            style={styles.sortPill}
            onPress={() => setSortBy(prev => (prev === 'recent' ? 'priority' : prev === 'priority' ? 'oldest' : 'recent'))}
            testID="disputes-sort"
          >
            <FilterIcon size={16} color="#2D5016" />
            <Text style={styles.sortPillText}>
              {sortBy === 'recent' ? 'Recent' : sortBy === 'priority' ? 'Priority' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
            testID="tab-all"
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
              All ({disputeStats.total})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'open' && styles.activeTab]}
            onPress={() => setSelectedTab('open')}
            testID="tab-open"
          >
            <Text style={[styles.tabText, selectedTab === 'open' && styles.activeTabText]}>
              Open ({disputeStats.open})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'ai_analyzing' && styles.activeTab]}
            onPress={() => setSelectedTab('ai_analyzing')}
            testID="tab-analyzing"
          >
            <Text style={[styles.tabText, selectedTab === 'ai_analyzing' && styles.activeTabText]}>
              AI ({disputeStats.analyzing})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'under_review' && styles.activeTab]}
            onPress={() => setSelectedTab('under_review')}
            testID="tab-review"
          >
            <Text style={[styles.tabText, selectedTab === 'under_review' && styles.activeTabText]}>
              Review ({disputeStats.underReview})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'resolved' && styles.activeTab]}
            onPress={() => setSelectedTab('resolved')}
            testID="tab-resolved"
          >
            <Text style={[styles.tabText, selectedTab === 'resolved' && styles.activeTabText]}>
              Resolved ({disputeStats.resolved})
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}

        >
          {filteredDisputes.length > 0 ? (
            filteredDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onPress={handleDisputePress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Shield size={80} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>
                {selectedTab === 'all' ? 'No Disputes Found' : `No ${selectedTab.replace('_', ' ')} Disputes`}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {query.trim() 
                  ? 'Try adjusting your search terms or filters'
                  : 'All transactions are protected by TradeGuard. Disputes will appear here when raised.'
                }
              </Text>
            </View>
          )}
          
          {/* TradeGuard Info */}
          <View style={styles.tradeGuardCard}>
            <View style={styles.tradeGuardHeader}>
              <Shield size={24} color="#10B981" />
              <Text style={styles.tradeGuardTitle}>Banda TradeGuard Protection</Text>
            </View>
            <Text style={styles.tradeGuardDescription}>
              Our AI-powered dispute resolution system provides fair, fast, and transparent resolution 
              for all marketplace transactions. Funds are held in Reserve until disputes are resolved.
            </Text>
            <View style={styles.tradeGuardFeatures}>
              <View style={styles.tradeGuardFeature}>
                <Zap size={16} color="#10B981" />
                <Text style={styles.tradeGuardFeatureText}>AI analysis in 2-5 minutes</Text>
              </View>
              <View style={styles.tradeGuardFeature}>
                <Users size={16} color="#10B981" />
                <Text style={styles.tradeGuardFeatureText}>Human moderator backup</Text>
              </View>
              <View style={styles.tradeGuardFeature}>
                <Shield size={16} color="#10B981" />
                <Text style={styles.tradeGuardFeatureText}>Reserve fund protection</Text>
              </View>
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
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  disputeCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D5016',
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  disputeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  disputeIdSection: { flex: 1 },
  disputeId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  disputeReason: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  disputeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  aiIndicatorText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  tradeGuardCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tradeGuardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tradeGuardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  tradeGuardDescription: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    marginBottom: 16,
  },
  tradeGuardFeatures: {
    gap: 10,
  },
  tradeGuardFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradeGuardFeatureText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '500',
  },
});