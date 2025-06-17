import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Svg } from 'react-native-svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Wire from './Wire';
import Socket from './Socket';
import Obstacle from './Obstacle';
import { LevelData } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');

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

  const handleWireConnection = (wireId: string, socketId: string, connected: boolean) => {
    updateWireConnection(wireId, connected);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 relative">
        {/* SVG Layer for wires */}
        <View className="absolute inset-0 z-10">
          <Svg width={width} height={height - 200}>
            {levelData.wires.map((wire) => (
              <Wire
                key={wire.id}
                wire={wire}
                onConnection={handleWireConnection}
              />
            ))}
          </Svg>
        </View>

        {/* Sockets Layer */}
        <View className="absolute inset-0 z-20">
          {levelData.sockets.map((socket) => (
            <Socket
              key={socket.id}
              socket={socket}
              connected={wireConnections[socket.id] || false}
            />
          ))}
        </View>

        {/* Obstacles Layer */}
        <View className="absolute inset-0 z-15">
          {levelData.obstacles.map((obstacle) => (
            <Obstacle
              key={obstacle.id}
              obstacle={obstacle}
            />
          ))}
        </View>

        {/* Portal */}
        {allConnected && (
          <View
            className="absolute bg-neon-green/30 border-4 border-neon-green rounded-full"
            style={{
              left: levelData.portalPosition[0] - 30,
              top: levelData.portalPosition[1] - 30,
              width: 60,
              height: 60,
            }}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}