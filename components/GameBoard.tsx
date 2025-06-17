import React, { useEffect, useCallback } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { Svg } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';
import { type GameBounds } from '@/utils/ropeGenerator';
import { useGameStore } from '@/store/gameStore';
import { useRopeStore } from '@/store/ropeStore';
import { gameBoardStyles } from '@/styles/gameBoardStyles';

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

const MAX_ROPES = 20; // Maximum number of ropes we might ever have

export default function GameBoard({ levelData }: GameBoardProps) {
  const { currentLevel, completeLevel } = useGameStore();
  const { 
    ropes, 
    ropePositions, 
    intersectionCount, 
    isCompleted,
    initializeLevel,
    updateRopePosition,
    checkIntersections 
  } = useRopeStore();

  // Create a fixed number of shared values at the top level
  // This ensures the number of hook calls remains constant
  const sharedValues = [];
  for (let i = 0; i < MAX_ROPES; i++) {
    sharedValues.push({
      startX: useSharedValue(0),
      startY: useSharedValue(0),
      endX: useSharedValue(0),
      endY: useSharedValue(0),
    });
  }

  // Update shared values when positions change
  useEffect(() => {
    ropes.forEach((rope, index) => {
      const position = ropePositions[rope.id];
      const shared = sharedValues[index];
      if (position && shared && index < MAX_ROPES) {
        shared.startX.value = position.startX;
        shared.startY.value = position.startY;
        shared.endX.value = position.endX;
        shared.endY.value = position.endY;
      }
    });
  }, [ropePositions, ropes]);

  // Initialize level when component mounts or level changes
  useEffect(() => {
    initializeLevel(currentLevel, GAME_BOUNDS);
  }, [currentLevel, initializeLevel]);

  // Check for level completion
  useEffect(() => {
    if (isCompleted && ropes.length > 0) {
      setTimeout(() => {
        const stars = currentLevel <= 3 ? 3 : currentLevel <= 6 ? 2 : 1;
        completeLevel(stars);
      }, 500);
    }
  }, [isCompleted, ropes.length, currentLevel, completeLevel]);

  // Handle rope position updates
  const handlePositionChange = useCallback((ropeId: string, endpoint: 'start' | 'end', x: number, y: number) => {
    const positionUpdate = endpoint === 'start' 
      ? { startX: x, startY: y }
      : { endX: x, endY: y };
    
    updateRopePosition(ropeId, positionUpdate);
  }, [updateRopePosition]);

  // Early return after all hooks have been called
  if (ropes.length === 0) {
    return (
      <View style={[gameBoardStyles.container, { height: BOARD_HEIGHT }]}>
        <View style={gameBoardStyles.loadingContainer}>
          <Text style={gameBoardStyles.loadingText}>Loading Level {currentLevel}...</Text>
        </View>
      </View>
    );
  }

  const containerContent = (
    <View style={[gameBoardStyles.container, { height: BOARD_HEIGHT }]}>
      {/* SVG Layer - Behind dots */}
      <View style={gameBoardStyles.svgContainer}>
        <Svg width={BOARD_WIDTH} height={BOARD_HEIGHT} style={gameBoardStyles.svg}>
          {ropes.map((rope, index) => {
            const shared = sharedValues[index];
            if (!shared || index >= MAX_ROPES) return null;
            
            return (
              <RopePath
                key={rope.id}
                startPoint={{ x: shared.startX, y: shared.startY }}
                endPoint={{ x: shared.endX, y: shared.endY }}
                color={rope.color}
              />
            );
          })}
        </Svg>
      </View>

      {/* Dots Layer - Above SVG */}
      <View style={gameBoardStyles.dotsContainer}>
        {ropes.map((rope, index) => {
          const shared = sharedValues[index];
          if (!shared || index >= MAX_ROPES) return null;

          return (
            <React.Fragment key={rope.id}>
              <DraggableDot 
                position={{ x: shared.startX, y: shared.startY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={() => {
                  handlePositionChange(
                    rope.id, 
                    'start', 
                    shared.startX.value, 
                    shared.startY.value
                  );
                }}
              />
              <DraggableDot 
                position={{ x: shared.endX, y: shared.endY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={() => {
                  handlePositionChange(
                    rope.id, 
                    'end', 
                    shared.endX.value, 
                    shared.endY.value
                  );
                }}
              />
            </React.Fragment>
          );
        })}
      </View>

      {/* Visual boundary indicator */}
      <View style={gameBoardStyles.boundaryIndicator} />
    </View>
  );

  // For web, don't wrap in GestureHandlerRootView as it can interfere
  if (Platform.OS === 'web') {
    return (
      <View style={gameBoardStyles.wrapper}>
        {containerContent}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={gameBoardStyles.wrapper}>
      {containerContent}
    </GestureHandlerRootView>
  );
}