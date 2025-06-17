import React, { useRef } from 'react';
import { Platform, View, PanResponder } from 'react-native';
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
import { useRopeStore } from '@/store/ropeStore';
import { draggableDotStyles } from '@/styles/draggableDotStyles';

interface DraggableDotProps {
  position: {
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
  };
  color?: string;
  onPositionChange?: () => void;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
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
  bounds = { minX: 40, maxX: 320, minY: 40, maxY: 600 }
}: DraggableDotProps) {
  
  const { setDragging } = useRopeStore();
  
  // Store the starting position when gesture begins
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  
  // Web-specific pan responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        startX.value = position.x.value;
        startY.value = position.y.value;
        isDragging.value = true;
        setDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = clamp(
          startX.value + gestureState.dx,
          bounds.minX,
          bounds.maxX
        );
        const newY = clamp(
          startY.value + gestureState.dy,
          bounds.minY,
          bounds.maxY
        );
        
        position.x.value = newX;
        position.y.value = newY;
        
        if (onPositionChange) {
          onPositionChange();
        }
      },
      onPanResponderRelease: () => {
        isDragging.value = false;
        
        // Smooth spring animation on release
        position.x.value = withSpring(position.x.value, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
        position.y.value = withSpring(position.y.value, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
        
        setDragging(false);
        
        if (onPositionChange) {
          onPositionChange();
        }
      },
    })
  ).current;

  // Native gesture handler with improved sensitivity and stability
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = position.x.value;
      startY.value = position.y.value;
      isDragging.value = true;
      runOnJS(setDragging)(true);
    })
    .onUpdate((event) => {
      'worklet';
      const newX = clamp(
        startX.value + event.translationX,
        bounds.minX,
        bounds.maxX
      );
      const newY = clamp(
        startY.value + event.translationY,
        bounds.minY,
        bounds.maxY
      );
      
      position.x.value = newX;
      position.y.value = newY;
      
      if (onPositionChange) {
        runOnJS(onPositionChange)();
      }
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      
      // Smooth spring animation on release
      position.x.value = withSpring(position.x.value, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
      position.y.value = withSpring(position.y.value, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
      
      runOnJS(setDragging)(false);
      
      if (onPositionChange) {
        runOnJS(onPositionChange)();
      }
    })
    .minDistance(0) // Allow immediate response to touch
    .shouldCancelWhenOutside(false) // Don't cancel when dragging outside
    .activateAfterLongPress(0); // Immediate activation

  const animatedStyle = useAnimatedStyle(() => {
    const scale = isDragging.value ? 1.2 : 1.0; // Scale up when dragging
    
    return {
      transform: [
        { translateX: position.x.value - 25 }, // Adjusted for larger dot size
        { translateY: position.y.value - 25 },
        { scale: withSpring(scale, { damping: 15, stiffness: 200 }) },
      ],
    };
  });

  // Web implementation with PanResponder
  if (Platform.OS === 'web') {
    return (
      <Animated.View 
        style={[
          draggableDotStyles.dot, 
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
          draggableDotStyles.dot, 
          { backgroundColor: color },
          animatedStyle
        ]} 
      />
    </GestureDetector>
  );
}