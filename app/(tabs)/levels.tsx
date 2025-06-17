import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

const { width } = Dimensions.get('window');
const LEVELS_PER_ROW = 4;
const LEVEL_SIZE = (width - 60) / LEVELS_PER_ROW;

export default function LevelsScreen() {
  const { playerStats, currentLevel, setCurrentLevel } = useGameStore();
  const totalLevels = 30; // Total number of levels

  const handleBack = () => {
    router.back();
  };

  const handleLevelSelect = (level: number) => {
    if (level <= currentLevel) {
      setCurrentLevel(level);
      router.push('/game');
    }
  };

  const renderLevel = (level: number) => {
    const isUnlocked = level <= currentLevel;
    const isCompleted = level < currentLevel;
    const stars = playerStats.levelStars[level] || 0;

    return (
      <TouchableOpacity
        key={level}
        onPress={() => handleLevelSelect(level)}
        disabled={!isUnlocked}
        className={`m-1 rounded-2xl items-center justify-center ${
          isUnlocked
            ? isCompleted
              ? 'bg-neon-green/20 border-2 border-neon-green'
              : 'bg-neon-blue/20 border-2 border-neon-blue'
            : 'bg-dark-surface/50 border-2 border-dark-border'
        }`}
        style={{
          width: LEVEL_SIZE - 8,
          height: LEVEL_SIZE - 8,
        }}
      >
        {!isUnlocked ? (
          <Lock size={24} color="#64748B" />
        ) : (
          <>
            <Text
              className={`text-lg font-bold font-orbitron ${
                isCompleted ? 'text-neon-green' : 'text-neon-blue'
              }`}
            >
              {level}
            </Text>
            {isCompleted && stars > 0 && (
              <View className="flex-row mt-1">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    color={star <= stars ? '#FFE347' : '#64748B'}
                    fill={star <= stars ? '#FFE347' : 'transparent'}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderWorld = (worldNumber: number, startLevel: number, endLevel: number) => {
    const levels = [];
    for (let i = startLevel; i <= endLevel; i++) {
      levels.push(renderLevel(i));
    }

    return (
      <View key={worldNumber} className="mb-8">
        <Text className="text-white text-xl font-bold mb-4 px-4 font-orbitron">
          WORLD {worldNumber}
        </Text>
        <View className="flex-row flex-wrap px-4">
          {levels}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-dark-bg">
      <LinearGradient
        colors={['#0F1117', '#1A1D29']}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="pt-12 pb-4 px-4 flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="bg-dark-surface/80 rounded-full p-3 mr-4"
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold font-orbitron">
            LEVEL SELECT
          </Text>
        </View>

        {/* Progress Stats */}
        <View className="mx-4 mb-6 bg-dark-surface/80 rounded-2xl p-4 border border-dark-border">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-neon-green text-xl font-bold">
                {playerStats.completedLevels}
              </Text>
              <Text className="text-gray-400 text-sm">Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-neon-yellow text-xl font-bold">
                {playerStats.totalStars}
              </Text>
              <Text className="text-gray-400 text-sm">Stars</Text>
            </View>
            <View className="items-center">
              <Text className="text-neon-blue text-xl font-bold">
                {Math.round((playerStats.completedLevels / totalLevels) * 100)}%
              </Text>
              <Text className="text-gray-400 text-sm">Progress</Text>
            </View>
          </View>
        </View>

        {/* Levels Grid */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderWorld(1, 1, 10)}
          {renderWorld(2, 11, 20)}
          {renderWorld(3, 21, 30)}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}