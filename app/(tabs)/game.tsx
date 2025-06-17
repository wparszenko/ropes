import React, { useEffect, useState, useRef } from 'react';
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

export default function GameScreen() {
  const {
    currentLevel,
    gameState,
    timeRemaining,
    resetLevel: resetGameLevel,
    getCurrentLevelData,
    getMaxStarsForLevel,
    setTimeRemaining,
    decrementTime,
    completeLevel,
  } = useGameStore();

  const { resetLevel: resetRopeLevel, ropes, intersectionCount } = useRopeStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [modalStars, setModalStars] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  
  // Add ref to track if modal has been shown for current level
  const modalShownForLevel = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  const modalClosingRef = useRef(false);

  // Update gameState ref when it changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const data = getCurrentLevelData();
    setLevelData(data);
  }, [currentLevel]);

  // Enhanced timer effect - starts/stops based on game state
  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start timer if game is actively playing
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        // Check current game state before decrementing
        const currentGameState = gameStateRef.current;
        
        // Only decrement if still playing
        if (currentGameState === 'playing') {
          decrementTime();
        } else {
          // Stop timer if game state changed
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, 1000);
    }

    // Cleanup timer when game state changes or component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, decrementTime]);

  // Handle level completion with new star system
  useEffect(() => {
    if (
      gameState === 'completed' && 
      !showCompleteModal && 
      !modalClosingRef.current &&
      modalShownForLevel.current !== currentLevel
    ) {
      // Stop timer immediately on completion
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const timeElapsed = 30 - timeRemaining;
      setCompletionTime(timeElapsed);
      
      // New star system based on completion time
      let earnedStars = 0;
      if (timeElapsed <= 5) {
        earnedStars = 3; // 3 stars for completion in 5 seconds or less
      } else if (timeElapsed <= 10) {
        earnedStars = 2; // 2 stars for completion in 10 seconds or less
      } else if (timeElapsed <= 20) {
        earnedStars = 1; // 1 star for completion in 20 seconds or less
      } else {
        earnedStars = 0; // No stars for completion over 20 seconds
      }
      
      setModalStars(earnedStars);
      
      // Complete level with calculated stars
      completeLevel(earnedStars);
      
      // Show modal immediately
      setShowCompleteModal(true);
      modalShownForLevel.current = currentLevel;
    }
  }, [gameState, showCompleteModal, currentLevel, timeRemaining, completeLevel]);

  // Handle level failure - only show when actually playing and stop timer
  useEffect(() => {
    if (
      gameState === 'failed' && 
      !showFailedModal && 
      !modalClosingRef.current &&
      modalShownForLevel.current !== currentLevel
    ) {
      // Stop timer immediately on failure
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setShowFailedModal(true);
      modalShownForLevel.current = currentLevel;
    }
  }, [gameState, showFailedModal, currentLevel]);

  // Reset modal tracking when level changes
  useEffect(() => {
    modalShownForLevel.current = null;
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalClosingRef.current = false;
    setTimeRemaining(30); // Reset timer for new level
    
    // Clear any existing timer when level changes
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [currentLevel, setTimeRemaining]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleBack = () => {
    // Stop timer when leaving game
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    router.back();
  };

  const handleReset = () => {
    // Stop timer during reset
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    modalClosingRef.current = true;
    setShowCompleteModal(false);
    setShowFailedModal(false);
    modalShownForLevel.current = null;
    
    // Reset both game and rope stores to restart the current level
    resetGameLevel();
    resetRopeLevel();
    
    setTimeout(() => {
      modalClosingRef.current = false;
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
    // Stop timer when going home
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    router.push('/');
  };

  const handleNextLevel = () => {
    modalClosingRef.current = true;
    setShowCompleteModal(false);
    modalShownForLevel.current = null;
    
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