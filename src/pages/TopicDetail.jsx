import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, PlayCircle, TrendingUp, Award, Clock } from 'lucide-react';
import ModeSelector from '../components/modals/ModeSelectionModal';
import { usePrepData } from '../hooks/usePrepData';
import TopicItem from '../components/topic/TopicItem';

const TopicDetail = () => {
  const { categoryId, subcategoryName, topicName } = useParams();
  const navigate = useNavigate();
  const { loadAllTopicsForCategory, loadProgressData } = usePrepData();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [topicsBySubcategory, setTopicsBySubcategory] = useState({});
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    loadTopicsData();
  }, [categoryId, subcategoryName, topicName]);

  const loadTopicsData = async () => {
    setIsLoading(true);
    try {
      const decodedCategoryId = decodeURIComponent(categoryId);
      const decodedTopicName = decodeURIComponent(topicName);
      
      console.log(`Loading topics for: ${decodedCategoryId} - ${decodedTopicName}`);
      
      const { subcategories, topicsBySubcategory } = await loadAllTopicsForCategory(decodedCategoryId);
      
      setSubcategories(subcategories);
      setTopicsBySubcategory(topicsBySubcategory);

      const allTopicIds = [];
      Object.keys(topicsBySubcategory).forEach(subcategory => {
        const topics = topicsBySubcategory[subcategory] || [];
        topics.forEach(topic => {
          const topicId = `${decodedCategoryId}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
          allTopicIds.push(topicId);
        });
      });

      const progressData = await loadProgressData(allTopicIds);
      setProgressData(progressData);

      if (subcategoryName) {
        setExpandedSubcategories(prev => ({
          ...prev,
          [decodeURIComponent(subcategoryName)]: true
        }));
      }
      
    } catch (error) {
      console.error('Error loading topics data:', error);
      
      const mockSubcategories = getMockSubcategories();
      setSubcategories(mockSubcategories);

      const mockTopicsData = {};
      const mockProgressData = {};
      
      for (const subcategory of mockSubcategories) {
        const topics = getMockTopics(subcategory);
        mockTopicsData[subcategory] = topics;
        
        topics.forEach(topic => {
          const topicId = `${categoryId}_${subcategory}_${topic}`.toLowerCase().replace(/\s+/g, '');
          mockProgressData[topicId] = {
            progress: Math.random() * 100,
            bestScore: Math.floor(Math.random() * 100),
            totalAttempts: Math.floor(Math.random() * 50),
            lastAttempted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          };
        });
      }
      
      setTopicsBySubcategory(mockTopicsData);
      setProgressData(mockProgressData);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockSubcategories = () => {
    const category = decodeURIComponent(categoryId);
    const technology = decodeURIComponent(topicName);

    if (category === 'App Development' && technology === 'Flutter') {
      return ['Flutter Basics', 'Widgets & UI', 'State Management', 'Navigation', 'Networking', 'Advanced Topics'];
    } else if (category === 'Web Development' && technology === 'React') {
      return ['React Fundamentals', 'Components & Props', 'State & Hooks', 'Routing', 'Forms & Validation', 'Advanced Patterns'];
    } else if (category === 'Programming Language' && technology === 'Python') {
      return ['Python Basics', 'Data Types', 'Control Flow', 'Functions', 'OOP', 'Libraries & Modules'];
    } else if (category === 'Database' && technology === 'MongoDB') {
      return ['MongoDB Basics', 'CRUD Operations', 'Aggregation', 'Indexing', 'Schema Design', 'Performance'];
    }
    
    return ['Fundamentals', 'Intermediate', 'Advanced'];
  };

  const getMockTopics = (subcategory) => {
    const topicsMap = {
      'Flutter Basics': [
        'Introduction to Flutter',
        'Dart Programming',
        'Flutter Architecture',
        'Development Environment Setup',
        'First Flutter App'
      ],
      'Widgets & UI': [
        'Stateless vs Stateful Widgets',
        'Layout Widgets',
        'Material Design Components',
        'Custom Widgets',
        'Responsive Design'
      ],
      'State Management': [
        'setState',
        'Provider Pattern',
        'Bloc Pattern',
        'Riverpod',
        'GetX'
      ],
      'Navigation': [
        'Basic Navigation',
        'Named Routes',
        'Route Generation',
        'Deep Linking',
        'Navigation 2.0'
      ],
      'Networking': [
        'HTTP Requests',
        'REST APIs',
        'JSON Parsing',
        'Error Handling',
        'Caching Strategies'
      ],
      'Advanced Topics': [
        'Custom Animations',
        'Platform Channels',
        'Performance Optimization',
        'Testing',
        'Deployment'
      ]
    };

    return topicsMap[subcategory] || [
      'Topic 1',
      'Topic 2', 
      'Topic 3',
      'Topic 4',
      'Topic 5'
    ];
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
    switch (categoryId) {
      case 'Programming Language':
        return '💻';
      case 'Web Development':
        return '🌐';
      case 'App Development':
        return '📱';
      case 'Database':
        return '🗄️';
      default:
        return '📚';
    }
  };

  const calculateOverallProgress = () => {
    let totalProgress = 0;
    let totalTopics = 0;

    Object.keys(topicsBySubcategory).forEach(subcategory => {
      const topics = topicsBySubcategory[subcategory] || [];
      topics.forEach(topic => {
        totalProgress += getTopicProgress(subcategory, topic);
        totalTopics++;
      });
    });

    return totalTopics > 0 ? totalProgress / totalTopics : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-gray-700 hover:bg-white transition-all duration-300 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="px-6 pt-20 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{getCategoryIcon()}</div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {decodeURIComponent(topicName)}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {decodeURIComponent(categoryId)}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round(overallProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-full ${overallProgress < 30 ? 'bg-red-400' : overallProgress < 70 ? 'bg-yellow-400' : 'bg-green-400'} rounded-full transition-all duration-300`}
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{subcategories.length}</div>
                      <div className="text-gray-600 text-sm">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {subcategories.map((subcategory, index) => {
                const topics = topicsBySubcategory[subcategory] || [];
                const isExpanded = expandedSubcategories[subcategory];
                const subcategoryProgress = topics.reduce((sum, topic) => 
                  sum + getTopicProgress(subcategory, topic), 0) / (topics.length || 1);

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
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600 text-sm">
                              {topics.length} topics
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-full ${subcategoryProgress < 30 ? 'bg-red-400' : subcategoryProgress < 70 ? 'bg-yellow-400' : 'bg-green-400'} rounded-full transition-all duration-300`}
                                  style={{ width: `${subcategoryProgress}%` }}
                                />
                              </div>
                              <span className={`text-sm font-medium ${subcategoryProgress < 30 ? 'text-red-600' : subcategoryProgress < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {Math.round(subcategoryProgress)}%
                              </span>
                            </div>
                          </div>
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

            {subcategories.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No topics available</h3>
                <p className="text-gray-600">Topics for this technology are not yet available.</p>
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

export default TopicDetail;