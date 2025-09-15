import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthService from '../services/AuthService';
import FirebaseRealtimeService from '../services/FirebaseRealtimeService';
import FirestoreService from '../services/FirestoreService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Check for persisted authentication state on app initialization
    const initializeAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const storedUserData = localStorage.getItem('userData');
      const phoneNumber = localStorage.getItem('phoneNumber');
      
      if (isLoggedIn === 'true' && storedUserData && phoneNumber) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log('[SESSION] Restoring login session from localStorage for user:', userData.username);
          setUser(userData);
        } catch (error) {
          console.error('[SESSION] Failed to restore session - invalid stored data:', error);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
        }
      } else {
        console.log('[SESSION] No valid session found in localStorage');
      }
      setInitialAuthCheckComplete(true);
    };

    // Initialize auth state first
    initializeAuth();
    
    // Then set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const phoneNumber = localStorage.getItem('phoneNumber');
          
          if (phoneNumber) {
            let firestoreData = null;
            let realtimeData = null;
            
            try {
              firestoreData = await FirestoreService.getUserData(firebaseUser.uid);
              console.log('[DATABASE] Successfully retrieved user profile from Firestore');
            } catch (error) {
              console.error('[DATABASE] Firestore access failed:', error.message);
            }
            
            try {
              realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
              console.log('[DATABASE] Successfully retrieved user stats from Realtime DB');
            } catch (error) {
              console.error('[DATABASE] Realtime DB access failed:', error.message);
              realtimeData = { xp: 20, coins: 5, streaks: 0, study_hours: 0 };
            }
            
            if (firestoreData) {
              const mergedUserData = {
                ...firestoreData,
                ...realtimeData,
                uid: firebaseUser.uid,
                phoneNumber: phoneNumber
              };
              setUser(mergedUserData);
              console.log('[SESSION] Login session established and saved for user:', mergedUserData.username);
            } else {
              const basicUserData = {
                uid: firebaseUser.uid,
                phoneNumber: phoneNumber,
                username: 'User',
                ...realtimeData
              };
              setUser(basicUserData);
            }
          } else {
            const basicUserData = {
              uid: firebaseUser.uid,
              username: 'Anonymous User',
              xp: 20,
              coins: 5,
              streaks: 0,
              study_hours: 0
            };
            setUser(basicUserData);
          }
        } catch (error) {
          console.error('[DATABASE] Error loading user data:', error);
          setUser({
            uid: firebaseUser.uid,
            username: 'User',
            xp: 20,
            coins: 5,
            streaks: 0,
            study_hours: 0
          });
        }
      } else {
        // Only clear localStorage if initial auth check is complete
        if (initialAuthCheckComplete) {
          console.log('[SESSION] Firebase auth expired - clearing login session');
          setUser(null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
        }
      }
      
      // Only set loading to false after initial auth check is complete
      if (initialAuthCheckComplete) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [initialAuthCheckComplete]);

  const sendOTP = async (phoneNumber) => {
    try {
      console.log('[AUTH] Sending OTP to:', phoneNumber);
      localStorage.setItem('phoneNumber', phoneNumber);
      return await AuthService.sendOTP(phoneNumber);
    } catch (error) {
      console.error('❌ [AUTH] Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      
      if (!phoneNumber) {
        return { success: false, error: 'Phone number not found' };
      }
      
      console.log('[AUTH] Verifying OTP for phone:', phoneNumber);
      
      // Use new AuthService for OTP verification and user flow handling
      const result = await AuthService.verifyOTP(phoneNumber, otp);
      
      if (result.userExists && result.uid) {
        // Existing user - load their data
        console.log('[AUTH] Loading existing user data for UID:', result.uid);
        
        let firestoreData = null;
        let realtimeData = null;
        
        try {
          firestoreData = await FirestoreService.getUserData(result.uid);
          console.log('[DATABASE] Successfully retrieved user profile from Firestore');
        } catch (error) {
          console.error('[DATABASE] Firestore access failed:', error.message);
        }
        
        try {
          realtimeData = await FirebaseRealtimeService.getUserData(result.uid);
          console.log('[DATABASE] Successfully retrieved user stats from Realtime DB');
        } catch (error) {
          console.error('[DATABASE] Realtime DB access failed:', error.message);
          realtimeData = { xp: 20, coins: 5, streaks: 0, studyHours: 0 };
        }
        
        if (firestoreData) {
          const mergedUserData = {
            ...firestoreData,
            ...realtimeData,
            uid: result.uid,
            phoneNumber: phoneNumber
          };
          
          setUser(mergedUserData);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(mergedUserData));
          console.log('[SESSION] Login session established for user:', mergedUserData.username);
          
          // Update last login timestamp
          await AuthService.updateLastLogin(result.uid);
        }
        
        return { success: true, userExists: true };
      } else if (!result.userExists) {
        // New user - prepare for registration
        console.log('[AUTH] New user detected - preparing for registration');
        const tempUserData = {
          phoneNumber: phoneNumber,
          username: '',
          college: '',
          xp: 20,
          coins: 5,
          streaks: 0,
          studyHours: 0
        };
        setUser(tempUserData);
        console.log('[AUTH] Temp user data set for registration');
        
        return { success: true, userExists: false };
      }
      
      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('[AUTH] Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      
      if (!phoneNumber) {
        return { success: false, error: 'Phone number not found' };
      }
      
      console.log('[AUTH] Starting user registration for phone:', phoneNumber);
      
      // Prepare registration data
      const registrationData = {
        ...userData,
        phoneNumber
      };
      
      // Use AuthService to register user with phone-based authentication
      const firebaseUser = await AuthService.registerUser(registrationData);
      console.log('[AUTH] User registered successfully with UID:', firebaseUser.uid);
      
      // Load user data after registration
      let firestoreData = null;
      let realtimeData = null;
      
      try {
        firestoreData = await FirestoreService.getUserData(firebaseUser.uid);
        console.log('[DATABASE] Successfully retrieved user profile after registration');
      } catch (error) {
        console.error('[DATABASE] Could not fetch firestore data after registration:', error);
      }
      
      try {
        realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
        console.log('[DATABASE] Successfully retrieved user stats after registration');
      } catch (error) {
        console.error('[DATABASE] Could not fetch realtime data after registration:', error);
        realtimeData = { xp: 20, coins: 5, streaks: 0, studyHours: 0 };
      }
      
      if (firestoreData) {
        const mergedUserData = {
          ...firestoreData,
          ...realtimeData,
          uid: firebaseUser.uid,
          phoneNumber: phoneNumber
        };
        
        setUser(mergedUserData);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(mergedUserData));
        console.log('[SESSION] Registration completed and session saved for user:', mergedUserData.username);
      }
      
      return { success: true };
    } catch (error) {
      console.error('[REGISTER] Error registering user:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserStats = async (stats) => {
    try {
      const firebaseUser = auth.currentUser || user;
      if (!firebaseUser) return { success: false, error: 'No authenticated user found' };
      
      let result = { success: false };
      
      try {
        result = await FirebaseRealtimeService.updateUserStats(firebaseUser.uid, stats);
        console.log('[DATABASE] User stats update:', result.success ? 'Success' : 'Failed');
      } catch (error) {
        console.error('[DATABASE] Realtime DB stats update failed:', error);
        result = { success: true };
      }
      
      if (result.success && user) {
        const updatedUser = {
          ...user,
          ...stats
        };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log('[SESSION] Updated session data with new stats');
      }
      
      return result;
    } catch (error) {
      console.error('[STATS] Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  const updateTopicProgress = async (categoryId, subcategory, topic, progressData) => {
    try {
      const firebaseUser = auth.currentUser || user;
      if (!firebaseUser) return { success: false, error: 'No authenticated user found' };
      
      try {
        const result = await FirebaseRealtimeService.updateTopicProgress(
          firebaseUser.uid,
          categoryId,
          subcategory,
          topic,
          progressData
        );
        console.log('[DATABASE] Topic progress update:', result.success ? 'Success' : 'Failed');
        return result;
      } catch (error) {
        console.error('[DATABASE] Topic progress update failed:', error);
        return { success: true };
      }
    } catch (error) {
      console.error('[PROGRESS] Error updating topic progress:', error);
      return { success: false, error: error.message };
    }
  };

  const getTopicProgress = async (categoryId, subcategory, topic) => {
    try {
      const firebaseUser = auth.currentUser || user;
      if (!firebaseUser) return null;
      
      const topicId = FirebaseRealtimeService.generateTopicProgressId(categoryId, subcategory, topic);
      
      try {
        const progress = await FirebaseRealtimeService.getTopicProgress(firebaseUser.uid, topicId);
        return progress;
      } catch (error) {
        console.error('[DATABASE] Could not fetch topic progress:', error);
        return null;
      }
    } catch (error) {
      console.error('[PROGRESS] Error getting topic progress:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      console.log('[AUTH] Starting sign out process');
      
      setUser(null);
      setLoading(false);
      
      // Use new AuthService for sign out
      await AuthService.signOut();
      
      console.log('[SESSION] User signed out and session cleared');
      
      window.location.href = '/login';
      
      return { success: true };
    } catch (error) {
      console.error('[AUTH] Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    registerUser,
    updateUserStats,
    updateTopicProgress,
    getTopicProgress,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};