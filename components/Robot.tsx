import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useGameStore } from '@/store/gameStore';

export default function Robot() {
  const { robotPosition, portalActive } = useGameStore();
  const floatAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);

  React.useEffect(() => {
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    glowAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [-5, 5]);
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.5, 1]);

    return {
      transform: [{ translateY }],
      opacity: glowOpacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: robotPosition.x - 25,
          top: robotPosition.y - 25,
          width: 50,
          height: 50,
        },
        animatedStyle,
      ]}
    >
      {/* Robot Body */}
      <View className="flex-1 bg-neon-blue/80 rounded-full border-2 border-neon-blue">
        {/* Robot Eyes */}
        <View className="flex-row justify-center items-center mt-3 space-x-2">
          <View className="w-3 h-3 bg-neon-green rounded-full" />
          <View className="w-3 h-3 bg-neon-green rounded-full" />
        </View>
        
        {/* Robot Mouth */}
        <View className="items-center mt-1">
          <View className="w-4 h-1 bg-neon-green/60 rounded-full" />
        </View>
      </View>

      {/* Glow Effect */}
      <View
        className="absolute inset-0 bg-neon-blue/20 rounded-full"
        style={{
          transform: [{ scale: 1.5 }],
        }}
      />
    </Animated.View>
  );
}