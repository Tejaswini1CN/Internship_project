import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EventRepository, 
  HelpDeskRepository, 
  UserRepository 
} from '../db/repositories';
import { EventEntity, HelpDeskReportEntity, UserEntity } from '../db/AppDatabase';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../db/firebaseSetup';

// --- Type Conversions (Entity <-> View Model) ---
export interface AppEvent {
  id: number;
  title: string;
  time: string; 
  endTime?: string; 
  location: string;
  isLive: boolean; 
  details: string;
}

export interface LostItem {
  id: number;
  type: 'item';
  name: string;
  description: string;
  location: string;
  time: string;
  status: 'Lost' | 'Found' | 'Resolved';
  imageUri?: string;
}

export interface MissingPerson {
  id: number;
  type: 'person';
  name: string;
  age: number;
  description: string;
  location: string;
  time: string;
  status: 'Missing' | 'Found';
  imageUri?: string;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  profileImageUri?: string;
  village?: string;
  preferredLanguage?: string;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  timestamp: Date;
  read: boolean;
}

export type Language = 'English' | 'Kannada' | 'Hindi' | 'Telugu' | 'Tamil';

interface AppContextType {
  events: AppEvent[];
  lostItems: LostItem[];
  missingPersons: MissingPerson[];
  user: User | null;
  isGuest: boolean;
  isDbReady: boolean;
  syncState: 'offline' | 'syncing' | 'connected';
  isDemoMode: boolean;
  isAdmin: boolean;
  notifications: AppNotification[];
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleDemoMode: () => void;
  toggleAdminMode: () => void;
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
  markNotificationRead: (id: string) => void;
  savedEventIds: number[];
  toggleSavedEvent: (id: number) => void;
  markItemStatus: (id: number, status: LostItem['status']) => void;
  markPersonStatus: (id: number, status: MissingPerson['status']) => void;
  addLostItem: (item: Omit<LostItem, 'id' | 'type' | 'time' | 'status'>, photoUri?: string) => void;
  addMissingPerson: (person: Omit<MissingPerson, 'id' | 'type' | 'time' | 'status'>, photoUri?: string) => void;
  login: (user: User) => void;
  updateUserProfile: (user: User) => void;
  logout: () => void;
  setGuest: () => void;
}

const initialEvents: AppEvent[] = [
  { id: 1, title: 'Morning Pooja', time: '06:00 AM', endTime: '08:00 AM', location: 'Main Temple', isLive: false, details: 'Join us for the auspicious morning aarti and blessings to start the day. Prasada will be distributed after the pooja.' },
  { id: 2, title: 'Folk Dance Performance', time: '10:30 AM', endTime: '11:45 AM', location: 'Cultural Stage', isLive: false, details: 'Experience the vibrant traditional folk dances by local artists. Seating is available on a first-come, first-serve basis.' },
  { id: 3, title: 'Grand Rathotsava', time: '12:00 PM', endTime: '03:00 PM', location: 'Main Temple Street', isLive: false, details: 'The highlight of the Jatre! Witness the grand chariot procession down the main street accompanied by traditional music and chanting.' },
  { id: 4, title: 'Prasada Distribution', time: '01:30 PM', endTime: '04:00 PM', location: 'Annadasoha Hall', isLive: false, details: 'Free community meal serving traditional delicacies. All are welcome regardless of background.' },
  { id: 5, title: 'Yakshagana', time: '06:00 PM', endTime: '08:30 PM', location: 'Open Air Theatre', isLive: false, details: 'Traditional theatre form combining dance, music, dialogue, costume, make-up, and stage techniques with a unique style and form.' },
  { id: 6, title: 'Fireworks Show', time: '09:00 PM', endTime: '09:30 PM', location: 'Fair Grounds', isLive: false, details: 'A spectacular display of fireworks to close out the evening festivities. Best viewed from the southern fields.' },
];

const initialItems: LostItem[] = [
  { id: 1, type: 'item', name: 'Gold Chain', description: 'Found near the main temple entrance. Has a small Ganesha pendant.', location: 'Main Temple', time: '10:00 AM', status: 'Lost' },
  { id: 2, type: 'item', name: 'Red Wallet', description: 'Lost near the food stalls. Contains ID and cards.', location: 'Food Stalls', time: '12:30 PM', status: 'Lost' },
];

const initialPersons: MissingPerson[] = [
  { id: 1, type: 'person', name: 'Suresh Kumar', age: 8, description: 'Wearing a yellow t-shirt and blue jeans. Language: Kannada.', location: 'Near Chariot', time: '01:00 PM', status: 'Missing' },
  { id: 2, type: 'person', name: 'Lakshmi', age: 65, description: 'Wearing green saree. Does not speak Hindi.', location: 'South Gate', time: '11:00 AM', status: 'Found' },
];

// Helper to parse time string like "06:00 AM" into today's Date object
function parseTimeString(timeStr: string): Date {
  const [time, ampm] = timeStr.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function mapEventToEntity(e: AppEvent): EventEntity {
  return {
    id: e.id,
    title: e.title,
    description: e.details,
    category: '', // not in AppEvent
    location: e.location,
    startTime: e.time,
    endTime: e.endTime || '',
    isFavorite: false,
    isLive: e.isLive
  };
}

function mapEntityToEvent(e: EventEntity): AppEvent {
  return {
    id: e.id,
    title: e.title,
    details: e.description,
    location: e.location,
    time: e.startTime,
    endTime: e.endTime,
    isLive: false, // Calculated locally
  };
}

function mapReportToEntityItem(item: LostItem): HelpDeskReportEntity {
  return {
    id: item.id,
    reportType: 'item',
    name: item.name,
    description: item.description,
    location: item.location,
    dateTime: item.time,
    contactNumber: '',
    status: item.status,
    imageUri: item.imageUri
  };
}

function mapReportToEntityPerson(person: MissingPerson): HelpDeskReportEntity {
  return {
    id: person.id,
    reportType: 'person',
    name: person.name,
    age: person.age,
    description: person.description,
    location: person.location,
    dateTime: person.time,
    contactNumber: '',
    status: person.status,
    imageUri: person.imageUri
  };
}

const dictionary: Record<Language, Record<string, string>> = {
  English: {},
  Kannada: {
    "Home": "ಮುಖಪುಟ",
    "Schedule": "ವೇಳಾಪಟ್ಟಿ",
    "Map": "ನಕ್ಷೆ",
    "Help": "ಸಹಾಯ",
    "Profile": "ಪ್ರೊಫೈಲ್",
    "My Activity": "ನನ್ನ ಚಟುವಟಿಕೆ",
    "Saved Events": "ಉಳಿಸಿದ ಈವೆಂಟ್‌ಗಳು",
    "App Settings": "ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "Language": "ಭಾಷೆ",
    "Help & Support": "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
    "About Namma Jatre": "ನಮ್ಮ ಜಾತ್ರೆ ಬಗ್ಗೆ",
    "Dark Mode": "ಡಾರ್ಕ್ ಮೋಡ್",
    "Notifications": "ಸೂಚನೆಗಳು",
    "Logout": "ಲಾಗ್ ಔಟ್",
    "Edit Profile": "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
    "Fair Map": "ಜಾತ್ರೆ ನಕ್ಷೆ",
    "Safety Guide": "ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿ",
    "Live Now": "ಈಗ ಲೈವ್",
    "Live": "ಲೈವ್",
    "Upcoming": "ಮುಂಬರುವ",
    "Emergency Help": "ತುರ್ತು ಸಹಾಯ",
    "Report Issue": "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
    "Submit": "ಸಲ್ಲಿಸು",
    "Cancel": "ರದ್ದುಮಾಡಿ",
    "Save Settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಿ"
  },
  Hindi: {
    "Home": "होम",
    "Schedule": "अनुसूची",
    "Map": "नक्शा",
    "Help": "मदद",
    "Profile": "प्रोफ़ाइल",
    "My Activity": "मेरी गतिविधि",
    "Saved Events": "सहेजे गए इवेंट",
    "App Settings": "ऐप सेटिंग्स",
    "Language": "भाषा",
    "Help & Support": "सहायता और समर्थन",
    "About Namma Jatre": "नम्मा जात्रे के बारे में",
    "Dark Mode": "डार्क मोड",
    "Notifications": "सूचनाएं",
    "Logout": "लॉग आउट",
    "Edit Profile": "प्रोफ़ाइल संपादित करें",
    "Fair Map": "मेला नक्शा",
    "Safety Guide": "सुरक्षा गाइड",
    "Live Now": "अभी लाइव",
    "Live": "लाइव",
    "Upcoming": "आगामी",
    "Emergency Help": "आपातकालीन मदद",
    "Report Issue": "समस्या की रिपोर्ट करें",
    "Submit": "जमा करें",
    "Cancel": "रद्द करें",
    "Save Settings": "सेटिंग्स सहेजें"
  },
  Telugu: {
    "Home": "హోమ్",
    "Schedule": "షెడ్యూల్",
    "Map": "మ్యాప్",
    "Help": "సహాయం",
    "Profile": "ప్రొఫైల్",
    "My Activity": "నా చర్యలు",
    "Saved Events": "దాచిన ఈవెంట్‌లు",
    "App Settings": "యాప్ సెట్టింగ్‌లు",
    "Language": "భాష",
    "Help & Support": "సహాయం",
    "About Namma Jatre": "మా జాతర గురించి",
    "Dark Mode": "డార్క్ మోడ్",
    "Notifications": "నోటిఫికేషన్లు",
    "Logout": "లాగ్ అవుట్",
    "Edit Profile": "ప్రొఫైల్ సవరించండి",
    "Fair Map": "జాతర మ్యాప్",
    "Safety Guide": "భద్రత మార్గదర్శి",
    "Live Now": "ఇప్పుడే లైవ్",
    "Live": "లైవ్",
    "Upcoming": "రాబోయే",
    "Emergency Help": "అత్యవసర సహాయం",
    "Report Issue": "సమస్య నివేదించు",
    "Submit": "సమర్పించు",
    "Cancel": "రద్దు",
    "Save Settings": "భద్రపరుచు"
  },
  Tamil: {
    "Home": "முகப்பு",
    "Schedule": "அட்டவணை",
    "Map": "வரைபடம்",
    "Help": "உதவி",
    "Profile": "சுயவிவரம்",
    "My Activity": "என் செயல்பாடுகள்",
    "Saved Events": "சேமிக்கப்பட்ட நிகழ்வுகள்",
    "App Settings": "பயன்பாட்டு அமைப்புகள்",
    "Language": "மொழி",
    "Help & Support": "உதவி",
    "About Namma Jatre": "நம்ம ஜாத்ரே பற்றி",
    "Dark Mode": "இருண்ட முறை",
    "Notifications": "அறிவிப்புகள்",
    "Logout": "வெளியேறு",
    "Edit Profile": "சுயவிவரத்தை திருத்து",
    "Fair Map": " கண்காட்சி வரைபடம்",
    "Safety Guide": "பாதுகாப்பு வழிகாட்டி",
    "Live Now": "இப்போது நேரலை",
    "Live": "நேரலை",
    "Upcoming": "வரவிருக்கும்",
    "Emergency Help": "அவசர உதவி",
    "Report Issue": "சிக்கலை புகாரளி",
    "Submit": "சமர்ப்பி",
    "Cancel": "ரத்துசெய்",
    "Save Settings": "அமைப்புகளை சேமி"
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [syncState, setSyncState] = useState<'offline' | 'syncing' | 'connected'>('syncing');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || 'English';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    if (language === 'English') return key;
    return dictionary[language]?.[key] || key;
  };
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      title: 'Welcome to Jatre Demo',
      message: 'Demo mode enables simulated data and push notifications.',
      type: 'info',
      timestamp: new Date(),
      read: false
    }
  ]);

  const [savedEventIds, setSavedEventIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('savedEventIds');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSavedEvent = (id: number) => {
    setSavedEventIds(prev => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter(eId => eId !== id) : [...prev, id];
      localStorage.setItem('savedEventIds', JSON.stringify(next));
      return next;
    });
  };

  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);
  const toggleAdminMode = () => setIsAdmin((prev) => !prev);
  
  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const id = Date.now().toString();
    setNotifications(prev => [{
      id,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    }, ...prev]);

    setTimeout(() => {
      markNotificationRead(id);
    }, 2000);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    const handleOnline = () => setSyncState('connected');
    const handleOffline = () => setSyncState('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setSyncState(navigator.onLine ? 'connected' : 'offline');
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function initDbAndSync() {
      // Wait for auth to resolve
      await new Promise<void>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await signInAnonymously(auth);
            } catch(e: any) {
              if (e.code === 'auth/admin-restricted-operation') {
                console.warn("Please enable Anonymous Authentication in the Firebase Console -> Authentication -> Sign-in method.");
              } else {
                console.warn("Anonymous auth failed", e);
              }
            }
          }
          unsubscribe();
          resolve();
        });
      });

      // 1. User Session
      const session = await UserRepository.getSession();
      if (session) {
        if (session.guestMode) {
          setIsGuest(true);
        } else {
          setUser({ 
            name: session.name, 
            email: session.emailOrPhone, 
            profileImageUri: session.profileImageUri,
            village: session.village,
            preferredLanguage: session.preferredLanguage
          });
        }
      }

      // 2. Events Local Load
      let dbEvents = await EventRepository.getAll();
      if (dbEvents.length === 0) {
        await EventRepository.insertAll(initialEvents.map(mapEventToEntity));
        dbEvents = await EventRepository.getAll();
      }
      setEvents(dbEvents.map(mapEntityToEvent));

      // 3. Reports Local Load
      let dbReports = await HelpDeskRepository.getAll();
      if (dbReports.length === 0) {
        // Init sample reports
        const sampleReports = [
          ...initialItems.map(mapReportToEntityItem),
          ...initialPersons.map(mapReportToEntityPerson)
        ];
        await HelpDeskRepository.insertAll(sampleReports);
        dbReports = await HelpDeskRepository.getAll();
      }

      const updateReportsState = (reports: HelpDeskReportEntity[]) => {
        setLostItems(
          reports.filter(r => r.reportType === 'item').map(r => ({
            id: r.id,
            type: 'item',
            name: r.name,
            description: r.description,
            location: r.location,
            time: r.dateTime,
            status: r.status as LostItem['status'],
            imageUri: r.imageUri
          }))
        );

        setMissingPersons(
          reports.filter(r => r.reportType === 'person').map(r => ({
            id: r.id,
            type: 'person',
            name: r.name,
            age: r.age || 0,
            description: r.description,
            location: r.location,
            time: r.dateTime,
            status: r.status as MissingPerson['status'],
            imageUri: r.imageUri
          }))
        );
      };

      updateReportsState(dbReports);
      setIsDbReady(true);

      // Start Firebase Sync only if authenticated to prevent permission denied errors
      let unsubEvents = () => {};
      let unsubReports = () => {};

      if (auth.currentUser) {
        unsubEvents = EventRepository.startSync((updatedEvents) => {
          setEvents(updatedEvents.map(mapEntityToEvent));
        });

        unsubReports = HelpDeskRepository.startSync((updatedReports) => {
          updateReportsState(updatedReports);
        });
      } else {
        console.warn("User is not authenticated (Anonymous Auth may be disabled). Firebase sync is paused.");
        setSyncState('offline');
      }

      return () => {
        unsubEvents();
        unsubReports();
      };
    }
    
    const cleanupPromise = initDbAndSync();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  // Live Event Detection Logic
  useEffect(() => {
    if (!isDbReady) return;
    const updateLiveStatus = () => {
      const now = new Date();
      setEvents(prev => prev.map(event => {
        if (!event.endTime) return event;
        const start = parseTimeString(event.time);
        const end = parseTimeString(event.endTime);
        const isLive = now >= start && now <= end;
        return { ...event, isLive };
      }));
    };

    updateLiveStatus();
    // Re-check every minute
    const interval = setInterval(updateLiveStatus, 60000);
    return () => clearInterval(interval);
  }, [isDbReady]);

  const markItemStatus = async (id: number, status: LostItem['status']) => {
    await HelpDeskRepository.updateStatus(id, status);
    setLostItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const markPersonStatus = async (id: number, status: MissingPerson['status']) => {
    await HelpDeskRepository.updateStatus(id, status);
    setMissingPersons(prev => prev.map(person => person.id === id ? { ...person, status } : person));
  };

  const addLostItem = async (item: Omit<LostItem, 'id' | 'type' | 'time' | 'status'>, photoUri?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = Date.now();
    
    await HelpDeskRepository.insert({
      id,
      reportType: 'item',
      name: item.name,
      description: item.description,
      location: item.location,
      dateTime: timeStr,
      contactNumber: 'N/A',
      status: 'Lost',
      imageUri: photoUri
    });

    setLostItems(prev => [{
      id,
      type: 'item',
      status: 'Lost',
      time: timeStr,
      ...item
    }, ...prev]);
  };

  const addMissingPerson = async (person: Omit<MissingPerson, 'id' | 'type' | 'time' | 'status'>, photoUri?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = Date.now();

    await HelpDeskRepository.insert({
      id,
      reportType: 'person',
      name: person.name,
      age: person.age,
      description: person.description,
      location: person.location,
      dateTime: timeStr,
      contactNumber: 'N/A',
      status: 'Missing',
      imageUri: photoUri
    });

    setMissingPersons(prev => [{
      id,
      type: 'person',
      status: 'Missing',
      time: timeStr,
      ...person
    }, ...prev]);
  };

  const login = async (userData: User) => {
    try {
      await signInAnonymously(auth);
      await UserRepository.insert({
        id: "session",
        name: userData.name,
        emailOrPhone: userData.email,
        guestMode: false,
        profileImageUri: userData.profileImageUri,
        village: userData.village,
        preferredLanguage: userData.preferredLanguage
      });
      setUser(userData);
      setIsGuest(false);
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        console.warn("Please enable Anonymous Authentication in the Firebase Console -> Authentication -> Sign-in method.");
      } else {
        console.warn("Login failed", error);
      }
    }
  };

  const updateUserProfile = async (userData: User) => {
    try {
      await UserRepository.insert({
        id: "session",
        name: userData.name,
        emailOrPhone: userData.email,
        guestMode: false,
        profileImageUri: userData.profileImageUri,
        village: userData.village,
        preferredLanguage: userData.preferredLanguage
      });
      setUser(userData);
    } catch (error) {
      console.warn("Failed to update profile", error);
    }
  };

  const logout = async () => {
    await auth.signOut();
    await UserRepository.logout();
    setUser(null);
    setIsGuest(true);
  };

  const setGuest = async () => {
    try {
      await signInAnonymously(auth);
      await UserRepository.insert({
        id: "session",
        name: 'Guest User',
        emailOrPhone: '',
        guestMode: true
      });
      setUser(null);
      setIsGuest(true);
    } catch (error: any) {
      if (error.code === 'auth/admin-restricted-operation') {
        console.warn("Please enable Anonymous Authentication in the Firebase Console -> Authentication -> Sign-in method.");
      } else {
        console.warn("Guest login failed", error);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      events,
      lostItems,
      missingPersons,
      user,
      isGuest,
      isDbReady,
      syncState,
      isDemoMode,
      isAdmin,
      notifications,
      savedEventIds,
      language,
      setLanguage,
      t,
      toggleSavedEvent,
      toggleDemoMode,
      toggleAdminMode,
      addNotification,
      markNotificationRead,
      markItemStatus,
      markPersonStatus,
      addLostItem,
      addMissingPerson,
      login,
      updateUserProfile,
      logout,
      setGuest
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
