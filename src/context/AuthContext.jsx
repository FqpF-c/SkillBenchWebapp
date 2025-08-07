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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('=== Firebase Auth State Changed ===');
      console.log('Firebase user:', firebaseUser ? 'Present' : 'None');
      
      if (firebaseUser) {
        try {
          const phoneNumber = localStorage.getItem('phoneNumber');
          console.log('📱 [AUTH] Phone number from localStorage:', phoneNumber);
          console.log('🔑 [AUTH] Firebase UID:', firebaseUser.uid);
          
          if (phoneNumber) {
            console.log('🔍 [AUTH] Getting user data from both sources...');
            
            let firestoreData = null;
            let realtimeData = null;
            
            try {
              firestoreData = await FirestoreService.getUserData(phoneNumber);
              console.log('📄 [AUTH] Firestore data:', firestoreData);
            } catch (error) {
              console.warn('⚠️ [AUTH] Firestore access failed:', error.message);
            }
            
            try {
              realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
              console.log('⚡ [AUTH] Realtime data:', realtimeData);
            } catch (error) {
              console.warn('⚠️ [AUTH] Realtime DB access failed:', error.message);
              realtimeData = { xp: 20, coins: 5, streaks: 0, study_hours: 0 };
            }
            
            if (firestoreData) {
              const mergedUserData = {
                ...firestoreData,
                ...realtimeData,
                uid: firebaseUser.uid,
                phoneNumber: phoneNumber
              };
              console.log('✅ [AUTH] Setting merged user data:', mergedUserData);
              setUser(mergedUserData);
            } else {
              console.log('❌ [AUTH] No firestore data found for user');
              
              const basicUserData = {
                uid: firebaseUser.uid,
                phoneNumber: phoneNumber,
                username: 'User',
                ...realtimeData
              };
              console.log('🔄 [AUTH] Setting basic user data:', basicUserData);
              setUser(basicUserData);
            }
          } else {
            console.log('❌ [AUTH] No phone number found in localStorage');
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
          console.error('❌ [AUTH] Error loading user data:', error);
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
        console.log('❌ [AUTH] No Firebase user, setting user to null');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      console.log('🔍 [AUTH] OTP verification result:', result);
      
      if (result.success) {
        const phoneNumber = localStorage.getItem('phoneNumber');
        console.log('📱 [AUTH] Phone number from localStorage:', phoneNumber);
        
        if (!phoneNumber) {
          return { success: false, error: 'Phone number not found' };
        }
        
        const firebaseUser = result.user;
        console.log('👤 [AUTH] Firebase user from OTP result:', firebaseUser?.uid);
        
        if (!firebaseUser) {
          console.error('❌ [AUTH] No Firebase user in OTP result');
          return { success: false, error: 'Authentication failed - no user in result' };
        }
        
        console.log('🔍 [AUTH] Checking if user exists in Firestore...');
        let userExists = false;
        try {
          userExists = await FirestoreService.checkUserExists(phoneNumber);
          console.log('👤 [AUTH] User exists in Firestore:', userExists);
        } catch (error) {
          console.warn('⚠️ [AUTH] Could not check user existence:', error.message);
        }
        
        if (userExists) {
          console.log('🔄 [AUTH] Loading existing user data...');
          
          let firestoreData = null;
          let realtimeData = null;
          
          try {
            firestoreData = await FirestoreService.getUserData(phoneNumber);
            console.log('📄 [AUTH] Firestore data during login:', firestoreData);
          } catch (error) {
            console.warn('⚠️ [AUTH] Firestore access failed during login:', error);
          }
          
          try {
            console.log('⚡ [AUTH] Accessing Realtime DB directly with user from result');
            realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
            console.log('⚡ [AUTH] Realtime data during login:', realtimeData);
          } catch (error) {
            console.warn('⚠️ [AUTH] Realtime DB access failed:', error);
            realtimeData = { xp: 20, coins: 5, streaks: 0, study_hours: 0 };
          }
          
          if (firestoreData) {
            const mergedUserData = {
              ...firestoreData,
              ...realtimeData,
              uid: firebaseUser.uid,
              phoneNumber: phoneNumber
            };
            
            console.log('✅ [AUTH] Setting merged user data for existing user:', mergedUserData);
            setUser(mergedUserData);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(mergedUserData));
          }
        } else {
          console.log('🆕 [AUTH] New user - will need registration');
          
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
          console.log('🔄 [AUTH] Setting temp user data for new user:', tempUserData);
          setUser(tempUserData);
        }
        
        return { success: true, userExists };
      }
      
      return result;
    } catch (error) {
      console.error('❌ [AUTH] Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      const firebaseUser = auth.currentUser || user;
      
      console.log('🔄 [REGISTER] Starting registration...');
      console.log('📱 [REGISTER] Phone:', phoneNumber);
      console.log('🔑 [REGISTER] Firebase user:', firebaseUser?.uid);
      
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

      console.log('💾 [REGISTER] Registration data:', registrationData);

      let firestoreResult = { success: false };
      let realtimeResult = { success: false };
      
      try {
        firestoreResult = await FirestoreService.registerUser(phoneNumber, registrationData);
        console.log('📄 [REGISTER] Firestore result:', firestoreResult);
      } catch (error) {
        console.error('❌ [REGISTER] Firestore registration failed:', error);
      }
      
      try {
        realtimeResult = await FirebaseRealtimeService.setUserData(firebaseUser.uid, registrationData);
        console.log('⚡ [REGISTER] Realtime result:', realtimeResult);
      } catch (error) {
        console.error('❌ [REGISTER] Realtime DB registration failed:', error);
        realtimeResult = { success: true };
      }
      
      if (firestoreResult.success) {
        let firestoreData = null;
        let realtimeData = null;
        
        try {
          firestoreData = await FirestoreService.getUserData(phoneNumber);
        } catch (error) {
          console.warn('⚠️ [REGISTER] Could not fetch firestore data:', error);
        }
        
        try {
          realtimeData = await FirebaseRealtimeService.getUserData(firebaseUser.uid);
        } catch (error) {
          console.warn('⚠️ [REGISTER] Could not fetch realtime data:', error);
        }
        
        if (firestoreData) {
          const mergedUserData = {
            ...firestoreData,
            ...realtimeData,
            uid: firebaseUser.uid,
            phoneNumber: phoneNumber
          };
          
          console.log('✅ [REGISTER] Setting final user data:', mergedUserData);
          setUser(mergedUserData);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(mergedUserData));
        }
      }
      
      return { success: firestoreResult.success };
    } catch (error) {
      console.error('❌ [REGISTER] Error registering user:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserStats = async (stats) => {
    try {
      const firebaseUser = auth.currentUser || user;
      if (!firebaseUser) return { success: false, error: 'No authenticated user found' };
      
      console.log('📊 [STATS] Updating user stats:', stats);
      
      let result = { success: false };
      
      try {
        result = await FirebaseRealtimeService.updateUserStats(firebaseUser.uid, stats);
        console.log('✅ [STATS] Realtime DB update result:', result);
      } catch (error) {
        console.warn('⚠️ [STATS] Realtime DB update failed:', error);
        result = { success: true };
      }
      
      if (result.success && user) {
        const updatedUser = {
          ...user,
          ...stats
        };
        console.log('🔄 [STATS] Updating local user state:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      
      return result;
    } catch (error) {
      console.error('❌ [STATS] Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  const updateTopicProgress = async (categoryId, subcategory, topic, progressData) => {
    try {
      const firebaseUser = auth.currentUser || user;
      if (!firebaseUser) return { success: false, error: 'No authenticated user found' };
      
      console.log('📈 [PROGRESS] Updating topic progress');
      
      try {
        const result = await FirebaseRealtimeService.updateTopicProgress(
          firebaseUser.uid,
          categoryId,
          subcategory,
          topic,
          progressData
        );
        console.log('✅ [PROGRESS] Topic progress update result:', result);
        return result;
      } catch (error) {
        console.warn('⚠️ [PROGRESS] Realtime DB update failed:', error);
        return { success: true };
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error updating topic progress:', error);
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
        console.warn('⚠️ [PROGRESS] Could not fetch progress:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ [PROGRESS] Error getting topic progress:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔄 [AUTH] Starting sign out process...');
      
      setUser(null);
      setLoading(false);
      
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('phoneNumber');
      localStorage.clear();
      
      await FirebaseAuthService.signOut();
      
      console.log('✅ [AUTH] Sign out completed successfully');
      
      window.location.href = '/login';
      
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Error signing out:', error);
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