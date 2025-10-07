import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Package, Wrench, MessageSquare, X, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PostModal({ visible, onClose }: PostModalProps) {
  const router = useRouter();
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const [checkingShop, setCheckingShop] = useState<boolean>(false);
  const [checkingService, setCheckingService] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [onboardingType, setOnboardingType] = useState<'shop' | 'service' | null>(null);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scaleValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, scaleValue]);

  const handleOptionPress = async (type: 'product' | 'service' | 'request') => {
    if (type === 'request') {
      onClose();
      router.push('/post-request');
      return;
    }

    if (type === 'product') {
      setCheckingShop(true);
      try {
        const shopData = await trpcClient.shop.getMyShop.query();
        setCheckingShop(false);

        if (shopData.exists) {
          onClose();
          router.push('/post-product');
        } else {
          setOnboardingType('shop');
          setShowOnboardingModal(true);
        }
      } catch (error: any) {
        setCheckingShop(false);
        Alert.alert('Error', error.message || 'Failed to check shop status');
      }
      return;
    }

    if (type === 'service') {
      setCheckingService(true);
      try {
        const serviceData = await trpcClient.serviceProviders.getMyProfile.query();
        setCheckingService(false);

        if (serviceData.exists) {
          onClose();
          router.push('/post-service');
        } else {
          setOnboardingType('service');
          setShowOnboardingModal(true);
        }
      } catch (error: any) {
        setCheckingService(false);
        Alert.alert('Error', error.message || 'Failed to check service profile');
      }
      return;
    }
  };

  const handleOnboardingConfirm = () => {
    setShowOnboardingModal(false);
    onClose();
    
    if (onboardingType === 'shop') {
      router.push('/shop-activation' as any);
    } else if (onboardingType === 'service') {
      router.push('/inboarding/service-role' as any);
    }
    
    setOnboardingType(null);
  };

  const handleOnboardingCancel = () => {
    setShowOnboardingModal(false);
    setOnboardingType(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modal}>
              <View style={styles.header}>
                <Text style={styles.title}>What would you like to post?</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  testID="close-post-modal"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress('product')}
                  testID="post-product-option"
                  disabled={checkingShop}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#E8F5E8' }]}>
                    {checkingShop ? (
                      <ActivityIndicator size="small" color={GREEN} />
                    ) : (
                      <Package size={32} color={GREEN} />
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>🛒 Product</Text>
                    <Text style={styles.optionDescription}>
                      Sell seeds, produce, equipment, or other farm products
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress('service')}
                  testID="post-service-option"
                  disabled={checkingService}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#FFF3E0' }]}>
                    {checkingService ? (
                      <ActivityIndicator size="small" color={ORANGE} />
                    ) : (
                      <Wrench size={32} color={ORANGE} />
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>🛠️ Service</Text>
                    <Text style={styles.optionDescription}>
                      Offer farming services, equipment rental, or expertise
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress('request')}
                  testID="post-request-option"
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                    <MessageSquare size={32} color="#2196F3" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>📢 Request</Text>
                    <Text style={styles.optionDescription}>
                      Request products, services, or labor from the community
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.draftButton}
                  onPress={() => {
                    onClose();
                    router.push('/my-drafts');
                  }}
                >
                  <Text style={styles.draftButtonText}>View My Drafts</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.postsButton}
                  onPress={() => {
                    onClose();
                    router.push('/my-posts');
                  }}
                >
                  <Text style={styles.postsButtonText}>View My Posts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>

      <Modal
        visible={showOnboardingModal}
        transparent
        animationType="fade"
        onRequestClose={handleOnboardingCancel}
      >
        <View style={styles.onboardingOverlay}>
          <View style={styles.onboardingModal}>
            <View style={styles.onboardingIcon}>
              <AlertCircle size={48} color="#F59E0B" />
            </View>
            <Text style={styles.onboardingTitle}>
              {onboardingType === 'shop'
                ? 'Complete Your Shop Setup'
                : 'Complete Service Provider Onboarding'}
            </Text>
            <Text style={styles.onboardingDescription}>
              {onboardingType === 'shop'
                ? 'You need to set up your shop before posting products. This only takes a few minutes.'
                : 'You need to complete your service provider profile before posting services. This only takes a few minutes.'}
            </Text>
            <View style={styles.onboardingButtons}>
              <TouchableOpacity
                style={styles.onboardingCancelButton}
                onPress={handleOnboardingCancel}
              >
                <Text style={styles.onboardingCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.onboardingConfirmButton}
                onPress={handleOnboardingConfirm}
              >
                <Text style={styles.onboardingConfirmText}>Finish Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  options: {
    gap: 16,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  postsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
  },
  postsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
  onboardingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  onboardingModal: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  onboardingIcon: {
    marginBottom: 20,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  onboardingDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  onboardingButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  onboardingCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  onboardingCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  onboardingConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
  },
  onboardingConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: WHITE,
  },
});