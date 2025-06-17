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
  completionTime?: number;
}

export default function LevelCompleteModal({
  visible,
  onClose,
  onNextLevel,
  stars,
  level,
  completionTime = 0,
}: LevelCompleteModalProps) {
  const { setCurrentLevel, isLevelUnlocked, resetLevel } = useGameStore();
  const nextLevel = level + 1;
  const hasNextLevel = isLevelUnlocked(nextLevel);

  const handleNextLevel = () => {
    onClose(); // Close modal first
    if (hasNextLevel) {
      setCurrentLevel(nextLevel);
      // Stay in game screen, don't navigate to levels
    } else {
      // If no next level available, go to levels screen
      router.push('/levels');
    }
  };

  const handleHome = () => {
    // Immediately close modal and navigate
    onClose();
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    onClose(); // Close modal first
    // Reset the current level to restart from beginning
    resetLevel();
  };

  const handleViewLevels = () => {
    onClose(); // Close modal first
    router.push('/levels');
  };

  const getStarMessage = (stars: number, time: number) => {
    if (stars === 3) return `Amazing! Completed in ${time}s`;
    if (stars === 2) return `Great! Completed in ${time}s`;
    if (stars === 1) return `Good! Completed in ${time}s`;
    return `Completed in ${time}s - Try faster for stars!`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={40}
                color={star <= stars ? '#FFE347' : '#64748B'}
                fill={star <= stars ? '#FFE347' : 'transparent'}
              />
            ))}
          </View>

          {/* Performance Stats */}
          <View style={levelCompleteModalStyles.statsContainer}>
            <Text style={levelCompleteModalStyles.statsTitle}>
              Performance
            </Text>
            <View style={levelCompleteModalStyles.statRow}>
              <Text style={levelCompleteModalStyles.statLabel}>Time:</Text>
              <Text style={levelCompleteModalStyles.statValue}>{completionTime}s</Text>
            </View>
            <View style={levelCompleteModalStyles.statRow}>
              <Text style={levelCompleteModalStyles.statLabel}>Stars:</Text>
              <Text style={levelCompleteModalStyles.statValue}>{stars}/3</Text>
            </View>
            <Text style={levelCompleteModalStyles.performanceMessage}>
              {getStarMessage(stars, completionTime)}
            </Text>
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
                onPress={handleViewLevels}
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