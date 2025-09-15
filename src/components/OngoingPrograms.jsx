import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle, Clock, Trophy } from 'lucide-react';

const OngoingPrograms = ({ programs, loading }) => {
  const getProgressColor = (progress) => {
    if (progress < 30) return 'from-red-400 to-red-500';
    if (progress < 70) return 'from-yellow-400 to-yellow-500';
    return 'from-green-400 to-green-500';
  };

  const getProgressBgColor = (progress) => {
    if (progress < 30) return 'bg-red-50';
    if (progress < 70) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const formatLastUpdated = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const LoadingSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[280px] h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <motion.div 
      className="mx-4 mb-6"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white/40 backdrop-blur-lg border border-white/30 rounded-3xl p-12 text-center shadow-xl hover:shadow-2xl transition-all duration-500 group">
        <motion.div 
          className="text-6xl mb-6"
          animate={{ 
            rotateY: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          🚀
        </motion.div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Ready to Start Learning?
        </h3>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Begin your journey and watch your progress come to life here
        </p>
        <motion.button
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
          whileHover={{ y: -2, scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            Start Learning
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.div>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 px-4">
          <div>
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 px-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Ongoing Programs</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Continue your learning journey</p>
          </div>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Ongoing Programs</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">{programs.length} programs in progress</p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              className="min-w-[320px] bg-white/70 backdrop-blur-lg rounded-3xl border border-white/40 p-6 shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-500 cursor-pointer group"
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{program.category}</span>
                    <span>•</span>
                    <span>{program.subcategory}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircle size={16} className="text-primary" />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{Math.round(program.progress)}% Complete</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{formatLastUpdated(program.lastUpdated)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getProgressColor(program.progress)} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${program.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 ${getProgressBgColor(program.progress)} rounded-lg`}>
                    <span className="text-xs font-medium text-gray-700">{program.difficulty}</span>
                  </div>
                  {program.bestScore > 0 && (
                    <div className="flex items-center gap-1">
                      <Trophy size={12} className="text-yellow-500" />
                      <span className="text-xs font-medium text-gray-600">{program.bestScore}%</span>
                    </div>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OngoingPrograms;