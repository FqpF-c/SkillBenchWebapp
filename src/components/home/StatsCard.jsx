import React from 'react';
import { CheckCircle, Trophy, Clock, TrendingUp } from 'lucide-react';

const StatsCard = () => {
  const userStats = {
    completed: 2,
    rankPosition: 24,
    studyHours: 128
  };

  const stats = [
    { 
      icon: CheckCircle, 
      label: 'Completed', 
      value: userStats.completed,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    { 
      icon: Trophy, 
      label: 'Rank Position', 
      value: userStats.rankPosition,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    { 
      icon: Clock, 
      label: 'Study Hours', 
      value: userStats.studyHours,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    }
  ];

  return (
    <div className="mx-6 mb-8 -mt-16 relative z-20">
      <div className="card card-elevated gradient-pink p-6 border-0 shadow-xl">
        {/* Header with trend indicator */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Your Progress</h3>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <TrendingUp className="text-white" size={14} />
            <span className="text-white text-xs font-medium">+12%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-between items-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              {/* Icon Container */}
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/10`}>
                <stat.icon className={`${stat.color}`} size={24} />
              </div>
              
              {/* Label */}
              <span className="text-white/80 text-xs mb-2 font-medium tracking-wide">
                {stat.label}
              </span>
              
              {/* Value */}
              <span className="text-white text-2xl font-bold">
                {stat.value}
              </span>
              
              {/* Progress Indicator */}
              <div className="w-12 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-white/60 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min((stat.value / 100) * 100, 100)}%`,
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Decorative Elements */}
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 bg-white/30 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;