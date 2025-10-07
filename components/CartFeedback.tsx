import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { ShoppingCart, CheckCircle2, Plus, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { usePathname } from 'expo-router';

type FeedbackType = 'add' | 'update' | 'remove' | 'success';

interface CartFeedbackProps {
  visible: boolean;
  type: FeedbackType;
  message: string;
  onHide: () => void;
  count?: number;
}

export default function CartFeedback({ visible, type, message, onHide, count = 1 }: CartFeedbackProps) {
  const pathname = usePathname();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [displayCount, setDisplayCount] = useState<number>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isMarketplaceOrCart = pathname === '/(tabs)/marketplace' || pathname === '/(tabs)/cart';

  useEffect(() => {
    if (visible) {
      setDisplayCount(count);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.8);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      const hideDelay = isMarketplaceOrCart ? 1500 : 2500;
      
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
          setDisplayCount(1);
        });
      }, hideDelay);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.8);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, count, translateY, opacity, scale, onHide, isMarketplaceOrCart]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'add':
        return <Plus size={20} color="#FFFFFF" />;
      case 'update':
        return <ShoppingCart size={20} color="#FFFFFF" />;
      case 'remove':
        return <Trash2 size={20} color="#FFFFFF" />;
      case 'success':
        return <CheckCircle2 size={20} color="#FFFFFF" />;
      default:
        return <ShoppingCart size={20} color="#FFFFFF" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'add':
        return '#10B981';
      case 'update':
        return '#3B82F6';
      case 'remove':
        return '#EF4444';
      case 'success':
        return '#10B981';
      default:
        return '#10B981';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.messageContainer}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {displayCount > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>×{displayCount}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
