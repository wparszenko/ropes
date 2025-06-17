import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, RotateCcw, Chrome as Home, Lightbulb } from 'lucide-react-native';

interface FailureModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function FailureModal({
  visible,
  onClose,
  onRetry,
  onHome,
}: FailureModalProps) {
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
          {/* Failure Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <X size={32} color="#FF5050" />
            </View>
            <Text style={styles.title}>
              MISSION FAILED
            </Text>
            <Text style={styles.subtitle}>
              The ropes are still tangled! Try a different approach.
            </Text>
          </View>

          {/* Hint */}
          <View style={styles.hintContainer}>
            <View style={styles.hintHeader}>
              <Lightbulb size={20} color="#FFE347" />
              <Text style={styles.hintTitle}>
                Hint
              </Text>
            </View>
            <Text style={styles.hintText}>
              Drag the colored dots to move the rope endpoints. Make sure no ropes cross each other to complete the level.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onRetry}
              style={[styles.button, styles.retryButton]}
            >
              <RotateCcw size={24} color="#18FF92" />
              <Text style={styles.retryButtonText}>
                TRY AGAIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onHome}
              style={[styles.button, styles.homeButton]}
            >
              <Home size={20} color="#64748B" />
              <Text style={styles.homeButtonText}>
                BACK TO MENU
              </Text>
            </TouchableOpacity>
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
    borderColor: 'rgba(255, 80, 80, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 80, 80, 0.2)',
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: '#FF5050',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 16,
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 227, 71, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 227, 71, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hintTitle: {
    color: '#FFE347',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  hintText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
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
  retryButton: {
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderColor: '#18FF92',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'System',
  },
  homeButton: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderColor: '#2D3748',
  },
  homeButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});