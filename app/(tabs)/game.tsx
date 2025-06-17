import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw, Lightbulb, Chrome as Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useRopeStore } from '@/store/ropeStore';
import GameBoard from '@/components/GameBoard';
import LevelCompleteModal from '@/components/LevelCompleteModal';
import { gameScreenStyles } from '@/styles/gameScreenStyles';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const {
    currentLevel,
    gameState,
    resetLevel: resetGameLevel,
    getCurrentLevelData,
    getMaxStarsForLevel,
  } = useGameStore();

  const { resetLevel: resetRopeLevel, ropes, intersectionCount } = useRopeStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [modalStars, setModalStars] = useState(0);

  useEffect(() => {
    const data = getCurrentLevelData();
    setLevelData(data);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === 'completed' && !showCompleteModal) {
      // Calculate stars based on performance
      const maxStars = getMaxStarsForLevel(currentLevel);
      const baseStars = 1;
      
      // Performance-based star calculation
      let performanceStars = 0;
      if (intersectionCount === 0) {
        if (gameTime < 30) performanceStars = maxStars - 1; // Fast completion
        else if (gameTime < 60) performanceStars = Math.max(1, maxStars - 2); // Medium completion
        else performanceStars = Math.max(0, maxStars - 3); // Slow completion
      }
      
      const totalStars = Math.min(baseStars + performanceStars, maxStars);
      setModalStars(totalStars);
      setShowCompleteModal(true);
    }
  }, [gameState, showCompleteModal, currentLevel, getMaxStarsForLevel, intersectionCount, gameTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleBack = () => {
    router.back();
  };

  const handleReset = () => {
    resetGameLevel();
    resetRopeLevel();
    setGameTime(0);
    setShowCompleteModal(false); // Ensure modal is closed on reset
  };

  const handleHint = () => {
    const ropeCount = ropes.length;
    const maxStars = getMaxStarsForLevel(currentLevel);
    Alert.alert(
      'How to Play',
      `Drag the colored dots to move the rope endpoints. Your goal is to untangle all ${ropeCount} ropes so that none of them cross each other. When all ropes are untangled, you win!\n\nThis level can earn up to ${maxStars} stars based on your performance.\n\nTip: Try to identify which ropes are crossing and move their endpoints to separate them.\n\nCurrent intersections: ${intersectionCount}`,
      [{ text: 'Got it!' }]
    );
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleNextLevel = () => {
    setShowCompleteModal(false);
    // Modal will handle navigation internally
  };

  const handleCloseModal = () => {
    setShowCompleteModal(false);
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
  const maxStars = getMaxStarsForLevel(currentLevel);

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
              Untangle {ropeCount} Ropes • Max {maxStars} ⭐
            </Text>
          </View>

          <TouchableOpacity onPress={handleHome} style={gameScreenStyles.headerButton}>
            <Home size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Game Stats */}
        <View style={gameScreenStyles.gameStats}>
          <View style={gameScreenStyles.statItem}>
            <Text style={gameScreenStyles.statLabel}>Time</Text>
            <Text style={gameScreenStyles.statValue}>{formatTime(gameTime)}</Text>
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
      />
    </View>
  );
}