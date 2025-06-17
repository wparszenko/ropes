import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Dimensions, StyleSheet, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';

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

interface RopeEndpoints {
  [key: string]: {
    start: {
      x: Animated.SharedValue<number>;
      y: Animated.SharedValue<number>;
    };
    end: {
      x: Animated.SharedValue<number>;
      y: Animated.SharedValue<number>;
    };
  };
}

// Function to check if two line segments intersect
const doLinesIntersect = (
  line1Start: { x: number; y: number },
  line1End: { x: number; y: number },
  line2Start: { x: number; y: number },
  line2End: { x: number; y: number }
): boolean => {
  'worklet';
  
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
  // Always call hooks at the top level, regardless of levelData
  const { completeLevel, activatePortal } = useGameStore();
  const [hasIntersections, setHasIntersections] = useState(true);

  // Create rope endpoints using useMemo to ensure hooks are called at top level
  const ropeEndpoints = useMemo<RopeEndpoints>(() => {
    if (!levelData) return {};
    
    const endpoints: RopeEndpoints = {};
    
    levelData.wires.forEach((wire) => {
      endpoints[wire.id] = {
        start: {
          x: useSharedValue(wire.start[0]),
          y: useSharedValue(wire.start[1]),
        },
        end: {
          x: useSharedValue(wire.end[0]),
          y: useSharedValue(wire.end[1]),
        },
      };
    });
    
    return endpoints;
  }, [levelData]);

  // Check for rope intersections
  const checkIntersections = useCallback(() => {
    if (!levelData || Object.keys(ropeEndpoints).length === 0) return;

    const ropes = levelData.wires.map(wire => {
      const endpoints = ropeEndpoints[wire.id];
      if (!endpoints) return null;
      
      return {
        id: wire.id,
        start: {
          x: endpoints.start.x.value,
          y: endpoints.start.y.value,
        },
        end: {
          x: endpoints.end.x.value,
          y: endpoints.end.y.value,
        },
      };
    }).filter(Boolean);

    let foundIntersection = false;

    // Check all pairs of ropes for intersections
    for (let i = 0; i < ropes.length; i++) {
      for (let j = i + 1; j < ropes.length; j++) {
        const rope1 = ropes[i];
        const rope2 = ropes[j];
        
        if (rope1 && rope2 && doLinesIntersect(rope1.start, rope1.end, rope2.start, rope2.end)) {
          foundIntersection = true;
          break;
        }
      }
      if (foundIntersection) break;
    }

    setHasIntersections(foundIntersection);

    // Complete level when no intersections
    if (!foundIntersection && levelData.goals.connectAll) {
      activatePortal();
      setTimeout(() => {
        completeLevel(3);
      }, 1000);
    }
  }, [levelData, ropeEndpoints, activatePortal, completeLevel]);

  // Set up intersection checking with a slight delay to avoid excessive calculations
  useEffect(() => {
    const timer = setTimeout(checkIntersections, 100);
    return () => clearTimeout(timer);
  }, [ropeEndpoints, checkIntersections]);

  // Early return after all hooks are called
  if (!levelData) {
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
      {/* SVG Layer - Behind dots */}
      <View style={styles.svgContainer}>
        <Svg width={width - 32} height={BOARD_HEIGHT} style={styles.svg}>
          {/* Render ropes */}
          {levelData.wires.map((wire) => {
            const endpoints = ropeEndpoints[wire.id];
            if (!endpoints) return null;

            return (
              <RopePath
                key={wire.id}
                startPoint={endpoints.start}
                endPoint={endpoints.end}
                color={wire.color}
              />
            );
          })}
        </Svg>
      </View>

      {/* Dots Layer - Above SVG */}
      <View style={styles.dotsContainer}>
        {levelData.wires.map((wire) => {
          const endpoints = ropeEndpoints[wire.id];
          if (!endpoints) return null;

          return (
            <React.Fragment key={wire.id}>
              <DraggableDot 
                position={endpoints.start} 
                color={wire.color}
                onPositionChange={checkIntersections}
              />
              <DraggableDot 
                position={endpoints.end} 
                color={wire.color}
                onPositionChange={checkIntersections}
              />
            </React.Fragment>
          );
        })}
      </View>

      {/* Success Portal */}
      {!hasIntersections && (
        <View style={styles.portalContainer}>
          <View style={[styles.portal, styles.portalOuter]} />
          <View style={[styles.portal, styles.portalInner]} />
          <View style={[styles.portal, styles.portalCore]} />
        </View>
      )}

      {/* Robot */}
      <View
        style={[
          styles.robot,
          {
            left: levelData.robotStart[0] - 15,
            top: levelData.robotStart[1] - 15,
          },
        ]}
      >
        <View style={styles.robotBody}>
          <View style={styles.robotEyes}>
            <View style={styles.robotEye} />
            <View style={styles.robotEye} />
          </View>
          <View style={styles.robotMouth} />
        </View>
      </View>
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
  portalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 1,
  },
  portal: {
    position: 'absolute',
    borderRadius: 50,
  },
  portalOuter: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderWidth: 3,
    borderColor: '#18FF92',
  },
  portalInner: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(24, 255, 146, 0.4)',
    borderWidth: 2,
    borderColor: '#18FF92',
    top: 15,
    left: 15,
  },
  portalCore: {
    width: 20,
    height: 20,
    backgroundColor: '#18FF92',
    top: 30,
    left: 30,
  },
  robot: {
    position: 'absolute',
    width: 30,
    height: 30,
    zIndex: 5,
  },
  robotBody: {
    flex: 1,
    backgroundColor: 'rgba(0, 224, 255, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00E0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotEyes: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  robotEye: {
    width: 4,
    height: 4,
    backgroundColor: '#18FF92',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  robotMouth: {
    width: 6,
    height: 2,
    backgroundColor: 'rgba(24, 255, 146, 0.6)',
    borderRadius: 1,
  },
});