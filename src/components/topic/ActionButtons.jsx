import React from 'react';
import { Play, Target, Clock, BookOpen } from 'lucide-react';

const ActionButtons = ({ onStartPractice }) => {
  const actionCards = [
    {
      title: 'Start Practicing',
      description: 'Begin learning with interactive practice sessions',
      icon: Play,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      action: onStartPractice
    },
    {
      title: 'Quick Review',
      description: 'Review key concepts and important points',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => console.log('Quick review clicked')
    },
    {
      title: 'Practice Test',
      description: 'Take a focused test on this specific topic',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      action: () => console.log('Practice test clicked')
    },
    {
      title: 'Timed Challenge',
      description: 'Challenge yourself with time-limited questions',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      action: () => console.log('Timed challenge clicked')
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">What would you like to do?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionCards.map((card, index) => {
          const IconComponent = card.icon;
          
          return (
            <button
              key={index}
              onClick={card.action}
              className={`group relative bg-gradient-to-r ${card.color} ${card.hoverColor} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left overflow-hidden`}
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <IconComponent size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full transform group-hover:scale-110 transition-transform duration-300" />
            </button>
          );
        })}
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Target className="text-yellow-300" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Pro Tip</h4>
            <p className="text-white/70 text-sm">Start with practice mode to build confidence, then challenge yourself with timed tests!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;