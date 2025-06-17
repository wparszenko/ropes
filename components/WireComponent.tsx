import React, { useCallback, useEffect } from 'react';
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
  renderMode: 'rope' | 'dots';
  sharedPositions?: {
    startX: any;
    startY: any;
    endX: any;
    endY: any;
  };
}

export default function WireComponent({ wire, onPositionUpdate, renderMode, sharedPositions }: WireComponentProps) {
  // Use shared positions if provided, otherwise create new ones
  const startX = sharedPositions?.startX || useSharedValue(wire.start[0]);
  const startY = sharedPositions?.startY || useSharedValue(wire.start[1]);
  const endX = sharedPositions?.endX || useSharedValue(wire.end[0]);
  const endY = sharedPositions?.endY || useSharedValue(wire.end[1]);

  // Initialize positions if this is the first render
  useEffect(() => {
    if (!sharedPositions) {
      startX.value = wire.start[0];
      startY.value = wire.start[1];
      endX.value = wire.end[0];
      endY.value = wire.end[1];
    }
  }, [wire, sharedPositions]);

  const handlePositionChange = useCallback(() => {
    onPositionUpdate(
      wire.id,
      { x: startX.value, y: startY.value },
      { x: endX.value, y: endY.value }
    );
  }, [wire.id, startX, startY, endX, endY, onPositionUpdate]);

  if (renderMode === 'rope') {
    return (
      <RopePath
        startPoint={{ x: startX, y: startY }}
        endPoint={{ x: endX, y: endY }}
        color={wire.color}
      />
    );
  }

  return (
    <>
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