import React from 'react';
import Animated, {
  useAnimatedProps,
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
  const animatedProps = useAnimatedProps(() => {
    // Ensure we have valid numbers
    const startX = startPoint.x.value || 0;
    const startY = startPoint.y.value || 0;
    const endX = endPoint.x.value || 0;
    const endY = endPoint.y.value || 0;

    // Validate that all values are numbers
    if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
      // Return a simple line if values are invalid
      return {
        d: `M 50 50 L 100 100`,
      };
    }

    // Calculate distance between points for dynamic arc
    const distance = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );

    // Calculate control point for Bézier curve (arc effect)
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Dynamic arc height based on distance (more realistic rope physics)
    const arcHeight = Math.min(distance * 0.25, 80);
    const controlX = midX;
    const controlY = midY + arcHeight; // Downward arc for gravity effect

    // Create SVG path string for quadratic Bézier curve
    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

    return {
      d: pathData,
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      stroke={color}
      strokeWidth={8}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.9}
      pointerEvents="none"
    />
  );
}