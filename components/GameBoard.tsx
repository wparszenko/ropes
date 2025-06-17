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

// Memory management for timeouts and intervals
class ComponentTimeoutManager {
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private animationFrames: Set<number> = new Set();
  
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      callback();
    }, delay);
    this.timeouts.add(timeout);
    return timeout;
  }
  
  requestAnimationFrame(callback: () => void): number {
    const frame = requestAnimationFrame(() => {
      this.animationFrames.delete(frame);
      callback();
    });
    this.animationFrames.add(frame);
    return frame;
  }
  
  clearTimeout(timeout: NodeJS.Timeout | null) {
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(timeout);
    }
  }
  
  cancelAnimationFrame(frame: number | null) {
    if (frame) {
      cancelAnimationFrame(frame);
      this.animationFrames.delete(frame);
    }
  }
  
  clearAll() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.animationFrames.forEach(frame => cancelAnimationFrame(frame));
    this.timeouts.clear();
    this.animationFrames.clear();
  }
  
  getActiveCount() {
    return this.timeouts.size + this.animationFrames.size;
  }
}

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
    cleanupLevel, // New cleanup method
  } = useRopeStore();

  // Add ref to track if level completion has been triggered
  const completionTriggeredRef = useRef(false);
  const levelRef = useRef(currentLevel);
  const timeoutManager = useRef(new ComponentTimeoutManager());
  
  // Performance optimization: Batch position updates
  const positionUpdateBatch = useRef<Map<string, any>>(new Map());
  const batchUpdateFrame = useRef<number | null>(null);

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

  // Clean up when level changes
  useEffect(() => {
    if (currentLevel !== levelRef.current) {
      console.log(`GameBoard: Level changed from ${levelRef.current} to ${currentLevel}, cleaning up`);
      
      // Clear all pending operations
      timeoutManager.current.clearAll();
      if (batchUpdateFrame.current) {
        cancelAnimationFrame(batchUpdateFrame.current);
        batchUpdateFrame.current = null;
      }
      positionUpdateBatch.current.clear();
      
      cleanupLevel(); // Clean up previous level data
      completionTriggeredRef.current = false;
      levelRef.current = currentLevel;
    }
  }, [currentLevel, cleanupLevel]);

  // Initialize level when component mounts or level changes
  useEffect(() => {
    if (currentLevel !== levelRef.current || !isInitialized) {
      // Clear any existing operations
      timeoutManager.current.clearAll();

      // Add a small delay to ensure proper initialization
      const initTimeout = timeoutManager.current.setTimeout(() => {
        try {
          console.log(`GameBoard: Initializing level ${currentLevel}`);
          initializeLevel(currentLevel, GAME_BOUNDS);
          completionTriggeredRef.current = false;
          levelRef.current = currentLevel;
        } catch (error) {
          console.error('Failed to initialize level:', error);
        }
      }, 100);
    }
  }, [currentLevel, initializeLevel, isInitialized]);

  // Performance optimization: Batch position updates with reduced frequency
  const processBatchUpdate = useCallback(() => {
    if (positionUpdateBatch.current.size === 0) return;
    
    // Validate positions first
    validatePositions();
    
    // Process all batched updates
    const updates = Array.from(positionUpdateBatch.current.entries());
    positionUpdateBatch.current.clear();
    
    updates.forEach(([index, { position, shared }]) => {
      if (shared && parseInt(index) < MAX_ROPES) {
        // Validate position values before setting - avoid reading during render
        const startX = isNaN(position.startX) ? GAME_BOUNDS.minX + 50 : position.startX;
        const startY = isNaN(position.startY) ? GAME_BOUNDS.minY + 50 : position.startY;
        const endX = isNaN(position.endX) ? GAME_BOUNDS.maxX - 50 : position.endX;
        const endY = isNaN(position.endY) ? GAME_BOUNDS.maxY - 50 : position.endY;
        
        // Set values outside of render cycle
        shared.startX.value = startX;
        shared.startY.value = startY;
        shared.endX.value = endX;
        shared.endY.value = endY;
      }
    });
    
    batchUpdateFrame.current = null;
  }, [validatePositions]);

  // Performance optimization: Batch position updates and reduce frequency
  useEffect(() => {
    if (isInitialized && ropes.length > 0) {
      // Clear any pending batch update
      if (batchUpdateFrame.current) {
        cancelAnimationFrame(batchUpdateFrame.current);
      }

      // Batch position updates for better performance
      ropes.forEach((rope, index) => {
        const position = ropePositions[rope.id];
        const shared = sharedValues[index];
        if (position && shared && index < MAX_ROPES) {
          positionUpdateBatch.current.set(index.toString(), { position, shared });
        }
      });
      
      // Process batch update on next frame
      batchUpdateFrame.current = timeoutManager.current.requestAnimationFrame(processBatchUpdate);
    }

    return () => {
      if (batchUpdateFrame.current) {
        cancelAnimationFrame(batchUpdateFrame.current);
        batchUpdateFrame.current = null;
      }
    };
  }, [ropePositions, ropes, isInitialized, processBatchUpdate]);

  // Check for level completion with proper debouncing - only when not dragging
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
      
      timeoutManager.current.setTimeout(() => {
        // Calculate stars based on performance
        const baseStars = 1;
        const timeBonus = intersectionCount === 0 ? 1 : 0; // Bonus for perfect solution
        const efficiencyBonus = currentLevel <= 3 ? 1 : currentLevel <= 6 ? 2 : 3; // Progressive bonus
        
        const totalStars = Math.min(baseStars + timeBonus + efficiencyBonus, 4); // Max 4 stars
        completeLevel(totalStars);
      }, 200); // Reduced delay for better responsiveness
    }
  }, [isCompleted, ropes.length, currentLevel, completeLevel, intersectionCount, gameState, isDragging, isInitialized]);

  // Reset completion trigger when game state changes back to playing
  useEffect(() => {
    if (gameState === 'playing') {
      completionTriggeredRef.current = false;
    }
  }, [gameState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('GameBoard: Unmounting, cleaning up data');
      
      // Clear all managed timeouts and frames
      timeoutManager.current.clearAll();
      
      if (batchUpdateFrame.current) {
        cancelAnimationFrame(batchUpdateFrame.current);
      }
      
      positionUpdateBatch.current.clear();
      cleanupLevel();
      
      console.log(`GameBoard cleanup complete. Active operations: ${timeoutManager.current.getActiveCount()}`);
    };
  }, [cleanupLevel]);

  // Performance optimized position change handler with batching
  const handlePositionChange = useCallback((ropeId: string, endpoint: 'start' | 'end', sharedX: any, sharedY: any) => {
    // Use a callback to avoid reading shared values during render
    const updatePosition = () => {
      try {
        // Validate shared values before using them
        const x = isNaN(sharedX.value) ? GAME_BOUNDS.minX + 50 : sharedX.value;
        const y = isNaN(sharedY.value) ? GAME_BOUNDS.minY + 50 : sharedY.value;
        
        const positionUpdate = endpoint === 'start' 
          ? { startX: x, startY: y }
          : { endX: x, endY: y };
        
        updateRopePosition(ropeId, positionUpdate);
      } catch (error) {
        console.warn('Position update failed:', error);
      }
    };
    
    // Use timeout manager for proper cleanup
    timeoutManager.current.requestAnimationFrame(updatePosition);
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