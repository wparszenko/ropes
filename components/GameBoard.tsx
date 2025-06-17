import React, { useEffect, useCallback, useRef } from 'react';
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
  const { currentLevel, completeLevel, gameState } = useGameStore();
  const { 
    ropes, 
    ropePositions, 
    intersectionCount, 
    isCompleted,
    initializeLevel,
    updateRopePosition,
    checkIntersections 
  } = useRopeStore();

  // Add ref to track if level completion has been triggered
  const completionTriggeredRef = useRef(false);

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

  // Initialize level when component mounts or level changes
  useEffect(() => {
    initializeLevel(currentLevel, GAME_BOUNDS);
    // Reset completion trigger when level changes
    completionTriggeredRef.current = false;
  }, [currentLevel, initializeLevel]);

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

  // Check for level completion with proper debouncing
  useEffect(() => {
    if (isCompleted && ropes.length > 0 && !completionTriggeredRef.current && gameState === 'playing') {
      completionTriggeredRef.current = true;
      
      setTimeout(() => {
        // Calculate stars based on performance
        const baseStars = 1;
        const timeBonus = intersectionCount === 0 ? 1 : 0; // Bonus for perfect solution
        const efficiencyBonus = currentLevel <= 3 ? 1 : currentLevel <= 6 ? 2 : 3; // Progressive bonus
        
        const totalStars = Math.min(baseStars + timeBonus + efficiencyBonus, 4); // Max 4 stars
        completeLevel(totalStars);
      }, 500);
    }
  }, [isCompleted, ropes.length, currentLevel, completeLevel, intersectionCount, gameState]);

  // Reset completion trigger when game state changes back to playing
  useEffect(() => {
    if (gameState === 'playing') {
      completionTriggeredRef.current = false;
    }
  }, [gameState]);

  // Handle rope position updates with immediate callback
  const handlePositionChange = useCallback((ropeId: string, endpoint: 'start' | 'end', sharedX: any, sharedY: any) => {
    const positionUpdate = endpoint === 'start' 
      ? { startX: sharedX.value, startY: sharedY.value }
      : { endX: sharedX.value, endY: sharedY.value };
    
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
                  handlePositionChange(rope.id, 'start', shared.startX, shared.startY);
                }}
              />
              <DraggableDot 
                position={{ x: shared.endX, y: shared.endY }}
                color={rope.color}
                bounds={GAME_BOUNDS}
                onPositionChange={() => {
                  handlePositionChange(rope.id, 'end', shared.endX, shared.endY);
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