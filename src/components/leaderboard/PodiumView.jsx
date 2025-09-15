import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, TrendingUp, ChevronDown, Calendar, Clock, BarChart } from 'lucide-react';

const PodiumView = ({ topUsers = [], timeframe = 'monthly', onTimeframeChange, isLoading = false }) => {
  const timeframeOptions = [
    { value: 'daily', label: 'Daily', icon: Clock },
    { value: 'weekly', label: 'Weekly', icon: Calendar },
    { value: 'monthly', label: 'Monthly', icon: BarChart },
    { value: 'all_time', label: 'All Time', icon: TrendingUp }
  ];

  // Ensure we have 3 users for podium display, fill with placeholders if needed
  const podiumUsers = [...topUsers];
  while (podiumUsers.length < 3) {
    podiumUsers.push({
      id: `placeholder-${podiumUsers.length}`,
      username: 'No User',
      xp: 0,
      rank: podiumUsers.length + 1,
      isPlaceholder: true
    });
  }

  // Arrange users for podium display [2nd, 1st, 3rd]
  const arrangedUsers = [
    podiumUsers.find(u => u.rank === 2) || podiumUsers[1],
    podiumUsers.find(u => u.rank === 1) || podiumUsers[0],
    podiumUsers.find(u => u.rank === 3) || podiumUsers[2]
  ];

  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1: return 'h-40';
      case 2: return 'h-32';
      case 3: return 'h-24';
      default: return 'h-24';
    }
  };

  const getPodiumGradient = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-t from-yellow-500 via-yellow-400 to-amber-300';
      case 2: return 'bg-gradient-to-t from-gray-500 via-gray-400 to-slate-300';
      case 3: return 'bg-gradient-to-t from-orange-500 via-orange-400 to-amber-300';
      default: return 'bg-gradient-to-t from-gray-300 to-gray-400';
    }
  };

  const getPositionColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getCurrentSelectedIcon = () => {
    const selected = timeframeOptions.find(opt => opt.value === timeframe);
    return selected ? selected.icon : BarChart;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-4 sm:p-8">
      <div className="relative z-10">
        {/* Classic Podium Layout - Bottom Aligned */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-8 max-w-5xl mx-auto pb-8">
          {arrangedUsers.map((user, index) => {
            const displayPosition = [2, 1, 3][index]; // Map array index to display position [2nd, 1st, 3rd]
            const actualRank = user?.rank || displayPosition;
            
            // Podium dimensions - all align at bottom
            const getPodiumConfig = (rank) => {
              switch (rank) {
                case 1: return {
                  cardWidth: 'w-48 sm:w-56 lg:w-64',
                  podiumHeight: 'h-32 sm:h-40',
                  cardScale: 'scale-110 sm:scale-125',
                  avatarSize: 'w-20 h-20 sm:w-24 sm:h-24',
                  nameSize: 'text-lg sm:text-xl',
                  xpSize: 'text-lg sm:text-xl',
                  badgeSize: 'w-16 h-16 sm:w-18 sm:h-18',
                  spacing: 'gap-4'
                };
                case 2: return {
                  cardWidth: 'w-40 sm:w-48 lg:w-52',
                  podiumHeight: 'h-24 sm:h-32',
                  cardScale: 'scale-95 sm:scale-105',
                  avatarSize: 'w-16 h-16 sm:w-18 sm:h-18',
                  nameSize: 'text-base sm:text-lg',
                  xpSize: 'text-base sm:text-lg',
                  badgeSize: 'w-12 h-12 sm:w-14 sm:h-14',
                  spacing: 'gap-3'
                };
                case 3: return {
                  cardWidth: 'w-40 sm:w-48 lg:w-52',
                  podiumHeight: 'h-16 sm:h-24',
                  cardScale: 'scale-95 sm:scale-105',
                  avatarSize: 'w-16 h-16 sm:w-18 sm:h-18',
                  nameSize: 'text-base sm:text-lg',
                  xpSize: 'text-base sm:text-lg',
                  badgeSize: 'w-12 h-12 sm:w-14 sm:h-14',
                  spacing: 'gap-3'
                };
                default: return {
                  cardWidth: 'w-40',
                  podiumHeight: 'h-16',
                  cardScale: 'scale-100',
                  avatarSize: 'w-16 h-16',
                  nameSize: 'text-base',
                  xpSize: 'text-base',
                  badgeSize: 'w-12 h-12',
                  spacing: 'gap-3'
                };
              }
            };

            const getPodiumColors = (rank) => {
              switch (rank) {
                case 1: return {
                  podium: 'from-yellow-400 via-amber-500 to-yellow-600',
                  card: 'from-yellow-50/90 via-amber-50/90 to-yellow-100/90',
                  border: 'border-yellow-300/50',
                  shadow: 'shadow-xl shadow-yellow-400/25',
                  glow: 'from-yellow-200/30 via-amber-200/20 to-yellow-300/30',
                  badge: 'from-yellow-400 via-amber-500 to-yellow-600',
                  accent: 'text-yellow-700'
                };
                case 2: return {
                  podium: 'from-gray-400 via-slate-500 to-gray-600',
                  card: 'from-gray-50/90 via-slate-50/90 to-gray-100/90',
                  border: 'border-gray-300/50',
                  shadow: 'shadow-lg shadow-gray-400/20',
                  glow: 'from-gray-200/30 via-slate-200/20 to-gray-300/30',
                  badge: 'from-gray-400 via-slate-500 to-gray-600',
                  accent: 'text-gray-700'
                };
                case 3: return {
                  podium: 'from-orange-400 via-amber-600 to-orange-600',
                  card: 'from-orange-50/90 via-amber-50/90 to-orange-100/90',
                  border: 'border-orange-300/50',
                  shadow: 'shadow-lg shadow-orange-400/20',
                  glow: 'from-orange-200/30 via-amber-200/20 to-orange-300/30',
                  badge: 'from-orange-400 via-amber-600 to-orange-600',
                  accent: 'text-orange-700'
                };
                default: return {
                  podium: 'from-gray-400 to-gray-500',
                  card: 'from-gray-50/90 to-gray-100/90',
                  border: 'border-gray-300/50',
                  shadow: 'shadow-lg',
                  glow: 'from-gray-200/30 to-gray-300/30',
                  badge: 'from-gray-400 to-gray-500',
                  accent: 'text-gray-700'
                };
              }
            };

            const config = getPodiumConfig(actualRank);
            const colors = getPodiumColors(actualRank);

            return (
              <motion.div
                key={user?.id || displayPosition}
                className="flex flex-col items-center group"
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: actualRank === 1 ? 0.6 : index * 0.2,
                  type: "spring",
                  stiffness: 120,
                  damping: 25
                }}
              >
                {/* User Card - Floats above podium */}
                <motion.div 
                  className={`${config.cardWidth} ${config.cardScale} mb-4 bg-gradient-to-br ${colors.card} rounded-3xl p-4 sm:p-6 border-2 ${colors.border} ${colors.shadow} hover:shadow-2xl transition-all duration-500 relative overflow-hidden backdrop-blur-sm`}
                  whileHover={{ 
                    y: -8,
                    scale: actualRank === 1 ? 1.35 : actualRank === 2 ? 1.15 : 1.15,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Special glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className={`relative z-10 flex flex-col items-center ${config.spacing}`}>
                    {/* Rank Badge */}
                    <div className={`${config.badgeSize} bg-gradient-to-br ${colors.badge} rounded-full flex items-center justify-center text-white font-black shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-300 relative`}>
                      {actualRank === 1 && <Crown size={actualRank === 1 ? 20 : 16} className="drop-shadow-lg" />}
                      {actualRank !== 1 && <span className={`${actualRank === 1 ? 'text-2xl' : 'text-xl'} font-black drop-shadow-lg`}>{actualRank}</span>}
                      
                      {/* Badge glow */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.badge} opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500`}></div>
                    </div>

                    {/* User Avatar */}
                    <div className={`${config.avatarSize} ${user?.isPlaceholder ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500'} rounded-full flex items-center justify-center text-white font-bold shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 border-3 border-white/60`}>
                      <span className={actualRank === 1 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}>
                        {user?.isPlaceholder ? '?' : (user?.username?.charAt(0) || '?')}
                      </span>
                    </div>

                    {/* User Name */}
                    <h3 className={`${config.nameSize} font-bold text-gray-900 group-hover:${colors.accent} transition-colors duration-300 text-center truncate max-w-full`}>
                      {user?.isPlaceholder ? 'No User' : (user?.username || 'Anonymous')}
                    </h3>
                    
                    {/* XP Display */}
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br ${colors.badge} rounded-full flex items-center justify-center shadow-lg`}>
                        <Zap className="text-white" size={actualRank === 1 ? 14 : 12} />
                      </div>
                      <span className={`${config.xpSize} font-black text-gray-900`}>
                        {user?.isPlaceholder ? '0' : (user?.xp || 0)} XP
                      </span>
                    </div>

                    {/* College info */}
                    {user?.college && !user?.isPlaceholder && (
                      <p className="text-gray-600 text-xs font-medium text-center truncate max-w-full mt-1">
                        {user.college}
                      </p>
                    )}
                  </div>

                  {/* Shimmer effect for 1st place */}
                  {actualRank === 1 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
                  )}
                </motion.div>

                {/* Podium Block - Creates the stepped effect */}
                <motion.div
                  className={`${config.cardWidth} ${config.podiumHeight} bg-gradient-to-t ${colors.podium} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2 relative overflow-hidden border-2 ${colors.border}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ 
                    duration: 1, 
                    delay: (actualRank === 1 ? 1.0 : index * 0.3 + 0.8),
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Podium shine effect */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-white/30 rounded-t-2xl blur-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10"></div>
                  
                  {/* Position number embossed on podium */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 shadow-inner">
                      <span className="text-white text-lg sm:text-xl font-black drop-shadow-lg">{actualRank}</span>
                    </div>
                  </div>

                  {/* Podium glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.badge} opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-2xl`}></div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PodiumView;