import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <LinearGradient
          colors={['#1A1D29', '#0F1117']}
          className="bg-dark-surface rounded-3xl p-8 w-full max-w-sm border-2 border-neon-red/30"
        >
          {/* Failure Header */}
          <View className="items-center mb-6">
            <View className="bg-neon-red/20 rounded-full p-4 mb-4">
              <X size={32} color="#FF5050" />
            </View>
            <Text className="text-neon-red text-2xl font-bold font-orbitron mb-2">
              MISSION FAILED
            </Text>
            <Text className="text-gray-400 text-center">
              The wires got tangled! Try a different approach.
            </Text>
          </View>

          {/* Hint */}
          <View className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Lightbulb size={20} color="#FFE347" />
              <Text className="text-neon-yellow font-bold ml-2">
                Hint
              </Text>
            </View>
            <Text className="text-gray-300 text-sm">
              Make sure wires don't cross each other and avoid the obstacles. 
              Connect each wire to its matching colored socket.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={onRetry}
              className="bg-neon-green/20 border-2 border-neon-green rounded-2xl p-4 flex-row items-center justify-center"
            >
              <RotateCcw size={24} color="#18FF92" />
              <Text className="text-white text-lg font-bold ml-2 font-orbitron">
                TRY AGAIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onHome}
              className="bg-dark-surface/80 border border-dark-border rounded-2xl p-4 flex-row items-center justify-center"
            >
              <Home size={20} color="#64748B" />
              <Text className="text-gray-300 font-bold ml-2">
                BACK TO MENU
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}