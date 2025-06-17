import { StyleSheet, Platform } from 'react-native';

export const draggableDotStyles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 50, // Increased from 40 to 50 for even better touch target
    height: 50, // Increased from 40 to 50 for even better touch target
    borderRadius: 25, // Adjusted for new size
    borderWidth: 4, // Increased border for better visibility
    borderColor: '#FFFFFF',
    cursor: Platform.OS === 'web' ? 'grab' : 'default',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.5)',
        userSelect: 'none',
      },
    }),
    zIndex: 10,
  },
});