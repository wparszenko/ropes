import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Settings, Zap, Star, Clock, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F1117', '#1A1D29', '#0F1117']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Zap size={32} color="#18FF92" />
              <Text style={styles.mainTitle}>TANGLE</Text>
            </View>
            <Text style={styles.subtitle}>ESCAPE</Text>
            <Text style={styles.tagline}>Connect the circuits, escape the maze</Text>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#18FF92' }]}>
                  {currentLevel}
                </Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#00E0FF' }]}>
                  {playerStats.totalStars}
                </Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#B347FF' }]}>
                  {playerStats.completedLevels}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Achievement Preview */}
          <View style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Star size={20} color="#FFE347" />
              <Text style={styles.achievementTitle}>Recent Achievement</Text>
            </View>
            <Text style={styles.achievementText}>
              {playerStats.completedLevels > 0 
                ? `Completed Level ${playerStats.completedLevels}!` 
                : 'Complete your first level to unlock achievements'}
            </Text>
          </View>

          {/* Main Menu Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handlePlayGame}
              style={[styles.primaryButton, styles.playButton]}
            >
              <LinearGradient
                colors={['#18FF92', '#14CC7A']}
                style={styles.buttonGradient}
              >
                <Play size={32} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>CONTINUE GAME</Text>
                <Text style={styles.buttonSubtext}>Level {currentLevel}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryButtonRow}>
              <TouchableOpacity
                onPress={handleViewLevels}
                style={[styles.secondaryButton, { backgroundColor: 'rgba(0, 224, 255, 0.1)' }]}
              >
                <Trophy size={24} color="#00E0FF" />
                <Text style={styles.secondaryButtonText}>LEVELS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSettings}
                style={[styles.secondaryButton, { backgroundColor: 'rgba(100, 116, 139, 0.1)' }]}
              >
                <Settings size={24} color="#64748B" />
                <Text style={styles.secondaryButtonText}>SETTINGS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Clock size={16} color="#FFE347" />
              <Text style={styles.quickStatText}>Best Time: 1:23</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Target size={16} color="#FF5050" />
              <Text style={styles.quickStatText}>Accuracy: 95%</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              v1.0.0 • Made with ⚡ by Tangle Team
            </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#18FF92',
    marginBottom: 8,
    fontFamily: 'System',
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'System',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  achievementCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: 'rgba(255, 227, 71, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 227, 71, 0.3)',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFE347',
    marginLeft: 8,
  },
  achievementText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  playButton: {
    shadowColor: '#18FF92',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonGradient: {
    padding: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'System',
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45, 55, 72, 0.5)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'System',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginBottom: 32,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});