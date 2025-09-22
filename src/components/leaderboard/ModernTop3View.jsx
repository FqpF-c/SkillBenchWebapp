import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Award, Zap, Star, Sparkles, School } from 'lucide-react';

const ModernTop3View = ({ topUsers = [], currentUserData = null, isLoading = false }) => {
  // Debug: Log current user data
  console.log('🔍 [ModernTop3View] Current user data:', currentUserData);

  // Ensure we have exactly 3 users for display, fill with placeholders if needed
  const top3Users = [...topUsers.slice(0, 3)];
  while (top3Users.length < 3) {
    top3Users.push({
      id: `placeholder-${top3Users.length}`,
      username: 'No User',
      xp: 0,
      rank: top3Users.length + 1,
      isPlaceholder: true
    });
  }

  // Sort to ensure proper ranking
  top3Users.sort((a, b) => (a.rank || a.id) - (b.rank || b.id));

  const getPositionConfig = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: Crown,
          iconColor: 'text-yellow-400',
          bgGradient: 'from-yellow-50 via-amber-50 to-orange-50',
          borderGradient: 'from-yellow-300 via-amber-400 to-orange-400',
          glowColor: 'shadow-yellow-200/60',
          progressGradient: 'from-yellow-400 to-amber-500',
          badgeGradient: 'from-yellow-400 to-amber-500',
          sparkleColor: 'text-yellow-400',
          position: 'CHAMPION'
        };
      case 2:
        return {
          icon: Medal,
          iconColor: 'text-gray-500',
          bgGradient: 'from-gray-50 via-slate-50 to-gray-100',
          borderGradient: 'from-gray-300 via-slate-400 to-gray-500',
          glowColor: 'shadow-gray-200/40',
          progressGradient: 'from-gray-400 to-slate-500',
          badgeGradient: 'from-gray-400 to-slate-500',
          sparkleColor: 'text-gray-400',
          position: 'RUNNER UP'
        };
      case 3:
        return {
          icon: Award,
          iconColor: 'text-orange-600',
          bgGradient: 'from-orange-50 via-amber-50 to-yellow-50',
          borderGradient: 'from-orange-300 via-amber-400 to-orange-500',
          glowColor: 'shadow-orange-200/40',
          progressGradient: 'from-orange-500 to-amber-600',
          badgeGradient: 'from-orange-500 to-amber-600',
          sparkleColor: 'text-orange-500',
          position: 'THIRD PLACE'
        };
      default:
        return {
          icon: Star,
          iconColor: 'text-purple-500',
          bgGradient: 'from-purple-50 to-pink-50',
          borderGradient: 'from-purple-300 to-pink-300',
          glowColor: 'shadow-purple-200/40',
          progressGradient: 'from-purple-400 to-pink-500',
          badgeGradient: 'from-purple-400 to-pink-500',
          sparkleColor: 'text-purple-400',
          position: 'PARTICIPANT'
        };
    }
  };

  const maxXP = Math.max(...top3Users.map(user => user.xp || 0)) || 100;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-8 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Top Performers
          </h1>
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-gray-600 text-lg">Celebrating our learning champions</p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {top3Users.map((user, index) => {
          const rank = user.rank || index + 1;
          const config = getPositionConfig(rank);
          const IconComponent = config.icon;
          const xpPercentage = maxXP > 0 ? (user.xp || 0) / maxXP * 100 : 0;

          // Special positioning for 1st place (larger and elevated)
          const cardVariants = {
            hidden: { opacity: 0, y: 60, scale: 0.9 },
            visible: {
              opacity: 1,
              y: rank === 1 ? -8 : 0,
              scale: rank === 1 ? 1.05 : 1,
              transition: {
                duration: 0.8,
                delay: rank === 1 ? 0.4 : index * 0.2,
                ease: "easeOut"
              }
            }
          };

          const hoverVariants = {
            scale: rank === 1 ? 1.08 : 1.03,
            y: rank === 1 ? -12 : -4,
            transition: { duration: 0.3, ease: "easeOut" }
          };

          return (
            <motion.div
              key={user.id || rank}
              className={`relative group ${rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : 'md:order-3'}`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={hoverVariants}
            >
              {/* Glowing border for 1st place */}
              {rank === 1 && (
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              )}

              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl rounded-3xl p-8 border-2 border-transparent bg-clip-padding`}>
                {/* Gradient Border */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${config.borderGradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>

                {/* Floating Sparkles for 1st place */}
                {rank === 1 && (
                  <>
                    <motion.div
                      className="absolute top-4 right-4"
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
                      <Sparkles className={`w-5 h-5 ${config.sparkleColor}`} />
                    </motion.div>
                    <motion.div
                      className="absolute top-8 left-4"
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
                      <Star className={`w-4 h-4 ${config.sparkleColor}`} />
                    </motion.div>
                  </>
                )}

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Position Badge */}
                  <motion.div
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${config.badgeGradient} text-white rounded-2xl text-sm font-bold mb-6 shadow-lg`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className="w-4 h-4" />
                    {config.position}
                  </motion.div>

                  {/* User Avatar */}
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl ${config.glowColor} group-hover:shadow-2xl transition-shadow duration-500`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {user.isPlaceholder ? '?' : (user.username?.charAt(0)?.toUpperCase() || '?')}
                  </motion.div>

                  {/* User Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {user.isPlaceholder ? 'No User' : (user.username || 'Anonymous')}
                  </h3>

                  {/* College */}
                  {user.college && !user.isPlaceholder && (
                    <p className="text-sm text-gray-600 mb-4 truncate">
                      {user.college}
                    </p>
                  )}

                  {/* XP Display */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Zap className={`w-5 h-5 ${config.iconColor}`} />
                      <span className="text-2xl font-black text-gray-900">
                        {user.isPlaceholder ? '0' : (user.xp || 0)}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">XP</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${config.progressGradient} rounded-full relative`}
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPercentage}%` }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5 + index * 0.2,
                          ease: "easeOut"
                        }}
                      >
                        {/* Progress bar shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: [-20, 100] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Rank Number */}
                  <div className={`w-8 h-8 mx-auto bg-gradient-to-br ${config.badgeGradient} text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg`}>
                    #{rank}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${config.borderGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current User Position Card */}
      {currentUserData ? (
        <motion.div
          className="mt-16 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Your Position
            </h3>
            <p className="text-gray-600">Your current rank on the leaderboard</p>
          </div>

          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/50 p-6 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/95 transition-all duration-500 cursor-pointer overflow-hidden">
            {/* Pink Glow for Current User */}
            <div className="absolute inset-0 bg-pink-100/15 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{
              boxShadow: '0 8px 32px rgba(223, 103, 140, 0.15)'
            }}></div>

            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-50/20 via-purple-50/30 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-pink-200/20 to-purple-200/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>

            <div className="relative z-10 flex items-center gap-4 sm:gap-6 lg:gap-8">
              {/* Enhanced Rank Badge */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg group-hover:shadow-xl transform group-hover:rotate-3 bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200">
                    <span className="font-black text-lg sm:text-xl text-pink-700">#{currentUserData.rank}</span>
                  </div>
                  {/* Rank Glow */}
                  <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-pink-300/30 to-purple-300/30"></div>
                </div>
              </div>

              {/* Enhanced Avatar with Animation */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-2">
                    <span className="text-white font-black text-lg sm:text-xl drop-shadow-lg">
                      {currentUserData.username ? currentUserData.username.split(' ').map(n => n.charAt(0)).join('') : '?'}
                    </span>
                  </div>
                  {/* Avatar Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>

              {/* Enhanced User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-gray-900 font-black text-lg sm:text-xl truncate group-hover:text-purple-800 transition-colors duration-300">
                    {currentUserData.username || 'Anonymous'}
                  </h3>
                  {/* "You" Badge for Current User */}
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    You
                  </div>
                </div>
                {currentUserData.college && (
                  <div className="flex items-center gap-2">
                    <School className="text-gray-400" size={14} />
                    <p className="text-gray-500 text-sm sm:text-base truncate font-medium group-hover:text-gray-600 transition-colors duration-300">
                      {currentUserData.college}
                    </p>
                  </div>
                )}
                {currentUserData.rank <= 10 && (
                  <p className="text-pink-600 text-sm mt-1 font-semibold">So close to the top!</p>
                )}
              </div>

              {/* Ultra Modern Points Display */}
              <div className="flex-shrink-0 text-right">
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl transition-all duration-500 shadow-lg group-hover:shadow-xl border bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 group-hover:from-pink-100 group-hover:via-purple-100 group-hover:to-pink-100 border-pink-200/50 group-hover:border-pink-300/70">
                    <Star className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 text-pink-500 group-hover:text-pink-600" size={20} />
                    <span className="font-black text-lg sm:text-xl transition-colors duration-300 text-gray-900 group-hover:text-purple-700">
                      {currentUserData.xp || 0}
                    </span>
                  </div>
                  {/* Points Glow */}
                  <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-pink-200/30 to-purple-200/30"></div>
                </div>
                <span className="text-gray-400 text-xs font-semibold mt-1 block group-hover:text-gray-500 transition-colors duration-300">XP points</span>
              </div>
            </div>

            {/* Animated Border Effect */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent transition-colors duration-500 group-hover:border-pink-200/50"></div>
          </div>
        </motion.div>
      ) : (
        // Show when no current user data
        <motion.div
          className="mt-16 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Sign In to See Your Rank
            </h3>
            <p className="text-gray-600">Login to track your position on the leaderboard</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ModernTop3View;