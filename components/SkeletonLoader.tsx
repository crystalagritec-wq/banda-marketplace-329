import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonLoader height={160} borderRadius={12} style={styles.image} />
      <View style={styles.content}>
        <SkeletonLoader height={16} width="80%" style={styles.spacing} />
        <SkeletonLoader height={14} width="60%" style={styles.spacing} />
        <SkeletonLoader height={20} width="40%" style={styles.spacing} />
        <SkeletonLoader height={36} borderRadius={8} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonLoader width={60} height={60} borderRadius={30} />
      <View style={styles.listContent}>
        <SkeletonLoader height={16} width="70%" style={styles.spacing} />
        <SkeletonLoader height={14} width="50%" />
      </View>
    </View>
  );
}

export function HeaderSkeleton() {
  return (
    <View style={styles.header}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <SkeletonLoader height={40} style={{ flex: 1, marginHorizontal: 12 }} borderRadius={20} />
      <SkeletonLoader width={40} height={40} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    marginBottom: 0,
  },
  content: {
    padding: 12,
  },
  spacing: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
});
