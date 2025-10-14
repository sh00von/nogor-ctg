'use client'
import { MapPin, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusRoute } from '@/lib/bus-routes';

interface RouteDetailsModalProps {
  route: BusRoute | null;
  onClose: () => void;
}

export default function RouteDetailsModal({ route, onClose }: RouteDetailsModalProps) {
  if (!route) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-lg">
        {/* Modal Header */}
        <div className="bg-primary px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                {route.number}
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-foreground">
                  {route.name}
                </h2>
                <p className="text-primary-foreground/80">
                  {route.stops[0]?.name} → {route.stops[route.stops.length - 1]?.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
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
                <div className="font-semibold">{route.stops.length} Stops</div>
                <div className="text-sm text-muted-foreground">Total stops</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold">{Math.round(route.stops.length * 2.5)} min</div>
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
            {route.stops.map((stop, index) => (
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
                {index < route.stops.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
