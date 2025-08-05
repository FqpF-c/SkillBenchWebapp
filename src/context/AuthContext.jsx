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
      console.log('Current user state:', user);
      
      if (firebaseUser) {
        try {
          const phoneNumber = localStorage.getItem('phoneNumber');
          console.log('Phone number from localStorage:', phoneNumber);
          
          if (phoneNumber) {
            // Get user data from both Firestore and Realtime Database
            const [firestoreData, realtimeData] = await Promise.all([
              FirestoreService.getUserData(phoneNumber),
              FirebaseRealtimeService.getUserData(phoneNumber)
            ]);
            
            if (firestoreData) {
              // Merge data from both sources
              const mergedUserData = {
                ...firestoreData,
                ...realtimeData,
                uid: firebaseUser.uid, // Add Firebase UID
                phoneNumber: phoneNumber // Add phone number
              };
              console.log('Setting user data:', mergedUserData);
              setUser(mergedUserData);
            } else {
              console.log('No firestore data found for user');
              setUser(null);
            }
          } else {
            console.log('No phone number found in localStorage');
            setUser(null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        console.log('No Firebase user, clearing user state');
        setUser(null);
      }
      setLoading(false);
      console.log('=== Auth State Update Complete ===');
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (phoneNumber) => {
    try {
      const result = await FirebaseAuthService.sendOTP(phoneNumber);
      if (result.success) {
        localStorage.setItem('phoneNumber', phoneNumber);
      }
      return result;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const result = await FirebaseAuthService.verifyOTP(otp);
      
      if (result.success) {
        const phoneNumber = localStorage.getItem('phoneNumber');
        const userExists = await FirestoreService.checkUserExists(phoneNumber);
        
        if (userExists) {
          // Get user data from both sources
          const [firestoreData, realtimeData] = await Promise.all([
            FirestoreService.getUserData(phoneNumber),
            FirebaseRealtimeService.getUserData(phoneNumber)
          ]);
          
          if (firestoreData) {
            const mergedUserData = {
              ...firestoreData,
              ...realtimeData,
              uid: FirebaseAuthService.getCurrentUser()?.uid, // Add Firebase UID
              phoneNumber: phoneNumber // Add phone number
            };
            setUser(mergedUserData);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userData', JSON.stringify(mergedUserData));
          }
        }
        
        return { success: true, userExists };
      }
      
      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      const firebaseUser = FirebaseAuthService.getCurrentUser();
      
      const registrationData = {
        ...userData,
        firebaseUID: firebaseUser?.uid,
        xp: 20,
        coins: 5,
        streaks: 0,
        study_hours: 0
      };

      // Register user in both Firestore and Realtime Database
      const [firestoreResult, realtimeResult] = await Promise.all([
        FirestoreService.registerUser(phoneNumber, registrationData),
        FirebaseRealtimeService.setUserData(phoneNumber, registrationData)
      ]);
      
      if (firestoreResult.success && realtimeResult.success) {
        // Get updated user data from both sources
        const [firestoreData, realtimeData] = await Promise.all([
          FirestoreService.getUserData(phoneNumber),
          FirebaseRealtimeService.getUserData(phoneNumber)
        ]);
        
        if (firestoreData) {
          const mergedUserData = {
            ...firestoreData,
            ...realtimeData,
            uid: firebaseUser?.uid, // Add Firebase UID
            phoneNumber: phoneNumber // Add phone number
          };
          setUser(mergedUserData);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(mergedUserData));
        }
      }
      
      return { success: firestoreResult.success && realtimeResult.success };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserStats = async (stats) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) return { success: false, error: 'No phone number found' };
      
      // Update stats in Realtime Database
      const result = await FirebaseRealtimeService.updateUserStats(phoneNumber, stats);
      
      if (result.success) {
        // Get updated user data
        const [firestoreData, realtimeData] = await Promise.all([
          FirestoreService.getUserData(phoneNumber),
          FirebaseRealtimeService.getUserData(phoneNumber)
        ]);
        
        if (firestoreData) {
          const mergedUserData = {
            ...firestoreData,
            ...realtimeData
          };
          setUser(mergedUserData);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  const updateTopicProgress = async (categoryId, subcategory, topic, progressData) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) return { success: false, error: 'No phone number found' };
      
      const result = await FirebaseRealtimeService.updateTopicProgress(
        phoneNumber, 
        categoryId, 
        subcategory, 
        topic, 
        progressData
      );
      
      return result;
    } catch (error) {
      console.error('Error updating topic progress:', error);
      return { success: false, error: error.message };
    }
  };

  const getTopicProgress = async (categoryId, subcategory, topic) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) return null;
      
      const topicId = FirebaseRealtimeService.generateTopicProgressId(categoryId, subcategory, topic);
      const progress = await FirebaseRealtimeService.getTopicProgress(phoneNumber, topicId);
      
      return progress;
    } catch (error) {
      console.error('Error getting topic progress:', error);
      return null;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      
      // Clear all localStorage items
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('phoneNumber');
      
      // Sign out from Firebase Auth
      await FirebaseAuthService.signOut();
      
      console.log('Sign out completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
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