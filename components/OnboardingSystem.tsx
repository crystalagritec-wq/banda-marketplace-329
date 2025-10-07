import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Info,
  HelpCircle,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#2E7D32',
  secondary: '#F57C00',
  accent: '#E91E63',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  tooltip: '#1F2937',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

interface TooltipProps {
  visible: boolean;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetRef: React.RefObject<View>;
  onClose: () => void;
  type?: 'info' | 'tip' | 'warning' | 'success';
  showArrow?: boolean;
  autoHide?: boolean;
  duration?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  text,
  position,
  targetRef,
  onClose,
  type = 'info',
  showArrow = true,
  autoHide = true,
  duration = 3000,
}) => {
  const [targetLayout, setTargetLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  useEffect(() => {
    if (visible && targetRef.current) {
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTargetLayout({ x: pageX, y: pageY, width, height });
      });
    }
  }, [visible, targetRef]);

  useEffect(() => {
    if (visible) {
      triggerHaptic();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoHide) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, onClose, autoHide, duration, triggerHaptic]);

  const getTooltipStyle = () => {
    if (!targetLayout) return {};

    const tooltipWidth = 200;
    const tooltipHeight = 60;
    const arrowSize = 8;
    const margin = 12;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetLayout.y - tooltipHeight - arrowSize - margin;
        left = targetLayout.x + (targetLayout.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = targetLayout.y + targetLayout.height + arrowSize + margin;
        left = targetLayout.x + (targetLayout.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetLayout.y + (targetLayout.height / 2) - (tooltipHeight / 2);
        left = targetLayout.x - tooltipWidth - arrowSize - margin;
        break;
      case 'right':
        top = targetLayout.y + (targetLayout.height / 2) - (tooltipHeight / 2);
        left = targetLayout.x + targetLayout.width + arrowSize + margin;
        break;
    }

    // Ensure tooltip stays within screen bounds
    left = Math.max(margin, Math.min(left, screenWidth - tooltipWidth - margin));
    top = Math.max(margin, Math.min(top, screenHeight - tooltipHeight - margin));

    return { top, left, width: tooltipWidth, height: tooltipHeight };
  };

  const getTypeColor = () => {
    switch (type) {
      case 'warning':
        return COLORS.warning;
      case 'success':
        return COLORS.success;
      case 'tip':
        return COLORS.primary;
      default:
        return COLORS.tooltip;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'warning':
        return <HelpCircle size={16} color={COLORS.surface} />;
      case 'success':
        return <CheckCircle size={16} color={COLORS.surface} />;
      case 'tip':
        return <Lightbulb size={16} color={COLORS.surface} />;
      default:
        return <Info size={16} color={COLORS.surface} />;
    }
  };

  if (!visible || !targetLayout) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.tooltip,
            getTooltipStyle(),
            { backgroundColor: getTypeColor() },
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.tooltipContent}>
            {getTypeIcon()}
            <Text style={styles.tooltipText} numberOfLines={2}>
              {text}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={14} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          
          {showArrow && (
            <View
              style={[
                styles.arrow,
                styles[`arrow${position.charAt(0).toUpperCase() + position.slice(1)}` as keyof typeof styles],
                { borderTopColor: getTypeColor() },
              ]}
            />
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetRef?: React.RefObject<View>;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    text: string;
    onPress: () => void;
  };
  image?: string;
  icon?: React.ReactNode;
}

interface OnboardingProps {
  visible: boolean;
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  visible,
  steps,
  onComplete,
  onSkip,
  currentStep = 0,
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [targetLayout, setTargetLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const currentStepData = steps[activeStep];

  useEffect(() => {
    if (visible && currentStepData?.targetRef?.current) {
      currentStepData.targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTargetLayout({ x: pageX, y: pageY, width, height });
      });
    } else {
      setTargetLayout(null);
    }
  }, [visible, activeStep, currentStepData]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleNext = useCallback(() => {
    triggerHaptic();
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onComplete();
    }
  }, [activeStep, steps.length, onComplete, triggerHaptic]);

  const handlePrevious = useCallback(() => {
    triggerHaptic();
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep, triggerHaptic]);

  const handleSkip = useCallback(() => {
    triggerHaptic();
    onSkip();
  }, [onSkip, triggerHaptic]);

  const getSpotlightStyle = () => {
    if (!targetLayout) return {};

    const padding = 8;
    return {
      top: targetLayout.y - padding,
      left: targetLayout.x - padding,
      width: targetLayout.width + (padding * 2),
      height: targetLayout.height + (padding * 2),
      borderRadius: 12,
    };
  };

  const getModalPosition = () => {
    if (currentStepData?.position === 'center' || !targetLayout) {
      return {
        top: screenHeight / 2 - 150,
        left: 20,
        right: 20,
      };
    }

    const modalHeight = 200;
    const margin = 20;

    let top = 0;
    let left = margin;
    let right = margin;

    switch (currentStepData?.position) {
      case 'top':
        top = targetLayout.y - modalHeight - 20;
        break;
      case 'bottom':
        top = targetLayout.y + targetLayout.height + 20;
        break;
      default:
        top = screenHeight - modalHeight - 100;
        break;
    }

    // Ensure modal stays within screen bounds
    top = Math.max(margin, Math.min(top, screenHeight - modalHeight - margin));

    return { top, left, right };
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.onboardingOverlay}>
        {/* Spotlight */}
        {targetLayout && (
          <View style={[styles.spotlight, getSpotlightStyle()]} />
        )}

        {/* Onboarding Modal */}
        <Animated.View
          style={[
            styles.onboardingModal,
            getModalPosition(),
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.onboardingHeader}>
            <View style={styles.stepIndicator}>
              {currentStepData?.icon || <Sparkles size={20} color={COLORS.primary} />}
              <Text style={styles.stepText}>
                Step {activeStep + 1} of {steps.length}
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.onboardingContent}>
            <Text style={styles.onboardingTitle}>{currentStepData?.title}</Text>
            <Text style={styles.onboardingDescription}>
              {currentStepData?.description}
            </Text>

            {/* Action Button */}
            {currentStepData?.action && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={currentStepData.action.onPress}
              >
                <Text style={styles.actionButtonText}>
                  {currentStepData.action.text}
                </Text>
                <ArrowRight size={16} color={COLORS.surface} />
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {steps.map((_, index) => (
                <View
                  key={`step-${index}`}
                  style={[
                    styles.progressDot,
                    index === activeStep && styles.progressDotActive,
                    index < activeStep && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.onboardingNavigation}>
            <TouchableOpacity
              style={[styles.navButton, activeStep === 0 && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={activeStep === 0}
            >
              <ChevronLeft size={20} color={activeStep === 0 ? COLORS.textLight : COLORS.primary} />
              <Text style={[styles.navButtonText, activeStep === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ChevronRight size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

interface HintProps {
  visible: boolean;
  text: string;
  onClose: () => void;
  type?: 'tip' | 'feature' | 'update';
  position?: 'top' | 'bottom';
}

export const Hint: React.FC<HintProps> = ({
  visible,
  text,
  onClose,
  type = 'tip',
  position = 'bottom',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -50 : 50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -50 : 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, position, onClose]);

  const getTypeColor = () => {
    switch (type) {
      case 'feature':
        return COLORS.primary;
      case 'update':
        return COLORS.secondary;
      default:
        return COLORS.tooltip;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'feature':
        return <Sparkles size={16} color={COLORS.surface} />;
      case 'update':
        return <Target size={16} color={COLORS.surface} />;
      default:
        return <Lightbulb size={16} color={COLORS.surface} />;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.hint,
        position === 'top' ? styles.hintTop : styles.hintBottom,
        { backgroundColor: getTypeColor() },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.hintContent}>
        {getTypeIcon()}
        <Text style={styles.hintText} numberOfLines={2}>
          {text}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.hintCloseButton}>
          <X size={14} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  tooltipText: {
    flex: 1,
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeButton: {
    padding: 2,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowTop: {
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowBottom: {
    top: -8,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.tooltip,
  },
  arrowLeft: {
    right: -8,
    top: '50%',
    marginTop: -8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.tooltip,
  },
  arrowRight: {
    left: -8,
    top: '50%',
    marginTop: -8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: COLORS.tooltip,
  },

  onboardingOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  onboardingModal: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  onboardingContent: {
    padding: 20,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  onboardingDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
  onboardingNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: COLORS.textLight,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  nextButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },

  hint: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  hintTop: {
    top: 60,
  },
  hintBottom: {
    bottom: 100,
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  hintText: {
    flex: 1,
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  hintCloseButton: {
    padding: 4,
  },
});