import React, { useState, useEffect } from 'react';
import { TrendingUp, Award } from 'lucide-react';

const TopicProgress = ({ topicData }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(topicData.progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [topicData.progress]);

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressColorText = (progress) => {
    if (progress < 30) return 'text-red-500';
    if (progress < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Progress</h2>
        </div>
        {topicData.bestScore > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
            <Award className="text-purple-600" size={16} />
            <span className="text-purple-600 font-semibold text-sm">
              Best: {topicData.bestScore}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(topicData.progress)}`}
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className={`font-semibold ${getProgressColorText(topicData.progress)}`}>
              {Math.round(animatedProgress)}% Complete
            </span>
            <span className="text-gray-500 text-sm">
              {topicData.difficulty} Level
            </span>
          </div>
        </div>

        {topicData.lastAttempted && (
          <div className="text-sm text-gray-600">
            Last attempted: {topicData.lastAttempted.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicProgress;