import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw, Lightbulb, Chrome as Home, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useRopeStore } from '@/store/ropeStore';
import GameBoard from '@/components/GameBoard';
import LevelCompleteModal from '@/components/LevelCompleteModal';
import LevelFailedModal from '@/components/LevelFailedModal';
import { gameScreenStyles } from '@/styles/gameScreenStyles';

const { width, height } = Dimensions.get('window');

// Enhanced timer class with better memory management
class GameTimer {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private onTick: () => void;
  private onComplete: () => void;
  private destroyed: boolean = false;

  constructor(onTick: () => void, onComplete: () => void) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start() {
    if (this.destroyed) {
      console.warn('Attempted to start destroyed timer');
      return;
    }
    
    if (this.isRunning) {
      this.stop(); // Stop existing timer first
    }
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      if (this.isRunning && !this.destroyed) {
        try {
          this.onTick();
        } catch (error) {
          console.error('Timer tick error:', error);
          this.stop();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  destroy() {
    this.stop();
    this.destroyed = true;
    // Clear references to prevent memory leaks
    this.onTick = () => {};
    this.onComplete = () => {};
  }

  getIsRunning() {
    return this.isRunning && !this.destroyed;
  }

  isDestroyed() {
    return this.destroyed;
  }
}

export default function GameScreen() {
  const {
    currentLevel,
    gameState,
    levelState,
    timeRemaining,
    resetLevel: resetGameLevel,
    startLevel,
    getCurrentLevelData,
    getMaxStarsForLevel,
    setTimeRemaining,
    decrementTime,
    completeLevel,
    failLevel,
    getLevelTimer,
    calculateStarsForTime,
  } = useGameStore();

  const { 
    resetLevel: resetRopeLevel, 
    ropes, 
    intersectionCount,
    isCompleted,
    isDragging,
    isInitialized,
    cleanupLevel, // New cleanup method
    currentLevel: ropeCurrentLevel 
  } = useRopeStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [modalStars, setModalStars] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  
  // Enhanced refs for better memory management
  const modalShownForLevel = useRef<number | null>(null);
  const modalClosingRef = useRef(false);
  const gameTimerRef = useRef<GameTimer | null>(null);
  const levelStateRef = useRef(levelState);
  const levelRef = useRef(currentLevel);
  const completionTriggeredRef = useRef(false);
  const componentMounted = useRef(true);

  // Update refs when values change
  useEffect(() => {
    levelStateRef.current = levelState;
  }, [levelState]);

  useEffect(() => {
    levelRef.current = currentLevel;
  }, [currentLevel]);

  // Enhanced timer tick handler with error handling
  const handleTimerTick = useCallback(() => {
    if (!componentMounted.current) return;
    
    try {
      // Check if level is still playing before decrementing
      if (levelStateRef.current === 'playing') {
        decrementTime();
      } else {
        // Stop timer if level state changed
        gameTimerRef.current?.stop();
      }
    } catch (error) {
      console.error('Timer tick error:', error);
      gameTimerRef.current?.stop();
    }
  }, [decrementTime]);

  // Enhanced timer complete handler with error handling
  const handleTimerComplete = useCallback(() => {
    if (!componentMounted.current) return;
    
    try {
      if (levelStateRef.current === 'playing') {
        failLevel();
      }
    } catch (error) {
      console.error('Timer complete error:', error);
    }
  }, [failLevel]);

  // Initialize timer instance with proper cleanup
  useEffect(() => {
    // Destroy existing timer if any
    if (gameTimerRef.current) {
      gameTimerRef.current.destroy();
    }
    
    // Create new timer instance
    gameTimerRef.current = new GameTimer(handleTimerTick, handleTimerComplete);

    // Cleanup on unmount
    return () => {
      if (gameTimerRef.current) {
        gameTimerRef.current.destroy();
        gameTimerRef.current = null;
      }
    };
  }, [handleTimerTick, handleTimerComplete]);

  // Clean up rope data when level changes to prevent memory leaks
  useEffect(() => {
    if (ropeCurrentLevel !== currentLevel && ropeCurrentLevel > 0) {
      console.log(`Level changed from ${ropeCurrentLevel} to ${currentLevel}, cleaning up rope data`);
      cleanupLevel();
    }
  }, [currentLevel, ropeCurrentLevel, cleanupLevel]);

  // Reset level data and timer when level changes
  useEffect(() => {
    const data = getCurrentLevelData();
    setLevelData(data);
    
    // Reset modal tracking for new level
    modalShownForLevel.current = null;
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalClosingRef.current = false;
    completionTriggeredRef.current = false;
    
    // Reset timer based on level
    const levelTime = getLevelTimer(currentLevel);
    setTimeRemaining(levelTime);
  }, [currentLevel, getCurrentLevelData, setTimeRemaining, getLevelTimer]);

  // Start timer when level state becomes 'playing'
  useEffect(() => {
    const timer = gameTimerRef.current;
    if (!timer || timer.isDestroyed()) return;

    if (levelState === 'playing') {
      // Start timer when level is playing
      console.log('Starting timer for level', currentLevel);
      timer.start();
    } else {
      // Stop timer when level is not playing
      console.log('Stopping timer, level state:', levelState);
      timer.stop();
    }
  }, [levelState, currentLevel]);

  // Auto-start level when it's fresh and game board is ready
  useEffect(() => {
    if (levelState === 'fresh' && ropes.length > 0) {
      // Small delay to ensure everything is initialized
      const startTimeout = setTimeout(() => {
        if (componentMounted.current) {
          console.log('Auto-starting fresh level', currentLevel);
          startLevel();
        }
      }, 500);
      
      return () => clearTimeout(startTimeout);
    }
  }, [levelState, ropes.length, currentLevel, startLevel]);

  // Handle level completion - check for rope completion and show modal
  useEffect(() => {
    if (
      isCompleted && 
      ropes.length > 0 && 
      !completionTriggeredRef.current && 
      levelState === 'playing' &&
      !isDragging &&
      isInitialized &&
      !showCompleteModal &&
      !modalClosingRef.current &&
      modalShownForLevel.current !== currentLevel &&
      componentMounted.current
    ) {
      console.log('Level completed! Showing completion modal');
      completionTriggeredRef.current = true;
      
      // Stop timer immediately on completion
      gameTimerRef.current?.stop();

      const totalTime = getLevelTimer(currentLevel);
      const timeElapsed = totalTime - timeRemaining;
      setCompletionTime(timeElapsed);
      
      // Calculate stars based on new system
      const earnedStars = calculateStarsForTime(currentLevel, timeElapsed);
      setModalStars(earnedStars);
      
      // Complete the level in the game store
      completeLevel(earnedStars);
      
      // Show modal
      setShowCompleteModal(true);
      modalShownForLevel.current = currentLevel;
    }
  }, [
    isCompleted, 
    ropes.length, 
    currentLevel, 
    levelState, 
    isDragging, 
    isInitialized, 
    showCompleteModal, 
    modalClosingRef.current, 
    modalShownForLevel.current, 
    timeRemaining, 
    completeLevel,
    getLevelTimer,
    calculateStarsForTime
  ]);

  // Handle level failure - only show when actually failed and stop timer
  useEffect(() => {
    if (
      levelState === 'failed' && 
      !showFailedModal && 
      !modalClosingRef.current &&
      modalShownForLevel.current !== currentLevel &&
      componentMounted.current
    ) {
      // Stop timer immediately on failure
      gameTimerRef.current?.stop();

      setShowFailedModal(true);
      modalShownForLevel.current = currentLevel;
    }
  }, [levelState, showFailedModal, currentLevel]);

  // Enhanced cleanup when leaving the game screen
  useEffect(() => {
    componentMounted.current = true;
    
    return () => {
      console.log('Game screen unmounting, cleaning up timer and rope data');
      componentMounted.current = false;
      
      // Destroy timer
      if (gameTimerRef.current) {
        gameTimerRef.current.destroy();
        gameTimerRef.current = null;
      }
      
      // Clean up rope data when leaving game
      cleanupLevel();
    };
  }, [cleanupLevel]);

  const handleBack = () => {
    // Stop and destroy timer when leaving game
    if (gameTimerRef.current) {
      gameTimerRef.current.destroy();
      gameTimerRef.current = null;
    }
    // Clean up rope data to prevent memory leaks
    cleanupLevel();
    router.back();
  };

  const handleReset = () => {
    console.log('Reset button clicked - restarting level with fresh ropes');
    
    // Stop timer during reset
    gameTimerRef.current?.stop();

    // Close any open modals
    modalClosingRef.current = true;
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalShownForLevel.current = null;
    completionTriggeredRef.current = false;
    
    // Clean up current rope data completely
    cleanupLevel();
    
    // Reset game state to fresh
    resetGameLevel(); // This sets levelState to 'fresh'
    
    // Small delay to ensure cleanup is complete, then reset ropes
    const resetTimeout = setTimeout(() => {
      if (componentMounted.current) {
        console.log('Generating fresh ropes for level', currentLevel);
        resetRopeLevel(); // This will generate completely new ropes
        modalClosingRef.current = false;
        // The level will auto-start due to the useEffect above
      }
    }, 200);
    
    return () => clearTimeout(resetTimeout);
  };

  const handleHint = () => {
    const ropeCount = ropes.length;
    const totalTime = getLevelTimer(currentLevel);
    const timePerStar = Math.floor(totalTime / 3);
    
    Alert.alert(
      'How to Play',
      `Drag the colored dots to move the rope endpoints. Your goal is to untangle all ${ropeCount} ropes so that none of them cross each other.\n\nTime Limit: ${totalTime} seconds\n\nStar System:\n⭐⭐⭐ Complete in ${timePerStar} seconds\n⭐⭐ Complete in ${timePerStar * 2} seconds\n⭐ Complete in ${timePerStar * 3} seconds\n\nTip: Try to identify which ropes are crossing and move their endpoints to separate them.\n\nCurrent intersections: ${intersectionCount}`,
      [{ text: 'Got it!' }]
    );
  };

  const handleHome = () => {
    // Stop and destroy timer when going home
    if (gameTimerRef.current) {
      gameTimerRef.current.destroy();
      gameTimerRef.current = null;
    }
    // Clean up rope data to prevent memory leaks
    cleanupLevel();
    router.push('/');
  };

  const handleNextLevel = () => {
    modalClosingRef.current = true;
    setShowCompleteModal(false);
    modalShownForLevel.current = null;
    completionTriggeredRef.current = false;
    
    // Clean up current level data before moving to next
    cleanupLevel();
    
    const nextTimeout = setTimeout(() => {
      if (componentMounted.current) {
        modalClosingRef.current = false;
      }
    }, 200);
    
    return () => clearTimeout(nextTimeout);
  };

  const handleCloseModal = () => {
    // Set closing flag to prevent re-opening
    modalClosingRef.current = true;
    
    // Close both modals immediately
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalShownForLevel.current = null;
    completionTriggeredRef.current = false;
    
    // Reset the closing flag after a delay
    const closeTimeout = setTimeout(() => {
      if (componentMounted.current) {
        modalClosingRef.current = false;
      }
    }, 500);
    
    return () => clearTimeout(closeTimeout);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!levelData) {
    return (
      <View style={gameScreenStyles.container}>
        <LinearGradient colors={['#0F1117', '#1A1D29']} style={gameScreenStyles.gradient}>
          <View style={gameScreenStyles.loadingContainer}>
            <Text style={gameScreenStyles.loadingText}>Loading Level {currentLevel}...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const ropeCount = ropes.length || Math.min(currentLevel + 1, 10);
  const totalTime = getLevelTimer(currentLevel);
  const timePerStar = Math.floor(totalTime / 3);

  return (
    <View style={gameScreenStyles.container}>
      <LinearGradient colors={['#0F1117', '#1A1D29']} style={gameScreenStyles.gradient}>
        {/* Header */}
        <View style={gameScreenStyles.header}>
          <TouchableOpacity onPress={handleBack} style={gameScreenStyles.headerButton}>
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>

          <View style={gameScreenStyles.headerCenter}>
            <Text style={gameScreenStyles.levelTitle}>LEVEL {currentLevel}</Text>
            <Text style={gameScreenStyles.levelSubtitle}>
              Untangle {ropeCount} Ropes in {totalTime}s
            </Text>
          </View>

          <TouchableOpacity onPress={handleHome} style={gameScreenStyles.headerButton}>
            <Home size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Game Stats */}
        <View style={gameScreenStyles.gameStats}>
          <View style={gameScreenStyles.statItem}>
            <Clock size={16} color={timeRemaining <= timePerStar ? '#FF5050' : '#FFE347'} />
            <Text style={[
              gameScreenStyles.statValue, 
              { color: timeRemaining <= timePerStar ? '#FF5050' : '#FFE347' }
            ]}>
              {timeRemaining}s
            </Text>
            <Text style={gameScreenStyles.statLabel}>Time</Text>
          </View>
          <View style={gameScreenStyles.statItem}>
            <Text style={gameScreenStyles.statLabel}>Ropes</Text>
            <Text style={gameScreenStyles.statValue}>{ropeCount}</Text>
          </View>
          <View style={gameScreenStyles.statItem}>
            <Text style={gameScreenStyles.statLabel}>Crossings</Text>
            <Text style={[gameScreenStyles.statValue, { 
              color: intersectionCount === 0 ? '#18FF92' : '#FF5050'
            }]}>
              {intersectionCount}
            </Text>
          </View>
          <View style={gameScreenStyles.statItem}>
            <Text style={gameScreenStyles.statLabel}>State</Text>
            <Text style={[gameScreenStyles.statValue, { 
              color: levelState === 'playing' ? '#18FF92' : '#FFE347',
              fontSize: 12
            }]}>
              {levelState}
            </Text>
          </View>
        </View>

        {/* Game Board */}
        <GameBoard levelData={levelData} />

        {/* Bottom Controls */}
        <View style={gameScreenStyles.bottomControls}>
          <TouchableOpacity onPress={handleReset} style={[gameScreenStyles.controlButton, gameScreenStyles.resetButton]}>
            <RotateCcw size={24} color="#FF5050" />
            <Text style={gameScreenStyles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHint} style={[gameScreenStyles.controlButton, gameScreenStyles.hintButton]}>
            <Lightbulb size={24} color="#FFE347" />
            <Text style={gameScreenStyles.controlButtonText}>Hint</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Level Complete Modal */}
      <LevelCompleteModal
        visible={showCompleteModal}
        onClose={handleCloseModal}
        onNextLevel={handleNextLevel}
        stars={modalStars}
        level={currentLevel}
        completionTime={completionTime}
      />

      {/* Level Failed Modal */}
      <LevelFailedModal
        visible={showFailedModal}
        onClose={handleCloseModal}
        onRetry={handleReset}
        level={currentLevel}
      />
    </View>
  );
}