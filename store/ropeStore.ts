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
  currentLevel: number;
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
  cleanupLevel: () => void;
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

// Global timeout management to prevent memory leaks
let intersectionCheckTimeout: NodeJS.Timeout | null = null;
let positionUpdateTimeout: NodeJS.Timeout | null = null;
let lastIntersectionCheck = 0;
const INTERSECTION_CHECK_DEBOUNCE = 150; // Increased debounce for better performance
const MIN_CHECK_INTERVAL = 100; // Increased minimum interval

// Cleanup function to clear all timeouts
const clearAllTimeouts = () => {
  if (intersectionCheckTimeout) {
    clearTimeout(intersectionCheckTimeout);
    intersectionCheckTimeout = null;
  }
  if (positionUpdateTimeout) {
    clearTimeout(positionUpdateTimeout);
    positionUpdateTimeout = null;
  }
};

export const useRopeStore = create<RopeStore>((set, get) => ({
  ...initialState,

  initializeLevel: (level: number, bounds: GameBounds) => {
    try {
      console.log('Initializing rope level', level);
      
      // Clear all timeouts first to prevent memory leaks
      clearAllTimeouts();
      
      // Clean up previous level data
      const currentState = get();
      if (currentState.currentLevel !== level && currentState.currentLevel > 0) {
        console.log('Level changed, cleaning up previous level data');
        get().cleanupLevel();
      }
      
      const ropeCount = Math.min(level + 1, 10);
      
      // Generate fresh ropes
      const generatedRopes = generateCrossedRopes(ropeCount, bounds);
      
      // Create fresh positions with validation
      const positions: { [ropeId: string]: RopePosition } = {};
      generatedRopes.forEach(rope => {
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

      // Set fresh state
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
    
    // Debounced intersection checking with proper cleanup
    const now = Date.now();
    if (!state.isDragging && now - lastIntersectionCheck > MIN_CHECK_INTERVAL) {
      if (intersectionCheckTimeout) {
        clearTimeout(intersectionCheckTimeout);
      }
      
      intersectionCheckTimeout = setTimeout(() => {
        lastIntersectionCheck = Date.now();
        const currentState = get();
        if (currentState.isInitialized && !currentState.isDragging) {
          get().checkIntersections();
        }
        intersectionCheckTimeout = null; // Clear reference
      }, INTERSECTION_CHECK_DEBOUNCE);
    }
  },

  checkIntersections: () => {
    const state = get();
    
    if (state.isDragging || !state.isInitialized || state.ropes.length === 0) {
      return state.intersectionCount;
    }
    
    try {
      const currentRopes = get().getCurrentRopes();
      const newIntersectionCount = countIntersections(currentRopes);
      const isCompleted = newIntersectionCount === 0 && currentRopes.length > 0 && state.dragCount === 0;

      // Only update state if values changed
      if (newIntersectionCount !== state.intersectionCount || isCompleted !== state.isCompleted) {
        set({
          intersectionCount: newIntersectionCount,
          isCompleted,
        });
      }

      return newIntersectionCount;
    } catch (error) {
      console.error('Error checking intersections:', error);
      return state.intersectionCount;
    }
  },

  getCurrentRopes: () => {
    const { ropes, ropePositions } = get();
    
    return ropes.map(rope => {
      const position = ropePositions[rope.id];
      if (!position) return rope;
      
      return {
        ...rope,
        start: {
          x: position.startX,
          y: position.startY,
        },
        end: {
          x: position.endX,
          y: position.endY,
        },
      };
    });
  },

  setDragging: (dragging: boolean) => {
    const state = get();
    const newDragCount = dragging ? state.dragCount + 1 : Math.max(0, state.dragCount - 1);
    const isDragging = newDragCount > 0;
    
    set({ 
      isDragging,
      dragCount: newDragCount,
    });
    
    // Check intersections when dragging stops with proper cleanup
    if (newDragCount === 0) {
      if (intersectionCheckTimeout) {
        clearTimeout(intersectionCheckTimeout);
      }
      
      intersectionCheckTimeout = setTimeout(() => {
        const currentState = get();
        if (currentState.isInitialized && !currentState.isDragging) {
          get().checkIntersections();
        }
        intersectionCheckTimeout = null;
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
    
    // Clear all timeouts
    clearAllTimeouts();
    
    const { bounds, currentLevel } = get();
    if (bounds && currentLevel > 0) {
      get().cleanupLevel();
      get().initializeLevel(currentLevel, bounds);
    } else {
      set(initialState);
    }
  },

  cleanupLevel: () => {
    console.log('Cleaning up level data to prevent memory leaks');
    
    // Clear all timeouts
    clearAllTimeouts();
    
    // Reset timing variables
    lastIntersectionCheck = 0;
    
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
    
    // Force garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  },

  clearAll: () => {
    console.log('Clearing all rope data');
    
    // Clear all timeouts
    clearAllTimeouts();
    
    lastIntersectionCheck = 0;
    get().cleanupLevel();
    set(initialState);
  },
}));