import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Platform,
} from 'react-native';
import { ShoppingCart, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface AddToCartButtonProps {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  style?: any;
}

export default function AddToCartButton({
  onPress,
  disabled = false,
  label = 'Add to Cart',
  style,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const cartOpacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
        Animated.timing(cartOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setIsAdded(true);
    onPress();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(checkOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cartOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAdded(false);
      });
    }, 1500);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          isAdded && styles.buttonSuccess,
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.icon, { opacity: cartOpacity }]}>
            <ShoppingCart size={20} color="#FFFFFF" />
          </Animated.View>
          <Animated.View style={[styles.icon, styles.checkIcon, { opacity: checkOpacity }]}>
            <Check size={20} color="#FFFFFF" />
          </Animated.View>
        </View>
        <Text style={styles.buttonText}>{isAdded ? 'Added!' : label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonSuccess: {
    backgroundColor: '#059669',
  },
  iconContainer: {
    position: 'relative',
    width: 20,
    height: 20,
    marginRight: 8,
  },
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  checkIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
