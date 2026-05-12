import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, ChevronLeft } from 'lucide-react';
import { CustomButton } from '../components/ui/CustomButton';
import { InputField } from '../components/ui/InputField';

export function SignupScreen() {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full w-full bg-background relative"
    >
      <div className="bg-background px-4 pt-6 pb-2 flex items-center z-10">
         <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface transition-colors text-text-primary">
            <ChevronLeft size={28} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-20 z-10">
        <div className="mb-8 pl-2">
          <h1 className="text-3xl font-black text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary font-medium mt-2">Join Namma Jatre today!</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <InputField 
            label="Full Name" 
            icon={<UserIcon size={20} />} 
            placeholder="E.g. Ramesh Kumar" 
            required
          />
          <InputField 
            label="Phone Number" 
            type="tel"
            icon={<Phone size={20} />} 
            placeholder="+91 99999 99999" 
            required
          />
          <InputField 
            label="Email Address" 
            type="email"
            icon={<Mail size={20} />} 
            placeholder="you@example.com" 
            required
          />
          <InputField 
            label="Password" 
            type="password"
            icon={<Lock size={20} />} 
            placeholder="••••••••" 
            required
          />

          <div className="pt-6">
            <CustomButton type="submit" fullWidth>
              Sign Up
            </CustomButton>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
