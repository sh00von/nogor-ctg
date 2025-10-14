'use client'
import { MapPin, Clock, Users, Route as RouteIcon } from 'lucide-react';
import { BusRoute } from '@/lib/bus-routes';

interface RouteCardProps {
  route: BusRoute;
  onClick: (route: BusRoute) => void;
  isMobile?: boolean;
}

export default function RouteCard({ route, onClick, isMobile = false }: RouteCardProps) {
  const getRouteIcon = (route: BusRoute) => {
    if (route.number.startsWith('Laguna')) {
      return '🚌';
    }
    return '🚌';
  };

  const getRouteColor = (route: BusRoute) => {
    if (route.number.startsWith('Laguna')) {
      return 'bg-primary';
    }
    return 'bg-primary';
  };

  const cardClass = isMobile 
    ? "cursor-pointer transition-all duration-300 group bg-card rounded-2xl p-4 shadow-sm border hover:shadow-md active:scale-95"
    : "cursor-pointer transition-all duration-300 group bg-card border border-border/50 hover:shadow-md hover:border-primary/20";

  const paddingClass = isMobile ? "" : "p-6";
  const iconSize = isMobile ? "w-10 h-10" : "w-12 h-12";
  const iconTextSize = isMobile ? "text-lg" : "text-lg";
  const titleSize = isMobile ? "" : "text-base";
  const routeIconSize = isMobile ? "text-lg" : "text-lg";
  const routeNameSize = isMobile ? "" : "text-base";
  const descriptionSize = isMobile ? "text-sm" : "text-sm";
  const metadataSize = isMobile ? "text-xs" : "text-xs";

  return (
    <div className={cardClass} onClick={() => onClick(route)}>
      <div className={paddingClass}>
        <div className="flex items-start gap-4">
          <div className={`${iconSize} ${getRouteColor(route)} rounded-lg flex items-center justify-center text-primary-foreground font-bold ${iconTextSize}`}>
            {route.number.startsWith('Laguna') ? 'L' : route.number}
          </div>
          <div className="flex-1">
            <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
              <span className={routeIconSize}>{getRouteIcon(route)}</span>
              <div className={`font-semibold ${routeNameSize} ${route.number.startsWith('Laguna') ? 'text-foreground' : ''}`}>
                {route.name}
              </div>
            </div>
            <div className={`${descriptionSize} text-muted-foreground ${isMobile ? 'mb-2' : 'mb-3'}`}>
              {route.stops[0]?.name} → {route.stops[route.stops.length - 1]?.name}
            </div>
            <div className={`flex items-center gap-4 ${metadataSize} text-muted-foreground`}>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {route.stops.length} {isMobile ? 'Stops' : 'stops'}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(route.stops.length * 2.5)} {isMobile ? 'min' : 'minutes'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
