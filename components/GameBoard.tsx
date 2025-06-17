import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Svg, Line, Circle, Rect } from 'react-native-svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');
const BOARD_HEIGHT = height - 300; // Account for header and controls

interface GameBoardProps {
  levelData: LevelData;
}

export default function GameBoard({ levelData }: GameBoardProps) {
  const { wireConnections, updateWireConnection, activatePortal, completeLevel } = useGameStore();
  const [allConnected, setAllConnected] = useState(false);

  useEffect(() => {
    // Check if all wires are connected
    const connected = levelData.wires.every(wire => wireConnections[wire.id]);
    setAllConnected(connected);
    
    if (connected && levelData.goals.connectAll) {
      activatePortal();
      // Simulate level completion after portal activation
      setTimeout(() => {
        completeLevel(3); // Award 3 stars for now
      }, 1000);
    }
  }, [wireConnections, levelData]);

  const handleWireTouch = (wireId: string) => {
    // Toggle wire connection for demo purposes
    const currentState = wireConnections[wireId] || false;
    updateWireConnection(wireId, !currentState);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameBoard}>
        <Svg width={width - 32} height={BOARD_HEIGHT} style={styles.svg}>
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
            const isConnected = wireConnections[wire.id] || false;
            const startX = wire.start[0];
            const startY = wire.start[1];
            const endX = wire.end[0];
            const endY = wire.end[1];

            // Create a curved path for the wire
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const arcHeight = Math.min(distance * 0.2, 50);

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
                  onPress={() => handleWireTouch(wire.id)}
                />
                
                {/* Start point */}
                <Circle
                  cx={startX}
                  cy={startY}
                  r={12}
                  fill={wire.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  opacity={0.9}
                />
                
                {/* End point */}
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
          {levelData.sockets.map((socket) => {
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