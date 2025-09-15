import React from 'react';
import { Star, School } from 'lucide-react';

const HighlightedUserCard = ({ user, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full mb-8 animate-pulse">
        <div className="mx-4 md:mx-6 lg:mx-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6">
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex-shrink-0">
                <div className="h-12 w-20 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="mx-4 md:mx-6 lg:mx-8">
        {/* Current User Card - Always visible with special highlighting */}
        <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/50 p-6 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/95 transition-all duration-500 cursor-pointer overflow-hidden">
          {/* Pink Glow Shadow */}
          <div className="absolute inset-0 bg-pink-100/15 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{
            boxShadow: '0 8px 32px rgba(223, 103, 140, 0.15)'
          }}></div>
          
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50/20 via-purple-50/30 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Pink Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-pink-200/30 group-hover:border-pink-300/50 transition-colors duration-500"></div>
          
          <div className="relative z-10 flex items-center gap-4 sm:gap-6 lg:gap-8">
            {/* Enhanced Rank Badge with Pink Theme */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-pink-200 group-hover:to-purple-200 transition-all duration-500 shadow-lg group-hover:shadow-xl transform group-hover:rotate-3">
                  <span className="text-pink-700 font-black text-lg sm:text-xl">#{user.rank}</span>
                </div>
                {/* Pink Rank Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Enhanced Avatar with Pink Accents */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-2">
                  <span className="text-white font-black text-lg sm:text-xl drop-shadow-lg">
                    {user.username ? user.username.split(' ').map(n => n.charAt(0)).join('') : '?'}
                  </span>
                </div>
                {/* Avatar Pink Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/40 to-purple-400/40 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Enhanced User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-gray-900 font-black text-lg sm:text-xl truncate group-hover:text-purple-800 transition-colors duration-300">
                  {user.username || 'Anonymous'}
                </h3>
                {/* "You" Badge */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  You
                </div>
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

            {/* Enhanced Points Display with Pink Theme */}
            <div className="flex-shrink-0 text-right">
              <div className="relative">
                <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 px-4 sm:px-6 py-3 rounded-2xl group-hover:from-pink-100 group-hover:via-purple-100 group-hover:to-pink-100 transition-all duration-500 shadow-lg group-hover:shadow-xl border border-pink-200/50 group-hover:border-pink-300/70">
                  <Star className="text-pink-500 group-hover:text-pink-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" size={20} />
                  <span className="text-gray-900 font-black text-lg sm:text-xl group-hover:text-purple-700 transition-colors duration-300">
                    {user.xp || 0}
                  </span>
                </div>
                {/* Points Pink Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <span className="text-gray-400 text-xs font-semibold mt-1 block group-hover:text-gray-500 transition-colors duration-300">XP points</span>
            </div>
          </div>

          {/* Animated Pink Border Effect */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-pink-200/50 transition-colors duration-500"></div>
          
          {/* Subtle Shine Effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-pink-100/10 to-transparent rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedUserCard;