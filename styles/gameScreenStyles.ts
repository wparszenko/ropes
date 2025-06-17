import { StyleSheet } from 'react-native';

export const gameScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderRadius: 12,
    padding: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  levelSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(26, 29, 41, 0.5)',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  controlButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
    borderWidth: 2,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 80, 80, 0.1)',
    borderColor: '#FF5050',
  },
  hintButton: {
    backgroundColor: 'rgba(255, 227, 71, 0.1)',
    borderColor: '#FFE347',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
  },
});