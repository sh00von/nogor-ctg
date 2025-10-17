/**
 * Bus Routes Data and Utilities
 * 
 * This module contains all bus route data for the Chittagong bus tracking system,
 * including regular bus routes and Leguna service routes (city circular routes).
 * It provides fast lookup functions and utilities for route planning.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a bus stop with optional coordinates
 */
export interface BusStop {
  id: number;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Represents a complete bus route with all stops and metadata
 */
export interface BusRoute {
  id: number;
  name: string;
  number: string;
  stops: BusStop[];
  color: string;
  description?: string;
  firstStop: number;
  lastStop: number;
  totalStops: number;
}

/**
 * Fast lookup index for O(1) route and stop searches
 */
export interface RouteIndex {
  stopToRoutes: Map<number, number[]>; // stopId -> routeIds[]
  routeToStops: Map<number, number[]>; // routeId -> stopIds[]
  stopNames: Map<number, string>; // stopId -> stopName
  routeNames: Map<number, string>; // routeId -> routeName
}

// ============================================================================
// ROUTE DATA
// ============================================================================

/**
 * Regular Bus Routes (Main city routes)
 * Routes 1-11 covering major areas of Chittagong
 */
export const busRoutes: BusRoute[] = [
  {
    id: 1,
    name: "1 no Bus",
    number: "1",
    color: "#3B82F6",
    description: "Karnaphuli Bridge to New Market (10 km)",
    firstStop: 1,
    lastStop: 12,
    totalStops: 12,
    stops: [
      { id: 1, name: "Karnaphuli Bridge" },
      { id: 2, name: "Rajakhali" },
      { id: 3, name: "Kalamia Bazar" },
      { id: 4, name: "Nahar CNG" },
      { id: 5, name: "Ek Kilometer" },
      { id: 6, name: "Bahaddarhat" },
      { id: 7, name: "Kapasgola" },
      { id: 8, name: "Chawkbazar" },
      { id: 9, name: "Sirajuddowla Road" },
      { id: 10, name: "Andarkilla" },
      { id: 11, name: "Laldighi" },
      { id: 12, name: "New Market" }
    ]
  },
  {
    id: 2,
    name: "2 no Bus",
    number: "2",
    color: "#10B981",
    description: "Kalurghat Bridge to New Market (14 km)",
    firstStop: 13,
    lastStop: 12,
    totalStops: 15,
    stops: [
      { id: 13, name: "Kalurghat Bridge" },
      { id: 14, name: "Ispahani Mosque" },
      { id: 15, name: "Kaptai Road Junction" },
      { id: 16, name: "CMP Road Junction" },
      { id: 17, name: "Sharafat Petrol Pump" },
      { id: 18, name: "Bus Terminal" },
      { id: 6, name: "Bahaddarhat" },
      { id: 19, name: "Muradpur" },
      { id: 20, name: "2no Gate" },
      { id: 21, name: "Medical" },
      { id: 8, name: "Chawkbazar" },
      { id: 23, name: "Jamalkhan Road" },
      { id: 10, name: "Andarkilla" },
      { id: 11, name: "Laldighi" },
      { id: 12, name: "New Market" }
    ]
  },
  {
    id: 3,
    name: "3 no Bus",
    number: "3",
    color: "#F59E0B",
    description: "Fateyabad to New Market (14.5 km)",
    firstStop: 24,
    lastStop: 12,
    totalStops: 12,
    stops: [
      { id: 24, name: "Fateyabad" },
      { id: 25, name: "Nandir Hat" },
      { id: 26, name: "Baluchara" },
      { id: 27, name: "Oxygen" },
      { id: 28, name: "Hamzarbag" },
      { id: 19, name: "Muradpur" },
      { id: 29, name: "Probortok Moor" },
      { id: 30, name: "Golpahar" },
      { id: 31, name: "Kazir Deuri" },
      { id: 32, name: "Enayet Bazar" },
      { id: 33, name: "Tin Poler Matha" },
      { id: 12, name: "New Market" }
    ]
  },
  {
    id: 4,
    name: "4 no Bus",
    number: "4",
    color: "#EF4444",
    description: "New Market to Airport (15 km)",
    firstStop: 12,
    lastStop: 44,
    totalStops: 17,
    stops: [
      { id: 12, name: "New Market" },
      { id: 34, name: "Puraton Station" },
      { id: 35, name: "Tiger Pass" },
      { id: 36, name: "Choumuhani" },
      { id: 37, name: "Badamtali" },
      { id: 38, name: "Barek Building" },
      { id: 39, name: "Fakir Hat" },
      { id: 40, name: "Nimtala Bridge" },
      { id: 41, name: "Salt Gola" },
      { id: 42, name: "CEPZED" },
      { id: 43, name: "Bandar Tila" },
      { id: 44, name: "Cement Crossing" },
      { id: 45, name: "Floatila" },
      { id: 46, name: "Standard Asiatic Well" },
      { id: 47, name: "Drydock" },
      { id: 48, name: "Koylar Dipu" },
      { id: 49, name: "Airport" }
    ]
  },
  {
    id: 5,
    name: "5 no Bus",
    number: "5",
    color: "#8B5CF6",
    description: "New Market to Sea Beach (18.6 km)",
    firstStop: 12,
    lastStop: 50,
    totalStops: 15,
    stops: [
      { id: 12, name: "New Market" },
      { id: 34, name: "Puraton Station" },
      { id: 35, name: "Tiger Pass" },
      { id: 36, name: "Choumuhani" },
      { id: 37, name: "Badamtali" },
      { id: 38, name: "Barek Building" },
      { id: 39, name: "Fakir Hat" },
      { id: 40, name: "Nimtala Bridge" },
      { id: 41, name: "Salt Gola" },
      { id: 42, name: "CEPZED" },
      { id: 43, name: "Bandar Tila" },
      { id: 44, name: "Cement Crossing" },
      { id: 51, name: "Steel Mill Bazar" },
      { id: 52, name: "Katgar Refinery Gate" },
      { id: 50, name: "Sea Beach" }
    ]
  },
  {
    id: 6,
    name: "6 no Bus",
    number: "6",
    color: "#EC4899",
    description: "Laldighi to Sea Beach (16.6 km)",
    firstStop: 11,
    lastStop: 50,
    totalStops: 15,
    stops: [
      { id: 11, name: "Laldighi" },
      { id: 12, name: "New Market" },
      { id: 34, name: "Puraton Station" },
      { id: 35, name: "Tiger Pass" },
      { id: 36, name: "Choumuhani" },
      { id: 37, name: "Badamtali" },
      { id: 38, name: "Barek Building" },
      { id: 39, name: "Fakir Hat" },
      { id: 40, name: "Nimtala Bridge" },
      { id: 41, name: "Salt Gola" },
      { id: 42, name: "CEPZED" },
      { id: 43, name: "Bandar Tila" },
      { id: 44, name: "Cement Crossing" },
      { id: 51, name: "Steel Mill Bazar" },
      { id: 52, name: "Katgar Refinery Gate" },
      { id: 50, name: "Sea Beach" }
    ]
  },
  {
    id: 7,
    name: "7 no Bus",
    number: "7",
    color: "#F97316",
    description: "Kotowali Mor to Bhatiari (16.1 km)",
    firstStop: 53,
    lastStop: 54,
    totalStops: 16,
    stops: [
      { id: 53, name: "Kotowali Mor" },
      { id: 12, name: "New Market" },
      { id: 34, name: "Puraton Station" },
      { id: 35, name: "Tiger Pass" },
      { id: 36, name: "Choumuhani" },
      { id: 37, name: "Badamtali" },
      { id: 55, name: "Jela Police Line" },
      { id: 56, name: "Rajmukut" },
      { id: 57, name: "Wapda Gate" },
      { id: 58, name: "Noyabazar" },
      { id: 59, name: "Alankar" },
      { id: 60, name: "Kornel Hat" },
      { id: 39, name: "Fakir Hat" },
      { id: 61, name: "Fouzdar Hat" },
      { id: 62, name: "Banur Bazar" },
      { id: 54, name: "Bhatiari" }
    ]
  },
  {
    id: 8,
    name: "8 no Bus",
    number: "8",
    color: "#84CC16",
    description: "New Market to Oxygen (8 km)",
    firstStop: 12,
    lastStop: 27,
    totalStops: 9,
    stops: [
      { id: 12, name: "New Market" },
      { id: 63, name: "Kadam Tali" },
      { id: 35, name: "Tiger Pass" },
      { id: 64, name: "WASA" },
      { id: 20, name: "2no Gate" },
      { id: 65, name: "Rubi Gate" },
      { id: 66, name: "Shershah Colony" },
      { id: 67, name: "Bayezid" },
      { id: 27, name: "Oxygen" }
    ]
  },
  {
    id: 10,
    name: "10 no Bus",
    number: "10",
    color: "#6366F1",
    description: "Kalurghat to Sea Beach (25 km)",
    firstStop: 13,
    lastStop: 50,
    totalStops: 19,
    stops: [
      { id: 13, name: "Kalurghat Bridge" },
      { id: 14, name: "Ispahani Mosque" },
      { id: 15, name: "Kaptai Road Junction" },
      { id: 18, name: "Bus Terminal" },
      { id: 6, name: "Bahaddarhat" },
      { id: 19, name: "Muradpur" },
      { id: 20, name: "2no Gate" },
      { id: 68, name: "GEC" },
      { id: 69, name: "Ispahani Mor" },
      { id: 70, name: "Deowan Hat" },
      { id: 38, name: "Barek Building" },
      { id: 37, name: "Badamtali" },
      { id: 71, name: "Bandar Post Office" },
      { id: 72, name: "Customs Bridge" },
      { id: 41, name: "Salt Gola" },
      { id: 42, name: "CEPZED" },
      { id: 43, name: "Bandar Tila" },
      { id: 44, name: "Cement Crossing" },
      { id: 73, name: "Katgar Refinery Colony Gate" },
      { id: 50, name: "Sea Beach" }
    ]
  },
  {
    id: 11,
    name: "11 no Bus",
    number: "11",
    color: "#14B8A6",
    description: "Bhatiari to Sea Beach (23 km)",
    firstStop: 54,
    lastStop: 50,
    totalStops: 18,
    stops: [
      { id: 54, name: "Bhatiari" },
      { id: 74, name: "BM Gate" },
      { id: 62, name: "Banur Bazar" },
      { id: 61, name: "Fouzdar Hat" },
      { id: 39, name: "Fakir Hat" },
      { id: 75, name: "City Gate" },
      { id: 60, name: "Kornel Hat" },
      { id: 59, name: "Alankar" },
      { id: 58, name: "Noyabazar" },
      { id: 57, name: "Wapda Gate" },
      { id: 76, name: "Boro Pol" },
      { id: 40, name: "Nimtala Bridge" },
      { id: 77, name: "Custom Mor" },
      { id: 41, name: "Salt Gola" },
      { id: 42, name: "CEPZED" },
      { id: 43, name: "Bandar Tila" },
      { id: 51, name: "Steel Mill Bazar" },
      { id: 52, name: "Katgar Refinery Gate" },
      { id: 50, name: "Sea Beach" }
    ]
  }
];

/**
 * Leguna Service Routes (City Circular Routes)
 * Short-distance routes for local transportation within city areas
 */
export const legunaRoutes: BusRoute[] = [
  {
    id: 12,
    name: "Leguna Service 1",
    number: "Leguna -1",
    color: "#8B5CF6",
    description: "Oxygen to 2no Gate (City Circular Route)",
    firstStop: 27,
    lastStop: 20,
    totalStops: 5,
    stops: [
      { id: 27, name: "Oxygen" },
      { id: 67, name: "Bayezid" },
      { id: 66, name: "Shershah Colony" },
      { id: 65, name: "Rubi Gate" },
      { id: 20, name: "2no Gate" }
    ]
  },
  {
    id: 13,
    name: "Leguna Service 2",
    number: "Leguna-2",
    color: "#8B5CF6",
    description: "2no Gate to Chawkbazar via Probortok Moor (City Circular Route)",
    firstStop: 20,
    lastStop: 8,
    totalStops: 3,
    stops: [
      { id: 20, name: "2no Gate" },
      { id: 29, name: "Probortok Moor" },
      { id: 8, name: "Chawkbazar" }
    ]
  },
  {
    id: 14,
    name: "Leguna Service 3",
    number: "Leguna-3",
    color: "#8B5CF6",
    description: "Bahaddarhat to WASA (City Circular Route)",
    firstStop: 6,
    lastStop: 64,
    totalStops: 6,
    stops: [
      { id: 6, name: "Bahaddarhat" },
      { id: 19, name: "Muradpur" },
      { id: 20, name: "2no Gate" },
      { id: 68, name: "GEC" },
      { id: 78, name: "Dam Para" },
      { id: 64, name: "WASA" }
    ]
  },
  {
    id: 15,
    name: "Leguna Service 4",
    number: "Leguna-4",
    color: "#8B5CF6",
    description: "Oxygen to Aman Bazar (City Circular Route)",
    firstStop: 27,
    lastStop: 79,
    totalStops: 4,
    stops: [
      { id: 27, name: "Oxygen" },
      { id: 26, name: "Baluchara" },
      { id: 80, name: "Natun Para" },
      { id: 79, name: "Aman Bazar" }
    ]
  }
];

/**
 * All Routes Combined
 * Contains both regular bus routes and Leguna service routes
 */
export const allRoutes: BusRoute[] = [...busRoutes, ...legunaRoutes];

// ============================================================================
// INDEX MANAGEMENT
// ============================================================================

/**
 * Cached route index for fast lookups
 */
let routeIndex: RouteIndex | null = null;

/**
 * Initialize and cache the route index for O(1) lookups
 * @returns The initialized route index
 */
function initializeRouteIndex(): RouteIndex {
  if (routeIndex) return routeIndex;
  
  const stopToRoutes = new Map<number, number[]>();
  const routeToStops = new Map<number, number[]>();
  const stopNames = new Map<number, string>();
  const routeNames = new Map<number, string>();

  for (const route of allRoutes) {
    routeNames.set(route.id, route.name);
    routeToStops.set(route.id, route.stops.map(stop => stop.id));
    
    for (const stop of route.stops) {
      stopNames.set(stop.id, stop.name);
      
      if (!stopToRoutes.has(stop.id)) {
        stopToRoutes.set(stop.id, []);
      }
      stopToRoutes.get(stop.id)!.push(route.id);
    }
  }

  routeIndex = {
    stopToRoutes,
    routeToStops,
    stopNames,
    routeNames
  };

  return routeIndex;
}

// ============================================================================
// CORE LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get all route IDs that pass through a specific stop
 * @param stopId - The stop ID to search for
 * @returns Array of route IDs
 */
export const getRoutesByStopId = (stopId: number): number[] => {
  const index = initializeRouteIndex();
  return index.stopToRoutes.get(stopId) || [];
};

/**
 * Get all stop IDs for a specific route
 * @param routeId - The route ID to search for
 * @returns Array of stop IDs
 */
export const getStopsByRouteId = (routeId: number): number[] => {
  const index = initializeRouteIndex();
  return index.routeToStops.get(routeId) || [];
};

/**
 * Get the name of a stop by its ID
 * @param stopId - The stop ID
 * @returns Stop name or undefined if not found
 */
export const getStopName = (stopId: number): string | undefined => {
  const index = initializeRouteIndex();
  return index.stopNames.get(stopId);
};

/**
 * Get the name of a route by its ID
 * @param routeId - The route ID
 * @returns Route name or undefined if not found
 */
export const getRouteName = (routeId: number): string | undefined => {
  const index = initializeRouteIndex();
  return index.routeNames.get(routeId);
};

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Find stops by name using fuzzy matching
 * @param name - The name to search for
 * @returns Array of matching BusStop objects
 */
export const findStopByName = (name: string): BusStop[] => {
  const searchTerm = name.toLowerCase().trim();
  const results: BusStop[] = [];
  
  for (const route of allRoutes) {
    for (const stop of route.stops) {
      const stopName = stop.name.toLowerCase();
      if (
        stopName === searchTerm || 
        stopName.includes(searchTerm) ||
        searchTerm.includes(stopName)
      ) {
        results.push(stop);
      }
    }
  }
  
  return results;
};

/**
 * Find routes by name or number using fuzzy matching
 * @param name - The name or number to search for
 * @returns Array of matching BusRoute objects
 */
export const findRouteByName = (name: string): BusRoute[] => {
  const searchTerm = name.toLowerCase().trim();
  return allRoutes.filter(route => 
    route.name.toLowerCase().includes(searchTerm) ||
    route.number.includes(searchTerm)
  );
};

// ============================================================================
// ROUTE-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get all Leguna routes that pass through a specific stop
 * @param stopId - The stop ID to search for
 * @returns Array of Leguna BusRoute objects
 */
export const getLegunaRoutesByStopId = (stopId: number): BusRoute[] => {
  return legunaRoutes.filter(route => 
    route.stops.some(stop => stop.id === stopId)
  );
};

/**
 * Get a specific Leguna route by its ID
 * @param routeId - The route ID
 * @returns Leguna BusRoute object or undefined if not found
 */
export const getLegunaRouteById = (routeId: number): BusRoute | undefined => {
  return legunaRoutes.find(route => route.id === routeId);
};

/**
 * Get all unique stops used by Leguna routes
 * @returns Array of unique BusStop objects, sorted by name
 */
export const getAllLegunaStops = (): BusStop[] => {
  const stopMap = new Map<number, BusStop>();
  
  for (const route of legunaRoutes) {
    for (const stop of route.stops) {
      stopMap.set(stop.id, stop);
    }
  }
  
  return Array.from(stopMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get all regular bus routes (non-Leguna)
 * @returns Array of regular BusRoute objects
 */
export const getRegularBusRoutes = (): BusRoute[] => {
  return busRoutes;
};

/**
 * Check if a route is a Leguna service route
 * @param routeId - The route ID to check
 * @returns True if the route is a Leguna service route
 */
export const isLegunaRoute = (routeId: number): boolean => {
  return legunaRoutes.some(route => route.id === routeId);
};

// ============================================================================
// GENERAL UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all unique stops from all routes
 * @returns Array of unique BusStop objects, sorted by name
 */
export const getAllStops = (): BusStop[] => {
  const stopMap = new Map<number, BusStop>();
  
  for (const route of allRoutes) {
    for (const stop of route.stops) {
      stopMap.set(stop.id, stop);
    }
  }
  
  return Array.from(stopMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get all stop names from all routes
 * @returns Array of stop names, sorted alphabetically
 */
export const getAllStopNames = (): string[] => {
  return getAllStops().map(stop => stop.name);
};

/**
 * Get all route names from all routes
 * @returns Array of route names
 */
export const getAllRouteNames = (): string[] => {
  return allRoutes.map(route => route.name);
};

/**
 * Get a specific route by its ID
 * @param routeId - The route ID
 * @returns BusRoute object or undefined if not found
 */
export const getRouteById = (routeId: number): BusRoute | undefined => {
  return allRoutes.find(route => route.id === routeId);
};

/**
 * Get all routes (regular and Leguna)
 * @returns Array of all BusRoute objects
 */
export const getAllRoutes = (): BusRoute[] => {
  return allRoutes;
};

// ============================================================================
// ROUTE ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Get the route pattern (first and last stops) for a route
 * @param routeId - The route ID
 * @returns Object with firstStop and lastStop, or null if route not found
 */
export const getRoutePattern = (routeId: number): { firstStop: BusStop; lastStop: BusStop } | null => {
  const route = getRouteById(routeId);
  if (!route || route.stops.length === 0) return null;
  
  return {
    firstStop: route.stops[0],
    lastStop: route.stops[route.stops.length - 1]
  };
};

/**
 * Get all intersection points (common stops) between two routes
 * @param routeId1 - First route ID
 * @param routeId2 - Second route ID
 * @returns Array of BusStop objects that are common to both routes
 */
export const getIntersectionPoints = (routeId1: number, routeId2: number): BusStop[] => {
  const route1 = getRouteById(routeId1);
  const route2 = getRouteById(routeId2);
  
  if (!route1 || !route2) return [];
  
  const intersections: BusStop[] = [];
  const route1StopIds = new Set(route1.stops.map(stop => stop.id));
  
  for (const stop of route2.stops) {
    if (route1StopIds.has(stop.id)) {
      intersections.push(stop);
    }
  }
  
  return intersections;
};