import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw, Lightbulb, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import Robot from '@/components/Robot';
import LevelCompleteModal from '@/components/LevelCompleteModal';
import FailureModal from '@/components/FailureModal';

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

  const handleBack = () => {
    router.back();
  };

  const handleReset = () => {
    resetLevel();
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

  const handleNextLevel = () => {
    setShowCompleteModal(false);
    // Logic to advance to next level would go here
  };

  const handleRetry = () => {
    setShowFailureModal(false);
    resetLevel();
  };

  if (!levelData) {
    return (
      <View className="flex-1 bg-dark-bg justify-center items-center">
        <Text className="text-white text-lg">Loading level...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-bg">
      <LinearGradient
        colors={['#0F1117', '#1A1D29']}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="pt-12 pb-4 px-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="bg-dark-surface/80 rounded-full p-3"
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white text-lg font-bold font-orbitron">
              LEVEL {currentLevel}
            </Text>
            <Text className="text-gray-400 text-sm">
              {levelData.goals.connectAll ? 'Connect All' : 'Survive'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleHome}
            className="bg-dark-surface/80 rounded-full p-3"
          >
            <Home size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Game Board */}
        <View className="flex-1 relative">
          <GameBoard levelData={levelData} />
          <Robot />
        </View>

        {/* Bottom Controls */}
        <View className="pb-8 px-4 flex-row justify-center space-x-4">
          <TouchableOpacity
            onPress={handleReset}
            className="bg-neon-red/20 border border-neon-red rounded-full p-4"
          >
            <RotateCcw size={24} color="#FF5050" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHint}
            className="bg-neon-yellow/20 border border-neon-yellow rounded-full p-4"
          >
            <Lightbulb size={24} color="#FFE347" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modals */}
      <LevelCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onNextLevel={handleNextLevel}
        stars={3} // This would be calculated based on performance
        level={currentLevel}
      />

      <FailureModal
        visible={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        onRetry={handleRetry}
        onHome={handleHome}
      />
    </View>
  );
}