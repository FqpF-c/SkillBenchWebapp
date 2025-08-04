import React from 'react';
import { Trophy, ArrowLeft, Target, Users } from 'lucide-react';

const LeaderboardHeader = () => {
  const handleBack = () => {
    console.log('Navigate back');
  };

  return (
    <div className="relative gradient-purple rounded-b-[60px] px-6 pt-16 pb-12 mb-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/30 rounded-full animate-pulse"
              style={{
                width: `${(i + 1) * 50}px`,
                height: `${(i + 1) * 50}px`,
                top: '20%',
                right: '20%',
                transform: 'translate(50%, -50%)',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Header Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Trophy className="text-yellow-300" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Leaderboard</h1>
              <p className="text-white/80 text-sm">Compete with your peers</p>
            </div>
          </div>

          <div className="w-12" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/20 rounded-xl flex items-center justify-center">
                <Users className="text-blue-300" size={20} />
              </div>
              <div>
                <p className="text-white text-lg font-bold">29</p>
                <p className="text-white/70 text-xs">Total Participants</p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
                <Target className="text-green-300" size={20} />
              </div>
              <div>
                <p className="text-white text-lg font-bold">2</p>
                <p className="text-white/70 text-xs">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardHeader;