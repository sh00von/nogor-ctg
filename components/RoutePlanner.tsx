'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPin, Clock, Navigation, ArrowRight, Bus, Users, Route as RouteIcon } from 'lucide-react';
import { RoutePlanner, RoutePlan } from '@/lib/route-planner';
import { getAllRoutes } from '@/lib/bus-routes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RoutePlannerComponent() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const routes = getAllRoutes();
  const planner = useMemo(() => new RoutePlanner(routes), [routes]);

  // Get all unique stop names for suggestions
  const allStops = useMemo(() => {
    const stops = new Set<string>();
    routes.forEach(route => {
      route.stops.forEach(stop => {
        stops.add(stop.name);
      });
    });
    return Array.from(stops);
  }, [routes]);

  // Generate live suggestions for from location
  useEffect(() => {
    if (fromLocation && fromLocation.length >= 2) {
      const suggestions = allStops
        .filter(stop => 
          stop.toLowerCase().includes(fromLocation.toLowerCase())
        )
        .slice(0, 5);
      setFromSuggestions(suggestions);
      setShowFromSuggestions(suggestions.length > 0);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  }, [fromLocation, allStops]);

  // Generate live suggestions for to location
  useEffect(() => {
    if (toLocation && toLocation.length >= 2) {
      const suggestions = allStops
        .filter(stop => 
          stop.toLowerCase().includes(toLocation.toLowerCase())
        )
        .slice(0, 5);
      setToSuggestions(suggestions);
      setShowToSuggestions(suggestions.length > 0);
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  }, [toLocation, allStops]);

  const handleSearch = () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const plan = planner.findRoutes(fromLocation.trim(), toLocation.trim());
      setRoutePlan(plan);
      setIsSearching(false);
    }, 1000);
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  const getRouteTypeText = (routeType: string): string => {
    switch (routeType) {
      case 'direct': return 'Direct Route';
      case 'transfer': return 'One Transfer';
      case 'multi_transfer': return 'Multiple Transfers';
      default: return 'Route';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Route Planner
        </h2>
        <p className="text-slate-600">
          Find the best bus routes for your journey
        </p>
      </div>

        {/* Popular Locations */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Popular Locations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['New Market', 'Laldighi', 'University of Chittagong', 'Airport', 'Seabeach', 'Bhatiari', 'Kalurghat', 'Oxygen'].map((location) => (
                <button
                  key={location}
                  onClick={() => {
                    if (!fromLocation) {
                      setFromLocation(location);
                    } else if (!toLocation) {
                      setToLocation(location);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors"
                >
                  {location}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Form */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
            {/* From Location */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-medium text-slate-700">From</label>
              </div>
              <Input
                type="text"
                className="h-12 text-base border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                placeholder="e.g. New Market, Laldighi..."
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => {
                  if (fromLocation && fromLocation.length >= 2) {
                    setShowFromSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
              />
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {fromSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-sm transition-colors"
                      onClick={() => {
                        setFromLocation(suggestion);
                        setShowFromSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapLocations}
                className="rounded-full border-slate-300 hover:border-slate-400"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            {/* To Location */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <label className="text-sm font-medium text-slate-700">To</label>
              </div>
              <Input
                type="text"
                className="h-12 text-base border-slate-200 focus:border-red-500 focus:ring-red-500/20"
                placeholder="e.g. University of Chittagong, Airport..."
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => {
                  if (toLocation && toLocation.length >= 2) {
                    setShowToSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
              />
              {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {toSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-sm transition-colors"
                      onClick={() => {
                        setToLocation(suggestion);
                        setShowToSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={!fromLocation.trim() || !toLocation.trim() || isSearching}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  রুট খুঁজছি...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RouteIcon className="w-4 h-4" />
                  রুট খুঁজুন
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {routePlan && (
          <div
            className="space-y-4"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {routePlan.totalOptions} routes found
                </h3>
                <p className="text-slate-600">
                  {routePlan.from} to {routePlan.to}
                </p>
              </div>
              {routePlan.bestOption && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Best Route
                </Badge>
              )}
            </div>

            {/* No Results */}
            {routePlan.options.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RouteIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">কোন রুট পাওয়া যায়নি</h4>
                  <p className="text-slate-600 mb-4">
                    দুঃখিত, এই দুটি অবস্থানের মধ্যে কোন সরাসরি বাস রুট নেই।
                  </p>
                  <p className="text-sm text-slate-500">
                    অনুগ্রহ করে অন্য অবস্থান চেষ্টা করুন অথবা ট্যাক্সি/রিকশা ব্যবহার করুন।
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Route Options */}
            {routePlan.options.map((option, index) => (
              <div
                key={option.id}
              >
                <Card className={`border-0 shadow-md transition-all duration-300 ${
                  index === 0 ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {option.legs.map(leg => leg.routeName).join(' → ')}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{option.legs[0].fromStop.name}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{option.legs[option.legs.length - 1].toStop.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-700">
                            Best
                          </Badge>
                        )}
                        <Badge variant="outline" className={getConfidenceColor(option.confidence)}>
                          {Math.round(option.confidence * 100)}% Reliable
                        </Badge>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-medium">{formatTime(option.totalTime)}</div>
                          <div className="text-slate-500">মোট সময়</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Bus className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-medium">{option.transfers} ট্রান্সফার</div>
                          <div className="text-slate-500">রুট টাইপ</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-medium">{option.totalDistance} km</div>
                          <div className="text-slate-500">Distance</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-medium">{getRouteTypeText(option.routeType)}</div>
                          <div className="text-slate-500">রুট ধরন</div>
                        </div>
                      </div>
                    </div>

                    {/* Route Legs */}
                    <div className="space-y-3 mb-4">
                      {option.legs.map((leg, legIndex) => (
                        <div key={legIndex} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {legIndex + 1}
                              </div>
                              <span className="font-medium">{leg.routeName}</span>
                            </div>
                            <div className="text-sm text-slate-600">
                              {formatTime(leg.estimatedTime)} • {leg.distance} km
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{leg.fromStop.name}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{leg.toStop.name}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {leg.stops.length} stops
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Transfer Information */}
                    {option.transfers > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <Navigation className="w-4 h-4" />
                          <span className="font-medium">
                            {option.transfers}টি ট্রান্সফার প্রয়োজন
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                          প্রতিটি ট্রান্সফারে {formatTime(5)} অপেক্ষা করুন
                        </p>
                        {option.walkingTime > 0 && (
                          <p className="text-sm text-amber-700">
                            হাঁটার সময়: {formatTime(option.walkingTime)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Route Type Badge */}
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant={option.routeType === 'direct' ? "default" : "secondary"}>
                        {getRouteTypeText(option.routeType)}
                      </Badge>
                      {option.transfers > 0 && (
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          +{formatTime(option.transfers * 5)} ট্রান্সফার
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
