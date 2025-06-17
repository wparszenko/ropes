import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, ArrowRight, Home, RotateCcw } from 'lucide-react-native';

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
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <LinearGradient
          colors={['#1A1D29', '#0F1117']}
          className="bg-dark-surface rounded-3xl p-8 w-full max-w-sm border-2 border-neon-green/30"
        >
          {/* Success Header */}
          <View className="items-center mb-6">
            <Text className="text-neon-green text-3xl font-bold font-orbitron mb-2">
              LEVEL COMPLETE!
            </Text>
            <Text className="text-white text-lg">
              Level {level}
            </Text>
          </View>

          {/* Stars */}
          <View className="flex-row justify-center mb-8 space-x-2">
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
          <View className="bg-dark-bg/50 rounded-2xl p-4 mb-6">
            <Text className="text-white text-center font-bold mb-2">
              Performance
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Time:</Text>
              <Text className="text-neon-blue">1:23</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Moves:</Text>
              <Text className="text-neon-green">12</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={onNextLevel}
              className="bg-neon-green/20 border-2 border-neon-green rounded-2xl p-4 flex-row items-center justify-center"
            >
              <Text className="text-white text-lg font-bold mr-2 font-orbitron">
                NEXT LEVEL
              </Text>
              <ArrowRight size={24} color="#18FF92" />
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-dark-surface/80 border border-dark-border rounded-2xl p-3 flex-row items-center justify-center"
              >
                <RotateCcw size={20} color="#64748B" />
                <Text className="text-gray-300 font-bold ml-2">
                  RETRY
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-dark-surface/80 border border-dark-border rounded-2xl p-3 flex-row items-center justify-center"
              >
                <Home size={20} color="#64748B" />
                <Text className="text-gray-300 font-bold ml-2">
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