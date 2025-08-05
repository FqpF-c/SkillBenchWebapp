import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import FirebaseService from '../services/firebaseService';

const useUserData = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    xp: 0,
    coins: 0,
    points: 0,
    study_hours: 0,
    total_usage: 0,
    streaks: 0
  });
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get user data from both Firestore and Realtime Database
      // Note: user.phoneNumber might be null for anonymous users or users who signed up with email
      let phoneNumberToUse = user.phoneNumber;
      
      // If no phone number in user object, try to get it from localStorage (for email-based users)
      if (!phoneNumberToUse) {
        const storedPhoneNumber = localStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          phoneNumberToUse = storedPhoneNumber;
        }
      }
      
      const userData = await FirebaseService.getUserData(
        user.uid, // Firebase UID for Realtime Database
        phoneNumberToUse || null // Phone number for Firestore (might be null)
      );

      if (userData.userStats) {
        setUserStats(userData.userStats);
      }

      if (userData.userDetails) {
        setUserDetails(userData.userDetails);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUserStats = useCallback(async (updates) => {
    if (!user?.uid) {
      return { success: false, error: 'No user UID available' };
    }

    try {
      // Get the current_firebase_uid from user details if available
      let uidToUse = user.uid; // fallback to Auth UID
      
      if (userDetails && userDetails.current_firebase_uid) {
        uidToUse = userDetails.current_firebase_uid;
      }
      
      const result = await FirebaseService.updateUserStatsByUid(uidToUse, updates);
      
      if (result.success) {
        // Update local state
        setUserStats(prev => ({ ...prev, ...updates }));
      }
      
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.uid, userDetails]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userStats,
    userDetails,
    loading,
    error,
    updateUserStats,
    refreshUserData: loadUserData
  };
};

export { useUserData };

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