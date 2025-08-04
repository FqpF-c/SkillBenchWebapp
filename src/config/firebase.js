// src/config/firebase.js
// Firebase configuration that matches your Flutter app setup

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Based on your firebase.json configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYourActualAPIKeyHere", // You'll need to get this from Firebase Console
  authDomain: "quip-664c9.firebaseapp.com",
  databaseURL: "https://quip-664c9-default-rtdb.firebaseio.com",
  projectId: "quip-664c9",
  storageBucket: "quip-664c9.appspot.com",
  messagingSenderId: "331394964996",
  appId: "1:331394964996:web:4492900dfc8d9433be5f51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app); // Firestore database
export const rtdb = getDatabase(app); // Realtime database  
export const auth = getAuth(app); // Authentication

export default app;