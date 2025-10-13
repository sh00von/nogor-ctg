'use client';

import { Bus, ArrowRight, MapPin, X, Search, Clock, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Progress } from './ui/progress';
import { BusRoute, busRoutes } from '../lib/bus-routes';
import { RoutePlanner, RoutePlan, RouteOption } from '../lib/route-planner';
import { useState, useMemo } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { cn } from '../lib/utils';

export default function BusTracker() {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<'from' | 'to' | null>(null);

  const routePlanner = useMemo(() => new RoutePlanner(busRoutes), []);

  const allStops = useMemo(() => {
    const stops = new Set<string>();
    busRoutes.forEach(route => {
      route.stops.forEach(stop => stops.add(stop.name));
    });
    return Array.from(stops);
  }, []);

  const filteredStops = useMemo(() => {
    if (!searchTerm) return allStops;
    return allStops.filter(stop =>
      stop.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allStops]);

  const handleSelectStop = (stop: string) => {
    if (activePopover === 'from') {
      setFrom(stop);
    } else if (activePopover === 'to') {
      setTo(stop);
    }
    setActivePopover(null);
    setSearchTerm('');
  };

  const handleSearch = () => {
    if (from && to) {
      setIsLoading(true);
      setRoutePlan(null);
      setTimeout(() => {
        const plan = routePlanner.findRoutes(from, to);
        setRoutePlan(plan);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleRouteSelection = (route: BusRoute) => {
    setSelectedRoute(route);
  };

  const renderRouteOption = (option: RouteOption, index: number) => {
    const isBestRoute = index === 0;
    const confidencePercentage = Math.round(option.confidence * 100);

    return (
      <Card key={option.id} className={`mb-6 transition-all duration-300 hover:shadow-lg border-2 ${
        isBestRoute ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : 'border-gray-200'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isBestRoute ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge className={`text-white text-sm font-bold px-3 py-1 ${
                    isBestRoute ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}>
                    {index + 1}
                  </Badge>
                  {isBestRoute && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Best Route
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {option.routeType.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{confidencePercentage}% confidence</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {option.totalTime} min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {option.totalDistance} km
              </div>
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Route Confidence</span>
              <span>{confidencePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  confidencePercentage >= 80 ? 'bg-green-500' :
                  confidencePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidencePercentage}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Route Legs */}
          <div className="space-y-3 mb-4">
            {option.legs.map((leg, legIndex) => (
              <div key={legIndex} className="relative">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      {legIndex < option.legs.length - 1 && (
                        <div className="w-0.5 h-6 bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {leg.fromStop.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Board Route {leg.routeId.split('-')[1]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mx-4">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {leg.estimatedTime} min
                      </div>
                      <div className="text-xs text-gray-500">
                        {leg.distance} km
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {leg.toStop.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Alight here
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Route Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Clock className="h-5 w-5 text-blue-500 mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.totalTime} min
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Time</div>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="h-5 w-5 text-green-500 mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.totalDistance} km
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Distance</div>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="h-5 w-5 text-purple-500 mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.transfers}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Transfers</div>
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-5 w-5 text-yellow-500 mb-1" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {confidencePercentage}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Reliability</div>
              </div>
            </div>
          </div>

          {/* Walking Time Notice */}
          {option.walkingTime > 0 && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">🚶</span>
                </div>
                <span className="text-sm font-medium">
                  Includes {option.walkingTime} min walking time
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm dark:bg-gray-900 md:px-6">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold">Bus Tracker</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <label htmlFor="from" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                  <Popover open={activePopover === 'from'} onOpenChange={(isOpen) => setActivePopover(isOpen ? 'from' : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !from && "text-muted-foreground")}>
                        <MapPin className="mr-2 h-4 w-4" />
                        {from || "Select starting point"}
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                </div>
                <div className="relative">
                  <label htmlFor="to" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                  <Popover open={activePopover === 'to'} onOpenChange={(isOpen) => setActivePopover(isOpen ? 'to' : null)}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !to && "text-muted-foreground")}>
                        <MapPin className="mr-2 h-4 w-4" />
                        {to || "Select destination"}
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <Button variant="ghost" size="icon" onClick={handleSwap}>
                  <ArrowRight className="h-5 w-5 transform transition-transform duration-300 hover:rotate-180" />
                </Button>
              </div>
              <Button onClick={handleSearch} className="mt-4 w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : <><Search className="mr-2 h-4 w-4" /> Find Bus</>}
              </Button>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="mt-6 text-center">
              <p>Finding routes...</p>
              <Progress value={50} className="mt-2" />
            </div>
          )}

          {routePlan && (
            <div className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Available Routes</h2>
              {routePlan.options.length > 0 ? (
                routePlan.options.map((option, index) => renderRouteOption(option, index))
              ) : (
                <p>No direct routes found</p>
              )}
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">All Bus Routes</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {busRoutes.map(route => (
                <Card key={route.id} onClick={() => handleRouteSelection(route)} className="cursor-pointer hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bus className="h-5 w-5" />
                      {route.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">Route {route.number}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Shared Location Selection Modal */}
      <Popover open={activePopover !== null} onOpenChange={(isOpen) => { if (!isOpen) setActivePopover(null); }}>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search stop..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>No results found</CommandEmpty>
              <CommandGroup>
                {filteredStops.map((stop: string) => (
                  <CommandItem key={stop} onSelect={() => handleSelectStop(stop)}>
                    {stop}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedRoute(null)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedRoute.name}
                <Button variant="ghost" size="icon" onClick={() => setSelectedRoute(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <Badge variant="secondary">Route {selectedRoute.number}</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm font-semibold">Stops:</p>
              <div className="max-h-60 overflow-y-auto">
                <ol className="relative border-l border-gray-200 dark:border-gray-700">
                  {selectedRoute.stops.map((stop, index) => (
                    <li key={index} className="mb-4 ml-4">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-200 dark:border-gray-900 dark:bg-gray-700"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Stop {index + 1}</time>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{stop.name}</h3>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
