export interface Wire {
  id: string;
  start: [number, number];
  end: [number, number];
  color: string;
  connected: boolean;
}

export interface Socket {
  id: string;
  position: [number, number];
  color: string;
  connected: boolean;
}

export interface Obstacle {
  id: string;
  type: 'static' | 'rotating' | 'moving';
  position: [number, number];
  size: [number, number];
  rotation?: number;
  speed?: number;
}

export interface LevelData {
  levelId: number;
  wires: Wire[];
  sockets: Socket[];
  obstacles: Obstacle[];
  robotStart: [number, number];
  portalPosition: [number, number];
  goals: {
    connectAll: boolean;
    timeLimit?: number;
    maxMoves?: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export const levelData: LevelData[] = [
  // Level 1 - Tutorial
  {
    levelId: 1,
    wires: [
      {
        id: 'wire1',
        start: [80, 200],
        end: [280, 200],
        color: '#18FF92',
        connected: false,
      },
    ],
    sockets: [
      {
        id: 'socket1',
        position: [280, 200],
        color: '#18FF92',
        connected: false,
      },
    ],
    obstacles: [],
    robotStart: [50, 150],
    portalPosition: [320, 150],
    goals: {
      connectAll: true,
    },
    difficulty: 'easy',
  },

  // Level 2 - Two wires
  {
    levelId: 2,
    wires: [
      {
        id: 'wire1',
        start: [80, 180],
        end: [280, 180],
        color: '#18FF92',
        connected: false,
      },
      {
        id: 'wire2',
        start: [80, 280],
        end: [280, 280],
        color: '#00E0FF',
        connected: false,
      },
    ],
    sockets: [
      {
        id: 'socket1',
        position: [280, 180],
        color: '#18FF92',
        connected: false,
      },
      {
        id: 'socket2',
        position: [280, 280],
        color: '#00E0FF',
        connected: false,
      },
    ],
    obstacles: [],
    robotStart: [50, 230],
    portalPosition: [320, 230],
    goals: {
      connectAll: true,
    },
    difficulty: 'easy',
  },

  // Level 3 - First obstacle
  {
    levelId: 3,
    wires: [
      {
        id: 'wire1',
        start: [80, 200],
        end: [280, 200],
        color: '#18FF92',
        connected: false,
      },
    ],
    sockets: [
      {
        id: 'socket1',
        position: [280, 200],
        color: '#18FF92',
        connected: false,
      },
    ],
    obstacles: [
      {
        id: 'obstacle1',
        type: 'static',
        position: [180, 180],
        size: [40, 40],
      },
    ],
    robotStart: [50, 150],
    portalPosition: [320, 150],
    goals: {
      connectAll: true,
    },
    difficulty: 'easy',
  },

  // Level 4 - Complex routing
  {
    levelId: 4,
    wires: [
      {
        id: 'wire1',
        start: [80, 160],
        end: [280, 240],
        color: '#18FF92',
        connected: false,
      },
      {
        id: 'wire2',
        start: [80, 240],
        end: [280, 160],
        color: '#FF5050',
        connected: false,
      },
    ],
    sockets: [
      {
        id: 'socket1',
        position: [280, 240],
        color: '#18FF92',
        connected: false,
      },
      {
        id: 'socket2',
        position: [280, 160],
        color: '#FF5050',
        connected: false,
      },
    ],
    obstacles: [
      {
        id: 'obstacle1',
        type: 'static',
        position: [160, 180],
        size: [30, 30],
      },
      {
        id: 'obstacle2',
        type: 'static',
        position: [200, 220],
        size: [30, 30],
      },
    ],
    robotStart: [50, 200],
    portalPosition: [320, 200],
    goals: {
      connectAll: true,
    },
    difficulty: 'medium',
  },

  // Level 5 - Rotating obstacle
  {
    levelId: 5,
    wires: [
      {
        id: 'wire1',
        start: [80, 200],
        end: [280, 200],
        color: '#B347FF',
        connected: false,
      },
    ],
    sockets: [
      {
        id: 'socket1',
        position: [280, 200],
        color: '#B347FF',
        connected: false,
      },
    ],
    obstacles: [
      {
        id: 'obstacle1',
        type: 'rotating',
        position: [180, 200],
        size: [60, 20],
        rotation: 0,
        speed: 1,
      },
    ],
    robotStart: [50, 150],
    portalPosition: [320, 150],
    goals: {
      connectAll: true,
    },
    difficulty: 'medium',
  },
];

// Generate additional levels procedurally
export const generateLevel = (difficulty: 'easy' | 'medium' | 'hard', levelId: number): LevelData => {
  const colors = ['#18FF92', '#00E0FF', '#FF5050', '#B347FF', '#FFE347'];
  const wireCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const obstacleCount = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 2 : 4;

  const wires: Wire[] = [];
  const sockets: Socket[] = [];
  const obstacles: Obstacle[] = [];

  // Generate wires and sockets
  for (let i = 0; i < wireCount; i++) {
    const color = colors[i % colors.length];
    const startY = 150 + (i * 80);
    const endY = 150 + (i * 80);

    wires.push({
      id: `wire${i + 1}`,
      start: [80, startY],
      end: [280, endY],
      color,
      connected: false,
    });

    sockets.push({
      id: `socket${i + 1}`,
      position: [280, endY],
      color,
      connected: false,
    });
  }

  // Generate obstacles
  for (let i = 0; i < obstacleCount; i++) {
    obstacles.push({
      id: `obstacle${i + 1}`,
      type: Math.random() > 0.7 ? 'rotating' : 'static',
      position: [120 + (i * 60), 180 + (i * 40)],
      size: [30, 30],
      rotation: 0,
      speed: 1,
    });
  }

  return {
    levelId,
    wires,
    sockets,
    obstacles,
    robotStart: [50, 200],
    portalPosition: [320, 200],
    goals: {
      connectAll: true,
      timeLimit: difficulty === 'hard' ? 60 : undefined,
    },
    difficulty,
  };
};

// Extend levelData with procedurally generated levels
for (let i = 6; i <= 30; i++) {
  const difficulty = i <= 10 ? 'easy' : i <= 20 ? 'medium' : 'hard';
  levelData.push(generateLevel(difficulty, i));
}