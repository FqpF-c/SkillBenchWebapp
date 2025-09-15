import React from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';

const GameLeaderboard = ({ users = [] }) => {
  // Split users into top 3 and remaining
  const top3Users = users.slice(0, 3);
  const remainingUsers = users.slice(3);

  // Badge configurations for top 3
  const getBadgeConfig = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          label: 'Champion',
          bgColor: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500',
          cardBg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-300',
          shadowColor: 'shadow-yellow-200/50',
          progressColor: 'bg-gradient-to-r from-yellow-400 to-amber-500',
          textColor: 'text-yellow-800'
        };
      case 2:
        return {
          icon: Medal,
          label: 'Runner Up',
          bgColor: 'bg-gradient-to-r from-gray-400 via-gray-500 to-slate-500',
          cardBg: 'bg-gradient-to-br from-gray-50 to-slate-50',
          borderColor: 'border-gray-300',
          shadowColor: 'shadow-gray-200/50',
          progressColor: 'bg-gradient-to-r from-gray-400 to-slate-500',
          textColor: 'text-gray-800'
        };
      case 3:
        return {
          icon: Award,
          label: 'Third Place',
          bgColor: 'bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600',
          cardBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
          borderColor: 'border-orange-300',
          shadowColor: 'shadow-orange-200/50',
          progressColor: 'bg-gradient-to-r from-orange-400 to-amber-600',
          textColor: 'text-orange-800'
        };
      default:
        return null;
    }
  };

  // Calculate max XP for progress bar scaling
  const maxXP = Math.max(...users.map(user => user.xp || 0), 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/60 via-blue-50/40 to-indigo-100/60 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 text-lg">Top performers in our learning community</p>
        </div>

        {/* Top 3 Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {top3Users.map((user, index) => {
            const rank = index + 1;
            const config = getBadgeConfig(rank);
            const IconComponent = config.icon;
            const xpPercentage = maxXP > 0 ? (user.xp || 0) / maxXP * 100 : 0;

            return (
              <div
                key={user.id || rank}
                className={`relative ${config.cardBg} rounded-2xl border-2 ${config.borderColor} ${config.shadowColor} shadow-xl p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
              >
                {/* Rank Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${config.bgColor} text-white rounded-full text-sm font-bold mb-6 shadow-lg`}>
                  <IconComponent className="w-4 h-4" />
                  {config.label}
                </div>

                {/* Rank Number */}
                <div className={`absolute top-4 right-4 w-10 h-10 ${config.bgColor} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                  #{rank}
                </div>

                <div className="text-center">
                  {/* User Avatar */}
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white">
                    {user.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Username */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                    {user.username || 'Anonymous'}
                  </h3>

                  {/* XP Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {user.xp || 0}
                      </span>
                      <span className="text-sm font-medium text-gray-600">XP</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${config.progressColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${xpPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {xpPercentage.toFixed(1)}% of top score
                    </div>
                  </div>

                  {/* Additional Info */}
                  {user.college && (
                    <p className="text-sm text-gray-600 truncate">
                      {user.college}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Remaining Users List */}
        {remainingUsers.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Other Top Performers
            </h2>
            
            <div className="space-y-4">
              {remainingUsers.map((user, index) => {
                const rank = index + 4; // Starting from rank 4
                
                return (
                  <div
                    key={user.id || rank}
                    className="flex items-center gap-6 p-4 bg-white/60 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200"
                  >
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                      #{rank}
                    </div>

                    {/* Avatar Circle */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {user.username || 'Anonymous'}
                      </h3>
                      {user.college && (
                        <p className="text-sm text-gray-600 truncate">
                          {user.college}
                        </p>
                      )}
                    </div>

                    {/* XP Value with Small Bar */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {user.xp || 0}
                          </div>
                          <div className="text-xs text-gray-500">XP</div>
                        </div>
                        
                        {/* Small horizontal progress bar */}
                        <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-700"
                            style={{ 
                              width: `${maxXP > 0 ? (user.xp || 0) / maxXP * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-white/50 shadow-xl">
            <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No rankings yet</h3>
            <p className="text-gray-500 text-lg">Be the first to earn XP and claim your spot!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLeaderboard;