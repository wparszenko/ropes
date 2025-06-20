import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLevelData } from '@/data/levels';

export interface PlayerStats {
  completedLevels: number;
  totalStars: number;
  levelStars: { [key: number]: number };
  totalPlayTime: number;
  highestUnlockedLevel: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  showHints: boolean;
}

export interface GameState {
  currentLevel: number;
  gameState: 'playing' | 'completed' | 'failed' | 'paused';
  levelState: 'fresh' | 'playing' | 'completed' | 'failed'; // New level-specific state
  playerStats: PlayerStats;
  settings: GameSettings;
  wireConnections: { [key: string]: boolean };
  robotPosition: { x: number; y: number };
  portalActive: boolean;
  timeRemaining: number;
}

interface GameStore extends GameState {
  setCurrentLevel: (level: number) => void;
  resetLevel: () => void;
  startLevel: () => void; // New method to explicitly start a level
  completeLevel: (stars: number) => void;
  failLevel: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetProgress: () => Promise<void>;
  updateWireConnection: (wireId: string, connected: boolean) => void;
  updateRobotPosition: (position: { x: number; y: number }) => void;
  activatePortal: () => void;
  getCurrentLevelData: () => any;
  saveGameState: () => void;
  loadGameState: () => void;
  getMaxStarsForLevel: (level: number) => number;
  isLevelUnlocked: (level: number) => boolean;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  getLevelTimer: (level: number) => number;
  calculateStarsForTime: (level: number, completionTime: number) => number;
}

const initialState: GameState = {
  currentLevel: 1,
  gameState: 'playing',
  levelState: 'fresh', // New field
  playerStats: {
    completedLevels: 0,
    totalStars: 0,
    levelStars: {},
    totalPlayTime: 0,
    highestUnlockedLevel: 1,
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    hapticEnabled: true,
    showHints: true,
  },
  wireConnections: {},
  robotPosition: { x: 100, y: 100 },
  portalActive: false,
  timeRemaining: 10, // Will be set dynamically based on level
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  getLevelTimer: (level: number) => {
    // Timer = number of ropes * 5 seconds
    const ropeCount = Math.min(level + 1, 10);
    return ropeCount * 5;
  },

  calculateStarsForTime: (level: number, completionTime: number) => {
    const totalTime = get().getLevelTimer(level);
    const timePerStar = Math.floor(totalTime / 3);
    
    if (completionTime <= timePerStar) {
      return 3; // 3 stars
    } else if (completionTime <= timePerStar * 2) {
      return 2; // 2 stars
    } else if (completionTime <= timePerStar * 3) {
      return 1; // 1 star
    } else {
      return 0; // 0 stars
    }
  },

  setCurrentLevel: (level: number) => {
    const { isLevelUnlocked, getLevelTimer } = get();
    if (isLevelUnlocked(level)) {
      const levelTime = getLevelTimer(level);
      set({ 
        currentLevel: level, 
        gameState: 'playing',
        levelState: 'fresh', // Reset level state
        portalActive: false,
        timeRemaining: levelTime,
        wireConnections: {},
        robotPosition: { x: 100, y: 100 }
      });
    }
  },

  startLevel: () => {
    const { levelState, currentLevel, getLevelTimer } = get();
    // Only start if level is fresh or we're explicitly restarting
    if (levelState === 'fresh' || levelState === 'failed') {
      const levelTime = getLevelTimer(currentLevel);
      set({ 
        gameState: 'playing',
        levelState: 'playing',
        timeRemaining: levelTime,
        wireConnections: {},
        portalActive: false,
        robotPosition: { x: 100, y: 100 }
      });
    }
  },

  resetLevel: () => {
    const { currentLevel, getLevelTimer } = get();
    const levelTime = getLevelTimer(currentLevel);
    set({ 
      gameState: 'playing',
      levelState: 'fresh', // Reset to fresh state
      wireConnections: {},
      portalActive: false,
      robotPosition: { x: 100, y: 100 },
      timeRemaining: levelTime
    });
  },

  completeLevel: (stars: number) => {
    const { currentLevel, playerStats, getMaxStarsForLevel, levelState } = get();
    
    // Only complete if currently playing to prevent multiple completions
    if (levelState !== 'playing') return;
    
    const maxStars = getMaxStarsForLevel(currentLevel);
    const actualStars = Math.min(stars, maxStars);
    
    const newLevelStars = { ...playerStats.levelStars };
    const previousStars = newLevelStars[currentLevel] || 0;
    
    newLevelStars[currentLevel] = Math.max(previousStars, actualStars);
    
    const newStats: PlayerStats = {
      ...playerStats,
      completedLevels: Math.max(playerStats.completedLevels, currentLevel),
      totalStars: Object.values(newLevelStars).reduce((sum, s) => sum + s, 0),
      levelStars: newLevelStars,
      highestUnlockedLevel: Math.max(playerStats.highestUnlockedLevel, currentLevel + 1),
    };

    set({ 
      gameState: 'completed',
      levelState: 'completed',
      playerStats: newStats,
    });
    
    get().saveGameState();
  },

  failLevel: () => {
    const { levelState } = get();
    // Only fail if currently playing to prevent multiple failures
    if (levelState === 'playing') {
      set({ 
        gameState: 'failed',
        levelState: 'failed'
      });
    }
  },

  updateSettings: (newSettings: Partial<GameSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
    get().saveGameState();
  },

  resetProgress: async () => {
    try {
      console.log('Starting progress reset...');
      
      // Clear ALL AsyncStorage keys related to the game
      const keys = await AsyncStorage.getAllKeys();
      const gameKeys = keys.filter(key => 
        key.includes('tangleEscape') || 
        key.includes('gameState') || 
        key.includes('rope') ||
        key.includes('level')
      );
      
      if (gameKeys.length > 0) {
        await AsyncStorage.multiRemove(gameKeys);
        console.log('Cleared AsyncStorage keys:', gameKeys);
      }
      
      // Also try to remove the specific key we use
      await AsyncStorage.removeItem('tangleEscapeGameState');
      
      // Reset to complete initial state but preserve settings
      const currentSettings = get().settings;
      
      // Force a complete reset
      set({
        currentLevel: 1,
        gameState: 'playing',
        levelState: 'fresh',
        playerStats: {
          completedLevels: 0,
          totalStars: 0,
          levelStars: {},
          totalPlayTime: 0,
          highestUnlockedLevel: 1,
        },
        settings: currentSettings, // Preserve user settings
        wireConnections: {},
        robotPosition: { x: 100, y: 100 },
        portalActive: false,
        timeRemaining: get().getLevelTimer(1), // Set initial timer for level 1
      });
      
      console.log('Progress reset completed successfully');
      
    } catch (error) {
      console.error('Failed to reset progress:', error);
      
      // Fallback: force reset state even if AsyncStorage fails
      const currentSettings = get().settings;
      set({
        currentLevel: 1,
        gameState: 'playing',
        levelState: 'fresh',
        playerStats: {
          completedLevels: 0,
          totalStars: 0,
          levelStars: {},
          totalPlayTime: 0,
          highestUnlockedLevel: 1,
        },
        settings: currentSettings,
        wireConnections: {},
        robotPosition: { x: 100, y: 100 },
        portalActive: false,
        timeRemaining: get().getLevelTimer(1),
      });
      
      throw error; // Re-throw to let the UI handle the error
    }
  },

  updateWireConnection: (wireId: string, connected: boolean) => {
    set((state) => ({
      wireConnections: {
        ...state.wireConnections,
        [wireId]: connected
      }
    }));
  },

  updateRobotPosition: (position: { x: number; y: number }) => {
    set({ robotPosition: position });
  },

  activatePortal: () => {
    set({ portalActive: true });
  },

  getCurrentLevelData: () => {
    const { currentLevel } = get();
    return getLevelData(currentLevel);
  },

  getMaxStarsForLevel: (level: number) => {
    // All levels can now have up to 3 stars based on completion time
    return 3;
  },

  isLevelUnlocked: (level: number) => {
    const { playerStats } = get();
    return level <= playerStats.highestUnlockedLevel;
  },

  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },

  decrementTime: () => {
    const { timeRemaining, levelState, failLevel } = get();
    
    // Only decrement if currently playing
    if (levelState === 'playing' && timeRemaining > 0) {
      const newTime = timeRemaining - 1;
      set({ timeRemaining: newTime });
      
      // Fail level when time runs out, but only if still playing
      if (newTime <= 0 && get().levelState === 'playing') {
        failLevel();
      }
    }
  },

  saveGameState: async () => {
    try {
      const state = get();
      const dataToSave = {
        currentLevel: state.currentLevel,
        playerStats: state.playerStats,
        settings: state.settings,
      };
      await AsyncStorage.setItem('tangleEscapeGameState', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  },

  loadGameState: async () => {
    try {
      const savedState = await AsyncStorage.getItem('tangleEscapeGameState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const { getLevelTimer } = get();
        const levelTime = getLevelTimer(parsedState.currentLevel || 1);
        
        set((state) => ({
          ...state,
          currentLevel: parsedState.currentLevel || 1,
          levelState: 'fresh', // Always start fresh when loading
          timeRemaining: levelTime, // Set timer based on current level
          playerStats: {
            ...initialState.playerStats,
            ...parsedState.playerStats,
            highestUnlockedLevel: parsedState.playerStats?.highestUnlockedLevel || Math.max(1, parsedState.playerStats?.completedLevels + 1 || 1),
          },
          settings: parsedState.settings || initialState.settings,
        }));
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  },
}));