import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Volume2, VolumeX, Vibrate, Trash2, Info, User, Shield, CircleHelp as HelpCircle, Star, Trophy, Settings as SettingsIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useRopeStore } from '@/store/ropeStore';
import { settingsScreenStyles } from '@/styles/settingsScreenStyles';

export default function SettingsScreen() {
  const { settings, updateSettings, resetProgress, playerStats } = useGameStore();
  const { clearAll } = useRopeStore();

  const handleBack = () => {
    router.back();
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear rope store data
              clearAll();
              
              // Reset game progress
              await resetProgress();
              
              Alert.alert('Success', 'Your progress has been reset.');
            } catch (error) {
              console.error('Failed to reset progress:', error);
              Alert.alert('Error', 'Failed to reset progress. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Tangle Escape',
      'Version 1.0.0\n\nA challenging puzzle game where you connect circuits to help a robot escape through various mazes.\n\nMade with ⚡ by the Tangle Team',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'How to Play',
      '1. Connect wires of the same color to their matching sockets\n2. Avoid obstacles and make sure wires don\'t cross\n3. Complete all connections to activate the portal\n4. Help the robot escape through the portal!',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={settingsScreenStyles.container}>
      <LinearGradient colors={['#0F1117', '#1A1D29']} style={settingsScreenStyles.gradient}>
        {/* Header */}
        <View style={settingsScreenStyles.header}>
          <TouchableOpacity onPress={handleBack} style={settingsScreenStyles.backButton}>
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={settingsScreenStyles.headerTitle}>SETTINGS</Text>
          <View style={settingsScreenStyles.headerSpacer} />
        </View>

        <ScrollView style={settingsScreenStyles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={settingsScreenStyles.section}>
            <View style={settingsScreenStyles.sectionHeader}>
              <User size={20} color="#18FF92" />
              <Text style={settingsScreenStyles.sectionTitle}>PROFILE</Text>
            </View>
            
            <View style={settingsScreenStyles.profileCard}>
              <View style={settingsScreenStyles.profileStats}>
                <View style={settingsScreenStyles.profileStat}>
                  <Trophy size={16} color="#FFE347" />
                  <Text style={settingsScreenStyles.profileStatValue}>{playerStats.completedLevels}</Text>
                  <Text style={settingsScreenStyles.profileStatLabel}>Levels</Text>
                </View>
                <View style={settingsScreenStyles.profileStat}>
                  <Star size={16} color="#FFE347" />
                  <Text style={settingsScreenStyles.profileStatValue}>{playerStats.totalStars}</Text>
                  <Text style={settingsScreenStyles.profileStatLabel}>Stars</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Audio Settings */}
          <View style={settingsScreenStyles.section}>
            <View style={settingsScreenStyles.sectionHeader}>
              <Volume2 size={20} color="#00E0FF" />
              <Text style={settingsScreenStyles.sectionTitle}>AUDIO</Text>
            </View>
            
            <View style={settingsScreenStyles.settingItem}>
              <View style={settingsScreenStyles.settingLeft}>
                {settings.soundEnabled ? (
                  <Volume2 size={24} color="#18FF92" />
                ) : (
                  <VolumeX size={24} color="#64748B" />
                )}
                <View style={settingsScreenStyles.settingText}>
                  <Text style={settingsScreenStyles.settingTitle}>Sound Effects</Text>
                  <Text style={settingsScreenStyles.settingDescription}>Game sounds and feedback</Text>
                </View>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.soundEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>

            <View style={settingsScreenStyles.settingItem}>
              <View style={settingsScreenStyles.settingLeft}>
                <Volume2 size={24} color={settings.musicEnabled ? '#18FF92' : '#64748B'} />
                <View style={settingsScreenStyles.settingText}>
                  <Text style={settingsScreenStyles.settingTitle}>Background Music</Text>
                  <Text style={settingsScreenStyles.settingDescription}>Ambient game music</Text>
                </View>
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
          <View style={settingsScreenStyles.section}>
            <View style={settingsScreenStyles.sectionHeader}>
              <SettingsIcon size={20} color="#B347FF" />
              <Text style={settingsScreenStyles.sectionTitle}>GAMEPLAY</Text>
            </View>
            
            <View style={settingsScreenStyles.settingItem}>
              <View style={settingsScreenStyles.settingLeft}>
                <Vibrate size={24} color={settings.hapticEnabled ? '#18FF92' : '#64748B'} />
                <View style={settingsScreenStyles.settingText}>
                  <Text style={settingsScreenStyles.settingTitle}>Haptic Feedback</Text>
                  <Text style={settingsScreenStyles.settingDescription}>Vibration on interactions</Text>
                </View>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={(value) => updateSettings({ hapticEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.hapticEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>

            <View style={settingsScreenStyles.settingItem}>
              <View style={settingsScreenStyles.settingLeft}>
                <Info size={24} color={settings.showHints ? '#18FF92' : '#64748B'} />
                <View style={settingsScreenStyles.settingText}>
                  <Text style={settingsScreenStyles.settingTitle}>Show Hints</Text>
                  <Text style={settingsScreenStyles.settingDescription}>Display helpful tips</Text>
                </View>
              </View>
              <Switch
                value={settings.showHints}
                onValueChange={(value) => updateSettings({ showHints: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.showHints ? '#ffffff' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={settingsScreenStyles.section}>
            <View style={settingsScreenStyles.sectionHeader}>
              <HelpCircle size={20} color="#FFE347" />
              <Text style={settingsScreenStyles.sectionTitle}>SUPPORT</Text>
            </View>
            
            <TouchableOpacity onPress={handleHelp} style={settingsScreenStyles.actionButton}>
              <HelpCircle size={24} color="#FFE347" />
              <View style={settingsScreenStyles.actionButtonText}>
                <Text style={settingsScreenStyles.actionButtonTitle}>How to Play</Text>
                <Text style={settingsScreenStyles.actionButtonDescription}>Learn the game rules</Text>
              </View>
              <ArrowLeft size={16} color="#64748B" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAbout} style={settingsScreenStyles.actionButton}>
              <Info size={24} color="#00E0FF" />
              <View style={settingsScreenStyles.actionButtonText}>
                <Text style={settingsScreenStyles.actionButtonTitle}>About</Text>
                <Text style={settingsScreenStyles.actionButtonDescription}>App information</Text>
              </View>
              <ArrowLeft size={16} color="#64748B" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={settingsScreenStyles.section}>
            <View style={settingsScreenStyles.sectionHeader}>
              <Shield size={20} color="#FF5050" />
              <Text style={settingsScreenStyles.sectionTitle}>DATA</Text>
            </View>
            
            <TouchableOpacity onPress={handleResetProgress} style={settingsScreenStyles.dangerButton}>
              <Trash2 size={24} color="#FF5050" />
              <View style={settingsScreenStyles.actionButtonText}>
                <Text style={[settingsScreenStyles.actionButtonTitle, { color: '#FF5050' }]}>Reset All Progress</Text>
                <Text style={settingsScreenStyles.actionButtonDescription}>This cannot be undone</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={settingsScreenStyles.footer}>
            <Text style={settingsScreenStyles.footerText}>Tangle Escape v1.0.0</Text>
            <Text style={settingsScreenStyles.footerSubtext}>Made with ⚡ by the Tangle Team</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}