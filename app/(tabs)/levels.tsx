import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Lock, Trophy, Target, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

const { width } = Dimensions.get('window');
const LEVELS_PER_ROW = 4;
const LEVEL_SIZE = (width - 60) / LEVELS_PER_ROW;

export default function LevelsScreen() {
  const { playerStats, currentLevel, setCurrentLevel } = useGameStore();
  const totalLevels = 30;

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
    const isCurrent = level === currentLevel;
    const stars = playerStats.levelStars[level] || 0;

    return (
      <TouchableOpacity
        key={level}
        onPress={() => handleLevelSelect(level)}
        disabled={!isUnlocked}
        style={[
          styles.levelButton,
          {
            width: LEVEL_SIZE - 8,
            height: LEVEL_SIZE - 8,
          },
          isUnlocked
            ? isCurrent
              ? styles.currentLevel
              : isCompleted
              ? styles.completedLevel
              : styles.unlockedLevel
            : styles.lockedLevel,
        ]}
      >
        {!isUnlocked ? (
          <Lock size={24} color="#64748B" />
        ) : (
          <>
            <Text
              style={[
                styles.levelNumber,
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
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    color={star <= stars ? '#FFE347' : '#64748B'}
                    fill={star <= stars ? '#FFE347' : 'transparent'}
                  />
                ))}
              </View>
            )}
            {isCurrent && (
              <View style={styles.currentIndicator}>
                <View style={styles.currentDot} />
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

    const worldProgress = Math.min(currentLevel - startLevel + 1, endLevel - startLevel + 1);
    const worldPercentage = Math.max(0, Math.round((worldProgress / (endLevel - startLevel + 1)) * 100));

    return (
      <View key={worldNumber} style={styles.worldContainer}>
        <View style={styles.worldHeader}>
          <Text style={styles.worldTitle}>WORLD {worldNumber}</Text>
          <View style={styles.worldProgress}>
            <Text style={styles.worldProgressText}>{worldPercentage}%</Text>
          </View>
        </View>
        <View style={styles.levelsGrid}>{levels}</View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1117', '#1A1D29']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LEVEL SELECT</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Stats */}
        <View style={styles.progressCard}>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Trophy size={20} color="#18FF92" />
              <Text style={styles.progressStatValue}>{playerStats.completedLevels}</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Star size={20} color="#FFE347" />
              <Text style={styles.progressStatValue}>{playerStats.totalStars}</Text>
              <Text style={styles.progressStatLabel}>Stars</Text>
            </View>
            <View style={styles.progressStat}>
              <Target size={20} color="#00E0FF" />
              <Text style={styles.progressStatValue}>
                {Math.round((playerStats.completedLevels / totalLevels) * 100)}%
              </Text>
              <Text style={styles.progressStatLabel}>Progress</Text>
            </View>
          </View>
        </View>

        {/* Levels Grid */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderWorld(1, 1, 10)}
          {renderWorld(2, 11, 20)}
          {renderWorld(3, 21, 30)}
          
          {/* Coming Soon */}
          <View style={styles.comingSoonContainer}>
            <Clock size={32} color="#64748B" />
            <Text style={styles.comingSoonTitle}>More Worlds Coming Soon!</Text>
            <Text style={styles.comingSoonText}>
              Complete all levels to unlock new challenges
            </Text>
          </View>
        </ScrollView>
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
  },
  headerSpacer: {
    width: 48,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  worldContainer: {
    marginBottom: 32,
  },
  worldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  worldTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  worldProgress: {
    backgroundColor: 'rgba(24, 255, 146, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#18FF92',
  },
  worldProgressText: {
    fontSize: 12,
    color: '#18FF92',
    fontWeight: '600',
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  levelButton: {
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  currentLevel: {
    backgroundColor: 'rgba(255, 227, 71, 0.2)',
    borderColor: '#FFE347',
  },
  completedLevel: {
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderColor: '#18FF92',
  },
  unlockedLevel: {
    backgroundColor: 'rgba(0, 224, 255, 0.2)',
    borderColor: '#00E0FF',
  },
  lockedLevel: {
    backgroundColor: 'rgba(26, 29, 41, 0.5)',
    borderColor: '#2D3748',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  currentIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE347',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    fontFamily: 'System',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});