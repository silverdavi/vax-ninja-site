/**
 * Leaderboard Service - Global highscores using Upstash Redis
 * 
 * Uses Upstash REST API for serverless Redis access
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

// Upstash Redis configuration
const UPSTASH_URL = 'https://exact-impala-22357.upstash.io';
const UPSTASH_TOKEN = 'AVdVAAIncDFmYmQ1MTNlNWYzZWQ0YzFiYjcwY2FiZjBlN2JkNzk5NHAxMjIzNTc';

/**
 * Execute a Redis command via Upstash REST API
 */
async function redis(...args: (string | number)[]): Promise<unknown> {
  const response = await fetch(`${UPSTASH_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  
  if (!response.ok) {
    throw new Error(`Redis error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.result;
}

/**
 * Submit a score to the global leaderboard
 */
export async function submitScore(entry: Omit<LeaderboardEntry, 'timestamp'>): Promise<boolean> {
  const fullEntry: LeaderboardEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  
  try {
    // Create a unique key for this score entry
    const scoreKey = `score:${fullEntry.name}:${fullEntry.timestamp}`;
    
    // Store the full entry data as JSON
    await redis('SET', scoreKey, JSON.stringify(fullEntry));
    
    // Add to sorted set for ranking (score = level * 100 + diseases collected * 10 + time bonus)
    // Higher is better
    const rankScore = fullEntry.level * 1000 + fullEntry.score * 100 + Math.floor(fullEntry.time / 1000);
    await redis('ZADD', 'leaderboard', rankScore, scoreKey);
    
    // Also save locally as backup
    saveLocalScore(fullEntry);
    
    console.log('✅ Score submitted to global leaderboard!');
    return true;
  } catch (e) {
    console.warn('⚠️ Could not submit to global leaderboard, saved locally:', e);
    saveLocalScore(fullEntry);
    return false;
  }
}

/**
 * Get top scores from global leaderboard
 */
export async function getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    // Get top score keys from sorted set (highest first)
    const keys = await redis('ZREVRANGE', 'leaderboard', 0, limit - 1) as string[];
    
    if (!keys || keys.length === 0) {
      return getLocalScores(limit);
    }
    
    // Fetch full data for each score
    const entries: LeaderboardEntry[] = [];
    for (const key of keys) {
      try {
        const data = await redis('GET', key) as string;
        if (data) {
          entries.push(JSON.parse(data));
        }
      } catch {
        // Skip invalid entries
      }
    }
    
    return entries;
  } catch (e) {
    console.warn('⚠️ Could not fetch global leaderboard, using local:', e);
    return getLocalScores(limit);
  }
}

/**
 * Get player's personal best
 */
export async function getPersonalBest(name: string): Promise<LeaderboardEntry | null> {
  const scores = await getTopScores(100);
  return scores.find(s => s.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Check if online leaderboard is available
 */
export function isOnlineEnabled(): boolean {
  return true; // Always try online first
}

// === LOCAL STORAGE HELPERS (backup/fallback) ===

const LOCAL_KEY = 'vaxninja_leaderboard';

function saveLocalScore(entry: LeaderboardEntry): void {
  const existing = getLocalScores(100);
  existing.push(entry);
  
  // Sort by level first, then score, then time
  existing.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    if (b.score !== a.score) return b.score - a.score;
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
