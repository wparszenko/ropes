import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Dimensions, StyleSheet, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';
import WireComponent from '@/components/WireComponent';

const { width, height } = Dimensions.get('window');
const BOARD_HEIGHT = height - 300;

// Game boundaries
export const BOUNDS = {
  MIN_X: 40,
  MAX_X: width - 72,
  MIN_Y: 40,
  MAX_Y: BOARD_HEIGHT - 40,
};

interface GameBoardProps {
  levelData: LevelData | null;
}

interface WirePosition {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

interface SharedWirePositions {
  [wireId: string]: {
    startX: any;
    startY: any;
    endX: any;
    endY: any;
  };
}

// Function to check if two line segments intersect
const doLinesIntersect = (
  line1Start: { x: number; y: number },
  line1End: { x: number; y: number },
  line2Start: { x: number; y: number },
  line2End: { x: number; y: number }
): boolean => {
  const { x: x1, y: y1 } = line1Start;
  const { x: x2, y: y2 } = line1End;
  const { x: x3, y: y3 } = line2Start;
  const { x: x4, y: y4 } = line2End;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 0.0001) return false; // Lines are parallel
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

export default function GameBoard({ levelData }: GameBoardProps) {
  const { completeLevel } = useGameStore();
  const [hasIntersections, setHasIntersections] = useState(true);
  const [sharedPositions, setSharedPositions] = useState<SharedWirePositions>({});
  const wirePositionsRef = useRef<Record<string, WirePosition>>({});

  const handleWirePositionUpdate = useCallback((wireId: string, start: { x: number; y: number }, end: { x: number; y: number }) => {
    wirePositionsRef.current[wireId] = { start, end };
    checkVictory();
  }, []);

  // Check for victory condition (no intersections)
  const checkVictory = useCallback(() => {
    if (!levelData) return;

    const wirePositions = Object.values(wirePositionsRef.current);
    if (wirePositions.length < 2) return;

    let foundIntersection = false;

    // Check all pairs of wires for intersections
    for (let i = 0; i < wirePositions.length; i++) {
      for (let j = i + 1; j < wirePositions.length; j++) {
        const wire1 = wirePositions[i];
        const wire2 = wirePositions[j];
        
        if (doLinesIntersect(wire1.start, wire1.end, wire2.start, wire2.end)) {
          foundIntersection = true;
          break;
        }
      }
      if (foundIntersection) break;
    }

    setHasIntersections(foundIntersection);

    // Victory when no intersections
    if (!foundIntersection) {
      setTimeout(() => {
        completeLevel(3);
      }, 500);
    }
  }, [levelData, completeLevel]);

  // Initialize shared positions when levelData changes
  useEffect(() => {
    if (levelData) {
      const newSharedPositions: SharedWirePositions = {};
      const initialPositions: Record<string, WirePosition> = {};
      
      levelData.wires.forEach((wire) => {
        // Create shared values for each wire
        newSharedPositions[wire.id] = {
          startX: useSharedValue(wire.start[0]),
          startY: useSharedValue(wire.start[1]),
          endX: useSharedValue(wire.end[0]),
          endY: useSharedValue(wire.end[1]),
        };
        
        // Initialize position tracking
        initialPositions[wire.id] = {
          start: { x: wire.start[0], y: wire.start[1] },
          end: { x: wire.end[0], y: wire.end[1] },
        };
      });
      
      setSharedPositions(newSharedPositions);
      wirePositionsRef.current = initialPositions;
      setHasIntersections(true); // Reset intersection state
    }
  }, [levelData]);

  // Early return after all hooks are called
  if (!levelData || Object.keys(sharedPositions).length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.gameBoard}>
          <View style={styles.loadingContainer} />
        </View>
      </GestureHandlerRootView>
    );
  }

  const containerContent = (
    <View style={styles.gameBoard}>
      {/* SVG Layer for ropes */}
      <View style={styles.svgContainer}>
        <Svg width={width - 32} height={BOARD_HEIGHT} style={styles.svg}>
          {levelData.wires.map((wire) => (
            <WireComponent
              key={`rope-${wire.id}`}
              wire={wire}
              onPositionUpdate={handleWirePositionUpdate}
              renderMode="rope"
              sharedPositions={sharedPositions[wire.id]}
            />
          ))}
        </Svg>
      </View>

      {/* Dots Layer for draggable endpoints */}
      <View style={styles.dotsContainer}>
        {levelData.wires.map((wire) => (
          <WireComponent
            key={`dots-${wire.id}`}
            wire={wire}
            onPositionUpdate={handleWirePositionUpdate}
            renderMode="dots"
            sharedPositions={sharedPositions[wire.id]}
          />
        ))}
      </View>

      {/* Victory indicator */}
      {!hasIntersections && (
        <View style={styles.victoryContainer}>
          <View style={styles.victoryCircle}>
            <View style={styles.victoryInner} />
          </View>
        </View>
      )}
    </View>
  );

  // Wrap in GestureHandlerRootView only on native platforms
  if (Platform.OS === 'web') {
    return <View style={styles.container}>{containerContent}</View>;
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
  },
  gameBoard: {
    flex: 1,
    backgroundColor: 'rgba(15, 17, 23, 0.5)',
    borderRadius: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  victoryContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 3,
  },
  victoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(24, 255, 146, 0.3)',
    borderWidth: 3,
    borderColor: '#18FF92',
    justifyContent: 'center',
    alignItems: 'center',
  },
  victoryInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#18FF92',
  },
});