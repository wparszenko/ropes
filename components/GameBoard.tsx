import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Svg, Line, Circle, Rect } from 'react-native-svg';
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
const BOARD_HEIGHT = height - 300;
const SNAP_THRESHOLD = 25;

interface GameBoardProps {
  levelData: LevelData | null;
}

interface DragState {
  [key: string]: {
    x: number;
    y: number;
    isDragging: boolean;
  };
}

export default function GameBoard({ levelData }: GameBoardProps) {
  // CRITICAL: Always call ALL hooks at the top level, in the same order
  const { wireConnections, updateWireConnection, activatePortal, completeLevel } = useGameStore();
  const [allConnected, setAllConnected] = useState(false);
  const [dragState, setDragState] = useState<DragState>({});

  // Memoize the level data to prevent unnecessary re-renders
  const memoizedLevelData = useMemo(() => levelData, [levelData]);

  // Early return after all hooks are called
  if (!memoizedLevelData) {
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

  // Initialize drag state for all wire endpoints
  useEffect(() => {
    if (memoizedLevelData) {
      const initialDragState: DragState = {};
      memoizedLevelData.wires.forEach((wire) => {
        initialDragState[`${wire.id}-start`] = {
          x: wire.start[0],
          y: wire.start[1],
          isDragging: false,
        };
        initialDragState[`${wire.id}-end`] = {
          x: wire.end[0],
          y: wire.end[1],
          isDragging: false,
        };
      });
      setDragState(initialDragState);
    }
  }, [memoizedLevelData]);

  // Check connections
  useEffect(() => {
    if (memoizedLevelData) {
      const connected = memoizedLevelData.wires.every(wire => wireConnections[wire.id]);
      setAllConnected(connected);
      
      if (connected && memoizedLevelData.goals.connectAll) {
        activatePortal();
        setTimeout(() => {
          completeLevel(3);
        }, 1000);
      }
    }
  }, [wireConnections, memoizedLevelData, activatePortal, completeLevel]);

  const checkSocketConnection = useCallback((wireId: string, position: { x: number; y: number }) => {
    if (!memoizedLevelData) return;

    const wire = memoizedLevelData.wires.find(w => w.id === wireId);
    if (!wire) return;

    const matchingSockets = memoizedLevelData.sockets.filter(socket => socket.color === wire.color);
    
    for (const socket of matchingSockets) {
      const distance = Math.sqrt(
        Math.pow(position.x - socket.position[0], 2) + 
        Math.pow(position.y - socket.position[1], 2)
      );
      
      if (distance < SNAP_THRESHOLD) {
        updateWireConnection(wireId, true);
        return;
      }
    }
    
    updateWireConnection(wireId, false);
  }, [memoizedLevelData, updateWireConnection]);

  const createDragHandler = useCallback((wireId: string, endpoint: 'start' | 'end') => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: () => {
        scale.value = withSpring(1.2);
        runOnJS(setDragState)((prev) => ({
          ...prev,
          [`${wireId}-${endpoint}`]: {
            ...prev[`${wireId}-${endpoint}`],
            isDragging: true,
          },
        }));
      },
      onActive: (event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      },
      onEnd: (event) => {
        const finalX = (dragState[`${wireId}-${endpoint}`]?.x || 0) + event.translationX;
        const finalY = (dragState[`${wireId}-${endpoint}`]?.y || 0) + event.translationY;
        
        // Boundary constraints
        const constrainedX = Math.max(20, Math.min(width - 52, finalX));
        const constrainedY = Math.max(20, Math.min(BOARD_HEIGHT - 20, finalY));
        
        runOnJS(setDragState)((prev) => ({
          ...prev,
          [`${wireId}-${endpoint}`]: {
            x: constrainedX,
            y: constrainedY,
            isDragging: false,
          },
        }));
        
        runOnJS(checkSocketConnection)(wireId, { x: constrainedX, y: constrainedY });
        
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return { gestureHandler, animatedStyle };
  }, [dragState, checkSocketConnection]);

  const renderWireEndpoint = useCallback((wireId: string, endpoint: 'start' | 'end', wire: any) => {
    const key = `${wireId}-${endpoint}`;
    const position = dragState[key];
    const isConnected = wireConnections[wireId] || false;
    const { gestureHandler, animatedStyle } = createDragHandler(wireId, endpoint);

    if (!position) return null;

    return (
      <PanGestureHandler key={key} onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: position.x - 12,
              top: position.y - 12,
              width: 24,
              height: 24,
              zIndex: 10,
            },
            animatedStyle,
          ]}
        >
          <View
            style={[
              styles.wireEndpoint,
              {
                backgroundColor: isConnected && endpoint === 'end' ? wire.color : 'transparent',
                borderColor: wire.color,
                borderWidth: 3,
              },
            ]}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  }, [dragState, wireConnections, createDragHandler]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameBoard}>
        <Svg width={width - 32} height={BOARD_HEIGHT} style={styles.svg}>
          {/* Render obstacles */}
          {memoizedLevelData.obstacles.map((obstacle) => (
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
          {memoizedLevelData.wires.map((wire) => {
            const isConnected = wireConnections[wire.id] || false;
            const startPos = dragState[`${wire.id}-start`];
            const endPos = dragState[`${wire.id}-end`];

            if (!startPos || !endPos) return null;

            return (
              <Line
                key={wire.id}
                x1={startPos.x}
                y1={startPos.y}
                x2={endPos.x}
                y2={endPos.y}
                stroke={wire.color}
                strokeWidth={isConnected ? 8 : 6}
                strokeLinecap="round"
                opacity={isConnected ? 1 : 0.7}
              />
            );
          })}

          {/* Render sockets */}
          {memoizedLevelData.sockets.map((socket) => {
            const connectedWire = memoizedLevelData.wires.find(
              wire => wire.color === socket.color && wireConnections[wire.id]
            );
            
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

          {/* Portal */}
          {allConnected && (
            <React.Fragment>
              <Circle
                cx={memoizedLevelData.portalPosition[0]}
                cy={memoizedLevelData.portalPosition[1]}
                r={40}
                fill="rgba(24, 255, 146, 0.2)"
                stroke="#18FF92"
                strokeWidth={3}
                opacity={0.8}
              />
              <Circle
                cx={memoizedLevelData.portalPosition[0]}
                cy={memoizedLevelData.portalPosition[1]}
                r={25}
                fill="rgba(24, 255, 146, 0.4)"
                stroke="#18FF92"
                strokeWidth={2}
              />
              <Circle
                cx={memoizedLevelData.portalPosition[0]}
                cy={memoizedLevelData.portalPosition[1]}
                r={10}
                fill="#18FF92"
                opacity={0.9}
              />
            </React.Fragment>
          )}
        </Svg>

        {/* Draggable wire endpoints */}
        {memoizedLevelData.wires.map((wire) => (
          <React.Fragment key={wire.id}>
            {renderWireEndpoint(wire.id, 'start', wire)}
            {renderWireEndpoint(wire.id, 'end', wire)}
          </React.Fragment>
        ))}

        {/* Static Robot */}
        <View
          style={[
            styles.robot,
            {
              left: memoizedLevelData.robotStart[0] - 15,
              top: memoizedLevelData.robotStart[1] - 15,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
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