'use client'
import { Bus, MapPin, Search, Navigation, Clock, Users, ArrowRight, Route as RouteIcon, ChevronsUpDown, X, Zap, Target, Sun } from 'lucide-react';
import { getAllRoutes, getRegularBusRoutes, lagunaRoutes, BusRoute } from '@/lib/bus-routes';
import { RoutePlanner, RoutePlan } from '@/lib/route-planner';
import toast, { Toaster } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import WeatherWidget from '@/components/WeatherWidget';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  
  // Shared popover state
  const [activePopover, setActivePopover] = useState<'from' | 'to' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Route planner states
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  
  // Mobile tab state
  const [activeTab, setActiveTab] = useState<'plan' | 'routes' | 'more'>('plan');
  
  // Helper function to get route icon
  const getRouteIcon = (route: BusRoute) => {
    if (route.number.startsWith('Laguna')) {
      return '🚌'; // Laguna service icon
    }
    return '🚌'; // Regular bus icon
  };

  // Helper function to get route color
  const getRouteColor = (route: BusRoute) => {
    if (route.number.startsWith('Laguna')) {
      return 'bg-primary'; // Laguna uses primary color
    }
    return 'bg-primary'; // Regular buses use primary color
  };

  // Skeleton component for loading states
  const RouteSkeleton = () => (
    <div className="bg-card rounded-2xl p-4 shadow-sm border animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-muted rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-muted rounded mb-2 w-1/2"></div>
          <div className="flex gap-3">
            <div className="h-3 bg-muted rounded w-16"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  
  const routes = useMemo(() => getRegularBusRoutes(), []);
  
  // Initialize route planner with all routes (including Laguna)
  const routePlanner = useMemo(() => new RoutePlanner(getAllRoutes()), []);

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

  // All routes (no search filtering)
  const filteredRoutes = useMemo(() => {
    return routes;
  }, [routes]);

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

    console.log('Starting route planning...', { fromValue, toValue });
    setIsPlanning(true);
    
    try {
      // Use requestIdleCallback for truly non-blocking execution
      const plan = await new Promise<RoutePlan>((resolve, reject) => {
        const timeoutId: NodeJS.Timeout = setTimeout(() => {
          console.log('Route planning timeout after 5 seconds');
          reject(new Error('Route planning timeout after 5 seconds'));
        }, 5000);
        
        
        // Use requestIdleCallback if available, otherwise setTimeout
        const executePlanning = () => {
          try {
            console.log('Executing route planner...');
            const result = routePlanner.findRoutes(fromValue, toValue);
            console.log('Route planner result:', result);
            clearTimeout(timeoutId);
            resolve(result);
          } catch (error) {
            console.error('Route planner execution error:', error);
            clearTimeout(timeoutId);
            reject(error);
          }
        };
        
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(executePlanning, { timeout: 1000 });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(executePlanning, 0);
        }
      });
      
      console.log('Setting route plan:', plan);
      setRoutePlan(plan);
      
      if (plan.options.length === 0) {
        toast.error('No routes found');
      } else {
        toast.success(`${plan.options.length} routes found`);
      }
    } catch (error) {
      console.error('Route planning error:', error);
      toast.error('Error planning route: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      console.log('Setting isPlanning to false');
      setIsPlanning(false);
    }
  };

  const handleClear = () => {
    setFromValue('');
    setToValue('');
    setRoutePlan(null);
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
    setSearchTerm('');
  };

  // Filter stops based on search term
  const filteredStops = useMemo(() => {
    if (!searchTerm.trim()) return routes;
    
    const searchLower = searchTerm.toLowerCase();
    return routes.filter(route => 
      route.stops.some(stop => 
        stop.name.toLowerCase().includes(searchLower)
      )
    );
  }, [routes, searchTerm]);

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
                  Nogor CTG
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
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

                  {/* Weather Widget */}
                  <WeatherWidget />

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

                        {/* Step-by-Step Instructions */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Navigation className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-base">Step-by-Step Guide</span>
                          </div>
                          
                          {routePlan.bestOption.legs.map((leg, legIndex) => {
                            const routeObj = routes.find(r => r.id === leg.routeId);
                            const routeName = routeObj ? routeObj.name : leg.routeName;
                            const isLastLeg = legIndex === (routePlan.bestOption?.legs.length || 0) - 1;
                            
                            return (
                              <div key={legIndex} className="relative">
                                {/* Step Number */}
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                                    {legIndex + 1}
                                  </div>
                                  
                                  <div className="flex-1 space-y-3">
                                    {/* Route Card */}
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 border-l-4 border-blue-500">
                                      <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xl">🚌</span>
                                        <div className="font-semibold text-base">{routeName}</div>
                                        <Badge variant="secondary" className="text-sm">
                                          {Math.round(leg.estimatedTime)} min
                                        </Badge>
                                      </div>
                                      
                                      {/* Boarding Instructions */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-base">
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          <span className="font-medium">Board at:</span>
                                          <span className="font-semibold text-primary text-lg">{leg.fromStop.name}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-base">
                                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                          <span className="font-medium">Get off at:</span>
                                          <span className="font-semibold text-primary text-lg">{leg.toStop.name}</span>
                                        </div>
                                        
                                        <div className="text-sm text-muted-foreground mt-2">
                                          Distance: {formatDistance(leg.distance)} km
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Transfer Instructions */}
                                    {!isLastLeg && (
                                      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 border-l-4 border-orange-500">
                                        <div className="flex items-center gap-3 mb-2">
                                          <ArrowRight className="w-5 h-5 text-orange-600" />
                                          <span className="font-semibold text-base text-orange-600 dark:text-orange-400">Transfer Required</span>
                                        </div>
                                        <div className="text-sm text-orange-600 dark:text-orange-400">
                                          Walk to the next bus stop and wait for your connecting bus
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Final Destination */}
                                    {isLastLeg && (
                                      <div className="bg-green-50 dark:bg-green-950/20 p-4 border-l-4 border-green-500">
                                        <div className="flex items-center gap-3 mb-2">
                                          <Target className="w-5 h-5 text-green-600" />
                                          <span className="font-semibold text-base text-green-600 dark:text-green-400">You've Arrived!</span>
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-400">
                                          You have reached your destination
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Connecting Line */}
                                {!isLastLeg && (
                                  <div className="absolute left-4 top-10 w-0.5 h-8 bg-muted"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Other Route Options */}
                      {routePlan.options.length > 1 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary"></div>
                            <h4 className="font-semibold text-lg">Other Options</h4>
                          </div>
                          
                          <div className="space-y-4">
                            {routePlan.options.slice(1, 4).map((option, index) => (
                              <div key={option.id} className="bg-card border border-border/50">
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                                        {index + 2}
                                      </div>
                                      <div>
                                        <div className="text-2xl font-bold text-foreground">
                                          {Math.round(option.totalTime)} min
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {option.transfers} transfers • {formatDistance(option.totalDistance)} km
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-sm">
                                      {Math.round(option.confidence * 100)}%
                                    </Badge>
                                  </div>

                                  <div className="space-y-4">
                                    {option.legs.map((leg, legIndex) => {
                                      const routeObj = routes.find(r => r.id === leg.routeId);
                                      const routeName = routeObj ? routeObj.name : leg.routeName;
                                      const isLastLeg = legIndex === option.legs.length - 1;
                                      
                                      return (
                                        <div key={legIndex} className="relative">
                                          <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                                              {legIndex + 1}
                                            </div>
                                            
                                            <div className="flex-1 space-y-3">
                                              {/* Route Card */}
                                              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 border-l-4 border-blue-500">
                                                <div className="flex items-center gap-3 mb-3">
                                                  <span className="text-lg">🚌</span>
                                                  <div className="font-semibold text-base">{routeName}</div>
                                                  <Badge variant="secondary" className="text-sm">
                                                    {Math.round(leg.estimatedTime)} min
                                                  </Badge>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                  <div className="flex items-center gap-3 text-sm">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="font-medium">Board:</span>
                                                    <span className="font-semibold text-primary">{leg.fromStop.name}</span>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-3 text-sm">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span className="font-medium">Get off:</span>
                                                    <span className="font-semibold text-primary">{leg.toStop.name}</span>
                                                  </div>
                                                  
                                                  <div className="text-xs text-muted-foreground">
                                                    Distance: {formatDistance(leg.distance)} km
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              {/* Transfer Instructions */}
                                              {!isLastLeg && (
                                                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 border-l-4 border-orange-500">
                                                  <div className="flex items-center gap-3 mb-2">
                                                    <ArrowRight className="w-4 h-4 text-orange-600" />
                                                    <span className="font-semibold text-sm text-orange-600 dark:text-orange-400">Transfer Required</span>
                                                  </div>
                                                  <div className="text-sm text-orange-600 dark:text-orange-400">
                                                    Walk to the next bus stop and wait for your connecting bus
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Final Destination */}
                                              {isLastLeg && (
                                                <div className="bg-green-50 dark:bg-green-950/20 p-4 border-l-4 border-green-500">
                                                  <div className="flex items-center gap-3 mb-2">
                                                    <Target className="w-4 h-4 text-green-600" />
                                                    <span className="font-semibold text-sm text-green-600 dark:text-green-400">You've Arrived!</span>
                                                  </div>
                                                  <div className="text-sm text-green-600 dark:text-green-400">
                                                    You have reached your destination
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Connecting Line */}
                                          {!isLastLeg && (
                                            <div className="absolute left-3 top-8 w-0.5 h-8 bg-muted"></div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="cursor-pointer transition-all duration-300 group bg-card border border-border/50 hover:shadow-md hover:border-primary/20"
                          onClick={() => handleRouteClick(route)}
                        >
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 ${getRouteColor(route)} rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg`}>
                                {route.number}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{getRouteIcon(route)}</span>
                                  <div className="font-semibold text-base">{route.name}</div>
                                </div>
                                <div className="text-sm text-muted-foreground mb-3">
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Laguna Service Routes */}
                  <div className="bg-card rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <RouteIcon className="w-5 h-5 text-primary" />
                </div>
                      <div>
                        <h3 className="font-semibold text-lg">Laguna Service Routes</h3>
                        <p className="text-sm text-muted-foreground">
                          {lagunaRoutes.length} City circular routes
                        </p>
              </div>
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {lagunaRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="cursor-pointer transition-all duration-300 group bg-card border border-border/50 hover:shadow-md hover:border-primary/20"
                          onClick={() => handleRouteClick(route)}
                        >
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 ${getRouteColor(route)} rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg`}>
                                L
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{getRouteIcon(route)}</span>
                                  <div className="font-semibold text-base text-foreground">{route.name}</div>
                                </div>
                                <div className="text-sm text-muted-foreground mb-3">
                                  {route.stops[0]?.name} → {route.stops[route.stops.length - 1]?.name}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {route.totalStops} stops
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.round(route.stops.length * 2.5)} minutes
                                  </div>
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
          
          {/* Mobile Tab Content */}
          {activeTab === 'plan' && (
            <>
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

                  {/* Step-by-Step Instructions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Step-by-Step Guide</span>
                    </div>
                    
                    {routePlan.bestOption.legs.map((leg, legIndex) => {
                      const routeObj = routes.find(r => r.id === leg.routeId);
                      const routeName = routeObj ? routeObj.name : leg.routeName;
                      const isLastLeg = legIndex === (routePlan.bestOption?.legs.length || 0) - 1;
                      
                      return (
                        <div key={legIndex} className="relative">
                          {/* Step Number */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {legIndex + 1}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              {/* Route Card */}
                              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border-l-4 border-blue-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🚌</span>
                                  <div className="font-semibold text-sm">{routeName}</div>
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(leg.estimatedTime)} min
                                  </Badge>
                                </div>
                                
                                {/* Boarding Instructions */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-medium">Board at:</span>
                                    <span className="font-semibold text-primary">{leg.fromStop.name}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="font-medium">Get off at:</span>
                                    <span className="font-semibold text-primary">{leg.toStop.name}</span>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Distance: {formatDistance(leg.distance)} km
                                  </div>
                                </div>
                              </div>
                              
                              {/* Transfer Instructions */}
                              {!isLastLeg && (
                                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 border-l-4 border-orange-500">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ArrowRight className="w-4 h-4 text-orange-600" />
                                    <span className="font-medium text-sm text-orange-600 dark:text-orange-400">Transfer Required</span>
                                  </div>
                                  <div className="text-xs text-orange-600 dark:text-orange-400">
                                    Walk to the next bus stop and wait for your connecting bus
                                  </div>
                                </div>
                              )}
                              
                              {/* Final Destination */}
                              {isLastLeg && (
                                <div className="bg-green-50 dark:bg-green-950/20 p-3 border-l-4 border-green-500">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-sm text-green-600 dark:text-green-400">You've Arrived!</span>
                                  </div>
                                  <div className="text-xs text-green-600 dark:text-green-400">
                                    You have reached your destination
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Connecting Line */}
                          {!isLastLeg && (
                            <div className="absolute left-3 top-8 w-0.5 h-6 bg-muted"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Route Options */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary"></div>
                    <h4 className="font-semibold text-base">Other Options</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {routePlan.options.slice(1, 4).map((option, index) => (
                      <div key={option.id} className="bg-card border border-border/50">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {index + 2}
                              </div>
                              <div>
                                <div className="text-xl font-bold text-foreground">
                                  {Math.round(option.totalTime)} min
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {option.transfers} transfers • {formatDistance(option.totalDistance)} km
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(option.confidence * 100)}%
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            {option.legs.map((leg, legIndex) => {
                              const routeObj = routes.find(r => r.id === leg.routeId);
                              const routeName = routeObj ? routeObj.name : leg.routeName;
                              const isLastLeg = legIndex === option.legs.length - 1;
                              
                              return (
                                <div key={legIndex} className="relative">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                                      {legIndex + 1}
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                      {/* Route Card */}
                                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border-l-4 border-blue-500">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-lg">🚌</span>
                                          <div className="font-semibold text-sm">{routeName}</div>
                                          <Badge variant="secondary" className="text-xs">
                                            {Math.round(leg.estimatedTime)} min
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="font-medium">Board:</span>
                                            <span className="font-semibold text-primary">{leg.fromStop.name}</span>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span className="font-medium">Get off:</span>
                                            <span className="font-semibold text-primary">{leg.toStop.name}</span>
                                          </div>
                                          
                                          <div className="text-xs text-muted-foreground">
                                            Distance: {formatDistance(leg.distance)} km
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Transfer Instructions */}
                                      {!isLastLeg && (
                                        <div className="bg-orange-50 dark:bg-orange-950/20 p-3 border-l-4 border-orange-500">
                                          <div className="flex items-center gap-2 mb-1">
                                            <ArrowRight className="w-4 h-4 text-orange-600" />
                                            <span className="font-medium text-sm text-orange-600 dark:text-orange-400">Transfer Required</span>
                                          </div>
                                          <div className="text-xs text-orange-600 dark:text-orange-400">
                                            Walk to the next bus stop and wait for your connecting bus
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Final Destination */}
                                      {isLastLeg && (
                                        <div className="bg-green-50 dark:bg-green-950/20 p-3 border-l-4 border-green-500">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-sm text-green-600 dark:text-green-400">You've Arrived!</span>
                                          </div>
                                          <div className="text-xs text-green-600 dark:text-green-400">
                                            You have reached your destination
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Connecting Line */}
                                  {!isLastLeg && (
                                    <div className="absolute left-3 top-8 w-0.5 h-6 bg-muted"></div>
                                  )}
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
            </div>
          )}

            </>
          )}

          {/* More Tab Content */}
          {activeTab === 'more' && (
            <div className="space-y-6">
              {/* Weather Widget */}
              <WeatherWidget />
              
              {/* Weather Tips */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sun className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Weather Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Travel recommendations based on weather
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-1">Hot Weather</h4>
                    <p className="text-sm text-muted-foreground">
                      Stay hydrated and wear light clothing. Consider traveling during cooler hours.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-1">Rainy Weather</h4>
                    <p className="text-sm text-muted-foreground">
                      Carry an umbrella and allow extra travel time. Buses may be delayed.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-1">Good Weather</h4>
                    <p className="text-sm text-muted-foreground">
                      Perfect conditions for travel! Enjoy your journey.
                    </p>
                  </div>
                </div>
              </div>

              {/* App Info */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">About Bus Tracker</h3>
                    <p className="text-sm text-muted-foreground">
                      Chittagong's comprehensive bus route planner
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Routes</span>
                    <span className="font-medium">{routes.length + lagunaRoutes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regular Buses</span>
                    <span className="font-medium">{routes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Laguna Services</span>
                    <span className="font-medium">{lagunaRoutes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Routes Tab Content */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              {/* Regular Bus Routes */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">All Bus Routes</h3>
                    <p className="text-sm text-muted-foreground">
                      {routes.length} BRTA approved routes
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredRoutes.map((route) => (
                    <div key={route.id}>
                      <div 
                        className="cursor-pointer transition-all duration-300 group bg-card rounded-2xl p-4 shadow-sm border hover:shadow-md active:scale-95"
                        onClick={() => handleRouteClick(route)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${getRouteColor(route)} rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg`}>
                            {route.number}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getRouteIcon(route)}</span>
                              <div className="font-semibold">{route.name}</div>
                            </div>
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
              </div>

              {/* Laguna Service Routes */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <RouteIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Laguna Service Routes</h3>
                    <p className="text-sm text-muted-foreground">
                      {lagunaRoutes.length} City circular routes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {lagunaRoutes.map((route) => (
                    <div key={route.id}>
                      <div 
                        className="cursor-pointer transition-all duration-300 group bg-card rounded-2xl p-4 shadow-sm border hover:shadow-md active:scale-95"
                        onClick={() => handleRouteClick(route)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${getRouteColor(route)} rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg`}>
                            L
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getRouteIcon(route)}</span>
                              <div className="font-semibold text-foreground">{route.name}</div>
                            </div>
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
              </div>
            </div>
          )}
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
                    value={searchTerm}
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Location List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(() => {
                  const filteredStops = allStops.filter(stop => 
                    !searchTerm.trim() || 
                    stop.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  
                  if (filteredStops.length === 0 && searchTerm.trim()) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No locations found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    );
                  }
                  
                  return filteredStops.map((stop) => (
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
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Mobile App Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-bottom z-50 lg:hidden">
        <div className="flex items-center justify-around py-2 px-4">
          <Button 
            variant={activeTab === 'plan' ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl"
            onClick={() => setActiveTab('plan')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              activeTab === 'plan' ? 'bg-primary-foreground' : 'bg-primary/10'
            }`}>
              <Search className={`w-4 h-4 ${
                activeTab === 'plan' ? 'text-primary' : 'text-primary'
              }`} />
            </div>
            <span className="text-xs">Plan</span>
          </Button>
          <Button 
            variant={activeTab === 'routes' ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl"
            onClick={() => setActiveTab('routes')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              activeTab === 'routes' ? 'bg-primary-foreground' : 'bg-primary/10'
            }`}>
              <Bus className={`w-4 h-4 ${
                activeTab === 'routes' ? 'text-primary' : 'text-primary'
              }`} />
            </div>
            <span className="text-xs">Routes</span>
          </Button>
          <Button 
            variant={activeTab === 'more' ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl"
            onClick={() => setActiveTab('more')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              activeTab === 'more' ? 'bg-primary-foreground' : 'bg-primary/10'
            }`}>
              <Sun className={`w-4 h-4 ${
                activeTab === 'more' ? 'text-primary' : 'text-primary'
              }`} />
            </div>
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}