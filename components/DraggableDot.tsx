import React, { useRef } from 'react';
import { Platform, View, PanResponder } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useSharedValue,
  withTiming,
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
  const isPressed = useSharedValue(false);
  
  // Track the last valid position to prevent jumping
  const lastValidX = useSharedValue(position.x.value);
  const lastValidY = useSharedValue(position.y.value);
  
  // Throttle position updates to reduce CPU usage
  const updateThrottleRef = useRef<NodeJS.Timeout | null>(null);
  
  const throttledPositionUpdate = (callback: () => void) => {
    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
    }
    updateThrottleRef.current = setTimeout(callback, 16); // ~60fps
  };
  
  // Web-specific pan responder with optimizations
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        startX.value = position.x.value;
        startY.value = position.y.value;
        lastValidX.value = position.x.value;
        lastValidY.value = position.y.value;
        isDragging.value = true;
        isPressed.value = true;
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
        
        // Update position immediately for smooth dragging
        position.x.value = newX;
        position.y.value = newY;
        lastValidX.value = newX;
        lastValidY.value = newY;
        
        // Throttle callback to reduce CPU usage
        if (onPositionChange) {
          throttledPositionUpdate(onPositionChange);
        }
      },
      onPanResponderRelease: () => {
        isDragging.value = false;
        isPressed.value = false;
        
        // Ensure final position is within bounds
        const finalX = clamp(position.x.value, bounds.minX, bounds.maxX);
        const finalY = clamp(position.y.value, bounds.minY, bounds.maxY);
        
        // Reduced spring animation for better performance
        position.x.value = withSpring(finalX, {
          damping: 25,
          stiffness: 300,
          mass: 0.5,
        });
        position.y.value = withSpring(finalY, {
          damping: 25,
          stiffness: 300,
          mass: 0.5,
        });
        
        lastValidX.value = finalX;
        lastValidY.value = finalY;
        
        setDragging(false);
        
        if (onPositionChange) {
          onPositionChange();
        }
      },
      onPanResponderTerminate: () => {
        isDragging.value = false;
        isPressed.value = false;
        
        // Reduced spring animation for better performance
        position.x.value = withSpring(lastValidX.value, {
          damping: 25,
          stiffness: 300,
          mass: 0.5,
        });
        position.y.value = withSpring(lastValidY.value, {
          damping: 25,
          stiffness: 300,
          mass: 0.5,
        });
        
        setDragging(false);
        
        if (onPositionChange) {
          onPositionChange();
        }
      },
    })
  ).current;

  // Optimized native gesture handler
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      startX.value = position.x.value;
      startY.value = position.y.value;
      lastValidX.value = position.x.value;
      lastValidY.value = position.y.value;
      isDragging.value = true;
      isPressed.value = true;
      runOnJS(setDragging)(true);
    })
    .onUpdate((event) => {
      'worklet';
      // Calculate new position based on translation
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
      
      // Update position with validation
      if (!isNaN(newX) && !isNaN(newY) && isFinite(newX) && isFinite(newY)) {
        position.x.value = newX;
        position.y.value = newY;
        lastValidX.value = newX;
        lastValidY.value = newY;
        
        // Throttle callback updates
        if (onPositionChange && event.translationX % 4 === 0) { // Only call every 4th update
          runOnJS(onPositionChange)();
        }
      }
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
      isPressed.value = false;
      
      // Ensure final position is valid and within bounds
      const finalX = clamp(
        isNaN(position.x.value) ? lastValidX.value : position.x.value,
        bounds.minX,
        bounds.maxX
      );
      const finalY = clamp(
        isNaN(position.y.value) ? lastValidY.value : position.y.value,
        bounds.minY,
        bounds.maxY
      );
      
      // Optimized spring animation
      position.x.value = withSpring(finalX, {
        damping: 25,
        stiffness: 300,
        mass: 0.5,
      });
      position.y.value = withSpring(finalY, {
        damping: 25,
        stiffness: 300,
        mass: 0.5,
      });
      
      lastValidX.value = finalX;
      lastValidY.value = finalY;
      
      runOnJS(setDragging)(false);
      
      if (onPositionChange) {
        runOnJS(onPositionChange)();
      }
    })
    .onFinalize(() => {
      'worklet';
      // Fallback to ensure state is properly reset
      if (isDragging.value) {
        isDragging.value = false;
        isPressed.value = false;
        runOnJS(setDragging)(false);
      }
    })
    .minDistance(2) // Slightly higher threshold to prevent accidental drags
    .shouldCancelWhenOutside(false)
    .activateAfterLongPress(0)
    .maxPointers(1)
    .runOnJS(false);

  // Optimized animated style with reduced calculations
  const animatedStyle = useAnimatedStyle(() => {
    // Simplified scaling animation
    const scale = isPressed.value ? 1.2 : 1.0;
    const opacity = isDragging.value ? 0.9 : 1.0;
    
    // Ensure valid position values
    const x = isNaN(position.x.value) ? lastValidX.value : position.x.value;
    const y = isNaN(position.y.value) ? lastValidY.value : position.y.value;
    
    return {
      transform: [
        { translateX: x - 25 },
        { translateY: y - 25 },
        { scale },
      ],
      opacity,
      zIndex: isDragging.value ? 1000 : 10,
    };
  });

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateThrottleRef.current) {
        clearTimeout(updateThrottleRef.current);
      }
    };
  }, []);

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

  // Native implementation with enhanced GestureDetector
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