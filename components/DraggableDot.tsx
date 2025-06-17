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

interface DraggableDotProps {
  position: {
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
  };
  color?: string;
  onPositionChange?: () => void;
  bounds?: {
    MIN_X: number;
    MAX_X: number;
    MIN_Y: number;
    MAX_Y: number;
  };
}

// Clamp function to constrain values within bounds
const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

export default function DraggableDot({ 
  position, 
  color = '#2ECC71', 
  onPositionChange,
  bounds = { MIN_X: 40, MAX_X: 320, MIN_Y: 40, MAX_Y: 600 }
}: DraggableDotProps) {
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      // Apply constraints to keep dot within bounds
      // Use current position + translation to avoid jumping
      const newX = clamp(
        position.x.value + event.changeX,
        bounds.MIN_X,
        bounds.MAX_X
      );
      const newY = clamp(
        position.y.value + event.changeY,
        bounds.MIN_Y,
        bounds.MAX_Y
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
      
      // Trigger intersection check
      if (onPositionChange) {
        runOnJS(onPositionChange)();
      }
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
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: color },
          animatedStyle
        ]} 
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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