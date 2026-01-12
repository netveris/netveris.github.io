// Local storage utilities for history and favorites
export interface ToolHistory {
  toolPath: string;
  toolTitle: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface Favorite {
  toolPath: string;
  toolTitle: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  HISTORY: 'netveris_history',
  FAVORITES: 'netveris_favorites',
} as const;

// History Management
export function getHistory(): ToolHistory[] {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function addToHistory(toolPath: string, toolTitle: string, data?: Record<string, unknown>): void {
  try {
    const history = getHistory();
    const newEntry: ToolHistory = {
      toolPath,
      toolTitle,
      timestamp: Date.now(),
      data,
    };
    
    // Remove duplicates and add to beginning
    const filtered = history.filter(h => h.toolPath !== toolPath);
    const updated = [newEntry, ...filtered].slice(0, 20); // Keep last 20
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// Favorites Management
export function getFavorites(): Favorite[] {
  try {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
}

export function isFavorite(toolPath: string): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.toolPath === toolPath);
}

export function toggleFavorite(toolPath: string, toolTitle: string): boolean {
  try {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.toolPath === toolPath);
    
    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return false;
    } else {
      // Add to favorites
      const newFavorite: Favorite = {
        toolPath,
        toolTitle,
        timestamp: Date.now(),
      };
      favorites.push(newFavorite);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return false;
  }
}

export function clearFavorites(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  } catch (error) {
    console.error('Failed to clear favorites:', error);
  }
}
