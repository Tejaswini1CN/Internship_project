import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

interface CustomButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function CustomButton({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className,
  ...props 
}: CustomButtonProps) {
  const baseStyles = "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 text-base shadow-sm";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg",
    secondary: "bg-secondary text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-primary hover:bg-primary/10 shadow-none",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(baseStyles, variants[variant], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
