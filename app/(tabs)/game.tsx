import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw, Lightbulb, Chrome as Home, Play, Pause, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const {
    currentLevel,
    gameState,
    resetLevel,
    completeLevel,
    failLevel,
    getCurrentLevelData,
  } = useGameStore();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const data = getCurrentLevelData();
    setLevelData(data);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === 'completed') {
      setShowCompleteModal(true);
    } else if (gameState === 'failed') {
      setShowFailureModal(true);
    }
  }, [gameState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && gameState === 'playing') {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, gameState]);

  const handleBack = () => {
    router.back();
  };

  const handleReset = () => {
    resetLevel();
    setGameTime(0);
    setMoves(0);
  };

  const handleHint = () => {
    Alert.alert(
      'Hint',
      'Try connecting wires of the same color to their matching sockets. Avoid obstacles and make sure wires don\'t cross!',
      [{ text: 'Got it!' }]
    );
  };

  const handleHome = () => {
    router.push('/');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
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
            <Zap size={48} color="#18FF92" />
            <Text style={styles.loadingText}>Loading Level {currentLevel}...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
              {levelData.goals.connectAll ? 'Connect All Circuits' : 'Survive'}
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
            <Text style={styles.statLabel}>Moves</Text>
            <Text style={styles.statValue}>{moves}</Text>
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

        {/* Game Board Placeholder */}
        <View style={styles.gameBoard}>
          <LinearGradient
            colors={['rgba(24, 255, 146, 0.1)', 'rgba(0, 224, 255, 0.1)']}
            style={styles.gameBoardGradient}
          >
            <View style={styles.gameBoardContent}>
              <Zap size={64} color="#18FF92" />
              <Text style={styles.gameBoardTitle}>Game Board</Text>
              <Text style={styles.gameBoardText}>
                Interactive puzzle game would be rendered here
              </Text>
              <Text style={styles.gameBoardSubtext}>
                Wires: {levelData.wires.length} • Obstacles: {levelData.obstacles.length}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={handleReset} style={[styles.controlButton, styles.resetButton]}>
            <RotateCcw size={24} color="#FF5050" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePause} style={[styles.controlButton, styles.pauseButton]}>
            {isPaused ? <Play size={24} color="#18FF92" /> : <Pause size={24} color="#18FF92" />}
            <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHint} style={[styles.controlButton, styles.hintButton]}>
            <Lightbulb size={24} color="#FFE347" />
            <Text style={styles.controlButtonText}>Hint</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
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
    marginBottom: 16,
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
  gameBoard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameBoardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
    borderRadius: 16,
  },
  gameBoardContent: {
    alignItems: 'center',
  },
  gameBoardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    fontFamily: 'System',
  },
  gameBoardText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  gameBoardSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  controlButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
    borderWidth: 2,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 80, 80, 0.1)',
    borderColor: '#FF5050',
  },
  pauseButton: {
    backgroundColor: 'rgba(24, 255, 146, 0.1)',
    borderColor: '#18FF92',
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