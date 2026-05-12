import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProfileOptionItemProps extends HTMLMotionProps<"button"> {
  title: string;
  icon: React.ReactNode;
  iconColorClass?: string;
  isDestructive?: boolean;
}

export function ProfileOptionItem({ 
  title, 
  icon, 
  iconColorClass = "text-primary bg-primary/10",
  isDestructive,
  className,
  ...props 
}: ProfileOptionItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full bg-surface rounded-2xl p-4 flex items-center justify-between text-left",
        "border border-border shadow-sm hover:shadow-md transition-all mb-3 text-text-primary",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", iconColorClass)}>
          {icon}
        </div>
        <span className={cn("font-bold text-base", isDestructive && "text-red-500")}>
          {title}
        </span>
      </div>
      <ChevronRight size={20} className={cn("text-gray-400", isDestructive && "text-red-300")} />
    </motion.button>
  );
}
