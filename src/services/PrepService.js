import { doc, getDoc } from 'firebase/firestore';
import { db, DB_PATHS } from '../config/firebase';
import FirebaseRealtimeService from './FirebaseRealtimeService';
import { useAuth } from '../context/AuthContext';

class PrepService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ [PREP_SERVICE] Cache cleared');
  }

  getCacheKey(operation, params) {
    return `${operation}_${JSON.stringify(params)}`;
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📋 [PREP_SERVICE] Cache hit for: ${key}`);
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 [PREP_SERVICE] Cache set for: ${key}`);
  }

  async loadAllPrepData() {
    const cacheKey = this.getCacheKey('allPrepData', {});
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🚀 [PREP_SERVICE] Loading all prep data...');
      
      const categoriesData = await this.loadAllTopicsFromTitle();
      
      const result = {
        categoryTitles: Object.keys(categoriesData),
        displayTitles: Object.keys(categoriesData).reduce((acc, key) => {
          acc[key] = key;
          return acc;
        }, {}),
        categoryItems: categoriesData,
        totalCategories: Object.keys(categoriesData).length,
        totalItems: Object.values(categoriesData).reduce((sum, items) => sum + items.length, 0),
        lastUpdated: new Date().toISOString(),
        error: null
      };

      this.setCachedData(cacheKey, result);
      console.log('✅ [PREP_SERVICE] All prep data loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ [PREP_SERVICE] Error loading prep data:', error);
      throw error;
    }
  }

  async loadAllTopicsFromTitle() {
    const cacheKey = this.getCacheKey('allTopicsFromTitle', {});
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔄 [PREP_SERVICE] Loading all topics from /prep/Title...');
      
      const categories = await this.loadCategories();
      
      if (!categories || categories.length === 0) {
        console.warn('⚠️ [PREP_SERVICE] No categories found in Title field');
        return {};
      }
      
      console.log(`✅ [PREP_SERVICE] Found ${categories.length} categories:`, categories);
      
      const categoryItems = {};
      
      for (const category of categories) {
        try {
          console.log(`📂 [PREP_SERVICE] Processing category: ${category}`);
          
          const subcategories = await this.loadSubcategories(category);
          
          if (subcategories && subcategories.length > 0) {
            categoryItems[category] = subcategories.map(subcategory => ({
              name: subcategory,
              iconAsset: this.getAssetForTopic(subcategory),
              color: this.getColorForTopic(subcategory)
            }));
            
            console.log(`✅ [PREP_SERVICE] Added ${subcategories.length} subcategories for ${category}`);
          } else {
            console.warn(`⚠️ [PREP_SERVICE] No subcategories found for ${category}`);
            categoryItems[category] = [];
          }
        } catch (error) {
          console.error(`❌ [PREP_SERVICE] Error processing category ${category}:`, error);
          categoryItems[category] = [];
        }
      }
      
      this.setCachedData(cacheKey, categoryItems);
      console.log('✅ [PREP_SERVICE] Final categoryItems loaded');
      return categoryItems;
    } catch (error) {
      console.error('❌ [PREP_SERVICE] Error loading topics from /prep/Title:', error);
      throw error;
    }
  }

  async loadCategories() {
    const cacheKey = this.getCacheKey('categories', {});
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const firestorePath = DB_PATHS.PREP_TITLE;
      console.log(`🔍 [PREP_SERVICE] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [PREP_SERVICE] Raw Firestore data from ${firestorePath}:`, data);
        
        if (data.Title && Array.isArray(data.Title)) {
          console.log(`✅ [PREP_SERVICE] Found Title array with ${data.Title.length} categories`);
          this.setCachedData(cacheKey, data.Title);
          return data.Title;
        } else {
          console.warn(`⚠️ [PREP_SERVICE] Title field is missing or not an array:`, data.Title);
          return [];
        }
      } else {
        console.log(`❌ [PREP_SERVICE] No document found at path: ${firestorePath}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [PREP_SERVICE] Error loading categories:`, error);
      throw error;
    }
  }

  async loadSubcategories(categoryId) {
    const cacheKey = this.getCacheKey('subcategories', { categoryId });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}`;
      console.log(`🔍 [PREP_SERVICE] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`📄 [PREP_SERVICE] Raw Firestore data from ${firestorePath}:`, data);
        
        if (data[categoryId] && Array.isArray(data[categoryId])) {
          console.log(`✅ [PREP_SERVICE] Found ${categoryId} array with ${data[categoryId].length} subcategories`);
          this.setCachedData(cacheKey, data[categoryId]);
          return data[categoryId];
        } else {
          console.warn(`⚠️ [PREP_SERVICE] ${categoryId} field is missing or not an array:`, data[categoryId]);
          return [];
        }
      } else {
        console.log(`❌ [PREP_SERVICE] No document found at path: ${firestorePath}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ [PREP_SERVICE] Error loading subcategories for ${categoryId}:`, error);
      throw error;
    }
  }

  async loadCategoryItems(categoryId) {
    const cacheKey = this.getCacheKey('categoryItems', { categoryId });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const subcategories = await this.loadSubcategories(categoryId);
      const items = subcategories.map(subcategory => ({
        name: subcategory,
        iconAsset: this.getAssetForTopic(subcategory),
        color: this.getColorForTopic(subcategory)
      }));
      
      this.setCachedData(cacheKey, items);
      return items;
    } catch (error) {
      console.error(`❌ [PREP_SERVICE] Error loading items for ${categoryId}:`, error);
      return [];
    }
  }

  async loadSubcategoryTopics(categoryId, subcategory) {
    const cacheKey = this.getCacheKey('subcategoryTopics', { categoryId, subcategory });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const firestorePath = `${DB_PATHS.PREP_TITLE}/${categoryId}/${categoryId}/${subcategory}/Topics`;
      console.log(`🔍 [PREP_SERVICE] Accessing Firestore path: ${firestorePath}`);
      
      const docRef = doc(db, firestorePath);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.Topics && Array.isArray(data.Topics)) {
          console.log(`✅ [PREP_SERVICE] Found ${data.Topics.length} topics for ${subcategory}`);
          this.setCachedData(cacheKey, data.Topics);
          return data.Topics;
        }
      }
      
      console.log(`❌ [PREP_SERVICE] No topics found for ${categoryId}/${subcategory}`);
      return [];
    } catch (error) {
      console.error(`❌ [PREP_SERVICE] Error loading topics for ${categoryId}/${subcategory}:`, error);
      return [];
    }
  }

  async loadAllTopicsForCategory(categoryId) {
    const cacheKey = this.getCacheKey('allTopicsForCategory', { categoryId });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      console.log(`🚀 [PREP_SERVICE] Loading all topics for category: ${categoryId}`);
      
      const subcategories = await this.loadSubcategories(categoryId);
      console.log(`📊 [PREP_SERVICE] Found ${subcategories.length} subcategories:`, subcategories);
      
      const topicsBySubcategory = {};
      
      for (const subcategory of subcategories) {
        try {
          console.log(`🔄 [PREP_SERVICE] Loading topics for subcategory: ${subcategory}`);
          const topics = await this.loadSubcategoryTopics(categoryId, subcategory);
          
          if (topics && topics.length > 0) {
            topicsBySubcategory[subcategory] = topics;
            console.log(`✅ [PREP_SERVICE] Added ${topics.length} topics for subcategory: ${subcategory}`);
          } else {
            console.warn(`⚠️ [PREP_SERVICE] No topics found for subcategory: ${subcategory}`);
            topicsBySubcategory[subcategory] = [];
          }
        } catch (error) {
          console.error(`❌ [PREP_SERVICE] Error loading topics for subcategory ${subcategory}:`, error);
          topicsBySubcategory[subcategory] = [];
        }
      }
      
      const result = {
        subcategories,
        topicsBySubcategory
      };
      
      this.setCachedData(cacheKey, result);
      console.log(`🎉 [PREP_SERVICE] Final result for ${categoryId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [PREP_SERVICE] Error loading all topics for category ${categoryId}:`, error);
      throw error;
    }
  }

  async loadProgressData(topicIds) {
    try {
      console.log(`📈 [PREP_SERVICE] Loading progress for ${topicIds.length} topics`);
      
      // This would need to integrate with auth context to get the current user
      // For now, return empty progress data
      const progressData = {};
      
      topicIds.forEach(topicId => {
        progressData[topicId] = {
          progress: 0,
          bestScore: 0,
          totalAttempts: 0,
          lastAttempted: null
        };
      });
      
      return progressData;
    } catch (error) {
      console.error('❌ [PREP_SERVICE] Error loading progress data:', error);
      return {};
    }
  }

  async updateTopicProgress(categoryId, subcategory, topic, progressData) {
    try {
      console.log(`📊 [PREP_SERVICE] Updating progress for: ${categoryId}/${subcategory}/${topic}`);
      
      // This would integrate with FirebaseRealtimeService and auth context
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error('❌ [PREP_SERVICE] Error updating topic progress:', error);
      return { success: false, error: error.message };
    }
  }

  async getTopicProgress(categoryId, subcategory, topic) {
    try {
      console.log(`📈 [PREP_SERVICE] Getting progress for: ${categoryId}/${subcategory}/${topic}`);
      
      // This would integrate with FirebaseRealtimeService and auth context
      // For now, return null
      return null;
    } catch (error) {
      console.error('❌ [PREP_SERVICE] Error getting topic progress:', error);
      return null;
    }
  }

  getAssetForTopic(topicName) {
    const normalizedName = topicName.toLowerCase().trim();
    const topicAssetMap = {
      'c': '💻',
      'c++': '💻',
      'cpp': '💻',
      'java': '☕',
      'python': '🐍',
      'kotlin': '📱',
      'swift': '🏃‍♂️',
      'flutter': '🦋',
      'react': '⚛️',
      'react native': '⚛️',
      'javascript': '🟨',
      'html': '🌐',
      'css': '🎨',
      'aws': '☁️',
      'azure': '☁️',
      'gcp': '☁️',
      'web development': '🌐',
    };
    return topicAssetMap[normalizedName] || '📚';
  }

  getColorForTopic(topicName) {
    const normalizedName = topicName.toLowerCase().trim();
    const categoryColors = {
      'c': '#5C6BC0',
      'c++': '#42A5F5',
      'java': '#EF5350',
      'python': '#66BB6A',
      'kotlin': '#AB47BC',
      'swift': '#FF7043',
      'flutter': '#29B6F6',
      'react': '#26C6DA',
      'javascript': '#FFEB3B',
      'html': '#FF5722',
      'css': '#2196F3',
      'aws': '#FF9800',
      'azure': '#2196F3',
      'gcp': '#4CAF50',
      'web development': '#26A69A',
    };
    return categoryColors[normalizedName] || '#9E9E9E';
  }
}

export default new PrepService();