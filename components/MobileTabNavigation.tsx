'use client'
import { Search, Bus, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileTabNavigationProps {
  activeTab: 'plan' | 'routes' | 'more';
  onTabChange: (tab: 'plan' | 'routes' | 'more') => void;
}

export default function MobileTabNavigation({ activeTab, onTabChange }: MobileTabNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 safe-area-bottom z-50 lg:hidden">
      <div className="flex items-center justify-around py-3 px-6">
        <Button 
          variant={activeTab === 'plan' ? 'default' : 'ghost'} 
          size="sm" 
          className="flex flex-col items-center gap-2 h-auto py-3 px-4"
          onClick={() => onTabChange('plan')}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
            activeTab === 'plan' ? 'bg-primary-foreground' : 'bg-primary/10'
          }`}>
            <Search className={`w-4 h-4 ${
              activeTab === 'plan' ? 'text-primary' : 'text-primary'
            }`} />
          </div>
          <span className="text-xs font-medium">Plan</span>
        </Button>
        <Button 
          variant={activeTab === 'routes' ? 'default' : 'ghost'} 
          size="sm" 
          className="flex flex-col items-center gap-2 h-auto py-3 px-4"
          onClick={() => onTabChange('routes')}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
            activeTab === 'routes' ? 'bg-primary-foreground' : 'bg-primary/10'
          }`}>
            <Bus className={`w-4 h-4 ${
              activeTab === 'routes' ? 'text-primary' : 'text-primary'
            }`} />
          </div>
          <span className="text-xs font-medium">Routes</span>
        </Button>
        <Button 
          variant={activeTab === 'more' ? 'default' : 'ghost'} 
          size="sm" 
          className="flex flex-col items-center gap-2 h-auto py-3 px-4"
          onClick={() => onTabChange('more')}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
            activeTab === 'more' ? 'bg-primary-foreground' : 'bg-primary/10'
          }`}>
            <Sun className={`w-4 h-4 ${
              activeTab === 'more' ? 'text-primary' : 'text-primary'
            }`} />
          </div>
          <span className="text-xs font-medium">More</span>
        </Button>
      </div>
    </div>
  );
}
