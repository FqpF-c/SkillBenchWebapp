import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUid } from '../auth/UidProvider';
import FirebaseService from '../services/firebaseService';

const useUserData = () => {
  const { user } = useAuth();
  const { uid: centralizedUid, getUidOrThrow } = useUid();
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
    console.log('🔄 [useUserData] Starting to load user data...');
    console.log('🔄 [useUserData] Current user:', user);
    console.log('🔄 [useUserData] Centralized UID:', centralizedUid);
    
    if (!user || !centralizedUid) {
      console.log('❌ [useUserData] No user or UID found, setting loading to false');
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
          console.log('📱 [useUserData] Using phone number from localStorage:', phoneNumberToUse);
        }
      }
      
      console.log('🔍 [useUserData] Attempting to get user data with:');
      console.log('  - UID:', centralizedUid);
      console.log('  - Phone Number:', phoneNumberToUse);
      
      const userData = await FirebaseService.getUserData(
        centralizedUid, // Firebase UID for Realtime Database
        phoneNumberToUse || null // Phone number for Firestore (might be null)
      );

      console.log('📄 [useUserData] Raw user data received:', userData);

      if (userData.userStats) {
        console.log('✅ [useUserData] Setting user stats:', userData.userStats);
        setUserStats(userData.userStats);
      } else {
        console.warn('⚠️ [useUserData] No user stats found in response');
      }

      if (userData.userDetails) {
        console.log('✅ [useUserData] Setting user details:', userData.userDetails);
        setUserDetails(userData.userDetails);
      } else {
        console.warn('⚠️ [useUserData] No user details found in response');
      }

    } catch (err) {
      console.error('❌ [useUserData] Error loading user data:', err);
      setError(err.message);
    } finally {
      console.log('✅ [useUserData] Finished loading user data');
      setLoading(false);
    }
  }, [user, centralizedUid]);

  const updateUserStats = useCallback(async (updates) => {
    try {
      const uid = await getUidOrThrow();
      console.log('🔄 [useUserData] Updating user stats:', updates);
      console.log('🔍 [useUserData] Using centralized UID:', uid);
      
      const result = await FirebaseService.updateUserStatsByUid(uid, updates);
      
      if (result.success) {
        console.log('✅ [useUserData] Stats updated successfully, updating local state');
        // Update local state
        setUserStats(prev => ({ ...prev, ...updates }));
      } else {
        console.error('❌ [useUserData] Failed to update stats:', result.error);
      }
      
      return result;
    } catch (err) {
      console.error('❌ [useUserData] Error updating user stats:', err);
      return { success: false, error: err.message };
    }
  }, [getUidOrThrow]);

  useEffect(() => {
    console.log('🔄 [useUserData] useEffect triggered, user changed:', user);
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