import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FirebaseRealtimeService from '../services/FirebaseRealtimeService';

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user?.firebaseUid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const progress = await FirebaseRealtimeService.getProgressData(user.firebaseUid);
        setProgressData(progress || {});
      } catch (err) {
        console.error('Error fetching user progress:', err);
        setError(err.message);
        setProgressData({});
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user?.firebaseUid]);

  // Convert progress data to ongoing programs format
  const getOngoingPrograms = () => {
    if (!progressData || Object.keys(progressData).length === 0) {
      return [];
    }

    return Object.entries(progressData)
      .map(([topicId, data]) => {
        // Parse topic ID to extract category and topic info
        const parts = topicId.split('_');
        if (parts.length >= 3) {
          const category = parts[0];
          const subcategory = parts[1];
          const topic = parts[2];

          return {
            id: topicId,
            title: data.title || topic.replace(/([A-Z])/g, ' $1').trim(),
            category: category.replace(/([A-Z])/g, ' $1').trim(),
            subcategory: subcategory.replace(/([A-Z])/g, ' $1').trim(),
            progress: data.progress || 0,
            lastUpdated: data.lastUpdated || Date.now(),
            difficulty: data.difficulty || 'Beginner',
            bestScore: data.bestScore || 0,
            ...data
          };
        }
        return null;
      })
      .filter(Boolean)
      .filter(program => program.progress > 0 && program.progress < 100) // Only show ongoing programs
      .sort((a, b) => b.lastUpdated - a.lastUpdated); // Sort by most recently updated
  };

  return {
    progressData,
    ongoingPrograms: getOngoingPrograms(),
    loading,
    error,
    refetch: () => {
      if (user?.firebaseUid) {
        fetchProgressData();
      }
    }
  };
};