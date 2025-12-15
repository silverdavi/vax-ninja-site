/**
 * Leaderboard Service - Handles highscores globally
 * 
 * Currently uses localStorage as fallback, can connect to:
 * - Upstash Redis (recommended for serverless)
 * - Supabase
 * - AWS DynamoDB
 */

export interface LeaderboardEntry {
  name: string;
  score: number;       // Total diseases collected
  level: number;       // Highest level reached
  time: number;        // Total time survived (ms)
  debuffs: string[];   // Diseases collected
  timestamp: number;
  country?: string;    // Optional country flag
}

// Configuration - can be set via environment or runtime
let API_URL: string | null = null;
let API_KEY: string | null = null;

/**
 * Configure the leaderboard backend
 */
export function configureLeaderboard(url: string, key: string): void {
  API_URL = url;
  API_KEY = key;
}

/**
 * Submit a score to the leaderboard
 */
export async function submitScore(entry: Omit<LeaderboardEntry, 'timestamp'>): Promise<boolean> {
  const fullEntry: LeaderboardEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  
  // Try online API first
  if (API_URL && API_KEY) {
    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(fullEntry),
      });
      
      if (response.ok) {
        // Also save locally as backup
        saveLocalScore(fullEntry);
        return true;
      }
    } catch (e) {
      console.warn('Online leaderboard unavailable, using local storage');
    }
  }
  
  // Fallback to local storage
  saveLocalScore(fullEntry);
  return true;
}

/**
 * Get top scores from leaderboard
 */
export async function getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
  // Try online API first
  if (API_URL && API_KEY) {
    try {
      const response = await fetch(`${API_URL}/scores?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Online leaderboard unavailable, using local storage');
    }
  }
  
  // Fallback to local storage
  return getLocalScores(limit);
}

/**
 * Get player's personal best
 */
export async function getPersonalBest(name: string): Promise<LeaderboardEntry | null> {
  const scores = await getTopScores(100);
  return scores.find(s => s.name.toLowerCase() === name.toLowerCase()) || null;
}

// === LOCAL STORAGE HELPERS ===

const LOCAL_KEY = 'vaxninja_leaderboard';

function saveLocalScore(entry: LeaderboardEntry): void {
  const existing = getLocalScores(100);
  existing.push(entry);
  
  // Sort by score (highest first), then by level, then by time
  existing.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.level !== a.level) return b.level - a.level;
    return b.time - a.time;
  });
  
  // Keep top 100
  const trimmed = existing.slice(0, 100);
  
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Could not save to localStorage');
  }
}

function getLocalScores(limit: number): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      const scores = JSON.parse(data) as LeaderboardEntry[];
      return scores.slice(0, limit);
    }
  } catch (e) {
    console.warn('Could not read from localStorage');
  }
  return [];
}

/**
 * Check if online leaderboard is configured
 */
export function isOnlineEnabled(): boolean {
  return !!(API_URL && API_KEY);
}

/**
 * Get player name from storage or prompt
 */
export function getStoredPlayerName(): string | null {
  try {
    return localStorage.getItem('vaxninja_playername');
  } catch {
    return null;
  }
}

export function setStoredPlayerName(name: string): void {
  try {
    localStorage.setItem('vaxninja_playername', name);
  } catch {
    // Ignore
  }
}
