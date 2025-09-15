import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNav from './BottomNav.jsx';
import { 
  BookOpen, 
  Sun, 
  Trophy, 
  Users
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isListTopicsPage = location.pathname.includes('/list-topics/');
  const isQuizPage = location.pathname.includes('/quiz-') || 
                     location.pathname.includes('/practice-mode') || 
                     location.pathname.includes('/test-mode');

  const [currentNavIndex, setCurrentNavIndex] = useState(0);

  // Navigation items for bottom nav
  const navItems = [
    { label: 'Home', icon: Sun, aria: 'Navigate to home' },
    { label: 'Academics', icon: BookOpen, aria: 'Navigate to academics' },
    { label: 'Leaderboard', icon: Trophy, aria: 'Navigate to leaderboard' },
    { label: 'Profile', icon: Users, aria: 'Navigate to profile' }
  ];

  // Update current nav index based on current path
  useEffect(() => {
    const paths = ['/', '/academics', '/leaderboard', '/profile'];
    const currentIndex = paths.findIndex(path => location.pathname === path);
    setCurrentNavIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [location.pathname]);

  const handleNavChange = (index) => {
    setCurrentNavIndex(index);
    const paths = ['/', '/academics', '/leaderboard', '/profile'];
    navigate(paths[index]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100/50 via-pink-50/20 to-white">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation - Show on all pages except quiz pages and list topics */}
      {!isQuizPage && !isListTopicsPage && (
        <BottomNav />
      )}
    </div>
  );
};

export default Layout;