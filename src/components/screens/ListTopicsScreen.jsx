import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  BookOpen, 
  Star,
  Target,
  Clock
} from 'lucide-react';
import ModeSelectionModal from '../modals/ModeSelector';

const ListTopicsScreen = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const categoryName = location.state?.categoryName || categoryId;
  const initialExpandedTopic = location.state?.initialExpandedTopic;
  const categoryIcon = location.state?.categoryIcon || '🌐';

  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [topicsBySubcategory, setTopicsBySubcategory] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [progressCache, setProgressCache] = useState({});
  const [bestScoreCache, setBestScoreCache] = useState({});
  const [subcategoryProgressCache, setSubcategoryProgressCache] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModeSelection, setShowModeSelection] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await loadSubcategoriesAndTopics();
      await loadProgressData();
    } catch (error) {
      console.error('Error loading list topics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubcategoriesAndTopics = async () => {
    try {
      console.log(`Loading subcategories for ${categoryId}`);
      
      const snapshot = await getDoc(doc(db, 'prep', 'Title', categoryId, categoryId));
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log(`${categoryId} subcategories data:`, data);
        
        if (data && data[categoryId] && Array.isArray(data[categoryId])) {
          const items = data[categoryId];
          const subcats = items.map(item => {
            if (typeof item === 'object' && item !== null) {
              return item.name || Object.keys(item)[0] || 'Unknown';
            } else if (typeof item === 'string') {
              return item;
            }
            return 'Unknown';
          });
          
          setSubcategories(subcats);
          console.log('Loaded subcategories:', subcats);
          
          const expandedState = {};
          const topicsData = {};
          
          for (const subcategory of subcats) {
            expandedState[subcategory] = subcategory === initialExpandedTopic;
            
            try {
              const topicsSnapshot = await getDoc(
                doc(db, 'prep', 'Title', categoryId, categoryId, subcategory, 'Topics')
              );
              
              if (topicsSnapshot.exists()) {
                const topicsData_raw = topicsSnapshot.data();
                if (topicsData_raw && topicsData_raw.Topics && Array.isArray(topicsData_raw.Topics)) {
                  topicsData[subcategory] = topicsData_raw.Topics.map(topic => topic.toString());
                  console.log(`Topics for ${subcategory}:`, topicsData[subcategory]);
                } else {
                  topicsData[subcategory] = [];
                }
              } else {
                topicsData[subcategory] = [];
              }
            } catch (error) {
              console.error(`Error loading topics for ${subcategory}:`, error);
              topicsData[subcategory] = [];
            }
          }
          
          setExpandedSubcategories(expandedState);
          setTopicsBySubcategory(topicsData);
        }
      }
    } catch (error) {
      console.error(`Error loading subcategories for ${categoryId}:`, error);
    }
  };

  const loadProgressData = async () => {
    const progress = {};
    const scores = {};
    const subcatProgress = {};
    
    let totalProgress = 0;
    let totalTopics = 0;
    let maxScore = 0;
    
    for (const subcategory of subcategories) {
      const topics = topicsBySubcategory[subcategory] || [];
      let subcatTotal = 0;
      let subcatCount = 0;
      
      for (const topic of topics) {
        const topicId = generateTopicProgressId(subcategory, topic);
        const topicProgress = getTopicProgressFromStorage(topicId);
        const topicScore = getTopicScoreFromStorage(topicId);
        
        progress[topicId] = topicProgress;
        scores[topicId] = topicScore;
        
        if (topicProgress > 0) {
          totalProgress += topicProgress;
          totalTopics++;
          subcatTotal += topicProgress;
          subcatCount++;
        }
        
        if (topicScore > maxScore) {
          maxScore = topicScore;
        }
      }
      
      subcatProgress[subcategory] = subcatCount > 0 ? subcatTotal / subcatCount : 0;
    }
    
    setProgressCache(progress);
    setBestScoreCache(scores);
    setSubcategoryProgressCache(subcatProgress);
    setOverallProgress(totalTopics > 0 ? totalProgress / totalTopics : 0);
    setBestScore(maxScore);
  };

  const generateTopicProgressId = (subcategory, topic) => {
    const normalizeString = (input) => {
      return input
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
    };

    const normalizedMainTopic = normalizeString(categoryId);
    const normalizedSubtopic = normalizeString(subcategory);
    const normalizedTopic = normalizeString(topic);

    return `${normalizedMainTopic}_${normalizedSubtopic}_${normalizedTopic}`;
  };

  const getTopicProgressFromStorage = (topicId) => {
    const progressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
    return progressData[topicId]?.progress || 0;
  };

  const getTopicScoreFromStorage = (topicId) => {
    const progressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
    return progressData[topicId]?.bestScore || 0;
  };

  const toggleSubcategory = (subcategory) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategory]: !prev[subcategory]
    }));
  };

  const handleTopicSelection = (subcategory, topic) => {
    setSelectedTopic({
      topicName: topic,
      subcategoryName: subcategory,
      type: 'programming',
      categoryId: categoryId,
      subcategory: subcategory,
      topic: topic
    });
    setShowModeSelection(true);
  };

  const handleModeSelection = (mode) => {
    console.log(`Selected ${mode} mode for:`, selectedTopic);
    setShowModeSelection(false);
    setSelectedTopic(null);
  };

  const renderSubcategoryHeader = (subcategory) => {
    const isExpanded = expandedSubcategories[subcategory];
    const topics = topicsBySubcategory[subcategory] || [];
    const progress = subcategoryProgressCache[subcategory] || 0;
    
    return (
      <div
        onClick={() => toggleSubcategory(subcategory)}
        className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300 mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {subcategory[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{subcategory}</h3>
            <p className="text-sm text-gray-500">{topics.length} topics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
            </div>
          )}
          
          <div className="p-2 rounded-lg bg-gray-100">
            {isExpanded ? (
              <ChevronUp className="text-gray-600" size={20} />
            ) : (
              <ChevronDown className="text-gray-600" size={20} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTopicItem = (subcategory, topic) => {
    const topicId = generateTopicProgressId(subcategory, topic);
    const progress = progressCache[topicId] || 0;
    const score = bestScoreCache[topicId] || 0;
    const hasProgress = progress > 0;

    return (
      <div
        key={topic}
        onClick={() => handleTopicSelection(subcategory, topic)}
        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer mb-3 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                {topic}
              </h4>
              {hasProgress && (
                <p className="text-xs text-gray-500">
                  {Math.round(progress)}% complete
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {score > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-lg">
                <Star className="text-yellow-600" size={14} fill="currentColor" />
                <span className="text-sm font-medium text-yellow-700">{score}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                <Play size={16} />
              </button>
              <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                <Target size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {hasProgress && (
          <div className="mt-3">
            <div className="w-full h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-4xl">{categoryIcon}</div>
          <div>
            <h1 className="text-2xl font-bold">{categoryName}</h1>
            <p className="text-purple-100">
              {subcategories.length} subcategories • Overall {Math.round(overallProgress)}% complete
            </p>
          </div>
        </div>
        
        {/* Overall Stats */}
        <div className="flex gap-4">
          <div className="bg-white/20 rounded-2xl p-4 flex items-center gap-3">
            <Target className="text-white" size={20} />
            <div>
              <p className="text-sm text-purple-100">Best Score</p>
              <p className="text-lg font-bold">{bestScore}</p>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-2xl p-4 flex items-center gap-3">
            <Clock className="text-white" size={20} />
            <div>
              <p className="text-sm text-purple-100">Progress</p>
              <p className="text-lg font-bold">{Math.round(overallProgress)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {subcategories.map(subcategory => (
          <div key={subcategory} className="mb-6">
            {renderSubcategoryHeader(subcategory)}
            
            {expandedSubcategories[subcategory] && (
              <div className="ml-4 space-y-2">
                {(topicsBySubcategory[subcategory] || []).map(topic =>
                  renderTopicItem(subcategory, topic)
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mode Selection Modal */}
      {showModeSelection && selectedTopic && (
        <ModeSelectionModal
          isOpen={showModeSelection}
          onClose={() => setShowModeSelection(false)}
          topicData={selectedTopic}
          onModeSelect={handleModeSelection}
        />
      )}
    </div>
  );
};

export default ListTopicsScreen;