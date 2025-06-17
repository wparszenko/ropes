import { StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
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