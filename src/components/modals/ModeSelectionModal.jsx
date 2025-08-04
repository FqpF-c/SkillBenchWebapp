import React from 'react';
import { X, Play, Target, BookOpen, Clock, Star, Zap } from 'lucide-react';

const ModeSelectionModal = ({ isOpen, onClose, topicData, onModeSelect }) => {
  if (!isOpen) return null;

  const handleModeSelect = (mode) => {
    onModeSelect(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{topicData.topicName}</h2>
                <p className="text-sm text-gray-500">{topicData.subcategoryName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Learning Mode</h3>
          
          {/* Practice Mode */}
          <div
            onClick={() => handleModeSelect('practice')}
            className="mb-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl cursor-pointer hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                  Practice Mode
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Learn at your own pace with instant feedback and detailed explanations
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>No time limit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    <span>Detailed hints</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={12} />
                    <span>Instant feedback</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode */}
          <div
            onClick={() => handleModeSelect('test')}
            className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  Test Mode
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Challenge yourself with timed questions and compete for high scores
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Timed challenges</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} />
                    <span>Score tracking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={12} />
                    <span>Performance metrics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Your Progress</h5>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs text-gray-500">Best Score</p>
                <p className="text-lg font-bold text-gray-900">--</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Attempts</p>
                <p className="text-lg font-bold text-gray-900">--</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Accuracy</p>
                <p className="text-lg font-bold text-gray-900">--%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;