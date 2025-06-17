import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Lock, Trophy, Target, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { levelsScreenStyles } from '@/styles/levelsScreenStyles';

const { width } = Dimensions.get('window');
const LEVELS_PER_ROW = 4;
const LEVEL_SIZE = (width - 60) / LEVELS_PER_ROW;

export default function LevelsScreen() {
  const { 
    playerStats, 
    currentLevel, 
    setCurrentLevel, 
    getMaxStarsForLevel,
    isLevelUnlocked 
  } = useGameStore();
  const totalLevels = 30;

  const handleBack = () => {
    router.back();
  };

  const handleLevelSelect = (level: number) => {
    if (isLevelUnlocked(level)) {
      setCurrentLevel(level);
      router.push('/game');
    }
  };

  const renderLevel = (level: number) => {
    const isUnlocked = isLevelUnlocked(level);
    const isCompleted = level <= playerStats.completedLevels;
    const isCurrent = level === currentLevel;
    const stars = playerStats.levelStars[level] || 0;
    const maxStars = getMaxStarsForLevel(level);

    return (
      <TouchableOpacity
        key={level}
        onPress={() => handleLevelSelect(level)}
        disabled={!isUnlocked}
        style={[
          levelsScreenStyles.levelButton,
          {
            width: LEVEL_SIZE - 8,
            height: LEVEL_SIZE - 8,
          },
          isUnlocked
            ? isCurrent
              ? levelsScreenStyles.currentLevel
              : isCompleted
              ? levelsScreenStyles.completedLevel
              : levelsScreenStyles.unlockedLevel
            : levelsScreenStyles.lockedLevel,
        ]}
      >
        {!isUnlocked ? (
          <Lock size={24} color="#64748B" />
        ) : (
          <>
            <Text
              style={[
                levelsScreenStyles.levelNumber,
                {
                  color: isCurrent
                    ? '#FFE347'
                    : isCompleted
                    ? '#18FF92'
                    : '#00E0FF',
                },
              ]}
            >
              {level}
            </Text>
            {isCompleted && stars > 0 && (
              <View style={levelsScreenStyles.starsContainer}>
                {Array.from({ length: maxStars }, (_, index) => (
                  <Star
                    key={index}
                    size={8}
                    color={index < stars ? '#FFE347' : '#64748B'}
                    fill={index < stars ? '#FFE347' : 'transparent'}
                  />
                ))}
              </View>
            )}
            {isCurrent && (
              <View style={levelsScreenStyles.currentIndicator}>
                <View style={levelsScreenStyles.currentDot} />
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

    const unlockedLevelsInWorld = Math.max(0, Math.min(playerStats.highestUnlockedLevel - startLevel + 1, endLevel - startLevel + 1));
    const worldPercentage = Math.round((unlockedLevelsInWorld / (endLevel - startLevel + 1)) * 100);

    return (
      <View key={worldNumber} style={levelsScreenStyles.worldContainer}>
        <View style={levelsScreenStyles.worldHeader}>
          <Text style={levelsScreenStyles.worldTitle}>WORLD {worldNumber}</Text>
          <View style={levelsScreenStyles.worldProgress}>
            <Text style={levelsScreenStyles.worldProgressText}>{worldPercentage}%</Text>
          </View>
        </View>
        <View style={levelsScreenStyles.levelsGrid}>{levels}</View>
      </View>
    );
  };

  return (
    <View style={levelsScreenStyles.container}>
      <LinearGradient colors={['#0F1117', '#1A1D29']} style={levelsScreenStyles.gradient}>
        {/* Header */}
        <View style={levelsScreenStyles.header}>
          <TouchableOpacity onPress={handleBack} style={levelsScreenStyles.backButton}>
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={levelsScreenStyles.headerTitle}>LEVEL SELECT</Text>
          <View style={levelsScreenStyles.headerSpacer} />
        </View>

        {/* Progress Stats */}
        <View style={levelsScreenStyles.progressCard}>
          <View style={levelsScreenStyles.progressStats}>
            <View style={levelsScreenStyles.progressStat}>
              <Trophy size={20} color="#18FF92" />
              <Text style={levelsScreenStyles.progressStatValue}>{playerStats.completedLevels}</Text>
              <Text style={levelsScreenStyles.progressStatLabel}>Completed</Text>
            </View>
            <View style={levelsScreenStyles.progressStat}>
              <Star size={20} color="#FFE347" />
              <Text style={levelsScreenStyles.progressStatValue}>{playerStats.totalStars}</Text>
              <Text style={levelsScreenStyles.progressStatLabel}>Stars</Text>
            </View>
            <View style={levelsScreenStyles.progressStat}>
              <Target size={20} color="#00E0FF" />
              <Text style={levelsScreenStyles.progressStatValue}>
                {Math.round((playerStats.completedLevels / totalLevels) * 100)}%
              </Text>
              <Text style={levelsScreenStyles.progressStatLabel}>Progress</Text>
            </View>
          </View>
        </View>

        {/* Levels Grid */}
        <ScrollView style={levelsScreenStyles.scrollView} showsVerticalScrollIndicator={false}>
          {renderWorld(1, 1, 10)}
          {renderWorld(2, 11, 20)}
          {renderWorld(3, 21, 30)}
          
          {/* Coming Soon */}
          <View style={levelsScreenStyles.comingSoonContainer}>
            <Clock size={32} color="#64748B" />
            <Text style={levelsScreenStyles.comingSoonTitle}>More Worlds Coming Soon!</Text>
            <Text style={levelsScreenStyles.comingSoonText}>
              Complete all levels to unlock new challenges
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}