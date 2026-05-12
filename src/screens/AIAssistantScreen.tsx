import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Send, Sparkles, MapPin, Search, Calendar, 
  HelpCircle, ShieldAlert, LoaderCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { GeminiAssistantService } from '../services/geminiService';
import { ChatRepository } from '../db/repositories';
import { ChatMessageEntity } from '../db/AppDatabase';
import { useAppContext } from '../store/AppContext';

const SUGGESTED_PROMPTS = [
  "What is live now?",
  "Where is parking?",
  "Emergency help",
  "Tell me about this Jatre"
];

export function AIAssistantScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageEntity[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isDemoMode, syncState } = useAppContext();

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadChatHistory = async () => {
    try {
      const history = await ChatRepository.getAll();
      setMessages(history);
      
      // If no history, add a generic welcome message locally
      if (history.length === 0) {
        const welcome: ChatMessageEntity = {
          id: Date.now(),
          message: "Namaskara! I am your Jatre Guide. How can I help you experience the festival safely and joyfully?",
          senderType: 'bot',
          timestamp: new Date().toISOString()
        };
        await ChatRepository.insert(welcome);
        setMessages([welcome]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg: ChatMessageEntity = {
      id: Date.now(),
      message: text.trim(),
      senderType: 'user',
      timestamp: new Date().toISOString()
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    await ChatRepository.insert(userMsg);

    try {
      // Pass null for location if Geolocation is not strictly needed for this generic query, 
      // but if we hook into actual user location later, we can pass it.
      const response = await GeminiAssistantService.generateResponse(userMsg.message, {
        userLocation: null,
        isDemoMode,
        isOffline: syncState === 'offline'
      });
      
      const botMsg: ChatMessageEntity = {
        id: Date.now(),
        message: response,
        senderType: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMsg]);
      await ChatRepository.insert(botMsg);
    } catch (error) {
      const errorMsg: ChatMessageEntity = {
        id: Date.now(),
        message: "I am having trouble connecting to the network. Please try again or check the Help Desk manually.",
        senderType: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      await ChatRepository.insert(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-background relative overflow-hidden"
    >
      {/* Header */}
      <div className="bg-surface px-4 py-4 flex flex-col sticky top-0 z-10 shadow-sm border-b border-border">
         <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-primary">
               <ChevronLeft size={28} />
            </button>
            <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h1 className="text-xl font-black text-text-primary">Jatre Guide AI</h1>
                </div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mt-0.5">Context-Aware Assistant</span>
            </div>
            <div className="w-10"></div>
         </div>
         
         {/* Suggested Prompts */}
         <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 mt-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 px-3.5 py-2 bg-background border border-border rounded-xl text-xs font-bold text-text-primary hover:border-primary/50 transition-colors shadow-sm"
                >
                    {prompt}
                </button>
            ))}
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 bg-gradient-to-b from-background to-surface/30">
        <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isUser = msg.senderType === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn(
                      "flex w-full",
                      isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                      isUser 
                        ? "bg-primary text-white rounded-br-sm" 
                        : "bg-surface border border-border text-text-primary rounded-bl-sm"
                  )}>
                    <div className="markdown-body text-sm font-medium leading-relaxed">
                        {msg.message}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
        
        {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex w-full justify-start"
            >
              <div className="max-w-[80%] rounded-2xl p-4 bg-surface border border-border rounded-bl-sm flex items-center gap-2">
                 <LoaderCircle className="w-4 h-4 text-primary animate-spin" />
                 <span className="text-xs font-bold text-text-secondary animate-pulse">Jatre Guide is typing...</span>
              </div>
            </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pb-safe pt-8">
        <div className="flex items-center gap-2">
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Ask about events, parking, or safety..."
                className="flex-1 bg-surface border-2 border-border focus:border-primary rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-text-secondary outline-none transition-all shadow-sm"
            />
            <button 
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="p-4 bg-primary text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </motion.div>
  );
}
