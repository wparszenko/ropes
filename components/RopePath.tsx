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
    const startX = startPoint.x.value;
    const startY = startPoint.y.value;
    const endX = endPoint.x.value;
    const endY = endPoint.y.value;

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