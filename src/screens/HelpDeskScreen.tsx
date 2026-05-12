import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Package, ShieldAlert, Plus, Search, MapPin, Clock, X, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CustomButton } from '../components/ui/CustomButton';
import { useHelpDeskViewModel } from '../store/useHelpDeskViewModel';

export function HelpDeskScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') === 'persons' ? 'persons' : 'items';
  
  const { 
    filteredLostItems, filteredMissingPersons, 
    activeTab, setActiveTab,
    filterMode, setFilterMode,
    showReportSheet, setShowReportSheet,
    reportType, setReportType,
    formName, setFormName,
    formAge, setFormAge,
    formDesc, setFormDesc,
    formError, showSuccess,
    markItemStatus, markPersonStatus,
    handleSubmit
  } = useHelpDeskViewModel(defaultTab);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
      <div className="bg-surface px-4 py-4 flex flex-col sticky top-0 z-10 shadow-sm border-b border-border">
         <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-primary">
               <ChevronLeft size={28} />
            </button>
            <h1 className="text-xl font-black text-text-primary absolute left-1/2 -translate-x-1/2">Help Desk</h1>
            <div className="w-10"></div>
         </div>
         
         {/* Tabs */}
         <div className="flex bg-background p-1.5 rounded-2xl mb-4">
            <button 
              onClick={() => setActiveTab('items')}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                activeTab === 'items' ? "bg-surface text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Lost Items
            </button>
            <button 
              onClick={() => setActiveTab('persons')}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
                activeTab === 'persons' ? "bg-surface text-red-500 shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Missing Persons
            </button>
         </div>

         {/* Filter Chips */}
         <div className="flex gap-2 mx-auto">
             {['All', 'Active', 'Resolved'].map(filter => (
                 <button 
                   key={filter}
                   onClick={() => setFilterMode(filter as any)}
                   className={cn(
                       "px-4 py-1.5 rounded-full text-xs font-bold border transition-colors",
                       filterMode === filter 
                         ? "bg-text-primary text-surface border-text-primary" 
                         : "bg-surface text-text-secondary border-border hover:border-primary/50"
                   )}
                 >
                     {filter}
                 </button>
             ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
        {activeTab === 'items' && filteredLostItems.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-10 text-text-secondary">
             <Package size={48} opacity={0.2} className="mb-4" />
             <p className="font-medium">No lost items reported.</p>
          </div>
        )}
        {activeTab === 'items' && filteredLostItems.map((item: any) => (
            <div key={item.id} className="bg-surface rounded-3xl p-5 border border-border shadow-sm flex gap-4 transition-all hover:shadow-md">
               <div className="w-20 h-20 bg-border/50 rounded-2xl flex items-center justify-center text-text-secondary shrink-0 overflow-hidden relative">
                  {item.imageUri ? (
                    <img src={item.imageUri} alt="Lost Item" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={28} opacity={0.5} />
                  )}
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-text-primary text-lg">{item.name}</h3>
                 <p className="text-sm text-text-secondary line-clamp-2 mt-1 mb-2">{item.description}</p>
                 <div className="flex flex-col gap-1 mb-3">
                    <span className="text-xs font-medium text-text-secondary flex items-center gap-1"><MapPin size={12}/> {item.location}</span>
                    <span className="text-xs font-medium text-text-secondary flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className={cn(
                       "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                       item.status === 'Lost' 
                          ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50" 
                          : item.status === 'Resolved' ? "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" 
                          : "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                    )}>
                       {item.status}
                    </div>
                    {item.status === 'Lost' && (
                       <button onClick={() => markItemStatus(item.id, 'Found')} className="text-xs font-bold text-primary px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">Mark Found</button>
                    )}
                    {item.status === 'Found' && (
                       <button onClick={() => markItemStatus(item.id, 'Resolved')} className="text-xs font-bold text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">Mark Resolved</button>
                    )}
                 </div>
               </div>
            </div>
        ))}

        {activeTab === 'persons' && filteredMissingPersons.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-10 text-text-secondary">
             <User size={48} opacity={0.2} className="mb-4" />
             <p className="font-medium">No missing persons reported.</p>
          </div>
        )}
        {activeTab === 'persons' && filteredMissingPersons.map((person: any) => (
            <div key={person.id} className="bg-surface rounded-3xl p-5 border-2 border-red-500/10 shadow-sm flex gap-4 transition-all hover:shadow-md hover:border-red-500/20">
               <div className="w-20 h-28 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-400 shrink-0 overflow-hidden relative">
                  {person.imageUri ? (
                    <img src={person.imageUri} alt="Missing Person" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} opacity={0.7} />
                  )}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className="font-bold text-text-primary text-xl leading-tight">{person.name}</h3>
                 </div>
                 <p className="text-xs font-bold text-red-500 mb-2">Age: {person.age}</p>
                 <p className="text-sm text-text-secondary line-clamp-2 mb-2">{person.description}</p>
                 <div className="flex flex-col gap-1 mb-3">
                    <span className="text-xs font-medium text-text-secondary flex items-center gap-1"><MapPin size={12}/> Last seen: {person.location}</span>
                    <span className="text-xs font-medium text-text-secondary flex items-center gap-1"><Clock size={12}/> {person.time}</span>
                 </div>
                 <div className="flex items-center justify-between mt-2">
                    <div className={cn(
                       "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                       person.status === 'Missing' 
                          ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 animate-pulse" 
                          : "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"
                    )}>
                       {person.status}
                    </div>
                    {person.status === 'Missing' && (
                       <button onClick={() => markPersonStatus(person.id, 'Found')} className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">Mark Found</button>
                    )}
                 </div>
               </div>
            </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(`/report?type=${activeTab === 'persons' ? 'person' : 'item'}`)}
        className="absolute bottom-24 right-6 bg-gradient-to-br from-primary to-accent text-white px-5 py-4 rounded-full shadow-lg flex items-center gap-2 font-bold z-20"
      >
         <Plus size={24} />
         Report
      </motion.button>

    </motion.div>
  );
}
