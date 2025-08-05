// src/services/firebasePrepService.js - Updated with new structure
import { 
  doc, 
  getDoc, 
  collection,
  getDocs 
} from 'firebase/firestore';
import { auth, db, DB_PATHS } from '../config/firebase';
import FirestoreService from './FirestoreService';

class FirebasePrepService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Wait for authentication
  async waitForAuth(maxWaitTime = 10000) {
    return new Promise((resolve, reject) => {
      // If already authenticated, resolve immediately
      if (auth.currentUser) {
        console.log('✅ Already authenticated:', auth.currentUser.uid);
        resolve(auth.currentUser);
        return;
      }

      console.log('⏳ Waiting for authentication...');
      
      let timeoutId;
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          console.log('✅ Authentication complete:', user.uid);
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(user);
        }
      });

      // Set timeout
      timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Authentication timeout - user not signed in within 10 seconds'));
      }, maxWaitTime);
    });
  }

  // Test Firebase connection with auth
  async testConnection() {
    try {
      console.log('🔥 Testing Firebase connection...');
      
      // Wait for authentication first
      await this.waitForAuth();
      
      console.log('Database instance:', db);
      console.log('Current user:', auth.currentUser?.uid);
      
      // Try to read a document from prep collection
      const testRef = doc(db, DB_PATHS.PREP_TITLE, 'Title');
      const testSnap = await getDoc(testRef);
      
      console.log('✅ Firebase connection successful');
      console.log('Prep/Title document exists:', testSnap.exists());
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Current user:', auth.currentUser?.uid || 'No user');
      return false;
    }
  }

  // Cache management
  setCacheItem(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCacheItem(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // Enhanced loadCategoryTitles with auth check
  async loadCategoryTitles() {
    const cacheKey = 'category_titles';
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log('📦 Using cached category titles:', cached);
      return cached;
    }

    try {
      console.log('🔄 Loading category titles from FirestoreService');
      
      // Ensure user is authenticated
      await this.waitForAuth();
      
      const titles = await FirestoreService.loadCategoryTitles();
      console.log('✅ Category titles found:', titles);
      
      this.setCacheItem(cacheKey, titles);
      return titles;
      
    } catch (e) {
      console.error('❌ Error loading category titles:', e);
      console.error('Current user when error occurred:', auth.currentUser?.uid || 'No user');
      return [];
    }
  }

  // Enhanced loadDisplayTitles with auth check
  async loadDisplayTitles() {
    const cacheKey = 'display_titles';
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log('📦 Using cached display titles:', cached);
      return cached;
    }

    try {
      console.log('🔄 Loading display titles from FirestoreService');
      
      // Ensure user is authenticated
      await this.waitForAuth();
      
      const titles = await FirestoreService.loadDisplayTitles();
      console.log('✅ Display titles processed:', titles);
      
      this.setCacheItem(cacheKey, titles);
      return titles;
      
    } catch (e) {
      console.error('❌ Error loading display titles:', e);
      return {};
    }
  }

  // Enhanced loadCategoryItems with auth check
  async loadCategoryItems(categoryId) {
    const cacheKey = `category_items_${categoryId}`;
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log(`📦 Using cached items for ${categoryId}:`, cached);
      return cached;
    }

    try {
      console.log(`🔄 Loading items for category: ${categoryId}`);
      
      // Ensure user is authenticated
      await this.waitForAuth();
      
      const items = await FirestoreService.loadCategoryItems(categoryId);
      console.log(`✅ Formatted items for ${categoryId}:`, items);
      
      this.setCacheItem(cacheKey, items);
      return items;
      
    } catch (e) {
      console.error(`❌ Error loading items for ${categoryId}:`, e);
      return [];
    }
  }

  // Load topics for a specific subcategory
  async loadSubcategoryTopics(categoryId, subcategory) {
    const cacheKey = `subcategory_topics_${categoryId}_${subcategory}`;
    const cached = this.getCacheItem(cacheKey);
    if (cached) {
      console.log(`📦 Using cached topics for ${subcategory}:`, cached);
      return cached;
    }

    try {
      console.log(`🔄 Loading topics for subcategory: ${subcategory}`);
      
      // Ensure user is authenticated
      await this.waitForAuth();
      
      const topics = await FirestoreService.loadSubcategoryTopics(categoryId, subcategory);
      console.log(`✅ Topics for ${subcategory}:`, topics);
      
      this.setCacheItem(cacheKey, topics);
      return topics;
      
    } catch (e) {
      console.error(`❌ Error loading topics for ${subcategory}:`, e);
      return [];
    }
  }

  // Main method with authentication check
  async loadAllPrepData() {
    try {
      console.log('🚀 Starting to load all prep data...');
      
      // Wait for authentication first
      await this.waitForAuth();
      console.log('🔐 Authentication confirmed, proceeding with data load...');
      
      // Test connection with auth
      const connectionOk = await this.testConnection();
      if (!connectionOk) {
        throw new Error('Firebase connection test failed even with authentication');
      }
      
      // Load category titles
      const categoryTitles = await this.loadCategoryTitles();
      console.log('Category titles loaded:', categoryTitles);
      
      if (categoryTitles.length === 0) {
        console.warn('⚠️ No category titles found even with authentication');
        return {
          categoryTitles: [],
          displayTitles: {},
          categoryItems: {},
          totalCategories: 0,
          totalItems: 0,
          lastUpdated: new Date().toISOString(),
          error: 'No category titles found in Firebase'
        };
      }
      
      // Load display titles
      const displayTitles = await this.loadDisplayTitles();
      console.log('Display titles loaded:', displayTitles);
      
      // Load items for each category
      const categoryItems = {};
      
      for (const categoryId of categoryTitles) {
        console.log(`Loading items for category: ${categoryId}`);
        const items = await this.loadCategoryItems(categoryId);
        if (items.length > 0) {
          categoryItems[categoryId] = items;
        }
      }
      
      // Build the complete structure
      const result = {
        categoryTitles,
        displayTitles,
        categoryItems,
        totalCategories: categoryTitles.length,
        totalItems: Object.values(categoryItems).reduce((sum, items) => sum + items.length, 0),
        lastUpdated: new Date().toISOString()
      };
      
      console.log('🎉 All prep data loaded successfully with authentication:', result);
      return result;
      
    } catch (error) {
      console.error('💥 Critical error loading prep data:', error);
      
      return {
        categoryTitles: [],
        displayTitles: {},
        categoryItems: {},
        totalCategories: 0,
        totalItems: 0,
        lastUpdated: new Date().toISOString(),
        error: error.message
      };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const firebasePrepService = new FirebasePrepService();
export default firebasePrepService;