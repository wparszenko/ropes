import { StyleSheet, Platform } from 'react-native';

export const draggableDotStyles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 40, // Increased from 30 to 40 for better touch target
    height: 40, // Increased from 30 to 40 for better touch target
    borderRadius: 20, // Adjusted for new size
    borderWidth: 3, // Increased border for better visibility
    borderColor: '#FFFFFF',
    cursor: Platform.OS === 'web' ? 'grab' : 'default',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
        userSelect: 'none',
      },
    }),
    zIndex: 10,
  },
});