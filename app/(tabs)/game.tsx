import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw, Lightbulb, Chrome as Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import LevelCompleteModal from '@/components/LevelCompleteModal';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const {
    currentLevel,
    gameState,
    resetLevel,
    getCurrentLevelData,
  } = useGameStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const data = getCurrentLevelData();
    setLevelData(data);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === 'completed') {
      setShowCompleteModal(true);
    }
  }, [gameState]);

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
    resetLevel();
    setGameTime(0);
    setMoves(0);
  };

  const handleHint = () => {
    const ropeCount = Math.min(currentLevel + 1, 10);
    Alert.alert(
      'How to Play',
      `Drag the colored dots to move the rope endpoints. Your goal is to untangle all ${ropeCount} ropes so that none of them cross each other. When all ropes are untangled, you win!\n\nTip: Try to identify which ropes are crossing and move their endpoints to separate them.`,
      [{ text: 'Got it!' }]
    );
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleNextLevel = () => {
    setShowCompleteModal(false);
    // Move to next level
    router.push('/levels');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!levelData) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0F1117', '#1A1D29']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Level {currentLevel}...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const ropeCount = Math.min(currentLevel + 1, 10);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1117', '#1A1D29']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.levelTitle}>LEVEL {currentLevel}</Text>
            <Text style={styles.levelSubtitle}>
              Untangle {ropeCount} Ropes
            </Text>
          </View>

          <TouchableOpacity onPress={handleHome} style={styles.headerButton}>
            <Home size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Game Stats */}
        <View style={styles.gameStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{formatTime(gameTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ropes</Text>
            <Text style={styles.statValue}>{ropeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={[styles.statValue, { 
              color: levelData.difficulty === 'easy' ? '#18FF92' : 
                     levelData.difficulty === 'medium' ? '#FFE347' : '#FF5050' 
            }]}>
              {levelData.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Game Board */}
        <GameBoard levelData={levelData} />

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={handleReset} style={[styles.controlButton, styles.resetButton]}>
            <RotateCcw size={24} color="#FF5050" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHint} style={[styles.controlButton, styles.hintButton]}>
            <Lightbulb size={24} color="#FFE347" />
            <Text style={styles.controlButtonText}>Hint</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Level Complete Modal */}
      <LevelCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onNextLevel={handleNextLevel}
        stars={3}
        level={currentLevel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  levelSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(26, 29, 41, 0.5)',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  controlButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
    borderWidth: 2,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 80, 80, 0.1)',
    borderColor: '#FF5050',
  },
  hintButton: {
    backgroundColor: 'rgba(255, 227, 71, 0.1)',
    borderColor: '#FFE347',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
  },
});