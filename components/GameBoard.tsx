import React, { useEffect, useCallback, useRef, useMemo } from 'react';
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
const DOT_RADIUS = 25;

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
    isDragging,
    isInitialized,
    initializeLevel,
    updateRopePosition,
    checkIntersections,
    validatePositions,
  } = useRopeStore();

  // Add ref to track if level completion has been triggered
  const completionTriggeredRef = useRef(false);
  const levelRef = useRef(currentLevel);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intersectionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a fixed number of shared values at the top level with memoization
  const sharedValues = useMemo(() => {
    const values = [];
    for (let i = 0; i < MAX_ROPES; i++) {
      values.push({
        startX: useSharedValue(0),
        startY: useSharedValue(0),
        endX: useSharedValue(0),
        endY: useSharedValue(0),
      });
    }
    return values;
  }, []); // Empty dependency array - only create once

  // Initialize level when component mounts or level changes
  useEffect(() => {
    if (currentLevel !== levelRef.current || !isInitialized) {
      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }

      // Add a small delay to ensure proper initialization
      initializationTimeoutRef.current = setTimeout(() => {
        try {
          initializeLevel(currentLevel, GAME_BOUNDS);
          completionTriggeredRef.current = false;
          levelRef.current = currentLevel;
        } catch (error) {
          console.error('Failed to initialize level:', error);
        }
      }, 100);
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [currentLevel, initializeLevel, isInitialized]);

  // Optimized position updates with reduced frequency
  useEffect(() => {
    if (isInitialized && ropes.length > 0) {
      // Clear any pending position update
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }

      // Reduce update frequency to improve performance
      positionUpdateTimeoutRef.current = setTimeout(() => {
        // Only validate positions if not dragging to reduce CPU usage
        if (!isDragging) {
          validatePositions();
        }
        
        ropes.forEach((rope, index) => {
          const position = ropePositions[rope.id];
          const shared = sharedValues[index];
          if (position && shared && index < MAX_ROPES) {
            // Validate position values before setting
            const startX = isNaN(position.startX) ? GAME_BOUNDS.minX + 50 : position.startX;
            const startY = isNaN(position.startY) ? GAME_BOUNDS.minY + 50 : position.startY;
            const endX = isNaN(position.endX) ? GAME_BOUNDS.maxX - 50 : position.endX;
            const endY = isNaN(position.endY) ? GAME_BOUNDS.maxY - 50 : position.endY;
            
            shared.startX.value = startX;
            shared.startY.value = startY;
            shared.endX.value = endX;
            shared.endY.value = endY;
          }
        });
      }, isDragging ? 32 : 16); // Slower updates when dragging, faster when not
    }

    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
    };
  }, [ropePositions, ropes, isInitialized, validatePositions, isDragging]);

  // Optimized level completion check with debouncing
  useEffect(() => {
    if (
      isCompleted && 
      ropes.length > 0 && 
      !completionTriggeredRef.current && 
      gameState === 'playing' &&
      !isDragging &&
      isInitialized
    ) {
      completionTriggeredRef.current = true;
      
      // Debounce completion to prevent multiple triggers
      setTimeout(() => {
        if (completionTriggeredRef.current) {
          const baseStars = 1;
          const timeBonus = intersectionCount === 0 ? 1 : 0;
          const efficiencyBonus = currentLevel <= 3 ? 1 : currentLevel <= 6 ? 2 : 3;
          
          const totalStars = Math.min(baseStars + timeBonus + efficiencyBonus, 4);
          completeLevel(totalStars);
        }
      }, 200); // Reduced delay
    }
  }, [isCompleted, ropes.length, currentLevel, completeLevel, intersectionCount, gameState, isDragging, isInitialized]);

  // Reset completion trigger when game state changes back to playing
  useEffect(() => {
    if (gameState === 'playing') {
      completionTriggeredRef.current = false;
    }
  }, [gameState]);

  // Optimized position change handler with throttling
  const handlePositionChange = useCallback((ropeId: string, endpoint: 'start' | 'end', sharedX: any, sharedY: any) => {
    // Clear any pending intersection check
    if (intersectionCheckTimeoutRef.current) {
      clearTimeout(intersectionCheckTimeoutRef.current);
    }

    // Validate shared values before using them
    const x = isNaN(sharedX.value) ? GAME_BOUNDS.minX + 50 : sharedX.value;
    const y = isNaN(sharedY.value) ? GAME_BOUNDS.minY + 50 : sharedY.value;
    
    const positionUpdate = endpoint === 'start' 
      ? { startX: x, startY: y }
      : { endX: x, endY: y };
    
    updateRopePosition(ropeId, positionUpdate);

    // Throttle intersection checks to reduce CPU usage
    intersectionCheckTimeoutRef.current = setTimeout(() => {
      if (!isDragging) {
        checkIntersections();
      }
    }, 100);
  }, [updateRopePosition, isDragging, checkIntersections]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
      if (intersectionCheckTimeoutRef.current) {
        clearTimeout(intersectionCheckTimeoutRef.current);
      }
    };
  }, []);

  // Show loading state while initializing
  if (!isInitialized || ropes.length === 0) {
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