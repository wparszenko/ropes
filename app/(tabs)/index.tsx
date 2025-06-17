import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';
import PostMarker from '@/components/PostMarker';

const { width, height } = Dimensions.get('window');

// Game boundaries - adjusted for better web experience
export const BOUNDS = {
  MIN_X: 40,
  MAX_X: width - 40,
  MIN_Y: 150,
  MAX_Y: height - 100,
};

const POSTS = {
  A: { x: width * 0.2, y: 180 },
  B: { x: width * 0.8, y: 180 },
  C: { x: width * 0.2, y: height - 180 },
  D: { x: width * 0.8, y: height - 180 },
};

export default function CableDemo() {
  const [solved, setSolved] = useState(false);

  // Cable 1 (Red)
  const cable1Start = {
    x: useSharedValue(POSTS.A.x),
    y: useSharedValue(POSTS.A.y),
  };
  const cable1End = {
    x: useSharedValue(POSTS.B.x),
    y: useSharedValue(POSTS.B.y),
  };

  // Cable 2 (Blue)
  const cable2Start = {
    x: useSharedValue(POSTS.C.x),
    y: useSharedValue(POSTS.C.y),
  };
  const cable2End = {
    x: useSharedValue(POSTS.D.x),
    y: useSharedValue(POSTS.D.y),
  };

  const isNear = (
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    threshold = 25
  ) => {
    'worklet';
    return Math.hypot(x - targetX, y - targetY) < threshold;
  };

  const checkSolved = () => {
    'worklet';
    return (
      isNear(cable1End.x.value, cable1End.y.value, POSTS.D.x, POSTS.D.y) &&
      isNear(cable2End.x.value, cable2End.y.value, POSTS.B.x, POSTS.B.y)
    );
  };

  const handleDragEnd = () => {
    if (checkSolved()) {
      setSolved(true);
    }
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
        {/* Posts */}
        {Object.entries(POSTS).map(([key, p]) => (
          <PostMarker key={key} label={key} x={p.x} y={p.y} />
        ))}

        {/* Draggable ends */}
        <DraggableDot position={cable1End} onDragEnd={handleDragEnd} />
        <DraggableDot position={cable2End} onDragEnd={handleDragEnd} />
        {solved && <Text style={styles.solved}>Puzzle Solved!</Text>}
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
  solved: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});
