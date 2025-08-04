import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import FirebaseAuthService from '../services/FirebaseAuthService';
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
      if (firebaseUser) {
        try {
          const phoneNumber = localStorage.getItem('phoneNumber');
          if (phoneNumber) {
            const userData = await FirestoreService.getUserData(phoneNumber);
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
        const userExists = await FirestoreService.checkUserExists(phoneNumber);
        
        if (userExists) {
          const userData = await FirestoreService.getUserData(phoneNumber);
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

      const result = await FirestoreService.registerUser(phoneNumber, registrationData);
      
      if (result.success) {
        const completeUserData = await FirestoreService.getUserData(phoneNumber);
        setUser(completeUserData);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(completeUserData));
      }
      
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await FirebaseAuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserStats = async (stats) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) return;

      await FirestoreService.updateUserStats(phoneNumber, stats);
      
      const updatedUserData = await FirestoreService.getUserData(phoneNumber);
      setUser(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    registerUser,
    logout,
    updateUserStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};