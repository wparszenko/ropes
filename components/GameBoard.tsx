import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';
import { generateCrossedRopes, areRopesUntangled, countIntersections, type Rope, type GameBounds } from '@/utils/ropeGenerator';
import { useGameStore } from '@/store/gameStore';

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
  const [ropes, setRopes] = useState<Rope[]>([]);
  const [ropePositions, setRopePositions] = useState<{ [key: string]: any }>({});
  const [intersectionCount, setIntersectionCount] = useState(0);

  // Generate ropes for the current level
  useEffect(() => {
    const ropeCount = Math.min(currentLevel + 1, 10); // Start with 2 ropes, max 10
    const generatedRopes = generateCrossedRopes(ropeCount, GAME_BOUNDS);
    setRopes(generatedRopes);
    
    // Initialize shared values for each rope
    const positions: { [key: string]: any } = {};
    generatedRopes.forEach(rope => {
      positions[rope.id] = {
        startX: useSharedValue(rope.start.x),
        startY: useSharedValue(rope.start.y),
        endX: useSharedValue(rope.end.x),
        endY: useSharedValue(rope.end.y),
      };
    });
    setRopePositions(positions);
    
    // Count initial intersections
    setIntersectionCount(countIntersections(generatedRopes));
  }, [currentLevel]);

  // Check for intersections after any rope movement
  const checkIntersections = useCallback(() => {
    if (ropes.length === 0 || Object.keys(ropePositions).length === 0) return;

    // Create current rope state from shared values
    const currentRopes: Rope[] = ropes.map(rope => ({
      ...rope,
      start: {
        x: ropePositions[rope.id]?.startX?.value || rope.start.x,
        y: ropePositions[rope.id]?.startY?.value || rope.start.y,
      },
      end: {
        x: ropePositions[rope.id]?.endX?.value || rope.end.x,
        y: ropePositions[rope.id]?.endY?.value || rope.end.y,
      },
    }));

    const newIntersectionCount = countIntersections(currentRopes);
    setIntersectionCount(newIntersectionCount);

    // Check if puzzle is solved
    if (newIntersectionCount === 0 && ropes.length > 0) {
      // Small delay to let the animation finish
      setTimeout(() => {
        const stars = currentLevel <= 3 ? 3 : currentLevel <= 6 ? 2 : 1;
        completeLevel(stars);
      }, 500);
    }
  }, [ropes, ropePositions, currentLevel, completeLevel]);

  const containerContent = (
    <View style={[styles.container, { height: BOARD_HEIGHT }]}>
      {/* SVG Layer - Behind dots */}
      <View style={styles.svgContainer}>
        <Svg width={BOARD_WIDTH} height={BOARD_HEIGHT} style={styles.svg}>
          {ropes.map(rope => {
            const positions = ropePositions[rope.id];
            if (!positions) return null;
            
            return (
              <RopePath
                key={rope.id}
                startPoint={{ x: positions.startX, y: positions.startY }}
                endPoint={{ x: positions.endX, y: positions.endY }}
                color={rope.color}
              />
            );
          })}
        </Svg>
      </View>

      {/* Dots Layer - Above SVG */}
      <View style={styles.dotsContainer}>
        {ropes.map(rope => {
          const positions = ropePositions[rope.id];
          if (!positions) return null;

          return (
            <React.Fragment key={rope.id}>
              <DraggableDot 
                position={{ x: positions.startX, y: positions.startY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={checkIntersections}
              />
              <DraggableDot 
                position={{ x: positions.endX, y: positions.endY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={checkIntersections}
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
            <View style={styles.debugLabel}>Intersections: {intersectionCount}</View>
            <View style={styles.debugLabel}>Ropes: {ropes.length}</View>
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