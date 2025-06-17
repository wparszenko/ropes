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
}

const initialState: GameState = {
  currentLevel: 1,
  gameState: 'playing',
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
  timeRemaining: 30,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setCurrentLevel: (level: number) => {
    const { isLevelUnlocked } = get();
    if (isLevelUnlocked(level)) {
      set({ 
        currentLevel: level, 
        gameState: 'playing', 
        portalActive: false,
        timeRemaining: 30,
        wireConnections: {},
        robotPosition: { x: 100, y: 100 }
      });
    }
  },

  resetLevel: () => {
    set({ 
      gameState: 'playing', 
      wireConnections: {},
      portalActive: false,
      robotPosition: { x: 100, y: 100 },
      timeRemaining: 30
    });
  },

  completeLevel: (stars: number) => {
    const { currentLevel, playerStats, getMaxStarsForLevel } = get();
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
      playerStats: newStats,
    });
    
    get().saveGameState();
  },

  failLevel: () => {
    const { gameState } = get();
    // Only fail if currently playing
    if (gameState === 'playing') {
      set({ gameState: 'failed' });
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
        timeRemaining: 30,
      });
      
      console.log('Progress reset completed successfully');
      
    } catch (error) {
      console.error('Failed to reset progress:', error);
      
      // Fallback: force reset state even if AsyncStorage fails
      const currentSettings = get().settings;
      set({
        currentLevel: 1,
        gameState: 'playing',
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
        timeRemaining: 30,
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
    // Progressive star system based on difficulty
    if (level <= 5) return 1;      // Easy levels: max 1 star
    if (level <= 15) return 2;     // Medium levels: max 2 stars  
    return 3;                      // Hard levels: max 3 stars
  },

  isLevelUnlocked: (level: number) => {
    const { playerStats } = get();
    return level <= playerStats.highestUnlockedLevel;
  },

  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },

  decrementTime: () => {
    const { timeRemaining, gameState, failLevel } = get();
    if (gameState === 'playing' && timeRemaining > 0) {
      const newTime = timeRemaining - 1;
      set({ timeRemaining: newTime });
      
      // Fail level when time runs out
      if (newTime <= 0) {
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
        set((state) => ({
          ...state,
          currentLevel: parsedState.currentLevel || 1,
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