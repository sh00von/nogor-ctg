'use client'
import { Search, ChevronsUpDown, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchFormProps {
  fromValue: string;
  toValue: string;
  isPlanning: boolean;
  onFromClick: () => void;
  onToClick: () => void;
  onClear: () => void;
  onRoutePlanning: () => void;
  isMobile?: boolean;
}

export default function SearchForm({
  fromValue,
  toValue,
  isPlanning,
  onFromClick,
  onToClick,
  onClear,
  onRoutePlanning,
  isMobile = false
}: SearchFormProps) {
  const containerClass = isMobile 
    ? "bg-card border border-border/50" 
    : "bg-card border border-border/50";
  
  const paddingClass = isMobile ? "p-6" : "p-8";
  const iconSize = isMobile ? "w-10 h-10" : "w-12 h-12";
  const iconClass = isMobile ? "w-5 h-5" : "w-6 h-6";
  const titleSize = isMobile ? "text-lg" : "text-xl";
  const buttonHeight = isMobile ? "h-12" : "h-14";
  const spacingClass = isMobile ? "space-y-6" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={paddingClass}>
        <div className={`flex items-center gap-4 ${isMobile ? 'mb-6' : 'mb-8'}`}>
          <div className={`${iconSize} bg-primary/10 rounded-full flex items-center justify-center`}>
            <Search className={`${iconClass} text-primary`} />
          </div>
          <div>
            <h3 className={`font-semibold ${titleSize} text-foreground`}>
              Plan Your Journey
            </h3>
            <p className="text-sm text-muted-foreground">
              {isMobile ? "Find your destination" : "Find the best bus route for your trip"}
            </p>
          </div>
        </div>

        <div className={spacingClass}>
          {/* From Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <label className="text-sm font-medium text-foreground">From</label>
            </div>
            <Button
              variant="outline"
              role="combobox"
              className={`w-full justify-between ${buttonHeight} text-left font-normal border-border/50`}
              onClick={onFromClick}
            >
              {fromValue ? fromValue : (isMobile ? "Select starting point" : "Select starting point...")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>

          {/* To Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <label className="text-sm font-medium text-foreground">To</label>
            </div>
            <Button
              variant="outline"
              role="combobox"
              className={`w-full justify-between ${buttonHeight} text-left font-normal border-border/50`}
              onClick={onToClick}
            >
              {toValue ? toValue : (isMobile ? "Select destination" : "Select destination...")}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClear}
              className={`flex-1 ${buttonHeight} border-border/50`}
            >
              <X className="w-4 h-4 mr-2" />
              <span>Clear</span>
            </Button>
            <Button
              onClick={onRoutePlanning}
              disabled={!fromValue || !toValue || isPlanning}
              className={`flex-1 ${buttonHeight}`}
            >
              {isPlanning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>{isMobile ? "Searching..." : "Planning..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Plan Route</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
