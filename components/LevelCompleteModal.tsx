import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, ArrowRight, Chrome as Home, RotateCcw } from 'lucide-react-native';
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
              <Text style={levelCompleteModalStyles.statValue}>1:23</Text>
            </View>
            <View style={levelCompleteModalStyles.statRow}>
              <Text style={levelCompleteModalStyles.statLabel}>Moves:</Text>
              <Text style={levelCompleteModalStyles.statValue}>12</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={levelCompleteModalStyles.buttonContainer}>
            <TouchableOpacity
              onPress={onNextLevel}
              style={[levelCompleteModalStyles.button, levelCompleteModalStyles.nextButton]}
            >
              <Text style={levelCompleteModalStyles.nextButtonText}>
                NEXT LEVEL
              </Text>
              <ArrowRight size={24} color="#18FF92" />
            </TouchableOpacity>

            <View style={levelCompleteModalStyles.secondaryButtons}>
              <TouchableOpacity
                onPress={onClose}
                style={[levelCompleteModalStyles.button, levelCompleteModalStyles.secondaryButton]}
              >
                <RotateCcw size={20} color="#64748B" />
                <Text style={levelCompleteModalStyles.secondaryButtonText}>
                  RETRY
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
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