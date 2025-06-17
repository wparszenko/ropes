import React from 'react';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Wire as WireType } from '@/data/levels';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WireProps {
  wire: WireType;
  onConnection: (wireId: string, socketId: string, connected: boolean) => void;
}

export default function Wire({ wire, onConnection }: WireProps) {
  const startX = useSharedValue(wire.start[0]);
  const startY = useSharedValue(wire.start[1]);
  const endX = useSharedValue(wire.end[0]);
  const endY = useSharedValue(wire.end[1]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      // For now, just move the end point
      endX.value = wire.end[0] + event.translationX;
      endY.value = wire.end[1] + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      // Snap back with spring animation
      endX.value = withSpring(wire.end[0]);
      endY.value = withSpring(wire.end[1]);
    });

  const animatedProps = useAnimatedProps(() => {
    const distance = Math.sqrt(
      Math.pow(endX.value - startX.value, 2) + Math.pow(endY.value - startY.value, 2)
    );

    const midX = (startX.value + endX.value) / 2;
    const midY = (startY.value + endY.value) / 2;
    
    const arcHeight = Math.min(distance * 0.25, 80);
    const controlX = midX;
    const controlY = midY + arcHeight;

    const pathData = `M ${startX.value} ${startY.value} Q ${controlX} ${controlY} ${endX.value} ${endY.value}`;

    return {
      d: pathData,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedPath
        animatedProps={animatedProps}
        stroke={wire.color}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={wire.connected ? 1 : 0.7}
        style={{
          filter: `drop-shadow(0 0 10px ${wire.color})`,
        }}
      />
    </GestureDetector>
  );
}