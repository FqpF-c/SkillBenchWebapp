import React from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeaderboardHeader = ({ title = "Leaderboard" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="bg-pink-50/40 backdrop-blur-xl border-b border-gray-200/60 sticky top-16 sm:top-20 z-40">
      <div className="px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft 
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200" 
              size={20} 
            />
          </button>

          {/* Title Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Trophy className="text-white" size={18} />
              </div>
              <h1 className="text-gray-900 text-xl md:text-2xl font-bold tracking-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Spacer for centering (matches back button width) */}
          <div className="w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardHeader;