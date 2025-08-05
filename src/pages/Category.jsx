import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrepData } from '../hooks/usePrepData';
import TopicItem from '../components/topic/TopicItem';
import ModeSelector from '../components/modals/ModeSelector';

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loadAllTopicsForCategory, loadProgressData } = usePrepData();
  const [topicsData, setTopicsData] = useState({
    subcategories: [],
    topicsBySubcategory: {}
  });
  const [progressData, setProgressData] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Get topic from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const preSelectedTopic = searchParams.get('topic');
  const preSelectedSubcategory = searchParams.get('subcategory');

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  const loadCategoryData = async () => {
    if (!categoryId) return;

    setLoading(true);
    try {
      const decodedCategoryId = decodeURIComponent(categoryId);
      console.log(`🌐 [CATEGORY_PAGE] Loading category data for: ${decodedCategoryId}`);
      
      // Load topics data
      console.log(`🔍 [CATEGORY_PAGE] Calling loadAllTopicsForCategory for: ${decodedCategoryId}`);
      const { subcategories, topicsBySubcategory } = await loadAllTopicsForCategory(decodedCategoryId);
      console.log(`📊 [CATEGORY_PAGE] Received data:`, { subcategories, topicsBySubcategory });
      
      setTopicsData({ subcategories, topicsBySubcategory });

      // Generate topic IDs for progress tracking
      const allTopicIds = [];
      Object.keys(topicsBySubcategory).forEach(subcategory => {
        const topics = topicsBySubcategory[subcategory] || [];
        topics.forEach(topic => {
          const topicId = `${decodedCategoryId}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
          allTopicIds.push(topicId);
        });
      });

      console.log(`🔄 [CATEGORY_PAGE] Generated ${allTopicIds.length} topic IDs for progress tracking`);
      console.log(`📝 [CATEGORY_PAGE] Sample topic IDs:`, allTopicIds.slice(0, 5));

      // Load progress data
      console.log(`🔍 [CATEGORY_PAGE] Loading progress data for ${allTopicIds.length} topics`);
      const progress = await loadProgressData(allTopicIds);
      console.log(`📊 [CATEGORY_PAGE] Progress data loaded:`, progress);
      setProgressData(progress);

      // Handle pre-selected subcategory from URL (from home page cards)
      if (preSelectedSubcategory) {
        console.log(`🎯 [CATEGORY_PAGE] Pre-selected subcategory from URL: ${preSelectedSubcategory}`);
        const decodedSubcategory = decodeURIComponent(preSelectedSubcategory);
        
        // Check if the subcategory exists in the loaded data
        if (subcategories.includes(decodedSubcategory)) {
          console.log(`✅ [CATEGORY_PAGE] Found subcategory in data: ${decodedSubcategory}`);
          // Expand the pre-selected subcategory
          setExpandedSubcategories({ [decodedSubcategory]: true });
        } else {
          console.log(`⚠️ [CATEGORY_PAGE] Pre-selected subcategory not found, expanding first subcategory`);
          // Fallback to first subcategory
          if (subcategories.length > 0) {
            setExpandedSubcategories({ [subcategories[0]]: true });
          }
        }
      }
      // Handle pre-selected topic from URL (legacy support)
      else if (preSelectedTopic) {
        console.log(`🎯 [CATEGORY_PAGE] Pre-selected topic from URL: ${preSelectedTopic}`);
        const decodedTopic = decodeURIComponent(preSelectedTopic);
        
        // Find which subcategory contains this topic
        let foundSubcategory = null;
        Object.keys(topicsBySubcategory).forEach(subcategory => {
          const topics = topicsBySubcategory[subcategory] || [];
          if (topics.includes(decodedTopic)) {
            foundSubcategory = subcategory;
          }
        });

        if (foundSubcategory) {
          console.log(`✅ [CATEGORY_PAGE] Found topic in subcategory: ${foundSubcategory}`);
          // Expand the subcategory containing the pre-selected topic
          setExpandedSubcategories({ [foundSubcategory]: true });
        } else {
          console.log(`⚠️ [CATEGORY_PAGE] Pre-selected topic not found, expanding first subcategory`);
          // Fallback to first subcategory
          if (subcategories.length > 0) {
            setExpandedSubcategories({ [subcategories[0]]: true });
          }
        }
      } else {
        // No pre-selected topic/subcategory, expand first subcategory by default
        if (subcategories.length > 0) {
          console.log(`📂 [CATEGORY_PAGE] Expanding first subcategory: ${subcategories[0]}`);
          setExpandedSubcategories({ [subcategories[0]]: true });
        }
      }

    } catch (error) {
      console.error(`❌ [CATEGORY_PAGE] Error loading category data:`, error);
      // Fallback to mock data
      console.log(`🔄 [CATEGORY_PAGE] Using fallback mock data`);
      const mockData = getMockCategoryData(decodedCategoryId);
      setTopicsData(mockData);
      setProgressData(getMockProgressData(mockData, decodedCategoryId));
    } finally {
      setLoading(false);
      console.log(`✅ [CATEGORY_PAGE] Category data loading completed`);
    }
  };

  const getMockCategoryData = (categoryId) => {
    const mockSubcategories = {
      'Programming Language': ['Python', 'Java', 'C++', 'JavaScript', 'C#'],
      'Web Development': ['HTML/CSS', 'JavaScript', 'React', 'Vue.js', 'Angular'],
      'Cloud Computing': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
      'General Skills': ['Communication', 'Leadership', 'Problem Solving', 'Time Management', 'Teamwork'],
      'App Development': ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Xamarin']
    };

    const subcategories = mockSubcategories[categoryId] || ['Fundamentals', 'Intermediate', 'Advanced'];
    const topicsBySubcategory = {};

    subcategories.forEach(subcategory => {
      topicsBySubcategory[subcategory] = [
        `${subcategory} Basics`,
        `${subcategory} Fundamentals`,
        `${subcategory} Advanced Concepts`,
        `${subcategory} Best Practices`,
        `${subcategory} Real-world Applications`
      ];
    });

    return { subcategories, topicsBySubcategory };
  };

  const getMockProgressData = (topicsData, categoryId) => {
    const progressData = {};
    
    Object.keys(topicsData.topicsBySubcategory).forEach(subcategory => {
      const topics = topicsData.topicsBySubcategory[subcategory] || [];
      topics.forEach(topic => {
        const topicId = `${categoryId}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
        progressData[topicId] = {
          progress: Math.random() * 100,
          bestScore: Math.floor(Math.random() * 100),
          totalAttempts: Math.floor(Math.random() * 50),
          lastAttempted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        };
      });
    });

    return progressData;
  };

  const handleSubcategoryToggle = (subcategory) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategory]: !prev[subcategory]
    }));
  };

  const handleTopicClick = (subcategory, topic) => {
    setSelectedTopic({ subcategory, topic });
    setShowModeSelector(true);
  };

  const getTopicProgress = (subcategory, topic) => {
    const topicId = `${decodeURIComponent(categoryId)}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
    return progressData[topicId]?.progress || 0;
  };

  const getTopicBestScore = (subcategory, topic) => {
    const topicId = `${decodeURIComponent(categoryId)}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
    return progressData[topicId]?.bestScore || 0;
  };

  const getTopicAttemptCount = (subcategory, topic) => {
    const topicId = `${decodeURIComponent(categoryId)}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
    return progressData[topicId]?.totalAttempts || 0;
  };

  const getTopicLastAttempted = (subcategory, topic) => {
    const topicId = `${decodeURIComponent(categoryId)}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
    return progressData[topicId]?.lastAttempted || null;
  };

  const getCategoryIcon = () => {
    const category = decodeURIComponent(categoryId);
    switch (category) {
      case 'Programming Language':
        return '💻';
      case 'Web Development':
        return '🌐';
      case 'Cloud Computing':
        return '☁️';
      case 'General Skills':
        return '🎯';
      case 'App Development':
        return '📱';
      default:
        return '📚';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-gray-700 hover:bg-white transition-all duration-300 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="px-6 pt-20 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getCategoryIcon()}</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {decodeURIComponent(categoryId)}
                  </h1>
                  <p className="text-gray-600">
                    {topicsData.subcategories.length} subcategories • {Object.values(topicsData.topicsBySubcategory).flat().length} topics
                  </p>
                </div>
              </div>
            </div>

            {/* Topics List */}
            <div className="space-y-4">
              {topicsData.subcategories.map((subcategory, index) => {
                const topics = topicsData.topicsBySubcategory[subcategory] || [];
                const isExpanded = expandedSubcategories[subcategory];

                return (
                  <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => handleSubcategoryToggle(subcategory)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {subcategory}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {topics.length} topics available
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="text-purple-600" size={24} />
                          ) : (
                            <ChevronDown className="text-gray-400" size={24} />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-gray-50/50">
                        <div className="p-6 space-y-3">
                          {topics.map((topic, topicIndex) => (
                            <TopicItem
                              key={topicIndex}
                              topic={topic}
                              subcategory={subcategory}
                              progress={getTopicProgress(subcategory, topic)}
                              bestScore={getTopicBestScore(subcategory, topic)}
                              attemptCount={getTopicAttemptCount(subcategory, topic)}
                              lastAttempted={getTopicLastAttempted(subcategory, topic)}
                              onClick={() => handleTopicClick(subcategory, topic)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {topicsData.subcategories.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics available</h3>
                <p className="text-gray-600">Topics for this category are not yet available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTopic && (
        <ModeSelector
          isOpen={showModeSelector}
          onClose={() => setShowModeSelector(false)}
          topicName={selectedTopic.topic}
          subcategoryName={selectedTopic.subcategory}
          type="programming"
        />
      )}
    </div>
  );
};

export default Category; 