// src/context/FirebaseAuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔐 Setting up Firebase Authentication...');
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User signed in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    // Sign in anonymously immediately
    signInAnonymously(auth)
      .then(() => {
        console.log('✅ Anonymous sign-in successful');
      })
      .catch((error) => {
        console.error('❌ Anonymous sign-in failed:', error);
        setError(error.message);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const signInAnonymouslyManual = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymously(auth);
      console.log('✅ Manual anonymous sign-in successful');
    } catch (error) {
      console.error('❌ Manual anonymous sign-in failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signInAnonymouslyManual
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};