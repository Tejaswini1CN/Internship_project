import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Map as MapIcon, Search, MessageSquare, BookOpen, ChevronRight, BellRing, UserCircle, Plus, ShieldAlert, CheckCircle2, ChevronLeft, Send, X, PhoneCall, LifeBuoy, Users, Package, User, AlertTriangle, HeartPulse, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { CustomButton } from '../components/ui/CustomButton';
import { useHomeViewModel } from '../store/useHomeViewModel';
import { AppLogo } from '../components/AppLogo';

const dummyStories = [
  { id: 1, title: 'The Origin of Namma Jatre', content: 'Centuries ago, the village faced a severe drought. The local deity appeared in a dream...' },
  { id: 2, title: 'The Chariot Maker', content: 'Generations of the same family have been building the ceremonial chariot...' }
];

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, isGuest, liveEvent, activeMissingPersons, activeLostItems, isAlertsEmpty, syncState } = useHomeViewModel();
  
  const [showStoriesSheet, setShowStoriesSheet] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showAddItem, setShowAddItem] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
      <div className="flex flex-col h-full w-full overflow-y-auto pb-36">
      {/* App Bar / Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight drop-shadow-sm flex items-center gap-3">
              <AppLogo size={32} className="drop-shadow-sm" />
              Namaskara{isGuest ? '!' : `, ${user?.name?.split(' ')[0]}!`}
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-white/90 font-medium text-base">Welcome to Namma Jatre</p>
               <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  syncState === 'offline' ? "bg-red-500/20 text-red-100" :
                  syncState === 'syncing' ? "bg-amber-500/20 text-amber-100 animate-pulse" :
                  "bg-green-500/20 text-green-100"
               )}>
                  {syncState === 'offline' ? 'Offline Mode' : syncState === 'syncing' ? 'Syncing...' : 'Connected'}
               </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-full backdrop-blur-md shadow-sm">
               <BellRing size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-10 flex-1">
        
        {/* Live Event Card */}
        <section className="space-y-4">
          <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest pl-1">Happening Now</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/schedule')}
            className="bg-surface rounded-3xl p-5 shadow-sm border border-border flex items-start gap-4 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          >
            {/* Pulse Indicator */}
            {liveEvent?.isLive && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-100 dark:border-red-900/50">
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-widest">LIVE</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </div>
            )}

            <div className="bg-gradient-to-br from-accent/20 to-primary/10 rounded-2xl p-4 text-primary shadow-inner shrink-0">
               <Calendar size={28} />
            </div>
            
            <div className="flex-1 pr-14 pt-1">
              <h3 className="font-bold text-xl text-text-primary group-hover:text-primary transition-colors leading-tight">{liveEvent?.title || 'No upcoming events'}</h3>
              <p className="text-sm font-medium text-text-secondary mt-1.5 mb-3">{liveEvent?.time || ''} {liveEvent?.location ? `• ${liveEvent.location}` : ''}</p>
              {liveEvent?.isLive ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Ongoing now
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                  {liveEvent ? 'Upcoming' : 'Check Schedule'}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-4">
          <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest pl-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <ActionCard icon={Calendar} title="Schedule" colorClass="text-primary bg-primary/10" onClick={() => navigate('/schedule')} />
            <ActionCard icon={MapIcon} title="Fair Map" colorClass="text-accent bg-accent/10 dark:text-yellow-400 dark:bg-yellow-400/10" onClick={() => navigate('/map')} />
            <ActionCard icon={Shield} title="Safety Info" colorClass="text-blue-500 bg-blue-500/10" onClick={() => navigate('/safety')} />
            <ActionCard icon={MessageSquare} title="Assistant" colorClass="text-teal-500 bg-teal-500/10" onClick={() => navigate('/assistant')} />
          </div>
        </section>

        {/* Cultural Stories (Horizontal Scroll) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center pl-1 pr-2">
             <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest">Cultural Stories</h2>
             <button onClick={() => setShowStoriesSheet(true)} className="text-xs font-bold text-primary flex items-center">View All <ChevronRight size={14}/></button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory pt-1 -mx-6 px-6 no-scrollbar">
             {dummyStories.map(story => (
               <motion.div 
                 key={story.id}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => { setSelectedStory(story); setShowStoriesSheet(true); }}
                 className="min-w-[280px] bg-gradient-to-br from-secondary/5 to-purple-900/5 dark:from-secondary/20 dark:to-purple-900/20 rounded-3xl p-6 border border-secondary/10 dark:border-secondary/30 snap-start shrink-0 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
               >
                 <BookOpen size={64} className="absolute -right-4 -bottom-4 text-secondary/5 dark:text-secondary/10 -rotate-12" />
                 <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-1 relative z-10">{story.title}</h3>
                 <p className="text-sm text-text-secondary line-clamp-2 font-medium mb-4 relative z-10">{story.content}</p>
                 <span className="text-xs font-bold text-secondary uppercase tracking-wider relative z-10">Read Legend</span>
               </motion.div>
             ))}
          </div>
        </section>

        {/* Help Desk Preview */}
        <section id="help-desk" className="space-y-4 pt-2 relative">
          <div className="flex justify-between items-center pl-1 pr-2">
             <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest">Help Desk Alerts</h2>
             <button onClick={() => navigate('/help-desk')} className="text-xs font-bold text-primary flex items-center bg-primary/10 px-3 py-1.5 rounded-full">View All <ChevronRight size={14} className="ml-1"/></button>
          </div>
          <div className="space-y-4">
             {isAlertsEmpty && (
                 <div className="bg-surface rounded-3xl p-6 border border-border shadow-sm flex flex-col items-center justify-center text-center">
                    <CheckCircle2 size={32} className="text-green-500 mb-3" />
                    <h3 className="font-bold text-text-primary">All Clear</h3>
                    <p className="text-sm text-text-secondary mt-1">No active alerts at the moment. Have a safe Jatre!</p>
                 </div>
             )}
             {activeMissingPersons.slice(0, 2).map((person: any) => (
                <div key={person.id} className="bg-surface rounded-3xl p-5 border border-red-500/20 shadow-sm flex gap-4">
                   <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0 overflow-hidden relative">
                      {person.imageUri ? (
                        <img src={person.imageUri} alt="Missing Person" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} opacity={0.7} />
                      )}
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-text-primary text-lg">{person.name}</h3>
                     <p className="text-sm text-text-secondary line-clamp-1 mb-2.5 mt-0.5">{person.description}</p>
                     <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 animate-pulse">
                        MISSING
                     </div>
                   </div>
                </div>
             ))}
             {activeLostItems.slice(0, 2).map((item: any) => (
                <div key={item.id} className="bg-surface rounded-3xl p-5 border border-border shadow-sm flex gap-4">
                   <div className="w-16 h-16 bg-border/50 rounded-2xl flex items-center justify-center text-text-secondary shrink-0 overflow-hidden relative">
                      {item.imageUri ? (
                        <img src={item.imageUri} alt="Lost Item" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={24} opacity={0.5} />
                      )}
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-text-primary text-lg">{item.name}</h3>
                     <p className="text-sm text-text-secondary line-clamp-1 mb-2.5 mt-0.5">{item.description}</p>
                     <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50">
                        LOST
                     </div>
                   </div>
                </div>
             ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
           <h2 className="text-sm font-black text-text-secondary uppercase tracking-widest pl-1 mb-3">Need Help?</h2>
           <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/report?type=item')} className="bg-background flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors text-left w-full text-text-primary">
                 <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 shrink-0"><Package size={24} /></div>
                 <div>
                    <div className="font-bold text-[15px]">Report Lost Item</div>
                    <div className="text-xs font-medium text-text-secondary">Found or lost something? Let us know.</div>
                 </div>
              </button>
              <button onClick={() => navigate('/report?type=person')} className="bg-background flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-red-500/30 transition-colors text-left w-full text-text-primary">
                 <div className="bg-red-500/10 p-2 rounded-xl text-red-500 shrink-0"><Users size={24} /></div>
                 <div>
                    <div className="font-bold text-[15px]">Report Missing Person</div>
                    <div className="text-xs font-medium text-text-secondary">Report missing children or elderly.</div>
                 </div>
              </button>
           </div>
        </section>

      </div>
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/report?type=item')}
        className="absolute bottom-24 right-6 bg-gradient-to-br from-primary to-accent text-white px-5 py-4 rounded-full shadow-lg flex items-center gap-2 font-bold z-50 hover:shadow-xl transition-shadow"
      >
         <Plus size={24} />
         Report
      </motion.button>

      {/* Overlays / Bottom Sheets */}
      <AnimatePresence>
        
        {/* Stories Viewer Overlay */}
        {showStoriesSheet && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => { setShowStoriesSheet(false); setSelectedStory(null); }} />
             <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed bottom-0 inset-x-0 h-[85%] bg-surface rounded-t-[40px] shadow-2xl z-[70] flex flex-col overflow-hidden"
             >
               <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 shrink-0">
                  <span className="font-black text-sm text-text-secondary uppercase tracking-widest">{selectedStory ? 'Legend' : 'All Stories'}</span>
                  <button onClick={() => { setShowStoriesSheet(false); setSelectedStory(null); }} className="p-2 bg-border/50 rounded-full hover:bg-border transition-colors text-text-secondary"><X size={20} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8">
                  {selectedStory ? (
                     <>
                        <h2 className="text-3xl font-black text-text-primary leading-tight mb-8">{selectedStory.title}</h2>
                        <p className="text-text-primary leading-relaxed font-medium text-lg whitespace-pre-wrap">{selectedStory.content}</p>
                     </>
                  ) : (
                     <div className="space-y-6">
                        {dummyStories.map(story => (
                           <div key={story.id} onClick={() => setSelectedStory(story)} className="bg-background rounded-3xl p-6 border border-border cursor-pointer hover:border-primary/30 transition-colors">
                              <h3 className="font-bold text-xl text-text-primary mb-3">{story.title}</h3>
                              <p className="text-text-secondary line-clamp-2 font-medium">{story.content}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
             </motion.div>
           </>
        )}

        {/* Add Item Overlay */}
        {showAddItem && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setShowAddItem(false)} />
             <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed bottom-0 inset-x-0 bg-surface rounded-t-[40px] shadow-2xl z-[70] flex flex-col overflow-hidden max-h-[90%]"
             >
               <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
                  <h2 className="text-xl font-black text-text-primary">Report Item</h2>
                  <button onClick={() => setShowAddItem(false)} className="p-2 bg-border/50 rounded-full hover:bg-border transition-colors text-text-secondary"><X size={20} /></button>
               </div>
               <div className="p-6 overflow-y-auto">
                  <div className="space-y-6">
                     <div className="w-full h-32 bg-background border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-text-secondary gap-3 cursor-pointer">
                        <Search size={32} className="text-primary/50" />
                        <span className="text-sm font-bold text-text-secondary">Add Photo</span>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-text-primary ml-1">Item Title</label>
                        <input placeholder="e.g. Red Wallet" className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-text-primary ml-1">Description & Location</label>
                        <textarea rows={3} placeholder="Where did you see it?" className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base text-text-primary resize-none"></textarea>
                     </div>
                     <CustomButton onClick={() => setShowAddItem(false)} fullWidth>Submit Report</CustomButton>
                     <div className="h-4"></div>
                  </div>
               </div>
             </motion.div>
           </>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

function ActionCard({ icon: Icon, title, colorClass, onClick }: { icon: any, title: string, colorClass: string, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-surface p-4 rounded-3xl shadow-sm border border-border flex items-center gap-4 transition-all hover:shadow-md w-full"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", colorClass)}>
        <Icon size={24} />
      </div>
      <span className="font-bold text-sm text-text-primary text-left">{title}</span>
    </motion.button>
  );
}


