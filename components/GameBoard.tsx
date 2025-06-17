import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';

const { width, height } = Dimensions.get('window');

// Game boundaries - constrained to the game board area
const GAME_BOARD_BOUNDS = {
  MIN_X: 50,  // 16 (margin) + 34 (padding from border)
  MAX_X: width - 82,  // width - 16 (margin) - 50 (padding from border) - 16 (dot radius compensation)
  MIN_Y: 50,  // Top padding
  MAX_Y: height - 350,  // Bottom constraint considering UI elements
};

interface GameBoardProps {
  levelData?: any; // Keep the prop for compatibility but ignore it
}

export default function GameBoard({ levelData }: GameBoardProps) {
  // Cable 1 (Red) - shared values for endpoints
  const cable1Start = {
    x: useSharedValue(100),
    y: useSharedValue(150),
  };
  const cable1End = {
    x: useSharedValue(250),
    y: useSharedValue(250),
  };

  // Cable 2 (Blue) - shared values for endpoints
  const cable2Start = {
    x: useSharedValue(100),
    y: useSharedValue(250),
  };
  const cable2End = {
    x: useSharedValue(250),
    y: useSharedValue(150),
  };

  const containerContent = (
    <View style={styles.container}>
      {/* SVG Layer - Behind dots */}
      <View style={styles.svgContainer}>
        <Svg width="100%" height="100%" style={styles.svg}>
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
        <DraggableDot 
          position={cable1Start} 
          color="#E74C3C" 
          bounds={GAME_BOARD_BOUNDS}
        />
        <DraggableDot 
          position={cable1End} 
          color="#E74C3C" 
          bounds={GAME_BOARD_BOUNDS}
        />

        {/* Draggable dots for Cable 2 */}
        <DraggableDot 
          position={cable2Start} 
          color="#3498DB" 
          bounds={GAME_BOARD_BOUNDS}
        />
        <DraggableDot 
          position={cable2End} 
          color="#3498DB" 
          bounds={GAME_BOARD_BOUNDS}
        />
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
    backgroundColor: 'rgba(15, 17, 23, 0.5)',
    borderRadius: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
    overflow: 'hidden',
    position: 'relative',
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