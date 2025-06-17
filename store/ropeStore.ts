import { create } from 'zustand';
import { generateCrossedRopes, countIntersections, type Rope, type GameBounds } from '@/utils/ropeGenerator';

export interface RopePosition {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface RopeState {
  ropes: Rope[];
  ropePositions: { [ropeId: string]: RopePosition };
  intersectionCount: number;
  isCompleted: boolean;
  bounds: GameBounds | null;
}

interface RopeStore extends RopeState {
  initializeLevel: (level: number, bounds: GameBounds) => void;
  updateRopePosition: (ropeId: string, position: Partial<RopePosition>) => void;
  checkIntersections: () => number;
  resetLevel: () => void;
  getCurrentRopes: () => Rope[];
}

const initialState: RopeState = {
  ropes: [],
  ropePositions: {},
  intersectionCount: 0,
  isCompleted: false,
  bounds: null,
};

export const useRopeStore = create<RopeStore>((set, get) => ({
  ...initialState,

  initializeLevel: (level: number, bounds: GameBounds) => {
    const ropeCount = Math.min(level + 1, 10);
    const generatedRopes = generateCrossedRopes(ropeCount, bounds);
    
    // Initialize positions from generated ropes
    const positions: { [ropeId: string]: RopePosition } = {};
    generatedRopes.forEach(rope => {
      positions[rope.id] = {
        startX: rope.start.x,
        startY: rope.start.y,
        endX: rope.end.x,
        endY: rope.end.y,
      };
    });

    const initialIntersections = countIntersections(generatedRopes);

    set({
      ropes: generatedRopes,
      ropePositions: positions,
      intersectionCount: initialIntersections,
      isCompleted: false,
      bounds,
    });
  },

  updateRopePosition: (ropeId: string, position: Partial<RopePosition>) => {
    const state = get();
    const currentPosition = state.ropePositions[ropeId];
    
    if (!currentPosition) return;

    const newPositions = {
      ...state.ropePositions,
      [ropeId]: {
        ...currentPosition,
        ...position,
      },
    };

    set({ ropePositions: newPositions });
    
    // Check intersections after position update
    get().checkIntersections();
  },

  checkIntersections: () => {
    const state = get();
    const currentRopes = get().getCurrentRopes();
    const newIntersectionCount = countIntersections(currentRopes);
    const isCompleted = newIntersectionCount === 0 && currentRopes.length > 0;

    set({
      intersectionCount: newIntersectionCount,
      isCompleted,
    });

    return newIntersectionCount;
  },

  getCurrentRopes: () => {
    const { ropes, ropePositions } = get();
    return ropes.map(rope => ({
      ...rope,
      start: {
        x: ropePositions[rope.id]?.startX || rope.start.x,
        y: ropePositions[rope.id]?.startY || rope.start.y,
      },
      end: {
        x: ropePositions[rope.id]?.endX || rope.end.x,
        y: ropePositions[rope.id]?.endY || rope.end.y,
      },
    }));
  },

  resetLevel: () => {
    const { bounds } = get();
    if (bounds) {
      // Re-initialize with current bounds
      const state = get();
      const level = state.ropes.length - 1; // Approximate level from rope count
      get().initializeLevel(Math.max(1, level), bounds);
    }
  },
}));