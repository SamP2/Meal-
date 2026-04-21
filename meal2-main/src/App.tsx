import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import MessDetailsScreen from './screens/MessDetailsScreen';
import ReviewScreen from './screens/ReviewScreen';
import DashboardScreen from './screens/DashboardScreen';
import UpdatesScreen from './screens/UpdatesScreen';
import ManageMenuScreen from './screens/ManageMenuScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import VerificationScreen from './screens/VerificationScreen';
import BottomNavBar from './components/BottomNavBar';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const location = useLocation();
  
  // Determine if BottomNavBar should be shown
  const showStudentNav = ['/discover', '/saved', '/updates', '/profile'].includes(location.pathname);
  const showOwnerNav = ['/dashboard', '/manage-menu', '/owner-reviews', '/owner-profile'].includes(location.pathname);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/discover" element={<DiscoverScreen />} />
          <Route path="/mess/:id" element={<MessDetailsScreen />} />
          <Route path="/review/:id" element={<ReviewScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/updates" element={<UpdatesScreen />} />
          <Route path="/manage-menu" element={<ManageMenuScreen />} />
          <Route path="/profile-setup" element={<ProfileSetupScreen />} />
          <Route path="/verification" element={<VerificationScreen />} />
        </Routes>
      </AnimatePresence>
      
      {showStudentNav && <BottomNavBar role="student" />}
      {showOwnerNav && <BottomNavBar role="owner" />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
