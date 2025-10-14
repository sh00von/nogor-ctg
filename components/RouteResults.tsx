'use client'
import { Target, Navigation, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RoutePlan } from '@/lib/route-planner';
import { BusRoute } from '@/lib/bus-routes';

interface RouteResultsProps {
  routePlan: RoutePlan;
  fromValue: string;
  toValue: string;
  routes: BusRoute[];
  isMobile?: boolean;
}

export default function RouteResults({ 
  routePlan, 
  fromValue, 
  toValue, 
  routes, 
  isMobile = false 
}: RouteResultsProps) {
  const formatDistance = (distance: number) => {
    return distance.toFixed(1);
  };

  const containerClass = isMobile 
    ? "bg-card rounded-2xl p-4 shadow-sm border"
    : "bg-card rounded-2xl p-6 shadow-sm border";

  const headerIconSize = isMobile ? "w-8 h-8" : "w-10 h-10";
  const headerIconClass = isMobile ? "w-4 h-4" : "w-5 h-5";
  const headerTitleSize = isMobile ? "" : "text-lg";
  const bestRouteClass = isMobile 
    ? "bg-primary/5 rounded-xl p-4 mb-4 border border-primary/20"
    : "bg-primary/5 rounded-xl p-6 mb-6 border border-primary/20";
  const stepIconSize = isMobile ? "w-6 h-6" : "w-8 h-8";
  const stepIconTextSize = isMobile ? "text-xs" : "text-sm";
  const routeCardPadding = isMobile ? "p-3" : "p-4";
  const routeIconSize = isMobile ? "text-lg" : "text-xl";
  const routeNameSize = isMobile ? "text-sm" : "text-base";
  const badgeSize = isMobile ? "text-xs" : "text-sm";
  const instructionSize = isMobile ? "text-sm" : "text-base";
  const instructionTextSize = isMobile ? "text-sm" : "text-lg";
  const dotSize = isMobile ? "w-2 h-2" : "w-3 h-3";
  const transferPadding = isMobile ? "p-3" : "p-4";
  const transferIconSize = isMobile ? "w-4 h-4" : "w-5 h-5";
  const transferTextSize = isMobile ? "text-sm" : "text-base";
  const transferDescSize = isMobile ? "text-xs" : "text-sm";
  const finalPadding = isMobile ? "p-3" : "p-4";
  const finalIconSize = isMobile ? "w-4 h-4" : "w-5 h-5";
  const finalTextSize = isMobile ? "text-sm" : "text-base";
  const finalDescSize = isMobile ? "text-xs" : "text-sm";
  const connectingLineClass = isMobile ? "left-3 top-8 w-0.5 h-6" : "left-4 top-10 w-0.5 h-8";

  return (
    <div className={containerClass}>
      <div className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <div className={`${headerIconSize} bg-primary/10 rounded-full flex items-center justify-center`}>
          <Target className={`${headerIconClass} text-primary`} />
        </div>
        <div>
          <h3 className={`font-semibold ${headerTitleSize}`}>Route Plan Result</h3>
          <p className="text-sm text-muted-foreground">
            {fromValue} to {toValue}
          </p>
        </div>
      </div>

      {/* Best Route Option */}
      <div className={bestRouteClass}>
        <div className={`flex items-start justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Best</Badge>
            <Badge variant="outline">
              {Math.round((routePlan.bestOption?.confidence || 0) * 100)}%
            </Badge>
          </div>
          <div className="text-right">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              {Math.round(routePlan.bestOption?.totalTime || 0)} min
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              {routePlan.bestOption?.transfers || 0} transfers
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          <div className={`flex items-center gap-2 ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <Navigation className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
            <span className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
              Step-by-Step Guide
            </span>
          </div>
          
          {(routePlan.bestOption?.legs || []).map((leg, legIndex) => {
            const routeObj = routes.find(r => r.id === leg.routeId);
            const routeName = routeObj ? routeObj.name : leg.routeName;
            const isLastLeg = legIndex === (routePlan.bestOption?.legs.length || 0) - 1;
            
            return (
              <div key={legIndex} className="relative">
                <div className={`flex items-start ${isMobile ? 'gap-3' : 'gap-4'}`}>
                  <div className={`flex-shrink-0 ${stepIconSize} bg-primary rounded-full flex items-center justify-center text-primary-foreground ${stepIconTextSize} font-bold`}>
                    {legIndex + 1}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {/* Route Card */}
                    <div className={`bg-blue-50 dark:bg-blue-950/20 ${routeCardPadding} border-l-4 border-blue-500`}>
                      <div className={`flex items-center gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
                        <span className={routeIconSize}>🚌</span>
                        <div className={`font-semibold ${routeNameSize}`}>{routeName}</div>
                        <Badge variant="secondary" className={badgeSize}>
                          {Math.round(leg.estimatedTime)} min
                        </Badge>
                      </div>
                      
                      {/* Boarding Instructions */}
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 ${instructionSize}`}>
                          <div className={`${dotSize} bg-green-500 rounded-full`}></div>
                          <span className="font-medium">
                            {isMobile ? "Board at:" : "Board at:"}
                          </span>
                          <span className={`font-semibold text-primary ${instructionTextSize}`}>
                            {leg.fromStop.name}
                          </span>
                        </div>
                        
                        <div className={`flex items-center gap-2 ${instructionSize}`}>
                          <div className={`${dotSize} bg-red-500 rounded-full`}></div>
                          <span className="font-medium">
                            {isMobile ? "Get off at:" : "Get off at:"}
                          </span>
                          <span className={`font-semibold text-primary ${instructionTextSize}`}>
                            {leg.toStop.name}
                          </span>
                        </div>
                        
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground ${isMobile ? 'mt-1' : 'mt-2'}`}>
                          Distance: {formatDistance(leg.distance)} km
                        </div>
                      </div>
                    </div>
                    
                    {/* Transfer Instructions */}
                    {!isLastLeg && (
                      <div className={`bg-orange-50 dark:bg-orange-950/20 ${transferPadding} border-l-4 border-orange-500`}>
                        <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                          <ArrowRight className={`${transferIconSize} text-orange-600`} />
                          <span className={`font-medium ${transferTextSize} text-orange-600 dark:text-orange-400`}>
                            Transfer Required
                          </span>
                        </div>
                        <div className={`${transferDescSize} text-orange-600 dark:text-orange-400`}>
                          Walk to the next bus stop and wait for your connecting bus
                        </div>
                      </div>
                    )}
                    
                    {/* Final Destination */}
                    {isLastLeg && (
                      <div className={`bg-green-50 dark:bg-green-950/20 ${finalPadding} border-l-4 border-green-500`}>
                        <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                          <Target className={`${finalIconSize} text-green-600`} />
                          <span className={`font-medium ${finalTextSize} text-green-600 dark:text-green-400`}>
                            You've Arrived!
                          </span>
                        </div>
                        <div className={`${finalDescSize} text-green-600 dark:text-green-400`}>
                          You have reached your destination
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Connecting Line */}
                {!isLastLeg && (
                  <div className={`absolute ${connectingLineClass} bg-muted`}></div>
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
            <div className={`w-1 ${isMobile ? 'h-5' : 'h-6'} bg-primary`}></div>
            <h4 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Other Options</h4>
          </div>
          
          <div className="space-y-4">
            {routePlan.options.slice(1, 4).map((option, index) => (
              <div key={option.id} className="bg-card border border-border/50">
                <div className={isMobile ? "p-4" : "p-6"}>
                  <div className={`flex items-start justify-between ${isMobile ? 'mb-4' : 'mb-4'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 2}
                      </div>
                      <div>
                        <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>
                          {Math.round(option.totalTime)} min
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                          {option.transfers} transfers • {formatDistance(option.totalDistance)} km
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={isMobile ? "text-xs" : "text-sm"}>
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
                          <div className={`flex items-start ${isMobile ? 'gap-3' : 'gap-4'}`}>
                            <div className={`flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold`}>
                              {legIndex + 1}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              {/* Route Card */}
                              <div className={`bg-blue-50 dark:bg-blue-950/20 ${routeCardPadding} border-l-4 border-blue-500`}>
                                <div className={`flex items-center gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
                                  <span className={routeIconSize}>🚌</span>
                                  <div className={`font-semibold ${routeNameSize}`}>{routeName}</div>
                                  <Badge variant="secondary" className={badgeSize}>
                                    {Math.round(leg.estimatedTime)} min
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className={`flex items-center gap-2 ${instructionSize}`}>
                                    <div className={`${dotSize} bg-green-500 rounded-full`}></div>
                                    <span className="font-medium">Board:</span>
                                    <span className="font-semibold text-primary">{leg.fromStop.name}</span>
                                  </div>
                                  
                                  <div className={`flex items-center gap-2 ${instructionSize}`}>
                                    <div className={`${dotSize} bg-red-500 rounded-full`}></div>
                                    <span className="font-medium">Get off:</span>
                                    <span className="font-semibold text-primary">{leg.toStop.name}</span>
                                  </div>
                                  
                                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                                    Distance: {formatDistance(leg.distance)} km
                                  </div>
                                </div>
                              </div>
                              
                              {/* Transfer Instructions */}
                              {!isLastLeg && (
                                <div className={`bg-orange-50 dark:bg-orange-950/20 ${transferPadding} border-l-4 border-orange-500`}>
                                  <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                                    <ArrowRight className={`${transferIconSize} text-orange-600`} />
                                    <span className={`font-medium ${transferTextSize} text-orange-600 dark:text-orange-400`}>
                                      Transfer Required
                                    </span>
                                  </div>
                                  <div className={`${transferDescSize} text-orange-600 dark:text-orange-400`}>
                                    Walk to the next bus stop and wait for your connecting bus
                                  </div>
                                </div>
                              )}
                              
                              {/* Final Destination */}
                              {isLastLeg && (
                                <div className={`bg-green-50 dark:bg-green-950/20 ${finalPadding} border-l-4 border-green-500`}>
                                  <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                                    <Target className={`${finalIconSize} text-green-600`} />
                                    <span className={`font-medium ${finalTextSize} text-green-600 dark:text-green-400`}>
                                      You've Arrived!
                                    </span>
                                  </div>
                                  <div className={`${finalDescSize} text-green-600 dark:text-green-400`}>
                                    You have reached your destination
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Connecting Line */}
                          {!isLastLeg && (
                            <div className={`absolute ${connectingLineClass} bg-muted`}></div>
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
  );
}
