import { StyleSheet } from 'react-native';

export const levelFailedModalStyles = StyleSheet.create({
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
    borderColor: 'rgba(255, 80, 80, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FF5050',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 227, 71, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 227, 71, 0.3)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  retryButton: {
    backgroundColor: 'rgba(24, 255, 146, 0.2)',
    borderColor: '#18FF92',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'System',
  },
  homeButton: {
    backgroundColor: 'rgba(26, 29, 41, 0.8)',
    borderColor: '#2D3748',
  },
  homeButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});