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
    {
      id: 'mumps',
      name: 'Mumps',
      emoji: '🐹',
      debuff: 'Swollen!',
      debuffDesc: 'Player moves slower and is bigger (easier to catch)',
      color: 0xffa500,
      collectibleCount: 16,
    },
    {
      id: 'rubella',
      name: 'Rubella',
      emoji: '🌸',
      debuff: 'Dizzy!',
      debuffDesc: 'Controls are sometimes reversed',
      color: 0xff69b4,
      collectibleCount: 18,
    },
    {
      id: 'hepatitis',
      name: 'Hepatitis B',
      emoji: '🟡',
      debuff: 'Fatigue!',
      debuffDesc: 'Periodic energy crashes - stop for 2 seconds',
      color: 0xffff00,
      collectibleCount: 20,
    },
  ],
};

// Game settings (persisted)
export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  musicVolume: number; // 0-1
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normal',
  musicVolume: 0.15,
  soundEnabled: true,
};

/**
 * Difficulty multipliers - calculated based on level completion time
 * 
 * MATH:
 * - Player: 160 px/s, tile: ~20px → 8 tiles/sec
 * - Level: ~15 collectibles, ~8 tiles apart avg → 120 tiles to traverse
 * - Base completion time: 120/8 = 15 seconds (no dodging)
 * - With dodging/backtracking: 30-45 seconds realistically
 * 
 * O2 should last long enough to complete with 1-2 tank pickups
 */
export const DIFFICULTY_CONFIG = {
  easy: {
    doctorSpeedMult: 0.85,      // Doctor 15% slower
    o2DrainPerTick: 0.66,       // ~3.3%/sec → 30 sec to drain
    o2TankCount: 6,             // More tanks available
    o2RefillAmount: 50,         // Each tank gives more
    limpIntervalMin: 4000,      // Longer between limps
    limpIntervalMax: 6000,
    limpDuration: 250,          // Shorter limp
    freezeChance: 0.04,         // 4% chance every 2s = rare freezes
    freezeInterval: 2000,       // Check every 2 seconds
    freezeDuration: 800,        // Shorter freeze
    blurSpotCount: 6,           // Fewer blur spots
  },
  normal: {
    doctorSpeedMult: 1.0,
    o2DrainPerTick: 0.88,       // ~4.4%/sec → 23 sec to drain
    o2TankCount: 5,
    o2RefillAmount: 40,
    limpIntervalMin: 3000,
    limpIntervalMax: 5000,
    limpDuration: 350,
    freezeChance: 0.06,         // 6% chance every 2s
    freezeInterval: 2000,
    freezeDuration: 1000,
    blurSpotCount: 8,
  },
  hard: {
    doctorSpeedMult: 1.15,      // Doctor 15% faster
    o2DrainPerTick: 1.1,        // ~5.5%/sec → 18 sec to drain
    o2TankCount: 4,             // Fewer tanks
    o2RefillAmount: 35,         // Less refill
    limpIntervalMin: 2000,      // More frequent limps
    limpIntervalMax: 4000,
    limpDuration: 450,          // Longer limp
    freezeChance: 0.08,         // 8% chance every 2s
    freezeInterval: 2000,
    freezeDuration: 1200,       // Longer freeze
    blurSpotCount: 10,          // More blur spots
  },
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

// Maze templates with SIDE TUNNELS for wraparound
// 0 = path, 1 = wall, 2 = player start, 3 = doctor start
// Corners are now WALLS (no diagonal wraparound)
export const MAZES = {
  covid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  measles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  polio: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
};

// Use covid maze for other levels too (they all have same structure)
(MAZES as Record<string, number[][]>).smallpox = MAZES.covid;
(MAZES as Record<string, number[][]>).tetanus = MAZES.measles;
(MAZES as Record<string, number[][]>).whooping = MAZES.polio;
(MAZES as Record<string, number[][]>).mumps = MAZES.covid;
(MAZES as Record<string, number[][]>).rubella = MAZES.measles;
(MAZES as Record<string, number[][]>).hepatitis = MAZES.polio;
