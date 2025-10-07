import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { roleService } from '@/services/role-service';
import { UserRole, VerificationMethod } from '@/lib/supabase';
import { Upload, Camera, FileText, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react-native';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
}

const VERIFICATION_STEPS: Record<VerificationMethod, VerificationStep[]> = {
  ai_id: [
    {
      id: 'id_front',
      title: 'ID Front',
      description: 'Clear photo of the front of your ID card',
      icon: FileText,
      required: true
    },
    {
      id: 'id_back',
      title: 'ID Back',
      description: 'Clear photo of the back of your ID card',
      icon: FileText,
      required: true
    },
    {
      id: 'selfie',
      title: 'Selfie',
      description: 'Take a selfie holding your ID card',
      icon: Camera,
      required: true
    }
  ],
  human_qr: [
    {
      id: 'id_documents',
      title: 'ID Documents',
      description: 'Upload your identification documents',
      icon: FileText,
      required: true
    },
    {
      id: 'business_license',
      title: 'Business License',
      description: 'Upload your business registration documents',
      icon: FileText,
      required: false
    },
    {
      id: 'location_proof',
      title: 'Location Proof',
      description: 'Proof of business location or address',
      icon: FileText,
      required: false
    }
  ],
  admin_approval: [
    {
      id: 'application_form',
      title: 'Application Form',
      description: 'Complete the elite tier application form',
      icon: FileText,
      required: true
    },
    {
      id: 'business_plan',
      title: 'Business Plan',
      description: 'Upload your detailed business plan',
      icon: FileText,
      required: true
    },
    {
      id: 'references',
      title: 'References',
      description: 'Provide business references and testimonials',
      icon: FileText,
      required: false
    }
  ]
};

export default function VerificationScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const roleType = params.roleType as UserRole;
  const verificationMethod = params.verificationMethod as VerificationMethod;
  
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = VERIFICATION_STEPS[verificationMethod] || [];
  const requiredSteps = steps.filter(step => step.required);
  const completedRequired = requiredSteps.filter(step => uploadedDocuments[step.id]).length;
  const canSubmit = completedRequired === requiredSteps.length;

  const handleDocumentUpload = (stepId: string) => {
    // In a real app, this would open camera or file picker
    // For demo, we'll simulate document upload
    console.log('📸 Uploading document for step:', stepId);
    
    // Simulate document upload
    const mockDocumentUrl = `https://example.com/documents/${stepId}_${Date.now()}.jpg`;
    setUploadedDocuments(prev => ({
      ...prev,
      [stepId]: mockDocumentUrl
    }));
  };

  const handleSubmitVerification = async () => {
    if (!user || !canSubmit) return;

    try {
      setIsSubmitting(true);
      
      const documentUrls = Object.values(uploadedDocuments);
      
      const result = await roleService.requestRoleUpgrade({
        userId: user.id,
        roleType,
        verificationMethod,
        documentUrls
      });

      if (result.success) {
        router.push({
          pathname: '/verification-success' as any,
          params: {
            roleType,
            verificationMethod,
            message: result.message || 'Verification submitted successfully!'
          }
        });
      } else {
        console.error('❌ Verification submission failed:', result.error);
        // In a real app, show error modal instead of alert
      }
    } catch (error) {
      console.error('❌ Verification submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationTitle = () => {
    switch (verificationMethod) {
      case 'ai_id':
        return 'AI ID Verification';
      case 'human_qr':
        return 'Human + QR Verification';
      case 'admin_approval':
        return 'Admin Approval';
      default:
        return 'Verification';
    }
  };

  const getVerificationDescription = () => {
    switch (verificationMethod) {
      case 'ai_id':
        return 'Upload your ID documents for automated verification. This usually takes a few minutes.';
      case 'human_qr':
        return 'Upload your documents for human review and QR code verification by our field agents.';
      case 'admin_approval':
        return 'Submit your application for admin review. This process may take 3-5 business days.';
      default:
        return 'Complete the verification process to upgrade your account.';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getVerificationTitle()}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Document Verification</Text>
          <Text style={styles.description}>
            {getVerificationDescription()}
          </Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progress: {completedRequired}/{requiredSteps.length} required documents
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(completedRequired / requiredSteps.length) * 100}%` }
                ]}
              />
            </View>
          </View>

          <View style={styles.stepsContainer}>
            {steps.map((step) => {
              const Icon = step.icon;
              const isUploaded = !!uploadedDocuments[step.id];
              
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[
                    styles.stepCard,
                    isUploaded && styles.stepCardCompleted
                  ]}
                  onPress={() => handleDocumentUpload(step.id)}
                  testID={`upload-${step.id}`}
                >
                  <View style={styles.stepHeader}>
                    <View style={[
                      styles.stepIconContainer,
                      isUploaded && styles.stepIconContainerCompleted
                    ]}>
                      {isUploaded ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : (
                        <Icon size={24} color="#6B7280" />
                      )}
                    </View>
                    <View style={styles.stepInfo}>
                      <View style={styles.stepTitleRow}>
                        <Text style={[
                          styles.stepTitle,
                          isUploaded && styles.stepTitleCompleted
                        ]}>
                          {step.title}
                        </Text>
                        {step.required && (
                          <Text style={styles.requiredBadge}>Required</Text>
                        )}
                      </View>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                  
                  {!isUploaded && (
                    <View style={styles.uploadButton}>
                      <Upload size={16} color="#3B82F6" />
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </View>
                  )}
                  
                  {isUploaded && (
                    <Text style={styles.uploadedText}>✓ Uploaded</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Important Notes:</Text>
            <Text style={styles.infoText}>
              • Ensure all documents are clear and readable{'\n'}
              • Photos should be well-lit with no glare{'\n'}
              • All information must be clearly visible{'\n'}
              • Documents must be valid and not expired
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitVerification}
          disabled={!canSubmit || isSubmitting}
          testID="submit-verification"
        >
          <Text style={[
            styles.submitButtonText,
            !canSubmit && styles.submitButtonTextDisabled
          ]}>
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </Text>
          {canSubmit && !isSubmitting && (
            <ArrowRight size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  stepsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stepCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconContainerCompleted: {
    backgroundColor: '#DCFCE7',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepTitleCompleted: {
    color: '#059669',
  },
  requiredBadge: {
    fontSize: 12,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  uploadedText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
});