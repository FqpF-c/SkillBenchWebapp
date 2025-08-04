import React from 'react';
import { Crown, Zap, TrendingUp } from 'lucide-react';

const PodiumView = () => {
  const topUsers = [
    { name: 'Sivedharsan C', score: 764, position: 2, avatar: null, trend: '+12' },
    { name: 'E. THAMIZHAR...', score: 3534, position: 1, avatar: null, trend: '+25' },
    { name: 'Kailash', score: 572, position: 3, avatar: null, trend: '+8' }
  ];

  const getPodiumHeight = (position) => {
    switch (position) {
      case 1: return 'h-32';
      case 2: return 'h-24';
      case 3: return 'h-20';
      default: return 'h-20';
    }
  };

  const getPodiumGradient = (position) => {
    switch (position) {
      case 1: return 'bg-gradient-to-t from-yellow-400 via-yellow-300 to-yellow-200';
      case 2: return 'bg-gradient-to-t from-gray-400 via-gray-300 to-gray-200';
      case 3: return 'bg-gradient-to-t from-orange-400 via-orange-300 to-orange-200';
      default: return 'bg-gray-400';
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="relative px-6 py-8">
      {/* Crown decoration - positioned with more space */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <Crown className="text-white" size={28} />
        </div>
      </div>

      {/* Podium Container - increased height and better spacing */}
      <div className="relative min-h-[400px] flex items-end justify-center gap-6 pt-8">
        {[2, 1, 3].map((position) => {
          const user = topUsers.find(u => u.position === position);
          if (!user) return null;

          return (
            <div key={position} className="flex flex-col items-center">
              {/* User Card - positioned with adequate top margin */}
              <div className="mb-8 text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white/50 shadow-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-light to-accent-pink rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xl">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Position Badge */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-3 border-gray-200 shadow-lg">
                    <span className="text-sm font-bold text-gray-700">
                      {position}
                    </span>
                  </div>
                  
                  {/* Trend Indicator */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">{user.trend}</span>
                  </div>
                </div>
                
                {/* User Info Card */}
                <div className="bg-white rounded-2xl p-4 min-w-[100px] shadow-lg border border-gray-100">
                  <p className="text-gray-800 text-sm font-semibold truncate mb-1">
                    {user.name}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="text-yellow-500" size={12} />
                    <p className="text-primary text-sm font-bold">
                      {user.score} GP
                    </p>
                  </div>
                  
                  {/* Performance indicator */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="text-green-500" size={10} />
                    <span className="text-green-600 text-xs font-medium">{user.trend} this week</span>
                  </div>
                </div>
              </div>

              {/* Podium Base */}
              <div className={`
                w-24 ${getPodiumHeight(position)} ${getPodiumGradient(position)}
                rounded-t-2xl flex items-center justify-center
                shadow-xl relative overflow-hidden border-t-2 border-white/30
              `}>
                <span className="text-white text-2xl font-bold relative z-10 drop-shadow-lg">
                  {position}
                </span>
                
                {/* Shine effects */}
                <div className="absolute top-3 left-3 right-3 h-4 bg-white/20 rounded blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                
                {/* Position glow */}
                <div className={`absolute inset-0 ${getPositionColor(position).replace('text-', 'bg-')}/20 rounded-t-2xl`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating particles - positioned to not interfere */}
      <div className="absolute top-32 left-10 w-2 h-2 bg-yellow-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-12 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-20 w-1 h-1 bg-pink-400/30 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default PodiumView;