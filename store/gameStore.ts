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
}

interface GameStore extends GameState {
  setCurrentLevel: (level: number) => void;
  resetLevel: () => void;
  completeLevel: (stars: number) => void;
  failLevel: () => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetProgress: () => void;
  updateWireConnection: (wireId: string, connected: boolean) => void;
  updateRobotPosition: (position: { x: number; y: number }) => void;
  activatePortal: () => void;
  getCurrentLevelData: () => any;
  saveGameState: () => void;
  loadGameState: () => void;
  getMaxStarsForLevel: (level: number) => number;
  isLevelUnlocked: (level: number) => boolean;
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
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setCurrentLevel: (level: number) => {
    const { isLevelUnlocked } = get();
    if (isLevelUnlocked(level)) {
      set({ currentLevel: level, gameState: 'playing', portalActive: false });
    }
  },

  resetLevel: () => {
    set({ 
      gameState: 'playing', 
      wireConnections: {},
      portalActive: false,
      robotPosition: { x: 100, y: 100 }
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
    set({ gameState: 'failed' });
  },

  updateSettings: (newSettings: Partial<GameSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
    get().saveGameState();
  },

  resetProgress: () => {
    set({
      ...initialState,
      settings: get().settings, // Keep settings
    });
    get().saveGameState();
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
    // Progressive star system: lower levels have fewer max stars
    if (level <= 5) return 2;      // Levels 1-5: max 2 stars
    if (level <= 15) return 3;     // Levels 6-15: max 3 stars
    return 4;                      // Levels 16+: max 4 stars
  },

  isLevelUnlocked: (level: number) => {
    const { playerStats } = get();
    return level <= playerStats.highestUnlockedLevel;
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