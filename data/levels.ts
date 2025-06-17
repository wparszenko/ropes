export interface Wire {
  id: string;
  start: [number, number];
  end: [number, number];
  color: string;
}

export interface LevelData {
  levelId: number;
  wires: Wire[];
  goals: {
    connectAll: boolean;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  ropeCount: number;
}

// Generate level data dynamically based on level number
export const getLevelData = (levelId: number): LevelData => {
  const ropeCount = Math.min(levelId + 1, 10); // Start with 2 ropes, max 10
  
  let difficulty: 'easy' | 'medium' | 'hard';
  if (levelId <= 3) {
    difficulty = 'easy';
  } else if (levelId <= 7) {
    difficulty = 'medium';
  } else {
    difficulty = 'hard';
  }

  return {
    levelId,
    wires: [], // Will be generated dynamically in GameBoard
    goals: {
      connectAll: true,
    },
    difficulty,
    ropeCount,
  };
};

// Legacy support - generate static level data for levels 1-30
export const levelData: LevelData[] = [];
for (let i = 1; i <= 30; i++) {
  levelData.push(getLevelData(i));
}