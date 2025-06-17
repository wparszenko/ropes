import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';

const { width, height } = Dimensions.get('window');

// Game boundaries - adjusted for better web experience
export const BOUNDS = {
  MIN_X: 40,
  MAX_X: width - 40,
  MIN_Y: 150,
  MAX_Y: height - 100,
};

export default function CableDemo() {
  // Cable 1 (Red) - shared values for endpoints
  const cable1Start = {
    x: useSharedValue(80),
    y: useSharedValue(200),
  };
  const cable1End = {
    x: useSharedValue(280),
    y: useSharedValue(350),
  };

  // Cable 2 (Blue) - shared values for endpoints
  const cable2Start = {
    x: useSharedValue(120),
    y: useSharedValue(450),
  };
  const cable2End = {
    x: useSharedValue(240),
    y: useSharedValue(300),
  };

  const containerContent = (
    <View style={styles.container}>
      {/* SVG Layer - Behind dots */}
      <View style={styles.svgContainer}>
        <Svg width={width} height={height} style={styles.svg}>
          {/* Cable 1 - Red */}
          <RopePath
            startPoint={cable1Start}
            endPoint={cable1End}
            color="#E74C3C"
          />
          
          {/* Cable 2 - Blue */}
          <RopePath
            startPoint={cable2Start}
            endPoint={cable2End}
            color="#3498DB"
          />
        </Svg>
      </View>

      {/* Dots Layer - Above SVG */}
      <View style={styles.dotsContainer}>
        {/* Draggable dots for Cable 1 */}
        <DraggableDot position={cable1Start} />
        <DraggableDot position={cable1End} />

        {/* Draggable dots for Cable 2 */}
        <DraggableDot position={cable2Start} />
        <DraggableDot position={cable2End} />
      </View>
    </View>
  );

  // Wrap in GestureHandlerRootView only on native platforms
  if (Platform.OS === 'web') {
    return containerContent;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {containerContent}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    // Ensure SVG doesn't interfere with touch events
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dotsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    // Allow touch events to pass through to dots
    pointerEvents: 'box-none',
  },
});