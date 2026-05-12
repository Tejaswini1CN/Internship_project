import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Map as MapIcon, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { animate, motion } from 'motion/react';
import { useAppContext } from '../store/AppContext';

interface NavBarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function BottomNavBar({ onNavigate, currentPath }: NavBarProps) {
  const { t } = useAppContext();
  
  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Map', path: '/map', icon: MapIcon },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // We only show the active tab state if the current path starts with the tab's path
  // Home is special case
  const isTabActive = (tabPath: string) => {
    if (tabPath === '/') return currentPath === '/';
    return currentPath.startsWith(tabPath);
  };

  return (
    <div className="bg-surface border-t border-border rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] p-2 pb-safe absolute bottom-0 w-full z-50">
      <div className="flex justify-around items-center h-16 relative">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.path);
          return (
            <button
              key={tab.name}
              onClick={() => onNavigate(tab.path)}
              className="flex flex-col items-center justify-center w-16 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bubble"
                  className="absolute p-6 bg-primary/10 dark:bg-primary/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon
                className={cn(
                  "w-6 h-6 transition-colors duration-200 z-10",
                  isActive ? "text-primary dark:text-primary-dark" : "text-text-secondary"
                )}
              />
              <span
                className={cn(
                  "text-[10px] mt-1 z-10 transition-colors duration-200",
                  isActive ? "text-primary dark:text-primary-dark font-black" : "text-text-secondary font-medium"
                )}
              >
                {t(tab.name)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
