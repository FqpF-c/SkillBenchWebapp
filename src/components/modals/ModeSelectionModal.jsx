import React from 'react';
import { X, BookOpen, Code, Clock, Target } from 'lucide-react';

const ModeSelectionModal = ({ isOpen, onClose, topicData, onModeSelect }) => {
  if (!isOpen) return null;

  const handleModeSelection = (mode) => {
    console.log(`${mode} mode selected for ${topicData.topicName} - ${topicData.subcategoryName}`);
    onModeSelect(mode);
    onClose();
  };

  const modes = [
    {
      id: 'practice',
      title: 'Practice Mode',
      description: 'Learn at your own pace with immediate feedback',
      icon: BookOpen,
      features: ['Unlimited attempts', 'Instant feedback', 'Step-by-step explanations'],
      buttonText: 'Start Practice',
      buttonColor: 'from-[#F871A0] to-[#EC4899]'
    },
    {
      id: 'test',
      title: 'Test Mode', 
      description: 'Challenge yourself with timed questions',
      icon: Clock,
      features: ['', '', 'Timed challenges', 'Final scoring', 'Performance tracking'],
      buttonText: 'Start Test',
      buttonColor: 'from-[#F871A0] to-[#EC4899]'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E0059] to-[#4B007D] opacity-5"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2E0059]/5 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#4B007D]/5 rounded-full"></div>

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold text-[#2E0059] mb-2">Select Quiz Mode</h2>
              <p className="text-lg text-[#6B7280] font-medium">{topicData.topicName}</p>
              {topicData.subcategoryName && (
                <p className="text-sm text-[#9CA3AF]">{topicData.subcategoryName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-[#FFF0F6] rounded-full transition-colors absolute top-4 right-4"
            >
              <X className="text-[#6B7280] hover:text-[#2E0059]" size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modes.map((mode) => {
              const Icon = mode.icon;
              
              return (
                <div
                  key={mode.id}
                  className="relative bg-gradient-to-br from-[#FFF0F6] to-white rounded-3xl shadow-lg hover:shadow-xl border border-[#FAD4E6] transition-all duration-300 group hover:scale-[1.02] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2E0059]/5 to-[#4B007D]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 p-8 h-full flex flex-col">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#2E0059] to-[#4B007D] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Icon className="text-white" size={32} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-[#2E0059] mb-2 group-hover:text-[#4B007D] transition-colors">
                        {mode.title}
                      </h3>
                      <p className="text-[#6B7280] font-medium">
                        {mode.description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-8 flex-1 min-h-[120px]">
                      {mode.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {feature && <div className="w-2 h-2 bg-[#A10089] rounded-full flex-shrink-0 mt-1" />}
                          {feature && <span className="text-sm text-[#6B7280] font-medium leading-relaxed">{feature}</span>}
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-4 bg-gradient-to-r ${mode.buttonColor} text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModeSelection(mode.id);
                      }}
                    >
                      {mode.id === 'practice' ? <Target size={20} /> : <Clock size={20} />}
                      {mode.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;