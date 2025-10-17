'use client'
import { Bus, Route as RouteIcon, Sun } from 'lucide-react';
import { getAllRoutes, getRegularBusRoutes, legunaRoutes, BusRoute } from '@/lib/bus-routes';
import { RoutePlanner, RoutePlan } from '@/lib/route-planner';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useMemo } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import WeatherWidget from '@/components/WeatherWidget';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import SearchForm from '@/components/SearchForm';
import RouteResults from '@/components/RouteResults';
import RouteCard from '@/components/RouteCard';
import MobileTabNavigation from '@/components/MobileTabNavigation';
import LocationModal from '@/components/LocationModal';
import RouteDetailsModal from '@/components/RouteDetailsModal';

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [activePopover, setActivePopover] = useState<'from' | 'to' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'routes' | 'more'>('plan');
  
  const routes = useMemo(() => getRegularBusRoutes(), []);
  const routePlanner = useMemo(() => new RoutePlanner(getAllRoutes()), []);

  // Get all unique English stop names for combobox
  const allStops = useMemo(() => {
    const items = new Set<string>();
    routes.forEach(route => {
      route.stops.forEach(stop => {
        items.add(stop.name);
      });
    });
    return Array.from(items).sort();
  }, [routes]);

  const handleRoutePlanning = async () => {
    if (!fromValue || !toValue) {
      toast.error('Please select both from and to locations');
      return;
    }

    console.log('Starting route planning...', { fromValue, toValue });
    setIsPlanning(true);
    
    try {
      const plan = await new Promise<RoutePlan>((resolve, reject) => {
        const timeoutId: NodeJS.Timeout = setTimeout(() => {
          console.log('Route planning timeout after 5 seconds');
          reject(new Error('Route planning timeout after 5 seconds'));
        }, 5000);
        
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

  const handleLocationSelect = (location: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromValue(location);
    } else {
      setToValue(location);
    }
    setActivePopover(null);
  };

  const handleRouteClick = (route: BusRoute) => {
    setSelectedRoute(route);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Responsive Header */}
      <header className="bg-background border-b border-border/50 sticky top-0 z-50 safe-area-top">
        <div className="px-6 py-4 lg:px-8 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold lg:text-xl text-foreground">
                  Nogor CTG
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Chittagong Bus Tracker
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Desktop/Tablet Layout */}
      <div className="hidden lg:block">
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Sidebar - Search & Quick Routes */}
              <div className="col-span-4">
                <div className="sticky top-32 space-y-8">
                  <SearchForm
                    fromValue={fromValue}
                    toValue={toValue}
                    isPlanning={isPlanning}
                    onFromClick={handleFromClick}
                    onToClick={handleToClick}
                    onClear={handleClear}
                    onRoutePlanning={handleRoutePlanning}
                    isMobile={false}
                  />
                  <WeatherWidget />
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-8">
                <div className="space-y-6">
                  {/* Route Planning Results */}
                  {routePlan && routePlan.options.length > 0 && routePlan.bestOption && (
                    <RouteResults
                      routePlan={routePlan}
                      fromValue={fromValue}
                      toValue={toValue}
                      routes={routes}
                      isMobile={false}
                    />
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
                      {routes.map((route) => (
                        <RouteCard
                          key={route.id}
                          route={route}
                          onClick={handleRouteClick}
                          isMobile={false}
                        />
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
                        <h3 className="font-semibold text-lg">Leguna Service Routes</h3>
                        <p className="text-sm text-muted-foreground">
                          {legunaRoutes.length} City circular routes
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {legunaRoutes.map((route) => (
                        <RouteCard
                          key={route.id}
                          route={route}
                          onClick={handleRouteClick}
                          isMobile={false}
                        />
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
        <div className="px-6 py-6 pb-24">
          
          {/* Mobile Tab Content */}
          {activeTab === 'plan' && (
            <>
              <div className="mb-8">
                <SearchForm
                  fromValue={fromValue}
                  toValue={toValue}
                  isPlanning={isPlanning}
                  onFromClick={handleFromClick}
                  onToClick={handleToClick}
                  onClear={handleClear}
                  onRoutePlanning={handleRoutePlanning}
                  isMobile={true}
                />
              </div>

              {/* Mobile App Route Results */}
              {routePlan && routePlan.options.length > 0 && routePlan.bestOption && (
                <div className="mb-6">
                  <RouteResults
                    routePlan={routePlan}
                    fromValue={fromValue}
                    toValue={toValue}
                    routes={routes}
                    isMobile={true}
                  />
                </div>
              )}
            </>
          )}

          {/* More Tab Content */}
          {activeTab === 'more' && (
            <div className="space-y-6">
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
                    <span className="font-medium">{routes.length + legunaRoutes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regular Buses</span>
                    <span className="font-medium">{routes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Leguna Services</span>
                    <span className="font-medium">{legunaRoutes.length}</span>
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
                  {routes.map((route) => (
                    <div key={route.id}>
                      <RouteCard
                        route={route}
                        onClick={handleRouteClick}
                        isMobile={true}
                      />
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
                    <h3 className="font-semibold">Leguna Service Routes</h3>
                    <p className="text-sm text-muted-foreground">
                      {legunaRoutes.length} City circular routes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {legunaRoutes.map((route) => (
                    <div key={route.id}>
                      <RouteCard
                        route={route}
                        onClick={handleRouteClick}
                        isMobile={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Details Modal */}
      <RouteDetailsModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
      />

      {/* Location Selection Modal */}
      <LocationModal
        isOpen={activePopover !== null}
        type={activePopover}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onLocationSelect={handleLocationSelect}
        onClose={handlePopoverClose}
        allStops={allStops}
        routes={routes}
      />

      {/* Mobile App Bottom Navigation */}
      <MobileTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}