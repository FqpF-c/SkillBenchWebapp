import { useState, useEffect, useCallback } from 'react';
import PrepService from '../services/PrepService';
import { useAuth } from '../context/AuthContext';

export const usePrepData = () => {
  const [prepData, setPrepData] = useState({
    categoryTitles: [],
    displayTitles: {},
    categoryItems: {},
    totalCategories: 0,
    totalItems: 0,
    lastUpdated: null,
    error: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load all prep data
  const loadAllPrepData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PrepService.loadAllPrepData();
      setPrepData(data);
    } catch (err) {
      setError(err.message);
      setPrepData({
        categoryTitles: [],
        displayTitles: {},
        categoryItems: {},
        totalCategories: 0,
        totalItems: 0,
        lastUpdated: new Date().toISOString(),
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load category items
  const loadCategoryItems = useCallback(async (categoryId) => {
    try {
      const items = await PrepService.loadCategoryItems(categoryId);
      return items;
    } catch (err) {
      return [];
    }
  }, []);

  // Load subcategory topics
  const loadSubcategoryTopics = useCallback(async (categoryId, subcategory) => {
    try {
      const topics = await PrepService.loadSubcategoryTopics(categoryId, subcategory);
      return topics;
    } catch (err) {
      return [];
    }
  }, []);

  // Load all topics for a category
  const loadAllTopicsForCategory = useCallback(async (categoryId) => {
    try {
      const data = await PrepService.loadAllTopicsForCategory(categoryId);
      return data;
    } catch (err) {
      return {
        subcategories: [],
        topicsBySubcategory: {}
      };
    }
  }, []);

  // Load all topics from title (replicates Flutter logic)
  const loadAllTopicsFromTitle = useCallback(async () => {
    try {
      const data = await PrepService.loadAllTopicsFromTitle();
      return data;
    } catch (err) {
      return {};
    }
  }, []);

  // Load progress data
  const loadProgressData = useCallback(async (topicIds) => {
    try {
      const progressData = await PrepService.loadProgressData(topicIds);
      return progressData;
    } catch (err) {
      return {};
    }
  }, []);

  // Update topic progress
  const updateTopicProgress = useCallback(async (categoryId, subcategory, topic, progressData) => {
    try {
      const result = await PrepService.updateTopicProgress(categoryId, subcategory, topic, progressData);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Get topic progress
  const getTopicProgress = useCallback(async (categoryId, subcategory, topic) => {
    try {
      const progress = await PrepService.getTopicProgress(categoryId, subcategory, topic);
      return progress;
    } catch (err) {
      return null;
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    PrepService.clearCache();
    return loadAllPrepData();
  }, [loadAllPrepData]);

  // Load data on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadAllPrepData();
    } else {
      setLoading(false);
      setPrepData({
        categoryTitles: [],
        displayTitles: {},
        categoryItems: {},
        totalCategories: 0,
        totalItems: 0,
        lastUpdated: null,
        error: 'Not authenticated'
      });
    }
  }, [isAuthenticated, loadAllPrepData]);

  return {
    prepData,
    loading,
    error,
    loadAllPrepData,
    loadCategoryItems,
    loadSubcategoryTopics,
    loadAllTopicsForCategory,
    loadAllTopicsFromTitle,
    loadProgressData,
    updateTopicProgress,
    getTopicProgress,
    refreshData
  };
}; 