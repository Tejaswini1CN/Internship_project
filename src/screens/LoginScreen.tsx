import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { CustomButton } from '../components/ui/CustomButton';
import { InputField } from '../components/ui/InputField';
import { useAppContext } from '../store/AppContext';
import { AppLogo } from '../components/AppLogo';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, setGuest } = useAppContext();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ name: 'Ramesh Kumar', email: email || 'ramesh@example.com' });
    navigate('/');
  };

  const handleGuest = () => {
    setGuest();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-br from-primary to-accent rounded-b-[60%] opacity-20 dark:opacity-10 pointer-events-none" />

      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-center z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto flex justify-center mb-6 drop-shadow-xl">
             <AppLogo size={90} />
          </div>
          <h1 className="text-3xl font-black text-text-primary mb-2">Welcome Back!</h1>
          <p className="text-text-secondary font-medium">Log in to view live events and maps.</p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-5">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <InputField 
              label="Email or Phone" 
              icon={<Mail size={20} />} 
              placeholder="Enter your email or phone" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <InputField 
              label="Password" 
              type="password"
              icon={<Lock size={20} />} 
              placeholder="••••••••" 
              required
            />
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-bold text-primary hover:text-accent transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="pt-4 space-y-4">
            <CustomButton type="submit" fullWidth>
              Log In
            </CustomButton>
            
            <CustomButton type="button" variant="outline" fullWidth onClick={handleGuest}>
              Continue as Guest
            </CustomButton>
          </motion.div>
        </form>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <span className="text-text-secondary font-medium">Don't have an account? </span>
          <button 
            onClick={() => navigate('/signup')} 
            className="font-bold text-primary hover:text-accent transition-colors"
          >
            Sign Up
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
