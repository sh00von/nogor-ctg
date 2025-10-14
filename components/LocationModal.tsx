'use client'
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusRoute } from '@/lib/bus-routes';

interface LocationModalProps {
  isOpen: boolean;
  type: 'from' | 'to' | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onLocationSelect: (location: string, type: 'from' | 'to') => void;
  onClose: () => void;
  allStops: string[];
  routes: BusRoute[];
}

export default function LocationModal({
  isOpen,
  type,
  searchTerm,
  onSearchChange,
  onLocationSelect,
  onClose,
  allStops,
  routes
}: LocationModalProps) {
  if (!isOpen || !type) return null;

  const filteredStops = allStops.filter(stop => 
    !searchTerm.trim() || 
    stop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
                  {type === 'from' ? 'Select Starting Point' : 'Select Destination'}
                </h2>
                <p className="text-primary-foreground/80">
                  Find your preferred location
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
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Location List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStops.length === 0 && searchTerm.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No locations found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              filteredStops.map((stop) => (
                <div
                  key={stop}
                  className="cursor-pointer p-4 border rounded-lg hover:bg-muted transition-colors"
                  onClick={() => onLocationSelect(stop, type)}
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
