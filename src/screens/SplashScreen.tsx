import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { AppLogo } from '../components/AppLogo';

export function SplashScreen() {
  const navigate = useNavigate();
  const { isDbReady, user, isGuest } = useAppContext();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Ensuring splash screen stays for at least 2.5 seconds for branding
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && isDbReady) {
      if (user || isGuest) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [minTimeElapsed, isDbReady, user, isGuest, navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-primary-dark text-white relative overflow-hidden">
      
      {/* Decorative background stars/sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
           key={`star-${i}`}
           className="absolute rounded-full bg-white/40"
           style={{
             width: Math.random() * 4 + 2 + 'px',
             height: Math.random() * 4 + 2 + 'px',
             top: Math.random() * 100 + '%',
             left: Math.random() * 100 + '%',
           }}
           animate={{
             opacity: [0.2, 1, 0.2],
             scale: [0.8, 1.2, 0.8],
           }}
           transition={{
             duration: Math.random() * 3 + 2,
             repeat: Infinity,
             ease: "easeInOut",
             delay: Math.random() * 2
           }}
        />
      ))}

      {/* Glow Behind Logo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-64 h-64 bg-primary/30 rounded-full blur-[80px]"
      />

      <div className="flex flex-col items-center justify-center z-10">
        <AppLogo size={140} isAnimated={true} className="mb-8" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 tracking-tight drop-shadow-lg mb-2">
            JATRE
          </h1>
          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-white/50 rounded-full"></div>
             <p className="text-lg font-bold tracking-widest text-white/90 uppercase">
               Namma Pride
             </p>
             <div className="h-px w-8 bg-white/50 rounded-full"></div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-16 flex flex-col items-center"
      >
         <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-yellow-400 animate-spin mb-4"></div>
         <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">Loading Experience</p>
      </motion.div>
    </div>
  );
}
