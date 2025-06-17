import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, ArrowRight, Chrome as Home, RotateCcw } from 'lucide-react-native';

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
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1A1D29', '#0F1117']}
          style={styles.modal}
        >
          {/* Success Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              ROPES UNTANGLED!
            </Text>
            <Text style={styles.subtitle}>
              Level {level} Complete
            </Text>
          </View>

          {/* Stars */}
          <View style={styles.starsContainer}>
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
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>
              Performance
            </Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Time:</Text>
              <Text style={styles.statValue}>1:23</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Moves:</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onNextLevel}
              style={[styles.button, styles.nextButton]}
            >
              <Text style={styles.nextButtonText}>
                NEXT LEVEL
              </Text>
              <ArrowRight size={24} color="#18FF92" />
            </TouchableOpacity>

            <View style={styles.secondaryButtons}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.secondaryButton]}
              >
                <RotateCcw size={20} color="#64748B" />
                <Text style={styles.secondaryButtonText}>
                  RETRY
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.secondaryButton]}
              >
                <Home size={20} color="#64748B" />
                <Text style={styles.secondaryButtonText}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: '#1A1D29',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#18FF92',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  statsContainer: {
    backgroundColor: 'rgba(15, 17, 23, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statsTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statValue: {
    color: '#00E0FF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  nextButton: {
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderColor: '#18FF92',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    fontFamily: 'System',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderColor: '#2D3748',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});