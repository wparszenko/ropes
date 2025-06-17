import React, { useEffect, useState, useMemo } from 'react';
import { View, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Line, Circle, Rect, Path } from 'react-native-svg';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');
const BOARD_HEIGHT = height - 300; // Account for header and controls
const BOARD_WIDTH = width - 32;
const SNAP_DISTANCE = 30;

interface GameBoardProps {
  levelData: LevelData;
}

interface WirePosition {
  start: [number, number];
  end: [number, number];
}

export default function GameBoard({ levelData }: GameBoardProps) {
  // Always call hooks in the same order, regardless of levelData
  const { wireConnections, updateWireConnection, activatePortal, completeLevel } = useGameStore();
  const [allConnected, setAllConnected] = useState(false);
  const [wirePositions, setWirePositions] = useState<{ [key: string]: WirePosition }>({});

  // Initialize wire positions from levelData
  const initialWirePositions = useMemo(() => {
    if (!levelData || !levelData.wires) return {};
    
    const positions: { [key: string]: WirePosition } = {};
    levelData.wires.forEach(wire => {
      positions[wire.id] = {
        start: [...wire.start] as [number, number],
        end: [...wire.end] as [number, number],
      };
    });
    return positions;
  }, [levelData]);

  // Update wire positions when levelData changes
  useEffect(() => {
    setWirePositions(initialWirePositions);
  }, [initialWirePositions]);

  // Check connections
  useEffect(() => {
    if (!levelData || !levelData.wires || !levelData.sockets) return;

    const connected = levelData.wires.every(wire => {
      const wirePos = wirePositions[wire.id];
      if (!wirePos) return false;

      return levelData.sockets.some(socket => {
        if (socket.color !== wire.color) return false;
        
        const distance = Math.sqrt(
          Math.pow(wirePos.end[0] - socket.position[0], 2) +
          Math.pow(wirePos.end[1] - socket.position[1], 2)
        );
        
        return distance < SNAP_DISTANCE;
      });
    });

    setAllConnected(connected);
    
    if (connected && levelData.goals.connectAll) {
      activatePortal();
      setTimeout(() => {
        completeLevel(3);
      }, 1000);
    }
  }, [wirePositions, levelData, activatePortal, completeLevel]);

  const createDraggableWirePoint = (wireId: string, isStart: boolean) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: () => {
        // Reset translation values
        translateX.value = 0;
        translateY.value = 0;
      },
      onActive: (event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      },
      onEnd: () => {
        const currentWirePos = wirePositions[wireId];
        if (!currentWirePos) return;

        const pointToUpdate = isStart ? currentWirePos.start : currentWirePos.end;
        const newX = Math.max(20, Math.min(BOARD_WIDTH - 20, pointToUpdate[0] + translateX.value));
        const newY = Math.max(20, Math.min(BOARD_HEIGHT - 20, pointToUpdate[1] + translateY.value));

        // Check for socket snapping
        let snappedToSocket = false;
        if (!isStart && levelData && levelData.sockets) {
          const wire = levelData.wires.find(w => w.id === wireId);
          if (wire) {
            for (const socket of levelData.sockets) {
              if (socket.color === wire.color) {
                const distance = Math.sqrt(
                  Math.pow(newX - socket.position[0], 2) +
                  Math.pow(newY - socket.position[1], 2)
                );
                
                if (distance < SNAP_DISTANCE) {
                  runOnJS(updateWirePosition)(wireId, isStart, socket.position[0], socket.position[1]);
                  runOnJS(updateWireConnection)(wireId, true);
                  snappedToSocket = true;
                  break;
                }
              }
            }
          }
        }

        if (!snappedToSocket) {
          runOnJS(updateWirePosition)(wireId, isStart, newX, newY);
          if (!isStart) {
            runOnJS(updateWireConnection)(wireId, false);
          }
        }

        // Reset translation with spring animation
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      };
    });

    return { gestureHandler, animatedStyle };
  };

  const updateWirePosition = (wireId: string, isStart: boolean, x: number, y: number) => {
    setWirePositions(prev => {
      const current = prev[wireId];
      if (!current) return prev;

      return {
        ...prev,
        [wireId]: {
          ...current,
          [isStart ? 'start' : 'end']: [x, y] as [number, number],
        },
      };
    });
  };

  const isPointInObstacle = (x: number, y: number) => {
    if (!levelData || !levelData.obstacles) return false;
    
    return levelData.obstacles.some(obstacle => {
      const left = obstacle.position[0] - obstacle.size[0] / 2;
      const right = obstacle.position[0] + obstacle.size[0] / 2;
      const top = obstacle.position[1] - obstacle.size[1] / 2;
      const bottom = obstacle.position[1] + obstacle.size[1] / 2;
      
      return x >= left && x <= right && y >= top && y <= bottom;
    });
  };

  const createCurvedPath = (start: [number, number], end: [number, number]) => {
    const [x1, y1] = start;
    const [x2, y2] = end;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const curvature = Math.min(distance * 0.2, 50);
    
    const controlX = midX;
    const controlY = midY - curvature;
    
    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  };

  // Early return if no levelData
  if (!levelData || !levelData.wires || !levelData.sockets) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.gameBoard}>
          <View style={styles.loadingContainer}>
            {/* Empty loading state */}
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameBoard}>
        <Svg width={BOARD_WIDTH} height={BOARD_HEIGHT} style={styles.svg}>
          {/* Render obstacles */}
          {levelData.obstacles.map((obstacle) => (
            <Rect
              key={obstacle.id}
              x={obstacle.position[0] - obstacle.size[0] / 2}
              y={obstacle.position[1] - obstacle.size[1] / 2}
              width={obstacle.size[0]}
              height={obstacle.size[1]}
              fill="#FF5050"
              stroke="#FF7070"
              strokeWidth={2}
              rx={4}
            />
          ))}

          {/* Render wires */}
          {levelData.wires.map((wire) => {
            const wirePos = wirePositions[wire.id];
            if (!wirePos) return null;

            const isConnected = wireConnections[wire.id] || false;
            const pathData = createCurvedPath(wirePos.start, wirePos.end);

            return (
              <Path
                key={wire.id}
                d={pathData}
                stroke={wire.color}
                strokeWidth={isConnected ? 8 : 6}
                strokeLinecap="round"
                fill="none"
                opacity={isConnected ? 1 : 0.7}
              />
            );
          })}

          {/* Render sockets */}
          {levelData.sockets.map((socket) => {
            const connectedWire = levelData.wires.find(wire => {
              const wirePos = wirePositions[wire.id];
              if (!wirePos || wire.color !== socket.color) return false;
              
              const distance = Math.sqrt(
                Math.pow(wirePos.end[0] - socket.position[0], 2) +
                Math.pow(wirePos.end[1] - socket.position[1], 2)
              );
              
              return distance < SNAP_DISTANCE;
            });
            
            return (
              <React.Fragment key={socket.id}>
                <Circle
                  cx={socket.position[0]}
                  cy={socket.position[1]}
                  r={20}
                  fill="transparent"
                  stroke={socket.color}
                  strokeWidth={3}
                  opacity={0.8}
                />
                
                <Circle
                  cx={socket.position[0]}
                  cy={socket.position[1]}
                  r={12}
                  fill={connectedWire ? socket.color : 'transparent'}
                  stroke={socket.color}
                  strokeWidth={2}
                  opacity={connectedWire ? 1 : 0.6}
                />
                
                {connectedWire && (
                  <Circle
                    cx={socket.position[0]}
                    cy={socket.position[1]}
                    r={6}
                    fill="#FFFFFF"
                    opacity={0.8}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Portal (when all connected) */}
          {allConnected && levelData.portalPosition && (
            <React.Fragment>
              <Circle
                cx={levelData.portalPosition[0]}
                cy={levelData.portalPosition[1]}
                r={40}
                fill="rgba(24, 255, 146, 0.2)"
                stroke="#18FF92"
                strokeWidth={3}
                opacity={0.8}
              />
              
              <Circle
                cx={levelData.portalPosition[0]}
                cy={levelData.portalPosition[1]}
                r={25}
                fill="rgba(24, 255, 146, 0.4)"
                stroke="#18FF92"
                strokeWidth={2}
              />
              
              <Circle
                cx={levelData.portalPosition[0]}
                cy={levelData.portalPosition[1]}
                r={10}
                fill="#18FF92"
                opacity={0.9}
              />
            </React.Fragment>
          )}
        </Svg>

        {/* Draggable Wire Points */}
        {levelData.wires.map((wire) => {
          const wirePos = wirePositions[wire.id];
          if (!wirePos) return null;

          const startDraggable = createDraggableWirePoint(wire.id, true);
          const endDraggable = createDraggableWirePoint(wire.id, false);

          return (
            <React.Fragment key={`draggable-${wire.id}`}>
              {/* Start Point */}
              <PanGestureHandler onGestureEvent={startDraggable.gestureHandler}>
                <Animated.View
                  style={[
                    styles.draggablePoint,
                    {
                      left: wirePos.start[0] - 12,
                      top: wirePos.start[1] - 12,
                      backgroundColor: wire.color,
                      borderColor: '#FFFFFF',
                    },
                    startDraggable.animatedStyle,
                  ]}
                />
              </PanGestureHandler>

              {/* End Point */}
              <PanGestureHandler onGestureEvent={endDraggable.gestureHandler}>
                <Animated.View
                  style={[
                    styles.draggablePoint,
                    {
                      left: wirePos.end[0] - 12,
                      top: wirePos.end[1] - 12,
                      backgroundColor: wireConnections[wire.id] ? wire.color : 'transparent',
                      borderColor: wire.color,
                      borderWidth: wireConnections[wire.id] ? 2 : 3,
                    },
                    endDraggable.animatedStyle,
                  ]}
                />
              </PanGestureHandler>
            </React.Fragment>
          );
        })}

        {/* Robot */}
        {levelData.robotStart && (
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
        )}
      </View>
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
  svg: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggablePoint: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 10,
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