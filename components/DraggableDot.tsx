import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { BOUNDS } from '@/app/(tabs)/index';

interface DraggableDotProps {
  position: {
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
  };
}

// Clamp function to constrain values within bounds
const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

export default function DraggableDot({ position }: DraggableDotProps) {
  // Store initial position for gesture
  const startPosition = { x: 0, y: 0 };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startPosition.x = position.x.value;
      startPosition.y = position.y.value;
    })
    .onUpdate((event) => {
      'worklet';
      // Apply constraints to keep dot within bounds
      const newX = clamp(
        startPosition.x + event.translationX,
        BOUNDS.MIN_X,
        BOUNDS.MAX_X
      );
      const newY = clamp(
        startPosition.y + event.translationY,
        BOUNDS.MIN_Y,
        BOUNDS.MAX_Y
      );
      
      position.x.value = newX;
      position.y.value = newY;
    })
    .onEnd(() => {
      'worklet';
      // Add subtle spring animation when gesture ends
      position.x.value = withSpring(position.x.value, {
        damping: 15,
        stiffness: 150,
      });
      position.y.value = withSpring(position.y.value, {
        damping: 15,
        stiffness: 150,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: position.x.value - 15 }, // Center the dot (radius = 15)
        { translateY: position.y.value - 15 },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.dot, animatedStyle]} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2ECC71',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.3)',
      },
    }),
    // Ensure dots are always visible and interactive
    zIndex: 10,
  },
});