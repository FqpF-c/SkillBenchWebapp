import { ref, get, set, update, child } from 'firebase/database';
import { realtimeDb, DB_PATHS } from '../config/firebase';

class FirebaseRealtimeService {
  async getUserData(phoneNumber) {
    try {
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${phoneNumber}`);
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

  async setUserData(phoneNumber, userData) {
    try {
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${phoneNumber}`);
      await set(userRef, {
        xp: userData.xp || 20,
        coins: userData.coins || 5,
        streaks: userData.streaks || 0,
        study_hours: userData.study_hours || 0,
        last_login: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error setting user data in Realtime Database:', error);
      throw error;
    }
  }

  async updateUserData(phoneNumber, userData) {
    try {
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${phoneNumber}`);
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

  async updateUserStats(phoneNumber, stats) {
    try {
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${phoneNumber}`);
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
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${phoneNumber}`);
      const snapshot = await get(userRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking user existence in Realtime Database:', error);
      return false;
    }
  }

  async getProgressData(phoneNumber) {
    try {
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${phoneNumber}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return {};
    } catch (error) {
      console.error('Error getting progress data from Realtime Database:', error);
      return {};
    }
  }

  async updateProgressData(phoneNumber, topicId, progressData) {
    try {
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${phoneNumber}/${topicId}`);
      await set(progressRef, {
        ...progressData,
        lastUpdated: Date.now()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating progress data in Realtime Database:', error);
      throw error;
    }
  }

  async getTopicProgress(phoneNumber, topicId) {
    try {
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${phoneNumber}/${topicId}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting topic progress from Realtime Database:', error);
      return null;
    }
  }

  generateTopicProgressId(categoryId, subcategory, topic) {
    const normalizeString = (input) => {
      return input
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
    };

    const normalizedCategory = normalizeString(categoryId);
    const normalizedSubcategory = normalizeString(subcategory);
    const normalizedTopic = normalizeString(topic);

    return `${normalizedCategory}_${normalizedSubcategory}_${normalizedTopic}`;
  }

  async updateTopicProgress(phoneNumber, categoryId, subcategory, topic, progressData) {
    try {
      const topicId = this.generateTopicProgressId(categoryId, subcategory, topic);
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${phoneNumber}/${topicId}`);
      
      const updatedProgress = {
        type: progressData.type || 'programming',
        subject: progressData.subject || categoryId,
        subtopic: progressData.subtopic || `${subcategory}|${topic}`,
        progress: progressData.progress || 0,
        bestScore: progressData.bestScore || 0,
        totalAttempts: progressData.totalAttempts || 0,
        totalCorrectAnswers: progressData.totalCorrectAnswers || 0,
        totalQuestions: progressData.totalQuestions || 0,
        lastUpdated: Date.now(),
        averageScore: progressData.averageScore || 0
      };

      await set(progressRef, updatedProgress);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating topic progress in Realtime Database:', error);
      throw error;
    }
  }
}

export default new FirebaseRealtimeService();