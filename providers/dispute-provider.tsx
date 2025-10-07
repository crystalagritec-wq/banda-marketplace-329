import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStorage } from '@/providers/storage-provider';


export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: 'buyer' | 'seller' | 'logistics';
  evidenceType: 'photo' | 'video' | 'document' | 'gps_log' | 'text';
  fileUrl?: string;
  description: string;
  metadata?: {
    gpsCoords?: { lat: number; lng: number };
    timestamp?: string;
    fileSize?: number;
    mimeType?: string;
  };
  createdAt: Date;
}

export interface AIDisputeAnalysis {
  id: string;
  disputeId: string;
  aiRecommendation: 'full_refund' | 'release_funds' | 'partial_refund' | 'escalate_human';
  confidenceScore: number; // 0.00 to 1.00
  reasoning: string;
  evidenceAnalyzed: {
    photos: number;
    videos: number;
    gpsLogs: number;
    sellerProof: number;
    textDescriptions: number;
  };
  processingTimeMs: number;
  aiModelVersion: string;
  createdAt: Date;
}

export interface Dispute {
  id: string;
  disputeId: string; // BND-DISP-UG-2025-001 format
  orderId: string;
  raisedBy: 'buyer' | 'seller' | 'logistics';
  reason: string;
  status: 'open' | 'ai_analyzing' | 'under_review' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Assignment
  assignedModerator?: string;
  moderatorAssignedAt?: Date;
  
  // Resolution
  resolutionType?: 'refund' | 'release' | 'partial_refund' | 'no_action';
  resolutionDetails?: string;
  resolvedBy?: 'ai' | 'moderator' | 'escalation';
  resolvedAt?: Date;
  
  // Evidence and Analysis
  evidence: DisputeEvidence[];
  aiAnalysis?: AIDisputeAnalysis;
  
  // Financial Impact
  refundAmount?: number;
  releaseAmount?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeResolution {
  disputeId: string;
  orderId: string;
  resolutionType: 'full_refund' | 'partial_refund' | 'release_funds' | 'split_settlement';
  buyerRefund: number;
  sellerRelease: number;
  platformFee: number;
  logisticsFee: number;
  reasoning: string;
  validatedBy: 'tradeguard' | 'agripay';
  transactionIds: string[];
  completedAt: Date;
}

export interface UserReputation {
  userId: string;
  userType: 'buyer' | 'seller' | 'logistics';
  reputationScore: number; // starts at 100
  totalOrders: number;
  disputeCount: number;
  successfulOrders: number;
  accountStatus: 'active' | 'under_review' | 'suspended' | 'banned';
  reviewReason?: string;
  lastDisputeDate?: Date;
  reputationHistory: {
    changeType: string;
    changeValue: number;
    reason: string;
    orderId?: string;
    disputeId?: string;
    date: Date;
  }[];
}

const DISPUTES_STORAGE_KEY = 'banda_disputes';
const REPUTATION_STORAGE_KEY = 'banda_reputation';
const RESOLUTIONS_STORAGE_KEY = 'banda_resolutions';

// Mock AI Analysis Service
const analyzeDisputeWithAI = async (dispute: Dispute): Promise<AIDisputeAnalysis> => {
  // Simulate AI processing time
  const processingStart = Date.now();
  await new Promise<void>(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  const processingTime = Date.now() - processingStart;
  
  // Analyze evidence
  const evidenceCount = {
    photos: dispute.evidence.filter(e => e.evidenceType === 'photo').length,
    videos: dispute.evidence.filter(e => e.evidenceType === 'video').length,
    gpsLogs: dispute.evidence.filter(e => e.evidenceType === 'gps_log').length,
    sellerProof: dispute.evidence.filter(e => e.submittedBy === 'seller').length,
    textDescriptions: dispute.evidence.filter(e => e.evidenceType === 'text').length,
  };
  
  // AI Decision Logic (simplified)
  let recommendation: AIDisputeAnalysis['aiRecommendation'];
  let confidence: number;
  let reasoning: string;
  
  if (dispute.reason.toLowerCase().includes('not delivered') && evidenceCount.gpsLogs === 0) {
    recommendation = 'full_refund';
    confidence = 0.95;
    reasoning = 'No delivery proof found. GPS logs missing. Clear case for full refund.';
  } else if (dispute.reason.toLowerCase().includes('quality') && evidenceCount.photos >= 2) {
    recommendation = 'partial_refund';
    confidence = 0.82;
    reasoning = 'Quality issues documented with photo evidence. Recommend 60% refund.';
  } else if (evidenceCount.sellerProof >= 2 && evidenceCount.gpsLogs >= 1) {
    recommendation = 'release_funds';
    confidence = 0.88;
    reasoning = 'Strong seller evidence with delivery confirmation. Release funds to seller.';
  } else {
    recommendation = 'escalate_human';
    confidence = 0.45;
    reasoning = 'Insufficient evidence or conflicting claims. Human moderator review required.';
  }
  
  return {
    id: `ai-${Date.now()}`,
    disputeId: dispute.disputeId,
    aiRecommendation: recommendation,
    confidenceScore: confidence,
    reasoning,
    evidenceAnalyzed: evidenceCount,
    processingTimeMs: processingTime,
    aiModelVersion: 'banda-ai-v2.1',
    createdAt: new Date(),
  };
};

export const [DisputeProvider, useDisputes] = createContextHook(() => {
  const storage = useStorage();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [resolutions, setResolutions] = useState<DisputeResolution[]>([]);
  const [userReputations, setUserReputations] = useState<UserReputation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const loadDisputeData = useCallback(async () => {
    try {
      const [disputeData, reputationData, resolutionData] = await Promise.all([
        storage.getItem(DISPUTES_STORAGE_KEY),
        storage.getItem(REPUTATION_STORAGE_KEY),
        storage.getItem(RESOLUTIONS_STORAGE_KEY),
      ]);
      
      if (disputeData) {
        const parsedDisputes = JSON.parse(disputeData).map((dispute: any) => ({
          ...dispute,
          createdAt: new Date(dispute.createdAt),
          updatedAt: new Date(dispute.updatedAt),
          moderatorAssignedAt: dispute.moderatorAssignedAt ? new Date(dispute.moderatorAssignedAt) : undefined,
          resolvedAt: dispute.resolvedAt ? new Date(dispute.resolvedAt) : undefined,
          evidence: dispute.evidence.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
          })),
          aiAnalysis: dispute.aiAnalysis ? {
            ...dispute.aiAnalysis,
            createdAt: new Date(dispute.aiAnalysis.createdAt),
          } : undefined,
        }));
        setDisputes(parsedDisputes);
      }
      
      if (reputationData) {
        const parsedReputations = JSON.parse(reputationData).map((rep: any) => ({
          ...rep,
          lastDisputeDate: rep.lastDisputeDate ? new Date(rep.lastDisputeDate) : undefined,
          reputationHistory: rep.reputationHistory.map((h: any) => ({
            ...h,
            date: new Date(h.date),
          })),
        }));
        setUserReputations(parsedReputations);
      }
      
      if (resolutionData) {
        const parsedResolutions = JSON.parse(resolutionData).map((res: any) => ({
          ...res,
          completedAt: new Date(res.completedAt),
        }));
        setResolutions(parsedResolutions);
      }
    } catch (error) {
      console.error('Error loading dispute data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);
  
  useEffect(() => {
    loadDisputeData();
  }, [loadDisputeData]);
  
  const saveDisputes = useCallback(async (disputeList: Dispute[]) => {
    if (!Array.isArray(disputeList)) return;
    try {
      await storage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(disputeList));
    } catch (error) {
      console.error('Error saving disputes:', error);
    }
  }, [storage]);
  
  const generateDisputeId = useCallback(() => {
    const year = new Date().getFullYear();
    const sequence = String(disputes.length + 1).padStart(3, '0');
    return `BND-DISP-UG-${year}-${sequence}`;
  }, [disputes.length]);
  
  const createDispute = useCallback(async (
    orderId: string,
    raisedBy: 'buyer' | 'seller' | 'logistics',
    reason: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<Dispute> => {
    const dispute: Dispute = {
      id: `dispute-${Date.now()}`,
      disputeId: generateDisputeId(),
      orderId,
      raisedBy,
      reason,
      status: 'open',
      priority,
      evidence: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newDisputes = [dispute, ...disputes];
    setDisputes(newDisputes);
    await saveDisputes(newDisputes);
    
    console.log(`Dispute created: ${dispute.disputeId} for order ${orderId}`);
    return dispute;
  }, [disputes, generateDisputeId, saveDisputes]);
  
  const addEvidence = useCallback(async (
    disputeId: string,
    evidence: Omit<DisputeEvidence, 'id' | 'disputeId' | 'createdAt'>
  ): Promise<void> => {
    const newEvidence: DisputeEvidence = {
      ...evidence,
      id: `evidence-${Date.now()}`,
      disputeId,
      createdAt: new Date(),
    };
    
    setDisputes(prev => {
      const updated = prev.map(dispute => {
        if (dispute.disputeId === disputeId) {
          return {
            ...dispute,
            evidence: [...dispute.evidence, newEvidence],
            updatedAt: new Date(),
          };
        }
        return dispute;
      });
      saveDisputes(updated);
      return updated;
    });
    
    console.log(`Evidence added to dispute ${disputeId}:`, evidence.evidenceType);
  }, [saveDisputes]);
  
  const triggerAIAnalysis = useCallback(async (disputeId: string): Promise<void> => {
    // Update status to analyzing
    setDisputes(prev => {
      const updated = prev.map(dispute => {
        if (dispute.disputeId === disputeId) {
          return {
            ...dispute,
            status: 'ai_analyzing' as const,
            updatedAt: new Date(),
          };
        }
        return dispute;
      });
      saveDisputes(updated);
      return updated;
    });
    
    // Find the dispute
    const dispute = disputes.find(d => d.disputeId === disputeId);
    if (!dispute) return;
    
    try {
      // Run AI analysis
      const analysis = await analyzeDisputeWithAI(dispute);
      
      // Update dispute with AI analysis
      setDisputes(prev => {
        const updated = prev.map(d => {
          if (d.disputeId === disputeId) {
            return {
              ...d,
              status: (analysis.confidenceScore >= 0.8 ? 'resolved' : 'under_review') as Dispute['status'],
              aiAnalysis: analysis,
              resolvedBy: analysis.confidenceScore >= 0.8 ? ('ai' as const) : undefined,
              resolvedAt: analysis.confidenceScore >= 0.8 ? new Date() : undefined,
              resolutionType: (analysis.aiRecommendation === 'full_refund' ? 'refund' :
                            analysis.aiRecommendation === 'partial_refund' ? 'partial_refund' :
                            analysis.aiRecommendation === 'release_funds' ? 'release' : undefined) as Dispute['resolutionType'],
              updatedAt: new Date(),
            };
          }
          return d;
        });
        saveDisputes(updated);
        return updated;
      });
      
      console.log(`AI analysis completed for dispute ${disputeId}:`, analysis.aiRecommendation);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Revert status on error
      setDisputes(prev => {
        const updated = prev.map(dispute => {
          if (dispute.disputeId === disputeId) {
            return {
              ...dispute,
              status: 'under_review' as const,
              updatedAt: new Date(),
            };
          }
          return dispute;
        });
        saveDisputes(updated);
        return updated;
      });
    }
  }, [disputes, saveDisputes]);
  
  const resolveDispute = useCallback(async (
    disputeId: string,
    resolutionType: 'refund' | 'release' | 'partial_refund' | 'no_action',
    resolutionDetails: string,
    resolvedBy: 'ai' | 'moderator' | 'escalation' = 'moderator'
  ): Promise<void> => {
    setDisputes(prev => {
      const updated = prev.map(dispute => {
        if (dispute.disputeId === disputeId) {
          return {
            ...dispute,
            status: 'resolved' as const,
            resolutionType,
            resolutionDetails,
            resolvedBy,
            resolvedAt: new Date(),
            updatedAt: new Date(),
          };
        }
        return dispute;
      });
      saveDisputes(updated);
      return updated;
    });
    
    console.log(`Dispute ${disputeId} resolved:`, resolutionType);
  }, [saveDisputes]);
  
  const updateUserReputation = useCallback(async (
    userId: string,
    userType: 'buyer' | 'seller' | 'logistics',
    changeType: string,
    changeValue: number,
    reason: string,
    orderId?: string,
    disputeId?: string
  ): Promise<void> => {
    setUserReputations(prev => {
      const existing = prev.find(rep => rep.userId === userId);
      const reputationChange = {
        changeType,
        changeValue,
        reason,
        orderId,
        disputeId,
        date: new Date(),
      };
      
      let updated: UserReputation[];
      
      if (existing) {
        updated = prev.map(rep => {
          if (rep.userId === userId) {
            const newScore = Math.max(0, Math.min(200, rep.reputationScore + changeValue));
            const newDisputeCount = disputeId ? rep.disputeCount + 1 : rep.disputeCount;
            
            return {
              ...rep,
              reputationScore: newScore,
              disputeCount: newDisputeCount,
              lastDisputeDate: disputeId ? new Date() : rep.lastDisputeDate,
              accountStatus: newScore < 50 ? 'under_review' : 
                           newScore < 20 ? 'suspended' : 'active',
              reputationHistory: [reputationChange, ...rep.reputationHistory],
            };
          }
          return rep;
        });
      } else {
        const newReputation: UserReputation = {
          userId,
          userType,
          reputationScore: Math.max(0, Math.min(200, 100 + changeValue)),
          totalOrders: 1,
          disputeCount: disputeId ? 1 : 0,
          successfulOrders: 0,
          accountStatus: 'active',
          lastDisputeDate: disputeId ? new Date() : undefined,
          reputationHistory: [reputationChange],
        };
        updated = [newReputation, ...prev];
      }
      
      storage.setItem(REPUTATION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    console.log(`Reputation updated for ${userId}:`, changeValue);
  }, [storage]);
  
  const getDisputesByOrder = useCallback((orderId: string) => {
    return disputes.filter(dispute => dispute.orderId === orderId);
  }, [disputes]);
  
  const getDisputesByStatus = useCallback((status: Dispute['status']) => {
    return disputes.filter(dispute => dispute.status === status);
  }, [disputes]);
  
  const getUserReputation = useCallback((userId: string) => {
    return userReputations.find(rep => rep.userId === userId);
  }, [userReputations]);
  
  const disputeStats = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter(d => d.status === 'open').length;
    const analyzing = disputes.filter(d => d.status === 'ai_analyzing').length;
    const underReview = disputes.filter(d => d.status === 'under_review').length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const aiResolved = disputes.filter(d => d.resolvedBy === 'ai').length;
    const humanResolved = disputes.filter(d => d.resolvedBy === 'moderator').length;
    
    return {
      total,
      open,
      analyzing,
      underReview,
      resolved,
      aiResolved,
      humanResolved,
      aiResolutionRate: total > 0 ? (aiResolved / total) * 100 : 0,
    };
  }, [disputes]);
  
  return useMemo(() => ({
    disputes,
    resolutions,
    userReputations,
    isLoading,
    disputeStats,
    createDispute,
    addEvidence,
    triggerAIAnalysis,
    resolveDispute,
    updateUserReputation,
    getDisputesByOrder,
    getDisputesByStatus,
    getUserReputation,
  }), [
    disputes,
    resolutions,
    userReputations,
    isLoading,
    disputeStats,
    createDispute,
    addEvidence,
    triggerAIAnalysis,
    resolveDispute,
    updateUserReputation,
    getDisputesByOrder,
    getDisputesByStatus,
    getUserReputation,
  ]);
});