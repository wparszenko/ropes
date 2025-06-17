import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculate responsive game board dimensions
const BOARD_MARGIN = 16;
const BOARD_PADDING = 30;

// Make the game board much taller and more responsive
const BOARD_WIDTH = width - (BOARD_MARGIN * 2);
const BOARD_HEIGHT = Math.max(height - 280, 500);

export const gameBoardStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: 400,
  },
  container: {
    backgroundColor: 'rgba(15, 17, 23, 0.5)',
    borderRadius: 16,
    marginHorizontal: BOARD_MARGIN,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'rgba(24, 255, 146, 0.3)',
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
    shadowColor: '#18FF92',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dotsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: 'box-none',
  },
  boundaryIndicator: {
    position: 'absolute',
    top: BOARD_PADDING,
    left: BOARD_PADDING,
    right: BOARD_PADDING,
    bottom: BOARD_PADDING,
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 146, 0.1)',
    borderRadius: 8,
    borderStyle: 'dashed',
    pointerEvents: 'none',
    zIndex: 0,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 3,
    pointerEvents: 'none',
  },
  debugText: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});