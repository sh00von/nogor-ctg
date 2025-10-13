'use client'
import { Bus, MapPin, Search, Navigation, Clock, Users, ArrowRight, Route as RouteIcon, ChevronsUpDown, X, Zap, Target } from 'lucide-react';
import { getAllRoutes, BusRoute } from '@/lib/bus-routes';
import { FuzzySearch } from '@/lib/fuzzy-search';
import { RoutePlanner, RoutePlan } from '@/lib/route-planner';
import toast, { Toaster } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLocation] = useState('');
  
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  
  // Shared popover state
  const [activePopover, setActivePopover] = useState<'from' | 'to' | null>(null);
  
  // Route planner states
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  
  
  const routes = useMemo(() => getAllRoutes(), []);
  
  // Initialize fuzzy search and route planner
  const fuzzySearch = useMemo(() => new FuzzySearch(routes), [routes]);
  const routePlanner = useMemo(() => new RoutePlanner(routes), [routes]);

  // Get all unique English stop names for combobox
  const allStops = useMemo(() => {
    const items = new Set<string>();
    
    // Add only English stop names
    routes.forEach(route => {
      route.stops.forEach(stop => {
        items.add(stop.name);
      });
    });
    
    return Array.from(items).sort();
  }, [routes]);

  // Filter routes based on search term
  const filteredRoutes = useMemo(() => {
    if (!searchTerm.trim()) return routes;
    return fuzzySearch.search(searchTerm);
  }, [searchTerm, fuzzySearch, routes]);

  // Get routes from current location
  const routesFromLocation = useMemo(() => {
    if (!fromValue) return [];
    return routes.filter(route => 
      route.stops.some(stop => stop.name === fromValue)
    );
  }, [fromValue, routes]);

  // Format distance helper
  const formatDistance = (distance: number) => {
    return distance.toFixed(1);
  };

  const handleRouteClick = (route: BusRoute) => {
    setSelectedRoute(route);
  };

  const handleRoutePlanning = async () => {
    if (!fromValue || !toValue) {
      toast.error('Please select both from and to locations');
      return;
    }

    setIsPlanning(true);
    try {
      const plan = routePlanner.findRoutes(fromValue, toValue);
      setRoutePlan(plan);
      
      if (plan.options.length === 0) {
        toast.error('No routes found');
      } else {
        toast.success(`${plan.options.length} routes found`);
      }
    } catch {
      toast.error('Error planning route');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleClear = () => {
    setFromValue('');
    setToValue('');
    setRoutePlan(null);
    setSearchTerm('');
  };

  // Shared popover handlers
  const handleFromClick = () => {
    console.log('From button clicked');
    setActivePopover('from');
  };

  const handleToClick = () => {
    console.log('To button clicked');
    setActivePopover('to');
  };

  const handlePopoverClose = () => {
    console.log('Popover closing');
    setActivePopover(null);
  };

  const handleLocationSelect = (location: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromValue(location);
    } else {
      setToValue(location);
    }
    setActivePopover(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Responsive Header */}
      <header className="bg-background border-b sticky top-0 z-50 safe-area-top">
        <div className="px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold lg:text-xl">
                  Chittagong Bus Tracker
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop/Tablet Layout */}
      <div className="hidden lg:block">
        <div className="px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Sidebar - Search & Quick Routes */}
              <div className="col-span-4">
                <div className="sticky top-24 space-y-6">
                  {/* Search Section */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Plan Your Journey
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Find the best bus route for your trip
                        </p>
                      </div>
                    </div>

                    {/* Desktop Search Form */}
                    <div className="space-y-4">
                      {/* From Location */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <label className="text-sm font-medium">From</label>
                        </div>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-12 text-left font-normal"
                          onClick={handleFromClick}
                        >
                          {fromValue ? fromValue : "Select starting point..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </div>

                      {/* To Location */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                          <label className="text-sm font-medium">To</label>
                        </div>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-12 text-left font-normal"
                          onClick={handleToClick}
                        >
                          {toValue ? toValue : "Select destination..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={handleClear}
                          className="flex-1 h-12 rounded-xl"
                        >
                          <X className="w-4 h-4 mr-2" />
                          <span>Clear</span>
                        </Button>
                        <Button
                          onClick={handleRoutePlanning}
                          disabled={!fromValue || !toValue || isPlanning}
                          className="flex-1 h-12 rounded-xl"
                        >
                          {isPlanning ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Planning...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              <span>Plan Route</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Route Suggestions */}
                  {(fromValue || currentLocation) && routesFromLocation.length > 0 && (
                    <div className="bg-card rounded-2xl p-6 shadow-sm border">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">Quick Routes</h3>
                          <p className="text-sm text-muted-foreground">
                            From {fromValue || currentLocation}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {routesFromLocation.slice(0, 8).map((route) => (
                          <button
                            key={route.id}
                            onClick={() => handleRouteClick(route)}
                            className="px-4 py-3 bg-secondary hover:bg-secondary/80 border rounded-lg text-sm font-medium transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-sm font-bold">
                                {route.number}
                              </div>
                              <div>
                                <div className="font-medium">{route.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {route.stops.length} Stops
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-8">
                <div className="space-y-6">
                  {/* Route Planning Results */}
                  {routePlan && routePlan.options.length > 0 && routePlan.bestOption && (
                    <div className="bg-card rounded-2xl p-6 shadow-sm border">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Route Plan Result</h3>
                          <p className="text-sm text-muted-foreground">
                            {fromValue} to {toValue}
                          </p>
                        </div>
                      </div>

                      {/* Best Route Option */}
                      <div className="bg-primary/5 rounded-xl p-6 mb-6 border border-primary/20">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">
                              Best
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(routePlan.bestOption.confidence * 100)}%
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {Math.round(routePlan.bestOption.totalTime)} min
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {routePlan.bestOption.transfers} transfers
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {routePlan.bestOption.legs.map((leg, index) => {
                            const routeObj = routes.find(r => r.id === leg.routeId);
                            const routeNumber = routeObj ? routeObj.number : leg.routeName;
                            return (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                                  {routeNumber}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {leg.fromStop.name} → {leg.toStop.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.round(leg.estimatedTime)} min • {formatDistance(leg.distance)} km
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Other Route Options */}
                      {routePlan.options.length > 1 && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Other Options</h4>
                          {routePlan.options.slice(1, 4).map((option, index) => (
                            <div key={option.id} className="bg-card rounded-xl p-4 border">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-muted">
                                    {index + 2}
                                  </div>
                                  <Badge variant="outline">
                                    {Math.round(option.confidence * 100)}%
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">
                                    {Math.round(option.totalTime)} min
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {option.transfers} transfers
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground mb-1">Each option shows the bus routes and stops for your journey.</div>
                                {option.legs.map((leg, legIndex) => {
                                  // Find the route number from the routes array using leg.routeId
                                  const routeObj = routes.find(r => r.id === leg.routeId);
                                  const routeNumber = routeObj ? routeObj.number : leg.routeName;
                                  return (
                                    <div key={legIndex} className="flex items-center gap-3 text-sm">
                                      <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-xs font-bold text-primary-foreground">
                                        {routeNumber}
                                      </div>
                                      <span>
                                        {leg.fromStop.name} → {leg.toStop.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Routes Grid */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <RouteIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">All Bus Routes</h3>
                        <p className="text-sm text-muted-foreground">
                          {routes.length} BRTA approved routes
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="cursor-pointer transition-all duration-300 group bg-card rounded-xl p-4 border hover:shadow-md hover:border-primary/20"
                          onClick={() => handleRouteClick(route)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                              {route.number}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold mb-1">{route.name}</div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {route.stops[0]?.name} → {route.stops[route.stops.length - 1]?.name}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {route.stops.length} stops
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.round(route.stops.length * 2.5)} minutes
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-4 pb-20">
          
          {/* Quick Search Bar - Native Style */}
          <div className="mb-6">
            <div className="bg-card rounded-2xl p-4 shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">
                    Plan Your Journey
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Find your destination
                  </p>
                </div>
              </div>

              {/* Mobile App Search Form */}
              <div className="space-y-3">
                {/* From Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <label className="text-sm font-medium">From</label>
                  </div>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-14 text-left font-normal"
                    onClick={handleFromClick}
                  >
                    {fromValue ? fromValue : "Select starting point"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </div>

                {/* To Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <label className="text-sm font-medium">To</label>
                  </div>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-14 text-left font-normal"
                    onClick={handleToClick}
                  >
                    {toValue ? toValue : "Select destination"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <X className="w-4 h-4 mr-2" />
                    <span>Clear</span>
                  </Button>
                  <Button
                    onClick={handleRoutePlanning}
                    disabled={!fromValue || !toValue || isPlanning}
                    className="flex-1 h-12 rounded-xl"
                  >
                    {isPlanning ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>Plan Route</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Route Suggestions */}
          {(fromValue || currentLocation) && routesFromLocation.length > 0 && (
            <div className="mb-8">
              <Card className="shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Quick Routes</h3>
                      <p className="text-sm text-muted-foreground">
                        From {fromValue || currentLocation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                    {routesFromLocation.slice(0, 6).map((route) => (
                      <button
                        key={route.id}
                        onClick={() => handleRouteClick(route)}
                        className="px-3 py-2 bg-secondary hover:bg-secondary/80 border rounded-lg text-sm font-medium transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {route.number}
                          </div>
                          <span>{route.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mobile App Route Results */}
          {routePlan && routePlan.options.length > 0 && routePlan.bestOption && (
            <div className="mb-6">
              <div className="bg-card rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Route Plan Result</h3>
                    <p className="text-sm text-muted-foreground">
                      {fromValue} to {toValue}
                    </p>
                  </div>
                </div>

                {/* Best Route Option */}
                <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Best
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(routePlan.bestOption.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {Math.round(routePlan.bestOption.totalTime)} min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {routePlan.bestOption.transfers} transfers
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {routePlan.bestOption.legs.map((leg, index) => {
                      const routeObj = routes.find(r => r.id === leg.routeId);
                      const routeNumber = routeObj ? routeObj.number : leg.routeName;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {routeNumber}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {leg.fromStop.name} → {leg.toStop.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(leg.estimatedTime)} min • {formatDistance(leg.distance)} km
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Route Options */}
                <div className="space-y-4">
                  {routePlan.options.slice(0, 3).map((option, index) => (
                    <div key={option.id}>
                      <div className={`bg-card rounded-xl p-4 border ${index === 0 ? 'ring-2 ring-primary' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-primary' : 'bg-muted'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {Math.round(option.totalTime)} min
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {option.transfers} transfers • {formatDistance(option.totalDistance)} km
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {Math.round(option.confidence * 100)}%
                          </Badge>
                        </div>

                        {/* Route Details */}
                        <div className="space-y-2">
                          {option.legs.map((leg, legIndex) => {
                            // Find the route number from the routes array using leg.routeId
                            const routeObj = routes.find(r => r.id === leg.routeId);
                            const routeNumber = routeObj ? routeObj.number : leg.routeName;
                            return (
                              <div key={legIndex} className="flex items-center gap-3 text-sm">
                                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-xs font-bold text-primary-foreground">
                                  {routeNumber}
                                </div>
                                <div className="flex-1">
                                  <div>
                                    {leg.fromStop.name} → {leg.toStop.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {Math.round(leg.estimatedTime)} min • {formatDistance(leg.distance)} km
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Routes Section */}
          <div className="bg-card rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <RouteIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">All Bus Routes</h3>
                <p className="text-sm text-muted-foreground">
                  {routes.length} BRTA approved routes
                </p>
              </div>
            </div>

            {searchTerm ? (
              <div className="mb-4">
                <div className="text-sm text-muted-foreground">
                  {filteredRoutes.length} results for &quot;{searchTerm}&quot;
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredRoutes.map((route) => (
                  <div key={route.id}>
                    <div 
                      className="cursor-pointer transition-all duration-300 group bg-card rounded-2xl p-4 shadow-sm border hover:shadow-md active:scale-95"
                      onClick={() => handleRouteClick(route)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {route.number}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{route.name}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {route.stops[0]?.name} → {route.stops[route.stops.length - 1]?.name}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {route.stops.length} Stops
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.round(route.stops.length * 2.5)} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Route Details Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-lg">
            {/* Modal Header */}
            <div className="bg-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {selectedRoute.number}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary-foreground">
                      {selectedRoute.name}
                    </h2>
                    <p className="text-primary-foreground/80">
                      {selectedRoute.stops[0]?.name} → {selectedRoute.stops[selectedRoute.stops.length - 1]?.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRoute(null)}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">{selectedRoute.stops.length} Stops</div>
                    <div className="text-sm text-muted-foreground">Total stops</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">{Math.round(selectedRoute.stops.length * 2.5)} min</div>
                    <div className="text-sm text-muted-foreground">Estimated time</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Official</div>
                    <div className="text-sm text-muted-foreground">BRTA approved</div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">All Route Stops</h3>
              <div className="space-y-3">
                {selectedRoute?.stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{stop.name}</div>
                    </div>
                    {index < selectedRoute.stops.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Location Selection Modal */}
      {activePopover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-lg">
            {/* Modal Header */}
            <div className="bg-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary-foreground">
                      {activePopover === 'from' ? 'Select Starting Point' : 'Select Destination'}
                    </h2>
                    <p className="text-primary-foreground/80">
                      Find your preferred location
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePopoverClose}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    onChange={() => {
                      // You can add search functionality here if needed
                    }}
                  />
                </div>
              </div>

              {/* Location List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allStops.map((stop) => (
                  <div
                    key={stop}
                    className="cursor-pointer p-4 border rounded-lg hover:bg-muted transition-colors"
                    onClick={() => handleLocationSelect(stop, activePopover)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{stop}</div>
                        <div className="text-sm text-muted-foreground">
                          {routes.filter(route => 
                            route.stops.some(s => s.name === stop)
                          ).length} routes available
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Mobile App Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-bottom z-50 lg:hidden">
        <div className="flex items-center justify-around py-2 px-4">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <RouteIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs">Routes</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs">Plan</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs">Guide</span>
          </Button>
        </div>
      </div>
    </div>
  );
}