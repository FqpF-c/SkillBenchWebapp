// src/pages/Home.jsx - Updated to require authentication
import React, { useEffect, useState } from 'react';
import { CheckCircle, Trophy, Clock, RefreshCw, LogIn } from 'lucide-react';
import OngoingPrograms from '../components/home/OngoingPrograms';
import TechnologiesSection from '../components/home/TechnologiesSection';
import LoginModal from '../components/auth/LoginModal';
import { firebasePrepService } from '../services/firebasePrepService';
import { testAuthService } from '../services/testAuthService';
import './Home.css';

const statsConfig = [
  { icon: CheckCircle, label: 'Completed', key: 'completed' },
  { icon: Trophy, label: 'Rank Position', key: 'rankPosition' },
  { icon: Clock, label: 'Study Hours', key: 'studyHours' }
];

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState('🌞');
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({ completed: 0, rankPosition: 0, studyHours: 0 });
  const [prepData, setPrepData] = useState(null);
  const [isLoadingPrepData, setIsLoadingPrepData] = useState(false);
  const [prepDataError, setPrepDataError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Set greeting
    setGreeting(getGreeting());
    setIcon(getGreetingIcon());
    
    // Check if already authenticated
    const currentUser = testAuthService.getCurrentUser();
    if (currentUser && testAuthService.isLoggedIn()) {
      setUser(currentUser);
      setIsAuthenticated(true);
      setUserStats({ completed: 12, rankPosition: 5, studyHours: 42 });
      await loadPrepData();
    } else {
      // Listen for authentication changes
      testAuthService.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser && testAuthService.getCurrentUser()) {
          const testUser = testAuthService.getCurrentUser();
          setUser(testUser);
          setIsAuthenticated(true);
          setUserStats({ completed: 12, rankPosition: 5, studyHours: 42 });
          loadPrepData();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setPrepData(null);
        }
      });
    }
  };

  const loadPrepData = async () => {
    try {
      setIsLoadingPrepData(true);
      setPrepDataError(null);
      
      console.log('Loading Firebase prep data for Home page...');
      const data = await firebasePrepService.loadAllPrepData();
      
      setPrepData(data);
      console.log('Firebase prep data loaded successfully:', data);
      
    } catch (error) {
      console.error('Error loading Firebase prep data:', error);
      setPrepDataError(error.message);
    } finally {
      setIsLoadingPrepData(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    return hour < 18 ? '🌞' : '🌙';
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setUserStats({ completed: 12, rankPosition: 5, studyHours: 42 });
    loadPrepData();
  };

  const handleLogout = async () => {
    const result = await testAuthService.signOut();
    if (result.success) {
      setUser(null);
      setIsAuthenticated(false);
      setPrepData(null);
      setUserStats({ completed: 0, rankPosition: 0, studyHours: 0 });
    }
  };

  const handleRefreshData = () => {
    if (isAuthenticated) {
      firebasePrepService.clearCache();
      loadPrepData();
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="home-root">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="text-white" size={32} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SkillBench
            </h1>
            <p className="text-gray-600 mb-8">
              Please login to access your personalized learning dashboard and start generating practice questions.
            </p>
            
            {/* Test Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Test Credentials</h3>
              <p className="text-sm text-blue-800">
                <strong>Phone:</strong> 1234567890<br />
                <strong>OTP:</strong> 123456
              </p>
            </div>
            
            <button
              onClick={handleLogin}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Login to Continue
            </button>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Main authenticated view
  return (
    <div className="home-root">
      {/* Greeting Section */}
      <div className="greeting-section fade-in">
        <span className={`greeting-icon ${icon === '🌞' ? 'sun-glow' : 'moon-glow'}`}>
          {icon}
        </span>
        <span className="greeting-text">
          {greeting}, {user?.phoneNumber?.includes('1234567890') ? 'Tester' : 'User'}
        </span>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="ml-4 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
        
        {/* Firebase Data Status */}
        <div className="flex items-center gap-2 mt-2">
          {isLoadingPrepData ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw size={14} className="animate-spin" />
              <span>Loading subjects...</span>
            </div>
          ) : prepDataError ? (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <span>Error loading subjects</span>
              <button 
                onClick={handleRefreshData}
                className="text-secondary hover:text-secondary-dark underline"
              >
                Retry
              </button>
            </div>
          ) : prepData ? (
            <div className="text-sm text-gray-600">
              ✅ {prepData.totalItems} subjects available across {prepData.totalCategories} categories
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-row">
        {statsConfig.map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.key}
              className="stat-card"
              style={{ animationDelay: `${i * 0.12 + 0.2}s` }}
            >
              <span className="stat-icon"><StatIcon size={32} /></span>
              <span className="stat-value">{userStats[stat.key]}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Firebase Data Summary Card */}
      {prepData && (
        <div className="mb-6 card bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">🎯 Question Generation Ready</h3>
                <p className="text-sm text-gray-600">
                  Access to {prepData.totalItems} subjects for generating practice questions
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {Object.entries(prepData.categoryItems).map(([categoryId, items]) => (
                  <div key={categoryId} className="text-center">
                    <div className="font-bold text-primary">{items.length}</div>
                    <div className="text-gray-500 text-xs">
                      {prepData.displayTitles[categoryId] || categoryId}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleRefreshData}
                  className="ml-2 p-1 text-gray-400 hover:text-secondary transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Sections */}
      <div className="dashboard-sections">
        {/* Ongoing Programs - Now powered by Firebase */}
        <OngoingPrograms />
        
        {/* Technologies Section - Now powered by Firebase */}
        <TechnologiesSection />
      </div>

      {/* Optional: Firebase Data Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && prepData && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Debug: Firebase Data Structure</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Categories: {JSON.stringify(prepData.categoryTitles)}</div>
            <div>Display Titles: {JSON.stringify(prepData.displayTitles)}</div>
            <div>
              Items per Category: {' '}
              {Object.entries(prepData.categoryItems).map(([cat, items]) => 
                `${cat}: ${items.length}`
              ).join(', ')}
            </div>
            <div>Last Updated: {prepData.lastUpdated}</div>
            <div>User: {user?.uid} (Test: {user?.isTestUser ? 'Yes' : 'No'})</div>
          </div>
        </div>
      )}
    </div>
  );
}