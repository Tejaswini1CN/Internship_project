import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { cn } from '../lib/utils';

export function NotificationOverlay() {
  const { notifications, markNotificationRead } = useAppContext();

  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 pointer-events-none flex flex-col gap-2 pt-safe">
      <AnimatePresence>
        {unreadNotifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto rounded-2xl p-4 shadow-xl border flex items-start gap-3 w-full max-w-md mx-auto backdrop-blur-md",
              notification.type === 'info' && "bg-blue-50/90 border-blue-200 dark:bg-blue-900/80 dark:border-blue-800",
              notification.type === 'alert' && "bg-red-50/90 border-red-200 dark:bg-red-900/80 dark:border-red-800",
              notification.type === 'success' && "bg-emerald-50/90 border-emerald-200 dark:bg-emerald-900/80 dark:border-emerald-800"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
              {notification.type === 'alert' && <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />}
              {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
            </div>
            <div className="flex-1">
               <h4 className={cn(
                 "text-sm font-bold",
                 notification.type === 'info' && "text-blue-900 dark:text-blue-100",
                 notification.type === 'alert' && "text-red-900 dark:text-red-100",
                 notification.type === 'success' && "text-emerald-900 dark:text-emerald-100"
               )}>
                 {notification.title}
               </h4>
               <p className={cn(
                 "text-xs font-medium mt-0.5",
                 notification.type === 'info' && "text-blue-700 dark:text-blue-200",
                 notification.type === 'alert' && "text-red-700 dark:text-red-200",
                 notification.type === 'success' && "text-emerald-700 dark:text-emerald-200"
               )}>
                 {notification.message}
               </p>
            </div>
            <button 
              onClick={() => markNotificationRead(notification.id)}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className={cn(
                "w-4 h-4",
                 notification.type === 'info' && "text-blue-500 dark:text-blue-400",
                 notification.type === 'alert' && "text-red-500 dark:text-red-400",
                 notification.type === 'success' && "text-emerald-500 dark:text-emerald-400"
              )} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
