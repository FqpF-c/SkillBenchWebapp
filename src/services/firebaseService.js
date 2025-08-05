import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  get, 
  set, 
  update, 
  child 
} from 'firebase/database';
import { db, realtimeDb, DB_PATHS } from '../config/firebase';

class FirebaseService {
  // Load categories from /prep/Title (Title field)
  async loadCategories() {
    try {
      const firestorePath = DB_PATHS.PREP_TITLE;
      console.log(`🔍 [CATEGORIES] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [CATEGORIES] Raw Firestore data from ${firestorePath}:`, data);
        
        if (data.Title && Array.isArray(data.Title)) {
          console.log(`✅ [CATEGORIES] Found Title array with ${data.Title.length} categories`);
          return data.Title;
        } else {
          console.warn(`⚠️ [CATEGORIES] Title field is missing or not an array:`, data.Title);
          return [];
        }
      } else {
        console.log(`❌ [CATEGORIES] No document found at path: ${firestorePath}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [CATEGORIES] Error loading categories:`, error);
      throw error;
    }
  }

  // Load subcategories from /prep/Title/{category}/{category} document
  async loadSubcategories(categoryId) {
    try {
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}`;
      console.log(`🔍 [SUBCATEGORIES] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [SUBCATEGORIES] Raw Firestore data from ${firestorePath}:`, data);
        
        if (data[categoryId] && Array.isArray(data[categoryId])) {
          console.log(`✅ [SUBCATEGORIES] Found ${categoryId} array with ${data[categoryId].length} subcategories`);
          return data[categoryId];
        } else {
          console.warn(`⚠️ [SUBCATEGORIES] ${categoryId} field is missing or not an array:`, data[categoryId]);
          return [];
        }
      } else {
        console.log(`❌ [SUBCATEGORIES] No document found at path: ${firestorePath}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [SUBCATEGORIES] Error loading subcategories for ${categoryId}:`, error);
      throw error;
    }
  }

  // Load topics from /prep/Title/{category}/{subcategory} document (Topics field)
  async loadTopics(categoryId, subcategoryId) {
    try {
      // Correct path: prep/Title/{category}/{subcategory}
      // This creates: collection/document/collection/document (4 segments - even)
      // Then we read the "Topics" field from this document
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${subcategoryId}`;
      console.log(`🔍 [TOPICS] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [TOPICS] Raw Firestore data from ${firestorePath}:`, data);
        
        // Check if the Topics field exists and is an array
        if (data.Topics && Array.isArray(data.Topics)) {
          console.log(`✅ [TOPICS] Found Topics array with ${data.Topics.length} topics`);
          return data.Topics;
        } else {
          console.warn(`⚠️ [TOPICS] Topics field is missing or not an array:`, data.Topics);
          return [];
        }
      } else {
        console.log(`❌ [TOPICS] No document found at path: ${firestorePath}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [TOPICS] Error loading topics for ${categoryId}/${subcategoryId}:`, error);
      throw error;
    }
  }

  // NEW: Load content document from deep nested structure
  async loadTopicContent(categoryId, subcategoryId, topicName) {
    try {
      // Path: /prep/Title/{category}/{category}/{subcategory}/Topics/{topic}/content
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/content`;
      console.log(`🔍 [CONTENT] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [CONTENT] Raw content data from ${firestorePath}:`, data);
        
        // Log all available fields in the content document
        const fields = Object.keys(data);
        console.log(`📋 [CONTENT] Available fields in content document:`, fields);
        
        // Log each field with its type and preview
        fields.forEach(field => {
          const value = data[field];
          const type = Array.isArray(value) ? 'array' : typeof value;
          const preview = type === 'string' && value.length > 100 
            ? `${value.substring(0, 100)}...` 
            : value;
          
          console.log(`📝 [CONTENT] Field "${field}" (${type}):`, preview);
        });
        
        return {
          success: true,
          data: data,
          fields: fields,
          path: firestorePath
        };
      } else {
        console.log(`❌ [CONTENT] No content document found at path: ${firestorePath}`);
        return {
          success: false,
          error: 'Document not found',
          path: firestorePath
        };
      }
    } catch (error) {
      console.error(`❌ [CONTENT] Error loading content for ${categoryId}/${subcategoryId}/${topicName}:`, error);
      return {
        success: false,
        error: error.message,
        path: `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/content`
      };
    }
  }

  // NEW: Load quiz document from deep nested structure
  async loadTopicQuiz(categoryId, subcategoryId, topicName) {
    try {
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/quiz`;
      console.log(`🔍 [QUIZ] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [QUIZ] Raw quiz data from ${firestorePath}:`, data);
        
        const fields = Object.keys(data);
        console.log(`📋 [QUIZ] Available fields in quiz document:`, fields);
        
        return {
          success: true,
          data: data,
          fields: fields,
          path: firestorePath
        };
      } else {
        console.log(`❌ [QUIZ] No quiz document found at path: ${firestorePath}`);
        return {
          success: false,
          error: 'Document not found',
          path: firestorePath
        };
      }
    } catch (error) {
      console.error(`❌ [QUIZ] Error loading quiz for ${categoryId}/${subcategoryId}/${topicName}:`, error);
      return {
        success: false,
        error: error.message,
        path: `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/quiz`
      };
    }
  }

  // NEW: Load resources document from deep nested structure
  async loadTopicResources(categoryId, subcategoryId, topicName) {
    try {
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/resources`;
      console.log(`🔍 [RESOURCES] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [RESOURCES] Raw resources data from ${firestorePath}:`, data);
        
        const fields = Object.keys(data);
        console.log(`📋 [RESOURCES] Available fields in resources document:`, fields);
        
        return {
          success: true,
          data: data,
          fields: fields,
          path: firestorePath
        };
      } else {
        console.log(`❌ [RESOURCES] No resources document found at path: ${firestorePath}`);
        return {
          success: false,
          error: 'Document not found',
          path: firestorePath
        };
      }
    } catch (error) {
      console.error(`❌ [RESOURCES] Error loading resources for ${categoryId}/${subcategoryId}/${topicName}:`, error);
      return {
        success: false,
        error: error.message,
        path: `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/resources`
      };
    }
  }

  // NEW: Load all topic materials (content, quiz, resources) at once
  async loadCompleteTopicData(categoryId, subcategoryId, topicName) {
    try {
      console.log(`🚀 [COMPLETE_TOPIC] Loading all data for: ${categoryId}/${subcategoryId}/${topicName}`);
      
      const [contentResult, quizResult, resourcesResult] = await Promise.allSettled([
        this.loadTopicContent(categoryId, subcategoryId, topicName),
        this.loadTopicQuiz(categoryId, subcategoryId, topicName),
        this.loadTopicResources(categoryId, subcategoryId, topicName)
      ]);
      
      const result = {
        topic: topicName,
        subcategory: subcategoryId,
        category: categoryId,
        content: contentResult.status === 'fulfilled' ? contentResult.value : { success: false, error: contentResult.reason },
        quiz: quizResult.status === 'fulfilled' ? quizResult.value : { success: false, error: quizResult.reason },
        resources: resourcesResult.status === 'fulfilled' ? resourcesResult.value : { success: false, error: resourcesResult.reason },
        loadedAt: new Date().toISOString()
      };
      
      console.log(`✅ [COMPLETE_TOPIC] Complete topic data loaded:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ [COMPLETE_TOPIC] Error loading complete topic data:`, error);
      throw error;
    }
  }

  // NEW: List all available topics for a subcategory (from Topics document)
  async listAvailableTopics(categoryId, subcategoryId) {
    try {
      const topicsDocPath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategoryId}/Topics`;
      console.log(`🔍 [LIST_TOPICS] Accessing Topics document at: ${topicsDocPath}`);
      
      const docRef = doc(db, topicsDocPath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [LIST_TOPICS] Topics document data:`, data);
        
        if (data.Topics && Array.isArray(data.Topics)) {
          console.log(`✅ [LIST_TOPICS] Found ${data.Topics.length} topics:`, data.Topics);
          return data.Topics;
        } else {
          console.warn(`⚠️ [LIST_TOPICS] Topics field is missing or not an array`);
          return [];
        }
      } else {
        console.log(`❌ [LIST_TOPICS] No Topics document found at: ${topicsDocPath}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [LIST_TOPICS] Error listing topics:`, error);
      throw error;
    }
  }

  // Load all topics for a category (combines subcategories and topics)
  async loadAllTopicsForCategory(categoryId) {
    try {
      console.log(`🚀 [CATEGORY_LOAD] Starting to load all topics for category: ${categoryId}`);
      
      // Step 1: Load subcategories
      console.log(`📂 [CATEGORY_LOAD] Loading subcategories for ${categoryId}`);
      const subcategories = await this.loadSubcategories(categoryId);
      
      if (!subcategories || subcategories.length === 0) {
        console.warn(`⚠️ [CATEGORY_LOAD] No subcategories found for ${categoryId}`);
        return {
          subcategories: [],
          topicsBySubcategory: {}
        };
      }
      
      console.log(`✅ [CATEGORY_LOAD] Found ${subcategories.length} subcategories:`, subcategories);
      
      // Step 2: Load topics for each subcategory
      const topicsBySubcategory = {};
      
      for (const subcategory of subcategories) {
        try {
          console.log(`🔄 [CATEGORY_LOAD] Loading topics for subcategory: ${subcategory}`);
          const topics = await this.listAvailableTopics(categoryId, subcategory);
          
          if (topics && topics.length > 0) {
            topicsBySubcategory[subcategory] = topics;
            console.log(`✅ [CATEGORY_LOAD] Added ${topics.length} topics for subcategory: ${subcategory}`);
          } else {
            console.warn(`⚠️ [CATEGORY_LOAD] No topics found for subcategory: ${subcategory}`);
            topicsBySubcategory[subcategory] = [];
          }
        } catch (error) {
          console.error(`❌ [CATEGORY_LOAD] Error loading topics for subcategory ${subcategory}:`, error);
          topicsBySubcategory[subcategory] = [];
        }
      }
      
      console.log(`🎉 [CATEGORY_LOAD] Final result for ${categoryId}:`, { subcategories, topicsBySubcategory });
      
      return {
        subcategories,
        topicsBySubcategory
      };
    } catch (error) {
      console.error(`❌ [CATEGORY_LOAD] Error loading all topics for category ${categoryId}:`, error);
      throw error;
    }
  }

  // Firestore: Get user details by phone number
  async getUserDetailsByPhone(phoneNumber) {
    try {
      const firestorePath = `${DB_PATHS.USERS}/${phoneNumber}`;
      console.log(`🔍 [USER_DETAILS] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [USER_DETAILS] User details from Firestore:`, data);
        return { success: true, data };
      } else {
        console.log(`❌ [USER_DETAILS] No user found at path: ${firestorePath}`);
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error(`❌ [USER_DETAILS] Error getting user details:`, error);
      return { success: false, error: error.message };
    }
  }

  // Realtime Database: Get user stats by Firebase UID
  async getUserStatsByUid(firebaseUid) {
    try {
      const realtimePath = `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`;
      console.log(`🔍 [USER_STATS] Accessing Realtime Database path: ${realtimePath}`);
      
      const userRef = ref(realtimeDb, realtimePath);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`📄 [USER_STATS] User stats from Realtime Database:`, data);
        return { success: true, data };
      } else {
        console.log(`❌ [USER_STATS] No user stats found at path: ${realtimePath}`);
        // Initialize default stats if user doesn't exist
        const defaultStats = {
          xp: 0,
          coins: 0,
          points: 0,
          study_hours: 0,
          total_usage: 0,
          streaks: 0
        };
        await this.setUserStatsByUid(firebaseUid, defaultStats);
        return { success: true, data: defaultStats };
      }
    } catch (error) {
      console.error(`❌ [USER_STATS] Error getting user stats:`, error);
      return { success: false, error: error.message };
    }
  }

  // Realtime Database: Set user stats by Firebase UID
  async setUserStatsByUid(firebaseUid, userStats) {
    try {
      const realtimePath = `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`;
      console.log(`💾 [USER_STATS] Setting user stats at path: ${realtimePath}`);
      
      const userRef = ref(realtimeDb, realtimePath);
      await set(userRef, userStats);
      
      console.log(`✅ [USER_STATS] User stats saved successfully`);
      return { success: true };
    } catch (error) {
      console.error(`❌ [USER_STATS] Error setting user stats:`, error);
      return { success: false, error: error.message };
    }
  }

  // Realtime Database: Update user stats by Firebase UID
  async updateUserStatsByUid(firebaseUid, updates) {
    try {
      const realtimePath = `${DB_PATHS.REALTIME_USERS}/${firebaseUid}`;
      console.log(`🔄 [USER_STATS] Updating user stats at path: ${realtimePath}`);
      
      const userRef = ref(realtimeDb, realtimePath);
      await update(userRef, updates);
      
      console.log(`✅ [USER_STATS] User stats updated successfully`);
      return { success: true };
    } catch (error) {
      console.error(`❌ [USER_STATS] Error updating user stats:`, error);
      return { success: false, error: error.message };
    }
  }

  // Combined: Get both user details and stats
  async getUserData(userId, phoneNumber = null) {
    try {
      console.log(`🚀 [USER_DATA] Loading user data for UID: ${userId}, Phone: ${phoneNumber}`);
      
      const results = {
        userDetails: null,
        userStats: null
      };

      // Step 1: Get user details from Firestore (using phone number)
      if (phoneNumber) {
        console.log(`🔍 [USER_DATA] Loading user details for phone: ${phoneNumber}`);
        const detailsResult = await this.getUserDetailsByPhone(phoneNumber);
        if (detailsResult.success) {
          results.userDetails = detailsResult.data;
          console.log(`✅ [USER_DATA] User details loaded successfully:`, results.userDetails);
          
          // Step 2: Get the current_firebase_uid from user details
          const currentFirebaseUid = results.userDetails.current_firebase_uid;
          if (currentFirebaseUid) {
            console.log(`🔍 [USER_DATA] Found current_firebase_uid: ${currentFirebaseUid}`);
            
            // Step 3: Use current_firebase_uid to get user stats from Realtime Database
            console.log(`🔍 [USER_DATA] Loading user stats using current_firebase_uid: ${currentFirebaseUid}`);
            const statsResult = await this.getUserStatsByUid(currentFirebaseUid);
            if (statsResult.success) {
              results.userStats = statsResult.data;
              console.log(`✅ [USER_DATA] User stats loaded successfully:`, results.userStats);
            } else {
              console.warn(`⚠️ [USER_DATA] Failed to load user stats:`, statsResult.error);
            }
          } else {
            console.warn(`⚠️ [USER_DATA] No current_firebase_uid found in user details`);
          }
        } else {
          console.warn(`⚠️ [USER_DATA] Failed to load user details:`, detailsResult.error);
        }
      } else {
        console.warn(`⚠️ [USER_DATA] No phoneNumber provided for details loading`);
        
        // Fallback: Try using the provided userId directly (for backward compatibility)
        if (userId) {
          console.log(`🔍 [USER_DATA] Fallback: Loading user stats for UID: ${userId}`);
          const statsResult = await this.getUserStatsByUid(userId);
          if (statsResult.success) {
            results.userStats = statsResult.data;
            console.log(`✅ [USER_DATA] User stats loaded successfully (fallback):`, results.userStats);
          } else {
            console.warn(`⚠️ [USER_DATA] Failed to load user stats (fallback):`, statsResult.error);
          }
        }
      }

      console.log(`✅ [USER_DATA] Final results:`, results);
      return results;
    } catch (error) {
      console.error(`❌ [USER_DATA] Error loading user data:`, error);
      throw error;
    }
  }

  async setUserData(userId, userData) {
    try {
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${userId}`);
      await set(userRef, userData);
      return { success: true };
    } catch (error) {
      console.error('Error setting user data:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserStats(userId, updates) {
    try {
      const userRef = ref(realtimeDb, `${DB_PATHS.REALTIME_USERS}/${userId}`);
      await update(userRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  }

  async getProgressData(topicIds) {
    try {
      const progressData = {};
      
      for (const topicId of topicIds) {
        const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${topicId}`);
        const snapshot = await get(progressRef);
        
        if (snapshot.exists()) {
          progressData[topicId] = snapshot.val();
        } else {
          // Initialize progress data if it doesn't exist
          progressData[topicId] = {
            progress: 0,
            bestScore: 0,
            totalAttempts: 0,
            totalCorrectAnswers: 0,
            totalQuestions: 0,
            lastUpdated: Date.now(),
            averageScore: 0
          };
        }
      }
      
      return progressData;
    } catch (error) {
      console.error('Error getting progress data:', error);
      throw error;
    }
  }

  async updateTopicProgress(topicId, progressData) {
    try {
      const progressRef = ref(realtimeDb, `${DB_PATHS.REALTIME_PROGRESS}/${topicId}`);
      await set(progressRef, {
        ...progressData,
        lastUpdated: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating topic progress:', error);
      return { success: false, error: error.message };
    }
  }

  generateTopicProgressId(categoryId, subcategory, topic) {
    return `${categoryId}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
  }

  // Helper methods for asset and color mapping
  getAssetForTopic(topic) {
    const assetMap = {
      'python': 'python.png',
      'java': 'java.png',
      'javascript': 'javascript.png',
      'react': 'react.png',
      'flutter': 'flutter.png',
      'aws': 'aws.png',
      'azure': 'azure.png',
      'google-cloud': 'google-cloud.png',
      'html': 'html.png',
      'css': 'css.png',
      'cpp': 'cpp.png',
      'c': 'c.png',
      'swift': 'swift.png',
      'kotlin': 'kotlin.png',
      // Add more mappings for common topics
      'basics': 'web_development.png',
      'oop': 'java.png',
      'modules': 'python.png',
      'js': 'javascript.png',
      'fundamentals': 'web_development.png',
      'advanced': 'web_development.png'
    };

    const key = topic.toLowerCase().replace(/\s+/g, '-');
    return assetMap[key] || 'web_development.png';
  }

  getColorForTopic(topic) {
    const colorMap = {
      'python': 'from-green-500 to-green-600',
      'java': 'from-orange-500 to-orange-600',
      'javascript': 'from-yellow-500 to-yellow-600',
      'react': 'from-blue-500 to-blue-600',
      'flutter': 'from-teal-500 to-teal-600',
      'aws': 'from-orange-500 to-orange-600',
      'azure': 'from-blue-500 to-blue-600',
      'google-cloud': 'from-red-500 to-red-600',
      'html': 'from-orange-500 to-orange-600',
      'css': 'from-blue-500 to-blue-600',
      'cpp': 'from-purple-500 to-purple-600',
      'c': 'from-gray-500 to-gray-600',
      'swift': 'from-orange-500 to-orange-600',
      'kotlin': 'from-purple-500 to-purple-600',
      // Add more mappings for common topics
      'basics': 'from-blue-500 to-blue-600',
      'oop': 'from-purple-500 to-purple-600',
      'modules': 'from-green-500 to-green-600',
      'js': 'from-yellow-500 to-yellow-600',
      'fundamentals': 'from-indigo-500 to-indigo-600',
      'advanced': 'from-red-500 to-red-600'
    };

    const key = topic.toLowerCase().replace(/\s+/g, '-');
    return colorMap[key] || 'from-gray-500 to-gray-600';
  }

  // New function to replicate Flutter logic
  async loadAllTopicsFromTitle() {
    try {
      console.log('🔄 [TITLE_LOAD] Loading all topics from /prep/Title...');
      
      // Step 1: Load categories from Title field
      const categories = await this.loadCategories();
      
      if (!categories || categories.length === 0) {
        console.warn('⚠️ [TITLE_LOAD] No categories found in Title field');
        return {};
      }
      
      console.log(`✅ [TITLE_LOAD] Found ${categories.length} categories:`, categories);
      
      const categoryItems = {};
      
      // Step 2: For each category, load subcategories and format them
      for (const category of categories) {
        try {
          console.log(`📂 [TITLE_LOAD] Processing category: ${category}`);
          
          // Load subcategories for this category
          const subcategories = await this.loadSubcategories(category);
          
          if (subcategories && subcategories.length > 0) {
            // Format each subcategory with name, iconAsset, and color
            categoryItems[category] = subcategories.map(subcategory => {
              const formattedSubcategory = {
                name: subcategory,
                iconAsset: this.getAssetForTopic(subcategory),
                color: this.getColorForTopic(subcategory)
              };
              
              console.log(`🎨 [TITLE_LOAD] Formatted subcategory:`, formattedSubcategory);
              return formattedSubcategory;
            });
            
            console.log(`✅ [TITLE_LOAD] Added ${subcategories.length} subcategories for ${category}`);
          } else {
            console.warn(`⚠️ [TITLE_LOAD] No subcategories found for ${category}`);
            categoryItems[category] = [];
          }
        } catch (error) {
          console.error(`❌ [TITLE_LOAD] Error processing category ${category}:`, error);
          categoryItems[category] = [];
        }
      }
      
      console.log('✅ [TITLE_LOAD] Final categoryItems:', categoryItems);
      return categoryItems;
      
    } catch (error) {
      console.error('❌ [TITLE_LOAD] Error loading topics from /prep/Title:', error);
      throw error;
    }
  }
}

export default new FirebaseService();