'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useCallback } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Always show the button, even if theme context is not fully initialized
  const isInitialized = theme && setTheme;

  const cycleTheme = useCallback(() => {
    if (!isInitialized) {
      console.log('Theme not initialized yet');
      return;
    }
    
    // Cycle through: light -> dark -> light (no system mode)
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('light');
        break;
      case 'system':
        // If somehow in system mode, switch to light
        setTheme('light');
        break;
      default:
        setTheme('light');
    }
  }, [theme, setTheme, isInitialized]);

  const getIcon = () => {
    if (!isInitialized) {
      return <Moon className="h-4 w-4" />;
    }
    
    // Show the icon for the mode you're currently in
    // Dark mode = Moon icon, Light mode = Sun icon
    return resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getTooltip = () => {
    if (!isInitialized) {
      return 'Theme toggle loading...';
    }
    
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to light mode';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-9 w-9 p-0 border border-gray-300 dark:border-gray-600"
      title={getTooltip()}
      disabled={!isInitialized}
    >
      {getIcon()}
      <span className="sr-only">
        {getTooltip()}
      </span>
    </Button>
  );
}
