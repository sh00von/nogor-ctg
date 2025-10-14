'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Thermometer, RefreshCw, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  description: string;
  feelsLike: number;
  lastUpdated: string;
  forecast?: {
    time: string;
    temperature: number;
    condition: string;
  }[];
}

interface WeatherWidgetProps {
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
    // Update weather every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use OpenWeatherMap API for real weather data
      // Chittagong coordinates: 22.3569° N, 91.7832° E
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('OpenWeatherMap API key not found. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your .env file.');
      }

      // Real API call to OpenWeatherMap with 5-day forecast
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=22.3569&lon=91.7832&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Weather API request failed: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Get current weather from first forecast entry
      const current = data.list[0];
      
      // Create forecast data for next 24 hours (8 entries, 3-hour intervals)
      const forecast = data.list.slice(0, 8).map((item: { dt: number; main: { temp: number }; weather: Array<{ main: string }> }) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          hour12: true 
        }),
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].main.toLowerCase()
      }));
      
      const weatherData: WeatherData = {
        temperature: Math.round(current.main.temp),
        condition: current.weather[0].main.toLowerCase(),
        icon: current.weather[0].icon,
        description: current.weather[0].description,
        feelsLike: Math.round(current.main.feels_like),
        lastUpdated: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        forecast
      };
      
      setWeather(weatherData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear':
      case 'sunny':
        return <Sun className="w-8 h-8 text-primary" />;
      case 'clouds':
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-muted-foreground" />;
      case 'rain':
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-primary" />;
      case 'snow':
        return <CloudSnow className="w-8 h-8 text-muted-foreground" />;
      default:
        return <Cloud className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const getRouteRecommendation = (weather: WeatherData) => {
    if (weather.condition.includes('rain')) {
      return {
        message: 'Rainy weather - Consider routes with covered stops',
        color: 'text-destructive',
        icon: <CloudRain className="w-5 h-5" />,
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20'
      };
    } else if (weather.temperature > 35) {
      return {
        message: 'Hot weather - Choose routes with air-conditioned buses',
        color: 'text-destructive',
        icon: <Zap className="w-5 h-5" />,
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20'
      };
    } else {
      return {
        message: 'Good weather for travel',
        color: 'text-primary',
        icon: <CheckCircle className="w-5 h-5" />,
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20'
      };
    }
  };

  if (loading) {
    return (
      <div className={`bg-card rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-muted rounded w-32"></div>
            <div className="h-6 w-6 bg-muted rounded"></div>
          </div>
          <div className="h-12 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-40"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card rounded-xl shadow-sm border p-6 ${className}`}>
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Weather unavailable</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <button 
            onClick={fetchWeatherData}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const recommendation = getRouteRecommendation(weather);

  return (
    <div className={`bg-card rounded-xl shadow-sm border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Chittagong Weather</h3>
            <p className="text-sm text-muted-foreground">Updated {weather.lastUpdated}</p>
          </div>
          <button 
            onClick={fetchWeatherData}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        {/* Main Weather Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted/30 rounded-xl">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <div className="text-4xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Feels like</div>
            <div className="text-lg font-semibold">{weather.feelsLike}°C</div>
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="p-6">
        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg mb-6">
          <Thermometer className="w-5 h-5 text-primary" />
          <div>
            <div className="text-sm font-medium">{weather.feelsLike}°C</div>
            <div className="text-xs text-muted-foreground">Feels Like</div>
          </div>
        </div>

        {/* Route Recommendation */}
        <div className="p-4 rounded-lg border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="text-primary">{recommendation.icon}</div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {recommendation.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Travel advice based on current conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
