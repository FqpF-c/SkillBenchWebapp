import React from 'react';
import { BarChart3, Target, Clock, CheckCircle } from 'lucide-react';

const TopicStats = ({ topicData }) => {
  const stats = [
    {
      icon: Target,
      label: 'Total Attempts',
      value: topicData.totalAttempts,
      color: 'text-blue-600 bg-blue-50',
      detail: `${topicData.practiceAttempts} practice, ${topicData.testAttempts} test`
    },
    {
      icon: BarChart3,
      label: 'Average Score',
      value: `${topicData.averageScore}%`,
      color: 'text-purple-600 bg-purple-50',
      detail: `${topicData.totalCorrectAnswers}/${topicData.totalQuestions} correct`
    },
    {
      icon: Clock,
      label: 'Avg Time',
      value: `${Math.round(topicData.averageTime)}s`,
      color: 'text-green-600 bg-green-50',
      detail: 'per question'
    },
    {
      icon: CheckCircle,
      label: 'Accuracy',
      value: `${Math.round((topicData.totalCorrectAnswers / topicData.totalQuestions) * 100)}%`,
      color: 'text-orange-600 bg-orange-50',
      detail: 'overall performance'
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          
          return (
            <div
              key={index}
              className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {topicData.totalAttempts === 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600">No practice history yet. Start practicing to see your statistics!</p>
        </div>
      )}
    </div>
  );
};

export default TopicStats;