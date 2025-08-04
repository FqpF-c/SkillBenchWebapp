import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import FirebaseAuthService from '../services/FirebaseAuthService';
import FirebaseRealtimeService from '../services/FirebaseRealtimeService';

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
      if (firebaseUser) {
        try {
          const phoneNumber = localStorage.getItem('phoneNumber');
          if (phoneNumber) {
            const userData = await FirebaseRealtimeService.getUserData(phoneNumber);
            if (userData) {
              setUser(userData);
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
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
        const userExists = await FirebaseRealtimeService.checkUserExists(phoneNumber);
        
        if (userExists) {
          const userData = await FirebaseRealtimeService.getUserData(phoneNumber);
          setUser(userData);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
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
        coins: 5,
        streaks: 0,
        xp: 20
      };

      const result = await FirebaseRealtimeService.setUserData(phoneNumber, registrationData);
      
      if (result.success) {
        const newUserData = await FirebaseRealtimeService.getUserData(phoneNumber);
        setUser(newUserData);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(newUserData));
      }
      
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserStats = async (stats) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) return { success: false, error: 'No phone number found' };
      
      const result = await FirebaseRealtimeService.updateUserStats(phoneNumber, stats);
      
      if (result.success) {
        const updatedUserData = await FirebaseRealtimeService.getUserData(phoneNumber);
        setUser(updatedUserData);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await FirebaseAuthService.signOut();
      setUser(null);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('phoneNumber');
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
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};