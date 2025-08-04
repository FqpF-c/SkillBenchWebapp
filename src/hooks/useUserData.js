import { useState, useEffect } from 'react';
import { MOCK_USER_DATA } from '../utils/constants';

export const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadUserData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get data from localStorage or use mock data
        const savedData = localStorage.getItem('userData');
        const data = savedData ? JSON.parse(savedData) : MOCK_USER_DATA;
        
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserData(MOCK_USER_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updateUserData = (updates) => {
    const updatedData = { ...userData, ...updates };
    setUserData(updatedData);
    localStorage.setItem('userData', JSON.stringify(updatedData));
  };

  return { userData, loading, updateUserData };
};

// Additional responsive utilities for mobile-first design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

export const ANIMATIONS = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  }
};