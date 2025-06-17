import React, { useRef, useEffect } from 'react';
import { Platform, View, PanResponder, AppState } from 'react-native';
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
  
  // Enhanced state management with memory leak prevention
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isPressed = useSharedValue(false);
  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  
  // Track the last valid position to prevent jumping
  const lastValidX = useSharedValue(position.x.value);
  const lastValidY = useSharedValue(position.y.value);
  
  // Performance optimization: Throttle position change callbacks
  const lastCallbackTime = useRef(0);
  const CALLBACK_THROTTLE = 32; // ~30fps for better performance
  
  // Enhanced throttled callback with memory leak prevention
  const throttledPositionChange = () => {
    if (!isMountedRef.current) return;
    
    const now = Date.now();
    if (now - lastCallbackTime.current > CALLBACK_THROTTLE) {
      lastCallbackTime.current = now;
      if (onPositionChange) {
        onPositionChange();
      }
    }
  };

  // App state management for performance
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState.match(/inactive|background/)) {
        // App is going to background - stop any ongoing gestures
        if (isDragging.value) {
          isDragging.value = false;
          isPressed.value = false;
          setDragging(false);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Component lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Clean up any ongoing gestures
      if (isDragging.value) {
        setDragging(false);
      }
    };
  }, []);
  
  // Enhanced web-specific pan responder with memory leak prevention
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isMountedRef.current && appStateRef.current === 'active',
      onMoveShouldSetPanResponderCapture: () => isMountedRef.current && appStateRef.current === 'active',
      onPanResponderGrant: (evt) => {
        if (!isMountedRef.current) return;
        
        startX.value = position.x.value;
        startY.value = position.y.value;
        lastValidX.value = position.x.value;
        lastValidY.value = position.y.value;
        isDragging.value = true;
        isPressed.value = true;
        setDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isMountedRef.current || appStateRef.current !== 'active') return;
        
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
        
        // Update position immediately
        position.x.value = newX;
        position.y.value = newY;
        lastValidX.value = newX;
        lastValidY.value = newY;
        
        throttledPositionChange();
      },
      onPanResponderRelease: () => {
        if (!isMountedRef.current) return;
        
        isDragging.value = false;
        isPressed.value = false;
        
        // Ensure final position is within bounds
        const finalX = clamp(position.x.value, bounds.minX, bounds.maxX);
        const finalY = clamp(position.y.value, bounds.minY, bounds.maxY);
        
        position.x.value = withSpring(finalX, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
        position.y.value = withSpring(finalY, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
        
        lastValidX.value = finalX;
        lastValidY.value = finalY;
        
        setDragging(false);
        
        if (onPositionChange) {
          onPositionChange();
        }
      },
      onPanResponderTerminate: () => {
        if (!isMountedRef.current) return;
        
        // Handle gesture termination - restore to last valid position
        isDragging.value = false;
        isPressed.value = false;
        
        position.x.value = withSpring(lastValidX.value, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
        position.y.value = withSpring(lastValidY.value, {
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

  // Enhanced native gesture handler with better performance and memory management
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      if (!isMountedRef.current) return;
      
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
      if (!isMountedRef.current) return;
      
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
        
        // Throttle callback for performance
        runOnJS(throttledPositionChange)();
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isMountedRef.current) return;
      
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
      
      // Smooth spring animation to final position
      position.x.value = withSpring(finalX, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
      position.y.value = withSpring(finalY, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
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
      if (isDragging.value && isMountedRef.current) {
        isDragging.value = false;
        isPressed.value = false;
        runOnJS(setDragging)(false);
      }
    })
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .activateAfterLongPress(0)
    .maxPointers(1)
    .runOnJS(false);

  // Enhanced animated style with better performance
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Enhanced visual feedback with better scaling and positioning
    const scale = withTiming(
      isPressed.value ? 1.3 : isDragging.value ? 1.2 : 1.0,
      { duration: 150 }
    );
    
    const opacity = withTiming(
      isDragging.value ? 0.9 : 1.0,
      { duration: 100 }
    );
    
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

  // Web implementation with enhanced PanResponder
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