'use client';

import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OfflinePage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
            <p className="text-muted-foreground">
              It looks like you&apos;re not connected to the internet. Some features may not be available.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRefresh}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={handleGoHome}
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Available Offline:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• View bus routes and stops</li>
              <li>• Plan routes (cached data)</li>
              <li>• Browse route information</li>
              <li>• Use basic navigation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePage;
