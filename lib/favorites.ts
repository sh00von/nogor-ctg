export interface FavoriteRoute {
  id: string;
  from: string;
  to: string;
  routeId?: string;
  createdAt: Date;
  lastUsed: Date;
}

const FAVORITES_KEY = 'chittagong-bus-favorites';

export class FavoritesManager {
  private favorites: FavoriteRoute[] = [];

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        this.favorites = JSON.parse(stored).map((fav: any) => ({
          ...fav,
          createdAt: new Date(fav.createdAt),
          lastUsed: new Date(fav.lastUsed)
        }));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
    }
  }

  private saveFavorites(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  addFavorite(from: string, to: string, routeId?: string): void {
    const existingIndex = this.favorites.findIndex(
      fav => fav.from === from && fav.to === to
    );

    const favorite: FavoriteRoute = {
      id: existingIndex >= 0 ? this.favorites[existingIndex].id : Date.now().toString(),
      from,
      to,
      routeId,
      createdAt: existingIndex >= 0 ? this.favorites[existingIndex].createdAt : new Date(),
      lastUsed: new Date()
    };

    if (existingIndex >= 0) {
      this.favorites[existingIndex] = favorite;
    } else {
      this.favorites.push(favorite);
    }

    this.saveFavorites();
  }

  removeFavorite(from: string, to: string): void {
    this.favorites = this.favorites.filter(
      fav => !(fav.from === from && fav.to === to)
    );
    this.saveFavorites();
  }

  isFavorite(from: string, to: string): boolean {
    return this.favorites.some(fav => fav.from === from && fav.to === to);
  }

  getFavorites(): FavoriteRoute[] {
    return [...this.favorites].sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }

  getRecentFavorites(limit: number = 5): FavoriteRoute[] {
    return this.getFavorites().slice(0, limit);
  }
}

export const favoritesManager = new FavoritesManager();
