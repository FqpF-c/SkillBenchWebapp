import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Ngrok configuration helper
const getAppUrl = () => {
  if (import.meta.env.VITE_USE_NGROK === 'true' && import.meta.env.VITE_NGROK_URL) {
    console.log('🌐 Using ngrok URL:', import.meta.env.VITE_NGROK_URL);
    return import.meta.env.VITE_NGROK_URL;
  }
  return window.location.origin;
};

// Export the current app URL for use in other parts of the app
export const APP_URL = getAppUrl();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

// Database paths
export const DB_PATHS = {
  // Firestore paths
  USERS: 'skillbench/users/users', // /skillbench/users/users/{firebase_uid}
  PHONE_TO_UID: 'skillbench/phone_to_uid/mappings', // /skillbench/phone_to_uid/mappings/{phone_number}
  PREP_TITLE: 'prep/Title',
  
  // Realtime Database paths
  REALTIME_USERS: 'skillbench/users', // /skillbench/users/{current_firebase_uid}
  REALTIME_PROGRESS: 'skillbench/users' // progress will be: skillbench/users/{uid}/progress
};

export default app;