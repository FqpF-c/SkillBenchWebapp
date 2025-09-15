import React from 'react';
import { motion } from 'framer-motion';
import { Star, School } from 'lucide-react';

const UserRankList = ({ users = [], currentUserId, isLoading = false, onLoadMore }) => {
  if (isLoading) {
    return (
      <div className="w-full">
        {/* Section Header Skeleton */}
        <div className="text-center mb-12 relative animate-pulse">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="w-24 h-1 bg-gray-200 rounded-full" />
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="w-24 h-1 bg-gray-200 rounded-full" />
          </div>
          <div className="h-6 w-64 bg-gray-200 rounded mx-auto" />
        </div>

        {/* Rankings Grid Skeleton */}
        <div className="grid gap-6 w-full">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white/90 rounded-3xl p-6 animate-pulse">
              <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="w-20 h-12 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Ultra Modern Section Header */}
      <div className="text-center mb-12 relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 via-pink-100/30 to-purple-100/30 blur-3xl rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-400 to-purple-300 rounded-full" />
            <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Global Rankings
            </h2>
            <div className="w-24 h-1 bg-gradient-to-l from-transparent via-purple-400 to-purple-300 rounded-full" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Compete with learners worldwide</p>
        </div>
      </div>

      {/* Ultra Modern Rankings Grid */}
      <div className="grid gap-6 w-full">
        {users.map((user, index) => {
          const isCurrentUser = currentUserId && user.id === currentUserId;
          
          return (
            <motion.div 
              key={user.id || index} 
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border p-6 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/95 transition-all duration-500 cursor-pointer overflow-hidden ${
                isCurrentUser 
                  ? 'border-pink-200/50 shadow-pink-100/20' 
                  : 'border-white/60'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
            >
              {/* Conditional Pink Glow for Current User */}
              {isCurrentUser && (
                <div className="absolute inset-0 bg-pink-100/15 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{
                  boxShadow: '0 8px 32px rgba(223, 103, 140, 0.15)'
                }}></div>
              )}
              
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                isCurrentUser 
                  ? 'from-pink-50/20 via-purple-50/30 to-pink-50/20'
                  : 'from-purple-50/0 via-purple-50/20 to-pink-50/0'
              }`}></div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-pink-200/20 to-purple-200/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
              
              <div className="relative z-10 flex items-center gap-4 sm:gap-6 lg:gap-8">
                {/* Enhanced Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg group-hover:shadow-xl transform group-hover:rotate-3 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 group-hover:from-pink-200 group-hover:to-purple-200'
                        : 'bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200'
                    }`}>
                      <span className={`font-black text-lg sm:text-xl ${
                        isCurrentUser ? 'text-pink-700' : 'text-purple-700'
                      }`}>#{user.rank}</span>
                    </div>
                    {/* Rank Glow */}
                    <div className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-br from-pink-300/30 to-purple-300/30'
                        : 'bg-gradient-to-br from-purple-300/30 to-pink-300/30'
                    }`}></div>
                  </div>
                </div>

                {/* Enhanced Avatar with Animation */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-2">
                      <span className="text-white font-black text-lg sm:text-xl drop-shadow-lg">
                        {user.username ? user.username.split(' ').map(n => n.charAt(0)).join('') : '?'}
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
                      {user.username || 'Anonymous'}
                    </h3>
                    {/* "You" Badge for Current User */}
                    {isCurrentUser && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        You
                      </div>
                    )}
                  </div>
                  {user.college && (
                    <div className="flex items-center gap-2">
                      <School className="text-gray-400" size={14} />
                      <p className="text-gray-500 text-sm sm:text-base truncate font-medium group-hover:text-gray-600 transition-colors duration-300">
                        {user.college}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ultra Modern Points Display */}
                <div className="flex-shrink-0 text-right">
                  <div className="relative">
                    <div className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl transition-all duration-500 shadow-lg group-hover:shadow-xl border ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 group-hover:from-pink-100 group-hover:via-purple-100 group-hover:to-pink-100 border-pink-200/50 group-hover:border-pink-300/70'
                        : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 group-hover:from-yellow-100 group-hover:via-amber-100 group-hover:to-orange-100 border-yellow-200/50 group-hover:border-yellow-300/70'
                    }`}>
                      <Star className={`group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 ${
                        isCurrentUser 
                          ? 'text-pink-500 group-hover:text-pink-600'
                          : 'text-yellow-500 group-hover:text-yellow-600'
                      }`} size={20} />
                      <span className={`font-black text-lg sm:text-xl transition-colors duration-300 ${
                        isCurrentUser 
                          ? 'text-gray-900 group-hover:text-purple-700'
                          : 'text-gray-900 group-hover:text-amber-700'
                      }`}>
                        {user.xp || 0}
                      </span>
                    </div>
                    {/* Points Glow */}
                    <div className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-pink-200/30 to-purple-200/30'
                        : 'bg-gradient-to-r from-yellow-200/30 to-orange-200/30'
                    }`}></div>
                  </div>
                  <span className="text-gray-400 text-xs font-semibold mt-1 block group-hover:text-gray-500 transition-colors duration-300">XP points</span>
                </div>
              </div>

              {/* Animated Border Effect */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent transition-colors duration-500 ${
                isCurrentUser 
                  ? 'group-hover:border-pink-200/50'
                  : 'group-hover:border-purple-200/50'
              }`}></div>
            </motion.div>
          );
        })}
      </div>

      {/* Ultra Modern Load More Section */}
      {onLoadMore && users.length > 0 && (
        <div className="text-center mt-12">
          <div className="relative inline-block">
            <button 
              onClick={onLoadMore}
              className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-black px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 border border-white/20 backdrop-blur-sm overflow-hidden group"
            >
              {/* Button Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="relative z-10 text-lg">Load More Rankings</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="text-purple-400" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No rankings yet</h3>
          <p className="text-gray-500 text-lg">Be the first to earn XP and claim your spot!</p>
        </div>
      )}
    </div>
  );
};

export default UserRankList;