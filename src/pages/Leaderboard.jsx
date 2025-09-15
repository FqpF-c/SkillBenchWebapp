import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LeaderboardService from '../services/LeaderboardService';
import ModernTop3View from '../components/leaderboard/ModernTop3View';
import UserRankList from '../components/leaderboard/UserRankList';

const Leaderboard = () => {
  const { currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 [MODERN LEADERBOARD] Fetching data from Firebase...');
      const data = await LeaderboardService.fetchLeaderboardData('all_time', 50);
      
      setLeaderboardData(data);
      console.log('✅ [MODERN LEADERBOARD] Successfully loaded data:', data);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data. Please try again.');
      
      // Fallback to mock data on error
      const fallbackData = LeaderboardService.getMockData();
      setLeaderboardData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Get top 3 users and remaining users
  const topThreeUsers = leaderboardData?.users?.slice(0, 3) || [];
  const remainingUsers = leaderboardData?.users?.slice(3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-16 sm:pt-20">
      <div className="relative w-full overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>

        {/* Main Content */}
        <motion.div
          className="relative z-10 px-4 md:px-6 lg:px-8 pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Error State */}
          {error && !leaderboardData && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-500 text-3xl">⚠️</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">Something went wrong</h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">{error}</p>
              <motion.button
                onClick={fetchLeaderboardData}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {/* Empty State */}
          {leaderboardData && leaderboardData.users.length === 0 && !error && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-6xl">🏆</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-700 mb-4">No Champions Yet</h3>
              <p className="text-gray-500 text-lg max-w-lg mx-auto mb-8">
                Be the first to earn XP and claim your spot among the top performers!
              </p>
              <motion.button
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
              </motion.button>
            </motion.div>
          )}

          {/* Modern Top 3 View */}
          {(leaderboardData?.users?.length > 0 || isLoading) && (
            <ModernTop3View
              topUsers={topThreeUsers}
              isLoading={isLoading}
            />
          )}

          {/* Remaining Users List (Rank 4+) */}
          {remainingUsers.length > 0 && !isLoading && (
            <motion.div
              className="mt-16 max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <UserRankList 
                users={remainingUsers}
                currentUserId={currentUser?.uid}
                isLoading={false}
              />
            </motion.div>
          )}

          {/* Current User Achievement Banner (if not in top 3) */}
          {currentUser && leaderboardData && !isLoading && (
            (() => {
              const currentUserData = LeaderboardService.getCurrentUserRank(leaderboardData.users, currentUser.uid);
              const isInTop3 = currentUserData && currentUserData.rank <= 3;
              
              if (currentUserData && !isInTop3) {
                return (
                  <motion.div 
                    className="mt-16 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                  >
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/30 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {currentUserData.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900">Your Current Rank</span>
                            <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold">
                              #{currentUserData.rank}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>{currentUserData.xp} XP</span>
                            {currentUserData.rank <= 10 && (
                              <span className="text-sm">• So close to the top!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
              return null;
            })()
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;