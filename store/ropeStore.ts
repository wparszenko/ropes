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
  isDragging: boolean;
  isInitialized: boolean;
  dragCount: number; // Track number of active drags
}

interface RopeStore extends RopeState {
  initializeLevel: (level: number, bounds: GameBounds) => void;
  updateRopePosition: (ropeId: string, position: Partial<RopePosition>) => void;
  checkIntersections: () => number;
  resetLevel: () => void;
  getCurrentRopes: () => Rope[];
  setDragging: (dragging: boolean) => void;
  clearAll: () => void;
  validatePositions: () => void; // Add position validation
}

const initialState: RopeState = {
  ropes: [],
  ropePositions: {},
  intersectionCount: 0,
  isCompleted: false,
  bounds: null,
  isDragging: false,
  isInitialized: false,
  dragCount: 0,
};

export const useRopeStore = create<RopeStore>((set, get) => ({
  ...initialState,

  initializeLevel: (level: number, bounds: GameBounds) => {
    try {
      const ropeCount = Math.min(level + 1, 10);
      const generatedRopes = generateCrossedRopes(ropeCount, bounds);
      
      // Initialize positions from generated ropes with validation
      const positions: { [ropeId: string]: RopePosition } = {};
      generatedRopes.forEach(rope => {
        // Validate rope positions
        const startX = isNaN(rope.start.x) ? bounds.minX + 50 : rope.start.x;
        const startY = isNaN(rope.start.y) ? bounds.minY + 50 : rope.start.y;
        const endX = isNaN(rope.end.x) ? bounds.maxX - 50 : rope.end.x;
        const endY = isNaN(rope.end.y) ? bounds.maxY - 50 : rope.end.y;
        
        positions[rope.id] = {
          startX: Math.max(bounds.minX, Math.min(bounds.maxX, startX)),
          startY: Math.max(bounds.minY, Math.min(bounds.maxY, startY)),
          endX: Math.max(bounds.minX, Math.min(bounds.maxX, endX)),
          endY: Math.max(bounds.minY, Math.min(bounds.maxY, endY)),
        };
      });

      const initialIntersections = countIntersections(generatedRopes);

      set({
        ropes: generatedRopes,
        ropePositions: positions,
        intersectionCount: initialIntersections,
        isCompleted: false,
        bounds,
        isDragging: false,
        isInitialized: true,
        dragCount: 0,
      });
    } catch (error) {
      console.error('Failed to initialize level:', error);
      // Fallback initialization
      set({
        ropes: [],
        ropePositions: {},
        intersectionCount: 0,
        isCompleted: false,
        bounds,
        isDragging: false,
        isInitialized: true,
        dragCount: 0,
      });
    }
  },

  updateRopePosition: (ropeId: string, position: Partial<RopePosition>) => {
    const state = get();
    const currentPosition = state.ropePositions[ropeId];
    
    if (!currentPosition || !state.bounds) return;

    // Validate new position values
    const validatedPosition: Partial<RopePosition> = {};
    
    if (position.startX !== undefined) {
      validatedPosition.startX = isNaN(position.startX) ? currentPosition.startX : 
        Math.max(state.bounds.minX, Math.min(state.bounds.maxX, position.startX));
    }
    if (position.startY !== undefined) {
      validatedPosition.startY = isNaN(position.startY) ? currentPosition.startY : 
        Math.max(state.bounds.minY, Math.min(state.bounds.maxY, position.startY));
    }
    if (position.endX !== undefined) {
      validatedPosition.endX = isNaN(position.endX) ? currentPosition.endX : 
        Math.max(state.bounds.minX, Math.min(state.bounds.maxX, position.endX));
    }
    if (position.endY !== undefined) {
      validatedPosition.endY = isNaN(position.endY) ? currentPosition.endY : 
        Math.max(state.bounds.minY, Math.min(state.bounds.maxY, position.endY));
    }

    const newPositions = {
      ...state.ropePositions,
      [ropeId]: {
        ...currentPosition,
        ...validatedPosition,
      },
    };

    set({ ropePositions: newPositions });
    
    // Only check intersections if not currently dragging
    if (state.dragCount === 0) {
      setTimeout(() => {
        get().checkIntersections();
      }, 50); // Small delay to batch updates
    }
  },

  checkIntersections: () => {
    const state = get();
    const currentRopes = get().getCurrentRopes();
    const newIntersectionCount = countIntersections(currentRopes);
    const isCompleted = newIntersectionCount === 0 && currentRopes.length > 0 && state.dragCount === 0;

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

  setDragging: (dragging: boolean) => {
    const state = get();
    const newDragCount = dragging ? state.dragCount + 1 : Math.max(0, state.dragCount - 1);
    const isDragging = newDragCount > 0;
    
    set({ 
      isDragging,
      dragCount: newDragCount,
    });
    
    // Check intersections when all dragging ends
    if (newDragCount === 0) {
      setTimeout(() => {
        get().checkIntersections();
      }, 100); // Small delay to ensure position updates are complete
    }
  },

  validatePositions: () => {
    const state = get();
    if (!state.bounds) return;
    
    const validatedPositions: { [ropeId: string]: RopePosition } = {};
    
    Object.entries(state.ropePositions).forEach(([ropeId, position]) => {
      validatedPositions[ropeId] = {
        startX: Math.max(state.bounds!.minX, Math.min(state.bounds!.maxX, 
          isNaN(position.startX) ? state.bounds!.minX + 50 : position.startX)),
        startY: Math.max(state.bounds!.minY, Math.min(state.bounds!.maxY, 
          isNaN(position.startY) ? state.bounds!.minY + 50 : position.startY)),
        endX: Math.max(state.bounds!.minX, Math.min(state.bounds!.maxX, 
          isNaN(position.endX) ? state.bounds!.maxX - 50 : position.endX)),
        endY: Math.max(state.bounds!.minY, Math.min(state.bounds!.maxY, 
          isNaN(position.endY) ? state.bounds!.maxY - 50 : position.endY)),
      };
    });
    
    set({ ropePositions: validatedPositions });
  },

  resetLevel: () => {
    const { bounds } = get();
    if (bounds) {
      // Re-initialize with current bounds
      const state = get();
      const level = state.ropes.length - 1; // Approximate level from rope count
      get().initializeLevel(Math.max(1, level), bounds);
    } else {
      // Reset to initial state if no bounds
      set({
        ...initialState,
        isInitialized: false,
      });
    }
  },

  clearAll: () => {
    set(initialState);
  },
}));