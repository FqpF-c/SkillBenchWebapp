import { ref, get, set, update } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

class FirebaseRealtimeService {
  async getUserData(phoneNumber) {
    try {
      const userRef = ref(realtimeDb, `skillbench/users/${phoneNumber}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data from Realtime Database:', error);
      throw error;
    }
  }

  async updateUserData(phoneNumber, userData) {
    try {
      const userRef = ref(realtimeDb, `skillbench/users/${phoneNumber}`);
      await update(userRef, {
        ...userData,
        last_login: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user data in Realtime Database:', error);
      throw error;
    }
  }

  async setUserData(phoneNumber, userData) {
    try {
      const userRef = ref(realtimeDb, `skillbench/users/${phoneNumber}`);
      await set(userRef, {
        ...userData,
        phone_number: phoneNumber,
        created_at: Date.now(),
        last_login: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error setting user data in Realtime Database:', error);
      throw error;
    }
  }

  async updateUserStats(phoneNumber, stats) {
    try {
      const userRef = ref(realtimeDb, `skillbench/users/${phoneNumber}`);
      await update(userRef, {
        ...stats,
        last_login: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats in Realtime Database:', error);
      throw error;
    }
  }

  async checkUserExists(phoneNumber) {
    try {
      const userRef = ref(realtimeDb, `skillbench/users/${phoneNumber}`);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking user existence in Realtime Database:', error);
      return false;
    }
  }
}

export default new FirebaseRealtimeService();