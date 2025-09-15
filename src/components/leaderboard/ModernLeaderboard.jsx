import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Award, Zap, Star, Sparkles, Trophy } from 'lucide-react';

const ModernLeaderboard = ({ users = [], isLoading = false, currentUserId = null }) => {
  // Split users into top 3 and remaining
  const top3Users = users.slice(0, 3);
  const remainingUsers = users.slice(3);

  // Ensure we have exactly 3 users for top display, fill with placeholders if needed
  const displayTop3 = [...top3Users];
  while (displayTop3.length < 3) {
    displayTop3.push({
      id: `placeholder-${displayTop3.length}`,
      username: 'No User',
      xp: 0,
      rank: displayTop3.length + 1,
      isPlaceholder: true
    });
  }

  // Badge configurations for top 3
  const getBadgeConfig = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          label: 'CHAMPION',
          colors: {
            bg: 'from-yellow-400 via-amber-500 to-orange-500',
            border: 'border-yellow-300/50',
            glow: 'shadow-yellow-400/30',
            card: 'from-yellow-50/90 via-amber-50/90 to-orange-50/90',
            progress: 'from-yellow-400 to-amber-500',
            sparkle: 'text-yellow-400'
          }
        };
      case 2:
        return {
          icon: Medal,
          label: 'RUNNER UP',
          colors: {
            bg: 'from-gray-400 via-slate-500 to-gray-600',
            border: 'border-gray-300/50',
            glow: 'shadow-gray-400/25',
            card: 'from-gray-50/90 via-slate-50/90 to-gray-100/90',
            progress: 'from-gray-400 to-slate-500',
            sparkle: 'text-gray-400'
          }
        };
      case 3:
        return {
          icon: Award,
          label: 'THIRD PLACE',
          colors: {
            bg: 'from-orange-500 via-amber-600 to-orange-700',
            border: 'border-orange-300/50',
            glow: 'shadow-orange-400/25',
            card: 'from-orange-50/90 via-amber-50/90 to-orange-100/90',
            progress: 'from-orange-500 to-amber-600',
            sparkle: 'text-orange-500'
          }
        };
      default:
        return {
          icon: Star,
          label: 'PARTICIPANT',
          colors: {
            bg: 'from-purple-500 to-pink-500',
            border: 'border-purple-300/50',
            glow: 'shadow-purple-400/25',
            card: 'from-purple-50/90 to-pink-50/90',
            progress: 'from-purple-500 to-pink-500',
            sparkle: 'text-purple-400'
          }
        };
    }
  };

  const maxXP = Math.max(...users.map(user => user.xp || 0), 100);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-50/30 to-orange-100/50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Top 3 skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 rounded-3xl p-8 animate-pulse shadow-lg">
                <div className="w-16 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>

          {/* Remaining users skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/80 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100/50 via-pink-50/30 to-orange-100/50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-xl font-medium">See where you stand among the best</p>
        </motion.div>

        {/* Top 3 Bar Chart */}
        <div className="mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end justify-center gap-4 h-96 px-8">
              {displayTop3.map((user, index) => {
                const rank = user.rank || index + 1;
                const config = getBadgeConfig(rank);
                const IconComponent = config.icon;
                const xpPercentage = maxXP > 0 ? (user.xp || 0) / maxXP * 100 : 0;
                
                // Calculate bar heights: champion gets max height, others proportional
                const baseHeight = 120; // minimum height
                const maxHeight = 300; // maximum height for champion
                const barHeight = rank === 1 ? maxHeight : baseHeight + (xpPercentage / 100) * (maxHeight - baseHeight);
                
                const isChampion = rank === 1;

                return (
                  <motion.div
                    key={user.id || rank}
                    className="flex flex-col items-center group cursor-pointer"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: rank === 1 ? 0.4 : index * 0.2,
                      ease: "easeOut"
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Bar */}
                    <motion.div
                      className={`relative w-32 bg-gradient-to-t ${config.colors.bg} rounded-t-3xl border-4 border-white/30 shadow-2xl group-hover:shadow-3xl transition-all duration-500 overflow-hidden`}
                      style={{ height: `${barHeight}px` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}px` }}
                      transition={{ 
                        duration: 1.5, 
                        delay: 0.5 + index * 0.3,
                        ease: "easeOut" 
                      }}
                    >
                      {/* Champion glow effect */}
                      {isChampion && (
                        <div className="absolute -inset-4 bg-gradient-to-t from-yellow-300/40 via-amber-400/40 to-orange-400/40 rounded-t-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                      )}

                      {/* Bar content */}
                      <div className="relative z-10 h-full flex flex-col justify-between items-center p-4">
                        {/* Top section - Badge and Sparkles */}
                        <div className="text-center">
                          {/* Floating sparkles for champion */}
                          {isChampion && (
                            <>
                              <motion.div 
                                className="absolute -top-2 -right-2"
                                animate={{ 
                                  rotate: [0, 360],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ 
                                  duration: 4, 
                                  repeat: Infinity, 
                                  ease: "easeInOut" 
                                }}
                              >
                                <Sparkles className="w-6 h-6 text-yellow-200" />
                              </motion.div>
                              <motion.div 
                                className="absolute -top-1 -left-2"
                                animate={{ 
                                  rotate: [360, 0],
                                  scale: [1, 0.8, 1]
                                }}
                                transition={{ 
                                  duration: 3, 
                                  repeat: Infinity, 
                                  ease: "easeInOut",
                                  delay: 1
                                }}
                              >
                                <Star className="w-4 h-4 text-yellow-200" />
                              </motion.div>
                            </>
                          )}

                          {/* Badge */}
                          <motion.div 
                            className={`inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-xl text-xs font-bold mb-2 shadow-lg`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <IconComponent className="w-4 h-4" />
                            {rank === 1 ? '#1' : rank === 2 ? '#2' : '#3'}
                          </motion.div>

                          {/* XP Display */}
                          <div className="mb-2">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Zap className="w-4 h-4 text-white" />
                              <span className="text-xl font-black text-white">
                                {user.isPlaceholder ? '0' : (user.xp || 0)}
                              </span>
                            </div>
                            <span className="text-xs text-white/80 font-semibold">XP</span>
                          </div>
                        </div>

                        {/* Bottom section - User info */}
                        <div className="text-center">
                          {/* User Avatar */}
                          <motion.div 
                            className={`w-16 h-16 mx-auto mb-2 ${user.isPlaceholder ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/30`}
                            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {user.isPlaceholder ? '?' : (user.username?.charAt(0)?.toUpperCase() || '?')}
                          </motion.div>

                          {/* Username */}
                          <h3 className="text-sm font-black text-white mb-1 truncate leading-tight">
                            {user.isPlaceholder ? 'No User' : (user.username || 'Anonymous')}
                          </h3>

                          {/* College info */}
                          {user.college && !user.isPlaceholder && (
                            <p className="text-xs text-white/70 font-medium truncate">
                              {user.college}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bar shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                        animate={{ y: [-100, barHeight + 100] }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: 2 + index * 0.5
                        }}
                      />
                    </motion.div>

                    {/* Base platform */}
                    <div className="w-36 h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-t-lg shadow-lg border-t-2 border-gray-500/30"></div>
                    
                    {/* Rank label below */}
                    <motion.div 
                      className={`mt-3 px-4 py-2 bg-gradient-to-r ${config.colors.bg} text-white rounded-xl text-sm font-bold shadow-lg`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + index * 0.2, duration: 0.5 }}
                    >
                      {config.label}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Remaining Users List */}
        {remainingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Other Top Performers
              </h2>
              <p className="text-gray-600 text-lg">Keep climbing to reach the podium!</p>
            </div>

            <div className="space-y-4">
              {remainingUsers.map((user, index) => {
                const isCurrentUser = currentUserId && user.id === currentUserId;
                
                return (
                  <motion.div 
                    key={user.id || index}
                    className={`group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:bg-white/90 transition-all duration-300 ${
                      isCurrentUser 
                        ? 'border-pink-200/70 shadow-pink-100/30' 
                        : 'border-white/60'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                    }}
                  >
                    {/* Current user glow */}
                    {isCurrentUser && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-pink-100/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}

                    <div className="relative z-10 flex items-center gap-6">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                          isCurrentUser 
                            ? 'bg-gradient-to-br from-pink-100 to-purple-100 text-pink-700' 
                            : 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700'
                        } font-black text-lg group-hover:scale-105 transition-transform duration-300`}>
                          #{user.rank || index + 4}
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-gray-900 truncate group-hover:text-purple-800 transition-colors duration-300">
                            {user.username || 'Anonymous'}
                          </h3>
                          {isCurrentUser && (
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              You
                            </div>
                          )}
                        </div>
                        {user.college && (
                          <p className="text-gray-500 text-sm truncate">
                            {user.college}
                          </p>
                        )}
                      </div>

                      {/* XP Display */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50 shadow-lg group-hover:shadow-xl group-hover:from-yellow-100 group-hover:to-amber-100 transition-all duration-300">
                          <Star className="w-5 h-5 text-yellow-500 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                          <div>
                            <span className="font-black text-xl text-gray-900 group-hover:text-amber-700 transition-colors duration-300">
                              {user.xp || 0}
                            </span>
                            <span className="text-xs text-gray-500 font-semibold ml-1">XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {users.length === 0 && !isLoading && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Trophy className="text-purple-400 w-16 h-16" />
            </div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No rankings yet</h3>
            <p className="text-gray-500 text-xl mb-8">Be the first to earn XP and claim your spot!</p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Start Learning
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModernLeaderboard;