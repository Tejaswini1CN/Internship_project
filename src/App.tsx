import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavBar } from './components/BottomNavBar';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { MapScreen } from './screens/MapScreen';
import { HelpDeskScreen } from './screens/HelpDeskScreen';
import { SafetyScreen } from './screens/SafetyScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ReportScreen } from './screens/ReportScreen';
import { AIAssistantScreen } from './screens/AIAssistantScreen';
import { AdminScreen } from './screens/AdminScreen';
import { AppProvider } from './store/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationOverlay } from './components/NotificationOverlay';

// We create an AppContent component to hold the routing logic
// so it has access to useLocation hook.
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Basic redirect trick for initial load simulation
    if (location.pathname === '/' && !sessionStorage.getItem('splashShown')) {
      sessionStorage.setItem('splashShown', 'true');
      navigate('/splash', { replace: true });
    }
  }, [location, navigate]);

  // Hide nav bar on splash screen or deep internal screens
  const hideNavBar = ['/splash', '/login', '/signup', '/forgot-password', '/report', '/assistant', '/admin'].includes(location.pathname);

  return (
    <MobileFrame>
      <NotificationOverlay />
      <div className="w-full h-full relative">
        <AnimatePresence mode="wait" initial={false}>
          {/* @ts-ignore */}
          <Routes location={location} key={location.pathname}>
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/" element={<HomeScreen />} />
            <Route path="/schedule" element={<ScheduleScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/help-desk" element={<HelpDeskScreen />} />
            <Route path="/safety" element={<SafetyScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/report" element={<ReportScreen />} />
            <Route path="/assistant" element={<AIAssistantScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
            <Route path="*" element={<HomeScreen />} /> 
          </Routes>
        </AnimatePresence>

        {!hideNavBar && (
          <BottomNavBar 
            currentPath={location.pathname} 
            onNavigate={(path) => navigate(path)} 
          />
        )}
      </div>
    </MobileFrame>
  );
}

export default function App() {
  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode');
    if (savedDarkMode !== null) {
      if (JSON.parse(savedDarkMode)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
