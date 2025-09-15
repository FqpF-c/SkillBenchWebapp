import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  BookOpen, 
  Star,
  Target,
  Clock,
  Code,
  Code2,
  FileCode,
  Terminal,
  Cpu,
  Database,
  Globe,
  Layers
} from 'lucide-react';
import ModeSelectionModal from '../components/modals/ModeSelectionModal';

const ListTopicsScreen = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const categoryName = location.state?.categoryName || decodeURIComponent(categoryId);
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
      console.log(`Loading subcategories for ${categoryName}`);
      
      const snapshot = await getDoc(doc(db, 'prep', 'Title', categoryName, categoryName));
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log(`${categoryName} subcategories data:`, data);
        
        if (data && data[categoryName] && Array.isArray(data[categoryName])) {
          const items = data[categoryName];
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
                doc(db, 'prep', 'Title', categoryName, categoryName, subcategory, 'Topics')
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
      console.error(`Error loading subcategories for ${categoryName}:`, error);
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

    const normalizedMainTopic = normalizeString(categoryName);
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

  const getTopicIcon = (topicName) => {
    const topic = topicName.toLowerCase();
    
    if (topic.includes('array') || topic.includes('string') || topic.includes('loop') || topic.includes('variable')) {
      return Code;
    } else if (topic.includes('function') || topic.includes('method') || topic.includes('class')) {
      return Code2;
    } else if (topic.includes('file') || topic.includes('io') || topic.includes('input') || topic.includes('output')) {
      return FileCode;
    } else if (topic.includes('terminal') || topic.includes('command') || topic.includes('shell')) {
      return Terminal;
    } else if (topic.includes('algorithm') || topic.includes('sort') || topic.includes('search')) {
      return Cpu;
    } else if (topic.includes('database') || topic.includes('sql') || topic.includes('data')) {
      return Database;
    } else if (topic.includes('web') || topic.includes('html') || topic.includes('css') || topic.includes('js')) {
      return Globe;
    } else if (topic.includes('structure') || topic.includes('stack') || topic.includes('queue')) {
      return Layers;
    } else {
      return BookOpen;
    }
  };

  const toggleSubcategory = (subcategory) => {
    setExpandedSubcategories(prev => {
      const isCurrentlyExpanded = prev[subcategory];
      
      // If clicking on an already expanded subcategory, just close it
      if (isCurrentlyExpanded) {
        return {
          ...prev,
          [subcategory]: false
        };
      }
      
      // Otherwise, close all others and open this one
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[subcategory] = true;
      
      return newState;
    });
  };

  const handleTopicSelection = (subcategory, topic) => {
    setSelectedTopic({
      topicName: topic,
      subcategoryName: subcategory,
      type: 'programming',
      categoryId: categoryName,
      subcategory: subcategory,
      topic: topic
    });
    setShowModeSelection(true);
  };

  const handleModeSelection = (mode) => {
    console.log(`Selected ${mode} mode for:`, selectedTopic);
    
    const quizParams = {
      mainTopic: categoryName,
      programmingLanguage: selectedTopic.topic,
      subTopic: selectedTopic.subcategoryName,
      categoryId: selectedTopic.categoryId,
      subcategory: selectedTopic.subcategoryName,
      topic: selectedTopic.topicName
    };

    navigate('/quiz-loading', {
      state: {
        mode,
        type: selectedTopic.type,
        quizParams,
        topicName: selectedTopic.topicName,
        subtopicName: selectedTopic.subcategoryName
      }
    });
    
    setShowModeSelection(false);
    setSelectedTopic(null);
  };

  const handleBackButton = () => {
    // Navigate to home page instead of going back
    navigate('/');
  };

  const renderSubcategoryHeader = (subcategory) => {
    const isExpanded = expandedSubcategories[subcategory];
    const topics = topicsBySubcategory[subcategory] || [];
    const progress = subcategoryProgressCache[subcategory] || 0;
    
    return (
      <div
        onClick={() => toggleSubcategory(subcategory)}
        className="relative group cursor-pointer mb-8 overflow-visible"
        style={{ overflow: 'visible', zIndex: 2 }}
      >
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl border border-[#FAD4E6] transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 overflow-visible"
        style={{ 
          overflow: 'visible',
          transformOrigin: 'center',
          willChange: 'transform, box-shadow'
        }}>
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-14 h-14 bg-[#A10089] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-[#FAD4E6] group-hover:scale-110 transition-all duration-300">
              {subcategory[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1F2937] group-hover:text-[#A10089] transition-colors duration-300 mb-1">
                {subcategory}
              </h3>
              <p className="text-sm text-[#6B7280] font-medium">
                {topics.length} topics • {Math.round(progress)}% complete
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            {progress > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 bg-[#FFF0F6] rounded-full shadow-inner">
                  <div
                    className="h-full bg-[#F871A0] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-[#6B7280] min-w-[3rem]">{Math.round(progress)}%</span>
              </div>
            )}
            
            <div className="p-3 rounded-xl bg-[#FFF0F6] group-hover:bg-[#FAD4E6] transition-all duration-300">
              {isExpanded ? (
                <ChevronUp className="text-[#A10089] group-hover:scale-110 transition-transform duration-200" size={20} />
              ) : (
                <ChevronDown className="text-[#A10089] group-hover:scale-110 transition-transform duration-200" size={20} />
              )}
            </div>
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
    const isCompleted = progress >= 100;
    const TopicIcon = getTopicIcon(topic);

    return (
      <div
        key={topic}
        onClick={() => handleTopicSelection(subcategory, topic)}
        className="relative p-6 bg-[#FFF0F6] rounded-2xl shadow-lg hover:shadow-xl border border-[#FAD4E6] cursor-pointer mb-4 group transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-out hover:bg-white backdrop-blur-sm overflow-visible z-10"
        style={{ 
          overflow: 'visible',
          transformOrigin: 'center',
          willChange: 'transform, box-shadow'
        }}
      >
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-[#A10089] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#FAD4E6] group-hover:scale-110 transition-all duration-300">
                  <TopicIcon className="text-white" size={18} />
                </div>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-lg text-[#1F2937] group-hover:text-[#A10089] transition-colors duration-300 mb-1">
                  {topic}
                </h4>
                <p className="text-sm text-[#6B7280] font-medium">
                  {hasProgress ? `${Math.round(progress)}% completed` : 'Not started'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {score > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#FDE2E4] rounded-full shadow-lg">
                  <Star className="text-[#A10089]" size={14} fill="currentColor" />
                  <span className="text-sm font-bold text-[#A10089]">{score}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2.5 bg-[#A10089] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200">
                  <Play size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {hasProgress && !isCompleted && (
            <div className="mt-4">
              <div className="w-full h-2 bg-[#FFF0F6] rounded-full shadow-inner">
                <div
                  className="h-full bg-[#F871A0] rounded-full shadow-sm transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {isCompleted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-green-700">Completed!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A10089] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280] text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-visible" style={{ overflow: 'visible' }}>
      <div className="relative overflow-hidden bg-[#2E0059] text-white p-8 rounded-3xl mt-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/3 rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute top-10 right-10 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-20 right-16 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-16 left-20 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
        <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackButton}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{categoryName}</h1>
            <p className="text-white/90 font-medium">
              {subcategories.length} subcategories • Overall {Math.round(overallProgress)}% complete
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-white/80 mb-2">Overall Progress</p>
          <div className="flex items-center gap-3 max-w-md">
            <div className="flex-1 h-3 bg-white/20 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-white">{Math.round(overallProgress)}%</span>
          </div>
        </div>
        </div>
      </div>

      <div className="p-8 overflow-visible" style={{ overflow: 'visible' }}>
        {subcategories.map(subcategory => (
          <div key={subcategory} className="mb-12 overflow-visible" style={{ overflow: 'visible' }}>
            {renderSubcategoryHeader(subcategory)}
            
            <div className={`overflow-visible transition-all duration-500 ease-in-out ${
              expandedSubcategories[subcategory] 
                ? 'max-h-[2000px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`} style={{ overflow: expandedSubcategories[subcategory] ? 'visible' : 'hidden' }}>
              <div className="ml-6 mt-6 space-y-6 pb-8 overflow-visible" style={{ overflow: 'visible' }}>
                {(topicsBySubcategory[subcategory] || []).map((topic, index) => (
                  <div
                    key={topic}
                    className={`transform transition-all duration-300 overflow-visible ${
                      expandedSubcategories[subcategory]
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: expandedSubcategories[subcategory] ? `${index * 100}ms` : '0ms',
                      overflow: 'visible',
                      zIndex: 1
                    }}
                  >
                    {renderTopicItem(subcategory, topic)}
                  </div>
                ))}
              </div>
            </div>
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