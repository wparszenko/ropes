import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';
import { type GameBounds } from '@/utils/ropeGenerator';
import { useGameStore } from '@/store/gameStore';
import { useRopeStore } from '@/store/ropeStore';

const { width, height } = Dimensions.get('window');

// Calculate responsive game board dimensions
const BOARD_MARGIN = 16;
const BOARD_PADDING = 30;
const DOT_RADIUS = 15;

// Make the game board much taller and more responsive
const BOARD_WIDTH = width - (BOARD_MARGIN * 2);
const BOARD_HEIGHT = Math.max(height - 280, 500);

// Game boundaries - properly constrained within the visible game board
const GAME_BOUNDS: GameBounds = {
  minX: BOARD_PADDING + DOT_RADIUS,
  maxX: BOARD_WIDTH - BOARD_PADDING - DOT_RADIUS,
  minY: BOARD_PADDING + DOT_RADIUS,
  maxY: BOARD_HEIGHT - BOARD_PADDING - DOT_RADIUS,
};

interface GameBoardProps {
  levelData?: any;
}

export default function GameBoard({ levelData }: GameBoardProps) {
  const { currentLevel, completeLevel } = useGameStore();
  const { 
    ropes, 
    ropePositions, 
    intersectionCount, 
    isCompleted,
    initializeLevel,
    updateRopePosition,
    checkIntersections 
  } = useRopeStore();

  // Initialize level when component mounts or level changes
  useEffect(() => {
    initializeLevel(currentLevel, GAME_BOUNDS);
  }, [currentLevel, initializeLevel]);

  // Check for level completion
  useEffect(() => {
    if (isCompleted && ropes.length > 0) {
      setTimeout(() => {
        const stars = currentLevel <= 3 ? 3 : currentLevel <= 6 ? 2 : 1;
        completeLevel(stars);
      }, 500);
    }
  }, [isCompleted, ropes.length, currentLevel, completeLevel]);

  // Create shared values for each rope endpoint
  const createSharedValues = useCallback((ropeId: string) => {
    const position = ropePositions[ropeId];
    if (!position) return null;

    return {
      startX: useSharedValue(position.startX),
      startY: useSharedValue(position.startY),
      endX: useSharedValue(position.endX),
      endY: useSharedValue(position.endY),
    };
  }, [ropePositions]);

  // Handle rope position updates
  const handlePositionChange = useCallback((ropeId: string, endpoint: 'start' | 'end', x: number, y: number) => {
    const positionUpdate = endpoint === 'start' 
      ? { startX: x, startY: y }
      : { endX: x, endY: y };
    
    updateRopePosition(ropeId, positionUpdate);
  }, [updateRopePosition]);

  if (ropes.length === 0) {
    return (
      <View style={[styles.container, { height: BOARD_HEIGHT }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Level {currentLevel}...</Text>
        </View>
      </View>
    );
  }

  const containerContent = (
    <View style={[styles.container, { height: BOARD_HEIGHT }]}>
      {/* SVG Layer - Behind dots */}
      <View style={styles.svgContainer}>
        <Svg width={BOARD_WIDTH} height={BOARD_HEIGHT} style={styles.svg}>
          {ropes.map(rope => {
            const position = ropePositions[rope.id];
            if (!position) return null;
            
            const sharedValues = createSharedValues(rope.id);
            if (!sharedValues) return null;
            
            return (
              <RopePath
                key={rope.id}
                startPoint={{ x: sharedValues.startX, y: sharedValues.startY }}
                endPoint={{ x: sharedValues.endX, y: sharedValues.endY }}
                color={rope.color}
              />
            );
          })}
        </Svg>
      </View>

      {/* Dots Layer - Above SVG */}
      <View style={styles.dotsContainer}>
        {ropes.map(rope => {
          const position = ropePositions[rope.id];
          if (!position) return null;

          const sharedValues = createSharedValues(rope.id);
          if (!sharedValues) return null;

          return (
            <React.Fragment key={rope.id}>
              <DraggableDot 
                position={{ x: sharedValues.startX, y: sharedValues.startY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={() => {
                  handlePositionChange(
                    rope.id, 
                    'start', 
                    sharedValues.startX.value, 
                    sharedValues.startY.value
                  );
                }}
              />
              <DraggableDot 
                position={{ x: sharedValues.endX, y: sharedValues.endY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={() => {
                  handlePositionChange(
                    rope.id, 
                    'end', 
                    sharedValues.endX.value, 
                    sharedValues.endY.value
                  );
                }}
              />
            </React.Fragment>
          );
        })}
      </View>

      {/* Visual boundary indicator */}
      <View style={styles.boundaryIndicator} />
      
      {/* Intersection counter for debugging */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <View style={styles.debugText}>
            <Text style={styles.debugLabel}>Intersections: {intersectionCount}</Text>
            <Text style={styles.debugLabel}>Ropes: {ropes.length}</Text>
            <Text style={styles.debugLabel}>Completed: {isCompleted ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      )}
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
    minHeight: 400,
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
    flex: 1,
    shadowColor: '#18FF92',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '600',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
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
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 3,
    pointerEvents: 'none',
  },
  debugText: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});