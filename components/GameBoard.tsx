import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';

const { width, height } = Dimensions.get('window');

// Calculate responsive game board dimensions
const BOARD_MARGIN = 16;
const BOARD_PADDING = 20;
const DOT_RADIUS = 15;

// Game board dimensions
const BOARD_WIDTH = width - (BOARD_MARGIN * 2);
const BOARD_HEIGHT = Math.min(height - 300, 400);

// Game boundaries - properly constrained within the visible game board
const GAME_BOUNDS = {
  MIN_X: BOARD_PADDING + DOT_RADIUS,
  MAX_X: BOARD_WIDTH - BOARD_PADDING - DOT_RADIUS,
  MIN_Y: BOARD_PADDING + DOT_RADIUS,
  MAX_Y: BOARD_HEIGHT - BOARD_PADDING - DOT_RADIUS,
};

interface GameBoardProps {
  levelData?: any;
}

export default function GameBoard({ levelData }: GameBoardProps) {
  // Calculate initial positions within bounds
  const centerX = BOARD_WIDTH / 2;
  const centerY = BOARD_HEIGHT / 2;
  const offset = 60;

  // Cable 1 (Red) - crossing diagonally
  const cable1Start = {
    x: useSharedValue(centerX - offset),
    y: useSharedValue(centerY - offset),
  };
  const cable1End = {
    x: useSharedValue(centerX + offset),
    y: useSharedValue(centerY + offset),
  };

  // Cable 2 (Blue) - crossing the other way
  const cable2Start = {
    x: useSharedValue(centerX - offset),
    y: useSharedValue(centerY + offset),
  };
  const cable2End = {
    x: useSharedValue(centerX + offset),
    y: useSharedValue(centerY - offset),
  };

  // Initialize positions
  useEffect(() => {
    cable1Start.x.value = centerX - offset;
    cable1Start.y.value = centerY - offset;
    cable1End.x.value = centerX + offset;
    cable1End.y.value = centerY + offset;
    
    cable2Start.x.value = centerX - offset;
    cable2Start.y.value = centerY + offset;
    cable2End.x.value = centerX + offset;
    cable2End.y.value = centerY - offset;
  }, []);

  const containerContent = (
    <View style={[styles.container, { height: BOARD_HEIGHT }]}>
      {/* SVG Layer - Behind dots */}
      <View style={styles.svgContainer}>
        <Svg width={BOARD_WIDTH} height={BOARD_HEIGHT} style={styles.svg}>
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
          bounds={GAME_BOUNDS}
        />
        <DraggableDot 
          position={cable1End} 
          color="#E74C3C" 
          bounds={GAME_BOUNDS}
        />

        {/* Draggable dots for Cable 2 */}
        <DraggableDot 
          position={cable2Start} 
          color="#3498DB" 
          bounds={GAME_BOUNDS}
        />
        <DraggableDot 
          position={cable2End} 
          color="#3498DB" 
          bounds={GAME_BOUNDS}
        />
      </View>

      {/* Visual boundary indicator (optional - for debugging) */}
      <View style={styles.boundaryIndicator} />
    </View>
  );

  // For web, don't wrap in GestureHandlerRootView as it can interfere
  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrapper}>
        {containerContent}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      {containerContent}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    backgroundColor: 'rgba(15, 17, 23, 0.5)',
    borderRadius: 16,
    marginHorizontal: BOARD_MARGIN,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
    overflow: 'hidden',
    position: 'relative',
    // Add subtle shadow for depth
    shadowColor: '#18FF92',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  boundaryIndicator: {
    position: 'absolute',
    top: BOARD_PADDING,
    left: BOARD_PADDING,
    right: BOARD_PADDING,
    bottom: BOARD_PADDING,
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 146, 0.1)',
    borderRadius: 8,
    borderStyle: 'dashed',
    pointerEvents: 'none',
    zIndex: 0,
  },
});