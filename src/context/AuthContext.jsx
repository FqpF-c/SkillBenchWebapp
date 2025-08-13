import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import FirebaseAuthService from '../services/FirebaseAuthService';
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
              firestoreData = await FirestoreService.getUserData(phoneNumber);
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
      localStorage.setItem('phoneNumber', phoneNumber);
      return await FirebaseAuthService.sendOTP(phoneNumber);
    } catch (error) {
      console.error('❌ [AUTH] Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const result = await FirebaseAuthService.verifyOTP(otp);
      
      if (result.success) {
        const phoneNumber = localStorage.getItem('phoneNumber');
        
        if (!phoneNumber) {
          return { success: false, error: 'Phone number not found' };
        }
        
        const firebaseUser = result.user;
        
        if (!firebaseUser) {
          return { success: false, error: 'Authentication failed - no user in result' };
        }
        
        let userExists = false;
        try {
          userExists = await FirestoreService.checkUserExists(phoneNumber);
          console.log('[DATABASE] User existence check in Firestore:', userExists ? 'Found' : 'Not found');
        } catch (error) {
          console.error('[DATABASE] Could not check user existence:', error.message);
        }
        
        if (userExists) {
          let firestoreData = null;
          let realtimeData = null;
          
          try {
            firestoreData = await FirestoreService.getUserData(phoneNumber);
            console.log('[DATABASE] Successfully retrieved user profile during login');
          } catch (error) {
            console.error('[DATABASE] Firestore access failed during login:', error);
          }
          
          try {
            realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
            console.log('[DATABASE] Successfully retrieved user stats during login');
          } catch (error) {
            console.error('[DATABASE] Realtime DB access failed during login:', error);
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
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(mergedUserData));
            console.log('[SESSION] Login session saved successfully for user:', mergedUserData.username);
          }
        } else {
          const tempUserData = {
            uid: firebaseUser.uid,
            phoneNumber: phoneNumber,
            username: '',
            college: '',
            xp: 20,
            coins: 5,
            streaks: 0,
            study_hours: 0
          };
          setUser(tempUserData);
        }
        
        return { success: true, userExists };
      }
      
      return result;
    } catch (error) {
      console.error('[AUTH] Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      const firebaseUser = auth.currentUser || user;
      
      if (!firebaseUser) {
        return { success: false, error: 'No authenticated user found' };
      }
      
      const registrationData = {
        ...userData,
        firebaseUID: firebaseUser.uid,
        xp: 20,
        coins: 5,
        streaks: 0,
        study_hours: 0
      };

      let firestoreResult = { success: false };
      let realtimeResult = { success: false };
      
      try {
        firestoreResult = await FirestoreService.registerUser(phoneNumber, registrationData);
        console.log('[DATABASE] User registration in Firestore:', firestoreResult.success ? 'Success' : 'Failed');
      } catch (error) {
        console.error('[DATABASE] Firestore registration failed:', error);
      }
      
      try {
        realtimeResult = await FirebaseRealtimeService.setUserData(firebaseUser.uid, registrationData);
        console.log('[DATABASE] User data saved to Realtime DB:', realtimeResult.success ? 'Success' : 'Failed');
      } catch (error) {
        console.error('[DATABASE] Realtime DB registration failed:', error);
        realtimeResult = { success: true };
      }
      
      if (firestoreResult.success) {
        let firestoreData = null;
        let realtimeData = null;
        
        try {
          firestoreData = await FirestoreService.getUserData(phoneNumber);
        } catch (error) {
          console.error('[DATABASE] Could not fetch firestore data after registration:', error);
        }
        
        try {
          realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
        } catch (error) {
          console.error('[DATABASE] Could not fetch realtime data after registration:', error);
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
      }
      
      return { success: firestoreResult.success };
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
      setUser(null);
      setLoading(false);
      
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('phoneNumber');
      localStorage.clear();
      
      await FirebaseAuthService.signOut();
      
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