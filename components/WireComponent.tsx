import React, { useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import DraggableDot from '@/components/DraggableDot';
import RopePath from '@/components/RopePath';

interface WireComponentProps {
  wire: {
    id: string;
    start: [number, number];
    end: [number, number];
    color: string;
  };
  onPositionUpdate: (wireId: string, start: { x: number; y: number }, end: { x: number; y: number }) => void;
}

export default function WireComponent({ wire, onPositionUpdate }: WireComponentProps) {
  const startX = useSharedValue(wire.start[0]);
  const startY = useSharedValue(wire.start[1]);
  const endX = useSharedValue(wire.end[0]);
  const endY = useSharedValue(wire.end[1]);

  const handlePositionChange = useCallback(() => {
    onPositionUpdate(
      wire.id,
      { x: startX.value, y: startY.value },
      { x: endX.value, y: endY.value }
    );
  }, [wire.id, startX, startY, endX, endY, onPositionUpdate]);

  return (
    <>
      <RopePath
        startPoint={{ x: startX, y: startY }}
        endPoint={{ x: endX, y: endY }}
        color={wire.color}
      />
      <DraggableDot 
        position={{ x: startX, y: startY }}
        color={wire.color}
        onPositionChange={handlePositionChange}
      />
      <DraggableDot 
        position={{ x: endX, y: endY }}
        color={wire.color}
        onPositionChange={handlePositionChange}
      />
    </>
  );
}