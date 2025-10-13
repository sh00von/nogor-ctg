import Fuse from 'fuse.js';
import { BusRoute } from './bus-routes';

// Configure Fuse.js options for fuzzy search
const fuseOptions = {
  keys: [
    {
      name: 'name',
      weight: 0.3
    },
    {
      name: 'number',
      weight: 0.2
    },
    {
      name: 'stops.name',
      weight: 0.2
    }
  ],
  threshold: 0.4, // Lower threshold = more strict matching
  distance: 100, // Maximum allowed distance between characters
  minMatchCharLength: 2, // Minimum characters to match
  includeScore: true,
  includeMatches: true,
  ignoreLocation: true,
  findAllMatches: true
};

export class FuzzySearch {
  private fuse: Fuse<BusRoute>;
  private routes: BusRoute[];

  constructor(routes: BusRoute[]) {
    this.routes = routes;
    this.fuse = new Fuse(routes, fuseOptions);
  }

  search(query: string): BusRoute[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const results = this.fuse.search(query.trim());
    return results.map(result => result.item);
  }

  searchByLocation(location: string): BusRoute[] {
    if (!location || location.trim().length < 2) {
      return [];
    }

    // Create a temporary search instance focused on stops
    const stopFuseOptions = {
      ...fuseOptions,
      keys: [
        {
          name: 'stops.name',
          weight: 1.0
        }
      ]
    };

    const stopFuse = new Fuse(this.routes, stopFuseOptions);
    const results = stopFuse.search(location.trim());
    
    // Remove duplicates
    const uniqueRoutes = new Map();
    results.forEach(result => {
      const route = result.item as BusRoute;
      uniqueRoutes.set(route.id, route);
    });

    return Array.from(uniqueRoutes.values());
  }

  // Get search suggestions based on partial input
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const allStops = new Set<string>();
    const routes = this.routes;

    routes.forEach(route => {
      route.stops.forEach(stop => {
        allStops.add(stop.name);
      });
    });

    const stopFuse = new Fuse(Array.from(allStops), {
      threshold: 0.3,
      distance: 50,
      minMatchCharLength: 1
    });

    const results = stopFuse.search(query.trim());
    return results.slice(0, limit).map(result => result.item);
  }
}
