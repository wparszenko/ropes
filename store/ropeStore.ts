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
  dragCount: number;
  currentLevel: number; // Track current level to detect changes
}

interface RopeStore extends RopeState {
  initializeLevel: (level: number, bounds: GameBounds) => void;
  updateRopePosition: (ropeId: string, position: Partial<RopePosition>) => void;
  checkIntersections: () => number;
  resetLevel: () => void;
  getCurrentRopes: () => Rope[];
  setDragging: (dragging: boolean) => void;
  clearAll: () => void;
  validatePositions: () => void;
  cleanupLevel: () => void; // New method for thorough cleanup
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
  currentLevel: 0,
};

export const useRopeStore = create<RopeStore>((set, get) => ({
  ...initialState,

  initializeLevel: (level: number, bounds: GameBounds) => {
    try {
      console.log('Initializing rope level', level);
      
      // Clean up previous level data first
      const currentState = get();
      if (currentState.currentLevel !== level) {
        console.log('Level changed, cleaning up previous level data');
        get().cleanupLevel();
      }
      
      const ropeCount = Math.min(level + 1, 10);
      
      // Generate fresh ropes for this level - no memory of previous states
      const generatedRopes = generateCrossedRopes(ropeCount, bounds);
      
      // Create fresh positions - completely new data
      const positions: { [ropeId: string]: RopePosition } = {};
      generatedRopes.forEach(rope => {
        // Validate and clamp positions within bounds
        const startX = Math.max(bounds.minX, Math.min(bounds.maxX, 
          isNaN(rope.start.x) ? bounds.minX + 50 : rope.start.x));
        const startY = Math.max(bounds.minY, Math.min(bounds.maxY, 
          isNaN(rope.start.y) ? bounds.minY + 50 : rope.start.y));
        const endX = Math.max(bounds.minX, Math.min(bounds.maxX, 
          isNaN(rope.end.x) ? bounds.maxX - 50 : rope.end.x));
        const endY = Math.max(bounds.minY, Math.min(bounds.maxY, 
          isNaN(rope.end.y) ? bounds.maxY - 50 : rope.end.y));
        
        positions[rope.id] = { startX, startY, endX, endY };
      });

      const initialIntersections = countIntersections(generatedRopes);

      // Set completely fresh state
      set({
        ropes: generatedRopes,
        ropePositions: positions,
        intersectionCount: initialIntersections,
        isCompleted: false,
        bounds,
        isDragging: false,
        isInitialized: true,
        dragCount: 0,
        currentLevel: level,
      });

      console.log(`Level ${level} initialized with ${generatedRopes.length} ropes and ${initialIntersections} intersections`);
    } catch (error) {
      console.error('Failed to initialize level:', error);
      // Fallback to clean state
      get().cleanupLevel();
      set({
        ...initialState,
        bounds,
        isInitialized: true,
        currentLevel: level,
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
      }, 50);
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
      }, 100);
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
    console.log('Resetting rope level');
    const { bounds, currentLevel } = get();
    if (bounds && currentLevel > 0) {
      // Clean up current data and re-initialize fresh
      get().cleanupLevel();
      get().initializeLevel(currentLevel, bounds);
    } else {
      // Reset to initial state if no bounds
      set(initialState);
    }
  },

  cleanupLevel: () => {
    console.log('Cleaning up level data to prevent memory leaks');
    
    // Clear all rope data
    set({
      ropes: [],
      ropePositions: {},
      intersectionCount: 0,
      isCompleted: false,
      isDragging: false,
      isInitialized: false,
      dragCount: 0,
    });
    
    // Force garbage collection hint (if available)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  },

  clearAll: () => {
    console.log('Clearing all rope data');
    get().cleanupLevel();
    set(initialState);
  },
}));