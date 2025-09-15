import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

export class UidUnavailableError extends Error {
  constructor(msg = 'UID unavailable') { 
    super(msg); 
    this.name = 'UidUnavailableError'; 
  }
}

type UidContextType = {
  uid: string | null;
  user: User | null;
  loading: boolean;
  getUidOrThrow: (timeoutMs?: number) => Promise<string>;
};

const UidContext = createContext<UidContextType | undefined>(undefined);

export const UidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getAuth().currentUser);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('[UID_PROVIDER] Setting up auth state listener');
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[UID_PROVIDER] Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');
      setUser(firebaseUser);
      setLoading(false);
    });
    
    return () => {
      console.log('[UID_PROVIDER] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const uid = user?.uid ?? null;

  const getUidOrThrow = (timeoutMs = 5000): Promise<string> => {
    if (uid) {
      console.log('[UID_PROVIDER] UID available immediately:', uid);
      return Promise.resolve(uid);
    }
    
    console.log('[UID_PROVIDER] UID not available, waiting for auth state...');
    return new Promise<string>((resolve, reject) => {
      const auth = getAuth();
      const timer = setTimeout(() => {
        console.log('[UID_PROVIDER] Timeout waiting for UID');
        unsubscribe();
        reject(new UidUnavailableError(`UID not available after ${timeoutMs}ms`));
      }, timeoutMs);
      
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser?.uid) {
          console.log('[UID_PROVIDER] UID resolved:', firebaseUser.uid);
          clearTimeout(timer);
          unsubscribe();
          resolve(firebaseUser.uid);
        }
      });
    });
  };

  const value = useMemo<UidContextType>(() => ({ 
    uid, 
    user, 
    loading, 
    getUidOrThrow 
  }), [uid, user, loading]);

  console.log('[UID_PROVIDER] Current state:', { uid, loading, hasUser: !!user });

  return (
    <UidContext.Provider value={value}>
      {children}
    </UidContext.Provider>
  );
};

export const useUid = () => {
  const context = useContext(UidContext);
  if (!context) {
    throw new Error('useUid must be used within UidProvider');
  }
  return context;
};