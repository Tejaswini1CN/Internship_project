import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { CustomButton } from '../components/ui/CustomButton';
import { InputField } from '../components/ui/InputField';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [isSent, setIsSent] = useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
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

      <div className="flex-1 overflow-y-auto px-6 py-6 z-10">
        <div className="mb-8 pl-2">
          <h1 className="text-3xl font-black text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary font-medium mt-2">Enter your email or phone to receive an OTP.</p>
        </div>

        {isSent ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-3xl flex flex-col items-center text-center">
             <CheckCircle2 size={48} className="text-green-500 mb-4" />
             <h3 className="font-bold text-xl text-green-800 dark:text-green-400 mb-2">OTP Sent!</h3>
             <p className="text-green-600 dark:text-green-500 text-sm font-medium mb-6">Please check your messages to reset your password.</p>
             <CustomButton fullWidth onClick={() => navigate('/login')}>
                Back to Login
             </CustomButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <InputField 
              label="Email or Phone" 
              icon={<Mail size={20} />} 
              placeholder="Enter registered email/phone" 
              required
            />

            <div className="pt-4">
              <CustomButton type="submit" fullWidth>
                Send OTP
              </CustomButton>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
