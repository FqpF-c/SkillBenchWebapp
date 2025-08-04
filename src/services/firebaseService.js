// src/config/firebase.js
// Firebase configuration that matches your Flutter app setup

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzVpy7ZgbnI6emH5f48JHhbj2hVRH_PFg",
  authDomain: "quip-664c9.firebaseapp.com",
  databaseURL: "https://quip-664c9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quip-664c9",
  storageBucket: "quip-664c9.firebasestorage.app",
  messagingSenderId: "331394964996",
  appId: "1:331394964996:web:9e120780791c199cbe5f51",
  measurementId: "G-B4M647WXVQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app); // Firestore database
export const rtdb = getDatabase(app); // Realtime database  
export const auth = getAuth(app); // Authentication

export default app;