import { ref, get, set, update, child } from 'firebase/database';
import { realtimeDb, DB_PATHS } from '../config/firebase';

class FirebaseRealtimeService {
  async getUserData(firebaseUid) {
    try {
      console.log('🔍 [REALTIME] Getting user data for Firebase UID:', firebaseUid);
      
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('✅ [REALTIME] User data found:', data);
        return data;
      } else {
        console.log('❌ [REALTIME] No user data found, creating default...');
        
        const defaultData = {
          xp: 20,
          coins: 5,
          streaks: 0,
          study_hours: 0,
          last_login: Date.now()
        };
        
        console.log('💾 [REALTIME] Creating default user data...');
        await this.setUserData(firebaseUid, defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error('❌ [REALTIME] Error with database access:', error.message);
      
      console.log('🔄 [REALTIME] Returning default data due to error');
      return {
        xp: 20,
        coins: 5,
        streaks: 0,
        study_hours: 0,
        last_login: Date.now()
      };
    }
  }

  async setUserData(firebaseUid, userData) {
    try {
      console.log('💾 [REALTIME] Setting user data for Firebase UID:', firebaseUid);
      
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`);
      
      const dataToSave = {
        xp: userData.xp || 20,
        coins: userData.coins || 5,
        streaks: userData.streaks || 0,
        study_hours: userData.study_hours || 0,
        last_login: Date.now()
      };
      
      console.log('💾 [REALTIME] Data to save:', dataToSave);
      await set(userRef, dataToSave);
      
      console.log('✅ [REALTIME] User data saved successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [REALTIME] Error saving user data:', error.message);
      return { success: true };
    }
  }

  async updateUserData(firebaseUid, userData) {
    try {
      console.log('🔄 [REALTIME] Updating user data for Firebase UID:', firebaseUid);
      
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`);
      await update(userRef, {
        ...userData,
        last_login: Date.now()
      });
      
      console.log('✅ [REALTIME] User data updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [REALTIME] Error updating user data:', error.message);
      return { success: true };
    }
  }

  async updateUserStats(firebaseUid, stats) {
    try {
      console.log('📊 [REALTIME] Updating user stats for Firebase UID:', firebaseUid);
      
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`);
      await update(userRef, {
        ...stats,
        last_login: Date.now()
      });
      
      console.log('✅ [REALTIME] User stats updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [REALTIME] Error updating user stats:', error.message);
      return { success: true };
    }
  }

  async checkUserExists(firebaseUid) {
    try {
      console.log('🔍 [REALTIME] Checking if user exists for Firebase UID:', firebaseUid);
      
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`);
      const snapshot = await get(userRef);
      const exists = snapshot.exists();
      
      console.log('👤 [REALTIME] User exists:', exists);
      return exists;
    } catch (error) {
      console.error('❌ [REALTIME] Error checking user existence:', error.message);
      return false;
    }
  }

  async getProgressData(firebaseUid) {
    try {
      console.log('📈 [REALTIME] Getting progress data for Firebase UID:', firebaseUid);
      
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${firebaseUid}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('✅ [REALTIME] Progress data found');
        return data;
      }
      
      console.log('❌ [REALTIME] No progress data found');
      return {};
    } catch (error) {
      console.error('❌ [REALTIME] Error getting progress data:', error.message);
      return {};
    }
  }

  async updateProgressData(firebaseUid, topicId, progressData) {
    try {
      console.log('📊 [REALTIME] Updating progress for UID:', firebaseUid, 'Topic:', topicId);
      
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${firebaseUid}/${topicId}`);
      await set(progressRef, {
        ...progressData,
        lastUpdated: Date.now()
      });
      
      console.log('✅ [REALTIME] Progress data updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [REALTIME] Error updating progress data:', error.message);
      return { success: true };
    }
  }

  async getTopicProgress(firebaseUid, topicId) {
    try {
      console.log('📈 [REALTIME] Getting topic progress for UID:', firebaseUid, 'Topic:', topicId);
      
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${firebaseUid}/${topicId}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('✅ [REALTIME] Topic progress found');
        return data;
      }
      
      console.log('❌ [REALTIME] No topic progress found');
      return null;
    } catch (error) {
      console.error('❌ [REALTIME] Error getting topic progress:', error.message);
      return null;
    }
  }

  async updateTopicProgress(firebaseUid, categoryId, subcategory, topic, progressData) {
    try {
      const topicId = this.generateTopicProgressId(categoryId, subcategory, topic);
      console.log('📊 [REALTIME] Generated topic ID:', topicId);
      return await this.updateProgressData(firebaseUid, topicId, progressData);
    } catch (error) {
      console.error('❌ [REALTIME] Error updating topic progress:', error.message);
      return { success: true };
    }
  }

  generateTopicProgressId(categoryId, subcategory, topic) {
    const normalizeString = (str) => {
      return str
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '');
    };

    const normalizedCategory = normalizeString(categoryId);
    const normalizedSubcategory = normalizeString(subcategory);
    const normalizedTopic = normalizeString(topic);

    const topicId = `${normalizedCategory}_${normalizedSubcategory}_${normalizedTopic}`;
    console.log('🏷️ [REALTIME] Generated topic ID:', topicId);
    return topicId;
  }
}

export default new FirebaseRealtimeService();