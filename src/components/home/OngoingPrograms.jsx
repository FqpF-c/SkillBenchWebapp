import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Star } from 'lucide-react';

const OngoingPrograms = ({ categoryItems, getAssetForTopic, getColorForTopic }) => {
  const [ongoingPrograms, setOngoingPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOngoingPrograms();
  }, [categoryItems]);

  const extractTopicNameFromId = (topicId) => {
    const parts = topicId.split('_');
    
    if (parts.length >= 3) {
      if (parts[0] === 'programminglanguage' || parts[0] === 'programming') {
        const language = parts[1];
        const topic = parts.length > 2 ? parts.slice(2).join(' ') : language;
        const readableLanguage = capitalizeWords(language);
        
        if (topic.toLowerCase().replace(/[^a-z]/g, '') === language.toLowerCase().replace(/[^a-z]/g, '')) {
          return readableLanguage;
        }
        
        if (topic.length > language.length + 2) {
          const readableTopic = capitalizeWords(topic);
          return `${readableLanguage} - ${readableTopic}`;
        }
        
        return readableLanguage;
      }
    }
    
    return capitalizeWords(topicId.replace(/_/g, ' '));
  };

  const capitalizeWords = (input) => {
    if (!input) return input;
    
    const spaced = input.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    return spaced.split(/[_\s-]+/).map(word => {
      if (!word) return word;
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  };

  const loadOngoingPrograms = async () => {
    try {
      setIsLoading(true);
      
      const progressData = JSON.parse(localStorage.getItem('userProgress') || '{}');
      
      const groupedTopics = {};
      
      Object.entries(progressData).forEach(([topicId, data]) => {
        const progress = (data.progress || 0) / 100;
        
        if (progress > 0) {
          const categoryId = data.categoryId || '';
          const mainTopic = data.mainTopic || '';
          const subcategory = data.subcategory || '';
          const programmingLanguage = data.programmingLanguage || '';
          const lastUpdated = data.lastUpdated || 0;
          const bestScore = data.bestScore || 0;
          const totalQuestions = data.totalQuestions || 0;
          const totalCorrectAnswers = data.totalCorrectAnswers || 0;
          
          let displayName = '';
          let groupKey = '';
          
          if (programmingLanguage && programmingLanguage !== 'Unknown') {
            displayName = capitalizeWords(programmingLanguage);
            groupKey = `programming_${programmingLanguage.toLowerCase()}`;
          } else if (mainTopic && mainTopic !== 'Unknown') {
            displayName = capitalizeWords(mainTopic);
            groupKey = `topic_${mainTopic.toLowerCase()}`;
          } else {
            displayName = extractTopicNameFromId(topicId);
            groupKey = `other_${displayName.toLowerCase().replace(/\s+/g, '_')}`;
          }
          
          if (groupedTopics[groupKey]) {
            const existing = groupedTopics[groupKey];
            const subtopicCount = existing.subtopicCount || 1;
            const existingProgress = existing.aggregatedProgress || 0;
            const newTotalQuestions = existing.totalQuestions + totalQuestions;
            
            let newProgress;
            if (subtopicCount === 1) {
              newProgress = (existingProgress + progress) / 2;
            } else {
              newProgress = ((existingProgress * subtopicCount) + progress) / (subtopicCount + 1);
            }
            
            existing.aggregatedProgress = newProgress;
            existing.totalQuestions = newTotalQuestions;
            existing.totalCorrectAnswers = existing.totalCorrectAnswers + totalCorrectAnswers;
            existing.bestScore = Math.max(existing.bestScore, bestScore);
            existing.lastUpdated = Math.max(existing.lastUpdated, lastUpdated);
            existing.subtopicCount = subtopicCount + 1;
          } else {
            groupedTopics[groupKey] = {
              name: displayName,
              categoryId: categoryId,
              aggregatedProgress: progress,
              icon: getAssetForTopic(displayName),
              color: getColorForTopic(displayName),
              lastUpdated: lastUpdated,
              bestScore: bestScore,
              totalQuestions: totalQuestions,
              totalCorrectAnswers: totalCorrectAnswers,
              groupKey: groupKey,
              subtopicCount: 1,
              originalTopicId: topicId
            };
          }
        }
      });
      
      const progressList = Object.values(groupedTopics);
      progressList.sort((a, b) => b.lastUpdated - a.lastUpdated);
      
      setOngoingPrograms(progressList.slice(0, 6));
    } catch (error) {
      console.error('Error loading ongoing programs:', error);
      setDefaultPrograms();
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPrograms = () => {
    const defaultPrograms = [
      {
        name: 'Web Development',
        aggregatedProgress: 0.75,
        icon: getAssetForTopic('Web Development'),
        color: getColorForTopic('Web Development'),
        bestScore: 85,
        totalQuestions: 120
      },
      {
        name: 'Python',
        aggregatedProgress: 0.60,
        icon: getAssetForTopic('Python'),
        color: getColorForTopic('Python'),
        bestScore: 92,
        totalQuestions: 98
      },
      {
        name: 'JavaScript',
        aggregatedProgress: 0.45,
        icon: getAssetForTopic('JavaScript'),
        color: getColorForTopic('JavaScript'),
        bestScore: 78,
        totalQuestions: 67
      }
    ];
    
    setOngoingPrograms(defaultPrograms);
  };

  const handleProgramClick = (program) => {
    console.log('Navigate to program:', program);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ongoing Programs</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-80 bg-gray-200 rounded-2xl h-40 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (ongoingPrograms.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ongoing Programs</h2>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-gray-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ongoing Programs</h3>
          <p className="text-gray-600">Start learning to see your progress here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ongoing Programs</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ongoingPrograms.map((program, index) => (
          <div
            key={index}
            onClick={() => handleProgramClick(program)}
            className="min-w-80 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: program.color }}
                >
                  {program.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {Math.round(program.aggregatedProgress * 100)}% Complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-medium">{program.bestScore || 0}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(program.aggregatedProgress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${program.aggregatedProgress * 100}%`,
                    backgroundColor: program.color 
                  }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <TrendingUp size={14} />
                <span>{program.totalQuestions || 0} Questions</span>
              </div>
              <span className="text-xs">
                {program.lastUpdated ? new Date(program.lastUpdated).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OngoingPrograms;