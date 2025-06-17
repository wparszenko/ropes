import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, Dimensions, Platform, AppState } from 'react-native';
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
    cleanupLevel,
  } = useRopeStore();

  // Enhanced refs for better memory management
  const completionTriggeredRef = useRef(false);
  const levelRef = useRef(currentLevel);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const appStateRef = useRef(AppState.currentState);
  const lastUpdateTimeRef = useRef(0);

  // Create a fixed number of shared values at the top level
  const sharedValues = [];
  for (let i = 0; i < MAX_ROPES; i++) {
    sharedValues.push({
      startX: useSharedValue(0),
      startY: useSharedValue(0),
      endX: useSharedValue(0),
      endY: useSharedValue(0),
    });
  }

  // App state management for performance
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState.match(/inactive|background/)) {
        // App is going to background - pause updates
        console.log('GameBoard: App backgrounded, pausing updates');
        if (positionUpdateTimeoutRef.current) {
          clearTimeout(positionUpdateTimeoutRef.current);
          positionUpdateTimeoutRef.current = null;
        }
      } else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground - resume updates
        console.log('GameBoard: App resumed, resuming updates');
        if (isMountedRef.current && isInitialized) {
          validatePositions();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isInitialized, validatePositions]);

  // Enhanced cleanup when level changes
  useEffect(() => {
    if (currentLevel !== levelRef.current) {
      console.log(`GameBoard: Level changed from ${levelRef.current} to ${currentLevel}, cleaning up`);
      
      // Clear all timeouts
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
        positionUpdateTimeoutRef.current = null;
      }
      
      cleanupLevel();
      completionTriggeredRef.current = false;
      levelRef.current = currentLevel;
    }
  }, [currentLevel, cleanupLevel]);

  // Enhanced level initialization with better memory management
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (currentLevel !== levelRef.current || !isInitialized) {
      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }

      // Add a small delay to ensure proper initialization
      initializationTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        try {
          console.log(`GameBoard: Initializing level ${currentLevel}`);
          initializeLevel(currentLevel, GAME_BOUNDS);
          completionTriggeredRef.current = false;
          levelRef.current = currentLevel;
        } catch (error) {
          console.error('Failed to initialize level:', error);
          cleanupLevel();
        }
        
        initializationTimeoutRef.current = null;
      }, 100);
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }
    };
  }, [currentLevel, initializeLevel, isInitialized]);

  // Enhanced position updates with better performance and memory management
  useEffect(() => {
    if (!isMountedRef.current || !isInitialized || ropes.length === 0) return;
    
    // Skip updates if app is in background
    if (appStateRef.current.match(/inactive|background/)) return;

    // Throttle updates more aggressively for better performance
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 50) { // 20fps max
      return;
    }
    lastUpdateTimeRef.current = now;

    // Clear any pending position update
    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current);
      positionUpdateTimeoutRef.current = null;
    }

    // Batch position updates with longer delay for better performance
    positionUpdateTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current || !isInitialized) return;
      
      // Validate positions first
      validatePositions();
      
      // Update shared values in batches to reduce render cycles
      const updates = [];
      ropes.forEach((rope, index) => {
        const position = ropePositions[rope.id];
        const shared = sharedValues[index];
        if (position && shared && index < MAX_ROPES) {
          updates.push({ position, shared, index });
        }
      });
      
      // Apply all updates at once
      updates.forEach(({ position, shared }) => {
        // Validate position values before setting
        const startX = isNaN(position.startX) ? GAME_BOUNDS.minX + 50 : position.startX;
        const startY = isNaN(position.startY) ? GAME_BOUNDS.minY + 50 : position.startY;
        const endX = isNaN(position.endX) ? GAME_BOUNDS.maxX - 50 : position.endX;
        const endY = isNaN(position.endY) ? GAME_BOUNDS.maxY - 50 : position.endY;
        
        // Set values outside of render cycle
        shared.startX.value = startX;
        shared.startY.value = startY;
        shared.endX.value = endX;
        shared.endY.value = endY;
      });
      
      positionUpdateTimeoutRef.current = null;
    }, 50); // Increased delay for better performance

    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
        positionUpdateTimeoutRef.current = null;
      }
    };
  }, [ropePositions, ropes, isInitialized, validatePositions]);

  // Enhanced completion checking with memory leak prevention
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (
      isCompleted && 
      ropes.length > 0 && 
      !completionTriggeredRef.current && 
      gameState === 'playing' &&
      !isDragging &&
      isInitialized
    ) {
      completionTriggeredRef.current = true;
      
      const timeoutId = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        // Calculate stars based on performance
        const baseStars = 1;
        const timeBonus = intersectionCount === 0 ? 1 : 0;
        const efficiencyBonus = currentLevel <= 3 ? 1 : currentLevel <= 6 ? 2 : 3;
        
        const totalStars = Math.min(baseStars + timeBonus + efficiencyBonus, 4);
        completeLevel(totalStars);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isCompleted, ropes.length, currentLevel, completeLevel, intersectionCount, gameState, isDragging, isInitialized]);

  // Reset completion trigger when game state changes
  useEffect(() => {
    if (gameState === 'playing') {
      completionTriggeredRef.current = false;
    }
  }, [gameState]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log('GameBoard: Unmounting, cleaning up data');
      isMountedRef.current = false;
      
      // Clear all timeouts
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = null;
      }
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
        positionUpdateTimeoutRef.current = null;
      }
      
      cleanupLevel();
    };
  }, [cleanupLevel]);

  // Enhanced position change handler with throttling
  const handlePositionChange = useCallback((ropeId: string, endpoint: 'start' | 'end', sharedX: any, sharedY: any) => {
    if (!isMountedRef.current) return;
    
    // Throttle position updates for better performance
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 16) { // 60fps max
      return;
    }
    lastUpdateTimeRef.current = now;
    
    // Use a callback to avoid reading shared values during render
    const updatePosition = () => {
      if (!isMountedRef.current) return;
      
      // Validate shared values before using them
      const x = isNaN(sharedX.value) ? GAME_BOUNDS.minX + 50 : sharedX.value;
      const y = isNaN(sharedY.value) ? GAME_BOUNDS.minY + 50 : sharedY.value;
      
      const positionUpdate = endpoint === 'start' 
        ? { startX: x, startY: y }
        : { endX: x, endY: y };
      
      updateRopePosition(ropeId, positionUpdate);
    };
    
    // Use requestAnimationFrame for better performance
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(updatePosition);
    } else {
      // Fallback for environments without requestAnimationFrame
      setTimeout(updatePosition, 0);
    }
  }, [updateRopePosition]);

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