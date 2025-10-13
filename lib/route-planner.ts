import { ReactNode } from 'react';
import { BusRoute, BusStop } from './bus-routes';

export interface RouteLeg {
  number: ReactNode;
  routeId: string;
  routeName: string;
  fromStop: BusStop;
  toStop: BusStop;
  stops: BusStop[];
  estimatedTime: number;
  distance: number;
  departureTime?: string;
  arrivalTime?: string;
}

export interface RouteOption {
  id: string;
  legs: RouteLeg[];
  totalTime: number;
  totalDistance: number;
  transfers: number;
  walkingTime: number;
  confidence: number; // 0-1, higher is better
  routeType: 'direct' | 'transfer' | 'multi_transfer';
}

export interface RoutePlan {
  from: string;
  to: string;
  options: RouteOption[];
  bestOption: RouteOption | null;
  totalOptions: number;
  searchTime: number; // in milliseconds
}

export interface StopConnection {
  fromStop: BusStop;
  toStop: BusStop;
  route: BusRoute;
  time: number;
  distance: number;
}

export class RoutePlanner {
  private routes: BusRoute[];
  private stopConnections: Map<string, StopConnection[]>;
  private transferPoints: Map<string, BusStop[]>;
  private intersectionPoints: Map<string, BusStop[]>; // Common stops between routes
  private routeGraph: Map<string, Map<string, number>>; // Graph for shortest path

  constructor(routes: BusRoute[]) {
    this.routes = routes;
    this.stopConnections = new Map();
    this.transferPoints = new Map();
    this.intersectionPoints = new Map();
    this.routeGraph = new Map();
    this.precomputeConnections();
    this.buildIntersectionGraph();
  }

  // Precompute all connections and transfer points for efficiency
  private precomputeConnections(): void {
    // Build stop connections map (bidirectional with reasonable limits)
    for (const route of this.routes) {
      for (let i = 0; i < route.stops.length - 1; i++) {
        const fromStop = route.stops[i];
        const toStop = route.stops[i + 1];
        
        // Forward connection (natural direction)
        const forwardConnection: StopConnection = {
          fromStop,
          toStop,
          route,
          time: this.calculateTravelTime(fromStop, toStop),
          distance: this.calculateDistance(fromStop, toStop)
        };

        const forwardKey = fromStop.id;
        if (!this.stopConnections.has(forwardKey)) {
          this.stopConnections.set(forwardKey, []);
        }
        this.stopConnections.get(forwardKey)!.push(forwardConnection);

        // Backward connection (only for adjacent stops to prevent unrealistic routes)
        const backwardConnection: StopConnection = {
          fromStop: toStop,
          toStop: fromStop,
          route,
          time: this.calculateTravelTime(toStop, fromStop),
          distance: this.calculateDistance(toStop, fromStop)
        };

        const backwardKey = toStop.id;
        if (!this.stopConnections.has(backwardKey)) {
          this.stopConnections.set(backwardKey, []);
        }
        this.stopConnections.get(backwardKey)!.push(backwardConnection);
      }
    }

    // Build transfer points map
    for (const route of this.routes) {
      for (const stop of route.stops) {
        if (!this.transferPoints.has(stop.id)) {
          this.transferPoints.set(stop.id, []);
        }
        this.transferPoints.get(stop.id)!.push(stop);
      }
    }
  }

  // Build intersection graph for finding optimal transfer points
  private buildIntersectionGraph(): void {
    // Find all intersection points (stops shared by multiple routes)
    const stopToRoutes = new Map<string, string[]>();
    
    // Map each stop to all routes that pass through it
    for (const route of this.routes) {
      for (const stop of route.stops) {
        if (!stopToRoutes.has(stop.id)) {
          stopToRoutes.set(stop.id, []);
        }
        stopToRoutes.get(stop.id)!.push(route.id);
      }
    }

    // Find intersection points (stops with multiple routes)
    for (const [stopId, routeIds] of stopToRoutes) {
      if (routeIds.length > 1) {
        this.intersectionPoints.set(stopId, []);
        // Find the actual stop object
        for (const route of this.routes) {
          const stop = route.stops.find(s => s.id === stopId);
          if (stop) {
            this.intersectionPoints.get(stopId)!.push(stop);
            break;
          }
        }
      }
    }

    // Build route graph for shortest path calculation
    this.buildRouteGraph();
  }

  // Build graph for shortest path between routes
  private buildRouteGraph(): void {
    // Initialize graph
    for (const route of this.routes) {
      this.routeGraph.set(route.id, new Map());
    }

    // Add edges between routes that share intersection points
    for (const [stopId, ] of this.intersectionPoints) {
      const routeIds = new Set<string>();
      
      // Find all routes that pass through this intersection
      for (const route of this.routes) {
        if (route.stops.some(stop => stop.id === stopId)) {
          routeIds.add(route.id);
        }
      }

      // Connect all routes that share this intersection
      const routeArray = Array.from(routeIds);
      for (let i = 0; i < routeArray.length; i++) {
        for (let j = i + 1; j < routeArray.length; j++) {
          const route1 = routeArray[i];
          const route2 = routeArray[j];
          
          // Add bidirectional connection with transfer cost
          if (!this.routeGraph.get(route1)!.has(route2)) {
            this.routeGraph.get(route1)!.set(route2, 5); // 5 minutes transfer time
          }
          if (!this.routeGraph.get(route2)!.has(route1)) {
            this.routeGraph.get(route2)!.set(route1, 5);
          }
        }
      }
    }
  }

  // Find shortest path between routes using Dijkstra's algorithm
  private findShortestRoutePath(fromRouteId: string, toRouteId: string): string[] | null {
    if (fromRouteId === toRouteId) {
      return [fromRouteId]; // Same route, no transfer needed
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>();

    // Initialize distances
    for (const routeId of this.routeGraph.keys()) {
      distances.set(routeId, Infinity);
      unvisited.add(routeId);
    }
    distances.set(fromRouteId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      for (const node of unvisited) {
        const distance = distances.get(node)!;
        if (distance < minDistance) {
          minDistance = distance;
          current = node;
        }
      }

      if (current === null || minDistance === Infinity) {
        break; // No path found
      }

      unvisited.delete(current);

      // Update distances to neighbors
      const neighbors = this.routeGraph.get(current)!;
      for (const [neighbor, weight] of neighbors) {
        if (unvisited.has(neighbor)) {
          const alt = distances.get(current)! + weight;
          if (alt < distances.get(neighbor)!) {
            distances.set(neighbor, alt);
            previous.set(neighbor, current);
          }
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current = toRouteId;
    
    while (current) {
      path.unshift(current);
      current = previous.get(current) || '';
    }

    return path.length > 1 ? path : null;
  }

  // Advanced RAPTOR-based route finding algorithm
  findRoutes(fromLocation: string, toLocation: string): RoutePlan {
    const startTime = Date.now();
    
    const fromStops = this.findStopsByLocation(fromLocation);
    const toStops = this.findStopsByLocation(toLocation);

    if (fromStops.length === 0 || toStops.length === 0) {
      return {
        from: fromLocation,
        to: toLocation,
        options: [],
        bestOption: null,
        totalOptions: 0,
        searchTime: Date.now() - startTime
      };
    }

    const options: RouteOption[] = [];

    // Find routes for each from/to stop combination
    for (const fromStop of fromStops) {
      for (const toStop of toStops) {
        const routes = this.findRoutesBetweenStops(fromStop.stop, toStop.stop);
        options.push(...routes);
      }
    }

    // Remove duplicates and sort by quality
    const uniqueOptions = this.removeDuplicateOptions(options);
    uniqueOptions.sort((a, b) => this.compareRoutes(a, b));

    const searchTime = Date.now() - startTime;

    return {
      from: fromLocation,
      to: toLocation,
      options: uniqueOptions,
      bestOption: uniqueOptions[0] || null,
      totalOptions: uniqueOptions.length,
      searchTime
    };
  }

  // RAPTOR-inspired multi-round route finding with intersection optimization
  private findRoutesBetweenStops(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    
    // Round 0: Direct routes (0 transfers)
    const directRoutes = this.findDirectRoutes(fromStop, toStop);
    options.push(...directRoutes);

    // Round 1: Routes with optimal transfers using intersection points
    // Only show transfer routes if no good direct routes exist
    if (options.length === 0 || (options.length > 0 && options[0].confidence < 0.8)) {
      const transferRoutes = this.findOptimalTransferRoutes(fromStop, toStop);
      options.push(...transferRoutes);
    }

    // Round 2: Routes with 2 transfers (if needed)
    if (options.length < 5) {
      const multiTransferRoutes = this.findMultiTransferRoutes(fromStop, toStop);
      options.push(...multiTransferRoutes);
    }

    return options;
  }

  // Find optimal transfer routes using intersection points
  private findOptimalTransferRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    
    // First check if there are any good direct routes
    const directRoutes = this.findDirectRoutes(fromStop, toStop);
    const hasGoodDirectRoute = directRoutes.some(route => route.confidence >= 0.8);
    
    // If we have a good direct route, don't show transfer routes
    if (hasGoodDirectRoute) {
      return options;
    }
    
    // Find all routes that contain fromStop and toStop
    const fromRoutes = this.routes.filter(route => 
      route.stops.some(stop => stop.id === fromStop.id)
    );
    const toRoutes = this.routes.filter(route => 
      route.stops.some(stop => stop.id === toStop.id)
    );

    // Try all combinations of from and to routes
    for (const fromRoute of fromRoutes) {
      for (const toRoute of toRoutes) {
        if (fromRoute.id === toRoute.id) continue; // Skip same route (already handled by direct)

        // Find shortest path between routes
        const routePath = this.findShortestRoutePath(fromRoute.id, toRoute.id);
        if (routePath && routePath.length === 2) { // Only 1 transfer
          const transferRoute = this.findTransferRouteBetweenRoutes(
            fromStop, toStop, fromRoute, toRoute
          );
          if (transferRoute) {
            options.push(transferRoute);
          }
        }
      }
    }

    return options;
  }

  // Find transfer route between two specific routes
  private findTransferRouteBetweenRoutes(
    fromStop: BusStop, 
    toStop: BusStop, 
    fromRoute: BusRoute, 
    toRoute: BusRoute
  ): RouteOption | null {
    // Find intersection points between the two routes
    const intersectionPoints = this.findIntersectionPoints(fromRoute, toRoute);
    
    if (intersectionPoints.length === 0) return null;

    // Find the best intersection point (closest to both stops)
    let bestIntersection: BusStop | null = null;
    let bestScore = Infinity;

    for (const intersection of intersectionPoints) {
      const fromToIntersection = this.calculateRouteTimeBetweenStops(fromRoute, fromStop, intersection);
      const intersectionToTo = this.calculateRouteTimeBetweenStops(toRoute, intersection, toStop);
      const totalTime = fromToIntersection + intersectionToTo + 5; // 5 min transfer

      if (totalTime < bestScore) {
        bestScore = totalTime;
        bestIntersection = intersection;
      }
    }

    if (!bestIntersection) return null;

    // Create route legs
    const firstLeg = this.createRouteLegBetweenStops(fromRoute, fromStop, bestIntersection);
    const secondLeg = this.createRouteLegBetweenStops(toRoute, bestIntersection, toStop);

    if (!firstLeg || !secondLeg) return null;

    return {
      id: `transfer-${fromRoute.id}-${toRoute.id}-${Date.now()}`,
      legs: [firstLeg, secondLeg],
      totalTime: firstLeg.estimatedTime + secondLeg.estimatedTime + 5,
      totalDistance: firstLeg.distance + secondLeg.distance,
      transfers: 1,
      walkingTime: 2,
      confidence: this.calculateConfidence(firstLeg, 1),
      routeType: 'transfer'
    };
  }

  // Find intersection points between two routes
  private findIntersectionPoints(route1: BusRoute, route2: BusRoute): BusStop[] {
    const intersections: BusStop[] = [];
    
    for (const stop1 of route1.stops) {
      for (const stop2 of route2.stops) {
        if (stop1.id === stop2.id) {
          intersections.push(stop1);
        }
      }
    }
    
    return intersections;
  }

  // Calculate route time between two stops on a specific route
  private calculateRouteTimeBetweenStops(route: BusRoute, fromStop: BusStop, toStop: BusStop): number {
    const fromIndex = route.stops.findIndex(s => s.id === fromStop.id);
    const toIndex = route.stops.findIndex(s => s.id === toStop.id);
    
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return Infinity;
    }
    
    // Only allow reasonable travel directions
    let stops: BusStop[] = [];
    
    if (fromIndex < toIndex) {
      // Forward travel - natural direction
      stops = route.stops.slice(fromIndex, toIndex + 1);
    } else {
      // Backward travel - only allow if reasonable distance
      const backwardDistance = fromIndex - toIndex;
      const totalStops = route.stops.length;
      
      if (backwardDistance < totalStops / 2) {
        stops = route.stops.slice(toIndex, fromIndex + 1).reverse();
      } else {
        return Infinity; // Unrealistic backward journey
      }
    }
    
    return this.calculateRouteTimeForStops(stops);
  }

  // Create route leg between two stops on a specific route
  private createRouteLegBetweenStops(
    route: BusRoute, 
    fromStop: BusStop, 
    toStop: BusStop
  ): RouteLeg | null {
    const fromIndex = route.stops.findIndex(s => s.id === fromStop.id);
    const toIndex = route.stops.findIndex(s => s.id === toStop.id);
    
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return null;
    }
    
    // Only allow reasonable travel directions
    let stops: BusStop[] = [];
    
    if (fromIndex < toIndex) {
      // Forward travel - natural direction
      stops = route.stops.slice(fromIndex, toIndex + 1);
    } else {
      // Backward travel - only allow if reasonable distance
      const backwardDistance = fromIndex - toIndex;
      const totalStops = route.stops.length;
      
      if (backwardDistance < totalStops / 2) {
        stops = route.stops.slice(toIndex, fromIndex + 1).reverse();
      } else {
        return null; // Unrealistic backward journey
      }
    }
    
    return {
      routeId: route.id,
      number: route.number,
      routeName: route.number,
      fromStop,
      toStop,
      stops,
      estimatedTime: this.calculateRouteTimeForStops(stops),
      distance: this.calculateRouteDistanceForStops(stops)
    };
  }

  // Find multi-transfer routes (2+ transfers)
  private findMultiTransferRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    
    // This is a simplified implementation for multi-transfer routes
    // In a full implementation, you would use the route graph to find paths with 2+ transfers
    
    return options;
  }

  // Find direct routes between two stops
  private findDirectRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];

    for (const route of this.routes) {
      const fromIndex = route.stops.findIndex(s => s.id === fromStop.id);
      const toIndex = route.stops.findIndex(s => s.id === toStop.id);

      // Only consider routes where both stops exist
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        // For direct routes, we need to check if the journey makes sense
        // Only allow travel in the natural direction of the route
        let stops: BusStop[] = [];
        let isValidDirectRoute = false;

        if (fromIndex < toIndex) {
          // Forward travel - natural direction
          stops = route.stops.slice(fromIndex, toIndex + 1);
          isValidDirectRoute = true;
        } else {
          // Backward travel - only allow if it's a reasonable distance
          // Don't allow very long backward journeys that would be unrealistic
          const backwardDistance = fromIndex - toIndex;
          const totalStops = route.stops.length;
          
          // Only allow backward travel if it's less than half the route length
          // This prevents unrealistic routes like "Oxygen → New Market → Fateyabad"
          if (backwardDistance < totalStops / 2) {
            stops = route.stops.slice(toIndex, fromIndex + 1).reverse();
            isValidDirectRoute = true;
          }
        }

        if (isValidDirectRoute) {
          // Create a single leg for the entire journey
          const leg: RouteLeg = {
            routeId: route.id,
            routeName: route.number,
            fromStop,
            toStop,
            stops,
            estimatedTime: this.calculateRouteTime(stops),
            distance: this.calculateRouteDistance(stops),
            number: undefined
          };

          const option: RouteOption = {
            id: `${route.id}-direct-${fromStop.id}-${toStop.id}`,
            legs: [leg],
            totalTime: leg.estimatedTime,
            totalDistance: leg.distance,
            transfers: 0,
            walkingTime: 0,
            confidence: this.calculateConfidence(leg, 0),
            routeType: 'direct'
          };

          options.push(option);
        }
      }
    }

    return options;
  }

  // Find routes with transfers using BFS-like approach
  private findRoutesWithTransfers(fromStop: BusStop, toStop: BusStop, maxTransfers: number): RouteOption[] {
    const options: RouteOption[] = [];
    const visited = new Set<string>();
    const queue: Array<{
      currentStop: BusStop;
      legs: RouteLeg[];
      transfers: number;
      totalTime: number;
      totalDistance: number;
      currentRouteId: string;
    }> = [];

    // Initialize queue with direct connections from starting stop
    const connections = this.stopConnections.get(fromStop.id) || [];
    for (const connection of connections) {
      queue.push({
        currentStop: connection.toStop,
        legs: [this.createRouteLeg(connection)],
        transfers: 0,
        totalTime: connection.time,
        totalDistance: connection.distance,
        currentRouteId: connection.route.id
      });
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const stateKey = `${current.currentStop.id}-${current.transfers}-${current.currentRouteId}`;

      if (visited.has(stateKey) || current.transfers > maxTransfers) {
        continue;
      }
      visited.add(stateKey);

      // Check if we reached destination
      if (current.currentStop.id === toStop.id) {
        // Only create option if it's a valid route (not same route with unnecessary transfers)
        if (this.isValidRoute(current.legs)) {
          const option: RouteOption = {
            id: `transfer-${current.transfers}-${Date.now()}`,
            legs: current.legs,
            totalTime: current.totalTime + (current.transfers * 5), // 5 min transfer time
            totalDistance: current.totalDistance,
            transfers: current.transfers,
            walkingTime: current.transfers * 2, // 2 min walking per transfer
            confidence: this.calculateConfidence(current.legs[0], current.transfers),
            routeType: current.transfers === 1 ? 'transfer' : 'multi_transfer'
          };
          options.push(option);
        }
        continue;
      }

      // If we haven't reached max transfers, explore further
      if (current.transfers < maxTransfers) {
        const nextConnections = this.stopConnections.get(current.currentStop.id) || [];
        for (const connection of nextConnections) {
          // Avoid going back to previous stops
          if (!current.legs.some(leg => leg.stops.some(stop => stop.id === connection.toStop.id))) {
            const newLeg = this.createRouteLeg(connection);
            const isNewRoute = connection.route.id !== current.currentRouteId;
            const newTransfers = isNewRoute ? current.transfers + 1 : current.transfers;
            
            queue.push({
              currentStop: connection.toStop,
              legs: [...current.legs, newLeg],
              transfers: newTransfers,
              totalTime: current.totalTime + connection.time,
              totalDistance: current.totalDistance + connection.distance,
              currentRouteId: connection.route.id
            });
          }
        }
      }
    }

    return options;
  }

  // Check if a route is valid (not same route with unnecessary transfers)
  private isValidRoute(legs: RouteLeg[]): boolean {
    if (legs.length <= 1) return true;
    
    // Check if all legs are from the same route
    const firstRouteId = legs[0].routeId;
    const allSameRoute = legs.every(leg => leg.routeId === firstRouteId);
    
    // If all legs are from the same route, it's invalid (should be direct)
    if (allSameRoute) return false;
    
    // Check for unnecessary transfers (same route appearing multiple times)
    const routeIds = legs.map(leg => leg.routeId);
    const uniqueRoutes = new Set(routeIds);
    
    // If we have transfers but same number of unique routes as legs, it's valid
    return uniqueRoutes.size === legs.length;
  }

  // Create a route leg from a connection
  private createRouteLeg(connection: StopConnection): RouteLeg {
    const fromIndex = connection.route.stops.findIndex(s => s.id === connection.fromStop.id);
    const toIndex = connection.route.stops.findIndex(s => s.id === connection.toStop.id);
    const stops = connection.route.stops.slice(fromIndex, toIndex + 1);

  return {
    routeId: connection.route.id,
    routeName: connection.route.number,
    fromStop: connection.fromStop,
    toStop: connection.toStop,
    stops,
    estimatedTime: connection.time,
    distance: connection.distance,
    number: undefined
  };
}

  // Calculate travel time between two stops
  private calculateTravelTime(fromStop: BusStop, toStop: BusStop): number {
    // Base time: 2.5 minutes per stop + distance factor
    const baseTime = 2.5;
    const distance = this.calculateDistance(fromStop, toStop);
    return Math.round(baseTime + (distance * 1.5)); // 1.5 min per km
  }

  // Calculate distance between two stops (simplified)
  private calculateDistance(fromStop: BusStop, toStop: BusStop): number {
    // Simplified distance calculation - in real app, use GPS coordinates
    return 0.8; // Average 0.8 km between stops
  }

  // Calculate total time for a route
  private calculateRouteTime(stops: BusStop[]): number {
    let totalTime = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalTime += this.calculateTravelTime(stops[i], stops[i + 1]);
    }
    return totalTime;
  }

  // Calculate total distance for a route
  private calculateRouteDistance(stops: BusStop[]): number {
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalDistance += this.calculateDistance(stops[i], stops[i + 1]);
    }
    return Math.round(totalDistance * 10) / 10;
  }

  // Calculate total time for a route (alias for consistency)
  private calculateRouteTimeForStops(stops: BusStop[]): number {
    return this.calculateRouteTime(stops);
  }

  // Calculate total distance for a route (alias for consistency)
  private calculateRouteDistanceForStops(stops: BusStop[]): number {
    return this.calculateRouteDistance(stops);
  }

  // Calculate confidence score for a route (0-1)
  private calculateConfidence(leg: RouteLeg, transfers: number): number {
    let confidence = 1.0;
    
    // Reduce confidence for transfers
    confidence -= transfers * 0.2;
    
    // Reduce confidence for very long routes
    if (leg.estimatedTime > 60) {
      confidence -= 0.1;
    }
    
    // Don't reduce confidence for short routes - they can be valid direct routes
    // Short routes are often the most efficient and reliable
    
    return Math.max(0.1, confidence);
  }

  // Compare routes for sorting
  private compareRoutes(a: RouteOption, b: RouteOption): number {
    // Primary: Direct routes first (0 transfers)
    if (a.transfers === 0 && b.transfers > 0) return -1;
    if (b.transfers === 0 && a.transfers > 0) return 1;
    
    // Secondary: Higher confidence (more reliable routes first)
    if (Math.abs(a.confidence - b.confidence) > 0.05) {
      return b.confidence - a.confidence;
    }
    
    // Tertiary: Fewer transfers
    if (a.transfers !== b.transfers) {
      return a.transfers - b.transfers;
    }
    
    // Quaternary: Shorter time
    return a.totalTime - b.totalTime;
  }

  // Find stops that match a location (fuzzy matching)
  private findStopsByLocation(location: string): { stop: BusStop; route: BusRoute }[] {
    const matches: { stop: BusStop; route: BusRoute }[] = [];
    const searchTerm = location.toLowerCase().trim();

    for (const route of this.routes) {
      for (const stop of route.stops) {
        if (
          stop.name.toLowerCase().includes(searchTerm)
        ) {
          matches.push({ stop, route });
        }
      }
    }

    return matches;
  }

  // Remove duplicate route options
  private removeDuplicateOptions(options: RouteOption[]): RouteOption[] {
    const seen = new Set<string>();
    return options.filter(option => {
      const key = `${option.legs.map(leg => leg.routeId).join('-')}-${option.legs[0].fromStop.id}-${option.legs[option.legs.length - 1].toStop.id}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Get popular routes (most frequently used)
  getPopularRoutes(limit: number = 5): BusRoute[] {
    // This could be enhanced with actual usage data
    // For now, return routes with most stops (indicating coverage)
    return [...this.routes]
      .sort((a, b) => b.stops.length - a.stops.length)
      .slice(0, limit);
  }

  // Get nearby stops to a location
  getNearbyStops(location: string, radius: number = 2): { stop: BusStop; route: BusRoute; distance: number }[] {
    const matches = this.findStopsByLocation(location);
    
    // For now, return all matches with estimated distances
    // In a real app, you'd use GPS coordinates for accurate distance calculation
    return matches.map(match => ({
      ...match,
      distance: Math.random() * radius // Placeholder for actual distance calculation
    })).sort((a, b) => a.distance - b.distance);
  }
}
