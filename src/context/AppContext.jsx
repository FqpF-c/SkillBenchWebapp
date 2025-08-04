import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userStats, setUserStats] = useState({
    xp: 46,
    coins: 0,
    streaks: 0,
    completed: 2,
    rankPosition: 24,
    studyHours: 128
  });

  const value = {
    activeTab,
    setActiveTab,
    userStats,
    setUserStats
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};