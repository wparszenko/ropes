import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Svg, Line, Circle, Rect, Path } from 'react-native-svg';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue,
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');
const BOARD_HEIGHT = height - 300; // Account for header and controls
const BOARD_WIDTH = width - 32;

interface GameBoardProps {
  levelData: LevelData;
}

interface DraggableWirePoint {
  wireId: string;
  pointType: 'start' | 'end';
  x: number;
  y: number;
}

export default function GameBoard({ levelData }: GameBoardProps) {
  const { wireConnections, updateWireConnection, activatePortal, completeLevel } = useGameStore();
  const [allConnected, setAllConnected] = useState(false);
  const [wirePositions, setWirePositions] = useState<{ [key: string]: { start: [number, number], end: [number, number] } }>({});
  const [draggedPoint, setDraggedPoint] = useState<DraggableWirePoint | null>(null);

  // Initialize wire positions from level data
  useEffect(() => {
    const initialPositions: { [key: string]: { start: [number, number], end: [number, number] } } = {};
    levelData.wires.forEach(wire => {
      initialPositions[wire.id] = {
        start: wire.start,
        end: wire.end
      };
    });
    setWirePositions(initialPositions);
  }, [levelData]);

  useEffect(() => {
    // Check if all wires are connected to their matching sockets
    const connected = levelData.wires.every(wire => {
      const wirePos = wirePositions[wire.id];
      if (!wirePos) return false;
      
      // Check if wire end is close to any matching socket
      return levelData.sockets.some(socket => {
        if (socket.color !== wire.color) return false;
        const distance = Math.sqrt(
          Math.pow(wirePos.end[0] - socket.position[0], 2) + 
          Math.pow(wirePos.end[1] - socket.position[1], 2)
        );
        return distance < 25; // Connection threshold
      });
    });
    
    setAllConnected(connected);
    
    if (connected && levelData.goals.connectAll) {
      activatePortal();
      setTimeout(() => {
        completeLevel(3);
      }, 1000);
    }
  }, [wirePositions, levelData]);

  const updateWirePosition = (wireId: string, pointType: 'start' | 'end', newX: number, newY: number) => {
    setWirePositions(prev => ({
      ...prev,
      [wireId]: {
        ...prev[wireId],
        [pointType]: [newX, newY]
      }
    }));
  };

  const checkCollisionWithObstacles = (x: number, y: number): boolean => {
    return levelData.obstacles.some(obstacle => {
      const left = obstacle.position[0] - obstacle.size[0] / 2;
      const right = obstacle.position[0] + obstacle.size[0] / 2;
      const top = obstacle.position[1] - obstacle.size[1] / 2;
      const bottom = obstacle.position[1] + obstacle.size[1] / 2;
      
      return x >= left && x <= right && y >= top && y <= bottom;
    });
  };

  const snapToSocket = (x: number, y: number, wireColor: string): [number, number] => {
    const matchingSocket = levelData.sockets.find(socket => {
      if (socket.color !== wireColor) return false;
      const distance = Math.sqrt(
        Math.pow(x - socket.position[0], 2) + 
        Math.pow(y - socket.position[1], 2)
      );
      return distance < 40; // Snap threshold
    });
    
    return matchingSocket ? matchingSocket.position : [x, y];
  };

  const createPanGestureHandler = (wireId: string, pointType: 'start' | 'end', wireColor: string) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context) => {
        const currentPos = wirePositions[wireId]?.[pointType] || [0, 0];
        context.startX = currentPos[0];
        context.startY = currentPos[1];
        runOnJS(setDraggedPoint)({ wireId, pointType, x: currentPos[0], y: currentPos[1] });
      },
      onActive: (event, context) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        
        const newX = Math.max(20, Math.min(BOARD_WIDTH - 20, context.startX + event.translationX));
        const newY = Math.max(20, Math.min(BOARD_HEIGHT - 20, context.startY + event.translationY));
        
        // Check for obstacle collision
        if (!runOnJS(checkCollisionWithObstacles)(newX, newY)) {
          runOnJS(updateWirePosition)(wireId, pointType, newX, newY);
        }
      },
      onEnd: (event, context) => {
        const finalX = Math.max(20, Math.min(BOARD_WIDTH - 20, context.startX + event.translationX));
        const finalY = Math.max(20, Math.min(BOARD_HEIGHT - 20, context.startY + event.translationY));
        
        // Snap to socket if close enough
        const [snappedX, snappedY] = runOnJS(snapToSocket)(finalX, finalY, wireColor);
        runOnJS(updateWirePosition)(wireId, pointType, snappedX, snappedY);
        
        // Reset animation values
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        runOnJS(setDraggedPoint)(null);
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

  const renderWire = (wire: any) => {
    const wirePos = wirePositions[wire.id];
    if (!wirePos) return null;

    const startX = wirePos.start[0];
    const startY = wirePos.start[1];
    const endX = wirePos.end[0];
    const endY = wirePos.end[1];

    // Check if wire is connected to correct socket
    const isConnected = levelData.sockets.some(socket => {
      if (socket.color !== wire.color) return false;
      const distance = Math.sqrt(
        Math.pow(endX - socket.position[0], 2) + 
        Math.pow(endY - socket.position[1], 2)
      );
      return distance < 25;
    });

    // Create curved path for the wire
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const curvature = Math.min(distance * 0.2, 50);
    
    const pathData = `M ${startX} ${startY} Q ${midX} ${midY - curvature} ${endX} ${endY}`;

    const startGesture = createPanGestureHandler(wire.id, 'start', wire.color);
    const endGesture = createPanGestureHandler(wire.id, 'end', wire.color);

    return (
      <React.Fragment key={wire.id}>
        {/* Wire path */}
        <Path
          d={pathData}
          stroke={wire.color}
          strokeWidth={isConnected ? 8 : 6}
          strokeLinecap="round"
          fill="none"
          opacity={isConnected ? 1 : 0.7}
        />
        
        {/* Start point - draggable */}
        <PanGestureHandler onGestureEvent={startGesture.gestureHandler}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: startX - 15,
                top: startY - 15,
                width: 30,
                height: 30,
                zIndex: 10,
              },
              startGesture.animatedStyle
            ]}
          >
            <Svg width={30} height={30}>
              <Circle
                cx={15}
                cy={15}
                r={12}
                fill={wire.color}
                stroke="#FFFFFF"
                strokeWidth={3}
                opacity={0.9}
              />
              <Circle
                cx={15}
                cy={15}
                r={6}
                fill="#FFFFFF"
                opacity={0.8}
              />
            </Svg>
          </Animated.View>
        </PanGestureHandler>
        
        {/* End point - draggable */}
        <PanGestureHandler onGestureEvent={endGesture.gestureHandler}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: endX - 15,
                top: endY - 15,
                width: 30,
                height: 30,
                zIndex: 10,
              },
              endGesture.animatedStyle
            ]}
          >
            <Svg width={30} height={30}>
              <Circle
                cx={15}
                cy={15}
                r={12}
                fill={isConnected ? wire.color : 'transparent'}
                stroke={wire.color}
                strokeWidth={3}
                opacity={isConnected ? 1 : 0.7}
              />
              {isConnected && (
                <Circle
                  cx={15}
                  cy={15}
                  r={6}
                  fill="#FFFFFF"
                  opacity={0.9}
                />
              )}
            </Svg>
          </Animated.View>
        </PanGestureHandler>
      </React.Fragment>
    );
  };

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

          {/* Render sockets */}
          {levelData.sockets.map((socket) => {
            // Check if any wire is connected to this socket
            const isConnected = levelData.wires.some(wire => {
              const wirePos = wirePositions[wire.id];
              if (!wirePos || wire.color !== socket.color) return false;
              const distance = Math.sqrt(
                Math.pow(wirePos.end[0] - socket.position[0], 2) + 
                Math.pow(wirePos.end[1] - socket.position[1], 2)
              );
              return distance < 25;
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
                cx={levelData.portalPosition[0]}
                cy={levelData.portalPosition[1]}
                r={40}
                fill="rgba(24, 255, 146, 0.2)"
                stroke="#18FF92"
                strokeWidth={3}
                opacity={0.8}
              />
              
              {/* Portal inner circle */}
              <Circle
                cx={levelData.portalPosition[0]}
                cy={levelData.portalPosition[1]}
                r={25}
                fill="rgba(24, 255, 146, 0.4)"
                stroke="#18FF92"
                strokeWidth={2}
              />
              
              {/* Portal center */}
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

        {/* Render draggable wires */}
        {levelData.wires.map(wire => renderWire(wire))}

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