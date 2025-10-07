import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Loader2, Leaf, ShoppingCart } from 'lucide-react-native';

interface LoadingAnimationProps {
  visible: boolean;
  message?: string;
  type?: 'default' | 'marketplace' | 'cart' | 'minimal';
  overlay?: boolean;
}

export default function LoadingAnimation({
  visible,
  message = 'Loading...',
  type = 'default',
  overlay = true,
}: LoadingAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim1 = useRef(new Animated.Value(0)).current;
  const dotsAnim2 = useRef(new Animated.Value(0)).current;
  const dotsAnim3 = useRef(new Animated.Value(0)).current;

  const startAnimations = useCallback(() => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Dots animation
      const dotsAnimation = Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dotsAnim1, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dotsAnim1, {
              toValue: 0,
              duration: 600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotsAnim2, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dotsAnim2, {
              toValue: 0,
              duration: 600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotsAnim3, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dotsAnim3, {
              toValue: 0,
              duration: 600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      dotsAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      dotsAnimation.stop();
    };
  }, [fadeAnim, scaleAnim, rotateAnim, pulseAnim, dotsAnim1, dotsAnim2, dotsAnim3]);

  const stopAnimations = useCallback(() => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.timing(scaleAnim, {
      toValue: 0.8,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (visible) {
      const cleanup = startAnimations();
      return cleanup;
    } else {
      stopAnimations();
    }
  }, [visible, startAnimations, stopAnimations]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderIcon = () => {
    switch (type) {
      case 'marketplace':
        return (
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <Leaf size={32} color="#2D5016" />
          </Animated.View>
        );
      case 'cart':
        return (
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <ShoppingCart size={32} color="#2D5016" />
          </Animated.View>
        );
      case 'minimal':
        return (
          <Animated.View
            style={[
              styles.minimalSpinner,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          />
        );
      default:
        return (
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: rotateInterpolate },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <Loader2 size={32} color="#2D5016" />
          </Animated.View>
        );
    }
  };

  const renderDots = () => {
    if (type === 'minimal') return null;
    
    return (
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dotsAnim1,
              transform: [
                {
                  translateY: dotsAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dotsAnim2,
              transform: [
                {
                  translateY: dotsAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dotsAnim3,
              transform: [
                {
                  translateY: dotsAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  };

  if (!visible) return null;

  const content = (
    <Animated.View
      style={[
        type === 'minimal' ? styles.minimalContainer : styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {type !== 'minimal' && (
        <LinearGradient
          colors={['#F5F5DC', '#FFFFFF']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {renderIcon()}
            <Text style={styles.message}>{message}</Text>
            {renderDots()}
          </View>
        </LinearGradient>
      )}
      
      {type === 'minimal' && (
        <View style={styles.minimalContent}>
          {renderIcon()}
        </View>
      )}
    </Animated.View>
  );

  if (overlay && type !== 'minimal') {
    return (
      <View style={styles.overlay}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  gradient: {
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45, 80, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(45, 80, 22, 0.2)',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D5016',
  },
  minimalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderTopColor: '#2D5016',
  },
});