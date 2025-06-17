import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Socket as SocketType } from '@/data/levels';

interface SocketProps {
  socket: SocketType;
  connected: boolean;
}

export default function Socket({ socket, connected }: SocketProps) {
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (!connected) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withTiming(0);
    }
  }, [connected]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.7, 1]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: socket.position[0] - 20,
          top: socket.position[1] - 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 3,
          borderColor: socket.color,
          backgroundColor: connected ? socket.color : 'transparent',
        },
        animatedStyle,
      ]}
      className={`${connected ? 'opacity-100' : 'opacity-70'}`}
    >
      <View
        className="flex-1 rounded-full"
        style={{
          backgroundColor: connected ? 'rgba(255,255,255,0.3)' : 'transparent',
        }}
      />
    </Animated.View>
  );
}