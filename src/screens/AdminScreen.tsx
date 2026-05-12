import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Users, Activity, Bell, FileText, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';

export function AdminScreen() {
  const navigate = useNavigate();
  const { events, lostItems, missingPersons, addNotification } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'broadcast'>('analytics');
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'alert' | 'success'>('info');

  const totalReports = lostItems.length + missingPersons.length;
  const resolvedCases = lostItems.filter(i => i.status === 'Resolved').length + missingPersons.filter(m => m.status === 'Found').length;
  const liveEvents = events.filter(e => e.isLive).length;
  const activeAlerts = missingPersons.filter(m => m.status === 'Missing').length;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    
    addNotification(broadcastTitle, broadcastMessage, broadcastType);
    
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
       <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 text-text-primary shadow-sm border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2">
             <ChevronLeft size={28} />
          </button>
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <h1 className="text-xl font-black">Admin Dashboard</h1>
          </div>
          <div className="w-10"></div>
       </div>

       <div className="flex bg-surface border-b border-border">
         <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
         >
            Analytics
         </button>
         <button 
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'broadcast' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
         >
            Broadcast
         </button>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-safe">
         <AnimatePresence mode="wait">
            {activeTab === 'analytics' ? (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                 {/* Stats Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={<FileText size={20} />} title="Total Reports" value={totalReports.toString()} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
                    <StatCard icon={<CheckCircle2 size={20} />} title="Resolved Cases" value={resolvedCases.toString()} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <StatCard icon={<Activity size={20} />} title="Live Events" value={liveEvents.toString()} color="text-teal-500" bg="bg-teal-50 dark:bg-teal-900/20" />
                    <StatCard icon={<AlertTriangle size={20} />} title="Active Alerts" value={activeAlerts.toString()} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
                 </div>
                 
                 <div className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
                   <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4">Crowd Density (Simulated)</h3>
                   <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1"><span>Main Temple</span><span className="text-red-500">High (92%)</span></div>
                        <div className="h-2 bg-border rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[92%] rounded-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1"><span>Food Stalls</span><span className="text-orange-500">Medium (65%)</span></div>
                        <div className="h-2 bg-border rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[65%] rounded-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1"><span>South Gate</span><span className="text-emerald-500">Low (20%)</span></div>
                        <div className="h-2 bg-border rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[20%] rounded-full"></div></div>
                      </div>
                   </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="broadcast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                 <div className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
                   <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Bell size={16} /> Send Announcement
                   </h3>
                   <form onSubmit={handleSendBroadcast} className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-text-secondary mb-1">Notification Type</label>
                       <div className="flex gap-2">
                         <button type="button" onClick={() => setBroadcastType('info')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${broadcastType === 'info' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'border-border text-text-secondary hover:bg-background'}`}>Info</button>
                         <button type="button" onClick={() => setBroadcastType('alert')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${broadcastType === 'alert' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'border-border text-text-secondary hover:bg-background'}`}>Alert/Emergency</button>
                         <button type="button" onClick={() => setBroadcastType('success')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${broadcastType === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-border text-text-secondary hover:bg-background'}`}>Success</button>
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-text-secondary mb-1">Title</label>
                       <input 
                         type="text" 
                         value={broadcastTitle}
                         onChange={(e) => setBroadcastTitle(e.target.value)}
                         placeholder="e.g. Schedule Update"
                         required
                         className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-text-secondary mb-1">Message</label>
                       <textarea 
                         value={broadcastMessage}
                         onChange={(e) => setBroadcastMessage(e.target.value)}
                         placeholder="Type the announcement here..."
                         required
                         rows={4}
                         className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                       />
                     </div>
                     <button 
                       type="submit"
                       className="w-full py-3 px-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
                     >
                       <Send size={18} /> Send Push Notification
                     </button>
                   </form>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
       </div>
    </motion.div>
  );
}

function StatCard({ icon, title, value, color, bg }: { icon: React.ReactNode, title: string, value: string, color: string, bg: string }) {
  return (
    <div className="bg-surface rounded-3xl p-4 border border-border shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${bg} ${color} mb-3 shadow-sm`}>
         {icon}
      </div>
      <p className="text-xs font-black text-text-secondary uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-black text-text-primary">{value}</p>
      <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${bg} opacity-50 pointer-events-none group-hover:scale-150 transition-transform duration-500`}></div>
    </div>
  );
}
