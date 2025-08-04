// src/services/firebasePrepService.js - Updated with Auth Check
import { 
  doc, 
  getDoc, 
  collection,
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
      const testRef = doc(db, 'prep', 'Title');
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
      console.log('🔄 Loading category titles from /prep/Title');
      
      // Ensure user is authenticated
      await this.waitForAuth();
      
      const titlesRef = doc(db, 'prep', 'Title');
      console.log('Document reference created:', titlesRef.path);
      console.log('Authenticated user:', auth.currentUser?.uid);
      
      const docSnapshot = await getDoc(titlesRef);
      console.log('Document snapshot retrieved. Exists:', docSnapshot.exists());
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log('Raw document data:', data);
        
        if (data && data['Title'] && Array.isArray(data['Title'])) {
          const titles = data['Title'];
          console.log('✅ Category titles found:', titles);
          
          this.setCacheItem(cacheKey, titles);
          return titles;
        } else {
          console.warn('⚠️ Document exists but Title field is missing or not an array');
          console.log('Available fields:', Object.keys(data || {}));
          return [];
        }
      } else {
        console.warn('⚠️ /prep/Title document does not exist');
        return [];
      }
      
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
      console.log('🔄 Loading display titles from /prep/TitleDisplay');
      
      // Ensure user is authenticated
      await this.waitForAuth();
      
      const displayDoc = await getDoc(doc(db, 'prep', 'TitleDisplay'));
      console.log('TitleDisplay document exists:', displayDoc.exists());
      
      if (displayDoc.exists()) {
        const data = displayDoc.data();
        console.log('TitleDisplay raw data:', data);
        
        const titles = {};
        
        for (const [key, value] of Object.entries(data || {})) {
          if (typeof value === 'string') {
            titles[key] = value;
          } else {
            titles[key] = key;
          }
        }
        
        console.log('✅ Display titles processed:', titles);
        
        this.setCacheItem(cacheKey, titles);
        return titles;
      } else {
        console.warn('⚠️ /prep/TitleDisplay document does not exist');
        return {};
      }
      
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
      
      const categoryItemsRef = doc(db, 'prep', 'Title', categoryId, categoryId);
      console.log('Category items path:', categoryItemsRef.path);
      
      const docSnapshot = await getDoc(categoryItemsRef);
      console.log(`${categoryId} document exists:`, docSnapshot.exists());
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log(`${categoryId} raw document data:`, data);
        
        if (data && data[categoryId] && Array.isArray(data[categoryId])) {
          const rawItems = data[categoryId];
          console.log(`Raw items for ${categoryId}:`, rawItems);
          
          const formattedItems = [];
          
          for (const item of rawItems) {
            let itemName;
            let formattedItem;
            
            if (typeof item === 'object' && item !== null) {
              formattedItem = { ...item };
              itemName = formattedItem['name'] || Object.keys(formattedItem)[0]?.toString() || 'Unknown';
            } else if (typeof item === 'string') {
              itemName = item;
              formattedItem = { 'name': itemName };
            } else {
              itemName = item?.toString() || 'Unknown';
              formattedItem = { 'name': itemName };
            }
            
            formattedItem['iconAsset'] = this.getAssetForTopic(itemName);
            formattedItem['color'] = this.getColorForTopic(itemName);
            
            if (!formattedItem['name']) {
              formattedItem['name'] = itemName;
            }
            
            formattedItems.push(formattedItem);
          }
          
          console.log(`✅ Formatted items for ${categoryId}:`, formattedItems);
          
          this.setCacheItem(cacheKey, formattedItems);
          return formattedItems;
        } else {
          console.warn(`⚠️ Document exists but ${categoryId} field is missing or not an array`);
          console.log('Available fields:', Object.keys(data || {}));
          return [];
        }
      } else {
        console.warn(`⚠️ Document /prep/Title/${categoryId}/${categoryId} does not exist`);
        return [];
      }
      
    } catch (e) {
      console.error(`❌ Error loading items for ${categoryId}:`, e);
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

  // Helper methods (same as before)
  getAssetForTopic(topicName) {
    const normalizedName = topicName.toLowerCase().trim();
    
    const topicAssetMap = {
      'c': '/assets/programming/c.png',
      'c++': '/assets/programming/cpp.png',
      'cpp': '/assets/programming/cpp.png',
      'java': '/assets/programming/java.png',
      'python': '/assets/programming/python.png',
      'kotlin': '/assets/programming/kotlin.png',
      'swift': '/assets/programming/swift.png',
      'flutter': '/assets/programming/flutter.png',
      'react': '/assets/programming/react.png',
      'react native': '/assets/programming/react.png',
      'web development': '/assets/programming/web_development.png',
      'web': '/assets/programming/web_development.png',
      'aws': '/assets/programming/aws.png',
      'javascript': '/assets/programming/javascript.png',
      'js': '/assets/programming/javascript.png',
      'html': '/assets/programming/html.png',
      'css': '/assets/programming/css.png',
    };
    
    return topicAssetMap[normalizedName] || '/assets/programming/default.png';
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
      'web development': '#26A69A',
      'aws': '#FF9800',
      'javascript': '#F7DF1E',
      'html': '#E34F26',
      'css': '#1572B6',
    };
    
    return categoryColors[normalizedName] || '#366D9C';
  }

  clearCache() {
    this.cache.clear();
  }
}

export const firebasePrepService = new FirebasePrepService();
export default firebasePrepService;