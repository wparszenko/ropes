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

// Performance optimization: Debounce intersection checks
let intersectionCheckTimeout: NodeJS.Timeout | null = null;
let lastIntersectionCheck = 0;
const INTERSECTION_CHECK_DEBOUNCE = 100; // ms
const MIN_CHECK_INTERVAL = 50; // ms

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
    
    // Performance optimization: Debounced intersection checking
    const now = Date.now();
    if (state.dragCount === 0 && now - lastIntersectionCheck > MIN_CHECK_INTERVAL) {
      if (intersectionCheckTimeout) {
        clearTimeout(intersectionCheckTimeout);
      }
      
      intersectionCheckTimeout = setTimeout(() => {
        lastIntersectionCheck = Date.now();
        get().checkIntersections();
      }, INTERSECTION_CHECK_DEBOUNCE);
    }
  },

  checkIntersections: () => {
    const state = get();
    
    // Performance optimization: Skip if dragging or not initialized
    if (state.isDragging || !state.isInitialized || state.ropes.length === 0) {
      return state.intersectionCount;
    }
    
    const currentRopes = get().getCurrentRopes();
    const newIntersectionCount = countIntersections(currentRopes);
    const isCompleted = newIntersectionCount === 0 && currentRopes.length > 0 && state.dragCount === 0;

    // Only update state if values actually changed
    if (newIntersectionCount !== state.intersectionCount || isCompleted !== state.isCompleted) {
      set({
        intersectionCount: newIntersectionCount,
        isCompleted,
      });
    }

    return newIntersectionCount;
  },

  getCurrentRopes: () => {
    const { ropes, ropePositions } = get();
    
    // Performance optimization: Use cached result if positions haven't changed
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
    
    // Performance optimization: Only check intersections when all dragging ends
    if (newDragCount === 0) {
      // Clear any pending intersection checks
      if (intersectionCheckTimeout) {
        clearTimeout(intersectionCheckTimeout);
      }
      
      // Immediate check when dragging stops
      setTimeout(() => {
        get().checkIntersections();
      }, 50);
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
    
    // Clear any pending intersection checks
    if (intersectionCheckTimeout) {
      clearTimeout(intersectionCheckTimeout);
    }
    
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
    
    // Clear any pending intersection checks
    if (intersectionCheckTimeout) {
      clearTimeout(intersectionCheckTimeout);
      intersectionCheckTimeout = null;
    }
    
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
    
    // Force garbage collection hint (if available)
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  },

  clearAll: () => {
    console.log('Clearing all rope data');
    
    // Clear any pending intersection checks
    if (intersectionCheckTimeout) {
      clearTimeout(intersectionCheckTimeout);
      intersectionCheckTimeout = null;
    }
    
    lastIntersectionCheck = 0;
    get().cleanupLevel();
    set(initialState);
  },
}));