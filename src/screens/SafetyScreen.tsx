import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, AlertTriangle, CheckCircle2, PhoneCall, Plus, Map as MapIcon, ShieldAlert, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '../components/ui/CustomButton';

export function SafetyScreen() {
  const navigate = useNavigate();
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);

  const handleCall = (title: string, phone: string) => {
    setEmergencyTitle(title);
    setEmergencyPhone(phone);
    setShowEmergencyDialog(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-border">
         <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-primary">
            <ChevronLeft size={28} />
         </button>
         <h1 className="text-xl font-black text-text-primary absolute left-1/2 -translate-x-1/2">Safety Info</h1>
         <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
         
         {/* Emergency Contacts Section */}
         <div className="space-y-3">
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
               <PhoneCall className="text-red-500" size={24} /> Emergency Contacts
            </h2>
            <div className="space-y-3">
               <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:border-red-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="bg-red-50 dark:bg-red-900/10 p-2.5 rounded-xl text-red-500 shrink-0"><ShieldAlert size={20} /></div>
                     <div>
                        <div className="font-bold text-text-primary">Medical Emergency</div>
                        <div className="text-xs font-medium text-text-secondary mt-0.5">Call Ambulance</div>
                     </div>
                  </div>
                  <button onClick={() => handleCall('Medical Emergency', '108')} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95">108</button>
               </div>
               <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="bg-orange-50 dark:bg-orange-900/10 p-2.5 rounded-xl text-orange-500 shrink-0"><AlertTriangle size={20} /></div>
                     <div>
                        <div className="font-bold text-text-primary">Police Assistance</div>
                        <div className="text-xs font-medium text-text-secondary mt-0.5">Security & urgent issues</div>
                     </div>
                  </div>
                  <button onClick={() => handleCall('Police Assistance', '100')} className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95">100</button>
               </div>
               <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="bg-blue-50 dark:bg-blue-900/10 p-2.5 rounded-xl text-blue-500 shrink-0"><PhoneCall size={20} /></div>
                     <div>
                        <div className="font-bold text-text-primary">Volunteer HelpDesk</div>
                        <div className="text-xs font-medium text-text-secondary mt-0.5">General assistance</div>
                     </div>
                  </div>
                  <button onClick={() => handleCall('Volunteer HelpDesk', '+91 9876543210')} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95">Call</button>
               </div>
            </div>
         </div>

         {/* First Aid Section */}
         <div className="space-y-3">
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
               <Plus className="text-green-500" size={24} /> First Aid
            </h2>
            <div className="bg-surface p-5 rounded-3xl shadow-sm border border-border space-y-4 hover:border-green-500/30 transition-colors">
               <p className="text-sm font-medium text-text-secondary leading-relaxed">
                  Main Medical Tent is located near the East Gate, next to the Information Desk. Proceed directly for minor injuries. For severe emergencies, call an ambulance.
               </p>
               <CustomButton fullWidth onClick={() => navigate('/map')}>
                  <MapIcon size={20} className="mr-2" /> View on Map
               </CustomButton>
            </div>
         </div>

         {/* Do's Section */}
         <div className="space-y-3">
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
               <CheckCircle2 className="text-teal-500" size={24} /> Do's
            </h2>
            <ul className="space-y-3">
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Keep your children close, especially in crowded areas.</li>
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Stay hydrated and carry water bottles.</li>
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Identify landmarks and meeting points in case you get separated.</li>
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Report any suspicious activities to volunteers or police.</li>
            </ul>
         </div>

         {/* Don'ts Section */}
         <div className="space-y-3">
            <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
               <AlertTriangle className="text-red-400" size={24} /> Don'ts
            </h2>
            <ul className="space-y-3">
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Do not leave your belongings unattended.</li>
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Do not carry excessive cash or valuable jewelry.</li>
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Do not accept food or drinks from strangers.</li>
               <li className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-sm font-medium text-text-secondary">Avoid overcrowded areas if you feel uncomfortable.</li>
            </ul>
         </div>

         {/* General Guidelines */}
         <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900 shadow-sm cursor-pointer" onClick={() => setGuidelinesExpanded(!guidelinesExpanded)}>
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Info size={20} /> General Guidelines
               </h3>
               <motion.div animate={{ rotate: guidelinesExpanded ? 180 : 0 }}>
                  <ChevronDown size={20} className="text-blue-800 dark:text-blue-300" />
               </motion.div>
            </div>
            <AnimatePresence>
              {guidelinesExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed font-medium mt-2">
                     The Namma Jatre involves thousands of visitors. Please follow instructions from the volunteers and announcements over the loudspeakers. Stay safe and enjoy the festivities responsibly. If you find anyone in distress, guide them to the help desk immediately. Always abide by local cultural norms.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
         
      </div>

      {/* Emergency Call Dialog */}
      <AnimatePresence>
        {showEmergencyDialog && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-xl relative"
             >
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-4 border-4 border-surface shadow-md">
                   <PhoneCall size={32} className="text-white" />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-black text-text-primary mb-1">{emergencyTitle}</h3>
                  <p className="text-text-secondary font-medium mb-6">Are you sure you want to call {emergencyPhone}?</p>
                </div>
                
                <div className="flex gap-3">
                   <button 
                     onClick={() => setShowEmergencyDialog(false)}
                     className="flex-1 py-3 px-4 rounded-xl font-bold bg-border/50 text-text-primary hover:bg-border transition-colors text-sm"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => { setShowEmergencyDialog(false); alert(`Dialing ${emergencyPhone}...`); }}
                     className="flex-1 py-3 px-4 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20 text-sm"
                   >
                     Call Now
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
