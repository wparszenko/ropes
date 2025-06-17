import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Volume2, VolumeX, Vibrate, Trash2, Info } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

export default function SettingsScreen() {
  const { settings, updateSettings, resetProgress } = useGameStore();

  const handleBack = () => {
    router.back();
  };

  const handleResetProgress = () => {
    // In a real app, you'd show a confirmation dialog
    resetProgress();
  };

  return (
    <View className="flex-1 bg-dark-bg">
      <LinearGradient
        colors={['#0F1117', '#1A1D29']}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="pt-12 pb-4 px-4 flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="bg-dark-surface/80 rounded-full p-3 mr-4"
          >
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold font-orbitron">
            SETTINGS
          </Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Audio Settings */}
          <View className="bg-dark-surface/80 rounded-2xl p-4 mb-4 border border-dark-border">
            <Text className="text-white text-lg font-bold mb-4 font-orbitron">
              AUDIO
            </Text>
            
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                {settings.soundEnabled ? (
                  <Volume2 size={24} color="#18FF92" />
                ) : (
                  <VolumeX size={24} color="#64748B" />
                )}
                <Text className="text-white ml-3">Sound Effects</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.soundEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Volume2 size={24} color={settings.musicEnabled ? '#18FF92' : '#64748B'} />
                <Text className="text-white ml-3">Background Music</Text>
              </View>
              <Switch
                value={settings.musicEnabled}
                onValueChange={(value) => updateSettings({ musicEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.musicEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Gameplay Settings */}
          <View className="bg-dark-surface/80 rounded-2xl p-4 mb-4 border border-dark-border">
            <Text className="text-white text-lg font-bold mb-4 font-orbitron">
              GAMEPLAY
            </Text>
            
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Vibrate size={24} color={settings.hapticEnabled ? '#18FF92' : '#64748B'} />
                <Text className="text-white ml-3">Haptic Feedback</Text>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={(value) => updateSettings({ hapticEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.hapticEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Info size={24} color={settings.showHints ? '#18FF92' : '#64748B'} />
                <Text className="text-white ml-3">Show Hints</Text>
              </View>
              <Switch
                value={settings.showHints}
                onValueChange={(value) => updateSettings({ showHints: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.showHints ? '#ffffff' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Data Management */}
          <View className="bg-dark-surface/80 rounded-2xl p-4 mb-4 border border-dark-border">
            <Text className="text-white text-lg font-bold mb-4 font-orbitron">
              DATA
            </Text>
            
            <TouchableOpacity
              onPress={handleResetProgress}
              className="flex-row items-center justify-between bg-neon-red/20 border border-neon-red rounded-xl p-4"
            >
              <View className="flex-row items-center">
                <Trash2 size={24} color="#FF5050" />
                <Text className="text-white ml-3">Reset All Progress</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* About */}
          <View className="bg-dark-surface/80 rounded-2xl p-4 mb-8 border border-dark-border">
            <Text className="text-white text-lg font-bold mb-4 font-orbitron">
              ABOUT
            </Text>
            <Text className="text-gray-400 mb-2">Tangle Escape v1.0.0</Text>
            <Text className="text-gray-400 mb-2">
              A puzzle game where you connect circuits to help a robot escape.
            </Text>
            <Text className="text-gray-400">
              Made with ⚡ by the Tangle Team
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}