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
}

export const levelData: LevelData[] = [
  // Level 1 - Simple crossing (2 ropes)
  {
    levelId: 1,
    wires: [
      {
        id: 'rope1',
        start: [80, 150],
        end: [280, 250],
        color: '#E74C3C',
      },
      {
        id: 'rope2',
        start: [80, 250],
        end: [280, 150],
        color: '#3498DB',
      },
    ],
    goals: {
      connectAll: true,
    },
    difficulty: 'easy',
  },

  // Level 2 - Three ropes triangle
  {
    levelId: 2,
    wires: [
      {
        id: 'rope1',
        start: [60, 120],
        end: [300, 280],
        color: '#E74C3C',
      },
      {
        id: 'rope2',
        start: [180, 100],
        end: [100, 300],
        color: '#3498DB',
      },
      {
        id: 'rope3',
        start: [300, 120],
        end: [60, 280],
        color: '#2ECC71',
      },
    ],
    goals: {
      connectAll: true,
    },
    difficulty: 'easy',
  },

  // Level 3 - Four ropes crossing
  {
    levelId: 3,
    wires: [
      {
        id: 'rope1',
        start: [80, 120],
        end: [280, 120],
        color: '#E74C3C',
      },
      {
        id: 'rope2',
        start: [280, 160],
        end: [80, 160],
        color: '#3498DB',
      },
      {
        id: 'rope3',
        start: [80, 200],
        end: [280, 200],
        color: '#2ECC71',
      },
      {
        id: 'rope4',
        start: [280, 240],
        end: [80, 240],
        color: '#F39C12',
      },
    ],
    goals: {
      connectAll: true,
    },
    difficulty: 'medium',
  },

  // Level 4 - Star pattern (5 ropes)
  {
    levelId: 4,
    wires: [
      {
        id: 'rope1',
        start: [180, 100],
        end: [120, 250],
        color: '#E74C3C',
      },
      {
        id: 'rope2',
        start: [240, 250],
        end: [80, 180],
        color: '#3498DB',
      },
      {
        id: 'rope3',
        start: [280, 180],
        end: [180, 100],
        color: '#2ECC71',
      },
      {
        id: 'rope4',
        start: [240, 250],
        end: [280, 180],
        color: '#F39C12',
      },
      {
        id: 'rope5',
        start: [120, 250],
        end: [80, 180],
        color: '#9B59B6',
      },
    ],
    goals: {
      connectAll: true,
    },
    difficulty: 'medium',
  },

  // Level 5 - Complex web (6 ropes)
  {
    levelId: 5,
    wires: [
      {
        id: 'rope1',
        start: [60, 100],
        end: [300, 300],
        color: '#E74C3C',
      },
      {
        id: 'rope2',
        start: [300, 100],
        end: [60, 300],
        color: '#3498DB',
      },
      {
        id: 'rope3',
        start: [60, 200],
        end: [300, 200],
        color: '#2ECC71',
      },
      {
        id: 'rope4',
        start: [180, 100],
        end: [180, 300],
        color: '#F39C12',
      },
      {
        id: 'rope5',
        start: [120, 150],
        end: [240, 250],
        color: '#9B59B6',
      },
      {
        id: 'rope6',
        start: [240, 150],
        end: [120, 250],
        color: '#E67E22',
      },
    ],
    goals: {
      connectAll: true,
    },
    difficulty: 'hard',
  },
];

// Generate additional levels procedurally
export const generateLevel = (difficulty: 'easy' | 'medium' | 'hard', levelId: number): LevelData => {
  const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#E67E22', '#1ABC9C', '#34495E'];
  const ropeCount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;

  const wires: Wire[] = [];
  const centerX = 180;
  const centerY = 200;
  const radius = 120;

  // Create ropes in patterns that will intersect
  for (let i = 0; i < ropeCount; i++) {
    const angle1 = (i * 2 * Math.PI) / ropeCount;
    const angle2 = ((i + ropeCount / 2) * 2 * Math.PI) / ropeCount;
    
    const startX = centerX + Math.cos(angle1) * radius;
    const startY = centerY + Math.sin(angle1) * radius;
    const endX = centerX + Math.cos(angle2) * radius;
    const endY = centerY + Math.sin(angle2) * radius;

    wires.push({
      id: `rope${i + 1}`,
      start: [Math.max(60, Math.min(300, startX)), Math.max(100, Math.min(300, startY))],
      end: [Math.max(60, Math.min(300, endX)), Math.max(100, Math.min(300, endY))],
      color: colors[i % colors.length],
    });
  }

  return {
    levelId,
    wires,
    goals: {
      connectAll: true,
    },
    difficulty,
  };
};

// Extend levelData with procedurally generated levels
for (let i = 6; i <= 30; i++) {
  const difficulty = i <= 10 ? 'easy' : i <= 20 ? 'medium' : 'hard';
  levelData.push(generateLevel(difficulty, i));
}