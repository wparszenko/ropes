import { StyleSheet, Platform } from 'react-native';

export const draggableDotStyles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    cursor: Platform.OS === 'web' ? 'grab' : 'default',
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.3)',
        userSelect: 'none',
      },
    }),
    zIndex: 10,
  },
});