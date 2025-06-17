import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Obstacle as ObstacleType } from '@/data/levels';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export default function Obstacle({ obstacle }: ObstacleProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (obstacle.type === 'rotating') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
    }
  }, [obstacle.type]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: obstacle.position[0] - obstacle.size[0] / 2,
          top: obstacle.position[1] - obstacle.size[1] / 2,
          width: obstacle.size[0],
          height: obstacle.size[1],
          backgroundColor: '#FF5050',
          borderRadius: obstacle.type === 'rotating' ? 4 : 8,
        },
        obstacle.type === 'rotating' && animatedStyle,
      ]}
      className="border-2 border-red-400"
    >
      {obstacle.type === 'rotating' && (
        <View className="absolute inset-2 bg-red-600 rounded-sm" />
      )}
    </Animated.View>
  );
}