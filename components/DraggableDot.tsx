import React, { useRef } from 'react';
import { StyleSheet, Platform, View, PanResponder } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useSharedValue,
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
  
  // Store the starting position when gesture begins
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  
  // Web-specific pan responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        startX.value = position.x.value;
        startY.value = position.y.value;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = clamp(
          startX.value + gestureState.dx,
          bounds.MIN_X,
          bounds.MAX_X
        );
        const newY = clamp(
          startY.value + gestureState.dy,
          bounds.MIN_Y,
          bounds.MAX_Y
        );
        
        position.x.value = newX;
        position.y.value = newY;
      },
      onPanResponderRelease: () => {
        position.x.value = withSpring(position.x.value, {
          damping: 15,
          stiffness: 150,
        });
        position.y.value = withSpring(position.y.value, {
          damping: 15,
          stiffness: 150,
        });
        
        if (onPositionChange) {
          onPositionChange();
        }
      },
    })
  ).current;

  // Native gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = position.x.value;
      startY.value = position.y.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newX = clamp(
        startX.value + event.translationX,
        bounds.MIN_X,
        bounds.MAX_X
      );
      const newY = clamp(
        startY.value + event.translationY,
        bounds.MIN_Y,
        bounds.MAX_Y
      );
      
      position.x.value = newX;
      position.y.value = newY;
    })
    .onEnd(() => {
      'worklet';
      position.x.value = withSpring(position.x.value, {
        damping: 15,
        stiffness: 150,
      });
      position.y.value = withSpring(position.y.value, {
        damping: 15,
        stiffness: 150,
      });
      
      if (onPositionChange) {
        runOnJS(onPositionChange)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: position.x.value - 15 },
        { translateY: position.y.value - 15 },
      ],
    };
  });

  // Web implementation with PanResponder
  if (Platform.OS === 'web') {
    return (
      <Animated.View 
        style={[
          styles.dot, 
          { backgroundColor: color },
          animatedStyle
        ]}
        {...panResponder.panHandlers}
      />
    );
  }

  // Native implementation with GestureDetector
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
    cursor: Platform.OS === 'web' ? 'grab' : 'default',
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
        userSelect: 'none',
      },
    }),
    zIndex: 10,
  },
});