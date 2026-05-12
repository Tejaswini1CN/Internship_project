import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, ChevronDown, ChevronLeft, Search, Calendar, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../components/ui/CustomButton';
import { useScheduleViewModel } from '../store/useScheduleViewModel';
import { useAppContext } from '../store/AppContext';

export function ScheduleScreen() {
   const navigate = useNavigate();
   const { filteredEvents, expandedId, toggleExpand, searchQuery, setSearchQuery, filterMode, setFilterMode } = useScheduleViewModel();
   const { savedEventIds, toggleSavedEvent } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-background pb-24 overflow-hidden"
    >
      <div className="bg-surface px-4 py-4 flex flex-col sticky top-0 z-10 text-text-primary shadow-sm border-b border-border">
         <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2">
               <ChevronLeft size={28} />
            </button>
            <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">Live Schedule</h1>
            <div className="w-10"></div>
         </div>

         {/* Search Box */}
         <div className="relative mb-4">
           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search events or locations..."
             className="w-full bg-background border border-border rounded-full py-3 pr-4 pl-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
           />
         </div>

         {/* Filter Chips */}
         <div className="flex gap-2">
             {['All', 'Live', 'Upcoming'].map((filter) => (
                 <button 
                   key={filter}
                   onClick={() => setFilterMode(filter as any)}
                   className={cn(
                       "flex-1 py-1.5 rounded-full text-xs font-bold border transition-colors",
                       filterMode === filter 
                         ? "bg-text-primary text-surface border-text-primary" 
                         : "bg-background text-text-secondary border-border hover:border-primary/50"
                   )}
                 >
                     {filter}
                 </button>
             ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredEvents.length === 0 && (
           <div className="flex flex-col items-center justify-center pt-10 text-text-secondary">
              <Calendar size={48} opacity={0.2} className="mb-4" />
              <p className="font-medium text-center">No events found matching your filter.</p>
           </div>
        )}
        {filteredEvents.map((event, index) => {
          const isExpanded = expandedId === event.id;
          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={event.id}
              className={cn(
                "bg-surface rounded-3xl p-5 shadow-sm border transition-all cursor-pointer overflow-hidden",
                event.isLive ? "border-primary/50 shadow-md shadow-primary/10" : "border-border hover:shadow-md"
              )}
              whileHover={{ y: -2 }}
              onClick={() => toggleExpand(event.id)}
            >
              <motion.div layout className="flex justify-between items-start mb-3">
                <h3 className={cn("font-bold text-lg", event.isLive ? "text-primary dark:text-primary-dark" : "text-text-primary")}>
                  {event.title}
                </h3>
                <div className="flex items-center gap-3">
                  {event.isLive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold tracking-widest uppercase border border-red-100 dark:border-red-900">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      LIVE
                    </span>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSavedEvent(event.id); }}
                     className={cn("p-1.5 rounded-xl transition-colors", savedEventIds.includes(event.id) ? "bg-orange-50 text-orange-500 dark:bg-orange-900/20" : "bg-surface hover:bg-border text-text-secondary")}
                  >
                     <Bookmark size={18} fill={savedEventIds.includes(event.id) ? "currentColor" : "none"} />
                  </button>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} className="text-text-secondary" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div layout className="flex flex-col gap-2 mt-3">
                <div className="flex items-center text-sm font-medium text-text-secondary gap-2">
                  <Clock size={16} className="text-gray-400" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm font-medium text-text-secondary gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {event.location}
                </div>
              </motion.div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-sm font-medium text-text-secondary leading-relaxed mb-4">
                        {event.details}
                      </p>
                      <CustomButton 
                        fullWidth 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/map');
                        }}
                      >
                        <MapPin size={18} />
                        View on Map
                      </CustomButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
