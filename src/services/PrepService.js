import FirebaseService from './firebaseService';

class PrepService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async loadAllPrepData() {
    try {
      const cacheKey = 'allPrepData';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const categoryTitles = await FirebaseService.loadCategoryTitles();
      const displayTitles = await FirebaseService.loadDisplayTitles();
      
      const categoryItems = {};
      const totalCategories = Object.keys(categoryTitles).length;
      let totalItems = 0;

      // Load items for each category
      for (const category of Object.keys(categoryTitles)) {
        try {
          const items = await FirebaseService.loadCategoryItems(category);
          categoryItems[category] = items || [];
          totalItems += (items || []).length;
        } catch (error) {
          console.error(`Error loading items for category ${category}:`, error);
          categoryItems[category] = [];
        }
      }

      const data = {
        categoryTitles: Object.keys(categoryTitles),
        displayTitles,
        categoryItems,
        totalCategories,
        totalItems,
        lastUpdated: new Date().toISOString(),
        error: null
      };

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error loading all prep data:', error);
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

  async loadCategoryItems(categoryId) {
    try {
      const cacheKey = `categoryItems_${categoryId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const items = await FirebaseService.loadCategoryItems(categoryId);
      this.setCachedData(cacheKey, items);
      return items;
    } catch (error) {
      console.error(`Error loading category items for ${categoryId}:`, error);
      return [];
    }
  }

  async loadSubcategoryTopics(categoryId, subcategory) {
    try {
      const cacheKey = `topics_${categoryId}_${subcategory}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const topics = await FirebaseService.loadSubcategoryTopics(categoryId, subcategory);
      this.setCachedData(cacheKey, topics);
      return topics;
    } catch (error) {
      console.error(`Error loading topics for ${subcategory}:`, error);
      return [];
    }
  }

  async loadAllTopicsForCategory(categoryId) {
    try {
      const cacheKey = `allTopics_${categoryId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const data = await FirebaseService.loadAllTopicsForCategory(categoryId);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading all topics for ${categoryId}:`, error);
      return {
        subcategories: [],
        topicsBySubcategory: {}
      };
    }
  }

  async loadProgressData(topicIds) {
    try {
      const progressData = await FirebaseService.getProgressData(topicIds);
      return progressData;
    } catch (error) {
      console.error('Error loading progress data:', error);
      return {};
    }
  }

  async updateTopicProgress(categoryId, subcategory, topic, progressData) {
    try {
      const topicId = FirebaseService.generateTopicProgressId(categoryId, subcategory, topic);
      const result = await FirebaseService.updateTopicProgress(topicId, progressData);
      return result;
    } catch (error) {
      console.error('Error updating topic progress:', error);
      return { success: false, error: error.message };
    }
  }

  async getTopicProgress(categoryId, subcategory, topic) {
    try {
      const topicId = FirebaseService.generateTopicProgressId(categoryId, subcategory, topic);
      const progressData = await FirebaseService.getProgressData([topicId]);
      return progressData[topicId] || null;
    } catch (error) {
      console.error('Error getting topic progress:', error);
      return null;
    }
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Helper methods for asset and color mapping
  getAssetForTopic(topic) {
    return FirebaseService.getAssetForTopic(topic);
  }

  getColorForTopic(topic) {
    return FirebaseService.getColorForTopic(topic);
  }

  // New method to replicate Flutter logic
  async loadAllTopicsFromTitle() {
    try {
      const cacheKey = 'allTopicsFromTitle';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const categoryItems = await FirebaseService.loadAllTopicsFromTitle();
      this.setCachedData(cacheKey, categoryItems);
      return categoryItems;
    } catch (error) {
      console.error('Error loading topics from title:', error);
      return {};
    }
  }
}

export default new PrepService();