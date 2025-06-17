import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
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

interface DraggableWireEnd {
  wireId: string;
  isStart: boolean;
  position: [number, number];
  color: string;
}

export default function GameBoard({ levelData }: GameBoardProps) {
  // CRITICAL: Always call ALL hooks at the top level, in the same order
  const { wireConnections, updateWireConnection, activatePortal, completeLevel } = useGameStore();
  const [allConnected, setAllConnected] = useState(false);
  const [wirePositions, setWirePositions] = useState<{ [key: string]: { start: [number, number], end: [number, number] } }>({});
  const [draggedWire, setDraggedWire] = useState<string | null>(null);
  const [draggedEnd, setDraggedEnd] = useState<'start' | 'end' | null>(null);
  
  // Shared values for wire dragging
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // Memoize initial wire positions to prevent unnecessary recalculations
  const initialWirePositions = useMemo(() => {
    if (!levelData?.wires) return {};
    
    const positions: { [key: string]: { start: [number, number], end: [number, number] } } = {};
    levelData.wires.forEach(wire => {
      positions[wire.id] = {
        start: [...wire.start],
        end: [...wire.end]
      };
    });
    return positions;
  }, [levelData?.wires]);

  // Initialize wire positions when levelData changes
  useEffect(() => {
    if (levelData?.wires) {
      setWirePositions(initialWirePositions);
    }
  }, [levelData?.wires, initialWirePositions]);

  // Check if all wires are connected
  useEffect(() => {
    if (!levelData?.wires || !levelData?.sockets) {
      setAllConnected(false);
      return;
    }

    // Check if each wire end is connected to a matching socket
    const allWiresConnected = levelData.wires.every(wire => {
      const wirePos = wirePositions[wire.id];
      if (!wirePos) return false;

      // Check if wire end is close to a matching socket
      const endConnected = levelData.sockets.some(socket => {
        if (socket.color !== wire.color) return false;
        
        const distance = Math.sqrt(
          Math.pow(wirePos.end[0] - socket.position[0], 2) + 
          Math.pow(wirePos.end[1] - socket.position[1], 2)
        );
        
        return distance < 25; // Connection threshold
      });

      return endConnected;
    });

    setAllConnected(allWiresConnected);
    
    if (allWiresConnected && levelData.goals?.connectAll) {
      activatePortal();
      // Simulate level completion after portal activation
      const timer = setTimeout(() => {
        completeLevel(3); // Award 3 stars for now
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [wirePositions, levelData?.wires, levelData?.sockets, levelData?.goals, activatePortal, completeLevel]);

  // Check if a wire end is connected to a socket
  const isWireEndConnected = useCallback((wireId: string, isStart: boolean) => {
    if (!levelData?.sockets) return false;
    
    const wirePos = wirePositions[wireId];
    if (!wirePos) return false;

    const wire = levelData.wires?.find(w => w.id === wireId);
    if (!wire) return false;

    const endPosition = isStart ? wirePos.start : wirePos.end;
    
    return levelData.sockets.some(socket => {
      if (socket.color !== wire.color) return false;
      
      const distance = Math.sqrt(
        Math.pow(endPosition[0] - socket.position[0], 2) + 
        Math.pow(endPosition[1] - socket.position[1], 2)
      );
      
      return distance < 25;
    });
  }, [wirePositions, levelData?.sockets, levelData?.wires]);

  // Update wire position during drag
  const updateWirePosition = useCallback((wireId: string, isStart: boolean, newX: number, newY: number) => {
    setWirePositions(prev => {
      const current = prev[wireId];
      if (!current) return prev;

      return {
        ...prev,
        [wireId]: {
          ...current,
          [isStart ? 'start' : 'end']: [newX, newY]
        }
      };
    });
  }, []);

  // Snap wire end to nearest matching socket
  const snapToSocket = useCallback((wireId: string, isStart: boolean, x: number, y: number) => {
    if (!levelData?.sockets) return { x, y };

    const wire = levelData.wires?.find(w => w.id === wireId);
    if (!wire) return { x, y };

    let closestSocket = null;
    let closestDistance = Infinity;

    levelData.sockets.forEach(socket => {
      if (socket.color !== wire.color) return;
      
      const distance = Math.sqrt(
        Math.pow(x - socket.position[0], 2) + 
        Math.pow(y - socket.position[1], 2)
      );
      
      if (distance < 40 && distance < closestDistance) {
        closestSocket = socket;
        closestDistance = distance;
      }
    });

    if (closestSocket) {
      return { x: closestSocket.position[0], y: closestSocket.position[1] };
    }

    return { x, y };
  }, [levelData?.sockets, levelData?.wires]);

  // Create gesture handler for wire end
  const createWireGestureHandler = useCallback((wireId: string, isStart: boolean, initialX: number, initialY: number) => {
    return useAnimatedGestureHandler({
      onStart: () => {
        isDragging.value = true;
        runOnJS(setDraggedWire)(wireId);
        runOnJS(setDraggedEnd)(isStart ? 'start' : 'end');
      },
      onActive: (event) => {
        const newX = initialX + event.translationX;
        const newY = initialY + event.translationY;
        
        // Constrain to board bounds
        const constrainedX = Math.max(20, Math.min(width - 52, newX));
        const constrainedY = Math.max(20, Math.min(BOARD_HEIGHT - 20, newY));
        
        dragX.value = event.translationX;
        dragY.value = event.translationY;
        
        runOnJS(updateWirePosition)(wireId, isStart, constrainedX, constrainedY);
      },
      onEnd: (event) => {
        isDragging.value = false;
        
        const finalX = initialX + event.translationX;
        const finalY = initialY + event.translationY;
        
        // Constrain to board bounds
        const constrainedX = Math.max(20, Math.min(width - 52, finalX));
        const constrainedY = Math.max(20, Math.min(BOARD_HEIGHT - 20, finalY));
        
        // Snap to socket if close enough
        const snapped = runOnJS(snapToSocket)(wireId, isStart, constrainedX, constrainedY);
        
        runOnJS(updateWirePosition)(wireId, isStart, constrainedX, constrainedY);
        
        dragX.value = withSpring(0);
        dragY.value = withSpring(0);
        
        runOnJS(setDraggedWire)(null);
        runOnJS(setDraggedEnd)(null);
      },
    });
  }, [updateWirePosition, snapToSocket]);

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
  const robotStart = levelData.robotStart || [50, 50];

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
            const currentPosition = wirePositions[wire.id] || { start: wire.start, end: wire.end };
            const startX = currentPosition.start[0];
            const startY = currentPosition.start[1];
            const endX = currentPosition.end[0];
            const endY = currentPosition.end[1];

            const startConnected = isWireEndConnected(wire.id, true);
            const endConnected = isWireEndConnected(wire.id, false);

            return (
              <React.Fragment key={wire.id}>
                {/* Wire path */}
                <Line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={wire.color}
                  strokeWidth={startConnected && endConnected ? 8 : 6}
                  strokeLinecap="round"
                  opacity={startConnected && endConnected ? 1 : 0.7}
                />
              </React.Fragment>
            );
          })}

          {/* Render sockets */}
          {sockets.map((socket) => {
            // Check if any wire is connected to this socket
            const isConnected = wires.some(wire => {
              if (wire.color !== socket.color) return false;
              const wirePos = wirePositions[wire.id];
              if (!wirePos) return false;
              
              const startDistance = Math.sqrt(
                Math.pow(wirePos.start[0] - socket.position[0], 2) + 
                Math.pow(wirePos.start[1] - socket.position[1], 2)
              );
              const endDistance = Math.sqrt(
                Math.pow(wirePos.end[0] - socket.position[0], 2) + 
                Math.pow(wirePos.end[1] - socket.position[1], 2)
              );
              
              return startDistance < 25 || endDistance < 25;
            });
            
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

        {/* Draggable wire endpoints */}
        {wires.map((wire) => {
          const currentPosition = wirePositions[wire.id] || { start: wire.start, end: wire.end };
          const startX = currentPosition.start[0];
          const startY = currentPosition.start[1];
          const endX = currentPosition.end[0];
          const endY = currentPosition.end[1];

          const startConnected = isWireEndConnected(wire.id, true);
          const endConnected = isWireEndConnected(wire.id, false);

          return (
            <React.Fragment key={`draggable-${wire.id}`}>
              {/* Draggable start point */}
              <PanGestureHandler onGestureEvent={createWireGestureHandler(wire.id, true, startX, startY)}>
                <Animated.View
                  style={[
                    styles.wireEndpoint,
                    {
                      left: startX - 12,
                      top: startY - 12,
                      backgroundColor: startConnected ? wire.color : 'transparent',
                      borderColor: wire.color,
                    },
                    draggedWire === wire.id && draggedEnd === 'start' && {
                      transform: [{ scale: 1.2 }],
                      shadowColor: wire.color,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 10,
                      elevation: 10,
                    }
                  ]}
                />
              </PanGestureHandler>

              {/* Draggable end point */}
              <PanGestureHandler onGestureEvent={createWireGestureHandler(wire.id, false, endX, endY)}>
                <Animated.View
                  style={[
                    styles.wireEndpoint,
                    {
                      left: endX - 12,
                      top: endY - 12,
                      backgroundColor: endConnected ? wire.color : 'transparent',
                      borderColor: wire.color,
                    },
                    draggedWire === wire.id && draggedEnd === 'end' && {
                      transform: [{ scale: 1.2 }],
                      shadowColor: wire.color,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 10,
                      elevation: 10,
                    }
                  ]}
                />
              </PanGestureHandler>
            </React.Fragment>
          );
        })}

        {/* Static Robot */}
        <View
          style={[
            styles.robot,
            {
              left: robotStart[0] - 15,
              top: robotStart[1] - 15,
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
  wireEndpoint: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    zIndex: 20,
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