'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface RouteStats {
  routeId: string;
  routeNumber: string;
  popularity: number;
  averageTime: number;
  reliability: number;
  userRating: number;
  totalSearches: number;
}

interface RouteAnalyticsProps {
  routeId?: string;
  className?: string;
}

export default function RouteAnalytics({ routeId, className }: RouteAnalyticsProps) {
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate analytics data
    const fetchStats = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock analytics data
      const mockStats: RouteStats = {
        routeId: routeId || 'route-1',
        routeNumber: routeId ? routeId.split('-')[1] : '1',
        popularity: Math.floor(Math.random() * 100) + 1,
        averageTime: Math.floor(Math.random() * 30) + 20,
        reliability: Math.floor(Math.random() * 30) + 70,
        userRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        totalSearches: Math.floor(Math.random() * 1000) + 100
      };
      
      setStats(mockStats);
      setIsLoading(false);
    };

    fetchStats();
  }, [routeId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Route Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'bg-green-100 text-green-800';
    if (popularity >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return 'bg-green-100 text-green-800';
    if (reliability >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Route {stats.routeNumber} Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Popularity</span>
            </div>
            <Badge className={getPopularityColor(stats.popularity)}>
              {stats.popularity}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Avg. Time</span>
            </div>
            <div className="text-lg font-semibold">{stats.averageTime} min</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Reliability</span>
            </div>
            <Badge className={getReliabilityColor(stats.reliability)}>
              {stats.reliability}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Searches</span>
            </div>
            <div className="text-lg font-semibold">{stats.totalSearches.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User Rating</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < stats.userRating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({stats.userRating}.0)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
