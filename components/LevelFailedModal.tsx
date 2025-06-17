import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, RotateCcw, Chrome as Home, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useRopeStore } from '@/store/ropeStore';
import { levelFailedModalStyles } from '@/styles/levelFailedModalStyles';

interface LevelFailedModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  level: number;
}

export default function LevelFailedModal({
  visible,
  onClose,
  onRetry,
  level,
}: LevelFailedModalProps) {
  const { resetLevel, getLevelTimer } = useGameStore();
  const { cleanupLevel, resetLevel: resetRopeLevel } = useRopeStore();

  const handleHome = () => {
    // Immediately close modal and navigate
    onClose();
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    console.log('Retry button clicked from failed modal - restarting level with fresh ropes');
    
    onClose(); // Close modal first
    
    // Clean up current rope data completely
    cleanupLevel();
    
    // Reset the current level to restart from beginning
    resetLevel(); // This sets levelState to 'fresh'
    
    // Small delay to ensure cleanup is complete, then reset ropes
    setTimeout(() => {
      console.log('Generating fresh ropes for retry of level', level);
      resetRopeLevel(); // This will generate completely new ropes
    }, 200);
  };

  const totalTime = getLevelTimer(level);
  const timePerStar = Math.floor(totalTime / 3);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={levelFailedModalStyles.overlay}>
        <LinearGradient
          colors={['#1A1D29', '#0F1117']}
          style={levelFailedModalStyles.modal}
        >
          {/* Failure Header */}
          <View style={levelFailedModalStyles.header}>
            <AlertTriangle size={48} color="#FF5050" />
            <Text style={levelFailedModalStyles.title}>
              TIME'S UP!
            </Text>
            <Text style={levelFailedModalStyles.subtitle}>
              Level {level} Failed
            </Text>
          </View>

          {/* Message */}
          <View style={levelFailedModalStyles.messageContainer}>
            <Clock size={24} color="#FFE347" />
            <Text style={levelFailedModalStyles.messageText}>
              You ran out of time! You had {totalTime} seconds to complete this level.
              {'\n\n'}⭐⭐⭐ Complete in {timePerStar} seconds{'\n'}⭐⭐ Complete in {timePerStar * 2} seconds{'\n'}⭐ Complete in {timePerStar * 3} seconds
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={levelFailedModalStyles.buttonContainer}>
            <TouchableOpacity
              onPress={handleRetry}
              style={[levelFailedModalStyles.button, levelFailedModalStyles.retryButton]}
            >
              <RotateCcw size={24} color="#18FF92" />
              <Text style={levelFailedModalStyles.retryButtonText}>
                TRY AGAIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleHome}
              style={[levelFailedModalStyles.button, levelFailedModalStyles.homeButton]}
            >
              <Home size={20} color="#64748B" />
              <Text style={levelFailedModalStyles.homeButtonText}>
                HOME
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}