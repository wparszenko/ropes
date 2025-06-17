import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Settings, Zap, Star, Clock, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { homeScreenStyles } from '@/styles/homeScreenStyles';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { playerStats, currentLevel, loadGameState } = useGameStore();

  useEffect(() => {
    loadGameState();
  }, []);

  const handlePlayGame = () => {
    router.push('/game');
  };

  const handleViewLevels = () => {
    router.push('/levels');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <View style={homeScreenStyles.container}>
      <LinearGradient
        colors={['#0F1117', '#1A1D29', '#0F1117']}
        style={homeScreenStyles.gradient}
      >
        <ScrollView 
          style={homeScreenStyles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={homeScreenStyles.scrollContent}
        >
          {/* Header */}
          <View style={homeScreenStyles.header}>
            <View style={homeScreenStyles.titleContainer}>
              <Zap size={32} color="#18FF92" />
              <Text style={homeScreenStyles.mainTitle}>TANGLE</Text>
            </View>
            <Text style={homeScreenStyles.subtitle}>ESCAPE</Text>
            <Text style={homeScreenStyles.tagline}>Connect the circuits, escape the maze</Text>
          </View>

          {/* Stats Card */}
          <View style={homeScreenStyles.statsCard}>
            <Text style={homeScreenStyles.statsTitle}>Progress</Text>
            <View style={homeScreenStyles.statsRow}>
              <View style={homeScreenStyles.statItem}>
                <Text style={[homeScreenStyles.statValue, { color: '#18FF92' }]}>
                  {currentLevel}
                </Text>
                <Text style={homeScreenStyles.statLabel}>Level</Text>
              </View>
              <View style={homeScreenStyles.statItem}>
                <Text style={[homeScreenStyles.statValue, { color: '#00E0FF' }]}>
                  {playerStats.totalStars}
                </Text>
                <Text style={homeScreenStyles.statLabel}>Stars</Text>
              </View>
              <View style={homeScreenStyles.statItem}>
                <Text style={[homeScreenStyles.statValue, { color: '#B347FF' }]}>
                  {playerStats.completedLevels}
                </Text>
                <Text style={homeScreenStyles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Achievement Preview */}
          <View style={homeScreenStyles.achievementCard}>
            <View style={homeScreenStyles.achievementHeader}>
              <Star size={20} color="#FFE347" />
              <Text style={homeScreenStyles.achievementTitle}>Recent Achievement</Text>
            </View>
            <Text style={homeScreenStyles.achievementText}>
              {playerStats.completedLevels > 0 
                ? `Completed Level ${playerStats.completedLevels}!` 
                : 'Complete your first level to unlock achievements'}
            </Text>
          </View>

          {/* Main Menu Buttons */}
          <View style={homeScreenStyles.buttonContainer}>
            <TouchableOpacity
              onPress={handlePlayGame}
              style={[homeScreenStyles.primaryButton, homeScreenStyles.playButton]}
            >
              <LinearGradient
                colors={['#18FF92', '#14CC7A']}
                style={homeScreenStyles.buttonGradient}
              >
                <Play size={32} color="#FFFFFF" />
                <Text style={homeScreenStyles.primaryButtonText}>CONTINUE GAME</Text>
                <Text style={homeScreenStyles.buttonSubtext}>Level {currentLevel}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={homeScreenStyles.secondaryButtonRow}>
              <TouchableOpacity
                onPress={handleViewLevels}
                style={[homeScreenStyles.secondaryButton, { backgroundColor: 'rgba(0, 224, 255, 0.1)' }]}
              >
                <Trophy size={24} color="#00E0FF" />
                <Text style={homeScreenStyles.secondaryButtonText}>LEVELS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSettings}
                style={[homeScreenStyles.secondaryButton, { backgroundColor: 'rgba(100, 116, 139, 0.1)' }]}
              >
                <Settings size={24} color="#64748B" />
                <Text style={homeScreenStyles.secondaryButtonText}>SETTINGS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={homeScreenStyles.quickStats}>
            <View style={homeScreenStyles.quickStatItem}>
              <Clock size={16} color="#FFE347" />
              <Text style={homeScreenStyles.quickStatText}>Best Time: 1:23</Text>
            </View>
            <View style={homeScreenStyles.quickStatItem}>
              <Target size={16} color="#FF5050" />
              <Text style={homeScreenStyles.quickStatText}>Accuracy: 95%</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={homeScreenStyles.footer}>
            <Text style={homeScreenStyles.footerText}>
              v1.0.0 • Made with ⚡ by Tangle Team
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}