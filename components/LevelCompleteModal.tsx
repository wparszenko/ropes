import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, ArrowRight, Chrome as Home, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { levelCompleteModalStyles } from '@/styles/levelCompleteModalStyles';

interface LevelCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  stars: number;
  level: number;
}

export default function LevelCompleteModal({
  visible,
  onClose,
  onNextLevel,
  stars,
  level,
}: LevelCompleteModalProps) {
  const { getMaxStarsForLevel, setCurrentLevel, isLevelUnlocked } = useGameStore();
  const maxStars = getMaxStarsForLevel(level);
  const nextLevel = level + 1;
  const hasNextLevel = isLevelUnlocked(nextLevel);

  const handleNextLevel = () => {
    if (hasNextLevel) {
      setCurrentLevel(nextLevel);
      onClose();
      // Stay in game screen, don't navigate to levels
    } else {
      // If no next level available, go to levels screen
      router.push('/levels');
      onClose();
    }
  };

  const handleHome = () => {
    router.push('/');
    onClose();
  };

  const handleRetry = () => {
    onClose();
    // This will trigger a level reset in the parent component
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={levelCompleteModalStyles.overlay}>
        <LinearGradient
          colors={['#1A1D29', '#0F1117']}
          style={levelCompleteModalStyles.modal}
        >
          {/* Success Header */}
          <View style={levelCompleteModalStyles.header}>
            <Text style={levelCompleteModalStyles.title}>
              ROPES UNTANGLED!
            </Text>
            <Text style={levelCompleteModalStyles.subtitle}>
              Level {level} Complete
            </Text>
          </View>

          {/* Stars */}
          <View style={levelCompleteModalStyles.starsContainer}>
            {Array.from({ length: maxStars }, (_, index) => (
              <Star
                key={index}
                size={40}
                color={index < stars ? '#FFE347' : '#64748B'}
                fill={index < stars ? '#FFE347' : 'transparent'}
              />
            ))}
          </View>

          {/* Performance Stats */}
          <View style={levelCompleteModalStyles.statsContainer}>
            <Text style={levelCompleteModalStyles.statsTitle}>
              Performance
            </Text>
            <View style={levelCompleteModalStyles.statRow}>
              <Text style={levelCompleteModalStyles.statLabel}>Stars Earned:</Text>
              <Text style={levelCompleteModalStyles.statValue}>{stars}/{maxStars}</Text>
            </View>
            <View style={levelCompleteModalStyles.statRow}>
              <Text style={levelCompleteModalStyles.statLabel}>Difficulty:</Text>
              <Text style={levelCompleteModalStyles.statValue}>
                {level <= 5 ? 'Easy' : level <= 15 ? 'Medium' : 'Hard'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={levelCompleteModalStyles.buttonContainer}>
            {hasNextLevel ? (
              <TouchableOpacity
                onPress={handleNextLevel}
                style={[levelCompleteModalStyles.button, levelCompleteModalStyles.nextButton]}
              >
                <Text style={levelCompleteModalStyles.nextButtonText}>
                  NEXT LEVEL
                </Text>
                <ArrowRight size={24} color="#18FF92" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/levels')}
                style={[levelCompleteModalStyles.button, levelCompleteModalStyles.nextButton]}
              >
                <Text style={levelCompleteModalStyles.nextButtonText}>
                  VIEW LEVELS
                </Text>
                <ArrowRight size={24} color="#18FF92" />
              </TouchableOpacity>
            )}

            <View style={levelCompleteModalStyles.secondaryButtons}>
              <TouchableOpacity
                onPress={handleRetry}
                style={[levelCompleteModalStyles.button, levelCompleteModalStyles.secondaryButton]}
              >
                <RotateCcw size={20} color="#64748B" />
                <Text style={levelCompleteModalStyles.secondaryButtonText}>
                  RETRY
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleHome}
                style={[levelCompleteModalStyles.button, levelCompleteModalStyles.secondaryButton]}
              >
                <Home size={20} color="#64748B" />
                <Text style={levelCompleteModalStyles.secondaryButtonText}>
                  HOME
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}