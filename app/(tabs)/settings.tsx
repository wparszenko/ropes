import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Volume2, VolumeX, Vibrate, Trash2, Info, User, Shield, CircleHelp as HelpCircle, Star, Trophy, Settings as SettingsIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

export default function SettingsScreen() {
  const { settings, updateSettings, resetProgress, playerStats } = useGameStore();

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
          onPress: () => {
            resetProgress();
            Alert.alert('Success', 'Your progress has been reset.');
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
    <View style={styles.container}>
      <LinearGradient colors={['#0F1117', '#1A1D29']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#18FF92" />
              <Text style={styles.sectionTitle}>PROFILE</Text>
            </View>
            
            <View style={styles.profileCard}>
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Trophy size={16} color="#FFE347" />
                  <Text style={styles.profileStatValue}>{playerStats.completedLevels}</Text>
                  <Text style={styles.profileStatLabel}>Levels</Text>
                </View>
                <View style={styles.profileStat}>
                  <Star size={16} color="#FFE347" />
                  <Text style={styles.profileStatValue}>{playerStats.totalStars}</Text>
                  <Text style={styles.profileStatLabel}>Stars</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Audio Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Volume2 size={20} color="#00E0FF" />
              <Text style={styles.sectionTitle}>AUDIO</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                {settings.soundEnabled ? (
                  <Volume2 size={24} color="#18FF92" />
                ) : (
                  <VolumeX size={24} color="#64748B" />
                )}
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Sound Effects</Text>
                  <Text style={styles.settingDescription}>Game sounds and feedback</Text>
                </View>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.soundEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Volume2 size={24} color={settings.musicEnabled ? '#18FF92' : '#64748B'} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Background Music</Text>
                  <Text style={styles.settingDescription}>Ambient game music</Text>
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SettingsIcon size={20} color="#B347FF" />
              <Text style={styles.sectionTitle}>GAMEPLAY</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Vibrate size={24} color={settings.hapticEnabled ? '#18FF92' : '#64748B'} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Haptic Feedback</Text>
                  <Text style={styles.settingDescription}>Vibration on interactions</Text>
                </View>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={(value) => updateSettings({ hapticEnabled: value })}
                trackColor={{ false: '#374151', true: '#18FF92' }}
                thumbColor={settings.hapticEnabled ? '#ffffff' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Info size={24} color={settings.showHints ? '#18FF92' : '#64748B'} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Show Hints</Text>
                  <Text style={styles.settingDescription}>Display helpful tips</Text>
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <HelpCircle size={20} color="#FFE347" />
              <Text style={styles.sectionTitle}>SUPPORT</Text>
            </View>
            
            <TouchableOpacity onPress={handleHelp} style={styles.actionButton}>
              <HelpCircle size={24} color="#FFE347" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>How to Play</Text>
                <Text style={styles.actionButtonDescription}>Learn the game rules</Text>
              </View>
              <ArrowLeft size={16} color="#64748B" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAbout} style={styles.actionButton}>
              <Info size={24} color="#00E0FF" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>About</Text>
                <Text style={styles.actionButtonDescription}>App information</Text>
              </View>
              <ArrowLeft size={16} color="#64748B" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color="#FF5050" />
              <Text style={styles.sectionTitle}>DATA</Text>
            </View>
            
            <TouchableOpacity onPress={handleResetProgress} style={styles.dangerButton}>
              <Trash2 size={24} color="#FF5050" />
              <View style={styles.actionButtonText}>
                <Text style={[styles.actionButtonTitle, { color: '#FF5050' }]}>Reset All Progress</Text>
                <Text style={styles.actionButtonDescription}>This cannot be undone</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Tangle Escape v1.0.0</Text>
            <Text style={styles.footerSubtext}>Made with ⚡ by the Tangle Team</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'System',
  },
  profileCard: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  actionButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 80, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF5050',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});