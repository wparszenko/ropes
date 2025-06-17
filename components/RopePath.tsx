import React from 'react';
import { Platform } from 'react-native';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RopePathProps {
  startPoint: {
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
  };
  endPoint: {
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
  };
  color: string;
}

export default function RopePath({ startPoint, endPoint, color }: RopePathProps) {
  // Use useDerivedValue to create a stable derived value for the path
  const pathData = useDerivedValue(() => {
    // Ensure we have valid numbers with fallbacks
    const startX = typeof startPoint.x.value === 'number' && !isNaN(startPoint.x.value) ? startPoint.x.value : 50;
    const startY = typeof startPoint.y.value === 'number' && !isNaN(startPoint.y.value) ? startPoint.y.value : 50;
    const endX = typeof endPoint.x.value === 'number' && !isNaN(endPoint.x.value) ? endPoint.x.value : 100;
    const endY = typeof endPoint.y.value === 'number' && !isNaN(endPoint.y.value) ? endPoint.y.value : 100;

    // Calculate distance between points for dynamic arc
    const distance = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );

    // Calculate control point for Bézier curve (arc effect)
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Reduced arc height to minimize jumping during movement
    const arcHeight = Math.min(distance * 0.15, 50); // Reduced from 0.3 and 100
    const controlX = midX;
    const controlY = midY + arcHeight; // Downward arc for gravity effect

    // Create SVG path string for quadratic Bézier curve
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  }, [startPoint.x, startPoint.y, endPoint.x, endPoint.y]);

  const animatedProps = useAnimatedProps(() => {
    return {
      d: pathData.value,
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      stroke={color}
      strokeWidth={20} // Increased from 12 to 20 for much thicker ropes
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.9}
      pointerEvents="none"
    />
  );
}