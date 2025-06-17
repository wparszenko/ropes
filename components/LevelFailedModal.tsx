import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, RotateCcw, Chrome as Home, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
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

  const handleHome = () => {
    router.push('/');
    onClose();
  };

  const handleRetry = () => {
    onRetry();
    onClose();
  };

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
              You ran out of time! Try to untangle the ropes faster next time.
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