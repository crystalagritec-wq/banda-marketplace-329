import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

type Direction = 'left' | 'right' | 'top' | 'bottom';

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: Direction;
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export default function SlideInView({
  children,
  direction = 'bottom',
  duration = 500,
  delay = 0,
  distance = 50,
  style,
}: SlideInViewProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initialValue = direction === 'left' || direction === 'right' ? distance : 0;
    const initialValueY = direction === 'top' || direction === 'bottom' ? distance : 0;

    if (direction === 'left') {
      translateX.setValue(-initialValue);
    } else if (direction === 'right') {
      translateX.setValue(initialValue);
    } else if (direction === 'top') {
      translateY.setValue(-initialValueY);
    } else {
      translateY.setValue(initialValueY);
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, translateY, opacity, direction, duration, delay, distance]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
