import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Activity, Bookmark, Globe, HelpCircle, Info, LogOut, Settings, LogIn, X, Camera, Bell, Moon } from 'lucide-react';
import { ProfileOptionItem } from '../components/ui/ProfileOptionItem';
import { useAppContext } from '../store/AppContext';

export function ProfileScreen() {
  const navigate = useNavigate();
  const appContext = useAppContext();
  const { user, isGuest, logout, updateUserProfile, toggleDemoMode, toggleAdminMode, t, setLanguage } = appContext;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editVillage, setEditVillage] = useState(user?.village || '');
  const [editLanguage, setEditLanguage] = useState(user?.preferredLanguage || 'English');
  const [editImageUri, setEditImageUri] = useState(user?.profileImageUri || '');
  
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('isNotificationsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return document.documentElement.classList.contains('dark');
  });

  const [savedEventIds, setSavedEventIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('savedEventIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSavedEvents, setShowSavedEvents] = useState(false);
  const [showMyActivity, setShowMyActivity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (showEditProfile && user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
      setEditVillage(user.village || '');
      setEditImageUri(user.profileImageUri || '');
    }
  }, [showEditProfile, user]);

  useEffect(() => {
    if (showSettings) {
      const savedNotifs = localStorage.getItem('isNotificationsEnabled');
      setIsNotificationsEnabled(savedNotifs !== null ? JSON.parse(savedNotifs) : true);

      const savedDark = localStorage.getItem('isDarkMode');
      setIsDarkMode(savedDark !== null ? JSON.parse(savedDark) : document.documentElement.classList.contains('dark'));
      
      const savedLang = localStorage.getItem('language');
      setEditLanguage(user?.preferredLanguage || savedLang || 'English');
    }
  }, [showSettings, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    // Simulate short network delay for smooth UX
    await new Promise(r => setTimeout(r, 600));

    updateUserProfile({
      ...user,
      name: editName,
      email: editEmail,
      phone: editPhone,
      village: editVillage,
      profileImageUri: editImageUri,
      preferredLanguage: user.preferredLanguage // Preserve
    });
    
    appContext.addNotification('Profile Updated', 'Your profile details have been successfully saved.', 'success');
    
    setIsSaving(false);
    setShowEditProfile(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    localStorage.setItem('isNotificationsEnabled', JSON.stringify(isNotificationsEnabled));
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('language', editLanguage);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    await new Promise(r => setTimeout(r, 400));
    
    if (user && !isGuest) {
      updateUserProfile({
        ...user,
        preferredLanguage: editLanguage
      });
    }

    setLanguage(editLanguage as any);

    appContext.addNotification(t('Settings Saved') || 'Settings Saved', t('Your preferences have been updated.') || 'Your preferences have been updated.', 'success');
    setIsSaving(false);
    setShowSettings(false);
  };

  const handleImagePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setEditImageUri(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-background relative"
    >
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 text-text-primary shadow-sm border-b border-border">
         <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2">
            <ChevronLeft size={28} />
         </button>
         <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">Profile</h1>
         <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        
        {/* Profile Card */}
        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center mb-8 relative overflow-hidden mt-2 hover:shadow-md transition-shadow">
           <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-primary to-accent opacity-20 dark:opacity-10"></div>
           <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full mb-4 shadow-lg flex items-center justify-center border-4 border-surface z-10 overflow-hidden">
              {user?.profileImageUri ? (
                <img src={user.profileImageUri} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-white" />
              )}
           </div>
           
           {isGuest ? (
             <>
               <h2 className="text-2xl font-black text-text-primary">Guest User</h2>
               <p className="text-text-secondary font-medium mt-1">Sign in to sync your data</p>
               <button 
                onClick={() => navigate('/login')}
                className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-full text-sm active:scale-95 transition-transform hover:bg-opacity-90">
                 Sign In / Register
               </button>
             </>
           ) : (
             <>
               <h2 className="text-2xl font-black text-text-primary">{user?.name}</h2>
               <p className="text-text-secondary font-medium mt-1">{user?.email}</p>
               <button 
                 onClick={() => setShowEditProfile(true)}
                 className="mt-4 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm active:scale-95 transition-transform hover:bg-primary/20">
                 Edit Profile
               </button>
             </>
           )}
        </div>

         {/* Options */}
        <div className="space-y-2">
           <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest pl-2 mb-2">Account</h3>
           <div className="bg-surface rounded-3xl border border-border p-2">
             <ProfileOptionItem 
               title={t("My Activity")} 
               icon={<Activity size={20} />} 
               iconColorClass="text-blue-500 bg-blue-50 dark:bg-blue-900/20"
               onClick={() => setShowMyActivity(true)}
             />
             <ProfileOptionItem 
               title={t("Saved Events")} 
               icon={<Bookmark size={20} />} 
               iconColorClass="text-orange-500 bg-orange-50 dark:bg-orange-900/20"
               onClick={() => setShowSavedEvents(true)}
             />
           </div>

           <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest pl-2 mb-2 mt-6">Preferences</h3>
           <div className="bg-surface rounded-3xl border border-border p-2">
             <ProfileOptionItem 
               title={t("App Settings")} 
               icon={<Settings size={20} />} 
               iconColorClass="text-purple-500 bg-purple-50 dark:bg-purple-900/20"
               onClick={() => setShowSettings(true)}
             />
             <ProfileOptionItem 
               title={t("Language")} 
               icon={<Globe size={20} />} 
               iconColorClass="text-teal-500 bg-teal-50 dark:bg-teal-900/20"
               onClick={() => setShowSettings(true)}
             />
           </div>

           {/* Admin & Showcase Section */}
           <h3 className="text-xs font-black text-primary uppercase tracking-widest pl-2 mb-2 mt-6">Showcase Options</h3>
           <div className="bg-surface rounded-3xl border border-primary/20 p-2 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
             
             <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/50 rounded-2xl transition-colors" onClick={toggleDemoMode}>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-100 text-orange-500 dark:bg-orange-500/20">
                    <Activity size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-text-primary text-sm">Demo Mode</h4>
                   <p className="text-xs text-text-secondary font-medium">Simulated events & data</p>
                 </div>
               </div>
               <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${appContext.isDemoMode ? 'bg-primary' : 'bg-border'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white shadow tracking-wide transition-transform ${appContext.isDemoMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
             </div>

             <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-background/50 rounded-2xl transition-colors" onClick={toggleAdminMode}>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-100 text-rose-500 dark:bg-rose-500/20">
                    <Settings size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-text-primary text-sm">Admin Controls</h4>
                   <p className="text-xs text-text-secondary font-medium">Manage festival data</p>
                 </div>
               </div>
               <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${appContext.isAdmin ? 'bg-primary' : 'bg-border'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white shadow tracking-wide transition-transform ${appContext.isAdmin ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
             </div>

             {appContext.isAdmin && (
               <button 
                 onClick={() => navigate('/admin')}
                 className="mt-2 mx-4 mb-2 w-[calc(100%-2rem)] py-3 px-4 bg-primary/10 text-primary font-bold rounded-xl text-sm"
               >
                 Open Admin Dashboard
               </button>
             )}
           </div>

           <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest pl-2 mb-2 mt-6">About</h3>
           <div className="bg-surface rounded-3xl border border-border p-2">
             <ProfileOptionItem 
               title={t("Help & Support")} 
               icon={<HelpCircle size={20} />} 
               iconColorClass="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
               onClick={() => navigate('/help-desk')}
             />
             <ProfileOptionItem 
               title={t("About Namma Jatre")} 
               icon={<Info size={20} />} 
               iconColorClass="text-gray-500 bg-gray-100 dark:bg-gray-800"
               onClick={() => {
                 appContext.addNotification(t('About Namma Jatre') || 'About Namma Jatre', 'Version 1.0.0. A premium event platform.', 'info');
               }}
             />
           </div>

           <div className="mt-6">
             {isGuest ? (
                <ProfileOptionItem 
                  title="Sign In" 
                  icon={<LogIn size={20} />} 
                  iconColorClass="text-white bg-primary"
                  onClick={() => navigate('/login')}
                />
             ) : (
                <ProfileOptionItem 
                  title={t("Logout")} 
                  icon={<LogOut size={20} />} 
                  iconColorClass="text-white bg-red-500 dark:bg-red-600"
                  isDestructive={true}
                  onClick={() => setShowLogoutConfirm(true)}
                />
             )}
           </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
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
               className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-xl"
             >
                <h3 className="text-xl font-black text-text-primary mb-2">Logout</h3>
                <p className="text-text-secondary font-medium mb-6">Are you sure you want to log out of your account?</p>
                
                <div className="flex gap-3">
                   <button 
                     onClick={() => setShowLogoutConfirm(false)}
                     className="flex-1 py-3 px-4 rounded-xl font-bold bg-border/50 text-text-primary hover:bg-border transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleLogout}
                     className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                   >
                     Yes, Logout
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}

        {showEditProfile && (
          <motion.div 
             initial={{ opacity: 0, y: "100%" }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden"
          >
             <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 text-text-primary shadow-sm border-b border-border shrink-0">
                <button onClick={() => setShowEditProfile(false)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-secondary">
                   <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">Edit Profile</h1>
             </div>

             <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
                {/* Profile Header section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={handleImagePick}>
                    <div className="w-28 h-28 bg-gradient-to-tr from-primary to-accent rounded-full mb-3 shadow-lg flex items-center justify-center border-4 border-surface overflow-hidden">
                       {editImageUri ? (
                         <img src={editImageUri} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <User size={48} className="text-white" />
                       )}
                    </div>
                    <div className="absolute bottom-2 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-primary border border-border group-hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-text-primary">{editName || 'Your Name'}</h2>
                  <p className="text-text-secondary text-sm font-medium mt-1 uppercase tracking-wider">{isGuest ? 'Guest' : 'Registered User'}</p>
                </div>

                <form id="editProfileForm" onSubmit={handleEditProfileSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest pl-2">Personal Details</h3>
                    
                    <div className="space-y-4 bg-surface p-5 rounded-3xl border border-border shadow-sm">
                      <div className="relative">
                        <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your full name"
                          required
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-medium transition-shadow"
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Email Address</label>
                        <input 
                          type="email" 
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-medium transition-shadow"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Phone Number</label>
                        <input 
                          type="tel" 
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-medium transition-shadow"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Village / Location</label>
                        <input 
                          type="text" 
                          value={editVillage}
                          onChange={(e) => setEditVillage(e.target.value)}
                          placeholder="Your village or city"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-base font-medium transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 px-4 rounded-2xl font-black bg-gradient-to-br from-primary to-accent text-white hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      className="w-full py-4 px-4 rounded-2xl font-bold bg-surface text-text-primary border border-border hover:bg-background transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="pt-8 flex justify-center pb-8">
                     <button
                       type="button"
                       onClick={() => {
                         setShowEditProfile(false);
                         setShowLogoutConfirm(true);
                       }}
                       className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold px-4 py-2 opacity-80 hover:opacity-100 transition-opacity"
                     >
                        <LogOut size={18} />
                        Sign Out of Jatre
                     </button>
                  </div>
                </form>
             </div>
          </motion.div>
        )}
        {showSavedEvents && (
          <motion.div 
             initial={{ opacity: 0, y: "100%" }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden"
          >
             <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 text-text-primary shadow-sm border-b border-border shrink-0">
                <button onClick={() => setShowSavedEvents(false)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-secondary">
                   <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">Saved Events</h1>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {appContext.savedEventIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-20 text-text-secondary">
                    <Bookmark size={48} opacity={0.2} className="mb-4" />
                    <p className="font-medium text-center">You haven't saved any events yet.</p>
                    <button 
                      onClick={() => { setShowSavedEvents(false); navigate('/schedule'); }}
                      className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm active:scale-95 transition-transform"
                    >
                      Browse Schedule
                    </button>
                  </div>
                ) : (
                  appContext.events
                    .filter(e => appContext.savedEventIds.includes(e.id))
                    .map(event => (
                      <div key={event.id} className="bg-surface rounded-3xl p-5 shadow-sm border border-border flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-text-primary text-lg">{event.title}</h3>
                          <p className="text-text-secondary text-sm font-medium mt-1">{event.time} • {event.location}</p>
                        </div>
                        <button 
                          onClick={() => appContext.toggleSavedEvent(event.id)}
                          className="p-1.5 rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-900/20 transition-colors"
                        >
                          <Bookmark size={18} fill="currentColor" />
                        </button>
                      </div>
                    ))
                )}
             </div>
          </motion.div>
        )}
        {showSettings && (
          <motion.div 
             initial={{ opacity: 0, y: "100%" }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden"
          >
             <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 text-text-primary shadow-sm border-b border-border shrink-0">
                <button onClick={() => setShowSettings(false)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-secondary">
                   <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">App Settings</h1>
             </div>

             <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
                <form id="settingsForm" onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest pl-2">Preferences</h3>
                    
                    <div className="bg-surface p-2 rounded-3xl border border-border shadow-sm space-y-1">
                      
                      {/* Notifications Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-100 text-blue-500 dark:bg-blue-500/20">
                             <Bell size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary text-sm">Notifications</h4>
                            <p className="text-xs text-text-secondary font-medium">Alerts & updates</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                          className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isNotificationsEnabled ? 'bg-primary' : 'bg-border'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow tracking-wide transition-transform ${isNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20">
                             <Moon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary text-sm">Dark Mode</h4>
                            <p className="text-xs text-text-secondary font-medium">Appearance theme</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-border'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow tracking-wide transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                      
                      {/* Language Selection */}
                      <div className="flex items-center justify-between p-3 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-teal-100 text-teal-500 dark:bg-teal-500/20">
                             <Globe size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-primary text-sm">Language</h4>
                            <p className="text-xs text-text-secondary font-medium">App language</p>
                          </div>
                        </div>
                        <select 
                          value={editLanguage}
                          onChange={(e) => setEditLanguage(e.target.value)}
                          className="bg-background border border-border rounded-xl px-3 py-1.5 text-sm font-bold text-text-primary focus:outline-none"
                        >
                          <option value="English">English</option>
                          <option value="Kannada">Kannada/ಕನ್ನಡ</option>
                          <option value="Hindi">Hindi/हिन्दी</option>
                          <option value="Telugu">Telugu/తెలుగు</option>
                          <option value="Tamil">Tamil/தமிழ்</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 px-4 rounded-2xl font-black bg-gradient-to-br from-primary to-accent text-white hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Saving Settings...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="w-full py-4 px-4 rounded-2xl font-bold bg-surface text-text-primary border border-border hover:bg-background transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
             </div>
          </motion.div>
        )}
        {showMyActivity && (
          <motion.div 
             initial={{ opacity: 0, y: "100%" }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: "100%" }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden"
          >
             <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 text-text-primary shadow-sm border-b border-border shrink-0">
                <button onClick={() => setShowMyActivity(false)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-secondary">
                   <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black absolute left-1/2 -translate-x-1/2">My Activity</h1>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex flex-col items-center justify-center pt-20 text-text-secondary">
                  <Activity size={48} opacity={0.2} className="mb-4" />
                  <p className="font-medium text-center">You have no recent activity.</p>
                  <button 
                    onClick={() => { setShowMyActivity(false); navigate('/schedule'); }}
                    className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm active:scale-95 transition-transform"
                  >
                    Explore Events
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
