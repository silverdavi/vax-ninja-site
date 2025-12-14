// Game constants and configuration
export const GAME_CONFIG = {
  width: 800,
  height: 600,
  tileSize: 24,
  
  // Colors matching the site theme
  colors: {
    bg: 0x1a0a2e,
    bgElevated: 0x2d1b4e,
    bgSurface: 0x3d2b5e,
    text: 0xe8e8e8,
    textMuted: 0x9a8ab0,
    accent: 0xff6b9d,
    virusGreen: 0x39ff14,
    syringeBlue: 0x00d4ff,
    warning: 0xffe66d,
    danger: 0xff4444,
    wall: 0x2d1b4e,
    path: 0x1a0a2e,
    lowO2: 0xff6b9d, // Pink overlay when O2 low
  },
  
  // Player settings
  player: {
    speed: 160,
    size: 24,
  },
  
  // Doctor settings
  doctor: {
    speed: 120,
    size: 24,
  },
  
  // Disease levels
  levels: [
    {
      id: 'covid',
      name: 'COVID-19',
      emoji: '🦠',
      debuff: 'Need O₂ packs!',
      debuffDesc: 'Collect oxygen tanks every 10 seconds or lose health',
      color: 0x39ff14,
      collectibleCount: 15,
    },
    {
      id: 'measles',
      name: 'Measles',
      emoji: '🔴',
      debuff: 'Vision blur!',
      debuffDesc: 'Screen progressively blurs',
      color: 0xff4444,
      collectibleCount: 18,
    },
    {
      id: 'polio',
      name: 'Polio',
      emoji: '🦽',
      debuff: 'Limp!',
      debuffDesc: 'Periodic slowdowns - your leg gives out!',
      color: 0x9a8ab0,
      collectibleCount: 12,
    },
    {
      id: 'smallpox',
      name: 'Smallpox',
      emoji: '💀',
      debuff: 'One-hit KO!',
      debuffDesc: 'Doctor catches you = instant game over',
      color: 0xffe66d,
      collectibleCount: 16,
    },
    {
      id: 'tetanus',
      name: 'Tetanus',
      emoji: '🔒',
      debuff: 'Random freeze!',
      debuffDesc: 'Randomly freeze in place',
      color: 0xff6b9d,
      collectibleCount: 14,
    },
    {
      id: 'whooping',
      name: 'Whooping Cough',
      emoji: '😮‍💨',
      debuff: "Can't stop!",
      debuffDesc: 'Keep moving until hitting a wall',
      color: 0x00d4ff,
      collectibleCount: 14,
    },
  ],
};

// Game settings (persisted)
export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard'; // AI speed: -10%, 0%, +10%
  musicVolume: number; // 0-1
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normal',
  musicVolume: 0.15,
  soundEnabled: true,
};

// Load/save settings
export function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem('vaxninja_settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    // Ignore
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem('vaxninja_settings', JSON.stringify(settings));
  } catch (e) {
    // Ignore
  }
}

// Maze templates with WRAPAROUND TUNNELS at corners
// 0 = path, 1 = wall, 2 = player start, 3 = doctor start
// Corners (0,0), (0,24), (18,0), (18,24) are open for wraparound
export const MAZES = {
  covid: [
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,2,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [0,0,0,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0],
    [1,1,1,0,1,0,1,1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  ],
  measles: [
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,1,1,0,0,0,1,0,1,1,1,0,1,0,0,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  ],
  polio: [
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  ],
};

// Use covid maze for other levels too (they all have same structure)
(MAZES as Record<string, number[][]>).smallpox = MAZES.covid;
(MAZES as Record<string, number[][]>).tetanus = MAZES.measles;
(MAZES as Record<string, number[][]>).whooping = MAZES.polio;
