import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Line, Circle, Rect } from 'react-native-svg';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');
const BOARD_HEIGHT = height - 300; // Account for header and controls

interface GameBoardProps {
  levelData: LevelData | null;
}

export default function GameBoard({ levelData }: GameBoardProps) {
  // CRITICAL: Always call ALL hooks at the top level, in the same order
  const { wireConnections, updateWireConnection, activatePortal, completeLevel } = useGameStore();
  const [allConnected, setAllConnected] = useState(false);
  const [wirePositions, setWirePositions] = useState<{ [key: string]: { start: [number, number], end: [number, number] } }>({});
  
  // Shared values for animations - always initialize
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Memoize initial wire positions to prevent unnecessary recalculations
  const initialWirePositions = useMemo(() => {
    if (!levelData?.wires) return {};
    
    const positions: { [key: string]: { start: [number, number], end: [number, number] } } = {};
    levelData.wires.forEach(wire => {
      positions[wire.id] = {
        start: wire.start,
        end: wire.end
      };
    });
    return positions;
  }, [levelData?.wires]);

  // Initialize wire positions when levelData changes
  useEffect(() => {
    if (levelData?.wires && Object.keys(wirePositions).length === 0) {
      setWirePositions(initialWirePositions);
    }
  }, [levelData?.wires, wirePositions, initialWirePositions]);

  // Check if all wires are connected
  useEffect(() => {
    if (!levelData?.wires) {
      setAllConnected(false);
      return;
    }

    const connected = levelData.wires.every(wire => wireConnections[wire.id]);
    setAllConnected(connected);
    
    if (connected && levelData.goals?.connectAll) {
      activatePortal();
      // Simulate level completion after portal activation
      const timer = setTimeout(() => {
        completeLevel(3); // Award 3 stars for now
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [wireConnections, levelData?.wires, levelData?.goals, activatePortal, completeLevel]);

  // Handle wire touch
  const handleWireTouch = useCallback((wireId: string) => {
    const currentState = wireConnections[wireId] || false;
    updateWireConnection(wireId, !currentState);
  }, [wireConnections, updateWireConnection]);

  // Gesture handler for dragging
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      isDragging.value = true;
    },
    onActive: (event) => {
      dragX.value = event.translationX;
      dragY.value = event.translationY;
    },
    onEnd: () => {
      isDragging.value = false;
      dragX.value = withSpring(0);
      dragY.value = withSpring(0);
    },
  });

  // Animated style for dragging
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: dragX.value },
        { translateY: dragY.value },
      ],
    };
  });

  // Early return AFTER all hooks are called
  if (!levelData) {
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

  // Safe access to levelData properties with fallbacks
  const wires = levelData.wires || [];
  const sockets = levelData.sockets || [];
  const obstacles = levelData.obstacles || [];
  const portalPosition = levelData.portalPosition || [0, 0];

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameBoard}>
        <Svg width={width - 32} height={BOARD_HEIGHT} style={styles.svg}>
          {/* Render obstacles */}
          {obstacles.map((obstacle) => (
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
          {wires.map((wire) => {
            const isConnected = wireConnections[wire.id] || false;
            const currentPosition = wirePositions[wire.id] || { start: wire.start, end: wire.end };
            const startX = currentPosition.start[0];
            const startY = currentPosition.start[1];
            const endX = currentPosition.end[0];
            const endY = currentPosition.end[1];

            return (
              <React.Fragment key={wire.id}>
                {/* Wire path */}
                <Line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={wire.color}
                  strokeWidth={isConnected ? 8 : 6}
                  strokeLinecap="round"
                  opacity={isConnected ? 1 : 0.7}
                />
                
                {/* Start point - draggable */}
                <Circle
                  cx={startX}
                  cy={startY}
                  r={12}
                  fill={wire.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  opacity={0.9}
                  onPress={() => handleWireTouch(wire.id)}
                />
                
                {/* End point - draggable */}
                <Circle
                  cx={endX}
                  cy={endY}
                  r={12}
                  fill={isConnected ? wire.color : 'transparent'}
                  stroke={wire.color}
                  strokeWidth={3}
                  opacity={isConnected ? 1 : 0.7}
                  onPress={() => handleWireTouch(wire.id)}
                />
              </React.Fragment>
            );
          })}

          {/* Render sockets */}
          {sockets.map((socket) => {
            const isConnected = wireConnections[socket.id] || false;
            
            return (
              <React.Fragment key={socket.id}>
                {/* Socket outer ring */}
                <Circle
                  cx={socket.position[0]}
                  cy={socket.position[1]}
                  r={20}
                  fill="transparent"
                  stroke={socket.color}
                  strokeWidth={3}
                  opacity={0.8}
                />
                
                {/* Socket inner circle */}
                <Circle
                  cx={socket.position[0]}
                  cy={socket.position[1]}
                  r={12}
                  fill={isConnected ? socket.color : 'transparent'}
                  stroke={socket.color}
                  strokeWidth={2}
                  opacity={isConnected ? 1 : 0.6}
                />
                
                {/* Connection indicator */}
                {isConnected && (
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
          {allConnected && (
            <React.Fragment>
              {/* Portal outer glow */}
              <Circle
                cx={portalPosition[0]}
                cy={portalPosition[1]}
                r={40}
                fill="rgba(24, 255, 146, 0.2)"
                stroke="#18FF92"
                strokeWidth={3}
                opacity={0.8}
              />
              
              {/* Portal inner circle */}
              <Circle
                cx={portalPosition[0]}
                cy={portalPosition[1]}
                r={25}
                fill="rgba(24, 255, 146, 0.4)"
                stroke="#18FF92"
                strokeWidth={2}
              />
              
              {/* Portal center */}
              <Circle
                cx={portalPosition[0]}
                cy={portalPosition[1]}
                r={10}
                fill="#18FF92"
                opacity={0.9}
              />
            </React.Fragment>
          )}
        </Svg>

        {/* Robot */}
        {levelData.robotStart && (
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
              style={[
                styles.robot,
                {
                  left: levelData.robotStart[0] - 15,
                  top: levelData.robotStart[1] - 15,
                },
                animatedStyle,
              ]}
            >
              <View style={styles.robotBody}>
                <View style={styles.robotEyes}>
                  <View style={styles.robotEye} />
                  <View style={styles.robotEye} />
                </View>
                <View style={styles.robotMouth} />
              </View>
            </Animated.View>
          </PanGestureHandler>
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
  robot: {
    position: 'absolute',
    width: 30,
    height: 30,
    zIndex: 10,
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