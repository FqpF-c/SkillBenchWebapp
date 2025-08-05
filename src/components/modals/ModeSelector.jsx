import React from 'react';
import { X, Dumbbell, FileText, ArrowRight, Clock, Target, Zap } from 'lucide-react';

const ModeSelector = ({ isOpen, onClose, topicName, subcategoryName, type = 'academic' }) => {
  if (!isOpen) return null;

  const handleModeSelection = (mode) => {
    console.log(`${mode} mode selected for ${topicName} - ${subcategoryName}`);
    onClose();
  };

  const modes = [
    {
      id: 'practice',
      title: 'Practice Mode',
      description: 'Practice at your own pace with immediate feedback and explanations.',
      icon: Dumbbell,
      features: ['Unlimited attempts', 'Instant feedback', 'Detailed explanations'],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 'test',
      title: 'Test Mode',
      description: 'Challenge yourself with a timed test and get a final score.',
      icon: FileText,
      features: ['Timed challenges', 'Final scoring', 'Performance analytics'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-400 to-blue-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center pt-4 pb-6">
          <div className="w-12 h-1.5 bg-secondary rounded-full" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-1">Select Mode</h2>
              <p className="text-sm text-gray-600">{topicName}</p>
              {subcategoryName && (
                <p className="text-sm text-gray-500">{subcategoryName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="text-gray-500" size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              
              return (
                <div
                  key={mode.id}
                  className={`card border-2 ${mode.borderColor} hover:border-secondary/50 transition-all duration-300 cursor-pointer group overflow-hidden`}
                  onClick={() => handleModeSelection(mode.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 ${mode.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={mode.color} size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${mode.color} group-hover:text-secondary transition-colors`}>
                          {mode.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {mode.description}
                        </p>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all" size={20} />
                    </div>

                    <div className="space-y-2 mb-4">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 ${mode.color.replace('text-', 'bg-')} rounded-full`} />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-3 bg-gradient-to-r ${mode.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModeSelection(mode.id);
                      }}
                    >
                      {mode.id === 'practice' ? (
                        <>
                          <Target size={16} />
                          Start Practice
                        </>
                      ) : (
                        <>
                          <Clock size={16} />
                          Start Test
                        </>
                      )}
                    </button>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="text-purple-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Pro Tip</h4>
                <p className="text-gray-600 text-xs">Start with Practice mode to build confidence, then challenge yourself with Test mode!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;