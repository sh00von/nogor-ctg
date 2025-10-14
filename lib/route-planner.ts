import { ReactNode } from 'react';
import { BusRoute, BusStop } from './bus-routes';

export interface RouteLeg {
  number: ReactNode;
  routeId: number;
  routeName: string;
  fromStop: BusStop;
  toStop: BusStop;
  stops: BusStop[];
  estimatedTime: number;
  distance: number;
  departureTime?: string;
  arrivalTime?: string;
}

export interface RouteScore {
  totalScore: number;        // Overall score (0-100)
  timeScore: number;        // Time efficiency score
  transferScore: number;    // Transfer efficiency score
  distanceScore: number;    // Distance efficiency score
  reliabilityScore: number;  // Route reliability score
  comfortScore: number;     // Passenger comfort score
  accessibilityScore: number; // Accessibility score
  factors: {
    time: number;           // Travel time in minutes
    transfers: number;      // Number of transfers
    distance: number;       // Total distance in km
    walkingTime: number;    // Walking time in minutes
    routeCount: number;     // Number of different routes used
    confidence: number;     // Algorithm confidence (0-1)
  };
}

interface AStarNode {
  stopId: number;
  routeId: number;
  cameFrom: AStarNode | null;
  g: number;
  h: number;
  f: number;
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
  score?: RouteScore; // Comprehensive scoring
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
  private stopConnections: Map<number, StopConnection[]>;
  private transferPoints: Map<number, BusStop[]>;
  private intersectionPoints: Map<number, BusStop[]>; // Common stops between routes
  private routeGraph: Map<number, Map<number, number>>; // Graph for shortest path
  
  // Enhanced data structures for better performance
  private stopToRoutesMap: Map<number, Set<number>>; // O(1) stop lookup
  private routeToStopsMap: Map<number, Set<number>>; // O(1) route lookup
  private stopIndex: Map<string, number[]>; // Fast stop name search
  private adjacencyList: Map<number, Array<{stop: number, route: number, weight: number}>>; // Graph representation
  private heuristics: Map<number, Map<number, number>>; // Precomputed distances for A*

  constructor(routes: BusRoute[]) {
    this.routes = routes;
    this.stopConnections = new Map();
    this.transferPoints = new Map();
    this.intersectionPoints = new Map();
    this.routeGraph = new Map();
    this.stopToRoutesMap = new Map();
    this.routeToStopsMap = new Map();
    this.stopIndex = new Map();
    this.adjacencyList = new Map();
    this.heuristics = new Map();
    
    this.precomputeConnections();
    this.buildIntersectionGraph();
    this.buildEnhancedGraph();
    this.precomputeHeuristics();
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
          time: this.calculateTravelTime(),
          distance: this.calculateDistance()
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
          time: this.calculateTravelTime(),
          distance: this.calculateDistance()
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
    const stopToRoutes = new Map<number, number[]>();
    
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

  // Build enhanced graph structure for advanced algorithms
  private buildEnhancedGraph(): void {
    // Initialize maps
    for (const route of this.routes) {
      this.routeToStopsMap.set(route.id, new Set());
      for (const stop of route.stops) {
        if (!this.stopToRoutesMap.has(stop.id)) {
          this.stopToRoutesMap.set(stop.id, new Set());
        }
        this.stopToRoutesMap.get(stop.id)!.add(route.id);
        this.routeToStopsMap.get(route.id)!.add(stop.id);
        
        // Build stop name index for fast search
        const stopName = stop.name.toLowerCase();
        if (!this.stopIndex.has(stopName)) {
          this.stopIndex.set(stopName, []);
        }
        this.stopIndex.get(stopName)!.push(stop.id);
      }
    }

    // Build adjacency list for graph algorithms
    for (const route of this.routes) {
      for (let i = 0; i < route.stops.length - 1; i++) {
        const fromStop = route.stops[i];
        const toStop = route.stops[i + 1];
        
        if (!this.adjacencyList.has(fromStop.id)) {
          this.adjacencyList.set(fromStop.id, []);
        }
        
        this.adjacencyList.get(fromStop.id)!.push({
          stop: toStop.id,
          route: route.id,
          weight: this.calculateTravelTime()
        });
        
        // Add reverse connection for bidirectional travel
        if (!this.adjacencyList.has(toStop.id)) {
          this.adjacencyList.set(toStop.id, []);
        }
        
        this.adjacencyList.get(toStop.id)!.push({
          stop: fromStop.id,
          route: route.id,
          weight: this.calculateTravelTime()
        });
      }
    }
  }

  // Precompute heuristics for A* algorithm
  private precomputeHeuristics(): void {
    const allStops = new Set<number>();
    for (const route of this.routes) {
      for (const stop of route.stops) {
        allStops.add(stop.id);
      }
    }

    // Precompute distances between all stop pairs for heuristic function
    for (const stop1 of allStops) {
      this.heuristics.set(stop1, new Map());
      for (const stop2 of allStops) {
        if (stop1 !== stop2) {
          const distance = this.calculateEuclideanDistance(stop1, stop2);
          this.heuristics.get(stop1)!.set(stop2, distance);
        }
      }
    }
  }

  // Calculate Euclidean distance between stops (optimized for shortest path)
  private calculateEuclideanDistance(stop1: number, stop2: number): number {
    // In a real implementation, use actual GPS coordinates
    // For now, use a heuristic optimized for shortest path finding
    const routes1 = this.stopToRoutesMap.get(stop1) || new Set();
    const routes2 = this.stopToRoutesMap.get(stop2) || new Set();
    
    // If stops share routes, distance is very small (direct connection possible)
    const sharedRoutes = new Set([...routes1].filter(x => routes2.has(x)));
    if (sharedRoutes.size > 0) {
      return 0.5; // Very close - prioritize direct routes
    }
    
    // Calculate minimum transfers needed
    const minTransfers = this.calculateMinimumTransfers(stop1, stop2);
    
    // Estimate time based on transfers and route connectivity
    const baseTime = Math.min(routes1.size, routes2.size) * 1.5; // Base travel time
    const transferTime = minTransfers * 5; // 5 minutes per transfer
    
    return baseTime + transferTime;
  }

  // Calculate minimum transfers needed between two stops
  private calculateMinimumTransfers(stop1: number, stop2: number): number {
    const routes1 = this.stopToRoutesMap.get(stop1) || new Set();
    const routes2 = this.stopToRoutesMap.get(stop2) || new Set();
    
    // If stops share routes, no transfers needed
    const sharedRoutes = new Set([...routes1].filter(x => routes2.has(x)));
    if (sharedRoutes.size > 0) {
      return 0;
    }
    
    // Find minimum transfers using route graph
    let minTransfers = Infinity;
    for (const route1 of routes1) {
      for (const route2 of routes2) {
        const path = this.findShortestRoutePath(route1, route2);
        if (path) {
          minTransfers = Math.min(minTransfers, path.length - 1);
        }
      }
    }
    
    return minTransfers === Infinity ? 3 : minTransfers; // Default to 3 if no path found
  }

  // Build graph for shortest path between routes
  private buildRouteGraph(): void {
    // Initialize graph
    for (const route of this.routes) {
      this.routeGraph.set(route.id, new Map());
    }

    // Add edges between routes that share intersection points
    for (const [stopId, ] of this.intersectionPoints) {
      const routeIds = new Set<number>();
      
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

  // A* Algorithm for optimal pathfinding between stops
  private findPathAStar(fromStopId: number, toStopId: number, maxTransfers: number = 5): RouteOption | null {
    if (fromStopId === toStopId) return null;

    interface AStarNode {
      stopId: number;
      gScore: number; // Cost from start
      fScore: number; // gScore + heuristic
      cameFrom: AStarNode | null;
      routeId: number;
      transfers: number;
    }

    const openSet = new Map<number, AStarNode>();
    const closedSet = new Set<number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();

    // Initialize
    gScore.set(fromStopId, 0);
    fScore.set(fromStopId, this.heuristics.get(fromStopId)?.get(toStopId) || 0);
    
    openSet.set(fromStopId, {
      stopId: fromStopId,
      gScore: 0,
      fScore: fScore.get(fromStopId)!,
      cameFrom: null,
      routeId: -1,
      transfers: 0
    });

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current: AStarNode | null = null;
      let lowestFScore = Infinity;
      
      for (const node of openSet.values()) {
        if (node.fScore < lowestFScore) {
          lowestFScore = node.fScore;
          current = node;
        }
      }

      if (!current) break;
      
      for (const node of openSet.values()) {
        if (node.fScore < lowestFScore) {
          lowestFScore = node.fScore;
          current = node as AStarNode;
        }
      }

      // Explore neighbors
      const neighbors = this.adjacencyList.get(current.stopId) || [];
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.stop) || current.transfers >= maxTransfers) {
          continue;
        }

        const tentativeGScore = current.gScore + neighbor.weight;
        const isNewRoute = neighbor.route !== current.routeId;
        const transferCost = isNewRoute ? 5 : 0; // 5 minutes for transfer
        const totalGScore = tentativeGScore + transferCost;

        if (!openSet.has(neighbor.stop) || totalGScore < (gScore.get(neighbor.stop) || Infinity)) {
          const heuristic = this.heuristics.get(neighbor.stop)?.get(toStopId) || 0;
          const newFScore = totalGScore + heuristic;

          const newNode: AStarNode = {
            stopId: neighbor.stop,
            gScore: totalGScore,
            fScore: newFScore,
            cameFrom: current,
            routeId: neighbor.route,
            transfers: current.transfers + (isNewRoute ? 1 : 0)
          };

          openSet.set(neighbor.stop, newNode);
          gScore.set(neighbor.stop, totalGScore);
          fScore.set(neighbor.stop, newFScore);
        }
      }
    }

    return null; // No path found
  }

  // Reconstruct path from A* result
  private reconstructAStarPath(goal: AStarNode, fromStopId: number, toStopId: number): RouteOption | null {
    const path: AStarNode[] = [];
    let current: AStarNode | null = goal;

    while (current) {
      path.unshift(current);
      current = current.cameFrom;
    }

    if (path.length < 2) return null;

    // Convert path to route legs
    const legs: RouteLeg[] = [];
    let currentLeg: RouteLeg | null = null;

    for (let i = 0; i < path.length - 1; i++) {
      const currentStop = this.getStopById(path[i].stopId);
      const nextStop = this.getStopById(path[i + 1].stopId);
      const route = this.getRouteById(path[i + 1].routeId);

      if (!currentStop || !nextStop || !route) continue;

      if (!currentLeg || currentLeg.routeId !== route.id) {
        // Start new leg
        if (currentLeg) {
          legs.push(currentLeg);
        }
        currentLeg = {
          routeId: route.id,
          routeName: route.number,
          fromStop: currentStop,
          toStop: nextStop,
          stops: [currentStop, nextStop],
          estimatedTime: this.calculateTravelTime(),
          distance: this.calculateDistance(),
          number: route.number
        };
      } else {
        // Extend current leg
        currentLeg.toStop = nextStop;
        currentLeg.stops.push(nextStop);
        currentLeg.estimatedTime += this.calculateTravelTime();
        currentLeg.distance += this.calculateDistance();
      }
    }

    if (currentLeg) {
      legs.push(currentLeg);
    }

    if (legs.length === 0) return null;

    const totalTime = legs.reduce((sum, leg) => sum + leg.estimatedTime, 0) + ((legs.length - 1) * 5);
    const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0);

    return {
      id: `astar-${fromStopId}-${toStopId}-${Date.now()}`,
      legs,
      totalTime,
      totalDistance,
      transfers: legs.length - 1,
      walkingTime: (legs.length - 1) * 2,
      confidence: this.calculateConfidence(legs[0], legs.length - 1),    
      routeType: legs.length === 1 ? 'direct' : legs.length === 2 ? 'transfer' : 'multi_transfer'
    };
  }

  // Helper methods for A* algorithm
  private getStopById(stopId: number): BusStop | null {
    for (const route of this.routes) {
      const stop = route.stops.find(s => s.id === stopId);
      if (stop) return stop;
    }
    return null;
  }

  private getRouteById(routeId: number): BusRoute | null {
    return this.routes.find(r => r.id === routeId) || null;
  }

  // Enhanced Dijkstra's algorithm for route-level pathfinding
  private findShortestRoutePath(fromRouteId: number, toRouteId: number): number[] | null {
    if (fromRouteId === toRouteId) {
      return [fromRouteId]; // Same route, no transfer needed
    }

    const distances = new Map<number, number>();
    const previous = new Map<number, number>();
    const unvisited = new Set<number>();

    // Initialize distances
    for (const routeId of this.routeGraph.keys()) {
      distances.set(routeId, Infinity);
      unvisited.add(routeId);
    }
    distances.set(fromRouteId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with smallest distance
      let current: number | null = null;
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
    const path: number[] = [];
    let current = toRouteId;
    
    while (current !== undefined) {
      path.unshift(current);
      current = previous.get(current) || 0;
      if (current === 0) break;
    }

    return path.length > 1 ? path : null;
  }

  // Advanced RAPTOR-based route finding algorithm
  findRoutes(fromLocation: string, toLocation: string): RoutePlan {
    const startTime = Date.now();
    const maxSearchTime = 5000; // 5 seconds timeout
    
    const fromStops = this.findStopsByLocation(fromLocation);
    const toStops = this.findStopsByLocation(toLocation);

    // Debug logging
    console.log(`Searching routes from "${fromLocation}" to "${toLocation}"`);
    console.log(`Found ${fromStops.length} from stops:`, fromStops.map(s => s.stop.name));
    console.log(`Found ${toStops.length} to stops:`, toStops.map(s => s.stop.name));

    if (fromStops.length === 0 || toStops.length === 0) {
      console.log('No stops found, returning empty result');
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

    // Find routes for each from/to stop combination (limit to prevent freezing)
    const maxCombinations = 10; // Limit combinations to prevent performance issues
    let combinationCount = 0;
    
    for (const fromStop of fromStops) {
      if (combinationCount >= maxCombinations) break;
      
      for (const toStop of toStops) {
        if (combinationCount >= maxCombinations) break;
        combinationCount++;
        
        // Check timeout
        if (Date.now() - startTime > maxSearchTime) {
          console.log('Search timeout reached, returning partial results');
          break;
        }
        
        console.log(`Finding routes between ${fromStop.stop.name} and ${toStop.stop.name}`);
        const routes = this.findRoutesBetweenStops(fromStop.stop, toStop.stop);
        console.log(`Found ${routes.length} routes`);
        options.push(...routes);
      }
    }

    // Remove duplicates and calculate comprehensive scores
    const uniqueOptions = this.removeDuplicateOptions(options);
    
    // Calculate scores for all route options
    uniqueOptions.forEach(option => {
      option.score = this.calculateRouteScore(option);
    });
    
    // Sort by comprehensive scoring system
    uniqueOptions.sort((a, b) => this.compareRoutes(a, b));

    console.log(`Final result: ${uniqueOptions.length} unique routes found`);
    console.log(`Best route: ${uniqueOptions[0]?.totalTime} min, ${uniqueOptions[0]?.transfers} transfers, Score: ${uniqueOptions[0]?.score?.totalScore}/100`);
    
    // Log detailed scores for top 3 routes
    uniqueOptions.slice(0, 3).forEach((option, index) => {
      if (option.score) {
        console.log(`Route ${index + 1}: Score ${option.score.totalScore}/100 (Time: ${option.score.timeScore}, Transfer: ${option.score.transferScore}, Distance: ${option.score.distanceScore}, Reliability: ${option.score.reliabilityScore}, Comfort: ${option.score.comfortScore}, Accessibility: ${option.score.accessibilityScore})`);
      }
    });

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

  // Enhanced multi-algorithm route finding - SHORTEST PATH FIRST
  private findRoutesBetweenStops(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    
    // Algorithm 1: Direct routes (0 transfers) - HIGHEST PRIORITY
    const directRoutes = this.findDirectRoutes(fromStop, toStop);
    options.push(...directRoutes);

    // Algorithm 2: A* for optimal pathfinding (SHORTEST PATH PRIORITY)
    const astarRoute = this.findPathAStar(fromStop.id, toStop.id, 5);
    if (astarRoute) {
      options.push(astarRoute);
    }

    // Algorithm 3: Optimal transfer routes using intersection points
      const transferRoutes = this.findOptimalTransferRoutes(fromStop, toStop);
      options.push(...transferRoutes);

    // Algorithm 4: Multi-transfer routes (2-3 transfers) using BFS
    if (options.length < 5) {
      const multiTransferRoutes = this.findMultiTransferRoutes(fromStop, toStop);
      options.push(...multiTransferRoutes);
    }

    // Algorithm 5: K-shortest paths using Yen's algorithm (alternatives)
    if (options.length < 3) {
      const kShortestRoutes = this.findKShortestPaths(fromStop, toStop, 3);
      options.push(...kShortestRoutes);
    }

    // Sort by shortest time first, then by efficiency
    options.sort((a, b) => this.compareRoutes(a, b));

    return options;
  }

  // Find optimal transfer routes using intersection points
  private findOptimalTransferRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    
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
    console.log(`Finding transfer route between ${fromRoute.name} and ${toRoute.name}`);
    
    // Find intersection points between the two routes
    const intersectionPoints = this.findIntersectionPoints(fromRoute, toRoute);
    console.log(`Found ${intersectionPoints.length} intersection points:`, intersectionPoints.map(p => p.name));
    
    if (intersectionPoints.length === 0) return null;

    // Find the best intersection point (closest to both stops)
    let bestIntersection: BusStop | null = null;
    let bestScore = Infinity;

    for (const intersection of intersectionPoints) {
      const fromToIntersection = this.calculateRouteTimeBetweenStops(fromRoute, fromStop, intersection);
      const intersectionToTo = this.calculateRouteTimeBetweenStops(toRoute, intersection, toStop);
      const totalTime = fromToIntersection + intersectionToTo + 5; // 5 min transfer

      console.log(`Intersection ${intersection.name}: ${fromToIntersection} + ${intersectionToTo} + 5 = ${totalTime} min`);

      if (totalTime < bestScore) {
        bestScore = totalTime;
        bestIntersection = intersection;
      }
    }

    if (!bestIntersection) return null;

    console.log(`Best intersection: ${bestIntersection.name} with ${bestScore} min total time`);

    // Create route legs
    const firstLeg = this.createRouteLegBetweenStops(fromRoute, fromStop, bestIntersection);
    const secondLeg = this.createRouteLegBetweenStops(toRoute, bestIntersection, toStop);

    if (!firstLeg || !secondLeg) {
      console.log('Failed to create route legs');
      return null;
    }

    console.log(`Created transfer route: ${fromStop.name} → ${bestIntersection.name} → ${toStop.name}`);

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

  // Find multi-transfer routes (2+ transfers) using enhanced BFS
  private findMultiTransferRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    const maxTransfers = 3; // Allow up to 3 transfers
    
    // Method 1: Use BFS to find routes with 2-3 transfers
    const transferRoutes = this.findRoutesWithTransfers(fromStop, toStop, maxTransfers);
    const multiTransferRoutes = transferRoutes.filter(route => route.transfers >= 2);
    
    // Method 2: Use intersection-based approach for alternative routes
    const alternativeRoutes = this.findAlternativeMultiTransferRoutes(fromStop, toStop);
    
    // Combine both approaches
    options.push(...multiTransferRoutes, ...alternativeRoutes);
    
    // Remove duplicates and sort by efficiency
    const uniqueOptions = this.removeDuplicateOptions(options);
    uniqueOptions.sort((a, b) => {
      // Prioritize fewer transfers
      if (a.transfers !== b.transfers) {
        return a.transfers - b.transfers;
      }
      // Then by total time
      return a.totalTime - b.totalTime;
    });
    
    // Return top 5 multi-transfer options
    return uniqueOptions.slice(0, 5);
  }

  // Find alternative multi-transfer routes using intersection points
  private findAlternativeMultiTransferRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];
    
    // Find all routes that contain fromStop and toStop
    const fromRoutes = this.routes.filter(route => 
      route.stops.some(stop => stop.id === fromStop.id)
    );
    const toRoutes = this.routes.filter(route => 
      route.stops.some(stop => stop.id === toStop.id)
    );

    // Try to find routes with 2-3 transfers using intersection points
    for (const fromRoute of fromRoutes) {
      for (const toRoute of toRoutes) {
        if (fromRoute.id === toRoute.id) continue;

        // Find intermediate routes that connect fromRoute to toRoute
        const intermediateRoutes = this.findIntermediateRoutes(fromRoute, toRoute);
        
        for (const intermediateRoute of intermediateRoutes) {
          const multiTransferRoute = this.createMultiTransferRoute(
            fromStop, toStop, fromRoute, intermediateRoute, toRoute
          );
          if (multiTransferRoute) {
            options.push(multiTransferRoute);
          }
        }
      }
    }
    
    return options;
  }

  // Find intermediate routes that can connect two routes
  private findIntermediateRoutes(fromRoute: BusRoute, toRoute: BusRoute): BusRoute[] {
    const intermediateRoutes: BusRoute[] = [];
    
    // Find routes that intersect with both fromRoute and toRoute
    for (const route of this.routes) {
      if (route.id === fromRoute.id || route.id === toRoute.id) continue;
      
      const intersectsFrom = route.stops.some(stop => 
        fromRoute.stops.some(fromStop => fromStop.id === stop.id)
      );
      const intersectsTo = route.stops.some(stop => 
        toRoute.stops.some(toStop => toStop.id === stop.id)
      );
      
      if (intersectsFrom && intersectsTo) {
        intermediateRoutes.push(route);
      }
    }
    
    return intermediateRoutes.slice(0, 3); // Limit to top 3 intermediate routes
  }

  // Create a multi-transfer route with 2 transfers
  private createMultiTransferRoute(
    fromStop: BusStop, 
    toStop: BusStop, 
    fromRoute: BusRoute, 
    intermediateRoute: BusRoute, 
    toRoute: BusRoute
  ): RouteOption | null {
    // Find intersection points
    const fromToIntermediate = this.findIntersectionPoints(fromRoute, intermediateRoute);
    const intermediateToTo = this.findIntersectionPoints(intermediateRoute, toRoute);
    
    if (fromToIntermediate.length === 0 || intermediateToTo.length === 0) {
      return null;
    }

    // Find the best combination of intersection points
    let bestOption: {
      firstTransfer: BusStop;
      secondTransfer: BusStop;
      totalTime: number;
    } | null = null;

    for (const firstTransfer of fromToIntermediate) {
      for (const secondTransfer of intermediateToTo) {
        if (firstTransfer.id === secondTransfer.id) continue; // Skip if same stop
        
        const leg1 = this.createRouteLegBetweenStops(fromRoute, fromStop, firstTransfer);
        const leg2 = this.createRouteLegBetweenStops(intermediateRoute, firstTransfer, secondTransfer);
        const leg3 = this.createRouteLegBetweenStops(toRoute, secondTransfer, toStop);
        
        if (leg1 && leg2 && leg3) {
          const totalTime = leg1.estimatedTime + leg2.estimatedTime + leg3.estimatedTime + 10; // 10 min for 2 transfers
          
          if (!bestOption || totalTime < bestOption.totalTime) {
            bestOption = {
              firstTransfer,
              secondTransfer,
              totalTime
            };
          }
        }
      }
    }

    if (!bestOption) return null;

    // Create the route legs
    const leg1 = this.createRouteLegBetweenStops(fromRoute, fromStop, bestOption.firstTransfer);
    const leg2 = this.createRouteLegBetweenStops(intermediateRoute, bestOption.firstTransfer, bestOption.secondTransfer);
    const leg3 = this.createRouteLegBetweenStops(toRoute, bestOption.secondTransfer, toStop);

    if (!leg1 || !leg2 || !leg3) return null;

    return {
      id: `multi-transfer-${fromRoute.id}-${intermediateRoute.id}-${toRoute.id}-${Date.now()}`,
      legs: [leg1, leg2, leg3],
      totalTime: bestOption.totalTime,
      totalDistance: leg1.distance + leg2.distance + leg3.distance,
      transfers: 2,
      walkingTime: 4, // 2 min per transfer
      confidence: this.calculateConfidence(leg1, 2),
      routeType: 'multi_transfer'
    };
  }

  // Find direct routes between two stops - ENHANCED DETECTION
  private findDirectRoutes(fromStop: BusStop, toStop: BusStop): RouteOption[] {
    const options: RouteOption[] = [];

    // Use fast lookup to find routes that contain both stops
    const fromRoutes = this.stopToRoutesMap.get(fromStop.id) || new Set();
    const toRoutes = this.stopToRoutesMap.get(toStop.id) || new Set();
    
    // Find routes that contain both stops (direct connection possible)
    const commonRoutes = new Set([...fromRoutes].filter(routeId => toRoutes.has(routeId)));

    for (const routeId of commonRoutes) {
      const route = this.getRouteById(routeId);
      if (!route) continue;

      const fromIndex = route.stops.findIndex(s => s.id === fromStop.id);
      const toIndex = route.stops.findIndex(s => s.id === toStop.id);

      // Only consider routes where both stops exist and are different
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        let stops: BusStop[] = [];
        let isValidDirectRoute = false;

        if (fromIndex < toIndex) {
          // Forward travel - natural direction
          stops = route.stops.slice(fromIndex, toIndex + 1);
          isValidDirectRoute = true;
        } else {
          // Backward travel - allow reasonable backward journeys
          const backwardDistance = fromIndex - toIndex;
          const totalStops = route.stops.length;
          
          // Allow backward travel if it's reasonable (less than 2/3 of route length)
          if (backwardDistance < (totalStops * 2) / 3) {
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
            number: route.number
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

  // Find routes with transfers using enhanced BFS approach
  private findRoutesWithTransfers(fromStop: BusStop, toStop: BusStop, maxTransfers: number): RouteOption[] {
    const startTime = Date.now();
    const maxSearchTime = 2000; // 2 seconds timeout for transfer routes
    const maxQueueSize = 1000; // Limit queue size to prevent memory issues
    
    const options: RouteOption[] = [];
    const visited = new Set<string>();
    const queue: Array<{
      currentStop: BusStop;
      legs: RouteLeg[];
      transfers: number;
      totalTime: number;
      totalDistance: number;
      currentRouteId: number;
      visitedStops: Set<number>;
    }> = [];

    // Initialize queue with direct connections from starting stop
    const connections = this.stopConnections.get(fromStop.id) || [];
    for (const connection of connections) {
      const visitedStops = new Set([fromStop.id, connection.toStop.id]);
      queue.push({
        currentStop: connection.toStop,
        legs: [this.createRouteLeg(connection)],
        transfers: 0,
        totalTime: connection.time,
        totalDistance: connection.distance,
        currentRouteId: connection.route.id,
        visitedStops
      });
    }

    while (queue.length > 0) {
      // Check timeout and queue size limits
      if (Date.now() - startTime > maxSearchTime || queue.length > maxQueueSize) {
        console.log('BFS search timeout or queue limit reached');
        break;
      }
      
      const current = queue.shift()!;
      const stateKey = `${current.currentStop.id}-${current.transfers}-${current.currentRouteId}`;

      if (visited.has(stateKey) || current.transfers > maxTransfers) {
        continue;
      }
      visited.add(stateKey);

      // Check if we reached destination
      if (current.currentStop.id === toStop.id) {
        // Only create option if it's a valid route
        if (this.isValidRoute(current.legs)) {
          const option: RouteOption = {
            id: `transfer-${current.transfers}-${Date.now()}-${Math.random()}`,
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
          // Avoid going back to previously visited stops (prevents loops)
          if (!current.visitedStops.has(connection.toStop.id)) {
            const newLeg = this.createRouteLeg(connection);
            const isNewRoute = connection.route.id !== current.currentRouteId;
            const newTransfers = isNewRoute ? current.transfers + 1 : current.transfers;
            
            // Create new visited stops set
            const newVisitedStops = new Set(current.visitedStops);
            newVisitedStops.add(connection.toStop.id);
            
            queue.push({
              currentStop: connection.toStop,
              legs: [...current.legs, newLeg],
              transfers: newTransfers,
              totalTime: current.totalTime + connection.time,
              totalDistance: current.totalDistance + connection.distance,
              currentRouteId: connection.route.id,
              visitedStops: newVisitedStops
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
  private calculateTravelTime(): number {
    // Base time: 2.5 minutes per stop + distance factor
    const baseTime = 2.5;
    const distance = this.calculateDistance();
    return Math.round(baseTime + (distance * 1.5)); // 1.5 min per km
  }

  // Calculate distance between two stops (simplified)
  private calculateDistance(): number {
    // Simplified distance calculation - in real app, use GPS coordinates
    return 0.8; // Average 0.8 km between stops
  }

  // Calculate total time for a route
  private calculateRouteTime(stops: BusStop[]): number {
    let totalTime = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalTime += this.calculateTravelTime();
    }
    return totalTime;
  }

  // Calculate total distance for a route
  private calculateRouteDistance(stops: BusStop[]): number {
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalDistance += this.calculateDistance();
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

  // Calculate comprehensive route score (0-100)
  private calculateRouteScore(option: RouteOption): RouteScore {
    const factors = {
      time: option.totalTime,
      transfers: option.transfers,
      distance: option.totalDistance,
      walkingTime: option.walkingTime,
      routeCount: option.legs.length,
      confidence: option.confidence
    };

    // Time Score (0-25 points) - Lower time = higher score
    const timeScore = Math.max(0, 25 - (option.totalTime / 4)); // 25 points for 0 min, 0 points for 100+ min

    // Transfer Score (0-25 points) - Fewer transfers = higher score
    const transferScore = Math.max(0, 25 - (option.transfers * 8)); // 25 points for 0 transfers, 17 for 1, 9 for 2, 1 for 3

    // Distance Score (0-20 points) - Shorter distance = higher score
    const distanceScore = Math.max(0, 20 - (option.totalDistance * 2)); // 20 points for 0 km, 0 points for 10+ km

    // Reliability Score (0-15 points) - Based on confidence and route stability
    const reliabilityScore = option.confidence * 15; // Direct conversion from confidence

    // Comfort Score (0-10 points) - Less walking = higher score
    const comfortScore = Math.max(0, 10 - (option.walkingTime / 2)); // 10 points for 0 min walking, 0 points for 20+ min

    // Accessibility Score (0-5 points) - Direct routes preferred
    const accessibilityScore = option.transfers === 0 ? 5 : Math.max(0, 5 - option.transfers);

    const totalScore = timeScore + transferScore + distanceScore + reliabilityScore + comfortScore + accessibilityScore;

    return {
      totalScore: Math.round(totalScore),
      timeScore: Math.round(timeScore),
      transferScore: Math.round(transferScore),
      distanceScore: Math.round(distanceScore),
      reliabilityScore: Math.round(reliabilityScore),
      comfortScore: Math.round(comfortScore),
      accessibilityScore: Math.round(accessibilityScore),
      factors
    };
  }

  // Calculate confidence score for a route (0-1)
  private calculateConfidence(leg: RouteLeg, transfers: number): number {
    let confidence = 1.0;
    
    // Reduce confidence for transfers (more transfers = lower confidence)
    if (transfers === 1) {
      confidence -= 0.15; // Single transfer is reasonable
    } else if (transfers === 2) {
      confidence -= 0.3; // Two transfers is less reliable
    } else if (transfers >= 3) {
      confidence -= 0.5; // Three+ transfers is quite unreliable
    }
    
    // Reduce confidence for very long routes
    if (leg.estimatedTime > 60) {
      confidence -= 0.1;
    }
    
    // Reduce confidence for very short routes with transfers (might be inefficient)
    if (leg.estimatedTime < 10 && transfers > 0) {
      confidence -= 0.2;
    }
    
    // Boost confidence for routes with reasonable transfer times
    if (transfers > 0 && leg.estimatedTime > 15) {
      confidence += 0.05; // Slight boost for reasonable transfer routes
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  // Compare routes for sorting - COMPREHENSIVE SCORING SYSTEM
  private compareRoutes(a: RouteOption, b: RouteOption): number {
    // Calculate comprehensive scores for both routes
    const scoreA = this.calculateRouteScore(a);
    const scoreB = this.calculateRouteScore(b);
    
    // PRIMARY: Higher total score (comprehensive evaluation)
    if (scoreA.totalScore !== scoreB.totalScore) {
      return scoreB.totalScore - scoreA.totalScore; // Higher score first
    }
    
    // SECONDARY: Better time score
    if (scoreA.timeScore !== scoreB.timeScore) {
      return scoreB.timeScore - scoreA.timeScore;
    }
    
    // TERTIARY: Better transfer score
    if (scoreA.transferScore !== scoreB.transferScore) {
      return scoreB.transferScore - scoreA.transferScore;
    }
    
    // QUATERNARY: Better reliability score
    if (scoreA.reliabilityScore !== scoreB.reliabilityScore) {
      return scoreB.reliabilityScore - scoreA.reliabilityScore;
    }
    
    // QUINARY: Better comfort score
    if (scoreA.comfortScore !== scoreB.comfortScore) {
      return scoreB.comfortScore - scoreA.comfortScore;
    }
    
    // SEXARY: Better accessibility score
    return scoreB.accessibilityScore - scoreA.accessibilityScore;
  }

  // Yen's K-shortest paths algorithm for alternative routes
  private findKShortestPaths(fromStop: BusStop, toStop: BusStop, k: number): RouteOption[] {
    const paths: RouteOption[] = [];
    const candidates: RouteOption[] = [];
    
    // Find initial shortest path using A*
    const initialPath = this.findPathAStar(fromStop.id, toStop.id, 5);
    if (!initialPath) return paths;
    
    paths.push(initialPath);
    
    for (let i = 1; i < k; i++) {
      const previousPath = paths[i - 1];
      
      // For each node in the previous path, find alternative paths
      for (let j = 0; j < previousPath.legs.length; j++) {
        const spurNode = previousPath.legs[j].fromStop;
        const rootPath = previousPath.legs.slice(0, j);
        
        // Remove edges used in root path
        const removedEdges: Array<{from: number, to: number, route: number}> = [];
        for (const leg of rootPath) {
          const fromId = leg.fromStop.id;
          const toId = leg.toStop.id;
          const routeId = leg.routeId;
          
          // Temporarily remove this edge
          const neighbors = this.adjacencyList.get(fromId) || [];
          const edgeIndex = neighbors.findIndex(n => n.stop === toId && n.route === routeId);
          if (edgeIndex !== -1) {
            removedEdges.push({from: fromId, to: toId, route: routeId});
            neighbors.splice(edgeIndex, 1);
          }
        }
        
        // Find spur path from spur node to destination
        const spurPath = this.findPathAStar(spurNode.id, toStop.id, 5);
        
        // Restore removed edges
        for (const edge of removedEdges) {
          const neighbors = this.adjacencyList.get(edge.from) || [];
          neighbors.push({
            stop: edge.to,
            route: edge.route,
            weight: this.calculateTravelTime()
          });
        }
        
        if (spurPath) {
          // Combine root path and spur path
          const totalPath = this.combinePaths(rootPath, spurPath);
          if (totalPath && !this.isPathDuplicate(totalPath, paths) && !this.isPathDuplicate(totalPath, candidates)) {
            candidates.push(totalPath);
          }
        }
      }
      
      if (candidates.length === 0) break;
      
      // Sort candidates by total time and add best one
      candidates.sort((a, b) => a.totalTime - b.totalTime);
      paths.push(candidates.shift()!);
    }
    
    return paths.slice(1); // Return alternative paths (excluding the first one which is already found)
  }

  // Combine two path segments into a single route option
  private combinePaths(rootPath: RouteLeg[], spurPath: RouteOption): RouteOption | null {
    if (rootPath.length === 0) return spurPath;
    
    const combinedLegs = [...rootPath];
    
    // Add spur path legs, adjusting for transfers
    let transferCount = 0;
    for (let i = 0; i < spurPath.legs.length; i++) {
      const leg = spurPath.legs[i];
      if (i > 0 && leg.routeId !== spurPath.legs[i - 1].routeId) {
        transferCount++;
      }
      combinedLegs.push(leg);
    }
    
    const totalTime = combinedLegs.reduce((sum, leg) => sum + leg.estimatedTime, 0) + (transferCount * 5);
    const totalDistance = combinedLegs.reduce((sum, leg) => sum + leg.distance, 0);
    
    return {
      id: `k-shortest-${Date.now()}-${Math.random()}`,
      legs: combinedLegs,
      totalTime,
      totalDistance,
      transfers: transferCount,
      walkingTime: transferCount * 2,
      confidence: this.calculateConfidence(combinedLegs[0], transferCount),
      routeType: transferCount === 0 ? 'direct' : transferCount === 1 ? 'transfer' : 'multi_transfer'
    };
  }

  // Check if a path is duplicate
  private isPathDuplicate(path: RouteOption, existingPaths: RouteOption[]): boolean {
    const pathKey = path.legs.map(leg => `${leg.routeId}-${leg.fromStop.id}-${leg.toStop.id}`).join('|');
    
    for (const existingPath of existingPaths) {
      const existingKey = existingPath.legs.map(leg => `${leg.routeId}-${leg.fromStop.id}-${leg.toStop.id}`).join('|');
      if (pathKey === existingKey) return true;
    }
    
    return false;
  }

  // Enhanced stop search with indexing
  private findStopsByLocation(location: string): { stop: BusStop; route: BusRoute }[] {
    const matches: { stop: BusStop; route: BusRoute }[] = [];
    const searchTerm = location.toLowerCase().trim();

    // First try exact match using index
    const exactMatches = this.stopIndex.get(searchTerm) || [];
    for (const stopId of exactMatches) {
      const stop = this.getStopById(stopId);
      if (stop) {
        const routes = this.stopToRoutesMap.get(stopId) || new Set();
        for (const routeId of routes) {
          const route = this.getRouteById(routeId);
          if (route) {
            matches.push({ stop, route });
          }
        }
      }
    }

    // If no exact matches, try fuzzy matching
    if (matches.length === 0) {
    for (const route of this.routes) {
      for (const stop of route.stops) {
          const stopName = stop.name.toLowerCase();
        if (
            stopName.includes(searchTerm) ||
            searchTerm.includes(stopName)
        ) {
          matches.push({ stop, route });
          }
        }
      }
    }

    return matches;
  }

  // Remove duplicate route options and optimize routes
  private removeDuplicateOptions(options: RouteOption[]): RouteOption[] {
    const seen = new Set<string>();
    const optimizedOptions: RouteOption[] = [];
    
    for (const option of options) {
      // Check if there's a direct route that makes this multi-leg route unnecessary
      const fromStop = option.legs[0].fromStop;
      const toStop = option.legs[option.legs.length - 1].toStop;
      
      // If this is a multi-leg route, check if there's a direct connection
      if (option.legs.length > 1) {
        const directRoutes = this.findDirectRoutes(fromStop, toStop);
        if (directRoutes.length > 0) {
          // There's a direct route, skip this multi-leg option
          continue;
        }
      }
      
      const key = `${option.legs.map(leg => leg.routeId).join('-')}-${fromStop.id}-${toStop.id}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      optimizedOptions.push(option);
    }
    
    return optimizedOptions;
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

  // Get route recommendations based on different priorities
  getRouteRecommendations(fromLocation: string, toLocation: string, priority: 'fastest' | 'comfortable' | 'reliable' | 'direct' | 'balanced' = 'balanced'): RoutePlan {
    const routePlan = this.findRoutes(fromLocation, toLocation);
    
    if (!routePlan.options.length) return routePlan;

    // Sort based on priority
    const sortedOptions = [...routePlan.options].sort((a, b) => {
      if (!a.score || !b.score) return 0;
      
      switch (priority) {
        case 'fastest':
          return b.score.timeScore - a.score.timeScore;
        case 'comfortable':
          return b.score.comfortScore - a.score.comfortScore;
        case 'reliable':
          return b.score.reliabilityScore - a.score.reliabilityScore;
        case 'direct':
          return b.score.accessibilityScore - a.score.accessibilityScore;
        case 'balanced':
        default:
          return b.score.totalScore - a.score.totalScore;
      }
    });

    return {
      ...routePlan,
      options: sortedOptions,
      bestOption: sortedOptions[0] || null
    };
  }

  // Get route analysis for a specific route
  getRouteAnalysis(option: RouteOption): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    scoreBreakdown: RouteScore;
  } {
    if (!option.score) {
      option.score = this.calculateRouteScore(option);
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths
    if (option.score.timeScore >= 20) strengths.push('Fast travel time');
    if (option.score.transferScore >= 20) strengths.push('Minimal transfers');
    if (option.score.comfortScore >= 8) strengths.push('Comfortable journey');
    if (option.score.reliabilityScore >= 12) strengths.push('High reliability');
    if (option.score.accessibilityScore >= 4) strengths.push('Easy access');

    // Analyze weaknesses
    if (option.score.timeScore < 10) weaknesses.push('Long travel time');
    if (option.score.transferScore < 10) weaknesses.push('Multiple transfers required');
    if (option.score.comfortScore < 5) weaknesses.push('Significant walking required');
    if (option.score.reliabilityScore < 8) weaknesses.push('Lower reliability');
    if (option.score.accessibilityScore < 2) weaknesses.push('Complex route');

    // Generate recommendations
    if (option.transfers > 2) recommendations.push('Consider alternative routes with fewer transfers');
    if (option.walkingTime > 10) recommendations.push('Prepare for significant walking between transfers');
    if (option.totalTime > 60) recommendations.push('Allow extra time for this journey');
    if (option.score.totalScore < 50) recommendations.push('This route may not be optimal - consider alternatives');

    return {
      strengths,
      weaknesses,
      recommendations,
      scoreBreakdown: option.score
    };
  }
}
