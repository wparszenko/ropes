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

// Timer class for better instance management
class GameTimer {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private onTick: () => void;
  private onComplete: () => void;

  constructor(onTick: () => void, onComplete: () => void) {
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start() {
    if (this.isRunning) {
      this.stop(); // Stop existing timer first
    }
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.onTick();
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
    this.onTick = () => {};
    this.onComplete = () => {};
  }

  getIsRunning() {
    return this.isRunning;
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
  } = useGameStore();

  const { 
    resetLevel: resetRopeLevel, 
    ropes, 
    intersectionCount,
    cleanupLevel, // New cleanup method
    currentLevel: ropeCurrentLevel 
  } = useRopeStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [modalStars, setModalStars] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  
  // Add ref to track if modal has been shown for current level
  const modalShownForLevel = useRef<number | null>(null);
  const modalClosingRef = useRef(false);
  const gameTimerRef = useRef<GameTimer | null>(null);
  const levelStateRef = useRef(levelState);
  const levelRef = useRef(currentLevel);

  // Update refs when values change
  useEffect(() => {
    levelStateRef.current = levelState;
  }, [levelState]);

  useEffect(() => {
    levelRef.current = currentLevel;
  }, [currentLevel]);

  // Timer tick handler
  const handleTimerTick = useCallback(() => {
    // Check if level is still playing before decrementing
    if (levelStateRef.current === 'playing') {
      decrementTime();
    } else {
      // Stop timer if level state changed
      gameTimerRef.current?.stop();
    }
  }, [decrementTime]);

  // Timer complete handler (when time reaches 0)
  const handleTimerComplete = useCallback(() => {
    if (levelStateRef.current === 'playing') {
      failLevel();
    }
  }, [failLevel]);

  // Initialize timer instance
  useEffect(() => {
    // Create timer instance
    gameTimerRef.current = new GameTimer(handleTimerTick, handleTimerComplete);

    // Cleanup on unmount
    return () => {
      gameTimerRef.current?.destroy();
      gameTimerRef.current = null;
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
    
    // Reset timer to 30 seconds for new level
    setTimeRemaining(30);
  }, [currentLevel, getCurrentLevelData, setTimeRemaining]);

  // Start timer when level state becomes 'playing'
  useEffect(() => {
    const timer = gameTimerRef.current;
    if (!timer) return;

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
      setTimeout(() => {
        console.log('Auto-starting fresh level', currentLevel);
        startLevel();
      }, 500);
    }
  }, [levelState, ropes.length, currentLevel, startLevel]);

  // Handle level completion with new star system
  useEffect(() => {
    if (
      levelState === 'completed' && 
      ropes.length > 0 && 
      !completionTriggeredRef.current && 
      gameState === 'playing' &&
      !isDragging &&
      isInitialized
    ) {
      completionTriggeredRef.current = true;
      
      setTimeout(() => {
        // Calculate stars based on performance
        const baseStars = 1;
        const timeBonus = intersectionCount === 0 ? 1 : 0; // Bonus for perfect solution
        const efficiencyBonus = currentLevel <= 3 ? 1 : currentLevel <= 6 ? 2 : 3; // Progressive bonus
        
        const totalStars = Math.min(baseStars + timeBonus + efficiencyBonus, 4); // Max 4 stars
        completeLevel(totalStars);
      }, 300); // Reduced delay for better responsiveness
    }
  }, [levelState, ropes.length, currentLevel, completeLevel, intersectionCount, gameState]);

  // Handle level failure - only show when actually failed and stop timer
  useEffect(() => {
    if (
      levelState === 'failed' && 
      !showFailedModal && 
      !modalClosingRef.current &&
      modalShownForLevel.current !== currentLevel
    ) {
      // Stop timer immediately on failure
      gameTimerRef.current?.stop();

      setShowFailedModal(true);
      modalShownForLevel.current = currentLevel;
    }
  }, [levelState, showFailedModal, currentLevel]);

  // Cleanup when leaving the game screen
  useEffect(() => {
    return () => {
      console.log('Game screen unmounting, cleaning up timer and rope data');
      gameTimerRef.current?.destroy();
      cleanupLevel(); // Clean up rope data when leaving game
    };
  }, [cleanupLevel]);

  const handleBack = () => {
    // Stop and destroy timer when leaving game
    gameTimerRef.current?.stop();
    // Clean up rope data to prevent memory leaks
    cleanupLevel();
    router.back();
  };

  const handleReset = () => {
    console.log('Reset button clicked');
    
    // Stop timer during reset
    gameTimerRef.current?.stop();

    modalClosingRef.current = true;
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalShownForLevel.current = null;
    
    // Clean up current rope data before reset
    cleanupLevel();
    
    // Reset both game and rope stores to restart the current level
    resetGameLevel(); // This sets levelState to 'fresh'
    resetRopeLevel(); // This will generate fresh ropes
    
    setTimeout(() => {
      modalClosingRef.current = false;
      // The level will auto-start due to the useEffect above
    }, 200);
  };

  const handleHint = () => {
    const ropeCount = ropes.length;
    Alert.alert(
      'How to Play',
      `Drag the colored dots to move the rope endpoints. Your goal is to untangle all ${ropeCount} ropes so that none of them cross each other.\n\nStar System:\n⭐⭐⭐ Complete in 5 seconds\n⭐⭐ Complete in 10 seconds\n⭐ Complete in 20 seconds\n\nTip: Try to identify which ropes are crossing and move their endpoints to separate them.\n\nCurrent intersections: ${intersectionCount}`,
      [{ text: 'Got it!' }]
    );
  };

  const handleHome = () => {
    // Stop and destroy timer when going home
    gameTimerRef.current?.stop();
    // Clean up rope data to prevent memory leaks
    cleanupLevel();
    router.push('/');
  };

  const handleNextLevel = () => {
    modalClosingRef.current = true;
    setShowCompleteModal(false);
    modalShownForLevel.current = null;
    
    // Clean up current level data before moving to next
    cleanupLevel();
    
    setTimeout(() => {
      modalClosingRef.current = false;
    }, 200);
  };

  const handleCloseModal = () => {
    // Set closing flag to prevent re-opening
    modalClosingRef.current = true;
    
    // Close both modals immediately
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalShownForLevel.current = null;
    
    // Reset the closing flag after a delay
    setTimeout(() => {
      modalClosingRef.current = false;
    }, 500);
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
              Untangle {ropeCount} Ropes
            </Text>
          </View>

          <TouchableOpacity onPress={handleHome} style={gameScreenStyles.headerButton}>
            <Home size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Game Stats */}
        <View style={gameScreenStyles.gameStats}>
          <View style={gameScreenStyles.statItem}>
            <Clock size={16} color={timeRemaining <= 10 ? '#FF5050' : '#FFE347'} />
            <Text style={[
              gameScreenStyles.statValue, 
              { color: timeRemaining <= 10 ? '#FF5050' : '#FFE347' }
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