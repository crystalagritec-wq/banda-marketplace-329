import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Brain,
  User,
  Camera,
  FileText,
  MapPin,
  Shield,
  Zap,
  MessageSquare,
  Eye,
  Upload,
  Loader,
  Phone,
  Bell,
  UserCheck,
  Send,
  X,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDisputes, type Dispute, type DisputeEvidence } from '@/providers/dispute-provider';
import { useCart } from '@/providers/cart-provider';

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `KSh ${amount}`;
  }
}

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

const EvidenceCard = ({ evidence }: { evidence: DisputeEvidence }) => (
  <View style={styles.evidenceCard}>
    <View style={styles.evidenceHeader}>
      <View style={styles.evidenceTypeIcon}>
        {evidence.evidenceType === 'photo' && <Camera size={16} color="#2D5016" />}
        {evidence.evidenceType === 'video' && <Camera size={16} color="#2D5016" />}
        {evidence.evidenceType === 'document' && <FileText size={16} color="#2D5016" />}
        {evidence.evidenceType === 'gps_log' && <MapPin size={16} color="#2D5016" />}
        {evidence.evidenceType === 'text' && <MessageSquare size={16} color="#2D5016" />}
      </View>
      <View style={styles.evidenceInfo}>
        <Text style={styles.evidenceType}>
          {evidence.evidenceType.charAt(0).toUpperCase() + evidence.evidenceType.slice(1).replace('_', ' ')}
        </Text>
        <Text style={styles.evidenceSubmitter}>
          By {evidence.submittedBy} • {evidence.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
    
    {evidence.fileUrl && (
      <Image source={{ uri: evidence.fileUrl }} style={styles.evidenceImage} />
    )}
    
    <Text style={styles.evidenceDescription}>{evidence.description}</Text>
    
    {evidence.metadata?.gpsCoords && (
      <View style={styles.gpsInfo}>
        <MapPin size={14} color="#6B7280" />
        <Text style={styles.gpsText}>
          GPS: {evidence.metadata.gpsCoords.lat.toFixed(6)}, {evidence.metadata.gpsCoords.lng.toFixed(6)}
        </Text>
      </View>
    )}
  </View>
);

const AIAnalysisCard = ({ analysis }: { analysis: NonNullable<Dispute['aiAnalysis']> }) => (
  <View style={styles.aiAnalysisCard}>
    <View style={styles.aiHeader}>
      <View style={styles.aiIcon}>
        <Brain size={20} color="#8B5CF6" />
      </View>
      <View style={styles.aiInfo}>
        <Text style={styles.aiTitle}>Banda AI Analysis</Text>
        <Text style={styles.aiModel}>{analysis.aiModelVersion}</Text>
      </View>
      <View style={styles.confidenceScore}>
        <Text style={styles.confidenceText}>
          {Math.round(analysis.confidenceScore * 100)}%
        </Text>
      </View>
    </View>
    
    <View style={styles.aiRecommendation}>
      <Text style={styles.recommendationLabel}>AI Recommendation:</Text>
      <View style={[styles.recommendationBadge, { 
        backgroundColor: analysis.aiRecommendation === 'full_refund' ? '#FEE2E2' :
                        analysis.aiRecommendation === 'partial_refund' ? '#FEF3C7' :
                        analysis.aiRecommendation === 'release_funds' ? '#D1FAE5' : '#F3F4F6'
      }]}>
        <Text style={[styles.recommendationText, {
          color: analysis.aiRecommendation === 'full_refund' ? '#DC2626' :
                 analysis.aiRecommendation === 'partial_refund' ? '#D97706' :
                 analysis.aiRecommendation === 'release_funds' ? '#059669' : '#6B7280'
        }]}>
          {analysis.aiRecommendation.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    </View>
    
    <Text style={styles.aiReasoning}>{analysis.reasoning}</Text>
    
    <View style={styles.evidenceAnalyzed}>
      <Text style={styles.evidenceAnalyzedTitle}>Evidence Analyzed:</Text>
      <View style={styles.evidenceStats}>
        <Text style={styles.evidenceStat}>📸 {analysis.evidenceAnalyzed.photos} photos</Text>
        <Text style={styles.evidenceStat}>🎥 {analysis.evidenceAnalyzed.videos} videos</Text>
        <Text style={styles.evidenceStat}>📍 {analysis.evidenceAnalyzed.gpsLogs} GPS logs</Text>
        <Text style={styles.evidenceStat}>📄 {analysis.evidenceAnalyzed.sellerProof} seller proofs</Text>
      </View>
    </View>
    
    <Text style={styles.processingTime}>
      Processed in {analysis.processingTimeMs}ms
    </Text>
  </View>
);

export default function DisputeDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { disputeId } = useLocalSearchParams<{ disputeId: string }>();
  const { disputes, addEvidence, triggerAIAnalysis, resolveDispute } = useDisputes();
  const { orders } = useCart();
  
  const [newEvidenceText, setNewEvidenceText] = useState<string>('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showFieldAgentModal, setShowFieldAgentModal] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  
  const dispute = useMemo(() => {
    return disputes.find(d => d.disputeId === disputeId);
  }, [disputes, disputeId]);
  
  const order = useMemo(() => {
    if (!dispute) return null;
    return orders.find(o => o.id === dispute.orderId);
  }, [orders, dispute]);
  
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  const handleSubmitEvidence = useCallback(async () => {
    if (!dispute || !newEvidenceText.trim()) return;
    
    setIsSubmittingEvidence(true);
    try {
      await addEvidence(dispute.disputeId, {
        submittedBy: 'buyer', // In real app, this would be determined by user role
        evidenceType: 'text',
        description: newEvidenceText.trim(),
      });
      setNewEvidenceText('');
      
      console.log('Evidence submitted successfully');
    } catch (error) {
      console.error('Error submitting evidence:', error);
      console.error('Failed to submit evidence');
    } finally {
      setIsSubmittingEvidence(false);
    }
  }, [dispute, newEvidenceText, addEvidence]);
  
  const handleTriggerAI = useCallback(async () => {
    if (!dispute) return;
    
    setIsAnalyzing(true);
    try {
      await triggerAIAnalysis(dispute.disputeId);
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [dispute, triggerAIAnalysis]);
  
  const handleEscalateToFieldAgent = useCallback(async () => {
    if (!dispute) return;
    
    setIsEscalating(true);
    try {
      // In real implementation, this would escalate to field agent
      console.log('Escalating dispute to Field Agent:', dispute.disputeId);
      setShowFieldAgentModal(true);
    } catch (error) {
      console.error('Error escalating to field agent:', error);
    } finally {
      setIsEscalating(false);
    }
  }, [dispute]);
  
  const handleAcceptAIResolution = useCallback(async () => {
    if (!dispute?.aiAnalysis) return;
    
    const resolutionType = dispute.aiAnalysis.aiRecommendation === 'full_refund' ? 'refund' :
                          dispute.aiAnalysis.aiRecommendation === 'partial_refund' ? 'partial_refund' :
                          dispute.aiAnalysis.aiRecommendation === 'release_funds' ? 'release' : 'no_action';
    
    try {
      await resolveDispute(
        dispute.disputeId,
        resolutionType,
        `AI recommendation accepted: ${dispute.aiAnalysis.reasoning}`,
        'ai'
      );
      
      console.log('AI resolution accepted');
    } catch (error) {
      console.error('Error accepting AI resolution:', error);
    }
  }, [dispute, resolveDispute]);
  
  const handleSendChatMessage = useCallback(() => {
    if (!chatMessage.trim()) return;
    
    console.log('Sending chat message:', chatMessage);
    // In real implementation, this would send message to field agent
    setChatMessage('');
  }, [chatMessage]);
  
  const handleCallSupport = useCallback(() => {
    console.log('Calling support for dispute:', dispute?.disputeId);
    // In real implementation, this would initiate a call
  }, [dispute]);
  
  const handleAlertFieldAgent = useCallback(() => {
    console.log('Alerting field agent for dispute:', dispute?.disputeId);
    // In real implementation, this would send urgent notification
  }, [dispute]);
  
  if (!dispute || !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dispute Not Found</Text>
          </View>
          <View style={styles.emptyState}>
            <AlertTriangle size={80} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Dispute Not Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              The dispute you&apos;re looking for doesn&apos;t exist or has been removed.
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="dispute-details-screen">
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="back-button">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dispute Details</Text>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Dispute Overview */}
          <View style={styles.disputeCard}>
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
            
            <Text style={styles.disputeReason}>{dispute.reason}</Text>
            
            <View style={styles.disputeInfo}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>#{order.id}</Text>
            </View>
            
            <View style={styles.disputeInfo}>
              <Text style={styles.infoLabel}>Order Total:</Text>
              <Text style={styles.infoValue}>{formatPrice(order.total)}</Text>
            </View>
            
            <View style={styles.disputeInfo}>
              <Text style={styles.infoLabel}>Raised By:</Text>
              <Text style={styles.infoValue}>{dispute.raisedBy}</Text>
            </View>
            
            <View style={styles.disputeInfo}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>
                {dispute.createdAt.toLocaleDateString()} at {dispute.createdAt.toLocaleTimeString()}
              </Text>
            </View>
            
            {dispute.resolvedAt && (
              <View style={styles.disputeInfo}>
                <Text style={styles.infoLabel}>Resolved:</Text>
                <Text style={styles.infoValue}>
                  {dispute.resolvedAt.toLocaleDateString()} at {dispute.resolvedAt.toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
          
          {/* AI Analysis */}
          {dispute.aiAnalysis && (
            <View style={styles.aiAnalysisCard}>
              <AIAnalysisCard analysis={dispute.aiAnalysis} />
              
              {/* TradeGuard Recommendations */}
              <View style={styles.tradeGuardRecommendations}>
                <View style={styles.recommendationHeader}>
                  <Shield size={20} color="#3B82F6" />
                  <Text style={styles.recommendationTitle}>TradeGuard Recommendations</Text>
                </View>
                <Text style={styles.recommendationDescription}>
                  Our TradeGuard system has reviewed this issue to suggest a fair solution. Resolving this quickly helps maintain a good seller rating and ensures buyers can shop with confidence.
                </Text>
                
                <Text style={styles.recommendationSuggestion}>
                  {dispute.aiAnalysis.aiRecommendation === 'partial_refund' 
                    ? `Offer a partial refund of ${formatPrice(Math.round(order.total * 0.6))} or send a replacement connector part.`
                    : dispute.aiAnalysis.aiRecommendation === 'full_refund'
                    ? `Offer a full refund of ${formatPrice(order.total)} to resolve this dispute.`
                    : dispute.aiAnalysis.aiRecommendation === 'release_funds'
                    ? 'Evidence supports releasing funds to seller.'
                    : 'No action required based on evidence.'}
                </Text>
                
                <View style={styles.recommendationActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleAcceptAIResolution}
                    testID="accept-resolution-button"
                  >
                    <Text style={styles.acceptButtonText}>Accept Resolution</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.escalateButton}
                    onPress={handleEscalateToFieldAgent}
                    disabled={isEscalating}
                    testID="escalate-field-agent-button"
                  >
                    {isEscalating ? (
                      <Loader size={16} color="#EF4444" />
                    ) : (
                      <UserCheck size={16} color="#EF4444" />
                    )}
                    <Text style={styles.escalateButtonText}>
                      {isEscalating ? 'Escalating...' : 'Escalate to Field Agent'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* Evidence Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Eye size={18} color="#2D5016" />
              <Text style={styles.sectionTitle}>Evidence ({dispute.evidence.length})</Text>
            </View>
            
            {dispute.evidence.length > 0 ? (
              dispute.evidence.map((evidence) => (
                <EvidenceCard key={evidence.id} evidence={evidence} />
              ))
            ) : (
              <Text style={styles.noEvidence}>No evidence submitted yet.</Text>
            )}
          </View>
          
          {/* Add Evidence */}
          {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Upload size={18} color="#2D5016" />
                <Text style={styles.sectionTitle}>Submit Evidence</Text>
              </View>
              
              <TextInput
                style={styles.evidenceInput}
                placeholder="Describe your evidence or provide additional details..."
                value={newEvidenceText}
                onChangeText={setNewEvidenceText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                testID="evidence-input"
              />
              
              <TouchableOpacity
                style={[styles.submitButton, { opacity: newEvidenceText.trim() ? 1 : 0.5 }]}
                onPress={handleSubmitEvidence}
                disabled={!newEvidenceText.trim() || isSubmittingEvidence}
                testID="submit-evidence-button"
              >
                {isSubmittingEvidence ? (
                  <Loader size={16} color="white" />
                ) : (
                  <Upload size={16} color="white" />
                )}
                <Text style={styles.submitButtonText}>
                  {isSubmittingEvidence ? 'Submitting...' : 'Submit Evidence'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Field Agent Escalation */}
          {dispute.status === 'escalated' && (
            <View style={styles.fieldAgentCard}>
              <View style={styles.fieldAgentHeader}>
                <UserCheck size={20} color="#EF4444" />
                <Text style={styles.fieldAgentTitle}>Escalated to Field Agent</Text>
              </View>
              <Text style={styles.fieldAgentDescription}>
                This dispute has been escalated. A field agent will investigate and provide a final resolution within 48 hours. If the issue is urgent, you can contact support.
              </Text>
              
              <View style={styles.fieldAgentActions}>
                <TouchableOpacity
                  style={styles.callSupportButton}
                  onPress={handleCallSupport}
                  testID="call-support-button"
                >
                  <Phone size={16} color="white" />
                  <Text style={styles.callSupportText}>Call Support</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.alertAgentButton}
                  onPress={handleAlertFieldAgent}
                  testID="alert-field-agent-button"
                >
                  <Bell size={16} color="#EF4444" />
                  <Text style={styles.alertAgentText}>Alert Field Agent</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Chat History */}
          {dispute.status === 'escalated' && (
            <View style={styles.chatCard}>
              <View style={styles.chatHeader}>
                <MessageSquare size={18} color="#2D5016" />
                <Text style={styles.chatTitle}>Chat History</Text>
              </View>
              
              <View style={styles.chatMessages}>
                <Text style={styles.chatPlaceholder}>Chat history will be displayed here.</Text>
              </View>
              
              <View style={styles.chatInput}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  multiline
                  testID="chat-input"
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendChatMessage}
                  disabled={!chatMessage.trim()}
                  testID="send-message-button"
                >
                  <Send size={16} color={chatMessage.trim() ? "#2D5016" : "#9CA3AF"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Actions */}
          {dispute.status !== 'resolved' && dispute.status !== 'closed' && dispute.status !== 'escalated' && (
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>Dispute Actions</Text>
              
              {dispute.status === 'open' && dispute.evidence.length > 0 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleTriggerAI}
                  disabled={isAnalyzing}
                  testID="trigger-ai-button"
                >
                  {isAnalyzing ? (
                    <Loader size={16} color="#8B5CF6" />
                  ) : (
                    <Brain size={16} color="#8B5CF6" />
                  )}
                  <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>
                    {isAnalyzing ? 'Analyzing...' : 'Trigger AI Analysis'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* TradeGuard Protection Notice */}
          <View style={styles.protectionCard}>
            <View style={styles.protectionHeader}>
              <Shield size={20} color="#10B981" />
              <Text style={styles.protectionTitle}>TradeGuard Protection</Text>
            </View>
            <Text style={styles.protectionText}>
              This dispute is protected by Banda&apos;s TradeGuard system. All funds are held in Reserve until resolution. 
              AI analysis provides fair, evidence-based recommendations with human oversight for complex cases.
            </Text>
            <View style={styles.protectionFeatures}>
              <View style={styles.protectionFeature}>
                <Zap size={14} color="#10B981" />
                <Text style={styles.protectionFeatureText}>AI-powered analysis</Text>
              </View>
              <View style={styles.protectionFeature}>
                <User size={14} color="#10B981" />
                <Text style={styles.protectionFeatureText}>Human moderator backup</Text>
              </View>
              <View style={styles.protectionFeature}>
                <Shield size={14} color="#10B981" />
                <Text style={styles.protectionFeatureText}>Reserve fund protection</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Field Agent Modal */}
        {showFieldAgentModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Alert</Text>
                <TouchableOpacity
                  onPress={() => setShowFieldAgentModal(false)}
                  style={styles.modalCloseButton}
                  testID="close-modal-button"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Please review the details below before alerting a field agent.
              </Text>
              
              <View style={styles.modalDetails}>
                <View style={styles.modalDetailSection}>
                  <Text style={styles.modalDetailTitle}>User Details</Text>
                  <Text style={styles.modalDetailText}>Name: Jane Doe</Text>
                  <Text style={styles.modalDetailText}>Phone: +254705256259</Text>
                </View>
                
                <View style={styles.modalDetailSection}>
                  <Text style={styles.modalDetailTitle}>Case Details</Text>
                  <Text style={styles.modalDetailText}>Order ID: {order?.id}</Text>
                  <Text style={styles.modalDetailText}>
                    Issue: {dispute.reason.length > 50 ? dispute.reason.substring(0, 50) + '...' : dispute.reason}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowFieldAgentModal(false)}
                  testID="modal-cancel-button"
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    setShowFieldAgentModal(false);
                    console.log('Field agent alerted successfully');
                  }}
                  testID="modal-confirm-button"
                >
                  <Text style={styles.modalConfirmText}>Confirm and Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  disputeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  disputeIdSection: { flex: 1 },
  disputeId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  disputeReason: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 22,
  },
  disputeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  aiAnalysisCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiInfo: { flex: 1 },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  aiModel: {
    fontSize: 12,
    color: '#6B7280',
  },
  confidenceScore: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  aiRecommendation: {
    marginBottom: 16,
  },
  recommendationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recommendationBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  aiReasoning: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  evidenceAnalyzed: {
    marginBottom: 12,
  },
  evidenceAnalyzedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  evidenceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidenceStat: {
    fontSize: 12,
    color: '#6B7280',
  },
  processingTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  noEvidence: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  evidenceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  evidenceTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  evidenceInfo: { flex: 1 },
  evidenceType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  evidenceSubmitter: {
    fontSize: 12,
    color: '#6B7280',
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  evidenceDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gpsText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  evidenceInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 16,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D5016',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  protectionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  protectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  protectionText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    marginBottom: 16,
  },
  protectionFeatures: {
    gap: 8,
  },
  protectionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  protectionFeatureText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  tradeGuardRecommendations: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
  recommendationDescription: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationSuggestion: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    marginBottom: 16,
  },
  recommendationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  escalateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  escalateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  fieldAgentCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  fieldAgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fieldAgentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  fieldAgentDescription: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    marginBottom: 16,
  },
  fieldAgentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callSupportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
  },
  callSupportText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  alertAgentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  alertAgentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  chatCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  chatMessages: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    minHeight: 100,
  },
  chatPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  modalDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  modalDetailSection: {
    marginBottom: 16,
  },
  modalDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});