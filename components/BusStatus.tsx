'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface BusStatus {
  routeId: string;
  routeNumber: string;
  status: 'on-time' | 'delayed' | 'cancelled' | 'unknown';
  delay?: number; // minutes
  nextBus?: string; // estimated time
  lastUpdate: Date;
}

interface BusStatusProps {
  routeId?: string;
  className?: string;
}

export default function BusStatus({ routeId, className }: BusStatusProps) {
  const [status, setStatus] = useState<BusStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate real-time status updates
    const fetchStatus = async () => {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from an API
      const mockStatus: BusStatus = {
        routeId: routeId || 'route-1',
        routeNumber: routeId ? routeId.split('-')[1] : '1',
        status: Math.random() > 0.7 ? 'delayed' : 'on-time',
        delay: Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 5 : undefined,
        nextBus: new Date(Date.now() + Math.random() * 30 * 60 * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        lastUpdate: new Date()
      };
      
      setStatus(mockStatus);
      setIsLoading(false);
      setIsOnline(true);
    };

    fetchStatus();
    
    // Set up periodic updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    // Simulate network status
    const networkInterval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(networkInterval);
    };
  }, [routeId]);

  const getStatusColor = (status: BusStatus['status']) => {
    switch (status) {
      case 'on-time': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: BusStatus['status']) => {
    switch (status) {
      case 'on-time': return <CheckCircle className="w-4 h-4" />;
      case 'delayed': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: BusStatus['status']) => {
    switch (status) {
      case 'on-time': return 'On Time';
      case 'delayed': return 'Delayed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No status information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Route {status.routeNumber} Status</CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <Badge className={getStatusColor(status.status)}>
              {getStatusIcon(status.status)}
              <span className="ml-1">{getStatusText(status.status)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.delay && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>Delayed by {status.delay} minutes</span>
          </div>
        )}
        
        {status.nextBus && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Next bus: {status.nextBus}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Last updated: {status.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
