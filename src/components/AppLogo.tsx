import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AppLogoProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
}

export function AppLogo({ size = 120, className, isAnimated = false }: AppLogoProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)} 
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" /> {/* Orange */}
            <stop offset="50%" stopColor="#ec4899" /> {/* Pink */}
            <stop offset="100%" stopColor="#8b5cf6" /> {/* Purple */}
          </linearGradient>
          
          <linearGradient id="stand-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Glowing Background Circle */}
        <motion.circle
          cx="50" cy="50" r="48"
          fill="url(#bg-grad)"
          initial={isAnimated ? { scale: 0.8, opacity: 0 } : false}
          animate={isAnimated ? { scale: 1, opacity: 1 } : false}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        />

        {/* Dashed Festive Ring border representing Torans */}
        <motion.circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          animate={isAnimated ? { rotate: 360 } : false}
          style={{ transformOrigin: '50px 50px' }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* The Ferris Wheel Stand */}
        <motion.path 
          d="M50 48 L35 82 L65 82 Z"
          fill="url(#stand-grad)"
          initial={isAnimated ? { y: 20, opacity: 0 } : false}
          animate={isAnimated ? { y: 0, opacity: 1 } : false}
          transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
        />
        
        {/* The Setup platform */}
        <motion.rect 
          x="30" y="80" width="40" height="6" rx="3" 
          fill="#fde047"
          initial={isAnimated ? { scaleX: 0, opacity: 0 } : false}
          animate={isAnimated ? { scaleX: 1, opacity: 1 } : false}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        />

        {/* The Wheel */}
        <motion.g
          animate={isAnimated ? { rotate: 360 } : false}
          style={{ transformOrigin: '50px 45px' }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          {/* Main wheel rim */}
          <circle cx="50" cy="45" r="26" fill="none" stroke="white" strokeWidth="3" />
          <circle cx="50" cy="45" r="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          
          {/* Center Hub */}
          <circle cx="50" cy="45" r="5" fill="#fde047" />
          
          {/* Spokes */}
          {[0, 45, 90, 135].map((angle, i) => (
             <line 
                key={`spoke-${i}`} 
                x1="50" y1="19" 
                x2="50" y2="71" 
                stroke="white" 
                strokeWidth="1.5" 
                transform={`rotate(${angle} 50 45)`} 
             />
          ))}
          
          {/* Cabins */}
          {[...Array(8)].map((_, i) => (
             <circle 
                key={`cabin-${i}`} 
                cx="50" cy="19" 
                r="4.5" 
                fill="#fde047" 
                transform={`rotate(${i * 45} 50 45)`} 
             />
          ))}
        </motion.g>

      </svg>
    </div>
  );
}
