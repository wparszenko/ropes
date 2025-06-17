import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Settings, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { playerStats, currentLevel } = useGameStore();

  const handlePlayGame = () => {
    router.push('/game');
  };

  const handleViewLevels = () => {
    router.push('/levels');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <View className="flex-1 bg-dark-bg">
      <LinearGradient
        colors={['#0F1117', '#1A1D29', '#0F1117']}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="pt-16 pb-8 px-6">
          <View className="flex-row items-center justify-center mb-4">
            <Zap size={32} color="#18FF92" />
            <Text className="text-4xl font-bold text-white ml-2 font-orbitron">
              TANGLE
            </Text>
          </View>
          <Text className="text-2xl font-bold text-neon-green text-center font-orbitron">
            ESCAPE
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Connect the circuits, escape the maze
          </Text>
        </View>

        {/* Stats Card */}
        <View className="mx-6 mb-8 bg-dark-surface/80 rounded-2xl p-6 border border-dark-border">
          <Text className="text-white text-lg font-bold mb-4 font-orbitron">
            Progress
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-neon-green text-2xl font-bold">
                {currentLevel}
              </Text>
              <Text className="text-gray-400 text-sm">Level</Text>
            </View>
            <View className="items-center">
              <Text className="text-neon-blue text-2xl font-bold">
                {playerStats.totalStars}
              </Text>
              <Text className="text-gray-400 text-sm">Stars</Text>
            </View>
            <View className="items-center">
              <Text className="text-neon-purple text-2xl font-bold">
                {playerStats.completedLevels}
              </Text>
              <Text className="text-gray-400 text-sm">Completed</Text>
            </View>
          </View>
        </View>

        {/* Main Menu Buttons */}
        <View className="flex-1 justify-center px-6 space-y-4">
          <TouchableOpacity
            onPress={handlePlayGame}
            className="bg-neon-green/20 border-2 border-neon-green rounded-2xl p-6 items-center"
            style={{
              shadowColor: '#18FF92',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Play size={32} color="#18FF92" />
            <Text className="text-white text-xl font-bold mt-2 font-orbitron">
              CONTINUE GAME
            </Text>
            <Text className="text-gray-400 text-sm">
              Level {currentLevel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewLevels}
            className="bg-neon-blue/20 border-2 border-neon-blue rounded-2xl p-4 flex-row items-center justify-center"
          >
            <Trophy size={24} color="#00E0FF" />
            <Text className="text-white text-lg font-bold ml-3 font-orbitron">
              LEVEL SELECT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSettings}
            className="bg-dark-surface/80 border-2 border-dark-border rounded-2xl p-4 flex-row items-center justify-center"
          >
            <Settings size={24} color="#64748B" />
            <Text className="text-gray-300 text-lg font-bold ml-3 font-orbitron">
              SETTINGS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="pb-8 px-6">
          <Text className="text-gray-500 text-center text-sm">
            v1.0.0 • Made with ⚡ by Tangle Team
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}