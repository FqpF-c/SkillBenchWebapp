import React from 'react';
import { PlayCircle, Award, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const TopicItem = ({ 
  topic, 
  subcategory, 
  progress = 0, 
  bestScore = 0, 
  attemptCount = 0, 
  lastAttempted = null,
  isExpanded = false,
  onToggle,
  onClick 
}) => {
  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-400';
    if (progress < 70) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getProgressColorText = (progress) => {
    if (progress < 30) return 'text-red-600';
    if (progress < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatLastAttempted = (timestamp) => {
    if (!timestamp) return 'Never attempted';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-200">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onToggle && onToggle()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <PlayCircle 
              className="text-purple-600 hover:text-purple-700 transition-colors" 
              size={20} 
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{topic}</h4>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-300`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={`font-medium ${getProgressColorText(progress)}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                
                {bestScore > 0 && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Award size={14} />
                    <span>{bestScore}%</span>
                  </div>
                )}
                
                {attemptCount > 0 && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} />
                    <span>{attemptCount} attempts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggle && (
              <div className="text-gray-400">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            )}
            
            {onClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Start
              </button>
            )}
          </div>
        </div>
        
        {lastAttempted && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Last attempted: {formatLastAttempted(lastAttempted)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicItem; 