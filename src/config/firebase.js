import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;