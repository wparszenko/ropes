import { StyleSheet } from 'react-native';

export const levelCompleteModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: '#1A1D29',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#18FF92',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  statsContainer: {
    backgroundColor: 'rgba(15, 17, 23, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statsTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statValue: {
    color: '#00E0FF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  nextButton: {
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderColor: '#18FF92',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    fontFamily: 'System',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderColor: '#2D3748',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});