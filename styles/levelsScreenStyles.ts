import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const LEVELS_PER_ROW = 4;
const LEVEL_SIZE = (width - 60) / LEVELS_PER_ROW;

export const levelsScreenStyles = StyleSheet.create({
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
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  worldContainer: {
    marginBottom: 32,
  },
  worldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  worldTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  worldProgress: {
    backgroundColor: 'rgba(24, 255, 146, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#18FF92',
  },
  worldProgressText: {
    fontSize: 12,
    color: '#18FF92',
    fontWeight: '600',
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  levelButton: {
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    width: LEVEL_SIZE - 8,
    height: LEVEL_SIZE - 8,
  },
  currentLevel: {
    backgroundColor: 'rgba(255, 227, 71, 0.2)',
    borderColor: '#FFE347',
  },
  completedLevel: {
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderColor: '#18FF92',
  },
  unlockedLevel: {
    backgroundColor: 'rgba(0, 224, 255, 0.2)',
    borderColor: '#00E0FF',
  },
  lockedLevel: {
    backgroundColor: 'rgba(26, 29, 41, 0.5)',
    borderColor: '#2D3748',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  currentIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE347',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
    fontFamily: 'System',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});